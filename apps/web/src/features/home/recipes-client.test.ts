import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildNextCuratedRecipesPageParam,
  buildCuratedRecipesUrl,
  buildRecipeSearchUrl,
  fetchCuratedRecipes,
  fetchRecipeSearch,
  flattenCuratedRecipePages,
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

describe("buildRecipeSearchUrl", () => {
  it("includes the search query and result limit", () => {
    expect(buildRecipeSearchUrl({ query: "green beans", limit: 4 })).toBe(
      "/api/recipes/search?limit=4&q=green+beans",
    );
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

describe("fetchRecipeSearch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("loads recipes from the search API route", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          recipes: [
            {
              id: "recipe-11",
              title: "Lemon Chickpea Soup",
              description: "A bright soup with chickpeas and herbs.",
              duration_minutes: 35,
              tag: "SOUP",
              image_url: null,
              image_alt: "Editorial plating for Lemon Chickpea Soup.",
              source_name: "Cookiful Archive",
              source_url: "https://example.com/recipe-11",
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

    await expect(fetchRecipeSearch({ query: "lemon", limit: 2 })).resolves.toEqual([
      {
        id: "recipe-11",
        title: "Lemon Chickpea Soup",
        description: "A bright soup with chickpeas and herbs.",
        duration: "35 MIN",
        tag: "SOUP",
        image: null,
        alt: "Editorial plating for Lemon Chickpea Soup.",
        sourceName: "Cookiful Archive",
        sourceUrl: "https://example.com/recipe-11",
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/recipes/search?limit=2&q=lemon",
      { cache: "no-store" },
    );
  });

  it("throws a helpful error when recipe search fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 500 }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchRecipeSearch({ query: "cake" })).rejects.toThrow(
      "Unable to search recipes.",
    );
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

describe("flattenCuratedRecipePages", () => {
  it("keeps loaded recipe pages in append order", () => {
    expect(
      flattenCuratedRecipePages([
        [{ id: "recipe-1" }, { id: "recipe-2" }],
        [{ id: "recipe-3" }],
      ] as ReturnType<typeof toHomeRecipe>[][]),
    ).toEqual([{ id: "recipe-1" }, { id: "recipe-2" }, { id: "recipe-3" }]);
  });

  it("defaults missing query data to an empty recipe list", () => {
    expect(flattenCuratedRecipePages()).toEqual([]);
  });
});

describe("buildNextCuratedRecipesPageParam", () => {
  it("builds the next exclusion list from all loaded pages", () => {
    expect(
      buildNextCuratedRecipesPageParam(
        [
          [{ id: "recipe-1" }, { id: "recipe-2" }],
          [{ id: "recipe-3" }, { id: "recipe-4" }],
        ] as ReturnType<typeof toHomeRecipe>[][],
        2,
      ),
    ).toEqual(["recipe-1", "recipe-2", "recipe-3", "recipe-4"]);
  });

  it("stops pagination when the latest page is short", () => {
    expect(
      buildNextCuratedRecipesPageParam(
        [
          [{ id: "recipe-1" }, { id: "recipe-2" }],
          [{ id: "recipe-3" }],
        ] as ReturnType<typeof toHomeRecipe>[][],
        2,
      ),
    ).toBeUndefined();
  });
});
