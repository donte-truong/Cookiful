import { notFound } from "next/navigation";

import { RecipeDetailPage, fetchRecipeDetail } from "../../../features/recipes";

type RecipeDetailRouteProps = {
  params: Promise<{
    recipeId: string;
  }>;
};

export default async function RecipeDetailRoute({
  params,
}: RecipeDetailRouteProps) {
  const { recipeId } = await params;
  const recipe = await fetchRecipeDetail(recipeId);

  if (recipe === null) {
    notFound();
  }

  return <RecipeDetailPage recipe={recipe} />;
}
