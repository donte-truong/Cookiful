import unittest
from unittest.mock import patch
from uuid import UUID, uuid4

from sqlalchemy.dialects import postgresql

from apps.api.src.api.routes.recipes import (
    build_curated_recipes_query,
    list_curated_recipes,
    serialize_curated_recipe,
)
from cookiful_db.models import Recipe, RecipeStatus, RecipeVersion, RecipeVisibility


def make_recipe(*, title: str = "Archive Onion Tart", hero_image_url: str | None = None) -> Recipe:
    recipe_id = uuid4()
    return Recipe(
        id=recipe_id,
        current_version_id=uuid4(),
        title=title,
        description=None,
        source_name="Cookiful Archive",
        source_site="archive.cookiful.dev",
        status=RecipeStatus.PUBLISHED,
        visibility=RecipeVisibility.PUBLIC,
        cuisine_type="French country",
        hero_image_url=hero_image_url,
    )


def make_version(recipe_id) -> RecipeVersion:
    return RecipeVersion(
        id=uuid4(),
        recipe_id=recipe_id,
        version_number=1,
        schema_version="1.0.0",
        raw_ingredients=["2 onions", "butter", "flour"],
        raw_directions=[
            "Roast the onions until they turn jammy and sweet.",
            "Bake the tart shell until golden.",
        ],
        raw_ner=["onion", "butter", "flour"],
    )


class BuildCuratedRecipesQueryTests(unittest.TestCase):
    def test_query_includes_random_limit_and_exclusions(self) -> None:
        excluded_id = UUID("11111111-1111-1111-1111-111111111111")

        statement = build_curated_recipes_query(limit=4, exclude_ids=[excluded_id])
        compiled_sql = str(
            statement.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )

        self.assertIn("ORDER BY random()", compiled_sql)
        self.assertIn("LIMIT 4", compiled_sql)
        self.assertIn(str(excluded_id), compiled_sql)
        self.assertIn("recipes.current_version_id IS NOT NULL", compiled_sql)


class SerializeCuratedRecipeTests(unittest.TestCase):
    def test_serialize_uses_database_fallbacks(self) -> None:
        recipe = make_recipe()
        version = make_version(recipe.id)

        payload = serialize_curated_recipe(recipe, version)

        self.assertEqual(payload.title, recipe.title)
        self.assertIn("Roast the onions", payload.description)
        self.assertEqual(payload.duration_minutes, 16)
        self.assertEqual(payload.tag, "FRENCH COUNTRY")
        self.assertEqual(payload.image_url, None)
        self.assertEqual(payload.image_alt, "Editorial plating for Archive Onion Tart.")

    def test_serialize_preserves_recipe_image_url(self) -> None:
        recipe = make_recipe(
            title="Tomato Soup",
            hero_image_url="https://images.example.test/tomato-soup.jpg",
        )
        version = make_version(recipe.id)

        payload = serialize_curated_recipe(recipe, version)

        self.assertEqual(payload.image_url, "https://images.example.test/tomato-soup.jpg")
        self.assertEqual(payload.image_alt, "Editorial plating for Tomato Soup.")


class ListCuratedRecipesRouteTests(unittest.TestCase):
    def test_route_returns_serialized_recipes_from_session_rows(self) -> None:
        recipe = make_recipe(title="Weeknight Tomato Pasta")
        version = make_version(recipe.id)
        excluded_ids = [
            UUID("22222222-2222-2222-2222-222222222222"),
            UUID("33333333-3333-3333-3333-333333333333"),
        ]

        class FakeResult:
            def all(self):
                return [(recipe, version)]

        class FakeSession:
            def __init__(self) -> None:
                self.executed_statement = None

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, traceback) -> bool:
                return False

            def execute(self, statement):
                self.executed_statement = statement
                return FakeResult()

        fake_session = FakeSession()

        with patch("apps.api.src.api.routes.recipes.SessionLocal", return_value=fake_session):
            response = list_curated_recipes(limit=3, exclude_id=excluded_ids)

        self.assertEqual(len(response.recipes), 1)
        self.assertEqual(str(response.recipes[0].id), str(recipe.id))
        self.assertEqual(response.recipes[0].title, "Weeknight Tomato Pasta")

        compiled_sql = str(
            fake_session.executed_statement.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )
        self.assertIn("LIMIT 3", compiled_sql)
        self.assertIn(str(excluded_ids[0]), compiled_sql)
        self.assertIn(str(excluded_ids[1]), compiled_sql)


if __name__ == "__main__":
    unittest.main()
