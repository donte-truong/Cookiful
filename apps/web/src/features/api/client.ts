const API_ROUTE_BASE_PATH = "/api";

export function getBrowserApiBaseUrl(
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL,
): string {
  const normalizedApiBaseUrl = apiBaseUrl?.trim().replace(/\/$/, "");

  return normalizedApiBaseUrl || API_ROUTE_BASE_PATH;
}

export function buildBrowserApiUrl(
  path: string,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL,
): string {
  return `${getBrowserApiBaseUrl(apiBaseUrl)}${path}`;
}
