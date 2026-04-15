import sys

from sqlalchemy import text

from cookiful_db.database import engine


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python -m cookiful_db.scripts.inspect_recipe_detail <recipe_title>")

    title = sys.argv[1]

    recipe_query = text(
        """
        SELECT id, title, source_name, source_site, source_url, current_version_id
        FROM recipes
        WHERE title = :title
        LIMIT 1
        """
    )

    ingredients_query = text(
        """
        SELECT ri.sort_order, ri.ingredient_text, ri.ner_name
        FROM recipe_ingredients ri
        JOIN recipe_versions rv ON rv.id = ri.recipe_version_id
        JOIN recipes r ON r.current_version_id = rv.id
        WHERE r.id = :recipe_id
        ORDER BY ri.sort_order
        """
    )

    steps_query = text(
        """
        SELECT rs.step_number, rs.instruction_text
        FROM recipe_steps rs
        JOIN recipe_versions rv ON rv.id = rs.recipe_version_id
        JOIN recipes r ON r.current_version_id = rv.id
        WHERE r.id = :recipe_id
        ORDER BY rs.step_number
        """
    )

    with engine.connect() as connection:
        recipe = connection.execute(recipe_query, {"title": title}).mappings().first()
        if recipe is None:
            print(f"No recipe found with title: {title}")
            return

        ingredients = connection.execute(ingredients_query, {"recipe_id": recipe["id"]}).mappings().all()
        steps = connection.execute(steps_query, {"recipe_id": recipe["id"]}).mappings().all()

    print(f"Recipe: {recipe['title']}")
    print(f"Source: {recipe['source_name']} ({recipe['source_site']})")
    print(f"URL: {recipe['source_url']}")
    print("")
    print("Ingredients")
    for ingredient in ingredients:
        ner_suffix = f" [{ingredient['ner_name']}]" if ingredient["ner_name"] else ""
        print(f"{ingredient['sort_order']}. {ingredient['ingredient_text']}{ner_suffix}")

    print("")
    print("Steps")
    for step in steps:
        print(f"{step['step_number']}. {step['instruction_text']}")


if __name__ == "__main__":
    main()
