import type { NextConfig } from "next";

function normalizeBasePath(value: string | undefined): string {
  const trimmedValue = value?.trim().replace(/\/$/, "") ?? "";

  if (!trimmedValue || trimmedValue === "/") {
    return "";
  }

  return trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`;
}

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

const githubPagesConfig: NextConfig = isGitHubPages
  ? {
      output: "export",
      trailingSlash: true,
      images: {
        unoptimized: true,
      },
      ...(githubPagesBasePath
        ? {
            assetPrefix: githubPagesBasePath,
            basePath: githubPagesBasePath,
          }
        : {}),
    }
  : {};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...githubPagesConfig,
};

export default nextConfig;
