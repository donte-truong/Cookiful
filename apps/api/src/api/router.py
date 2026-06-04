from fastapi import APIRouter

from apps.api.src.api.routes.auth import router as auth_router
from apps.api.src.api.routes.health import router as health_router
from apps.api.src.api.routes.recipes import router as recipes_router


api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(recipes_router, prefix="/recipes", tags=["recipes"])
