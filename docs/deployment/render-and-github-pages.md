# Render and GitHub Pages Deployment

Cookiful is prepared for a split deployment:

- GitHub Pages hosts the static Next.js web export.
- Render runs the FastAPI container, managed Postgres, and Render Key Value.

## What Was Added

- `.github/workflows/deploy-web-pages.yml` builds `apps/web` with `output: "export"` and deploys `apps/web/out` to GitHub Pages.
- The Pages workflow writes `apps/web/out/.nojekyll` and uploads hidden files so Next's `_next` assets are served as static files.
- The Pages workflow disables Next API route handlers before building because the static site calls the Render API directly.
- `render.yaml` defines the Render API web service, Postgres database, and Key Value instance.
- `apps/api/Dockerfile` now starts Uvicorn without dev reload and respects Render's `PORT`.
- The API accepts `CORS_ORIGINS` so the GitHub Pages origin can call the Render API.
- The home recipe client can use `NEXT_PUBLIC_API_URL` directly, which lets the static site call Render instead of relying on Next API route proxies.
- Next server-side proxies and server actions can use `COOKIFUL_API_URL` when the web app runs in a container, keeping Docker-internal URLs out of the browser bundle.

## GitHub Pages

In GitHub:

1. Go to repository settings.
2. Open Pages.
3. Set Build and deployment source to GitHub Actions.
4. Add repository variables:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://<render-api-service>.onrender.com/api` |
| `NEXT_PUBLIC_BASE_PATH` | `/<repo-name>` for project Pages; `/` for a custom domain or `<owner>.github.io` repo |

The workflow can derive `NEXT_PUBLIC_BASE_PATH` for ordinary project Pages if the variable is omitted. Set it manually when using a custom domain or a nonstandard Pages setup. The value `/` is normalized to no base path.

## Render

Create a new Blueprint instance from the repository root. Render reads `render.yaml` by default.

The Blueprint creates:

- `cookiful-api`: Docker web service from `apps/api/Dockerfile`.
- `cookiful-postgres`: managed Postgres.
- `cookiful-redis`: Render Key Value, internal connections only.

Render will prompt for:

| Environment variable | Value |
| --- | --- |
| `CORS_ORIGINS` | GitHub Pages origin, for example `https://<owner>.github.io`; add a custom frontend domain too if used, separated by commas |

The Blueprint generates `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. `DATABASE_URL` and `REDIS_URL` are wired from the managed Render services.

Production recipe data is a separate data-loading step. The large local Recipe Box fixtures are excluded by `.dockerignore`, so they are not available inside the production API image by default. To load them in production, use a one-off import image or Render job that includes the fixture files, or temporarily adjust the Docker build context for an import-only deploy, then run:

```bash
python -m cookiful_db.scripts.import_recipe_box_json --limit 1000 --commit-every 100
```

Use a higher limit, or omit `--limit`, when you are ready to import the full archive. Keep `cookiful-postgres` private by default; only open Postgres external access temporarily if you deliberately choose a local import workflow.

## URLs To Update

- GitHub repository variable `NEXT_PUBLIC_API_URL`: set to the public Render API base URL with `/api`.
- Render API environment variable `CORS_ORIGINS`: set to the GitHub Pages origin. CORS origins do not include a path, so use `https://<owner>.github.io` even if the site path is `/<repo-name>`.
- GitHub repository variable `NEXT_PUBLIC_BASE_PATH`: set to `/<repo-name>` for project Pages unless the workflow-derived value is correct; set it to `/` when there should be no base path.
- If the web app is ever deployed as a server-rendered container instead of GitHub Pages, set its server-only `COOKIFUL_API_URL` to the internal API URL and reserve `NEXT_PUBLIC_API_URL` for browser-accessible API URLs.
- Any future custom frontend domain must be added to `CORS_ORIGINS`.
- Any future custom API domain should replace the `onrender.com` value in `NEXT_PUBLIC_API_URL`.

## Static Export Behavior

The GitHub Pages build is static-export compatible, with a few deliberate deployment-time differences:

- The workflow renames `apps/web/src/app/api/**/route.ts` files before `next build`; those proxy routes are only for server-backed local/container deployments.
- Login, signup, profile, grocery, and social actions use browser-to-Render API calls with tokens stored in browser storage.
- `/recipes/[recipeId]` includes a placeholder static param so the export succeeds. Real recipe detail pages are not generated on GitHub Pages yet; recipe cards avoid linking to generated 404s during static export.

To add full recipe details to GitHub Pages later, generate static params from a deployed recipe catalog at build time or replace the dynamic detail route with a client-side query route.

## References

- [Next.js static export guide](https://nextjs.org/docs/app/guides/static-exports)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Render Blueprint spec](https://render.com/docs/blueprint-spec)
- [Render Key Value docs](https://render.com/docs/key-value)
