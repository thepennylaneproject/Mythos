# Mythos — AI-powered social media marketing platform

> Part of <a href="https://thepennylaneproject.org">The Penny Lane Project</a> — technology that serves the individual.

## What This Is

Mythos is an AI-driven marketing platform that helps creators and brands plan, generate, schedule, and publish content across social networks. It combines a campaign planner, AI copy engine, multi-platform publisher, analytics aggregator, and a community CRM into a single product. The target audience is independent creators, small agencies, and growth teams who want AI-assisted workflows without enterprise lock-in.

## Current Status

**Alpha** — Core infrastructure is in place: Next.js app with NextAuth, Drizzle ORM, a job queue, and worker processes for publishing, scheduling, and content generation. The publishing pipeline, campaign agent, and AI copy engine are actively being wired to real platform SDKs (Meta, LinkedIn, Twitter/X).

## Technical Overview

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend:** Next.js API Routes (serverless-compatible), long-running workers via `tsx`
- **Database:** PostgreSQL via Drizzle ORM; Upstash Redis for job queue
- **AI:** OpenAI (content generation), Anthropic (fallback), Brave Search (research), Upstash Vector (brand knowledge embeddings)
- **Auth:** NextAuth v5 (Google, GitHub, email magic-link)
- **Deployment:** Docker Compose (self-hosted) or Vercel + managed Postgres

## Architecture

Monorepo (pnpm workspaces + Turborepo) split into three packages:

- `apps/web` — Next.js web application and all API routes
- `packages/ai-engine` — Shared AI logic: content generation, campaign agent, publishing agent, vector search
- `packages/workers` — Long-running background processes: scheduler, queue consumer, per-topic workers (publish, analytics, copy, image, research)

The queue is Upstash Redis-backed with a poll loop in `queue-consumer.ts`. The scheduler polls for due posts and marks them `ready_to_publish`; the publish worker picks them up and dispatches to platform SDKs.

## Development

```bash
# Install dependencies
pnpm install

# Start local Postgres + Redis (requires Docker)
docker compose -f infra/compose.yaml up -d

# Run migrations
pnpm db:push

# Start the web app
pnpm dev

# Start background workers (in a separate terminal)
pnpm --filter mythos-workers run dev:scheduler
pnpm --filter mythos-workers run consume
```

See [`docs/DEV_SETUP.md`](docs/DEV_SETUP.md) for full environment variable reference.

## License

All rights reserved — The Penny Lane Project
