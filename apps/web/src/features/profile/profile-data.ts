import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getRecipesApiBaseUrl } from "../../app/api/recipes/curated/route-config";
import { ACCESS_TOKEN_COOKIE } from "../auth/session";
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

export async function fetchProfileData(): Promise<ProfileData> {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const response = await fetch(`${getRecipesApiBaseUrl()}/me/profile`, {
    cache: "no-store",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Unable to load profile.");
  }

  return toProfileData((await response.json()) as ProfileApiResponse);
}
