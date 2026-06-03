from __future__ import annotations

import argparse
from pathlib import Path

from sqlalchemy.exc import SQLAlchemyError

from cookiful_db.paths import RECIPE_BOX_JSON_PATHS
from cookiful_db.scripts.apply_migration import apply_initial_migration
from cookiful_db.scripts.create_recipe_catalog_view import create_recipe_catalog_view
from cookiful_db.scripts.doctor import main as doctor_main
from cookiful_db.scripts.import_recipe_box_json import import_recipe_box_json
from cookiful_db.scripts.reset_database import reset_database
from cookiful_db.scripts.seed import seed_demo_data


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Bootstrap the local Cookiful database.")
    parser.add_argument(
        "--json",
        type=Path,
        nargs="*",
        default=list(RECIPE_BOX_JSON_PATHS),
        help="Recipe Box JSON dataset paths.",
    )
    parser.add_argument("--limit", type=int, default=None, help="Import at most this many new recipes from JSON.")
    parser.add_argument("--commit-every", type=int, default=500, help="Commit every N processed rows during JSON import.")
    parser.add_argument("--reset", action="store_true", help="Truncate all public tables before seeding/importing.")
    parser.add_argument("--skip-seed", action="store_true", help="Skip demo data seeding.")
    parser.add_argument("--skip-import", action="store_true", help="Skip recipe JSON import.")
    parser.add_argument("--skip-view", action="store_true", help="Skip creation of the recipe_catalog view.")
    parser.add_argument("--skip-doctor", action="store_true", help="Skip the connection check.")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    try:
        if not args.skip_doctor:
            doctor_main()

        apply_initial_migration()

        if args.reset:
            reset_database()

        if not args.skip_seed:
            seed_demo_data()

        if not args.skip_import:
            import_recipe_box_json(args.json, limit=args.limit, commit_every=args.commit_every)

        if not args.skip_view:
            create_recipe_catalog_view()
    except SQLAlchemyError as exc:
        raise SystemExit(
            "Database bootstrap failed. Check that Postgres is running, DATABASE_URL is set correctly, "
            "and the local container is reachable."
        ) from exc

    print("Local Cookiful database bootstrap complete.")


if __name__ == "__main__":
    main()
