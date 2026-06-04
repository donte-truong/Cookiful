import { getRecipesApiBaseUrl } from "../../app/api/recipes/curated/route-config";
import { formatRecipeDurationLabel } from "./recipe-formatters";

export type RecipeDetailApiRecord = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  tag: string;
  image_url: string | null;
  image_alt: string;
  source_name: string | null;
  source_url: string | null;
  ingredients: string[];
  instructions: string[];
};

export type RecipeDetail = {
  id: string;
  title: string;
  description: string;
  duration: string;
  tag: string;
  image: string | null;
  imageAlt: string;
  sourceName: string | null;
  sourceUrl: string | null;
  ingredients: string[];
  instructions: string[];
};

type FetchRecipeDetailOptions = {
  apiBaseUrl?: string;
  fetcher?: typeof fetch;
};

export function buildRecipeDetailApiUrl(
  recipeId: string,
  apiBaseUrl = getRecipesApiBaseUrl(),
): string {
  return `${apiBaseUrl}/recipes/${encodeURIComponent(recipeId)}`;
}

export function toRecipeDetail(recipe: RecipeDetailApiRecord): RecipeDetail {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    duration: formatRecipeDurationLabel(recipe.duration_minutes),
    tag: recipe.tag,
    image: recipe.image_url,
    imageAlt: recipe.image_alt,
    sourceName: recipe.source_name,
    sourceUrl: recipe.source_url,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
  };
}

export async function fetchRecipeDetail(
  recipeId: string,
  { apiBaseUrl, fetcher = fetch }: FetchRecipeDetailOptions = {},
): Promise<RecipeDetail | null> {
  const response = await fetcher(buildRecipeDetailApiUrl(recipeId, apiBaseUrl), {
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load recipe detail.");
  }

  const payload = (await response.json()) as RecipeDetailApiRecord;
  return toRecipeDetail(payload);
}
