import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("Recipe Box image proxy route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("proxies safe Recipe Box image requests to the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: {
          "content-type": "image/jpeg",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("http://localhost/api/recipes/images/recipe-box/fn/image.jpg"),
      {
        params: Promise.resolve({
          source: "fn",
          filename: "image.jpg",
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://localhost:4000/api/recipes/images/recipe-box/fn/image.jpg",
    );
  });

  it("rejects unsafe filenames before proxying", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("http://localhost/api/recipes/images/recipe-box/fn/secret.jpg"),
      {
        params: Promise.resolve({
          source: "fn",
          filename: "../secret.jpg",
        }),
      },
    );

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
