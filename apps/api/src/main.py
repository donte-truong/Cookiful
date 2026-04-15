from fastapi import FastAPI

from apps.api.src.api.router import api_router
from apps.api.src.core.config import get_settings


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Cookiful backend for recipes, cooking sessions, planning, and AI orchestration.",
)

app.include_router(api_router, prefix=settings.api_prefix)

