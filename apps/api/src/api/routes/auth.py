from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import json
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy import Select, or_, select
from sqlalchemy.exc import IntegrityError

from apps.api.src.core.config import get_settings
from cookiful_db import SessionLocal
from cookiful_db.models import User, UserPreference, UserProfile, UserStatus


router = APIRouter()

PASSWORD_HASH_SCHEME = "pbkdf2_sha256"
PASSWORD_HASH_ITERATIONS = 260_000
PASSWORD_SALT_BYTES = 16
ACCESS_TOKEN_TTL = timedelta(minutes=15)
REFRESH_TOKEN_TTL = timedelta(days=30)


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    display_name: str | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = normalize_email(value)
        if not normalized:
            raise ValueError("Email is required.")
        return normalized

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        normalized = normalize_username(value)
        if not normalized:
            raise ValueError("Username is required.")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return value

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = normalize_email(value)
        if not normalized:
            raise ValueError("Email is required.")
        return normalized


class AuthUserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    display_name: str | None


class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


def normalize_email(value: str) -> str:
    return value.strip().lower()


def normalize_username(value: str) -> str:
    return value.strip()


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()
    return normalized or None


def b64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(PASSWORD_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_HASH_ITERATIONS,
    )
    return "$".join(
        (
            PASSWORD_HASH_SCHEME,
            str(PASSWORD_HASH_ITERATIONS),
            b64url_encode(salt),
            b64url_encode(digest),
        )
    )


def verify_password(password: str, password_hash: str) -> bool:
    try:
        scheme, iterations_text, salt_text, digest_text = password_hash.split("$", 3)
        iterations = int(iterations_text)
        salt = b64url_decode(salt_text)
        expected_digest = b64url_decode(digest_text)
    except (ValueError, binascii.Error):
        return False

    if scheme != PASSWORD_HASH_SCHEME or iterations <= 0:
        return False

    actual_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
    )
    return hmac.compare_digest(actual_digest, expected_digest)


def create_jwt(claims: dict[str, Any], secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    encoded_header = b64url_encode(json.dumps(header, separators=(",", ":"), sort_keys=True).encode("utf-8"))
    encoded_payload = b64url_encode(json.dumps(claims, separators=(",", ":"), sort_keys=True).encode("utf-8"))
    signing_input = f"{encoded_header}.{encoded_payload}".encode("ascii")
    signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{encoded_header}.{encoded_payload}.{b64url_encode(signature)}"


def decode_jwt(token: str, secret: str) -> dict[str, Any] | None:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".", 2)
        signing_input = f"{encoded_header}.{encoded_payload}".encode("ascii")
        expected_signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
        signature = b64url_decode(encoded_signature)
        payload = json.loads(b64url_decode(encoded_payload))
    except (ValueError, binascii.Error, json.JSONDecodeError, UnicodeDecodeError):
        return None

    if not hmac.compare_digest(signature, expected_signature):
        return None

    if not isinstance(payload, dict):
        return None

    exp = payload.get("exp")
    if not isinstance(exp, int) or exp < int(datetime.now(UTC).timestamp()):
        return None

    return payload


def decode_access_token(token: str) -> dict[str, Any] | None:
    payload = decode_jwt(token, get_settings().jwt_access_secret)
    if payload is None or payload.get("token_type") != "access":
        return None

    return payload


def build_auth_tokens(user: User, now: datetime | None = None) -> tuple[str, str]:
    settings = get_settings()
    issued_at = now or datetime.now(UTC)
    base_claims: dict[str, Any] = {
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
    }

    access_claims = {
        **base_claims,
        "token_type": "access",
        "exp": int((issued_at + ACCESS_TOKEN_TTL).timestamp()),
    }
    refresh_claims = {
        **base_claims,
        "token_type": "refresh",
        "exp": int((issued_at + REFRESH_TOKEN_TTL).timestamp()),
    }

    return (
        create_jwt(access_claims, settings.jwt_access_secret),
        create_jwt(refresh_claims, settings.jwt_refresh_secret),
    )


def build_registration_lookup_query(email: str, username: str) -> Select[tuple[User]]:
    return select(User).where(or_(User.email == email, User.username == username)).limit(1)


def build_login_lookup_query(email: str) -> Select[tuple[User]]:
    return select(User).where(User.email == email).limit(1)


def build_auth_response(user: User, display_name: str | None) -> AuthTokenResponse:
    access_token, refresh_token = build_auth_tokens(user)
    return AuthTokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=AuthUserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            display_name=display_name,
        ),
    )


def duplicate_registration_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Registration is unavailable for those credentials.",
    )


def invalid_credentials_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials.",
    )


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest) -> AuthTokenResponse:
    user_id = uuid4()
    user = User(
        id=user_id,
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
        status=UserStatus.ACTIVE,
    )
    profile = UserProfile(user_id=user_id, display_name=payload.display_name)
    preferences = UserPreference(
        user_id=user_id,
        dietary_preferences=[],
        allergen_flags=[],
        disliked_ingredients=[],
        cuisine_preferences=[],
    )
    user.profile = profile
    user.preferences = preferences

    with SessionLocal() as session:
        existing_user = session.execute(
            build_registration_lookup_query(payload.email, payload.username)
        ).scalar_one_or_none()
        if existing_user is not None:
            raise duplicate_registration_error()

        try:
            session.add_all([user, profile, preferences])
            session.commit()
        except IntegrityError as exc:
            session.rollback()
            raise duplicate_registration_error() from exc

    return build_auth_response(user, payload.display_name)


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: LoginRequest) -> AuthTokenResponse:
    with SessionLocal() as session:
        user = session.execute(build_login_lookup_query(payload.email)).scalar_one_or_none()
        if user is None or not verify_password(payload.password, user.password_hash):
            raise invalid_credentials_error()

        display_name = user.profile.display_name if user.profile is not None else None
        return build_auth_response(user, display_name)
