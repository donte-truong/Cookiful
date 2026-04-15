# `apps/api`

FastAPI foundation for the Cookiful backend.

## Current foundation

- `src/main.py`: FastAPI app bootstrap
- `src/core/config.py`: environment-backed settings
- `src/api/router.py`: route aggregation
- `src/api/routes/health.py`: starter health endpoint

## Initial local target

- `GET /api/health`

## Planned backend stack

- FastAPI
- SQLAlchemy 2.x
- PostgreSQL via `psycopg`
- SQL migrations kept in `packages/db`

