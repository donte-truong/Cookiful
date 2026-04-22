# Docker Scaffolding

Put container definitions here for:

- `apps/web`
- `apps/api`
- `apps/worker`
- local Postgres and Redis development

## Local database stack

The development compose file starts the core database services used by the DB bootstrap scripts:

- Postgres on `localhost:5432`
- Redis on `localhost:6379`
- pgAdmin on `http://localhost:5050` with `--profile tools`

Recommended startup:

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

If you want the database UI, include the tools profile:

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml --profile tools up -d
```
