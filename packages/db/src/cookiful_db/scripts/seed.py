from __future__ import annotations

from collections.abc import Iterable

from apps.api.src.api.routes.auth import hash_password
from cookiful_db.database import SessionLocal
from cookiful_db.models import (
    Recipe,
    RecipeIngredient,
    RecipeStatus,
    RecipeStep,
    RecipeVersion,
    RecipeVisibility,
    User,
    UserPreference,
    UserProfile,
    UserRecipeSocialAction,
)


DEMO_PASSWORD = "cookiful-demo"

SEED_USERS = [
    {
        "email": "demo@cookiful.app",
        "username": "cookiful-demo",
        "display_name": "Cookiful Demo",
        "bio": "Testing the kitchen table from every angle.",
        "skill_level": "intermediate",
        "timezone": "America/New_York",
        "locale": "en-US",
        "cuisines": ["Italian-inspired", "weeknight"],
    },
    {
        "email": "mara@cookiful.app",
        "username": "mara-ferments",
        "display_name": "Mara Chen",
        "bio": "Fermentation tinkerer chasing bright crunch and deep umami.",
        "skill_level": "advanced",
        "timezone": "America/Los_Angeles",
        "locale": "en-US",
        "cuisines": ["Korean", "Japanese", "pickles"],
    },
    {
        "email": "sol@cookiful.app",
        "username": "sol-skillet",
        "display_name": "Sol Rivera",
        "bio": "Weeknight cook, farmers market loyalist, sauce maximalist.",
        "skill_level": "intermediate",
        "timezone": "America/Chicago",
        "locale": "en-US",
        "cuisines": ["Mexican", "Mediterranean", "one-pan"],
    },
    {
        "email": "nora@cookiful.app",
        "username": "nora-bakes",
        "display_name": "Nora Bell",
        "bio": "Bakes by weight, saves by instinct.",
        "skill_level": "beginner",
        "timezone": "America/New_York",
        "locale": "en-US",
        "cuisines": ["baking", "French", "breakfast"],
    },
]

SOCIAL_ACTION_ROTATION = (
    ("mara@cookiful.app", ("like", "save")),
    ("sol@cookiful.app", ("save", "repost")),
    ("nora@cookiful.app", ("like", "repost")),
    ("demo@cookiful.app", ("save",)),
)


def upsert_seed_user(session, seed_user: dict[str, object], password_hash: str) -> User:
    user = session.query(User).filter(User.email == seed_user["email"]).one_or_none()
    if user is None:
        user = User(
            email=str(seed_user["email"]),
            username=str(seed_user["username"]),
            password_hash=password_hash,
        )
        session.add(user)
        session.flush()
    else:
        user.username = str(seed_user["username"])
        user.password_hash = password_hash

    if user.profile is None:
        user.profile = UserProfile()

    user.profile.display_name = str(seed_user["display_name"])
    user.profile.bio = str(seed_user["bio"])
    user.profile.skill_level = str(seed_user["skill_level"])
    user.profile.timezone = str(seed_user["timezone"])
    user.profile.locale = str(seed_user["locale"])

    if user.preferences is None:
        user.preferences = UserPreference()

    user.preferences.cuisine_preferences = list(seed_user["cuisines"])  # type: ignore[arg-type]
    user.preferences.household_size = 2
    user.preferences.max_prep_time_minutes = 45

    return user


def ensure_demo_recipe(session, author: User) -> Recipe:
    recipe = session.query(Recipe).filter(Recipe.source_url == "https://cookiful.app/demo/weeknight-lemon-pasta").one_or_none()
    if recipe is not None:
        return recipe

    recipe = Recipe(
        author_user_id=author.id,
        title="Weeknight Lemon Pasta",
        description="A quick pasta starter recipe for the Cookiful foundation.",
        source_url="https://cookiful.app/demo/weeknight-lemon-pasta",
        source_name="Cookiful Seed",
        source_site="cookiful.app",
        hero_image_url="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
        status=RecipeStatus.PUBLISHED,
        visibility=RecipeVisibility.PUBLIC,
        cuisine_type="Italian-inspired",
        meal_type="dinner",
        difficulty_level="easy",
        prep_time_minutes=10,
        cook_time_minutes=15,
        total_time_minutes=25,
        servings_default=2,
    )
    session.add(recipe)
    session.flush()

    version = RecipeVersion(
        recipe_id=recipe.id,
        version_number=1,
        schema_version="1.0.0",
        raw_ingredients=["8 oz spaghetti", "1 lemon", "2 tbsp olive oil"],
        raw_directions=[
            "Boil salted water and cook the pasta until al dente.",
            "Toss pasta with lemon zest, juice, olive oil, and seasoning.",
        ],
        raw_ner=["spaghetti", "lemon", "olive oil"],
    )
    session.add(version)
    session.flush()

    recipe.current_version_id = version.id

    session.add_all(
        [
            RecipeIngredient(recipe_version_id=version.id, ingredient_text="8 oz spaghetti", ner_name="spaghetti", sort_order=1),
            RecipeIngredient(recipe_version_id=version.id, ingredient_text="1 lemon", ner_name="lemon", sort_order=2),
            RecipeIngredient(recipe_version_id=version.id, ingredient_text="2 tbsp olive oil", ner_name="olive oil", sort_order=3),
            RecipeStep(recipe_version_id=version.id, step_number=1, instruction_text="Boil salted water and cook the pasta until al dente.", sort_order=1),
            RecipeStep(recipe_version_id=version.id, step_number=2, instruction_text="Toss pasta with lemon zest, juice, olive oil, and seasoning.", sort_order=2),
        ]
    )
    return recipe


def list_seedable_recipes(session) -> list[Recipe]:
    return (
        session.query(Recipe)
        .filter(
            Recipe.status == RecipeStatus.PUBLISHED,
            Recipe.visibility == RecipeVisibility.PUBLIC,
            Recipe.current_version_id.isnot(None),
        )
        .order_by(Recipe.created_at.desc())
        .limit(8)
        .all()
    )


def ensure_social_action(session, user: User, recipe: Recipe, action_type: str) -> None:
    existing_action = (
        session.query(UserRecipeSocialAction)
        .filter(
            UserRecipeSocialAction.user_id == user.id,
            UserRecipeSocialAction.recipe_id == recipe.id,
            UserRecipeSocialAction.action_type == action_type,
        )
        .one_or_none()
    )
    if existing_action is None:
        session.add(UserRecipeSocialAction(user_id=user.id, recipe_id=recipe.id, action_type=action_type))


def seed_social_actions(session, users_by_email: dict[str, User], recipes: Iterable[Recipe]) -> None:
    recipe_list = list(recipes)
    if not recipe_list:
        return

    for user_index, (email, action_types) in enumerate(SOCIAL_ACTION_ROTATION):
        user = users_by_email[email]
        for action_index, action_type in enumerate(action_types):
            recipe = recipe_list[(user_index + action_index) % len(recipe_list)]
            ensure_social_action(session, user, recipe, action_type)


def seed_demo_data() -> None:
    with SessionLocal() as session:
        password_hash = hash_password(DEMO_PASSWORD)
        users_by_email = {str(seed_user["email"]): upsert_seed_user(session, seed_user, password_hash) for seed_user in SEED_USERS}
        session.flush()

        demo_recipe = ensure_demo_recipe(session, users_by_email["demo@cookiful.app"])
        session.flush()

        recipes = list_seedable_recipes(session)
        if demo_recipe not in recipes:
            recipes.append(demo_recipe)

        seed_social_actions(session, users_by_email, recipes)
        session.commit()

    print("Inserted or updated Cookiful seed data.")
    print("Seeded login credentials:")
    for seed_user in SEED_USERS:
        print(f"  {seed_user['email']} / {DEMO_PASSWORD}")


def main() -> None:
    seed_demo_data()


if __name__ == "__main__":
    main()
