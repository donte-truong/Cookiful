"use client";

import { useQuery } from "@tanstack/react-query";
import { startTransition, useState } from "react";

import {
  fetchCuratedRecipes,
  HOME_CURATED_RECIPE_LIMIT,
  mergeExcludedRecipeIds,
} from "../recipes-client";
import { ChevronDownIcon } from "./home-icons";
import { HomeEditorialCard } from "./home-editorial-card";
import { HomeRecipeCard } from "./home-recipe-card";

export function HomeCuratedSection() {
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const curatedRecipesQuery = useQuery({
    queryKey: ["home-curated-recipes", excludeIds],
    queryFn: () =>
      fetchCuratedRecipes({
        excludeIds,
        limit: HOME_CURATED_RECIPE_LIMIT,
      }),
    placeholderData: (previousData) => previousData,
  });
  const curatedRecipes = curatedRecipesQuery.data ?? [];
  const hasRecipes = curatedRecipes.length > 0;
  const isInitialLoad = curatedRecipesQuery.isLoading && curatedRecipes.length === 0;

  function handleLoadMore() {
    if (curatedRecipes.length === 0) {
      if (excludeIds.length > 0) {
        startTransition(() => {
          setExcludeIds([]);
        });
        return;
      }

      void curatedRecipesQuery.refetch();
      return;
    }

    startTransition(() => {
      setExcludeIds((currentExcludeIds) =>
        mergeExcludedRecipeIds(currentExcludeIds, curatedRecipes),
      );
    });
  }

  return (
    <section className="pb-20 pt-4 sm:pb-24" id="curated-feed">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="mb-7">
            <h2 className="font-display text-[clamp(2rem,4vw,2.8rem)] tracking-[-0.04em] text-hearth-text">
              Curated for your palate
            </h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-hearth-outline">
              Based on your recent French technique study
            </p>
          </div>

          <div className="lg:max-h-[52rem] lg:overflow-y-auto lg:pr-4 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-hearth-copper/25 lg:[&::-webkit-scrollbar-track]:bg-hearth-container lg:[&::-webkit-scrollbar]:w-1.5">
            <div className="grid gap-6 md:grid-cols-2">
              {isInitialLoad
                ? Array.from({ length: HOME_CURATED_RECIPE_LIMIT }, (_, index) => (
                    <div
                      key={`curated-recipe-skeleton-${index}`}
                      aria-hidden="true"
                      className="h-[27rem] animate-pulse rounded-[1.8rem] bg-hearth-paper/70 shadow-hearth"
                    />
                  ))
                : hasRecipes
                  ? curatedRecipes.map((recipe) => (
                      <HomeRecipeCard key={recipe.id} recipe={recipe} />
                    ))
                  : (
                      <div className="rounded-[1.8rem] bg-hearth-paper px-6 py-10 text-center text-sm leading-7 text-hearth-muted shadow-hearth md:col-span-2">
                        Curated recipes will appear here as soon as the recipe
                        database has published entries ready to browse.
                      </div>
                    )}
            </div>
          </div>

          {curatedRecipesQuery.isError ? (
            <p className="mt-6 text-sm text-hearth-muted">
              Live recipes are unavailable right now. Start the API and recipe
              database, then try again.
            </p>
          ) : null}

          <div className="mt-8 flex justify-center">
            <button
              className="group inline-flex items-center gap-2 text-sm font-bold text-hearth-copper transition hover:gap-3 hover:text-hearth-copperSoft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:gap-2"
              disabled={curatedRecipesQuery.isFetching}
              onClick={handleLoadMore}
              type="button"
            >
              <span>
                {curatedRecipesQuery.isFetching
                  ? "Refreshing inspiration..."
                  : "Load more inspiration"}
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <HomeEditorialCard />
        </div>
      </div>
    </section>
  );
}
