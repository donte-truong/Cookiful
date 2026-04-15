# MVP Endpoint Draft

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`

## Profiles

- `GET /profiles/:username`
- `PATCH /me/profile`
- `PATCH /me/preferences`

## Feed

- `GET /feed/home`
- `GET /feed/discover`
- `GET /feed/following`

## Recipes

- `GET /recipes/:id`
- `GET /recipes/:id/interactive`
- `POST /recipes/:id/like`
- `POST /recipes/:id/save`

## Collections

- `GET /me/collections`
- `POST /collections`
- `POST /collections/:id/items`

## Search

- `GET /search/recipes`
- `GET /search/users`
- `GET /search/suggestions`

## Cooking Sessions

- `POST /recipes/:id/sessions`
- `GET /sessions/:id`
- `POST /sessions/:id/events`
- `POST /sessions/:id/timers`
- `POST /sessions/:id/ai-query`

## Meal Planning

- `GET /meal-plans/current`
- `POST /meal-plans`
- `GET /meal-plans/:id`
- `POST /meal-plans/:id/entries`
- `PATCH /meal-plan-entries/:id`
- `DELETE /meal-plan-entries/:id`

## Grocery

- `GET /grocery-lists/current`
- `POST /grocery-lists/regenerate`
- `PATCH /grocery-items/:id`
- `POST /grocery-items`

## First 10 Endpoints To Implement

1. `POST /auth/register`
2. `POST /auth/login`
3. `GET /feed/home`
4. `GET /recipes/:id`
5. `POST /recipes/:id/like`
6. `POST /recipes/:id/save`
7. `GET /search/recipes`
8. `POST /recipes/:id/sessions`
9. `GET /sessions/:id`
10. `POST /sessions/:id/ai-query`

