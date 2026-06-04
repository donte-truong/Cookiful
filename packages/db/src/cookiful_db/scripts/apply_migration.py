from pathlib import Path

from cookiful_db.database import engine
from cookiful_db.paths import INITIAL_MIGRATION_PATH, MIGRATIONS_DIR


def apply_sql_migration(path: Path) -> None:
    sql = path.read_text(encoding="utf-8")
    connection = engine.raw_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
        connection.commit()
    finally:
        connection.close()

    print(f"Applied migration: {path}")


def list_migration_paths() -> list[Path]:
    return sorted(path for path in MIGRATIONS_DIR.glob("*.sql") if path.is_file())


def apply_migrations() -> None:
    for path in list_migration_paths():
        apply_sql_migration(path)


def apply_initial_migration() -> None:
    # Backwards-compatible entrypoint used by bootstrap scripts.
    apply_migrations()


def main() -> None:
    apply_migrations()


if __name__ == "__main__":
    main()
