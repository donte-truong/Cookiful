FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/workspace/packages/db/src:/workspace

WORKDIR /workspace

COPY apps/api/pyproject.toml apps/api/README.md ./apps/api/
COPY apps/api/src ./apps/api/src
COPY packages/db/pyproject.toml packages/db/README.md ./packages/db/
COPY packages/db/src ./packages/db/src

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -e ./packages/db -e ./apps/api

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "python -m uvicorn apps.api.src.main:app --host 0.0.0.0 --port ${PORT:-4000}"]
