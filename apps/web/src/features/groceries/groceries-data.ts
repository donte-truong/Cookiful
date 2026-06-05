import { buildBrowserApiUrl } from "../api/client";
import { getStoredAccessToken } from "../auth/session";

type PantryItemApiRecord = {
  id: string;
  ingredient_name: string;
  normalized_name: string;
};

type RequiredIngredientApiRecord = {
  id: string;
  text: string;
  normalized_name: string;
  recipe_id: string;
  recipe_title: string;
  in_pantry: boolean;
};

type GroceriesApiResponse = {
  pantry_items: PantryItemApiRecord[];
  required_ingredients: RequiredIngredientApiRecord[];
  saved_recipe_count: number;
};

export type PantryItem = {
  id: string;
  ingredientName: string;
  normalizedName: string;
};

export type RequiredIngredient = {
  id: string;
  text: string;
  normalizedName: string;
  recipeId: string;
  recipeTitle: string;
  inPantry: boolean;
};

export type RequiredIngredientGroup = {
  recipeId: string;
  recipeTitle: string;
  ingredients: RequiredIngredient[];
  totalCount: number;
  inPantryCount: number;
  missingCount: number;
};

export type GroceriesData = {
  pantryItems: PantryItem[];
  requiredIngredients: RequiredIngredient[];
  savedRecipeCount: number;
};

export const EMPTY_GROCERIES_DATA: GroceriesData = {
  pantryItems: [],
  requiredIngredients: [],
  savedRecipeCount: 0,
};

export function toGroceriesData(payload: GroceriesApiResponse): GroceriesData {
  return {
    pantryItems: payload.pantry_items.map((item) => ({
      id: item.id,
      ingredientName: item.ingredient_name,
      normalizedName: item.normalized_name,
    })),
    requiredIngredients: payload.required_ingredients.map((item) => ({
      id: item.id,
      text: item.text,
      normalizedName: item.normalized_name,
      recipeId: item.recipe_id,
      recipeTitle: item.recipe_title,
      inPantry: item.in_pantry,
    })),
    savedRecipeCount: payload.saved_recipe_count,
  };
}

export function groupRequiredIngredientsByRecipe(
  ingredients: RequiredIngredient[],
): RequiredIngredientGroup[] {
  const groups = new Map<string, RequiredIngredientGroup>();

  for (const ingredient of ingredients) {
    const existingGroup = groups.get(ingredient.recipeId);
    const group =
      existingGroup ??
      {
        recipeId: ingredient.recipeId,
        recipeTitle: ingredient.recipeTitle,
        ingredients: [],
        totalCount: 0,
        inPantryCount: 0,
        missingCount: 0,
      };

    group.ingredients.push(ingredient);
    group.totalCount += 1;
    group.inPantryCount += ingredient.inPantry ? 1 : 0;
    group.missingCount = group.totalCount - group.inPantryCount;
    groups.set(ingredient.recipeId, group);
  }

  return Array.from(groups.values());
}

export async function fetchGroceriesData(accessToken: string): Promise<GroceriesData> {
  const response = await fetch(buildBrowserApiUrl("/me/groceries"), {
    cache: "no-store",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load groceries.");
  }

  return toGroceriesData((await response.json()) as GroceriesApiResponse);
}

export async function fetchStoredGroceriesData(): Promise<GroceriesData | null> {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    return null;
  }

  return fetchGroceriesData(accessToken);
}
