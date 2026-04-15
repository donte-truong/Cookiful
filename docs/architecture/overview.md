# Architecture Overview

## Recommended Shape

Cookiful should begin as a modular monolith with one backend codebase and strong internal module boundaries.

### Primary runtime components

- Web app: Next.js
- Mobile app: Expo / React Native
- API app: NestJS-oriented modular backend
- Worker app: async jobs, indexing, notifications, grocery regeneration
- Postgres: system of record
- Redis: queue, cache, ephemeral session state
- Object storage: media assets and exports
- LLM layer: structured tool-calling for recipe assistance

## Core Product Domains

- Identity and social
- Recipe content
- Interactive cooking runtime
- Meal planning and grocery planning
- Intelligence and personalization

## Principles

- Structured core, generative edges
- Postgres is the source of truth
- Async processing for heavy and slow workflows
- Provider-neutral abstractions for auth and storage
- Explicit module boundaries before service extraction

## Target Extraction Candidates Later

- Recommendation service
- Search service
- AI orchestration service
- Notification service

