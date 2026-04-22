import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildCuratedRecipesUrl,
  fetchCuratedRecipes,
  mergeExcludedRecipeIds,
  toHomeRecipe,
} from "./recipes-client";

describe("buildCuratedRecipesUrl", () => {
  it("includes the limit and excluded recipe ids", () => {
    expect(
      buildCuratedRecipesUrl({
        limit: 3,
        excludeIds: ["recipe-1", "recipe-2"],
      }),
    ).toBe("/api/recipes/curated?limit=3&exclude_id=recipe-1&exclude_id=recipe-2");
  });
});

describe("toHomeRecipe", () => {
  it("maps the API payload into the home-card shape", () => {
    expect(
      toHomeRecipe({
        id: "recipe-7",
        title: "Braised Fennel",
        description: "Slow-braised fennel with citrus and butter.",
        duration_minutes: 42,
        tag: "DINNER",
        image_url: null,
        image_alt: "Editorial plating for Braised Fennel.",
        source_name: "Cookiful Archive",
        source_url: "https://example.com/recipe-7",
      }),
    ).toEqual({
      id: "recipe-7",
      title: "Braised Fennel",
      description: "Slow-braised fennel with citrus and butter.",
      duration: "42 MIN",
      tag: "DINNER",
      image: null,
      alt: "Editorial plating for Braised Fennel.",
      sourceName: "Cookiful Archive",
      sourceUrl: "https://example.com/recipe-7",
    });
  });
});

describe("fetchCuratedRecipes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("loads recipes from the curated API route", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          recipes: [
            {
              id: "recipe-9",
              title: "Charred Green Beans",
              description: "Green beans blistered with garlic and lemon.",
              duration_minutes: 18,
              tag: "VEGETABLE",
              image_url: "https://example.com/beans.jpg",
              image_alt: "Editorial plating for Charred Green Beans.",
              source_name: "Cookiful Archive",
              source_url: "https://example.com/recipe-9",
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchCuratedRecipes({
        limit: 1,
        excludeIds: ["recipe-2"],
      }),
    ).resolves.toEqual([
      {
        id: "recipe-9",
        title: "Charred Green Beans",
        description: "Green beans blistered with garlic and lemon.",
        duration: "18 MIN",
        tag: "VEGETABLE",
        image: "https://example.com/beans.jpg",
        alt: "Editorial plating for Charred Green Beans.",
        sourceName: "Cookiful Archive",
        sourceUrl: "https://example.com/recipe-9",
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/recipes/curated?limit=1&exclude_id=recipe-2",
      { cache: "no-store" },
    );
  });

  it("throws a helpful error when the route fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 503 }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchCuratedRecipes()).rejects.toThrow("Unable to load curated recipes.");
  });
});

describe("mergeExcludedRecipeIds", () => {
  it("accumulates exclusions across multiple load-more passes", () => {
    const afterFirstPage = mergeExcludedRecipeIds([], [
      { id: "recipe-1" },
      { id: "recipe-2" },
    ]);

    expect(
      mergeExcludedRecipeIds(afterFirstPage, [
        { id: "recipe-3" },
        { id: "recipe-4" },
      ]),
    ).toEqual(["recipe-1", "recipe-2", "recipe-3", "recipe-4"]);
  });
});
