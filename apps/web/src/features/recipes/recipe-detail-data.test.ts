import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildRecipeDetailApiUrl,
  fetchRecipeDetail,
  toRecipeDetail,
} from "./recipe-detail-data";

const apiRecipe = {
  id: "recipe-1",
  title: "Crispy Rice Salad",
  description: "Crunchy rice with herbs and a sharp dressing.",
  duration_minutes: 26,
  tag: "DINNER",
  image_url: "/api/recipes/images/recipe-box/epi/rice.jpg",
  image_alt: "Editorial plating for Crispy Rice Salad.",
  source_name: "Recipe Box Epicurious",
  source_url: "recipe-box://epi/crispy-rice-salad",
  ingredients: ["2 cups cooked rice", "1 cup herbs"],
  instructions: ["Crisp the rice.", "Fold with herbs."],
};

describe("buildRecipeDetailApiUrl", () => {
  it("builds an encoded detail URL from the API base", () => {
    expect(
      buildRecipeDetailApiUrl("recipe id/with slash", "https://api.example.test/api"),
    ).toBe("https://api.example.test/api/recipes/recipe%20id%2Fwith%20slash");
  });
});

describe("toRecipeDetail", () => {
  it("maps the API payload into the detail page shape", () => {
    expect(toRecipeDetail(apiRecipe)).toEqual({
      id: "recipe-1",
      title: "Crispy Rice Salad",
      description: "Crunchy rice with herbs and a sharp dressing.",
      duration: "26 MIN",
      tag: "DINNER",
      image: "/api/recipes/images/recipe-box/epi/rice.jpg",
      imageAlt: "Editorial plating for Crispy Rice Salad.",
      sourceName: "Recipe Box Epicurious",
      sourceUrl: "recipe-box://epi/crispy-rice-salad",
      ingredients: ["2 cups cooked rice", "1 cup herbs"],
      instructions: ["Crisp the rice.", "Fold with herbs."],
    });
  });
});

describe("fetchRecipeDetail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("loads recipe detail from the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(apiRecipe), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    await expect(
      fetchRecipeDetail("recipe-1", {
        apiBaseUrl: "http://localhost:4000/api",
        fetcher: fetchMock,
      }),
    ).resolves.toMatchObject({
      id: "recipe-1",
      title: "Crispy Rice Salad",
      ingredients: ["2 cups cooked rice", "1 cup herbs"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/recipes/recipe-1",
      {
        cache: "no-store",
        headers: {
          accept: "application/json",
        },
      },
    );
  });

  it("returns null when the recipe is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 404 }));

    await expect(
      fetchRecipeDetail("missing", {
        apiBaseUrl: "http://localhost:4000/api",
        fetcher: fetchMock,
      }),
    ).resolves.toBeNull();
  });

  it("throws a helpful error when the API fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 503 }));

    await expect(
      fetchRecipeDetail("recipe-1", {
        apiBaseUrl: "http://localhost:4000/api",
        fetcher: fetchMock,
      }),
    ).rejects.toThrow("Unable to load recipe detail.");
  });
});
