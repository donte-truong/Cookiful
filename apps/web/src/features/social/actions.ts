import { buildBrowserApiUrl } from "../api/client";
import { getStoredAccessToken } from "../auth/session";

export type RecipeSocialAction = "like" | "save" | "repost";

export type RecipeSocialActionState = {
  liked: boolean;
  saved: boolean;
  reposted: boolean;
};

export type RecipeSocialActionResult =
  | {
      status: "success";
      actions: RecipeSocialActionState;
    }
  | {
      status: "unauthenticated" | "error";
      message: string;
    };

type RecipeSocialActionApiResponse = {
  recipe_id: string;
  liked: boolean;
  saved: boolean;
  reposted: boolean;
};

type UpdateRecipeSocialActionInput = {
  recipeId: string;
  action: RecipeSocialAction;
  active: boolean;
};

function toRecipeSocialActionState(
  payload: RecipeSocialActionApiResponse,
): RecipeSocialActionState {
  return {
    liked: payload.liked,
    saved: payload.saved,
    reposted: payload.reposted,
  };
}

export async function updateRecipeSocialAction({
  recipeId,
  action,
  active,
}: UpdateRecipeSocialActionInput): Promise<RecipeSocialActionResult> {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    return {
      status: "unauthenticated",
      message: "Sign in to save this recipe action.",
    };
  }

  let response: Response;

  try {
    response = await fetch(buildBrowserApiUrl("/me/recipe-actions"), {
      method: "PUT",
      cache: "no-store",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        recipe_id: recipeId,
        action_type: action,
        active,
      }),
    });
  } catch {
    return {
      status: "error",
      message: "Cookiful could not save this recipe action right now.",
    };
  }

  if (response.status === 401) {
    return {
      status: "unauthenticated",
      message: "Sign in to save this recipe action.",
    };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: "Cookiful could not save this recipe action right now.",
    };
  }

  const payload = (await response.json()) as RecipeSocialActionApiResponse;

  return {
    status: "success",
    actions: toRecipeSocialActionState(payload),
  };
}
