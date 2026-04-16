# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Behavioral Guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Project: PLANKA

Kanban board (Trello-like). Monorepo with two independent Node.js apps:

- `server/` -- Sails.js MVC REST API + WebSocket backend, PostgreSQL via Waterline ORM
- `client/` -- React SPA (Vite, Redux + Redux-Saga, redux-orm, React Router)

## Commands

All commands from repo root unless noted.

```bash
# Install all dependencies
npm install

# Dev (requires running PostgreSQL)
npm start                          # both server (1337) + client (3000)
npm run server:start               # server only, nodemon hot-reload
npm run client:start               # client only, vite dev server

# Docker dev (no local Node/Postgres required)
docker compose -f docker-compose-dev.yml up

# Database
npm run server:db:init             # create schema (first run)
npm run server:db:migrate          # run pending knex migrations
npm run server:db:seed             # seed demo data
npm run server:db:create-admin-user

# Build
npm run server:build
npm run client:build

# Lint
npm run lint                       # both
npm run server:lint
npm run client:lint

# Tests
npm test                           # both suites
npm run server:test                # mocha integration tests
npm run client:test                # jest unit tests

# Run a single server test file
cd server && npx mocha test/lifecycle.test.js test/integration/path/to/file.test.js

# Regenerate Swagger spec
npm run server:swagger:generate

# Update version files after bumping package.json version
npm run gv
```

## Architecture

### Server (Sails.js)

- `server/app.js` -- entry point; loads `.env`, lifts Sails
- `server/config/` -- Sails config: `routes.js`, `policies.js`, `custom.js` (env/feature flags), `datastores.js` (DB)
- `server/api/controllers/` -- one folder per resource (e.g. `cards/`, `boards/`); each folder has action files
- `server/api/models/` -- Waterline ORM models, one per entity
- `server/api/helpers/` -- reusable service logic called by controllers
- `server/api/hooks/` -- custom Sails hooks (lifecycle, file manager, etc.)
- `server/api/policies/` -- auth middleware applied per route
- `server/db/migrations/` -- Knex migrations for schema changes
- `server/config/env/` -- environment-specific Sails config overrides

Exposes REST API under `/api/`. Serves built client SPA as static files. Real-time via Sails sockets (socket.io).

### Client (React/Redux)

- `client/src/store.js` -- Redux store with redux-saga middleware and optional DevTools
- `client/src/sagas/` -- redux-saga side-effects, one file per domain
- `client/src/actions/` -- action creators / action types
- `client/src/reducers/` -- Redux reducers
- `client/src/selectors/` -- reselect selectors
- `client/src/models/` -- redux-orm model definitions (client-side relational cache)
- `client/src/components/` -- React components
- `client/src/entry-actions/` -- high-level action creators that dispatch into sagas
- `client/src/api/` -- fetch wrappers for server API calls
- `client/src/locales/` -- i18n translation files

Dev: client proxies to server at port 1337 via `PROXY_TARGET` env var.

### Data Model (core hierarchy)

`Project` -> `Board` -> `List` -> `Card`

Cards have: Labels, Memberships, Attachments, Comments, CustomFieldValues, TaskLists/Tasks, Subscriptions.
Boards have: Memberships, Labels, BackgroundImages.

### Key env vars (server)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `BASE_URL` | Public URL of the instance |
| `S3_*` | S3-compatible storage (optional; local disk otherwise) |
| `OIDC_*` | OpenID Connect SSO |
| `SMTP_*` | Email notifications |

## Coding Conventions

- JavaScript only (no TypeScript)
- Airbnb style guide via ESLint + Prettier (printWidth 100, singleQuote, trailingComma all)
- Pre-commit hook runs lint-staged automatically
- Commit messages: Conventional Commits, subject <= 70 chars, imperative mood
