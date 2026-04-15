from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

from cookiful_db.paths import ENV_FILE


class DatabaseSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/cookiful"


@lru_cache(maxsize=1)
def get_database_settings() -> DatabaseSettings:
    return DatabaseSettings()
