import { notFound } from "next/navigation";

import { RecipeDetailPage, fetchRecipeDetail } from "../../../features/recipes";

const STATIC_EXPORT_PLACEHOLDER_RECIPE_ID = "__static_export_placeholder__";

type RecipeDetailRouteProps = {
  params: Promise<{
    recipeId: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ recipeId: string }>> {
  return [{ recipeId: STATIC_EXPORT_PLACEHOLDER_RECIPE_ID }];
}

export default async function RecipeDetailRoute({
  params,
}: RecipeDetailRouteProps) {
  const { recipeId } = await params;

  if (recipeId === STATIC_EXPORT_PLACEHOLDER_RECIPE_ID) {
    notFound();
  }

  const recipe = await fetchRecipeDetail(recipeId);

  if (recipe === null) {
    notFound();
  }

  return <RecipeDetailPage recipe={recipe} />;
}
