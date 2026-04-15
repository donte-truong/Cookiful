RECIPE_CATALOG_VIEW_NAME = "recipe_catalog"

CREATE_RECIPE_CATALOG_VIEW_SQL = """
CREATE OR REPLACE VIEW recipe_catalog AS
SELECT
  r.id,
  r.title,
  r.source_url,
  r.source_name,
  r.source_site,
  r.status,
  r.visibility,
  r.current_version_id,
  rv.version_number AS current_version_number,
  rv.schema_version AS current_schema_version,
  COALESCE(jsonb_array_length(rv.raw_ingredients), 0) AS ingredient_count,
  COALESCE(jsonb_array_length(rv.raw_directions), 0) AS step_count,
  r.created_at,
  r.updated_at
FROM recipes AS r
LEFT JOIN recipe_versions AS rv
  ON rv.id = r.current_version_id;
"""
