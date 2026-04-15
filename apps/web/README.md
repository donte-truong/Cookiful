# `apps/web`

Next.js App Router foundation for Cookiful.

## Running the app

Use the normal Next package-runner workflow from `apps/web`:

- `bun run dev`
- `bun run build`
- `bun run start`
- `npm run dev`
- `npm run build`
- `npm run start`

Because `next` is a project-local dependency, plain shell commands like `next dev` are not the standard workflow here. Use a package runner so it resolves the local CLI from `node_modules` for you.

## Current foundation

- Next.js app shell
- Tailwind CSS setup
- TanStack Query provider
- initial landing page aligned with the product direction

## Suggested next routes

- `/feed`
- `/recipes/[recipeId]`
- `/sessions/[sessionId]`
- `/planner`
- `/grocery`
