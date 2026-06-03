import { describe, expect, test } from "bun:test";

import {
  cleanRecipeBoxIngredient,
  isFetchableRecipeBoxImageUrl,
  normalizeImportedRecipe,
  normalizeRecipeBoxDirections,
  normalizeRecipeBoxPictureLink,
  normalizeRecipeBoxRecord
} from "./index";

describe("CSV recipe schema helpers", () => {
  test("normalizes JSON-array fields from CSV rows", () => {
    const recipe = normalizeImportedRecipe({
      title: "  Lemon Pasta  ",
      ingredients: "[\"lemon\", \"pasta\"]",
      directions: "[\"Boil pasta\", \"Toss with lemon\"]",
      link: " https://example.test/lemon-pasta ",
      source: " Example ",
      NER: "[\"lemon\", \"pasta\"]",
      site: " example.test "
    });

    expect(recipe).toEqual({
      title: "Lemon Pasta",
      ingredients: ["lemon", "pasta"],
      directions: ["Boil pasta", "Toss with lemon"],
      link: "https://example.test/lemon-pasta",
      source: "Example",
      ner: ["lemon", "pasta"],
      site: "example.test"
    });
  });
});

describe("Recipe Box JSON schema helpers", () => {
  test("cleans advertisement markers from ingredients", () => {
    expect(cleanRecipeBoxIngredient("1 cup rice ADVERTISEMENT")).toBe("1 cup rice");
  });

  test("splits newline-delimited instructions into recipe steps", () => {
    expect(normalizeRecipeBoxDirections("Prep ingredients.\r\nCook until done.\n\nServe.")).toEqual([
      "Prep ingredients.",
      "Cook until done.",
      "Serve."
    ]);
  });

  test("normalizes valid Recipe Box records", () => {
    expect(
      normalizeRecipeBoxRecord("abc123", {
        title: "  Tomato Soup  ",
        ingredients: ["tomatoes ADVERTISEMENT", "stock"],
        instructions: "Simmer.\nBlend.",
        picture_link: "//images.example.test/tomato.jpg"
      })
    ).toEqual({
      recordId: "abc123",
      title: "Tomato Soup",
      ingredients: ["tomatoes", "stock"],
      directions: ["Simmer.", "Blend."],
      pictureLink: "//images.example.test/tomato.jpg",
      imageReference: "//images.example.test/tomato.jpg",
      imageUrl: "https://images.example.test/tomato.jpg"
    });
  });

  test("normalizes Recipe Box picture links without promoting opaque tokens", () => {
    expect(isFetchableRecipeBoxImageUrl("https://images.example.test/tomato.jpg")).toBe(true);
    expect(isFetchableRecipeBoxImageUrl("https://opaque-token/path")).toBe(false);
    expect(isFetchableRecipeBoxImageUrl("https://SKQLl180RSE4ZM3x9SzHOFyHr.yYy")).toBe(false);
    expect(normalizeRecipeBoxPictureLink("//opaque-token/path")).toEqual({
      reference: "//opaque-token/path"
    });
  });

  test("drops Recipe Box records without usable recipe content", () => {
    expect(
      normalizeRecipeBoxRecord("empty", {
        title: "Empty Shell",
        ingredients: [],
        instructions: ""
      })
    ).toBeNull();
  });
});
