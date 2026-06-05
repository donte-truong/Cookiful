from __future__ import annotations

from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import Select, func, select
from sqlalchemy.orm import selectinload

from apps.api.src.api.routes.auth import decode_access_token
from apps.api.src.api.routes.recipes import CuratedRecipeResponse, serialize_curated_recipe
from cookiful_db import SessionLocal
from cookiful_db.models import (
    Recipe,
    RecipeIngredient,
    RecipeStatus,
    RecipeVersion,
    RecipeVisibility,
    User,
    UserProfile,
    UserRecipeSocialAction,
)


router = APIRouter()

RecipeSocialActionType = Literal["like", "save", "repost"]
SOCIAL_ACTION_TYPES = ("like", "save", "repost")


class RecipeSocialActionRequest(BaseModel):
    recipe_id: UUID
    action_type: RecipeSocialActionType
    active: bool


class RecipeSocialActionState(BaseModel):
    recipe_id: UUID
    liked: bool
    saved: bool
    reposted: bool


class MeUserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    display_name: str | None


class MeProfileGroceryItem(BaseModel):
    id: str
    text: str
    recipe_id: UUID
    recipe_title: str


class MeProfileResponse(BaseModel):
    user: MeUserResponse
    liked_recipes: list[CuratedRecipeResponse]
    saved_recipes: list[CuratedRecipeResponse]
    reposted_recipes: list[CuratedRecipeResponse]
    grocery_items: list[MeProfileGroceryItem]


class SocialHighlightResponse(BaseModel):
    name: str
    role: str
    title: str
    quote: str
    stat: str
    image_url: str | None
    image_alt: str
    avatar_url: str | None
    avatar_letter: str


class SocialHighlightsResponse(BaseModel):
    stories: list[SocialHighlightResponse]


def unauthorized_error() -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication is required.")


def get_current_user_id(authorization: Annotated[str | None, Header()] = None) -> UUID:
    if authorization is None:
        raise unauthorized_error()

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise unauthorized_error()

    payload = decode_access_token(token)
    if payload is None:
        raise unauthorized_error()

    subject = payload.get("sub")
    if not isinstance(subject, str):
        raise unauthorized_error()

    try:
        return UUID(subject)
    except ValueError as exc:
        raise unauthorized_error() from exc


def build_public_recipe_query(recipe_id: UUID) -> Select[tuple[Recipe, RecipeVersion | None]]:
    return (
        select(Recipe, RecipeVersion)
        .outerjoin(RecipeVersion, RecipeVersion.id == Recipe.current_version_id)
        .where(
            Recipe.id == recipe_id,
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.is_not(None),
        )
    )


def build_social_action_lookup_query(
    user_id: UUID,
    recipe_id: UUID,
    action_type: RecipeSocialActionType,
) -> Select[tuple[UserRecipeSocialAction]]:
    return (
        select(UserRecipeSocialAction)
        .where(
            UserRecipeSocialAction.user_id == user_id,
            UserRecipeSocialAction.recipe_id == recipe_id,
            UserRecipeSocialAction.action_type == action_type,
        )
        .limit(1)
    )


def build_recipe_action_types_query(user_id: UUID, recipe_id: UUID) -> Select[tuple[str]]:
    return select(UserRecipeSocialAction.action_type).where(
        UserRecipeSocialAction.user_id == user_id,
        UserRecipeSocialAction.recipe_id == recipe_id,
    )


def build_me_user_query(user_id: UUID) -> Select[tuple[User]]:
    return select(User).options(selectinload(User.profile)).where(User.id == user_id).limit(1)


def build_profile_social_recipes_query(user_id: UUID) -> Select[tuple[UserRecipeSocialAction, Recipe, RecipeVersion | None]]:
    return (
        select(UserRecipeSocialAction, Recipe, RecipeVersion)
        .join(Recipe, Recipe.id == UserRecipeSocialAction.recipe_id)
        .outerjoin(RecipeVersion, RecipeVersion.id == Recipe.current_version_id)
        .where(
            UserRecipeSocialAction.user_id == user_id,
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.is_not(None),
        )
        .order_by(UserRecipeSocialAction.created_at.desc())
    )


def build_profile_grocery_items_query(user_id: UUID) -> Select[tuple[Recipe, RecipeIngredient]]:
    return (
        select(Recipe, RecipeIngredient)
        .join(UserRecipeSocialAction, UserRecipeSocialAction.recipe_id == Recipe.id)
        .join(RecipeVersion, RecipeVersion.id == Recipe.current_version_id)
        .join(RecipeIngredient, RecipeIngredient.recipe_version_id == RecipeVersion.id)
        .where(
            UserRecipeSocialAction.user_id == user_id,
            UserRecipeSocialAction.action_type == "save",
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.is_not(None),
        )
        .order_by(Recipe.title.asc(), RecipeIngredient.sort_order.asc())
    )


def build_social_highlights_query(
    limit: int,
) -> Select[tuple[UserRecipeSocialAction, User, UserProfile | None, Recipe, RecipeVersion | None]]:
    return (
        select(UserRecipeSocialAction, User, UserProfile, Recipe, RecipeVersion)
        .join(User, User.id == UserRecipeSocialAction.user_id)
        .outerjoin(UserProfile, UserProfile.user_id == User.id)
        .join(Recipe, Recipe.id == UserRecipeSocialAction.recipe_id)
        .outerjoin(RecipeVersion, RecipeVersion.id == Recipe.current_version_id)
        .where(
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.is_not(None),
        )
        .order_by(UserRecipeSocialAction.created_at.desc())
        .limit(limit)
    )


def build_action_state(recipe_id: UUID, action_types: list[str]) -> RecipeSocialActionState:
    action_type_set = set(action_types)
    return RecipeSocialActionState(
        recipe_id=recipe_id,
        liked="like" in action_type_set,
        saved="save" in action_type_set,
        reposted="repost" in action_type_set,
    )


def serialize_me_user(user: User) -> MeUserResponse:
    display_name = user.profile.display_name if user.profile is not None else None
    return MeUserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        display_name=display_name,
    )


def build_profile_response(
    user: User,
    rows: list[tuple[UserRecipeSocialAction, Recipe, RecipeVersion | None]],
    grocery_rows: list[tuple[Recipe, RecipeIngredient]],
) -> MeProfileResponse:
    recipe_groups: dict[str, list[CuratedRecipeResponse]] = {
        "like": [],
        "save": [],
        "repost": [],
    }
    seen_recipe_ids: dict[str, set[UUID]] = {
        "like": set(),
        "save": set(),
        "repost": set(),
    }

    for social_action, recipe, version in rows:
        if social_action.action_type not in recipe_groups:
            continue

        if recipe.id in seen_recipe_ids[social_action.action_type]:
            continue

        recipe_groups[social_action.action_type].append(serialize_curated_recipe(recipe, version))
        seen_recipe_ids[social_action.action_type].add(recipe.id)

    return MeProfileResponse(
        user=serialize_me_user(user),
        liked_recipes=recipe_groups["like"],
        saved_recipes=recipe_groups["save"],
        reposted_recipes=recipe_groups["repost"],
        grocery_items=[
            MeProfileGroceryItem(
                id=f"{recipe.id}:{ingredient.id}",
                text=ingredient.ingredient_text,
                recipe_id=recipe.id,
                recipe_title=recipe.title,
            )
            for recipe, ingredient in grocery_rows
        ],
    )


def build_social_action_stat(action_type: str, count: int) -> str:
    action_labels = {
        "like": "liked",
        "save": "saved",
        "repost": "reposted",
    }
    label = action_labels.get(action_type, "shared")
    return f"{count} {label} this"


def build_social_highlight_quote(action_type: str, recipe: Recipe) -> str:
    action_copy = {
        "like": "This one earned a place at the top of my repeat list.",
        "save": "Saving this for the next quiet night in the kitchen.",
        "repost": "Passing this along because the table needs it.",
    }
    copy = action_copy.get(action_type, "A Cookiful recipe worth sharing.")
    return f'"{copy}"'


def serialize_social_highlight(
    social_action: UserRecipeSocialAction,
    user: User,
    profile: UserProfile | None,
    recipe: Recipe,
    version: RecipeVersion | None,
    stat_count: int,
) -> SocialHighlightResponse:
    display_name = profile.display_name if profile is not None and profile.display_name else user.username
    role = profile.skill_level if profile is not None and profile.skill_level else "Cookiful cook"
    curated_recipe = serialize_curated_recipe(recipe, version)
    return SocialHighlightResponse(
        name=display_name,
        role=role.title(),
        title=recipe.title,
        quote=build_social_highlight_quote(social_action.action_type, recipe),
        stat=build_social_action_stat(social_action.action_type, stat_count),
        image_url=curated_recipe.image_url,
        image_alt=curated_recipe.image_alt,
        avatar_url=profile.avatar_url if profile is not None else None,
        avatar_letter=display_name[:1].upper() or "C",
    )


@router.put("/recipe-actions", response_model=RecipeSocialActionState)
def update_recipe_social_action(
    payload: RecipeSocialActionRequest,
    user_id: Annotated[UUID, Depends(get_current_user_id)],
) -> RecipeSocialActionState:
    with SessionLocal() as session:
        recipe_row = session.execute(build_public_recipe_query(payload.recipe_id)).one_or_none()
        if recipe_row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found.")

        existing_action = session.execute(
            build_social_action_lookup_query(user_id, payload.recipe_id, payload.action_type)
        ).scalar_one_or_none()

        if payload.active and existing_action is None:
            session.add(
                UserRecipeSocialAction(
                    user_id=user_id,
                    recipe_id=payload.recipe_id,
                    action_type=payload.action_type,
                )
            )
        elif not payload.active and existing_action is not None:
            session.delete(existing_action)

        session.commit()
        action_types = session.execute(build_recipe_action_types_query(user_id, payload.recipe_id)).scalars().all()

    return build_action_state(payload.recipe_id, list(action_types))


@router.get("/profile", response_model=MeProfileResponse)
def get_me_profile(user_id: Annotated[UUID, Depends(get_current_user_id)]) -> MeProfileResponse:
    with SessionLocal() as session:
        user = session.execute(build_me_user_query(user_id)).scalar_one_or_none()
        if user is None:
            raise unauthorized_error()

        rows = session.execute(build_profile_social_recipes_query(user_id)).all()
        grocery_rows = session.execute(build_profile_grocery_items_query(user_id)).all()

    return build_profile_response(user, list(rows), list(grocery_rows))


@router.get("/social-highlights", response_model=SocialHighlightsResponse)
def get_social_highlights() -> SocialHighlightsResponse:
    with SessionLocal() as session:
        rows = session.execute(build_social_highlights_query(limit=3)).all()
        stories = []
        for social_action, user, profile, recipe, version in rows:
            stat_count = session.execute(
                select(func.count(UserRecipeSocialAction.id)).where(
                    UserRecipeSocialAction.recipe_id == recipe.id,
                    UserRecipeSocialAction.action_type == social_action.action_type,
                )
            ).scalar_one()
            stories.append(
                serialize_social_highlight(
                    social_action=social_action,
                    user=user,
                    profile=profile,
                    recipe=recipe,
                    version=version,
                    stat_count=stat_count,
                )
            )

    return SocialHighlightsResponse(stories=stories)
