import { NextRequest, NextResponse } from "next/server";

import { getRecipesApiBaseUrl } from "../../../../curated/route-config";

const RECIPE_BOX_SOURCE_PATTERN = /^[a-z]+$/;
const RECIPE_BOX_IMAGE_FILENAME_PATTERN = /^[A-Za-z0-9_-]+\.jpg$/;

type RecipeBoxImageParams = {
  source: string;
  filename: string;
};

type RecipeBoxImageRouteContext = {
  params: Promise<RecipeBoxImageParams>;
};

export async function GET(
  _request: NextRequest,
  context: RecipeBoxImageRouteContext,
) {
  const { source, filename } = await context.params;

  if (
    !RECIPE_BOX_SOURCE_PATTERN.test(source) ||
    !RECIPE_BOX_IMAGE_FILENAME_PATTERN.test(filename)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  let upstreamUrl: URL;

  try {
    upstreamUrl = new URL(
      `${getRecipesApiBaseUrl()}/recipes/images/recipe-box/${encodeURIComponent(source)}/${encodeURIComponent(filename)}`,
    );
  } catch {
    return NextResponse.json(
      {
        error: "Recipe image API is not configured.",
      },
      { status: 500 },
    );
  }

  let response: Response;

  try {
    response = await fetch(upstreamUrl, {
      cache: "no-store",
      headers: {
        accept: "image/jpeg,*/*;q=0.8",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "cache-control": "public, max-age=86400",
      "content-type": response.headers.get("content-type") || "image/jpeg",
    },
  });
}
