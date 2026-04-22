import type { HomeRecipe } from "./home-data";

export const HOME_CURATED_RECIPE_LIMIT = 4;

export type CuratedRecipeApiRecord = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  tag: string;
  image_url: string | null;
  image_alt: string;
  source_name: string | null;
  source_url: string | null;
};

type CuratedRecipesApiResponse = {
  recipes: CuratedRecipeApiRecord[];
};

type FetchCuratedRecipesOptions = {
  excludeIds?: string[];
  limit?: number;
};

export function formatRecipeDurationLabel(durationMinutes: number): string {
  return `${Math.max(1, durationMinutes)} MIN`;
}

export function buildCuratedRecipesUrl({
  excludeIds = [],
  limit = HOME_CURATED_RECIPE_LIMIT,
}: FetchCuratedRecipesOptions = {}): string {
  const params = new URLSearchParams({ limit: String(limit) });

  for (const recipeId of excludeIds) {
    params.append("exclude_id", recipeId);
  }

  return `/api/recipes/curated?${params.toString()}`;
}

export function toHomeRecipe(recipe: CuratedRecipeApiRecord): HomeRecipe {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    duration: formatRecipeDurationLabel(recipe.duration_minutes),
    tag: recipe.tag,
    image: recipe.image_url,
    alt: recipe.image_alt,
    sourceName: recipe.source_name,
    sourceUrl: recipe.source_url,
  };
}

export function mergeExcludedRecipeIds(
  excludedIds: string[],
  recipes: Array<Pick<HomeRecipe, "id">>,
): string[] {
  const nextExcludedIds = new Set(excludedIds);

  for (const recipe of recipes) {
    nextExcludedIds.add(recipe.id);
  }

  return Array.from(nextExcludedIds);
}

export async function fetchCuratedRecipes(
  options: FetchCuratedRecipesOptions = {},
): Promise<HomeRecipe[]> {
  const response = await fetch(buildCuratedRecipesUrl(options), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load curated recipes.");
  }

  const payload = (await response.json()) as CuratedRecipesApiResponse;
  return payload.recipes.map(toHomeRecipe);
}
