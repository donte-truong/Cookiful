import { buildBrowserApiUrl } from "../api/client";
import { getStoredAccessToken } from "../auth/session";

export type PantryMutationResult =
  | {
      status: "success";
    }
  | {
      status: "unauthenticated" | "error";
      message: string;
    };

export async function addPantryIngredient(
  ingredientName: string,
): Promise<PantryMutationResult> {
  const accessToken = getStoredAccessToken();

  if (!ingredientName || !accessToken) {
    return {
      status: "unauthenticated",
      message: "Sign in to update your pantry.",
    };
  }

  try {
    const response = await fetch(buildBrowserApiUrl("/me/groceries/pantry-items"), {
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

    if (response.status === 401) {
      return {
        status: "unauthenticated",
        message: "Sign in to update your pantry.",
      };
    }

    if (!response.ok) {
      return {
        status: "error",
        message: "Cookiful could not update your pantry right now.",
      };
    }
  } catch {
    return {
      status: "error",
      message: "Cookiful could not update your pantry right now.",
    };
  }

  return { status: "success" };
}

export async function removePantryIngredient(
  pantryItemId: string,
): Promise<PantryMutationResult> {
  const accessToken = getStoredAccessToken();

  if (!pantryItemId || !accessToken) {
    return {
      status: "unauthenticated",
      message: "Sign in to update your pantry.",
    };
  }

  try {
    const response = await fetch(
      buildBrowserApiUrl(`/me/groceries/pantry-items/${pantryItemId}`),
      {
        method: "DELETE",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 401) {
      return {
        status: "unauthenticated",
        message: "Sign in to update your pantry.",
      };
    }

    if (!response.ok) {
      return {
        status: "error",
        message: "Cookiful could not update your pantry right now.",
      };
    }
  } catch {
    return {
      status: "error",
      message: "Cookiful could not update your pantry right now.",
    };
  }

  return { status: "success" };
}
