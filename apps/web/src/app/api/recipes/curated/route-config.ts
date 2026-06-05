const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:4000/api";

type RecipesApiEnv = {
  COOKIFUL_API_URL?: string;
  NEXT_PUBLIC_API_URL?: string;
  NODE_ENV?: string;
};

export function getRecipesApiBaseUrl(
  env: RecipesApiEnv = process.env,
): string {
  const configuredApiUrl =
    env.COOKIFUL_API_URL?.trim() || env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  if (env.NODE_ENV !== "production") {
    return DEFAULT_LOCAL_API_BASE_URL;
  }

  throw new Error(
    "COOKIFUL_API_URL or NEXT_PUBLIC_API_URL must be configured to proxy recipes outside local development.",
  );
}
