import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "../../../../features/auth/session";
import { getRecipesApiBaseUrl } from "../curated/route-config";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "Sign in to find recipes from your pantry.",
      },
      { status: 401 },
    );
  }

  let upstreamUrl: URL;

  try {
    upstreamUrl = new URL(`${getRecipesApiBaseUrl()}/recipes/pantry-matches`);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Pantry recipe API is not configured.",
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
        authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Pantry recipes are unavailable right now.",
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
