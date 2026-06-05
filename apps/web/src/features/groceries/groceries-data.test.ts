import { describe, expect, it } from "vitest";

import { groupRequiredIngredientsByRecipe, toGroceriesData } from "./groceries-data";

describe("toGroceriesData", () => {
  it("maps grocery payloads into display data", () => {
    expect(
      toGroceriesData({
        pantry_items: [
          {
            id: "pantry-1",
            ingredient_name: "Fresh Eggs",
            normalized_name: "fresh eggs",
          },
        ],
        required_ingredients: [
          {
            id: "recipe-1:ingredient-1",
            text: "Fresh Eggs",
            normalized_name: "fresh eggs",
            recipe_id: "recipe-1",
            recipe_title: "Tomato Toast",
            in_pantry: true,
          },
        ],
        saved_recipe_count: 1,
      }),
    ).toEqual({
      pantryItems: [
        {
          id: "pantry-1",
          ingredientName: "Fresh Eggs",
          normalizedName: "fresh eggs",
        },
      ],
      requiredIngredients: [
        {
          id: "recipe-1:ingredient-1",
          text: "Fresh Eggs",
          normalizedName: "fresh eggs",
          recipeId: "recipe-1",
          recipeTitle: "Tomato Toast",
          inPantry: true,
        },
      ],
      savedRecipeCount: 1,
    });
  });
});

describe("groupRequiredIngredientsByRecipe", () => {
  it("groups ingredients by recipe and tracks pantry coverage", () => {
    expect(
      groupRequiredIngredientsByRecipe([
        {
          id: "recipe-1:ingredient-1",
          text: "Fresh Eggs",
          normalizedName: "fresh eggs",
          recipeId: "recipe-1",
          recipeTitle: "Tomato Toast",
          inPantry: true,
        },
        {
          id: "recipe-1:ingredient-2",
          text: "2 slices sourdough",
          normalizedName: "2 slices sourdough",
          recipeId: "recipe-1",
          recipeTitle: "Tomato Toast",
          inPantry: false,
        },
        {
          id: "recipe-2:ingredient-1",
          text: "1 cup cooked beans",
          normalizedName: "1 cup cooked beans",
          recipeId: "recipe-2",
          recipeTitle: "Braised Beans",
          inPantry: false,
        },
      ]),
    ).toMatchObject([
      {
        recipeId: "recipe-1",
        recipeTitle: "Tomato Toast",
        totalCount: 2,
        inPantryCount: 1,
        missingCount: 1,
      },
      {
        recipeId: "recipe-2",
        recipeTitle: "Braised Beans",
        totalCount: 1,
        inPantryCount: 0,
        missingCount: 1,
      },
    ]);
  });
});
