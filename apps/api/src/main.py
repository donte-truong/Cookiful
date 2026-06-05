from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.src.api.router import api_router
from apps.api.src.core.config import get_settings
from apps.api.src.core.cors import parse_cors_origins


settings = get_settings()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Cookiful backend for recipes, cooking sessions, planning, and AI orchestration.",
)

cors_origins = parse_cors_origins(settings.cors_origins)
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.api_prefix)
