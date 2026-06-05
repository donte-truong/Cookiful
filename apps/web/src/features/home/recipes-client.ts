import type { HomeRecipe } from "./home-data";
import { buildBrowserApiUrl } from "../api/client";
import { formatRecipeDurationLabel } from "../recipes/recipe-formatters";

export { formatRecipeDurationLabel };

export const HOME_CURATED_RECIPE_LIMIT = 4;
export const HOME_HERO_QUICK_ACTION_RECIPE_LIMIT = 3;
export const HOME_RECIPE_SEARCH_LIMIT = 5;

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

type FetchHeroQuickActionRecipesOptions = {
  limit?: number;
};

type FetchRecipeSearchOptions = {
  limit?: number;
  query: string;
};

type RecipeIdOnly = Pick<HomeRecipe, "id">;

export function buildClientApiUrl(
  path: string,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL,
): string {
  return buildBrowserApiUrl(path, apiBaseUrl);
}

export function buildCuratedRecipesUrl({
  excludeIds = [],
  limit = HOME_CURATED_RECIPE_LIMIT,
}: FetchCuratedRecipesOptions = {}): string {
  const params = new URLSearchParams({ limit: String(limit) });

  for (const recipeId of excludeIds) {
    params.append("exclude_id", recipeId);
  }

  return buildClientApiUrl(`/recipes/curated?${params.toString()}`);
}

export function buildRecipeSearchUrl({
  limit = HOME_RECIPE_SEARCH_LIMIT,
  query,
}: FetchRecipeSearchOptions): string {
  const params = new URLSearchParams({
    limit: String(limit),
    q: query,
  });

  return buildClientApiUrl(`/recipes/search?${params.toString()}`);
}

export function buildPantryMatchesUrl({
  limit = HOME_HERO_QUICK_ACTION_RECIPE_LIMIT,
}: FetchHeroQuickActionRecipesOptions = {}): string {
  const params = new URLSearchParams({ limit: String(limit) });

  return buildClientApiUrl(`/recipes/pantry-matches?${params.toString()}`);
}

export function buildQuickDinnerUrl({
  limit = HOME_HERO_QUICK_ACTION_RECIPE_LIMIT,
}: FetchHeroQuickActionRecipesOptions = {}): string {
  const params = new URLSearchParams({ limit: String(limit) });

  return buildClientApiUrl(`/recipes/quick-dinner?${params.toString()}`);
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
  recipes: RecipeIdOnly[],
): string[] {
  const nextExcludedIds = new Set(excludedIds);

  for (const recipe of recipes) {
    nextExcludedIds.add(recipe.id);
  }

  return Array.from(nextExcludedIds);
}

export function flattenCuratedRecipePages(pages: HomeRecipe[][] = []): HomeRecipe[] {
  return pages.flat();
}

export function buildNextCuratedRecipesPageParam(
  pages: HomeRecipe[][],
  limit = HOME_CURATED_RECIPE_LIMIT,
): string[] | undefined {
  const lastPage = pages.at(-1) ?? [];
  if (lastPage.length < limit) {
    return undefined;
  }

  return mergeExcludedRecipeIds([], pages.flat());
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

export async function fetchRecipeSearch(
  options: FetchRecipeSearchOptions,
): Promise<HomeRecipe[]> {
  const response = await fetch(buildRecipeSearchUrl(options), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to search recipes.");
  }

  const payload = (await response.json()) as CuratedRecipesApiResponse;
  return payload.recipes.map(toHomeRecipe);
}

export async function fetchPantryMatchRecipes(
  options: FetchHeroQuickActionRecipesOptions = {},
): Promise<HomeRecipe[]> {
  const response = await fetch(buildPantryMatchesUrl(options), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load pantry matches.");
  }

  const payload = (await response.json()) as CuratedRecipesApiResponse;
  return payload.recipes.map(toHomeRecipe);
}

export async function fetchQuickDinnerRecipes(
  options: FetchHeroQuickActionRecipesOptions = {},
): Promise<HomeRecipe[]> {
  const response = await fetch(buildQuickDinnerUrl(options), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load quick dinner recipes.");
  }

  const payload = (await response.json()) as CuratedRecipesApiResponse;
  return payload.recipes.map(toHomeRecipe);
}
