"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getRecipesApiBaseUrl } from "../../app/api/recipes/curated/route-config";
import { ACCESS_TOKEN_COOKIE } from "../auth/session";

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function addPantryIngredient(formData: FormData): Promise<void> {
  const ingredientName = formValue(formData, "ingredientName");
  const accessToken = await getAccessToken();

  if (!ingredientName || !accessToken) {
    return;
  }

  const response = await fetch(`${getRecipesApiBaseUrl()}/me/groceries/pantry-items`, {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ingredient_name: ingredientName,
    }),
  });

  if (response.ok) {
    revalidatePath("/groceries");
    revalidatePath("/profile");
  }
}

export async function removePantryIngredient(formData: FormData): Promise<void> {
  const pantryItemId = formValue(formData, "pantryItemId");
  const accessToken = await getAccessToken();

  if (!pantryItemId || !accessToken) {
    return;
  }

  const response = await fetch(`${getRecipesApiBaseUrl()}/me/groceries/pantry-items/${pantryItemId}`, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    revalidatePath("/groceries");
    revalidatePath("/profile");
  }
}
