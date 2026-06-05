"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { homeQuickActions } from "../home-data";
import type { HomeRecipe } from "../home-data";
import { fetchRecipeSearch, HOME_RECIPE_SEARCH_LIMIT } from "../recipes-client";
import { SearchAccentIcon } from "./home-icons";

type RecipeSearchState = "idle" | "loading" | "success" | "empty" | "error";

export function HomeHeroSection() {
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<RecipeSearchState>("idle");
  const [searchResults, setSearchResults] = useState<HomeRecipe[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const latestSearchIdRef = useRef(0);

  const performSearch = useCallback(async (rawQuery: string, isSubmitted = false) => {
    const nextQuery = rawQuery.trim();

    if (!nextQuery || (!isSubmitted && nextQuery.length < 2)) {
      latestSearchIdRef.current += 1;
      setSearchResults([]);
      setErrorMessage("");
      setSearchState("idle");
      return;
    }

    const searchId = latestSearchIdRef.current + 1;
    latestSearchIdRef.current = searchId;
    setSearchState("loading");
    setErrorMessage("");

    try {
      const recipes = await fetchRecipeSearch({
        limit: HOME_RECIPE_SEARCH_LIMIT,
        query: nextQuery,
      });

      if (latestSearchIdRef.current !== searchId) {
        return;
      }

      setSearchResults(recipes);
      setSearchState(recipes.length > 0 ? "success" : "empty");
    } catch {
      if (latestSearchIdRef.current !== searchId) {
        return;
      }

      setSearchResults([]);
      setErrorMessage("Recipe search is taking a breather. Try again in a moment.");
      setSearchState("error");
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void performSearch(query, true);
  }

  useEffect(() => {
    const searchTimer = window.setTimeout(() => {
      void performSearch(query);
    }, 275);

    return () => window.clearTimeout(searchTimer);
  }, [performSearch, query]);

  return (
    <section
      className="flex flex-col items-center px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24"
      id="kitchen-lab"
    >
      <div className="max-w-3xl">
        <h1 className="font-display text-[clamp(3rem,8vw,5.6rem)] leading-[0.96] tracking-[-0.06em] text-hearth-text">
          What would you like to cook today?
        </h1>
      </div>

      <div className="mt-10 w-full max-w-3xl">
        <form
          className="relative rounded-[1.35rem] bg-hearth-container/80 px-5 py-4 shadow-hearth"
          onSubmit={handleSubmit}
        >
          <input
            className="w-full border-0 bg-transparent pr-12 text-lg text-hearth-text placeholder:text-hearth-outline focus:outline-none focus:ring-0"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search recipe titles..."
            type="text"
            value={query}
          />
          <button
            aria-label="Search recipes"
            className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-hearth-copper transition hover:bg-white/65"
            type="submit"
          >
            <SearchAccentIcon className="h-5 w-5" />
          </button>
        </form>

        {searchState !== "idle" ? (
          <div
            aria-live="polite"
            className="mt-3 min-h-[7.5rem] overflow-hidden rounded-[1.15rem] bg-hearth-paper/80 px-4 py-3 text-left shadow-hearth"
          >
            {searchState === "loading" ? (
              <p className="px-2 py-7 text-center text-sm font-medium text-hearth-muted">
                Searching recipes...
              </p>
            ) : null}

            {searchState === "error" ? (
              <p className="px-2 py-7 text-center text-sm font-medium text-hearth-muted">
                {errorMessage}
              </p>
            ) : null}

            {searchState === "empty" ? (
              <p className="px-2 py-7 text-center text-sm font-medium text-hearth-muted">
                No matching recipes yet.
              </p>
            ) : null}

            {searchState === "success" ? (
              <div className="grid gap-2">
                {searchResults.map((recipe) => (
                  <Link
                    className="group flex items-center justify-between gap-4 rounded-[0.85rem] px-3 py-2.5 transition hover:bg-hearth-container/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-hearth-copper/50"
                    href={`/recipes/${recipe.id}`}
                    key={recipe.id}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[1.1rem] leading-tight text-hearth-text transition group-hover:text-hearth-copper">
                        {recipe.title}
                      </span>
                      <span className="mt-1 block text-xs font-semibold uppercase text-hearth-outline">
                        {recipe.duration}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-hearth-high px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-hearth-copper">
                      {recipe.tag}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {homeQuickActions.map((action) => {
          const Icon = action.icon;

          return (
            <a
              key={action.label}
              className="inline-flex items-center gap-2 rounded-full bg-hearth-paper px-4 py-2.5 text-sm font-medium text-hearth-accent shadow-hearth transition duration-300 hover:-translate-y-0.5 hover:text-hearth-copper"
              href={action.href}
            >
              <Icon className="h-4 w-4" />
              <span>{action.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
