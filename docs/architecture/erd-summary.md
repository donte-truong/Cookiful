# ERD Summary

## Core Entity Groups

### Identity

- `users` 1:1 `user_profiles`
- `users` 1:1 `user_preferences`
- `users` 1:N `pantry_items`

### Social

- `users` N:N `users` through `follows`
- `users` N:N `recipes` through `recipe_likes`
- `users` N:N `recipes` through `saved_recipes`
- `users` 1:N `collections`
- `collections` 1:N `collection_items`

### Recipes

- `recipes` 1:N `recipe_versions`
- `recipe_versions` 1:N `recipe_ingredients`
- `recipe_versions` 1:N `recipe_steps`
- `recipes` 1:N `recipe_tags`
- `ingredients` 1:N `recipe_substitutions`

### Cooking Runtime

- `users` 1:N `cooking_sessions`
- `recipes` 1:N `cooking_sessions`
- `cooking_sessions` 1:N `cooking_session_events`
- `cooking_sessions` 1:N `session_timers`
- `cooking_sessions` 1:N `session_substitutions`
- `cooking_sessions` 1:N `ai_interactions`

### Meal Planning and Grocery

- `users` 1:N `meal_plans`
- `meal_plans` 1:N `meal_plan_entries`
- `users` 1:N `grocery_lists`
- `grocery_lists` 1:N `grocery_items`

### Recommendation and Search

- `recipes` 1:1 `recipe_embeddings`
- `users` 1:1 `user_taste_profiles`
- `users` 1:N `recommendation_impressions`
- `users` 1:N `recommendation_actions`

### Notifications

- `users` 1:N `notifications`

## Important Integrity Notes

- `meal_plan_entries` should snapshot `recipe_version_id` when possible
- `cooking_sessions` should point to a concrete `recipe_version_id`
- user-owned tables should consistently carry `user_id`
- grocery generation should preserve source references for explainability

