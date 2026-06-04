import base64
import json
import unittest
from unittest.mock import patch
from uuid import uuid4

from fastapi import HTTPException, status
from fastapi.routing import APIRoute

from apps.api.src.api.router import api_router
from apps.api.src.api.routes.auth import (
    LoginRequest,
    RegisterRequest,
    hash_password,
    login,
    register,
    router,
    verify_password,
)
from cookiful_db.models import User, UserPreference, UserProfile, UserStatus


class FakeSettings:
    jwt_access_secret = "test-access-secret"
    jwt_refresh_secret = "test-refresh-secret"


class FakeScalarResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class FakeSession:
    def __init__(self, scalar_value=None) -> None:
        self.scalar_value = scalar_value
        self.executed_statements = []
        self.added_objects = []
        self.committed = False
        self.rolled_back = False

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback) -> bool:
        return False

    def execute(self, statement):
        self.executed_statements.append(statement)
        return FakeScalarResult(self.scalar_value)

    def add_all(self, objects):
        self.added_objects.extend(objects)

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True


def decode_jwt_payload(token: str) -> dict:
    _, payload, _ = token.split(".")
    padding = "=" * (-len(payload) % 4)
    return json.loads(base64.urlsafe_b64decode(payload + padding))


def make_user(*, email: str = "chef@example.test", username: str = "chef") -> User:
    user_id = uuid4()
    user = User(
        id=user_id,
        email=email,
        username=username,
        password_hash=hash_password("correct-password"),
        status=UserStatus.ACTIVE,
    )
    user.profile = UserProfile(user_id=user_id, display_name="Chef Example")
    return user


class AuthRouteMetadataTests(unittest.TestCase):
    def test_register_route_uses_created_status_code(self) -> None:
        register_route = next(
            route
            for route in router.routes
            if isinstance(route, APIRoute) and route.path == "/register"
        )

        self.assertEqual(register_route.status_code, status.HTTP_201_CREATED)

    def test_api_router_includes_auth_routes(self) -> None:
        auth_paths = {
            route.path
            for route in api_router.routes
            if isinstance(route, APIRoute) and "auth" in route.tags
        }

        self.assertIn("/auth/register", auth_paths)
        self.assertIn("/auth/login", auth_paths)


class RegisterRouteTests(unittest.TestCase):
    def test_register_creates_user_profile_preferences_and_returns_tokens(self) -> None:
        fake_session = FakeSession()

        with (
            patch("apps.api.src.api.routes.auth.SessionLocal", return_value=fake_session),
            patch("apps.api.src.api.routes.auth.get_settings", return_value=FakeSettings()),
        ):
            response = register(
                RegisterRequest(
                    email="CHEF@Example.Test",
                    username="  chef-table  ",
                    password="correct-password",
                    display_name="  Chef Table  ",
                )
            )

        self.assertTrue(fake_session.committed)
        self.assertEqual(len(fake_session.executed_statements), 1)
        self.assertEqual(len(fake_session.added_objects), 3)

        created_user = next(obj for obj in fake_session.added_objects if isinstance(obj, User))
        created_profile = next(obj for obj in fake_session.added_objects if isinstance(obj, UserProfile))
        created_preferences = next(obj for obj in fake_session.added_objects if isinstance(obj, UserPreference))

        self.assertEqual(created_user.email, "chef@example.test")
        self.assertEqual(created_user.username, "chef-table")
        self.assertEqual(created_user.status, UserStatus.ACTIVE)
        self.assertNotEqual(created_user.password_hash, "correct-password")
        self.assertTrue(verify_password("correct-password", created_user.password_hash))
        self.assertEqual(created_profile.user_id, created_user.id)
        self.assertEqual(created_profile.display_name, "Chef Table")
        self.assertEqual(created_preferences.user_id, created_user.id)
        self.assertEqual(created_preferences.dietary_preferences, [])
        self.assertEqual(created_preferences.allergen_flags, [])
        self.assertEqual(created_preferences.disliked_ingredients, [])
        self.assertEqual(created_preferences.cuisine_preferences, [])

        self.assertEqual(response.token_type, "bearer")
        self.assertEqual(response.user.id, created_user.id)
        self.assertEqual(response.user.email, "chef@example.test")
        self.assertEqual(response.user.username, "chef-table")
        self.assertEqual(response.user.display_name, "Chef Table")

        access_payload = decode_jwt_payload(response.access_token)
        refresh_payload = decode_jwt_payload(response.refresh_token)
        self.assertEqual(access_payload["sub"], str(created_user.id))
        self.assertEqual(access_payload["email"], "chef@example.test")
        self.assertEqual(access_payload["username"], "chef-table")
        self.assertEqual(access_payload["token_type"], "access")
        self.assertEqual(refresh_payload["token_type"], "refresh")
        self.assertGreater(refresh_payload["exp"], access_payload["exp"])

    def test_register_returns_409_for_duplicate_email_or_username(self) -> None:
        fake_session = FakeSession(scalar_value=make_user())

        with (
            patch("apps.api.src.api.routes.auth.SessionLocal", return_value=fake_session),
            patch("apps.api.src.api.routes.auth.get_settings", return_value=FakeSettings()),
        ):
            with self.assertRaises(HTTPException) as raised:
                register(
                    RegisterRequest(
                        email="chef@example.test",
                        username="chef",
                        password="correct-password",
                    )
                )

        self.assertEqual(raised.exception.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(raised.exception.detail, "Registration is unavailable for those credentials.")
        self.assertFalse(fake_session.committed)
        self.assertEqual(fake_session.added_objects, [])


class LoginRouteTests(unittest.TestCase):
    def test_login_returns_tokens_for_valid_credentials(self) -> None:
        user = make_user(email="chef@example.test", username="chef")
        fake_session = FakeSession(scalar_value=user)

        with (
            patch("apps.api.src.api.routes.auth.SessionLocal", return_value=fake_session),
            patch("apps.api.src.api.routes.auth.get_settings", return_value=FakeSettings()),
        ):
            response = login(
                LoginRequest(
                    email="CHEF@Example.Test",
                    password="correct-password",
                )
            )

        self.assertEqual(len(fake_session.executed_statements), 1)
        self.assertEqual(response.token_type, "bearer")
        self.assertEqual(response.user.id, user.id)
        self.assertEqual(response.user.email, "chef@example.test")
        self.assertEqual(response.user.username, "chef")
        self.assertEqual(response.user.display_name, "Chef Example")

        access_payload = decode_jwt_payload(response.access_token)
        refresh_payload = decode_jwt_payload(response.refresh_token)
        self.assertEqual(access_payload["token_type"], "access")
        self.assertEqual(refresh_payload["token_type"], "refresh")
        self.assertEqual(access_payload["sub"], str(user.id))
        self.assertGreater(refresh_payload["exp"], access_payload["exp"])

    def test_login_returns_401_for_invalid_credentials(self) -> None:
        fake_session = FakeSession(scalar_value=make_user())

        with (
            patch("apps.api.src.api.routes.auth.SessionLocal", return_value=fake_session),
            patch("apps.api.src.api.routes.auth.get_settings", return_value=FakeSettings()),
        ):
            with self.assertRaises(HTTPException) as raised:
                login(
                    LoginRequest(
                        email="chef@example.test",
                        password="wrong-password",
                    )
                )

        self.assertEqual(raised.exception.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(raised.exception.detail, "Invalid credentials.")


if __name__ == "__main__":
    unittest.main()
