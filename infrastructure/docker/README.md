# Docker Development Stack

This directory contains the local Docker wiring for Cookiful. Commands below are
run from this directory so the compose file can use short relative paths.

```bash
cd infrastructure/docker
```

## Services

- `postgres`: Postgres 16 on `localhost:5432`
- `redis`: Redis 7 on `localhost:6379`
- `api`: FastAPI dev server on `http://localhost:4000`
- `web`: Next.js dev server on `http://localhost:3000`
- `pgadmin`: pgAdmin on `http://localhost:5050` behind the `tools` profile

Internal service URLs use compose service names:

- API to Postgres: `postgresql+psycopg://postgres:postgres@postgres:5432/cookiful`
- API to Redis: `redis://redis:6379`
- Web to API: `http://api:4000/api`

## Full Stack

Build images and start the app stack:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Run it in the background:

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

Stop services without deleting database volumes:

```bash
docker compose -f docker-compose.dev.yml down
```

## Selected Services

Start only Postgres and Redis:

```bash
docker compose -f docker-compose.dev.yml up postgres redis
```

Start the API with its database dependencies:

```bash
docker compose -f docker-compose.dev.yml up --build api
```

Start the web app and the services it depends on:

```bash
docker compose -f docker-compose.dev.yml up --build web
```

Start pgAdmin with the database stack:

```bash
docker compose -f docker-compose.dev.yml --profile tools up postgres redis pgadmin
```

## Notes

The API and web containers run development servers. The repo is mounted into the
containers for live reload, while dependency directories that should remain
container-owned use named volumes.

The compose file provides local development defaults for required API settings:
`DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`.
