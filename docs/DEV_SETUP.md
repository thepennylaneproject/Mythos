# Mythos Dev Setup

Prereqs:
- Node.js `v20` (`nvm use` reads `.nvmrc`)
- pnpm `9.x` (corepack works too)

Install:
- `pnpm install`

Run web:
- `pnpm --filter mythos-web dev` (or `pnpm dev:web`)

Workers:
- TODO: add a combined worker launcher; individual scripts live in `packages/workers/package.json`.

Env:
- Copy `apps/web/.env.example` to `.env.local` with your keys.
- Database defaults in `infra/compose.yaml` point to Postgres on `localhost:5432`.

Notes:
- Linting uses Next.js defaults; base TS config lives in `configs/ts/base.tsconfig.json`.
- OAuth callbacks are stubbed; wire real token exchange later.
