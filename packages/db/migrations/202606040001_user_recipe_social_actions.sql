CREATE TABLE IF NOT EXISTS user_recipe_social_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('like', 'save', 'repost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, recipe_id, action_type)
);

CREATE INDEX IF NOT EXISTS idx_user_recipe_social_actions_user_id
  ON user_recipe_social_actions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_recipe_social_actions_recipe_id
  ON user_recipe_social_actions(recipe_id);

CREATE INDEX IF NOT EXISTS idx_user_recipe_social_actions_user_action_created
  ON user_recipe_social_actions(user_id, action_type, created_at DESC);
