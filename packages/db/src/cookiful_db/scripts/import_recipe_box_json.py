from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from cookiful_db.database import SessionLocal
from cookiful_db.importers.recipe_box_json import RecipeBoxJsonStats, iter_recipe_box_json
from cookiful_db.models import Recipe, RecipeIngredient, RecipeStatus, RecipeStep, RecipeVersion, RecipeVisibility
from cookiful_db.paths import RECIPE_BOX_JSON_PATHS


@dataclass(frozen=True, slots=True)
class RecipeBoxImportResult:
    processed: int
    inserted: int
    skipped: int
    discarded: int
    image_urls: int
    image_references: int


def format_import_result(result: RecipeBoxImportResult) -> str:
    return (
        "Recipe Box import complete. "
        f"Processed={result.processed} "
        f"Inserted={result.inserted} "
        f"Skipped={result.skipped} "
        f"Discarded={result.discarded} "
        f"ImageURLs={result.image_urls} "
        f"ImageReferences={result.image_references}"
    )


def import_recipe_box_json(
    json_paths: list[str | Path],
    limit: int | None = None,
    commit_every: int = 500,
) -> RecipeBoxImportResult:
    if commit_every <= 0:
        raise ValueError("commit_every must be greater than zero.")
    if limit is not None and limit < 1:
        raise ValueError("limit must be greater than zero when provided.")

    inserted = 0
    skipped = 0
    processed = 0
    aggregate_stats = RecipeBoxJsonStats()
    reached_limit = False

    with SessionLocal() as session:
        for json_path in json_paths:
            path_stats = RecipeBoxJsonStats()
            for record in iter_recipe_box_json(json_path, stats=path_stats):
                processed += 1
                existing = session.query(Recipe).filter(Recipe.source_url == record.source_url).one_or_none()
                if existing is not None:
                    skipped += 1
                    continue

                recipe = Recipe(
                    title=record.title,
                    source_url=record.source_url,
                    source_name=record.source_name,
                    source_site=record.source_site,
                    hero_image_url=record.image.url,
                    status=RecipeStatus.PUBLISHED,
                    visibility=RecipeVisibility.PUBLIC,
                )
                session.add(recipe)
                session.flush()

                version = RecipeVersion(
                    recipe_id=recipe.id,
                    version_number=1,
                    schema_version="recipe-box-json-v1",
                    raw_ingredients=record.ingredients,
                    raw_directions=record.directions,
                    raw_ner=[],
                )
                session.add(version)
                session.flush()

                recipe.current_version_id = version.id

                session.add_all(
                    [
                        RecipeIngredient(
                            recipe_version_id=version.id,
                            ingredient_text=ingredient_text,
                            ner_name=None,
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

                if processed % commit_every == 0:
                    session.commit()
                    print(f"Processed {processed} rows | inserted={inserted} skipped={skipped}")

                if limit is not None and inserted >= limit:
                    reached_limit = True
                    break

            aggregate_stats.total += path_stats.total
            aggregate_stats.yielded += path_stats.yielded
            aggregate_stats.discarded += path_stats.discarded
            aggregate_stats.image_urls += path_stats.image_urls
            aggregate_stats.image_references += path_stats.image_references
            print(
                f"{Path(json_path).name}: "
                f"records={path_stats.total} "
                f"valid={path_stats.yielded} "
                f"discarded={path_stats.discarded} "
                f"image_urls={path_stats.image_urls} "
                f"image_references={path_stats.image_references}"
            )

            if reached_limit:
                break

        session.commit()

    result = RecipeBoxImportResult(
        processed=processed,
        inserted=inserted,
        skipped=skipped,
        discarded=aggregate_stats.discarded,
        image_urls=aggregate_stats.image_urls,
        image_references=aggregate_stats.image_references,
    )
    print(format_import_result(result))
    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Import Recipe Box JSON datasets into Postgres.")
    parser.add_argument(
        "json_paths",
        nargs="*",
        type=Path,
        default=list(RECIPE_BOX_JSON_PATHS),
        help="Recipe Box JSON dataset paths. Defaults to packages/recipe-schema/data/*.json.",
    )
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
    import_recipe_box_json(
        json_paths=args.json_paths,
        limit=args.limit,
        commit_every=args.commit_every,
    )


if __name__ == "__main__":
    main()
