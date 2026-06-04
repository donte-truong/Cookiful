"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthFormState } from "./types";

const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:4000/api";
const ACCESS_TOKEN_COOKIE = "cookiful_access_token";
const REFRESH_TOKEN_COOKIE = "cookiful_refresh_token";
const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type BackendAuthUser = {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
};

type BackendAuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  user: BackendAuthUser;
};

type AuthEndpoint = "/auth/login" | "/auth/register";

function buildAuthApiUrl(endpoint: AuthEndpoint): string {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const apiBaseUrl = configuredApiUrl
    ? configuredApiUrl
    : process.env.NODE_ENV !== "production"
      ? DEFAULT_LOCAL_API_BASE_URL
      : "";

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured for authentication.");
  }

  return `${apiBaseUrl.replace(/\/$/, "")}${endpoint}`;
}

function readFormValue(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function authError(message: string): AuthFormState {
  return {
    status: "error",
    message,
  };
}

function parseBackendDetail(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (
          item !== null &&
          typeof item === "object" &&
          "msg" in item &&
          typeof item.msg === "string"
        ) {
          return item.msg;
        }

        return null;
      })
      .filter((message): message is string => message !== null);

    return messages.length > 0 ? messages.join(" ") : null;
  }

  return null;
}

function buildAuthErrorMessage(status: number, responseBody: unknown): string {
  if (
    responseBody !== null &&
    typeof responseBody === "object" &&
    "detail" in responseBody
  ) {
    const detailMessage = parseBackendDetail(responseBody.detail);

    if (detailMessage !== null) {
      return detailMessage;
    }
  }

  if (status === 401) {
    return "The email or password did not match an account.";
  }

  if (status === 409) {
    return "An account with that email or username already exists.";
  }

  return "Cookiful could not complete authentication right now.";
}

function isBackendAuthResponse(value: unknown): value is BackendAuthResponse {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<BackendAuthResponse>;

  return (
    typeof candidate.access_token === "string" &&
    typeof candidate.refresh_token === "string" &&
    candidate.token_type === "bearer" &&
    candidate.user !== null &&
    typeof candidate.user === "object" &&
    typeof candidate.user.id === "string" &&
    typeof candidate.user.email === "string" &&
    typeof candidate.user.username === "string"
  );
}

async function postAuth(
  endpoint: AuthEndpoint,
  payload: Record<string, string>,
): Promise<BackendAuthResponse | AuthFormState> {
  let response: Response;

  try {
    response = await fetch(buildAuthApiUrl(endpoint), {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return authError("Cookiful API is unavailable. Start the backend and try again.");
  }

  let responseBody: unknown = null;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    return authError(buildAuthErrorMessage(response.status, responseBody));
  }

  if (!isBackendAuthResponse(responseBody)) {
    return authError("Cookiful returned an unexpected authentication response.");
  }

  return responseBody;
}

async function persistAuthSession(authResponse: BackendAuthResponse): Promise<void> {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const baseCookieOptions = {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure,
  };

  cookieStore.set(ACCESS_TOKEN_COOKIE, authResponse.access_token, {
    ...baseCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, authResponse.refresh_token, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export async function loginWithPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readFormValue(formData, "email");
  const password = readFormValue(formData, "password");

  if (!email || !password) {
    return authError("Enter your email and password to sign in.");
  }

  const response = await postAuth("/auth/login", {
    email,
    password,
  });

  if ("status" in response) {
    return response;
  }

  await persistAuthSession(response);
  redirect("/home");
}

export async function registerWithPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const displayName = readFormValue(formData, "displayName");
  const username = readFormValue(formData, "username");
  const email = readFormValue(formData, "email");
  const password = readFormValue(formData, "password");
  const confirmPassword = readFormValue(formData, "confirmPassword");

  if (!username || !email || !password || !confirmPassword) {
    return authError("Complete the required fields to create your account.");
  }

  if (password.length < 8) {
    return authError("Choose a password with at least 8 characters.");
  }

  if (password !== confirmPassword) {
    return authError("The passwords do not match.");
  }

  const response = await postAuth("/auth/register", {
    display_name: displayName,
    username,
    email,
    password,
  });

  if ("status" in response) {
    return response;
  }

  await persistAuthSession(response);
  redirect("/home");
}
