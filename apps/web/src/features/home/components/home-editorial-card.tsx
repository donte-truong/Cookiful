import Link from "next/link";

import type { HomeRecipe } from "../home-data";
import { ShoppingBagIcon } from "./home-icons";

type HomeEditorialCardProps = {
  recipes: HomeRecipe[];
  isLoading?: boolean;
};

function EditorialRecipeSkeleton({ index }: { index: number }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hearth-high text-sm font-bold text-hearth-copper">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <div className="recipe-card-loading-line h-4 w-3/4 rounded-full" />
        <div className="recipe-card-loading-line mt-3 h-3 w-full rounded-full" />
        <div className="recipe-card-loading-line mt-2 h-3 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

export function HomeEditorialCard({ recipes, isLoading = false }: HomeEditorialCardProps) {
  return (
    <aside className="rounded-[2rem] bg-copper-gradient p-[1px] shadow-hearth">
      <div className="rounded-[calc(2rem-1px)] bg-hearth-paper px-6 py-7 sm:px-8 sm:py-9">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.32em] text-hearth-copper">
          Editorial Recommendation
        </span>
        <h3 className="mt-4 font-display text-[2rem] leading-tight text-hearth-text">
          Three recipes to try next
        </h3>

        <div className="mt-8 space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }, (_, index) => (
              <EditorialRecipeSkeleton index={index} key={`editorial-recipe-skeleton-${index}`} />
            ))
          ) : null}

          {!isLoading && recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <Link
                className="group flex items-start gap-4"
                href={`/recipes/${recipe.id}`}
                key={recipe.id}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hearth-high text-sm font-bold text-hearth-copper transition group-hover:bg-hearth-copper group-hover:text-white">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-hearth-text">
                    {recipe.title}
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-hearth-muted">
                    {recipe.description}
                  </p>
                </div>
              </Link>
            ))
          ) : null}

          {!isLoading && recipes.length === 0 ? (
            <p className="text-sm leading-7 text-hearth-muted">
              Random recipes will appear here once the curated feed is ready.
            </p>
          ) : null}
        </div>

        <Link
          className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] bg-copper-gradient px-5 py-4 text-sm font-bold text-white shadow-hearth transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
          href="/groceries"
        >
          <ShoppingBagIcon className="h-4 w-4" />
          View Shopping List
        </Link>
      </div>
    </aside>
  );
}
