# Cookiful

Cookiful is a social cooking platform with interactive recipe sessions, meal planning, grocery generation, and structured AI assistance.

This repository starts as a polyglot monorepo that follows the system design direction:

- `apps/web`: Next.js web app
- `apps/api`: FastAPI backend entrypoint
- `apps/worker`: background jobs and async workflows
- `packages/*`: shared types, DB, UI, recipes, AI tools, and utilities
- `docs/*`: architecture, API, product rules, and implementation planning
- `infrastructure/*`: container and deployment scaffolding

## Current Status

This now includes a first-pass working foundation for:

- `apps/api`: FastAPI bootstrap with config and routing
- `packages/db`: Python SQLAlchemy models, initial SQL migration, and CSV import scripts
- `apps/web`: Next.js App Router bootstrap with Tailwind and TanStack Query on a Bun-managed workspace

Mobile is intentionally not being advanced in this phase.

## Recommended Build Order

1. Install Bun dependencies for the web workspace and Python dependencies for the backend
2. Run Postgres and Redis locally with `infrastructure/docker/docker-compose.dev.yml`
3. Apply the first migration and optional seed data
4. Import recipe data from `packages/recipe-schema/recipes_data.csv`
5. Add auth, user, recipe, and cooking-session modules in `apps/api`
6. Build feed, recipe detail, and planner routes in `apps/web`

## Database Quick Start

1. `docker compose -f infrastructure/docker/docker-compose.dev.yml up -d`
2. `PYTHONPATH=packages/db/src python3 -m cookiful_db.scripts.doctor`
3. `PYTHONPATH=packages/db/src python3 -m cookiful_db.scripts.bootstrap_local --limit 1000 --commit-every 100`
4. `PYTHONPATH=packages/db/src python3 -m cookiful_db.scripts.inspect_recipes --view --limit 10`

You can also open:

- pgAdmin at `http://localhost:5050`
  Login: `admin@cookiful.dev`
  Password: `cookiful`

The bundled recipe CSV is very large, so the sample bootstrap command above is the fastest way to verify the local pipeline with real records. When you want the larger import, run `PYTHONPATH=packages/db/src python3 -m cookiful_db.scripts.bootstrap_local` and let it continue longer.

Bun is installed and working for the web workspace in this environment. The DB stack itself is verified through the direct Python commands above, which avoid a shell/runtime mismatch from the snapped Bun binary when launching Python-based DB tooling.

## Key Docs

- [System Overview](./docs/architecture/overview.md)
- [Module Boundaries](./docs/architecture/modules.md)
- [ERD Summary](./docs/architecture/erd-summary.md)
- [MVP API Draft](./docs/api/mvp-endpoints.md)
- [Cooking Session State Machine](./docs/product/cooking-session-state-machine.md)
- [Meal Planning and Grocery Rules](./docs/product/meal-planning-grocery-rules.md)
- [Implementation Plan](./docs/implementation/mvp-plan.md)
