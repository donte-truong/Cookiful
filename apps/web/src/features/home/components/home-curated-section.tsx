"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import {
  buildNextCuratedRecipesPageParam,
  fetchCuratedRecipes,
  flattenCuratedRecipePages,
  HOME_CURATED_RECIPE_LIMIT,
} from "../recipes-client";
import { ChevronDownIcon } from "./home-icons";
import { HomeEditorialCard } from "./home-editorial-card";
import { HomeRecipeCard, HomeRecipeCardSkeleton } from "./home-recipe-card";

function CuratedRecipeSkeletonGrid({ prefix }: { prefix: string }) {
  return Array.from({ length: HOME_CURATED_RECIPE_LIMIT }, (_, index) => (
    <HomeRecipeCardSkeleton key={`${prefix}-${index}`} />
  ));
}

function getLoadMoreLabel({
  hasMoreRecipes,
  isInitialLoad,
  isLoadingMore,
}: {
  hasMoreRecipes: boolean;
  isInitialLoad: boolean;
  isLoadingMore: boolean;
}): string {
  if (isInitialLoad) {
    return "Loading inspiration...";
  }

  if (isLoadingMore) {
    return "Loading more inspiration...";
  }

  if (!hasMoreRecipes) {
    return "All inspiration loaded";
  }

  return "Load more inspiration";
}

export function HomeCuratedSection() {
  const feedScrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollAfterLoadRef = useRef(false);
  const pageCountBeforeLoadRef = useRef(0);
  const curatedRecipesQuery = useInfiniteQuery({
    queryKey: ["home-curated-recipes"],
    queryFn: ({ pageParam }) =>
      fetchCuratedRecipes({
        excludeIds: pageParam,
        limit: HOME_CURATED_RECIPE_LIMIT,
      }),
    initialPageParam: [] as string[],
    getNextPageParam: (_lastPage, allPages) =>
      buildNextCuratedRecipesPageParam(allPages, HOME_CURATED_RECIPE_LIMIT),
  });
  const curatedRecipes = flattenCuratedRecipePages(curatedRecipesQuery.data?.pages);
  const hasRecipes = curatedRecipes.length > 0;
  const isInitialLoad = curatedRecipesQuery.isLoading && curatedRecipes.length === 0;
  const isLoadingMore = curatedRecipesQuery.isFetchingNextPage;
  const hasMoreRecipes = curatedRecipesQuery.hasNextPage;
  const loadMoreLabel = getLoadMoreLabel({
    hasMoreRecipes,
    isInitialLoad,
    isLoadingMore,
  });
  const loadedPageCount = curatedRecipesQuery.data?.pages.length ?? 0;

  function handleLoadMore() {
    shouldScrollAfterLoadRef.current = true;
    pageCountBeforeLoadRef.current = loadedPageCount;
    void curatedRecipesQuery.fetchNextPage();
  }

  useEffect(() => {
    if (!shouldScrollAfterLoadRef.current || isLoadingMore) {
      return;
    }

    if (loadedPageCount <= pageCountBeforeLoadRef.current) {
      shouldScrollAfterLoadRef.current = false;
      return;
    }

    shouldScrollAfterLoadRef.current = false;
    window.requestAnimationFrame(() => {
      const feedScrollContainer = feedScrollContainerRef.current;

      feedScrollContainer?.scrollTo({
        top: feedScrollContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [isLoadingMore, loadedPageCount]);

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

          <div
            className="lg:max-h-[52rem] lg:overflow-y-auto lg:pr-4 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-hearth-copper/25 lg:[&::-webkit-scrollbar-track]:bg-hearth-container lg:[&::-webkit-scrollbar]:w-1.5"
            ref={feedScrollContainerRef}
          >
            <div className="grid gap-6 md:grid-cols-2">
              {isInitialLoad ? (
                <CuratedRecipeSkeletonGrid prefix="curated-recipe-skeleton" />
              ) : null}

              {!isInitialLoad && hasRecipes ? (
                <>
                  {curatedRecipes.map((recipe) => (
                    <HomeRecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                  {isLoadingMore ? (
                    <CuratedRecipeSkeletonGrid prefix="curated-recipe-load-more-skeleton" />
                  ) : null}
                </>
              ) : null}

              {!isInitialLoad && !hasRecipes ? (
                <div className="rounded-[1.8rem] bg-hearth-paper px-6 py-10 text-center text-sm leading-7 text-hearth-muted shadow-hearth md:col-span-2">
                  Curated recipes will appear here as soon as the recipe database
                  has published entries ready to browse.
                </div>
              ) : null}
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
              disabled={curatedRecipesQuery.isFetching || !hasMoreRecipes}
              onClick={handleLoadMore}
              type="button"
            >
              <span>{loadMoreLabel}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <HomeEditorialCard
            isLoading={isInitialLoad}
            recipes={curatedRecipes.slice(0, 3)}
          />
        </div>
      </div>
    </section>
  );
}
