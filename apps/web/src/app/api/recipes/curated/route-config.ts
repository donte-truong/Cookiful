const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:4000/api";

type RecipesApiEnv = {
  NEXT_PUBLIC_API_URL?: string;
  NODE_ENV?: string;
};

export function getRecipesApiBaseUrl(
  env: RecipesApiEnv = process.env,
): string {
  const configuredApiUrl = env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  if (env.NODE_ENV !== "production") {
    return DEFAULT_LOCAL_API_BASE_URL;
  }

  throw new Error(
    "NEXT_PUBLIC_API_URL must be configured to proxy curated recipes outside local development.",
  );
}
