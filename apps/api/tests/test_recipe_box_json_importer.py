import json
import tempfile
import unittest
from pathlib import Path

from cookiful_db.importers.recipe_box_json import (
    RecipeBoxJsonStats,
    infer_source_key,
    iter_recipe_box_json,
    is_fetchable_image_url,
    normalize_picture_link,
    normalize_recipe_box_record,
)


class RecipeBoxJsonImporterTests(unittest.TestCase):
    def test_infers_supported_source_key_from_dataset_filename(self) -> None:
        self.assertEqual(infer_source_key("recipes_raw_nosource_ar.json"), "ar")
        self.assertEqual(infer_source_key(Path("/tmp/recipes_raw_nosource_epi.json")), "epi")

        with self.assertRaises(ValueError):
            infer_source_key("recipes_raw_nosource_unknown.json")

    def test_normalizes_recipe_content_and_reference_only_images(self) -> None:
        record = normalize_recipe_box_record(
            record_id="abc123",
            source_key="fn",
            payload={
                "title": "  Tomato Soup  ",
                "ingredients": ["tomatoes ADVERTISEMENT", " stock  "],
                "instructions": "Simmer.\r\nBlend.\n\nServe.",
                "picture_link": "opaque-image-token",
            },
        )

        self.assertIsNotNone(record)
        assert record is not None
        self.assertEqual(record.title, "Tomato Soup")
        self.assertEqual(record.ingredients, ["tomatoes", "stock"])
        self.assertEqual(record.directions, ["Simmer.", "Blend.", "Serve."])
        self.assertEqual(record.source_url, "recipe-box://fn/abc123")
        self.assertEqual(record.source_name, "Recipe Box Food Network")
        self.assertEqual(record.source_site, "foodnetwork.com")
        self.assertIsNone(record.image.url)
        self.assertEqual(record.image.reference, "opaque-image-token")

    def test_normalizes_only_fetchable_picture_links_to_urls(self) -> None:
        self.assertTrue(is_fetchable_image_url("https://images.example.test/a.jpg"))
        self.assertFalse(is_fetchable_image_url("https://opaque-token/with-path"))
        self.assertFalse(is_fetchable_image_url("https://SKQLl180RSE4ZM3x9SzHOFyHr.yYy"))
        self.assertEqual(
            normalize_picture_link("https://images.example.test/a.jpg").url,
            "https://images.example.test/a.jpg",
        )
        self.assertEqual(
            normalize_picture_link("//images.example.test/b.jpg").url,
            "https://images.example.test/b.jpg",
        )
        self.assertIsNone(normalize_picture_link("opaque-image-token").url)
        self.assertEqual(normalize_picture_link("opaque-image-token").reference, "opaque-image-token")
        self.assertIsNone(normalize_picture_link("//opaque-token/with-path").url)
        self.assertEqual(normalize_picture_link("//opaque-token/with-path").reference, "//opaque-token/with-path")
        self.assertIsNone(normalize_picture_link("//SKQLl180RSE4ZM3x9SzHOFyHr.yYy").url)
        self.assertIsNone(normalize_picture_link(None).url)

    def test_iterates_dataset_with_stats_for_invalid_and_image_counts(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            dataset_path = Path(tmpdir) / "recipes_raw_nosource_ar.json"
            dataset_path.write_text(
                json.dumps(
                    {
                        "with-url": {
                            "title": "Soup",
                            "ingredients": ["stock"],
                            "instructions": "Simmer.",
                            "picture_link": "//images.example.test/soup.jpg",
                        },
                        "with-reference": {
                            "title": "Cake",
                            "ingredients": ["flour"],
                            "instructions": "Bake.",
                            "picture_link": "opaque-image-token",
                        },
                        "bad-record": {
                            "title": "No Ingredients",
                            "ingredients": [],
                            "instructions": "Skip.",
                        },
                    }
                ),
                encoding="utf-8",
            )

            stats = RecipeBoxJsonStats()
            records = list(iter_recipe_box_json(dataset_path, stats=stats))

        self.assertEqual([record.record_id for record in records], ["with-url", "with-reference"])
        self.assertEqual(stats.total, 3)
        self.assertEqual(stats.yielded, 2)
        self.assertEqual(stats.discarded, 1)
        self.assertEqual(stats.image_urls, 1)
        self.assertEqual(stats.image_references, 1)


if __name__ == "__main__":
    unittest.main()
