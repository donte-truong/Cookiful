import type { RecipeDetail } from "../recipe-detail-data";
import { RecipeDetailHero } from "./recipe-detail-hero";
import { RecipeDetailSections } from "./recipe-detail-sections";

type RecipeDetailPageProps = {
  recipe: RecipeDetail;
};

export function RecipeDetailPage({ recipe }: RecipeDetailPageProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-hearth-surface text-hearth-text">
      <RecipeDetailHero recipe={recipe} />
      <RecipeDetailSections recipe={recipe} />
    </main>
  );
}
