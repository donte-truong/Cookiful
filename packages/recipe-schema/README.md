# `packages/recipe-schema`

Shared recipe import and domain types used by API, worker, and DB tooling.

## Current source formats

The current bulk import dataset lives under `data/` and is ignored by git because
the source files are large:

- `recipes_raw_nosource_ar.json`
- `recipes_raw_nosource_epi.json`
- `recipes_raw_nosource_fn.json`

Each JSON file is an object keyed by the upstream Recipe Box record id. Values
use this shape:

- `title`
- `ingredients`
- `instructions`
- `picture_link`

The previous CSV dataset used `recipes_data.csv` with these columns:

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
- normalize a Recipe Box JSON record into a typed record
- derive `recipe_ingredients` rows
- derive `recipe_steps` rows

Most Recipe Box `picture_link` values in the nosource data are opaque references
rather than fetchable image URLs. Importers should only treat `http://` and
`https://` values with valid lowercase DNS hosts as displayable image URLs.
