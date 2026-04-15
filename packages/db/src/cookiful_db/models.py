import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.mutable import MutableDict, MutableList
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cookiful_db.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def created_at_column():
    return mapped_column(DateTime(timezone=True), default=utcnow, server_default=func.now())


def updated_at_column():
    return mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        server_default=func.now(),
        server_onupdate=func.now(),
    )


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    SUSPENDED = "SUSPENDED"


class RecipeStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class RecipeVisibility(str, enum.Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"
    UNLISTED = "UNLISTED"


class CookingSessionStatus(str, enum.Enum):
    CREATED = "CREATED"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    AWAITING_TIMER = "AWAITING_TIMER"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class SessionTimerStatus(str, enum.Enum):
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"


JsonList = MutableList.as_mutable(JSONB)
JsonDict = MutableDict.as_mutable(JSONB)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    username: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[UserStatus] = mapped_column(Enum(UserStatus, name="user_status"), default=UserStatus.ACTIVE, nullable=False)
    created_at: Mapped[datetime] = created_at_column()
    updated_at: Mapped[datetime] = updated_at_column()

    profile: Mapped["UserProfile | None"] = relationship(back_populates="user", uselist=False)
    preferences: Mapped["UserPreference | None"] = relationship(back_populates="user", uselist=False)
    authored_recipes: Mapped[list["Recipe"]] = relationship(back_populates="author")
    cooking_sessions: Mapped[list["CookingSession"]] = relationship(back_populates="user")
    ai_interactions: Mapped[list["AiInteraction"]] = relationship(back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    display_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    skill_level: Mapped[str | None] = mapped_column(Text, nullable=True)
    timezone: Mapped[str | None] = mapped_column(Text, nullable=True)
    locale: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = created_at_column()
    updated_at: Mapped[datetime] = updated_at_column()

    user: Mapped["User"] = relationship(back_populates="profile")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    dietary_preferences: Mapped[list[str] | None] = mapped_column(JsonList, nullable=True)
    allergen_flags: Mapped[list[str] | None] = mapped_column(JsonList, nullable=True)
    disliked_ingredients: Mapped[list[str] | None] = mapped_column(JsonList, nullable=True)
    cuisine_preferences: Mapped[list[str] | None] = mapped_column(JsonList, nullable=True)
    max_prep_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    household_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    updated_at: Mapped[datetime] = updated_at_column()

    user: Mapped["User"] = relationship(back_populates="preferences")


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    current_version_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("recipe_versions.id", ondelete="SET NULL"), unique=True, nullable=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(Text, unique=True, nullable=True)
    source_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_site: Mapped[str | None] = mapped_column(Text, nullable=True)
    hero_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RecipeStatus] = mapped_column(Enum(RecipeStatus, name="recipe_status"), default=RecipeStatus.DRAFT, nullable=False)
    visibility: Mapped[RecipeVisibility] = mapped_column(Enum(RecipeVisibility, name="recipe_visibility"), default=RecipeVisibility.PUBLIC, nullable=False)
    cuisine_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    meal_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty_level: Mapped[str | None] = mapped_column(Text, nullable=True)
    prep_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cook_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    servings_default: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = created_at_column()
    updated_at: Mapped[datetime] = updated_at_column()

    author: Mapped["User | None"] = relationship(back_populates="authored_recipes", foreign_keys=[author_user_id])
    versions: Mapped[list["RecipeVersion"]] = relationship(back_populates="recipe", foreign_keys="RecipeVersion.recipe_id")
    current_version: Mapped["RecipeVersion | None"] = relationship(foreign_keys=[current_version_id], post_update=True)
    cooking_sessions: Mapped[list["CookingSession"]] = relationship(back_populates="recipe")


class RecipeVersion(Base):
    __tablename__ = "recipe_versions"
    __table_args__ = (UniqueConstraint("recipe_id", "version_number", name="uq_recipe_versions_recipe_version"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipe_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    changelog: Mapped[str | None] = mapped_column(Text, nullable=True)
    schema_version: Mapped[str] = mapped_column(Text, nullable=False)
    raw_ingredients: Mapped[list[str]] = mapped_column(JsonList, nullable=False)
    raw_directions: Mapped[list[str]] = mapped_column(JsonList, nullable=False)
    raw_ner: Mapped[list[str] | None] = mapped_column(JsonList, nullable=True)
    created_at: Mapped[datetime] = created_at_column()

    recipe: Mapped["Recipe"] = relationship(back_populates="versions", foreign_keys=[recipe_id])
    ingredients: Mapped[list["RecipeIngredient"]] = relationship(back_populates="recipe_version")
    steps: Mapped[list["RecipeStep"]] = relationship(back_populates="recipe_version")
    cooking_sessions: Mapped[list["CookingSession"]] = relationship(back_populates="recipe_version")


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipe_version_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("recipe_versions.id", ondelete="CASCADE"), nullable=False)
    ingredient_text: Mapped[str] = mapped_column(Text, nullable=False)
    ner_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)

    recipe_version: Mapped["RecipeVersion"] = relationship(back_populates="ingredients")


class RecipeStep(Base):
    __tablename__ = "recipe_steps"
    __table_args__ = (UniqueConstraint("recipe_version_id", "step_number", name="uq_recipe_steps_version_step"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipe_version_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("recipe_versions.id", ondelete="CASCADE"), nullable=False)
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    instruction_text: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)

    recipe_version: Mapped["RecipeVersion"] = relationship(back_populates="steps")
    session_timers: Mapped[list["SessionTimer"]] = relationship(back_populates="step")


class CookingSession(Base):
    __tablename__ = "cooking_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipe_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    recipe_version_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("recipe_versions.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[CookingSessionStatus] = mapped_column(Enum(CookingSessionStatus, name="cooking_session_status"), default=CookingSessionStatus.CREATED, nullable=False)
    current_step_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    servings_current: Mapped[int | None] = mapped_column(Integer, nullable=True)
    session_context: Mapped[dict | None] = mapped_column(JsonDict, nullable=True)
    started_at: Mapped[datetime] = created_at_column()
    last_active_at: Mapped[datetime] = updated_at_column()
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="cooking_sessions")
    recipe: Mapped["Recipe"] = relationship(back_populates="cooking_sessions")
    recipe_version: Mapped["RecipeVersion"] = relationship(back_populates="cooking_sessions")
    events: Mapped[list["CookingSessionEvent"]] = relationship(back_populates="session")
    timers: Mapped[list["SessionTimer"]] = relationship(back_populates="session")
    ai_interactions: Mapped[list["AiInteraction"]] = relationship(back_populates="session")


class CookingSessionEvent(Base):
    __tablename__ = "cooking_session_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cooking_sessions.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(Text, nullable=False)
    event_payload: Mapped[dict] = mapped_column(JsonDict, nullable=False)
    created_at: Mapped[datetime] = created_at_column()

    session: Mapped["CookingSession"] = relationship(back_populates="events")


class SessionTimer(Base):
    __tablename__ = "session_timers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cooking_sessions.id", ondelete="CASCADE"), nullable=False)
    step_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("recipe_steps.id", ondelete="SET NULL"), nullable=True)
    label: Mapped[str] = mapped_column(Text, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    started_at: Mapped[datetime] = created_at_column()
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[SessionTimerStatus] = mapped_column(Enum(SessionTimerStatus, name="session_timer_status"), default=SessionTimerStatus.RUNNING, nullable=False)

    session: Mapped["CookingSession"] = relationship(back_populates="timers")
    step: Mapped["RecipeStep | None"] = relationship(back_populates="session_timers")


class AiInteraction(Base):
    __tablename__ = "ai_interactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("cooking_sessions.id", ondelete="SET NULL"), nullable=True)
    context_type: Mapped[str] = mapped_column(Text, nullable=False)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    output_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    structured_output: Mapped[dict | None] = mapped_column(JsonDict, nullable=True)
    model_name: Mapped[str] = mapped_column(Text, nullable=False)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = created_at_column()

    user: Mapped["User"] = relationship(back_populates="ai_interactions")
    session: Mapped["CookingSession | None"] = relationship(back_populates="ai_interactions")
