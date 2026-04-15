CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_status') THEN
    CREATE TYPE recipe_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_visibility') THEN
    CREATE TYPE recipe_visibility AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cooking_session_status') THEN
    CREATE TYPE cooking_session_status AS ENUM ('CREATED', 'ACTIVE', 'PAUSED', 'AWAITING_TIMER', 'COMPLETED', 'ABANDONED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_timer_status') THEN
    CREATE TYPE session_timer_status AS ENUM ('RUNNING', 'COMPLETED', 'CANCELED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  skill_level TEXT,
  timezone TEXT,
  locale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dietary_preferences JSONB,
  allergen_flags JSONB,
  disliked_ingredients JSONB,
  cuisine_preferences JSONB,
  max_prep_time_minutes INTEGER,
  household_size INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  current_version_id UUID UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT UNIQUE,
  source_name TEXT,
  source_site TEXT,
  hero_image_url TEXT,
  status recipe_status NOT NULL DEFAULT 'DRAFT',
  visibility recipe_visibility NOT NULL DEFAULT 'PUBLIC',
  cuisine_type TEXT,
  meal_type TEXT,
  difficulty_level TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER,
  servings_default INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changelog TEXT,
  schema_version TEXT NOT NULL,
  raw_ingredients JSONB NOT NULL,
  raw_directions JSONB NOT NULL,
  raw_ner JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (recipe_id, version_number)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'recipes_current_version_id_fkey'
  ) THEN
    ALTER TABLE recipes
      ADD CONSTRAINT recipes_current_version_id_fkey
      FOREIGN KEY (current_version_id)
      REFERENCES recipe_versions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id UUID NOT NULL REFERENCES recipe_versions(id) ON DELETE CASCADE,
  ingredient_text TEXT NOT NULL,
  ner_name TEXT,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id UUID NOT NULL REFERENCES recipe_versions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  UNIQUE (recipe_version_id, step_number)
);

CREATE TABLE IF NOT EXISTS cooking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_version_id UUID NOT NULL REFERENCES recipe_versions(id) ON DELETE CASCADE,
  status cooking_session_status NOT NULL DEFAULT 'CREATED',
  current_step_number INTEGER NOT NULL DEFAULT 1,
  servings_current INTEGER,
  session_context JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cooking_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES recipe_steps(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  status session_timer_status NOT NULL DEFAULT 'RUNNING'
);

CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES cooking_sessions(id) ON DELETE SET NULL,
  context_type TEXT NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT,
  structured_output JSONB,
  model_name TEXT NOT NULL,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipes_author_user_id ON recipes(author_user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_source_site ON recipes(source_site);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe_id ON recipe_versions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_version_id ON recipe_ingredients(recipe_version_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_version_id ON recipe_steps(recipe_version_id);
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_user_id ON cooking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_recipe_id ON cooking_sessions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_cooking_session_events_session_id ON cooking_session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_timers_session_id ON session_timers(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session_id ON ai_interactions(session_id);

CREATE OR REPLACE VIEW recipe_library_view AS
SELECT
  r.id AS recipe_id,
  r.title,
  r.source_name,
  r.source_site,
  r.source_url,
  r.status,
  r.visibility,
  r.created_at,
  rv.id AS recipe_version_id,
  rv.version_number,
  COALESCE(jsonb_array_length(rv.raw_ingredients), 0) AS ingredient_count,
  COALESCE(jsonb_array_length(rv.raw_directions), 0) AS step_count
FROM recipes r
LEFT JOIN recipe_versions rv ON rv.id = r.current_version_id
ORDER BY r.created_at DESC;
