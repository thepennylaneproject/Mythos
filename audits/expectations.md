# Mythos — Expectations Document

> Source: `the_penny_lane_project/Mythos/mythos_report.md`
> Last reviewed: 2026-03-08

---

## 1. Language and Runtime Constraints

### 1.1 TypeScript across all packages
All packages in the monorepo (`apps/web`, `packages/ai-engine`, `packages/ui`, `packages/workers`) must be TypeScript. Plain `.js` source files are not permitted. File `warning` for any new `.js` source file added to a package.

### 1.2 Next.js 14 App Router
The web application (`apps/web`) uses **Next.js 14 with the App Router**. Pages Router patterns must not be introduced. File `warning` for any route created outside `apps/web/app/`.

### 1.3 Node.js v20
The runtime is Node.js v20 as declared in `.nvmrc`. Build or runtime configuration targeting a different Node version must be filed `warning`.

### 1.4 pnpm + Turborepo monorepo
The workspace uses pnpm with Turborepo. Do not introduce npm or Yarn workspace configs. File `warning` for any `package-lock.json` or `yarn.lock` committed to the repo.

---

## 2. Database Constraints

### 2.1 PostgreSQL via Drizzle ORM
The primary database is PostgreSQL, accessed exclusively via Drizzle ORM (`drizzle-orm`). Do not write raw SQL outside of Drizzle's query builder. Do not introduce another ORM (Prisma, TypeORM, etc.). File `critical` for any new ORM or raw SQL outside of Drizzle.

### 2.2 Drizzle migrations only
Schema changes must be managed through Drizzle Kit migrations in `apps/web/drizzle/`. Manual schema changes applied directly to the database without a corresponding migration file must be filed `critical`.

### 2.3 Parameterized queries
Drizzle parameterizes queries by default. Do not use `sql.raw()` or template literal SQL with user-supplied input. File `critical` for any SQL injection surface.

### 2.4 Schema in `apps/web/lib/schema.ts`
The canonical Drizzle schema is defined in `apps/web/lib/schema.ts`. The duplicate file `apps/web/lib/schemats.ts` is an artifact and must be removed. File `warning` if `schemats.ts` persists or new duplicate schema files are added.

---

## 3. Authentication and Authorization

### 3.1 NextAuth v5 (Auth.js) is the auth framework
Authentication is handled by NextAuth v5. Do not replace or bypass NextAuth. File `critical` for any auth implementation that bypasses NextAuth session management.

### 3.2 All sensitive routes protected by `withAuth()`
API routes that read or write user/organization data must use the `withAuth()` higher-order function. Routes without `withAuth()` that expose user data are a security vulnerability. File `critical` for any authenticated data route missing `withAuth()`.

### 3.3 RBAC roles: `owner`, `admin`, `editor`, `viewer`
Role-based access control is defined in `apps/web/lib/permissions/index.ts`. The four valid roles are `owner`, `admin`, `editor`, and `viewer`. Do not introduce new roles or alter role permissions without a documented decision. File `warning` for any unauthorized role modification.

### 3.4 Middleware protects dashboard routes
The `middleware.ts` file must continue to protect `/dashboard`, `/projects`, `/campaigns`, and `/composer` — redirecting unauthenticated users to `/login`. File `critical` for any middleware change that removes route protection from these paths.

---

## 4. AI and External Service Constraints

### 4.1 OpenAI is the primary AI provider
The AI engine (`packages/ai-engine`) uses OpenAI (`gpt-4-turbo-preview`, `text-embedding-3-small`). The Anthropic SDK is imported but not yet wired. Do not add new AI providers directly in route handlers or components — all AI calls must go through `packages/ai-engine`. File `warning` for any direct AI provider call outside the `ai-engine` package.

### 4.2 OAuth vendor tokens stored in `vendor_tokens` table
Social platform OAuth access tokens must be stored in the `vendor_tokens` table. Tokens must not be stored in other tables, in-memory only, or in plaintext in environment variables. File `warning` for token storage outside the designated table.

### 4.3 Stripe SDK must be in `package.json` before billing goes live
The Stripe SDK is not yet installed (`stripeCustomerId`/`stripeSubscriptionId` fields exist in schema, but no SDK). Before any billing feature is deployed, the Stripe SDK must be added to `package.json` and webhook signature verification must be implemented. File `critical` for any Stripe billing route deployed without webhook verification.

### 4.4 Upstash Redis used for job queue
The publish, analytics, and content generation job queue uses Upstash Redis. Do not replace the queue with an in-memory or database-backed queue without explicit approval. File `warning` for any queue change.

---

## 5. Publish Pipeline

### 5.1 `POST /api/publish` must not return a mock response in production
Currently `publish/route.ts` returns `{ jobId: "pub-123" }` — a mock. This stub must be replaced with real job enqueueing before the publish feature is marked production-ready. File `critical` if the mock response is present on a production branch.

### 5.2 Publish worker must be wired to Redis queue
`packages/workers/src/publish.worker.ts` must consume from the Redis queue and call the correct platform publisher. File `critical` if workers are not consuming from the queue in production.

---

## 6. Feature Gating

### 6.1 `canPerformAction()` must be enforced in API routes
The `canPerformAction()` function in `packages/ai-engine/src/usage-metering.ts` checks usage against plan limits. This function is not yet called from any API route. Before any plan-gated feature ships, `canPerformAction()` must be invoked from the relevant route. File `warning` for any gated feature that bypasses this check.

---

## 7. Code Quality

### 7.1 No duplicate worker files
`packages/workers/src/publishing.worker.ts` and `packages/workers/src/publish.worker.ts` may be duplicates. Confirm the correct canonical file and remove the duplicate. File `warning` if both files continue to coexist with overlapping logic.

### 7.2 Unused worker scripts must be referenced or removed
`campaign.worker.ts`, `research.worker.ts`, `knowledge.worker.ts`, and `scheduler.worker.ts` are not referenced in `package.json` scripts. They must either be wired up or explicitly documented as pending work. File `suggestion` for workers not in the `package.json` scripts section.

### 7.3 `MiniBarChart` TODO must be resolved before production
The `MiniBarChart` component in `packages/ui` currently renders a TODO message when data is absent. This must be replaced with real charting before the analytics dashboard goes live. File `warning` if TODO output renders in a production build.

### 7.4 `preflight.ts` must not stub in production
`preflight.ts`'s `preflightCheckPost()` always returns `{ ok: true }`. This must be replaced with a real pre-publish validation before the publishing feature goes live. File `warning` if the stub is present on a production branch.

---

## 8. Testing

### 8.1 Vitest unit tests must remain passing
Existing tests in `apps/web/__tests__/` (permissions, UTM utilities) must continue to pass. File `critical` for any code change that causes test failures.

### 8.2 No new production features without tests
Before any new feature moves from Alpha to production, at least one integration or unit test must be added for the critical path. File `suggestion` for new features added without corresponding tests.

---

## 9. Security

### 9.1 No secrets in environment files committed to source
`NEXTAUTH_SECRET`, `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_TOKEN`, and all other secrets must be in `.env.local` (gitignored) or CI secrets — never committed. File `critical` for any committed secret.

### 9.2 No `dangerouslySetInnerHTML` without sanitization
If `dangerouslySetInnerHTML` must be used, the content must be sanitized first (DOMPurify or equivalent). File `critical` for any unsanitized `dangerouslySetInnerHTML` usage.

### 9.3 Rate limiting must be added before public launch
No rate limiting is currently implemented. Before the application goes live at a public URL, rate limiting middleware must be added to API routes. File `warning` for a public deployment lacking rate limiting.

---

## 10. Out-of-Scope Constraints

- Do not deploy to a production URL without completing items 5.1, 5.2, and 4.3
- Do not expose the TikTok publishing channel in UI until a publisher implementation exists
- The `apps/web/app/(dev)/seed` route must be disabled or removed before public deployment
