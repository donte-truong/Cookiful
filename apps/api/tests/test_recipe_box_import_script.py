import unittest

from cookiful_db.scripts.import_recipe_box_json import (
    RecipeBoxImportResult,
    format_import_result,
    import_recipe_box_json,
)


class RecipeBoxImportScriptTests(unittest.TestCase):
    def test_formats_import_result_with_image_counts(self) -> None:
        self.assertEqual(
            format_import_result(
                RecipeBoxImportResult(
                    processed=10,
                    inserted=8,
                    skipped=1,
                    discarded=2,
                    image_urls=3,
                    image_references=4,
                )
            ),
            (
                "Recipe Box import complete. "
                "Processed=10 Inserted=8 Skipped=1 Discarded=2 ImageURLs=3 ImageReferences=4"
            ),
        )

    def test_rejects_invalid_limits_before_opening_a_database_session(self) -> None:
        with self.assertRaises(ValueError):
            import_recipe_box_json([], limit=0)

        with self.assertRaises(ValueError):
            import_recipe_box_json([], commit_every=0)


if __name__ == "__main__":
    unittest.main()
