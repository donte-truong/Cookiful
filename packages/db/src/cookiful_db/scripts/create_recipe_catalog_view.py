from cookiful_db.database import engine
from cookiful_db.views import CREATE_RECIPE_CATALOG_VIEW_SQL, RECIPE_CATALOG_VIEW_NAME


def create_recipe_catalog_view() -> None:
    with engine.begin() as connection:
        connection.exec_driver_sql(CREATE_RECIPE_CATALOG_VIEW_SQL)

    print(f"Created or replaced database view: {RECIPE_CATALOG_VIEW_NAME}")


def main() -> None:
    create_recipe_catalog_view()


if __name__ == "__main__":
    main()
