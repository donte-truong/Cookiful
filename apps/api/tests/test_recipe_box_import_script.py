import unittest

from cookiful_db.scripts.import_recipe_box_json import (
    RecipeBoxImportResult,
    backfill_recipe_image_url,
    format_import_result,
    import_recipe_box_json,
)
from cookiful_db.importers.recipe_box_json import RecipeBoxImage, RecipeBoxRecipeRecord
from cookiful_db.models import Recipe


class RecipeBoxImportScriptTests(unittest.TestCase):
    def test_formats_import_result_with_image_counts(self) -> None:
        self.assertEqual(
            format_import_result(
                RecipeBoxImportResult(
                    processed=10,
                    inserted=8,
                    updated=2,
                    skipped=1,
                    discarded=2,
                    image_urls=3,
                    image_references=4,
                )
            ),
            (
                "Recipe Box import complete. "
                "Processed=10 Inserted=8 Updated=2 Skipped=1 "
                "Discarded=2 ImageURLs=3 ImageReferences=4"
            ),
        )

    def test_backfills_missing_recipe_image_urls(self) -> None:
        recipe = Recipe(title="Tomato Toast", source_url="recipe-box://epi/tomato-toast")
        record = RecipeBoxRecipeRecord(
            record_id="tomato-toast",
            title="Tomato Toast",
            ingredients=["bread", "tomato"],
            directions=["Toast the bread."],
            source_url="recipe-box://epi/tomato-toast",
            source_name="Recipe Box Epicurious",
            source_site="epicurious.com",
            image=RecipeBoxImage(
                url="https://assets.example.test/tomato-toast.jpg",
                reference="https://assets.example.test/tomato-toast.jpg",
            ),
        )

        self.assertTrue(backfill_recipe_image_url(recipe, record))
        self.assertEqual(recipe.hero_image_url, "https://assets.example.test/tomato-toast.jpg")
        self.assertFalse(backfill_recipe_image_url(recipe, record))

    def test_skips_backfill_when_dataset_image_is_not_fetchable(self) -> None:
        recipe = Recipe(title="Image Token Cake", source_url="recipe-box://fn/image-token-cake")
        record = RecipeBoxRecipeRecord(
            record_id="image-token-cake",
            title="Image Token Cake",
            ingredients=["flour"],
            directions=["Bake."],
            source_url="recipe-box://fn/image-token-cake",
            source_name="Recipe Box Food Network",
            source_site="foodnetwork.com",
            image=RecipeBoxImage(url=None, reference="opaque-image-token"),
        )

        self.assertFalse(backfill_recipe_image_url(recipe, record))
        self.assertIsNone(recipe.hero_image_url)

    def test_rejects_invalid_limits_before_opening_a_database_session(self) -> None:
        with self.assertRaises(ValueError):
            import_recipe_box_json([], limit=0)

        with self.assertRaises(ValueError):
            import_recipe_box_json([], commit_every=0)


if __name__ == "__main__":
    unittest.main()
