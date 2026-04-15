from __future__ import annotations

import argparse
from pathlib import Path

from cookiful_db.database import SessionLocal
from cookiful_db.importers.recipes_csv import iter_recipe_csv
from cookiful_db.models import Recipe, RecipeIngredient, RecipeStatus, RecipeStep, RecipeVersion, RecipeVisibility
from cookiful_db.paths import RECIPES_CSV_PATH


def import_recipes_csv(csv_path: str | Path, limit: int | None = None, commit_every: int = 500) -> None:
    inserted = 0
    skipped = 0

    with SessionLocal() as session:
        for index, record in enumerate(iter_recipe_csv(csv_path), start=1):
            if limit is not None and inserted >= limit:
                break

            existing = session.query(Recipe).filter(Recipe.source_url == record.source_url).one_or_none()
            if existing is not None:
                skipped += 1
                continue

            recipe = Recipe(
                title=record.title,
                source_url=record.source_url,
                source_name=record.source_name,
                source_site=record.source_site,
                status=RecipeStatus.PUBLISHED,
                visibility=RecipeVisibility.PUBLIC,
            )
            session.add(recipe)
            session.flush()

            version = RecipeVersion(
                recipe_id=recipe.id,
                version_number=1,
                schema_version="csv-import-v1",
                raw_ingredients=record.ingredients,
                raw_directions=record.directions,
                raw_ner=record.ner,
            )
            session.add(version)
            session.flush()

            recipe.current_version_id = version.id

            session.add_all(
                [
                    RecipeIngredient(
                        recipe_version_id=version.id,
                        ingredient_text=ingredient_text,
                        ner_name=record.ner[index] if index < len(record.ner) else None,
                        sort_order=index + 1,
                    )
                    for index, ingredient_text in enumerate(record.ingredients)
                ]
            )
            session.add_all(
                [
                    RecipeStep(
                        recipe_version_id=version.id,
                        step_number=index + 1,
                        instruction_text=instruction_text,
                        sort_order=index + 1,
                    )
                    for index, instruction_text in enumerate(record.directions)
                ]
            )
            inserted += 1

            if index % commit_every == 0:
                session.commit()
                print(f"Processed {index} rows | inserted={inserted} skipped={skipped}")

        session.commit()

    print(f"Recipe import complete. Inserted={inserted} Skipped={skipped}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Import Cookiful recipe CSV data into Postgres.")
    parser.add_argument("csv_path", nargs="?", default=RECIPES_CSV_PATH, help="Path to the recipes CSV file.")
    parser.add_argument("--limit", type=int, default=None, help="Import at most this many new recipes.")
    parser.add_argument(
        "--commit-every",
        type=int,
        default=500,
        help="Commit every N processed rows during import.",
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    import_recipes_csv(args.csv_path, limit=args.limit, commit_every=args.commit_every)


if __name__ == "__main__":
    main()
