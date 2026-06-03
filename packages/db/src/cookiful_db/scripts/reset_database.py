from __future__ import annotations

import argparse
from urllib.parse import urlparse

from sqlalchemy import text

from cookiful_db.config import get_database_settings
from cookiful_db.database import engine


LOCAL_DATABASE_HOSTS = {"localhost", "127.0.0.1", "::1"}


def is_local_database_url(database_url: str) -> bool:
    parsed = urlparse(database_url.replace("postgresql+psycopg://", "postgresql://", 1))
    return parsed.hostname in LOCAL_DATABASE_HOSTS


def quote_identifier(value: str) -> str:
    return '"' + value.replace('"', '""') + '"'


def reset_database(allow_non_local: bool = False) -> int:
    settings = get_database_settings()
    if not allow_non_local and not is_local_database_url(settings.database_url):
        raise RuntimeError(
            "Refusing to reset a non-local database. "
            "Use --allow-non-local only when you are certain this is safe."
        )

    with engine.begin() as connection:
        table_names = connection.execute(
            text(
                """
                SELECT tablename
                FROM pg_tables
                WHERE schemaname = 'public'
                ORDER BY tablename
                """
            )
        ).scalars().all()

        if not table_names:
            return 0

        quoted_tables = ", ".join(f"public.{quote_identifier(table_name)}" for table_name in table_names)
        connection.execute(text(f"TRUNCATE TABLE {quoted_tables} RESTART IDENTITY CASCADE"))

    return len(table_names)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Remove all records from the configured Cookiful database.")
    parser.add_argument(
        "--allow-non-local",
        action="store_true",
        help="Allow reset when DATABASE_URL does not point to localhost/127.0.0.1.",
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    table_count = reset_database(allow_non_local=args.allow_non_local)
    print(f"Database reset complete. Truncated {table_count} public tables.")


if __name__ == "__main__":
    main()
