from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parent
SRC_ROOT = PACKAGE_ROOT.parent
DB_PROJECT_ROOT = SRC_ROOT.parent
PACKAGES_ROOT = DB_PROJECT_ROOT.parent
REPO_ROOT = PACKAGES_ROOT.parent

ENV_FILE = REPO_ROOT / ".env"
RECIPES_CSV_PATH = REPO_ROOT / "packages" / "recipe-schema" / "recipes_data.csv"
RECIPE_BOX_DATA_DIR = REPO_ROOT / "packages" / "recipe-schema" / "data"
RECIPE_BOX_JSON_PATHS = (
    RECIPE_BOX_DATA_DIR / "recipes_raw_nosource_ar.json",
    RECIPE_BOX_DATA_DIR / "recipes_raw_nosource_epi.json",
    RECIPE_BOX_DATA_DIR / "recipes_raw_nosource_fn.json",
)
INITIAL_MIGRATION_PATH = REPO_ROOT / "packages" / "db" / "migrations" / "202604120001_initial_foundation.sql"
MIGRATIONS_DIR = REPO_ROOT / "packages" / "db" / "migrations"
