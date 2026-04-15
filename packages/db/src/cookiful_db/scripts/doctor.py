from sqlalchemy import text

from cookiful_db.database import engine
from cookiful_db.config import get_database_settings


def main() -> None:
    settings = get_database_settings()

    with engine.connect() as connection:
        row = connection.execute(
            text(
                """
                SELECT current_database() AS database_name,
                       current_user AS database_user,
                       version() AS database_version
                """
            )
        ).mappings().one()

    print("Database connection is healthy.")
    print(f"Database URL: {settings.database_url}")
    print(f"Database: {row['database_name']}")
    print(f"User: {row['database_user']}")
    print(f"Version: {row['database_version']}")


if __name__ == "__main__":
    main()
