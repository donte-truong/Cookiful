import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from cookiful_db.scripts.scrape_recipe_box_images import (
    extract_recipe_json_ld,
    recipe_box_image_path,
    scrape_recipe_box_images,
)


class RecipeBoxImageScraperTests(unittest.TestCase):
    def test_extracts_recipe_json_ld_from_page_html(self) -> None:
        page_html = """
        <html>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Roast Chicken",
              "recipeIngredient": ["1 chicken"],
              "recipeInstructions": [{"@type": "HowToStep", "text": "Roast it."}],
              "image": ["https://images.example.test/chicken.jpg"]
            }
          </script>
        </html>
        """

        recipe = extract_recipe_json_ld(page_html)

        self.assertIsNotNone(recipe)
        assert recipe is not None
        self.assertEqual(recipe["name"], "Roast Chicken")

    def test_recipe_box_image_path_uses_recipe_box_filename_rules(self) -> None:
        self.assertEqual(
            recipe_box_image_path("https://www.epicurious.com/recipes/food/views/roast-chicken").name,
            "httpswwwepicuriouscomrecipesfoodviewsroast-chicken.jpg",
        )

    def test_scrape_recipe_box_images_writes_recipe_box_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            json_path = Path(tmpdir) / "recipes_raw_epi.json"

            with (
                patch("cookiful_db.scripts.scrape_recipe_box_images.scrape_epicurious_recipe") as scrape_recipe,
                patch("cookiful_db.scripts.scrape_recipe_box_images.download_recipe_image", return_value=True),
            ):
                scrape_recipe.return_value = type(
                    "Record",
                    (),
                    {
                        "url": "https://www.epicurious.com/recipes/food/views/roast-chicken",
                        "title": "Roast Chicken",
                        "ingredients": ["1 chicken"],
                        "instructions": ["Roast it."],
                        "picture_link": "https://images.example.test/chicken.jpg",
                    },
                )()

                result = scrape_recipe_box_images(
                    urls=["https://www.epicurious.com/recipes/food/views/roast-chicken"],
                    json_path=json_path,
                )
                json_text = json_path.read_text(encoding="utf-8")

        self.assertEqual(result.scraped, 1)
        self.assertEqual(result.downloaded, 1)
        self.assertEqual(
            json_text,
            '{\n'
            '  "https://www.epicurious.com/recipes/food/views/roast-chicken": {\n'
            '    "ingredients": [\n'
            '      "1 chicken"\n'
            '    ],\n'
            '    "instructions": [\n'
            '      "Roast it."\n'
            '    ],\n'
            '    "picture_link": "https://images.example.test/chicken.jpg",\n'
            '    "title": "Roast Chicken"\n'
            '  }\n'
            '}\n',
        )


if __name__ == "__main__":
    unittest.main()
