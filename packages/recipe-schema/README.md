# `packages/recipe-schema`

Shared recipe import and domain types used by API, worker, and DB tooling.

## Current source format

The initial dataset is `recipes_data.csv` with these columns:

- `title`
- `ingredients`
- `directions`
- `link`
- `source`
- `NER`
- `site`

`ingredients`, `directions`, and `NER` are JSON-encoded array fields inside the CSV.

## Shared helpers

`src/index.ts` includes helpers to:

- parse JSON-array CSV fields
- normalize a CSV row into a typed record
- derive `recipe_ingredients` rows
- derive `recipe_steps` rows

