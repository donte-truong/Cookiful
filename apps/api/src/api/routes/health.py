from fastapi import APIRouter

from apps.api.src.core.config import get_settings


router = APIRouter()


@router.get("")
def healthcheck() -> dict[str, str]:
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.environment,
    }

