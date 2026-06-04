import { describe, expect, it } from "vitest";

import { toProfileData } from "./profile-data";

const apiRecipe = {
  id: "recipe-1",
  title: "Tomato Toast",
  description: "A crisp, copper-lit snack.",
  duration_minutes: 18,
  tag: "SNACK",
  image_url: "https://images.example.test/tomato-toast.jpg",
  image_alt: "Editorial plating for Tomato Toast.",
  source_name: "Cookiful Archive",
  source_url: "https://example.test/tomato-toast",
};

describe("toProfileData", () => {
  it("maps profile payload recipes into display data", () => {
    expect(
      toProfileData({
        user: {
          id: "user-1",
          email: "chef@example.test",
          username: "chef",
          display_name: "Chef Example",
        },
        liked_recipes: [apiRecipe],
        saved_recipes: [
          {
            ...apiRecipe,
            id: "recipe-2",
            title: "Braised Beans",
          },
        ],
        reposted_recipes: [],
      }),
    ).toEqual({
      user: {
        id: "user-1",
        email: "chef@example.test",
        username: "chef",
        displayName: "Chef Example",
      },
      likedRecipes: [
        {
          id: "recipe-1",
          title: "Tomato Toast",
          description: "A crisp, copper-lit snack.",
          duration: "18 MIN",
          tag: "SNACK",
          image: "https://images.example.test/tomato-toast.jpg",
          alt: "Editorial plating for Tomato Toast.",
          sourceName: "Cookiful Archive",
          sourceUrl: "https://example.test/tomato-toast",
        },
      ],
      savedRecipes: [
        {
          id: "recipe-2",
          title: "Braised Beans",
          description: "A crisp, copper-lit snack.",
          duration: "18 MIN",
          tag: "SNACK",
          image: "https://images.example.test/tomato-toast.jpg",
          alt: "Editorial plating for Tomato Toast.",
          sourceName: "Cookiful Archive",
          sourceUrl: "https://example.test/tomato-toast",
        },
      ],
      repostedRecipes: [],
    });
  });
});
