from __future__ import annotations

from functools import lru_cache
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import re
from textwrap import shorten
from typing import Annotated, Callable
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import Select, func, select

from cookiful_db import SessionLocal
from cookiful_db.paths import REPO_ROOT
from cookiful_db.models import Recipe, RecipeStatus, RecipeVersion, RecipeVisibility


router = APIRouter()

RECIPE_BOX_IMAGE_DIR = REPO_ROOT / "packages" / "utils" / "recipe-box" / "data" / "img"
RECIPE_BOX_UTILS_PATH = REPO_ROOT / "packages" / "utils" / "recipe-box" / "src" / "utils.py"
RECIPE_BOX_IMAGE_URL_PREFIX = "/api/recipes/images/recipe-box"
RECIPE_BOX_SOURCE_KEYS = frozenset({"ar", "epi", "fn"})
RECIPE_BOX_IMAGE_FILENAME_PATTERN = re.compile(r"^[A-Za-z0-9_-]+\.jpg$")


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


@router.get("/{recipe_id}", response_model=RecipeDetailResponse)
def get_recipe_detail(recipe_id: UUID) -> RecipeDetailResponse:
    with SessionLocal() as session:
        row = session.execute(build_recipe_detail_query(recipe_id)).one_or_none()

    if row is None:
        raise HTTPException(status_code=404, detail="Recipe not found.")

    recipe, version = row
    return serialize_recipe_detail(recipe, version)
