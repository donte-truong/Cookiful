# `packages/db`

Python database foundation for Cookiful.

## What this package does

- defines the PostgreSQL schema in SQLAlchemy models
- applies the initial SQL migration for the core Cookiful tables
- imports the Recipe Box JSON datasets into `recipes`, `recipe_versions`, `recipe_ingredients`, and `recipe_steps`
- provides a guarded local reset command plus simple CLI tools for inspecting records and creating a readable recipe catalog view

## The recipes table shape

The `recipes` table stores one canonical row per recipe source entry. The imported Recipe Box JSON data is split into:

- `recipes` for the top-level recipe record and source metadata
- `recipe_versions` for the raw ingredient and direction arrays
- `recipe_ingredients` for ingredient rows the app can query directly
- `recipe_steps` for step rows the app can query directly

That gives us both the original source payload and a structured read model.

## Setup steps

1. Start the local database stack with `docker compose -f infrastructure/docker/docker-compose.dev.yml up -d`.
2. Create or activate a Python virtual environment.
3. Install this package in editable mode from `packages/db`.
4. Run `cookiful-db-doctor` to confirm the connection.
5. Run `cookiful-db-bootstrap` to apply the migration, seed demo data, import recipes, and create the recipe catalog view.

Recommended local commands:

```bash
cd packages/db
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
cookiful-db-doctor
cookiful-db-bootstrap
```

If you prefer the repo root workflow, the same database scripts can be invoked with `PYTHONPATH=packages/db/src python -m cookiful_db.scripts.<name>`.

Example:

```bash
PYTHONPATH=packages/db/src python -m cookiful_db.scripts.apply_migration
PYTHONPATH=packages/db/src python -m cookiful_db.scripts.import_recipe_box_json
PYTHONPATH=packages/db/src python -m cookiful_db.scripts.create_recipe_catalog_view
```

For this environment, the direct Python entrypoints above are the verified path for DB work.

## How to view records

Browser tools:

- pgAdmin: `http://localhost:5050`
  Login: `admin@cookiful.dev`
  Password: `cookiful`

### Quick CLI summary

Use the recipe inspector to print recent rows:

```bash
PYTHONPATH=packages/db/src python -m cookiful_db.scripts.inspect_recipes --limit 5
```

For a flattened summary from the database view:

```bash
PYTHONPATH=packages/db/src python -m cookiful_db.scripts.inspect_recipes --view --limit 5
```

To inspect one recipe more deeply:

```bash
PYTHONPATH=packages/db/src python -m cookiful_db.scripts.inspect_recipes --source-url "www.cookbooks.com/Recipe-Details.aspx?id=44874" --show-raw
```

### PostgreSQL directly

Once the tables are in place, you can also use `psql`:

```sql
\dt
SELECT id, title, source_url, source_name, source_site
FROM recipes
ORDER BY created_at DESC
LIMIT 10;

SELECT *
FROM recipe_catalog
ORDER BY created_at DESC
LIMIT 10;
```

## Tools included

- `cookiful-db-apply-migration`
- `cookiful-db-seed`
- `cookiful-db-import-recipes`
- `cookiful-db-import-recipe-box`
- `cookiful-db-reset`
- `cookiful-db-create-recipe-catalog-view`
- `cookiful-db-bootstrap`
- `cookiful-db-doctor`
- `cookiful-db-inspect-recipes`
- `cookiful-db-inspect-recipe-detail`

## Recipe data shape

The current recipe import follows:

- `packages/recipe-schema/data/recipes_raw_nosource_ar.json`
- `packages/recipe-schema/data/recipes_raw_nosource_epi.json`
- `packages/recipe-schema/data/recipes_raw_nosource_fn.json`

Those map to:

- `recipes.title`
- `recipes.source_url` as a stable `recipe-box://<source>/<record_id>` import key
- `recipes.source_name`
- `recipes.source_site`
- `recipes.hero_image_url` when Recipe Box exposes a direct image URL with a valid lowercase DNS host
- `recipe_versions.raw_ingredients`
- `recipe_versions.raw_directions`
- `recipe_versions.raw_ner` as an empty list because the new JSON corpus does not include NER rows

The Recipe Box `picture_link` field is not always a browser-displayable URL. The importer only stores it as `hero_image_url` when it is an `http://` or `https://` URL with a valid lowercase DNS host. Token-style image references remain unset in Postgres, but the curated API can derive a local Recipe Box image URL from `recipes.source_url` when matching JPGs have been downloaded into `packages/utils/recipe-box/data/img` with the Recipe Box utility.

To create local image-backed Recipe Box records for the curated feed, run:

```bash
bun run db:scrape:recipe-box-images
```

The script scrapes a small Epicurious starter set, writes URL-keyed Recipe Box JSON to `packages/utils/recipe-box/data/recipes_raw_epi.json`, downloads matching JPGs to `packages/utils/recipe-box/data/img`, and imports those records into Postgres.

## Notes

- The `recipe_catalog` view is optional, but it makes browsing much easier.
- The SQL migration remains the source of truth for the physical table definitions.
- The ORM mirrors the migration closely so inserts and later query code stay consistent.
- `DATABASE_URL` defaults to the local Docker Postgres container if you do not set it explicitly.
