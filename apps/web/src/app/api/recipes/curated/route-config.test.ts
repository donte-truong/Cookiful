import { describe, expect, it } from "vitest";

import { getRecipesApiBaseUrl } from "./route-config";

describe("getRecipesApiBaseUrl", () => {
  it("uses the server-only API URL and trims a trailing slash", () => {
    expect(
      getRecipesApiBaseUrl({
        COOKIFUL_API_URL: "http://api:4000/api/",
        NODE_ENV: "production",
      }),
    ).toBe("http://api:4000/api");
  });

  it("falls back to the public API URL when no server-only API URL is configured", () => {
    expect(
      getRecipesApiBaseUrl({
        NEXT_PUBLIC_API_URL: "https://api.cookiful.test/api/",
        NODE_ENV: "production",
      }),
    ).toBe("https://api.cookiful.test/api");
  });

  it("falls back to the local API in non-production environments", () => {
    expect(
      getRecipesApiBaseUrl({
        NODE_ENV: "development",
      }),
    ).toBe("http://localhost:4000/api");
  });

  it("requires an explicit API URL in production", () => {
    expect(() =>
      getRecipesApiBaseUrl({
        NODE_ENV: "production",
      }),
    ).toThrow("COOKIFUL_API_URL or NEXT_PUBLIC_API_URL must be configured");
  });
});
