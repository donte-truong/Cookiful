from cookiful_db.database import SessionLocal
from cookiful_db.models import Recipe, RecipeIngredient, RecipeStatus, RecipeStep, RecipeVersion, RecipeVisibility, User, UserProfile


def seed_demo_data() -> None:
    with SessionLocal() as session:
        existing_user = session.query(User).filter(User.email == "demo@cookiful.app").one_or_none()
        if existing_user is not None:
            print("Seed data already present.")
            return

        user = User(
            email="demo@cookiful.app",
            username="cookiful-demo",
            password_hash="replace-me",
        )
        user.profile = UserProfile(
            display_name="Cookiful Demo",
            skill_level="intermediate",
            timezone="America/New_York",
            locale="en-US",
        )
        session.add(user)
        session.flush()

        recipe = Recipe(
            author_user_id=user.id,
            title="Weeknight Lemon Pasta",
            description="A quick pasta starter recipe for the Cookiful foundation.",
            source_url="https://cookiful.app/demo/weeknight-lemon-pasta",
            source_name="Cookiful Seed",
            source_site="cookiful.app",
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

        session.commit()
        print("Inserted Cookiful seed data.")


def main() -> None:
    seed_demo_data()


if __name__ == "__main__":
    main()
