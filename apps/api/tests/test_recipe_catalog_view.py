import unittest

from cookiful_db.views import CREATE_RECIPE_CATALOG_VIEW_SQL, DROP_RECIPE_CATALOG_VIEW_SQL


class RecipeCatalogViewTests(unittest.TestCase):
    def test_view_sql_recreates_catalog_with_image_column(self) -> None:
        self.assertIn("DROP VIEW IF EXISTS recipe_catalog", DROP_RECIPE_CATALOG_VIEW_SQL)
        self.assertIn("CREATE VIEW recipe_catalog AS", CREATE_RECIPE_CATALOG_VIEW_SQL)
        self.assertIn("r.hero_image_url", CREATE_RECIPE_CATALOG_VIEW_SQL)
        self.assertNotIn("CREATE OR REPLACE VIEW", CREATE_RECIPE_CATALOG_VIEW_SQL)


if __name__ == "__main__":
    unittest.main()
