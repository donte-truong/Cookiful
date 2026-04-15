from __future__ import annotations

import argparse
from textwrap import indent

from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError

from cookiful_db.database import SessionLocal
from cookiful_db.models import Recipe, RecipeVersion
from cookiful_db.views import RECIPE_CATALOG_VIEW_NAME


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Inspect recipe records in the Cookiful database.")
    parser.add_argument("--limit", type=int, default=10, help="Maximum number of recipes to print.")
    parser.add_argument("--recipe-id", help="Show one recipe by UUID.")
    parser.add_argument("--source-url", help="Show one recipe by source URL.")
    parser.add_argument("--show-raw", action="store_true", help="Include raw ingredient and direction arrays.")
    parser.add_argument("--view", action="store_true", help=f"Query the {RECIPE_CATALOG_VIEW_NAME} view when available.")
    return parser


def format_heading(recipe: Recipe) -> str:
    return f"{recipe.title} | {recipe.source_url or 'no source url'}"


def print_recipe(recipe: Recipe, version: RecipeVersion | None, show_raw: bool) -> None:
    print(format_heading(recipe))
    print(f"  id: {recipe.id}")
    print(f"  status: {recipe.status.value}")
    print(f"  visibility: {recipe.visibility.value}")
    print(f"  source: {recipe.source_name or '-'} / {recipe.source_site or '-'}")
    if version is None:
        print("  version: none")
        return

    print(f"  version: {version.version_number} ({version.schema_version})")
    print(f"  ingredients: {len(version.raw_ingredients)}")
    print(f"  steps: {len(version.raw_directions)}")
    if show_raw:
        print("  raw_ingredients:")
        print(indent("\n".join(f"- {item}" for item in version.raw_ingredients), "    "))
        print("  raw_directions:")
        print(indent("\n".join(f"- {item}" for item in version.raw_directions), "    "))


def print_recipe_catalog_rows(rows: list[dict]) -> None:
    for row in rows:
        print(
            f"{row['title']} | {row['source_url'] or 'no source url'} | "
            f"{row['status']} | v{row['current_version_number'] or '-'} | "
            f"{row['ingredient_count']} ingredients | {row['step_count']} steps"
        )


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    with SessionLocal() as session:
        if args.view:
            try:
                rows = session.execute(
                    text(
                        f"""
                        SELECT title, source_url, status, current_version_number, ingredient_count, step_count
                        FROM {RECIPE_CATALOG_VIEW_NAME}
                        ORDER BY created_at DESC
                        LIMIT :limit
                        """
                    ),
                    {"limit": args.limit},
                ).mappings().all()
            except SQLAlchemyError:
                print(
                    f"The {RECIPE_CATALOG_VIEW_NAME} view is not available yet. "
                    "Run cookiful-db-create-recipe-catalog-view first, then retry."
                )
                return

            if not rows:
                print("No recipe catalog rows found.")
                return

            print_recipe_catalog_rows(list(rows))
            return

        stmt = select(Recipe).order_by(Recipe.created_at.desc()).limit(args.limit)
        if args.recipe_id:
            stmt = stmt.where(Recipe.id == args.recipe_id)
        if args.source_url:
            stmt = stmt.where(Recipe.source_url == args.source_url)

        recipes = session.scalars(stmt).all()
        if not recipes:
            print("No recipe records found.")
            return

        for recipe in recipes:
            version = None
            if recipe.current_version_id is not None:
                version = session.get(RecipeVersion, recipe.current_version_id)
            print_recipe(recipe, version, args.show_raw)
            print()


if __name__ == "__main__":
    main()
