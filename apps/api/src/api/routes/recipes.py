from __future__ import annotations

from textwrap import shorten
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import Select, func, select

from cookiful_db import SessionLocal
from cookiful_db.models import Recipe, RecipeStatus, RecipeVersion, RecipeVisibility


router = APIRouter()


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


def build_curated_recipes_query(limit: int, exclude_ids: list[UUID]) -> Select[tuple[Recipe, RecipeVersion | None]]:
    statement = (
        select(Recipe, RecipeVersion)
        .outerjoin(RecipeVersion, RecipeVersion.id == Recipe.current_version_id)
        .where(
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.is_not(None),
        )
    )

    if exclude_ids:
        statement = statement.where(Recipe.id.not_in(exclude_ids))

    return statement.order_by(func.random()).limit(limit)


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
        image_url=recipe.hero_image_url,
        image_alt=f"Editorial plating for {recipe.title}.",
        source_name=recipe.source_name,
        source_url=recipe.source_url,
    )


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
