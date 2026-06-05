import { NextRequest, NextResponse } from "next/server";

import { getRecipesApiBaseUrl } from "../curated/route-config";

export async function GET(request: NextRequest) {
  let upstreamUrl: URL;

  try {
    upstreamUrl = new URL(`${getRecipesApiBaseUrl()}/recipes/search`);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Recipe search API is not configured.",
      },
      { status: 500 },
    );
  }

  upstreamUrl.search = request.nextUrl.searchParams.toString();

  let response: Response;

  try {
    response = await fetch(upstreamUrl, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Recipe search is unavailable right now.",
      },
      { status: 502 },
    );
  }

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "cache-control": "no-store",
      "content-type": response.headers.get("content-type") || "application/json",
    },
  });
}
