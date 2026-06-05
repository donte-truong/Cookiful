import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from uuid import UUID, uuid4

from fastapi import HTTPException
from sqlalchemy.dialects import postgresql

from apps.api.src.api.routes.recipes import (
    build_recipe_box_public_image_url,
    build_curated_recipes_query,
    build_pantry_match_recipes_query,
    build_quick_dinner_recipes_query,
    build_recipe_detail_query,
    build_recipe_search_query,
    get_recipe_detail,
    get_recipe_box_image,
    list_pantry_match_recipes,
    list_curated_recipes,
    list_quick_dinner_recipes,
    search_recipes,
    serialize_curated_recipe,
    serialize_recipe_detail,
)
from cookiful_db.models import Recipe, RecipeStatus, RecipeVersion, RecipeVisibility


def make_recipe(
    *,
    title: str = "Archive Onion Tart",
    hero_image_url: str | None = None,
    source_url: str | None = None,
    total_time_minutes: int | None = None,
) -> Recipe:
    recipe_id = uuid4()
    return Recipe(
        id=recipe_id,
        current_version_id=uuid4(),
        title=title,
        description=None,
        source_name="Cookiful Archive",
        source_site="archive.cookiful.dev",
        source_url=source_url,
        status=RecipeStatus.PUBLISHED,
        visibility=RecipeVisibility.PUBLIC,
        cuisine_type="French country",
        hero_image_url=hero_image_url,
        total_time_minutes=total_time_minutes,
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

        self.assertIn("random()", compiled_sql)
        self.assertIn("recipes.hero_image_url IS NOT NULL", compiled_sql)
        self.assertIn("LIMIT 4", compiled_sql)
        self.assertIn(str(excluded_id), compiled_sql)
        self.assertIn("recipes.current_version_id IS NOT NULL", compiled_sql)


class BuildRecipeDetailQueryTests(unittest.TestCase):
    def test_query_filters_to_public_published_recipe_with_version(self) -> None:
        recipe_id = UUID("44444444-4444-4444-4444-444444444444")

        statement = build_recipe_detail_query(recipe_id)
        compiled_sql = str(
            statement.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )

        self.assertIn(str(recipe_id), compiled_sql)
        self.assertIn("recipes.status = 'PUBLISHED'", compiled_sql)
        self.assertIn("recipes.visibility = 'PUBLIC'", compiled_sql)
        self.assertIn("recipes.current_version_id IS NOT NULL", compiled_sql)


class BuildRecipeSearchQueryTests(unittest.TestCase):
    def test_query_filters_public_published_titles_and_limits_results(self) -> None:
        statement = build_recipe_search_query("tomato", 5)
        compiled_sql = str(
            statement.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )

        self.assertIn("recipes.status = 'PUBLISHED'", compiled_sql)
        self.assertIn("recipes.visibility = 'PUBLIC'", compiled_sql)
        self.assertIn("recipes.current_version_id IS NOT NULL", compiled_sql)
        self.assertIn("recipes.title ILIKE '%%tomato%%'", compiled_sql)
        self.assertIn("ORDER BY recipes.title ASC", compiled_sql)
        self.assertIn("LIMIT 5", compiled_sql)


class BuildQuickDinnerRecipesQueryTests(unittest.TestCase):
    def test_query_filters_public_published_fast_recipes_and_limits_results(self) -> None:
        statement = build_quick_dinner_recipes_query(limit=3, max_minutes=30)
        compiled_sql = str(
            statement.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )

        self.assertIn("recipes.status = 'PUBLISHED'", compiled_sql)
        self.assertIn("recipes.visibility = 'PUBLIC'", compiled_sql)
        self.assertIn("recipes.current_version_id IS NOT NULL", compiled_sql)
        self.assertIn("<= 30", compiled_sql)
        self.assertIn("recipes.title ILIKE '%%pasta%%'", compiled_sql)
        self.assertIn("recipes.title ILIKE '%%slow cooker%%'", compiled_sql)
        self.assertIn("recipes.title ILIKE '%%cookie%%'", compiled_sql)
        self.assertIn("NOT", compiled_sql)
        self.assertIn("ORDER BY", compiled_sql)
        self.assertIn("random()", compiled_sql)
        self.assertIn("LIMIT 3", compiled_sql)


class BuildPantryMatchRecipesQueryTests(unittest.TestCase):
    def test_query_matches_user_pantry_items_to_recipe_ingredients(self) -> None:
        user_id = UUID("55555555-5555-5555-5555-555555555555")

        statement = build_pantry_match_recipes_query(user_id=user_id, limit=3)
        compiled_sql = str(
            statement.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )

        self.assertIn("JOIN user_pantry_items", compiled_sql)
        self.assertIn("JOIN recipe_ingredients", compiled_sql)
        self.assertIn(str(user_id), compiled_sql)
        self.assertIn("recipes.status = 'PUBLISHED'", compiled_sql)
        self.assertIn("recipes.visibility = 'PUBLIC'", compiled_sql)
        self.assertIn("count(recipe_ingredients.id)", compiled_sql)
        self.assertIn("ORDER BY matched_ingredient_count DESC", compiled_sql)
        self.assertIn("LIMIT 3", compiled_sql)


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

    def test_serialize_builds_recipe_box_image_url_from_source_url(self) -> None:
        recipe = make_recipe(
            title="Sour Cream Noodle Bake",
            source_url="recipe-box://fn/5l1yTSYFifF/M2dfbD6DX28WWQpLWNK",
        )
        version = make_version(recipe.id)

        with tempfile.TemporaryDirectory() as tmpdir:
            image_path = Path(tmpdir) / "5l1yTSYFifFM2dfbD6DX28WWQpLWNK.jpg"
            image_path.write_bytes(b"jpg")

            with patch("apps.api.src.api.routes.recipes.RECIPE_BOX_IMAGE_DIR", Path(tmpdir)):
                payload = serialize_curated_recipe(recipe, version)

        self.assertEqual(
            payload.image_url,
            "/api/recipes/images/recipe-box/fn/5l1yTSYFifFM2dfbD6DX28WWQpLWNK.jpg",
        )

    def test_serialize_recipe_detail_includes_ingredients_and_instructions(self) -> None:
        recipe = make_recipe(title="Pan Sauce Chicken")
        version = make_version(recipe.id)

        payload = serialize_recipe_detail(recipe, version)

        self.assertEqual(payload.title, "Pan Sauce Chicken")
        self.assertEqual(payload.ingredients, ["2 onions", "butter", "flour"])
        self.assertEqual(
            payload.instructions,
            [
                "Roast the onions until they turn jammy and sweet.",
                "Bake the tart shell until golden.",
            ],
        )


class RecipeBoxImageRouteTests(unittest.TestCase):
    def test_build_recipe_box_public_image_url_uses_recipe_box_filename_rules(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            image_path = Path(tmpdir) / "S7aeOIrsrgT0jLP32jKGg4jo9zi2DO.jpg"
            image_path.write_bytes(b"jpg")

            with patch("apps.api.src.api.routes.recipes.RECIPE_BOX_IMAGE_DIR", Path(tmpdir)):
                self.assertEqual(
                    build_recipe_box_public_image_url("recipe-box://fn/S7aeOIrsrgT0jLP32jKGg4j.o9zi2DO"),
                    "/api/recipes/images/recipe-box/fn/S7aeOIrsrgT0jLP32jKGg4jo9zi2DO.jpg",
                )

    def test_build_recipe_box_public_image_url_skips_missing_files(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch("apps.api.src.api.routes.recipes.RECIPE_BOX_IMAGE_DIR", Path(tmpdir)):
                self.assertIsNone(
                    build_recipe_box_public_image_url("recipe-box://fn/S7aeOIrsrgT0jLP32jKGg4j.o9zi2DO")
                )

    def test_get_recipe_box_image_serves_existing_utility_image(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            image_path = Path(tmpdir) / "recipe-image.jpg"
            image_path.write_bytes(b"jpg")

            with patch("apps.api.src.api.routes.recipes.RECIPE_BOX_IMAGE_DIR", Path(tmpdir)):
                response = get_recipe_box_image("fn", image_path.name)

        self.assertEqual(Path(response.path), image_path)
        self.assertEqual(response.media_type, "image/jpeg")

    def test_get_recipe_box_image_rejects_missing_or_unsafe_images(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch("apps.api.src.api.routes.recipes.RECIPE_BOX_IMAGE_DIR", Path(tmpdir)):
                with self.assertRaises(HTTPException):
                    get_recipe_box_image("fn", "../secret.jpg")

                with self.assertRaises(HTTPException):
                    get_recipe_box_image("fn", "missing.jpg")


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


class SearchRecipesRouteTests(unittest.TestCase):
    def test_route_returns_title_matches_from_session_rows(self) -> None:
        recipe = make_recipe(title="Weeknight Tomato Pasta")
        version = make_version(recipe.id)

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
            response = search_recipes(q=" tomato ", limit=3)

        self.assertEqual(len(response.recipes), 1)
        self.assertEqual(response.recipes[0].title, "Weeknight Tomato Pasta")

        compiled_sql = str(
            fake_session.executed_statement.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )
        self.assertIn("%%tomato%%", compiled_sql)
        self.assertIn("LIMIT 3", compiled_sql)

    def test_route_returns_empty_results_for_blank_query(self) -> None:
        response = search_recipes(q=" ", limit=3)

        self.assertEqual(response.recipes, [])


class ListQuickDinnerRecipesRouteTests(unittest.TestCase):
    def test_route_returns_serialized_quick_recipes_from_session_rows(self) -> None:
        recipe = make_recipe(title="Fast Tomato Pasta", total_time_minutes=18)
        version = make_version(recipe.id)

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
            response = list_quick_dinner_recipes(limit=2, max_minutes=25)

        self.assertEqual(len(response.recipes), 1)
        self.assertEqual(response.recipes[0].title, "Fast Tomato Pasta")

        compiled_sql = str(
            fake_session.executed_statement.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )
        self.assertIn("<= 25", compiled_sql)
        self.assertIn("LIMIT 2", compiled_sql)


class ListPantryMatchRecipesRouteTests(unittest.TestCase):
    def test_route_returns_serialized_recipes_from_matching_rows(self) -> None:
        user_id = UUID("55555555-5555-5555-5555-555555555555")
        recipe = make_recipe(title="Pantry Tomato Pasta")
        version = make_version(recipe.id)

        class FakeResult:
            def all(self):
                return [(recipe, version, 2)]

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
            response = list_pantry_match_recipes(user_id=user_id, limit=2)

        self.assertEqual(len(response.recipes), 1)
        self.assertEqual(response.recipes[0].title, "Pantry Tomato Pasta")

        compiled_sql = str(
            fake_session.executed_statement.compile(
                dialect=postgresql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )
        self.assertIn(str(user_id), compiled_sql)
        self.assertIn("LIMIT 2", compiled_sql)


class GetRecipeDetailRouteTests(unittest.TestCase):
    def test_route_returns_serialized_recipe_detail(self) -> None:
        recipe = make_recipe(title="Weeknight Tomato Pasta")
        version = make_version(recipe.id)

        class FakeResult:
            def one_or_none(self):
                return (recipe, version)

        class FakeSession:
            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, traceback) -> bool:
                return False

            def execute(self, statement):
                return FakeResult()

        with patch("apps.api.src.api.routes.recipes.SessionLocal", return_value=FakeSession()):
            response = get_recipe_detail(recipe.id)

        self.assertEqual(response.title, "Weeknight Tomato Pasta")
        self.assertEqual(response.ingredients, ["2 onions", "butter", "flour"])
        self.assertEqual(len(response.instructions), 2)

    def test_route_returns_404_for_missing_recipe(self) -> None:
        class FakeResult:
            def one_or_none(self):
                return None

        class FakeSession:
            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, traceback) -> bool:
                return False

            def execute(self, statement):
                return FakeResult()

        with patch("apps.api.src.api.routes.recipes.SessionLocal", return_value=FakeSession()):
            with self.assertRaises(HTTPException):
                get_recipe_detail(uuid4())


if __name__ == "__main__":
    unittest.main()
