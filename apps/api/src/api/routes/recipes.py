from __future__ import annotations

from functools import lru_cache
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import re
from textwrap import shorten
from typing import Annotated, Callable
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import Select, func, literal, not_, or_, select

from apps.api.src.api.routes.auth import decode_access_token
from cookiful_db import SessionLocal
from cookiful_db.paths import REPO_ROOT
from cookiful_db.models import Recipe, RecipeIngredient, RecipeStatus, RecipeVersion, RecipeVisibility, UserPantryItem


router = APIRouter()

RECIPE_BOX_IMAGE_DIR = REPO_ROOT / "packages" / "utils" / "recipe-box" / "data" / "img"
RECIPE_BOX_UTILS_PATH = REPO_ROOT / "packages" / "utils" / "recipe-box" / "src" / "utils.py"
RECIPE_BOX_IMAGE_URL_PREFIX = "/api/recipes/images/recipe-box"
RECIPE_BOX_SOURCE_KEYS = frozenset({"ar", "epi", "fn"})
RECIPE_BOX_IMAGE_FILENAME_PATTERN = re.compile(r"^[A-Za-z0-9_-]+\.jpg$")
QUICK_DINNER_TITLE_KEYWORDS = (
    "beans",
    "beef",
    "chicken",
    "dinner",
    "fish",
    "noodle",
    "pasta",
    "pork",
    "rice",
    "salad",
    "shrimp",
    "skillet",
    "soup",
    "taco",
)
QUICK_DINNER_EXCLUDED_TITLE_KEYWORDS = (
    "brownie",
    "cake",
    "cookie",
    "cupcake",
    "dessert",
    "frosting",
    "pie",
    "pudding",
    "slow cooker",
    "sugar",
)


class CuratedRecipeResponse(BaseModel):
    id: UUID
    title: str
    description: str
    duration_minutes: int
    tag: str
    image_url: str | None
    image_alt: str
    source_name: str | None
    source_url: str | None


class CuratedRecipesResponse(BaseModel):
    recipes: list[CuratedRecipeResponse]


class RecipeDetailResponse(CuratedRecipeResponse):
    ingredients: list[str]
    instructions: list[str]


@lru_cache(maxsize=1)
def load_recipe_box_url_to_filename() -> Callable[[str], str]:
    spec = spec_from_file_location("_cookiful_recipe_box_utils", RECIPE_BOX_UTILS_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load Recipe Box utils from {RECIPE_BOX_UTILS_PATH}.")

    module = module_from_spec(spec)
    spec.loader.exec_module(module)

    url_to_filename = getattr(module, "URL_to_filename", None)
    if not callable(url_to_filename):
        raise RuntimeError("Recipe Box utils.py does not expose URL_to_filename.")

    return url_to_filename


def parse_recipe_box_source_url(source_url: str | None) -> tuple[str, str] | None:
    if source_url is None or not source_url.startswith("recipe-box://"):
        return None

    source_and_record = source_url.removeprefix("recipe-box://")
    source_key, separator, record_id = source_and_record.partition("/")
    if not separator or source_key not in RECIPE_BOX_SOURCE_KEYS or not record_id:
        return None

    return source_key, record_id


def build_recipe_box_image_filename(record_id: str) -> str | None:
    filename_stem = load_recipe_box_url_to_filename()(record_id)
    if not filename_stem:
        return None

    return f"{filename_stem}.jpg"


def build_recipe_box_public_image_url(source_url: str | None) -> str | None:
    parsed_source = parse_recipe_box_source_url(source_url)
    if parsed_source is None:
        return None

    source_key, record_id = parsed_source
    filename = build_recipe_box_image_filename(record_id)
    if filename is None:
        return None

    if not (Path(RECIPE_BOX_IMAGE_DIR) / filename).is_file():
        return None

    return f"{RECIPE_BOX_IMAGE_URL_PREFIX}/{source_key}/{filename}"


def build_recipe_image_url(recipe: Recipe) -> str | None:
    recipe_box_image_url = build_recipe_box_public_image_url(recipe.source_url)
    if recipe_box_image_url is not None:
        return recipe_box_image_url

    return recipe.hero_image_url


def build_curated_recipes_query(limit: int, exclude_ids: list[UUID]) -> Select[tuple[Recipe, RecipeVersion | None]]:
    statement = (
        select(Recipe, RecipeVersion)
        .outerjoin(RecipeVersion, RecipeVersion.id == Recipe.current_version_id)
        .where(
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.is_not(None),
            Recipe.hero_image_url.is_not(None),
        )
    )

    if exclude_ids:
        statement = statement.where(Recipe.id.not_in(exclude_ids))

    return statement.order_by(func.random()).limit(limit)


def build_recipe_detail_query(recipe_id: UUID) -> Select[tuple[Recipe, RecipeVersion | None]]:
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


def build_recipe_search_query(query: str, limit: int) -> Select[tuple[Recipe, RecipeVersion | None]]:
    return (
        select(Recipe, RecipeVersion)
        .outerjoin(RecipeVersion, RecipeVersion.id == Recipe.current_version_id)
        .where(
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.is_not(None),
            Recipe.title.ilike(f"%{query}%"),
        )
        .order_by(Recipe.title.asc())
        .limit(limit)
    )


def build_recipe_duration_expression():
    recipe_field_duration = func.coalesce(
        Recipe.total_time_minutes,
        func.nullif(func.coalesce(Recipe.prep_time_minutes, 0) + func.coalesce(Recipe.cook_time_minutes, 0), 0),
    )
    step_estimate_duration = func.greatest(
        literal(15),
        func.least(literal(90), func.coalesce(func.jsonb_array_length(RecipeVersion.raw_directions), 0) * 8),
    )

    return func.coalesce(recipe_field_duration, step_estimate_duration, literal(30))


def build_quick_dinner_recipes_query(limit: int, max_minutes: int) -> Select[tuple[Recipe, RecipeVersion | None]]:
    duration_expression = build_recipe_duration_expression()
    dinner_match_conditions = [
        Recipe.meal_type.ilike("%dinner%"),
        Recipe.meal_type.ilike("%main%"),
        *[Recipe.title.ilike(f"%{keyword}%") for keyword in QUICK_DINNER_TITLE_KEYWORDS],
    ]
    excluded_title_conditions = [
        Recipe.title.ilike(f"%{keyword}%") for keyword in QUICK_DINNER_EXCLUDED_TITLE_KEYWORDS
    ]

    return (
        select(Recipe, RecipeVersion)
        .outerjoin(RecipeVersion, RecipeVersion.id == Recipe.current_version_id)
        .where(
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.is_not(None),
            duration_expression <= max_minutes,
            or_(*dinner_match_conditions),
            not_(or_(*excluded_title_conditions)),
        )
        .order_by(duration_expression.asc(), func.random())
        .limit(limit)
    )


def build_pantry_match_recipes_query(user_id: UUID, limit: int) -> Select[tuple[Recipe, RecipeVersion | None, int]]:
    normalized_recipe_ingredient = func.lower(
        func.btrim(func.coalesce(RecipeIngredient.ner_name, RecipeIngredient.ingredient_text))
    )
    matched_ingredient_count = func.count(RecipeIngredient.id).label("matched_ingredient_count")

    return (
        select(Recipe, RecipeVersion, matched_ingredient_count)
        .join(RecipeVersion, RecipeVersion.id == Recipe.current_version_id)
        .join(RecipeIngredient, RecipeIngredient.recipe_version_id == RecipeVersion.id)
        .join(
            UserPantryItem,
            UserPantryItem.normalized_name == normalized_recipe_ingredient,
        )
        .where(
            UserPantryItem.user_id == user_id,
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.is_not(None),
        )
        .group_by(Recipe.id, RecipeVersion.id)
        .order_by(matched_ingredient_count.desc(), func.random())
        .limit(limit)
    )


def build_recipe_description(recipe: Recipe, version: RecipeVersion | None) -> str:
    description = (recipe.description or "").strip()
    if description:
        return description

    if version is not None and version.raw_directions:
        return shorten(
            " ".join(step.strip() for step in version.raw_directions if step and step.strip()),
            width=140,
            placeholder="...",
        )

    if version is not None and version.raw_ingredients:
        ingredient_count = len(version.raw_ingredients)
        ingredient_label = "ingredient" if ingredient_count == 1 else "ingredients"
        return f"A pantry-friendly recipe built from {ingredient_count} {ingredient_label}."

    source_name = (recipe.source_name or recipe.source_site or "Cookiful").strip()
    return f"A fresh curated recipe from {source_name}."


def build_recipe_duration_minutes(recipe: Recipe, version: RecipeVersion | None) -> int:
    if recipe.total_time_minutes is not None and recipe.total_time_minutes > 0:
        return recipe.total_time_minutes

    combined_minutes = (recipe.prep_time_minutes or 0) + (recipe.cook_time_minutes or 0)
    if combined_minutes > 0:
        return combined_minutes

    step_count = len(version.raw_directions) if version is not None and version.raw_directions else 0
    estimated_minutes = step_count * 8 if step_count > 0 else 30
    return max(15, min(90, estimated_minutes))


def normalize_recipe_tag(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = " ".join(part for part in value.replace("-", " ").split() if part)
    if not cleaned:
        return None

    return cleaned.upper()[:18]


def build_recipe_tag(recipe: Recipe) -> str:
    for candidate in (
        recipe.meal_type,
        recipe.cuisine_type,
        recipe.difficulty_level,
        recipe.source_site,
        recipe.source_name,
    ):
        normalized = normalize_recipe_tag(candidate)
        if normalized is not None:
            return normalized

    return "CURATED"


def serialize_curated_recipe(recipe: Recipe, version: RecipeVersion | None) -> CuratedRecipeResponse:
    return CuratedRecipeResponse(
        id=recipe.id,
        title=recipe.title,
        description=build_recipe_description(recipe, version),
        duration_minutes=build_recipe_duration_minutes(recipe, version),
        tag=build_recipe_tag(recipe),
        image_url=build_recipe_image_url(recipe),
        image_alt=f"Editorial plating for {recipe.title}.",
        source_name=recipe.source_name,
        source_url=recipe.source_url,
    )


def serialize_recipe_detail(recipe: Recipe, version: RecipeVersion | None) -> RecipeDetailResponse:
    return RecipeDetailResponse(
        **serialize_curated_recipe(recipe, version).model_dump(),
        ingredients=list(version.raw_ingredients or []) if version is not None else [],
        instructions=list(version.raw_directions or []) if version is not None else [],
    )


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


@router.get("/images/recipe-box/{source_key}/{filename}")
def get_recipe_box_image(source_key: str, filename: str) -> FileResponse:
    if source_key not in RECIPE_BOX_SOURCE_KEYS or RECIPE_BOX_IMAGE_FILENAME_PATTERN.fullmatch(filename) is None:
        raise HTTPException(status_code=404, detail="Recipe image not found.")

    image_path = Path(RECIPE_BOX_IMAGE_DIR) / filename
    if not image_path.is_file():
        raise HTTPException(status_code=404, detail="Recipe image not found.")

    return FileResponse(image_path, media_type="image/jpeg")


@router.get("/curated", response_model=CuratedRecipesResponse)
def list_curated_recipes(
    limit: Annotated[int, Query(ge=1, le=12)] = 4,
    exclude_id: Annotated[list[UUID] | None, Query()] = None,
) -> CuratedRecipesResponse:
    exclude_ids = exclude_id or []

    with SessionLocal() as session:
        rows = session.execute(build_curated_recipes_query(limit=limit, exclude_ids=exclude_ids)).all()

    return CuratedRecipesResponse(
        recipes=[serialize_curated_recipe(recipe, version) for recipe, version in rows]
    )


@router.get("/search", response_model=CuratedRecipesResponse)
def search_recipes(
    q: Annotated[str, Query(min_length=1, max_length=120)],
    limit: Annotated[int, Query(ge=1, le=6)] = 5,
) -> CuratedRecipesResponse:
    query = q.strip()
    if not query:
        return CuratedRecipesResponse(recipes=[])

    with SessionLocal() as session:
        rows = session.execute(build_recipe_search_query(query=query, limit=limit)).all()

    return CuratedRecipesResponse(
        recipes=[serialize_curated_recipe(recipe, version) for recipe, version in rows]
    )


@router.get("/quick-dinner", response_model=CuratedRecipesResponse)
def list_quick_dinner_recipes(
    limit: Annotated[int, Query(ge=1, le=6)] = 3,
    max_minutes: Annotated[int, Query(ge=10, le=60)] = 30,
) -> CuratedRecipesResponse:
    with SessionLocal() as session:
        rows = session.execute(build_quick_dinner_recipes_query(limit=limit, max_minutes=max_minutes)).all()

    return CuratedRecipesResponse(
        recipes=[serialize_curated_recipe(recipe, version) for recipe, version in rows]
    )


@router.get("/pantry-matches", response_model=CuratedRecipesResponse)
def list_pantry_match_recipes(
    user_id: Annotated[UUID, Depends(get_current_user_id)],
    limit: Annotated[int, Query(ge=1, le=6)] = 3,
) -> CuratedRecipesResponse:
    with SessionLocal() as session:
        rows = session.execute(build_pantry_match_recipes_query(user_id=user_id, limit=limit)).all()

    return CuratedRecipesResponse(
        recipes=[serialize_curated_recipe(recipe, version) for recipe, version, _match_count in rows]
    )


@router.get("/{recipe_id}", response_model=RecipeDetailResponse)
def get_recipe_detail(recipe_id: UUID) -> RecipeDetailResponse:
    with SessionLocal() as session:
        row = session.execute(build_recipe_detail_query(recipe_id)).one_or_none()

    if row is None:
        raise HTTPException(status_code=404, detail="Recipe not found.")

    recipe, version = row
    return serialize_recipe_detail(recipe, version)
