from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from cookiful_db.config import get_database_settings


settings = get_database_settings()


class Base(DeclarativeBase):
    pass


engine = create_engine(settings.database_url, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, future=True)
