export const ACCESS_TOKEN_COOKIE = "cookiful_access_token";
export const REFRESH_TOKEN_COOKIE = "cookiful_refresh_token";

type AuthSessionTokens = {
  accessToken: string;
  refreshToken: string;
};

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_COOKIE);
}

export function persistAuthSessionTokens({
  accessToken,
  refreshToken,
}: AuthSessionTokens): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_COOKIE, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_COOKIE, refreshToken);
}

export function clearAuthSessionTokens(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_COOKIE);
  window.localStorage.removeItem(REFRESH_TOKEN_COOKIE);
}
