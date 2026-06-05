CREATE TABLE IF NOT EXISTS user_pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_user_pantry_items_user_id
  ON user_pantry_items(user_id);

CREATE INDEX IF NOT EXISTS idx_user_pantry_items_user_normalized_name
  ON user_pantry_items(user_id, normalized_name);
