from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Cookiful API"
    environment: str = "development"
    api_prefix: str = "/api"
    database_url: str
    redis_url: str
    jwt_access_secret: str
    jwt_refresh_secret: str


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

