# Backend Module Outline

## Application Modules

### `auth`

- registration
- login
- refresh/logout
- password reset
- token issuance

### `users`

- public profiles
- preferences
- pantry settings
- dietary constraints

### `social`

- follows
- likes
- saves
- shares
- collections

### `recipes`

- recipe CRUD
- versioning
- ingredients
- steps
- metadata
- substitutions

### `feed`

- candidate generation
- ranking
- deduplication
- feed assembly

### `search`

- text search
- semantic search later
- filters and suggestions

### `cooking-sessions`

- session creation
- step progression
- timers
- substitution tracking
- event log

### `meal-planning`

- meal plans
- meal plan entries
- calendar projections

### `grocery`

- grocery list generation
- normalization
- pantry deduction
- manual override handling

### `notifications`

- in-app notifications
- push and email hooks
- reminders

### `ai-orchestration`

- prompt construction
- tool routing
- JSON validation
- safety checks

### `analytics`

- event capture
- funnel metrics
- recommendation outcomes

### `admin`

- moderation
- flagged content
- internal review tools

## Suggested `apps/api` Layout

```text
apps/api/src
  app.module.ts
  main.ts
  common/
    auth/
    config/
    db/
    errors/
    logging/
    validation/
  modules/
    auth/
    users/
    social/
    recipes/
    feed/
    search/
    cooking-sessions/
    meal-planning/
    grocery/
    notifications/
    ai-orchestration/
    analytics/
    admin/
```

