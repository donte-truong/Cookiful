import { buildBrowserApiUrl } from "../api/client";
import { getStoredAccessToken } from "../auth/session";
import type { CuratedRecipeApiRecord } from "../home/recipes-client";
import { toHomeRecipe } from "../home/recipes-client";
import type { HomeRecipe } from "../home/home-data";

type ProfileUserApiRecord = {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
};

type ProfileApiResponse = {
  user: ProfileUserApiRecord;
  liked_recipes: CuratedRecipeApiRecord[];
  saved_recipes: CuratedRecipeApiRecord[];
  reposted_recipes: CuratedRecipeApiRecord[];
};

export type ProfileUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
};

export type ProfileData = {
  user: ProfileUser;
  likedRecipes: HomeRecipe[];
  savedRecipes: HomeRecipe[];
  repostedRecipes: HomeRecipe[];
};

export const EMPTY_PROFILE_DATA: ProfileData = {
  user: {
    id: "guest",
    email: "",
    username: "cookiful-guest",
    displayName: "Your Kitchen",
  },
  likedRecipes: [],
  savedRecipes: [],
  repostedRecipes: [],
};

export function toProfileData(payload: ProfileApiResponse): ProfileData {
  return {
    user: {
      id: payload.user.id,
      email: payload.user.email,
      username: payload.user.username,
      displayName: payload.user.display_name,
    },
    likedRecipes: payload.liked_recipes.map(toHomeRecipe),
    savedRecipes: payload.saved_recipes.map(toHomeRecipe),
    repostedRecipes: payload.reposted_recipes.map(toHomeRecipe),
  };
}

export async function fetchProfileData(accessToken: string): Promise<ProfileData> {
  const response = await fetch(buildBrowserApiUrl("/me/profile"), {
    cache: "no-store",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load profile.");
  }

  return toProfileData((await response.json()) as ProfileApiResponse);
}

export async function fetchStoredProfileData(): Promise<ProfileData | null> {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    return null;
  }

  return fetchProfileData(accessToken);
}
