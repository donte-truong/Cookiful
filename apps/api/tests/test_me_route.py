import unittest
from datetime import UTC, datetime
from unittest.mock import patch
from uuid import UUID, uuid4

from fastapi import HTTPException
from fastapi.routing import APIRoute

from apps.api.src.api.router import api_router
from apps.api.src.api.routes.auth import build_auth_tokens
from apps.api.src.api.routes.me import (
    PantryItemRequest,
    RecipeSocialActionRequest,
    build_action_state,
    build_groceries_response,
    build_profile_response,
    build_social_action_stat,
    create_me_pantry_item,
    delete_me_pantry_item,
    get_current_user_id,
    get_me_groceries,
    get_me_profile,
    normalize_ingredient_name,
    router,
    serialize_social_highlight,
    update_recipe_social_action,
)
from cookiful_db.models import Recipe, RecipeIngredient, RecipeStatus, RecipeVersion, RecipeVisibility, User, UserPantryItem, UserProfile, UserRecipeSocialAction, UserStatus


class FakeSettings:
    jwt_access_secret = "test-access-secret"
    jwt_refresh_secret = "test-refresh-secret"


class FakeScalarList:
    def __init__(self, values):
        self.values = values

    def all(self):
        return self.values


class FakeResult:
    def __init__(self, *, scalar_value=None, one_value=None, all_values=None, scalar_values=None) -> None:
        self.scalar_value = scalar_value
        self.one_value = one_value
        self.all_values = all_values or []
        self.scalar_values = scalar_values or []

    def scalar_one_or_none(self):
        return self.scalar_value

    def one_or_none(self):
        return self.one_value

    def all(self):
        return self.all_values

    def scalars(self):
        return FakeScalarList(self.scalar_values)


class FakeSession:
    def __init__(self, results) -> None:
        self.results = list(results)
        self.added_objects = []
        self.deleted_objects = []
        self.committed = False

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback) -> bool:
        return False

    def execute(self, statement):
        if not self.results:
            raise AssertionError(f"Unexpected query: {statement}")

        return self.results.pop(0)

    def add(self, value):
        if getattr(value, "id", None) is None:
            value.id = uuid4()
        self.added_objects.append(value)

    def delete(self, value):
        self.deleted_objects.append(value)

    def commit(self):
        self.committed = True


def make_user() -> User:
    user_id = UUID("11111111-1111-1111-1111-111111111111")
    user = User(
        id=user_id,
        email="chef@example.test",
        username="chef",
        password_hash="hash",
        status=UserStatus.ACTIVE,
    )
    user.profile = UserProfile(user_id=user_id, display_name="Chef Example")
    return user


def make_recipe(title: str = "Tomato Toast") -> Recipe:
    return Recipe(
        id=uuid4(),
        current_version_id=uuid4(),
        title=title,
        description="A crisp, copper-lit snack.",
        source_name="Cookiful Archive",
        source_site="archive.cookiful.dev",
        source_url=None,
        status=RecipeStatus.PUBLISHED,
        visibility=RecipeVisibility.PUBLIC,
        meal_type="Snack",
        hero_image_url="https://images.example.test/tomato-toast.jpg",
    )


def make_version(recipe: Recipe) -> RecipeVersion:
    return RecipeVersion(
        id=recipe.current_version_id,
        recipe_id=recipe.id,
        version_number=1,
        schema_version="1.0.0",
        raw_ingredients=["toast", "tomato"],
        raw_directions=["Toast bread.", "Add tomato."],
        raw_ner=["toast", "tomato"],
    )


def make_ingredient(version: RecipeVersion, text: str = "2 slices sourdough") -> RecipeIngredient:
    return RecipeIngredient(
        id=uuid4(),
        recipe_version_id=version.id,
        ingredient_text=text,
        ner_name=None,
        sort_order=1,
    )


def make_pantry_item(user: User, ingredient_name: str = "2 slices sourdough") -> UserPantryItem:
    return UserPantryItem(
        id=uuid4(),
        user_id=user.id,
        ingredient_name=ingredient_name,
        normalized_name=normalize_ingredient_name(ingredient_name),
    )


class MeAuthTests(unittest.TestCase):
    def test_get_current_user_id_accepts_access_token(self) -> None:
        user = make_user()

        with patch("apps.api.src.api.routes.auth.get_settings", return_value=FakeSettings()):
            access_token, _refresh_token = build_auth_tokens(user, now=datetime.now(UTC))

            self.assertEqual(get_current_user_id(f"Bearer {access_token}"), user.id)

    def test_get_current_user_id_rejects_missing_or_invalid_token(self) -> None:
        with self.assertRaises(HTTPException):
            get_current_user_id(None)

        with self.assertRaises(HTTPException):
            get_current_user_id("Bearer invalid")


class MeRouteMetadataTests(unittest.TestCase):
    def test_api_router_includes_me_routes(self) -> None:
        me_paths = {
            route.path
            for route in api_router.routes
            if isinstance(route, APIRoute) and "me" in route.tags
        }

        self.assertIn("/me/profile", me_paths)
        self.assertIn("/me/recipe-actions", me_paths)
        self.assertIn("/me/groceries", me_paths)
        self.assertIn("/me/groceries/pantry-items", me_paths)

    def test_recipe_actions_route_uses_put(self) -> None:
        recipe_actions_route = next(
            route
            for route in router.routes
            if isinstance(route, APIRoute) and route.path == "/recipe-actions"
        )

        self.assertIn("PUT", recipe_actions_route.methods)

    def test_groceries_route_uses_get(self) -> None:
        groceries_route = next(
            route
            for route in router.routes
            if isinstance(route, APIRoute) and route.path == "/groceries"
        )

        self.assertIn("GET", groceries_route.methods)


class RecipeSocialActionTests(unittest.TestCase):
    def test_build_action_state_maps_action_types_to_flags(self) -> None:
        recipe_id = uuid4()

        self.assertEqual(
            build_action_state(recipe_id, ["like", "repost"]).model_dump(),
            {
                "recipe_id": recipe_id,
                "liked": True,
                "saved": False,
                "reposted": True,
            },
        )

    def test_update_recipe_social_action_adds_active_action(self) -> None:
        user = make_user()
        recipe = make_recipe()
        version = make_version(recipe)
        fake_session = FakeSession(
            [
                FakeResult(one_value=(recipe, version)),
                FakeResult(scalar_value=None),
                FakeResult(scalar_values=["like"]),
            ]
        )

        with patch("apps.api.src.api.routes.me.SessionLocal", return_value=fake_session):
            response = update_recipe_social_action(
                RecipeSocialActionRequest(
                    recipe_id=recipe.id,
                    action_type="like",
                    active=True,
                ),
                user.id,
            )

        self.assertTrue(fake_session.committed)
        self.assertEqual(len(fake_session.added_objects), 1)
        self.assertIsInstance(fake_session.added_objects[0], UserRecipeSocialAction)
        self.assertEqual(fake_session.added_objects[0].user_id, user.id)
        self.assertEqual(fake_session.added_objects[0].recipe_id, recipe.id)
        self.assertEqual(fake_session.added_objects[0].action_type, "like")
        self.assertTrue(response.liked)
        self.assertFalse(response.saved)
        self.assertFalse(response.reposted)

    def test_update_recipe_social_action_removes_inactive_action(self) -> None:
        user = make_user()
        recipe = make_recipe()
        version = make_version(recipe)
        existing_action = UserRecipeSocialAction(user_id=user.id, recipe_id=recipe.id, action_type="save")
        fake_session = FakeSession(
            [
                FakeResult(one_value=(recipe, version)),
                FakeResult(scalar_value=existing_action),
                FakeResult(scalar_values=[]),
            ]
        )

        with patch("apps.api.src.api.routes.me.SessionLocal", return_value=fake_session):
            response = update_recipe_social_action(
                RecipeSocialActionRequest(
                    recipe_id=recipe.id,
                    action_type="save",
                    active=False,
                ),
                user.id,
            )

        self.assertTrue(fake_session.committed)
        self.assertEqual(fake_session.deleted_objects, [existing_action])
        self.assertFalse(response.liked)
        self.assertFalse(response.saved)
        self.assertFalse(response.reposted)


class MeProfileTests(unittest.TestCase):
    def test_build_profile_response_groups_recipe_actions(self) -> None:
        user = make_user()
        liked_recipe = make_recipe("Tomato Toast")
        saved_recipe = make_recipe("Braised Beans")
        reposted_recipe = make_recipe("Citrus Salad")
        rows = [
            (UserRecipeSocialAction(user_id=user.id, recipe_id=liked_recipe.id, action_type="like"), liked_recipe, make_version(liked_recipe)),
            (UserRecipeSocialAction(user_id=user.id, recipe_id=saved_recipe.id, action_type="save"), saved_recipe, make_version(saved_recipe)),
            (UserRecipeSocialAction(user_id=user.id, recipe_id=reposted_recipe.id, action_type="repost"), reposted_recipe, make_version(reposted_recipe)),
        ]
        saved_version = make_version(saved_recipe)
        grocery_rows = [(saved_recipe, make_ingredient(saved_version, "2 cups cooked white beans"))]

        response = build_profile_response(user, rows, grocery_rows)

        self.assertEqual(response.user.display_name, "Chef Example")
        self.assertEqual([recipe.title for recipe in response.liked_recipes], ["Tomato Toast"])
        self.assertEqual([recipe.title for recipe in response.saved_recipes], ["Braised Beans"])
        self.assertEqual([recipe.title for recipe in response.reposted_recipes], ["Citrus Salad"])
        self.assertEqual(len(response.grocery_items), 1)
        self.assertEqual(response.grocery_items[0].text, "2 cups cooked white beans")
        self.assertEqual(response.grocery_items[0].recipe_title, "Braised Beans")

    def test_get_me_profile_loads_user_and_social_recipes(self) -> None:
        user = make_user()
        recipe = make_recipe("Tomato Toast")
        rows = [
            (UserRecipeSocialAction(user_id=user.id, recipe_id=recipe.id, action_type="like"), recipe, make_version(recipe)),
        ]
        fake_session = FakeSession(
            [
                FakeResult(scalar_value=user),
                FakeResult(all_values=rows),
                FakeResult(all_values=[]),
            ]
        )

        with patch("apps.api.src.api.routes.me.SessionLocal", return_value=fake_session):
            response = get_me_profile(user.id)

        self.assertEqual(response.user.email, "chef@example.test")
        self.assertEqual(len(response.liked_recipes), 1)
        self.assertEqual(response.liked_recipes[0].title, "Tomato Toast")
        self.assertEqual(response.grocery_items, [])


class MeGroceriesTests(unittest.TestCase):
    def test_normalize_ingredient_name_collapses_case_and_spaces(self) -> None:
        self.assertEqual(normalize_ingredient_name("  Two   Eggs  "), "two eggs")
        self.assertEqual(normalize_ingredient_name(None), "")

    def test_build_groceries_response_marks_saved_ingredients_in_pantry(self) -> None:
        user = make_user()
        recipe = make_recipe("Braised Beans")
        version = make_version(recipe)
        ingredient = make_ingredient(version, "2 cups cooked white beans")
        pantry_item = make_pantry_item(user, "2 cups cooked white beans")

        response = build_groceries_response([(recipe, ingredient)], [pantry_item])

        self.assertEqual(response.saved_recipe_count, 1)
        self.assertEqual(len(response.pantry_items), 1)
        self.assertEqual(response.required_ingredients[0].text, "2 cups cooked white beans")
        self.assertEqual(response.required_ingredients[0].normalized_name, "2 cups cooked white beans")
        self.assertTrue(response.required_ingredients[0].in_pantry)

    def test_get_me_groceries_loads_saved_ingredients_and_pantry_items(self) -> None:
        user = make_user()
        recipe = make_recipe("Tomato Toast")
        version = make_version(recipe)
        pantry_item = make_pantry_item(user)
        rows = [(recipe, make_ingredient(version))]
        fake_session = FakeSession(
            [
                FakeResult(scalar_value=user),
                FakeResult(all_values=rows),
                FakeResult(scalar_values=[pantry_item]),
            ]
        )

        with patch("apps.api.src.api.routes.me.SessionLocal", return_value=fake_session):
            response = get_me_groceries(user.id)

        self.assertEqual(response.saved_recipe_count, 1)
        self.assertEqual(response.pantry_items[0].ingredient_name, "2 slices sourdough")
        self.assertTrue(response.required_ingredients[0].in_pantry)

    def test_create_me_pantry_item_saves_normalized_ingredient(self) -> None:
        user = make_user()
        fake_session = FakeSession(
            [
                FakeResult(scalar_value=user),
                FakeResult(scalar_value=None),
            ]
        )

        with patch("apps.api.src.api.routes.me.SessionLocal", return_value=fake_session):
            response = create_me_pantry_item(PantryItemRequest(ingredient_name="  Fresh Eggs  "), user.id)

        self.assertTrue(fake_session.committed)
        self.assertEqual(len(fake_session.added_objects), 1)
        self.assertIsInstance(fake_session.added_objects[0], UserPantryItem)
        self.assertEqual(fake_session.added_objects[0].ingredient_name, "Fresh Eggs")
        self.assertEqual(fake_session.added_objects[0].normalized_name, "fresh eggs")
        self.assertEqual(response.normalized_name, "fresh eggs")

    def test_delete_me_pantry_item_removes_user_item(self) -> None:
        user = make_user()
        pantry_item = make_pantry_item(user, "Fresh Eggs")
        fake_session = FakeSession([FakeResult(scalar_value=pantry_item)])

        with patch("apps.api.src.api.routes.me.SessionLocal", return_value=fake_session):
            delete_me_pantry_item(pantry_item.id, user.id)

        self.assertTrue(fake_session.committed)
        self.assertEqual(fake_session.deleted_objects, [pantry_item])


class SocialHighlightsTests(unittest.TestCase):
    def test_build_social_action_stat_uses_action_copy(self) -> None:
        self.assertEqual(build_social_action_stat("like", 2), "2 liked this")
        self.assertEqual(build_social_action_stat("unknown", 1), "1 shared this")

    def test_serialize_social_highlight_uses_profile_and_recipe(self) -> None:
        user = make_user()
        recipe = make_recipe("Tomato Toast")
        version = make_version(recipe)
        action = UserRecipeSocialAction(user_id=user.id, recipe_id=recipe.id, action_type="save")

        response = serialize_social_highlight(
            social_action=action,
            user=user,
            profile=user.profile,
            recipe=recipe,
            version=version,
            stat_count=3,
        )

        self.assertEqual(response.name, "Chef Example")
        self.assertEqual(response.role, "Cookiful Cook")
        self.assertEqual(response.title, "Tomato Toast")
        self.assertEqual(response.stat, "3 saved this")
        self.assertEqual(response.avatar_letter, "C")


if __name__ == "__main__":
    unittest.main()
