# Cooking Session State Machine

## Purpose

The cooking session runtime should model user progress explicitly so the UI, timers, and AI actions all operate on known state.

## Session States

- `created`: session exists but active cooking has not started
- `active`: user is progressing through steps
- `paused`: user temporarily stopped but session remains resumable
- `awaiting_timer`: waiting on an active timer before next expected action
- `completed`: user finished the recipe
- `abandoned`: session expired or was explicitly discarded

## Step-Level State

Each session should also track:

- `current_step_number`
- `servings_current`
- active substitutions
- active timers
- last AI interaction summary

## Main Transitions

1. `created -> active`
   Trigger: user starts cooking

2. `active -> awaiting_timer`
   Trigger: user or AI creates a blocking timer

3. `awaiting_timer -> active`
   Trigger: timer completes or user dismisses it

4. `active -> paused`
   Trigger: user pauses session

5. `paused -> active`
   Trigger: user resumes session

6. `active -> completed`
   Trigger: final step confirmed complete

7. `created|active|paused|awaiting_timer -> abandoned`
   Trigger: user exits permanently or cleanup job expires stale session

## Guardrails

- step advancement must remain within recipe bounds
- timers must belong to the session owner
- AI cannot mutate session state outside allowed action types
- substitutions must be validated against allergy and incompatibility rules

