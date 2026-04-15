from cookiful_db.database import engine
from cookiful_db.paths import INITIAL_MIGRATION_PATH


def apply_initial_migration() -> None:
    sql = INITIAL_MIGRATION_PATH.read_text(encoding="utf-8")

    connection = engine.raw_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
        connection.commit()
    finally:
        connection.close()

    print(f"Applied migration: {INITIAL_MIGRATION_PATH}")


def main() -> None:
    apply_initial_migration()


if __name__ == "__main__":
    main()
