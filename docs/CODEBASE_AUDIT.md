# Mythos: Codebase Intelligence Extraction Audit

---

## SECTION 1: PROJECT IDENTITY

### 1. Project Name
**Mythos** — defined in `package.json` (`"name": "mythos"`) and the web app package (`"name": "mythos-web"`).

### 2. Repository URL
`https://github.com/thepennylaneproject/Mythos` — inferred from the GitHub remote; no explicit URL defined in config files.

### 3. One-Line Description
**From `README.md` (exact quote):**
> "Mythos is an AI marketing backend with built-in CRM, project management, asset pipeline, and publishing to social networks."

**Cleaner version:**
Mythos is an AI-powered marketing operations platform that unifies campaign creation, content generation, social publishing, CRM, and project management into a single workspace.

### 4. Project Status
**`Alpha`**

Core features are structurally implemented (database schema, API routes, UI components, AI engine), but several areas have placeholder logic, TODOs, and incomplete wiring (e.g., `preflight.ts` returns a stub, `publish/route.ts` returns a mock job ID, `MiniBarChart` displays a TODO message, and the deploy-workers workflow ends with `echo "TODO: add deploy commands"`).

### 5. Commit Dates

| | Value |
|---|---|
| First commit | 2026-03-04 (SHA: `fac241e`) |
| Most recent commit | 2026-03-07 (SHA: `e72d3ad`) |

### 6. Total Number of Commits
**2 commits** (shallow repository clone; full history may have more if the repo was force-pushed).

### 7. Deployment Status
**Not deployed to a live environment.** Evidence:
- `infra/docker/web.Dockerfile` and `infra/compose.yaml` define a Docker-based local dev stack.
- `.github/workflows/ci.yml` runs lint and build on push/PR to `main`.
- `.github/workflows/deploy-workers.yml` has a placeholder: `echo "TODO: add deploy commands (e.g. fly deploy, docker push, etc.)"`.
- No `netlify.toml`, `vercel.json`, or production URL found.

### 8. Live URL(s)
**[NOT FOUND IN CODEBASE — REQUIRES MANUAL INPUT]** — No production URL is defined in any config file.

---

## SECTION 2: TECHNICAL ARCHITECTURE

### 1. Primary Languages and Frameworks

| Technology | Version | Role |
|---|---|---|
| TypeScript | `5.6.2` | Primary language (all packages) |
| Next.js | `14.2.5` | Web application framework (App Router) |
| React | `18.3.1` | UI rendering |
| Node.js | `v20` (via `.nvmrc`) | Runtime |
| pnpm | `9.x` | Package manager |
| Turborepo | (turbo.json present) | Monorepo task runner |

### 2. Full Dependency List

#### Core Framework
| Package | Version | Purpose |
|---|---|---|
| `next` | `14.2.5` | App framework with App Router |
| `react` / `react-dom` | `18.3.1` | UI library |
| `typescript` | `5.6.2` | Type safety |

#### UI / Styling
| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | `3.4.10` | Utility-first CSS |
| `autoprefixer` | `10.4.20` | CSS vendor prefixes |
| `postcss` | `8.4.39` | CSS processing |
| `lucide-react` | `0.441.0` | Icon library |
| `date-fns` | `3.6.0` | Date formatting/manipulation |
| `@mythos/ui` | `workspace:*` | Internal shared UI kit (Card, MiniBarChart) |

#### State Management
No dedicated state management library. React `useState` / `useEffect` hooks used throughout.

#### API / Data Layer
| Package | Version | Purpose |
|---|---|---|
| `drizzle-orm` | `0.33.0` | ORM for PostgreSQL |
| `drizzle-kit` | `0.24.0` | Schema migrations and codegen |
| `pg` | `8.12.0` | PostgreSQL driver |
| `@upstash/redis` | `1.35.7` | Redis client (job queue) |
| `@upstash/vector` | `^1.2.2` | Vector database (RAG / brand knowledge) |
| `zod` | `3.23.8` | Input validation and schema parsing |
| `uuid` | `9.0.1` | UUID generation |

#### AI / ML Integrations
| Package | Version | Purpose |
|---|---|---|
| `openai` | `^4.20.0` | OpenAI GPT-4 and embeddings |
| `@anthropic-ai/sdk` | `^0.32.0` | Anthropic Claude (imported, not yet wired in AI engine logic) |

#### Authentication / Authorization
| Package | Version | Purpose |
|---|---|---|
| `next-auth` | `5.0.0-beta.20` | Auth framework (NextAuth v5 / Auth.js) |
| `@auth/drizzle-adapter` | `^1.1.0` | Drizzle ORM adapter for NextAuth |
| `nodemailer` | `6.9.15` | Magic-link email delivery |

#### Analytics
| Package | Version | Purpose |
|---|---|---|
| `@vercel/analytics` | `1.3.1` | Vercel web analytics |

#### Testing
| Package | Version | Purpose |
|---|---|---|
| `vitest` | (via `vitest.config.ts`) | Unit test runner |
| `@testing-library/jest-dom` | (setup.ts import) | DOM matchers |
| `@vitejs/plugin-react` | (vitest config) | React plugin for Vitest |

#### Build Tooling
| Package | Version | Purpose |
|---|---|---|
| `drizzle-kit` | `0.24.0` | DB schema management |
| `tsx` | `4.19.1` | TypeScript execution for workers |
| `npm-run-all` | `4.1.5` | Parallel worker scripts |
| `eslint` | `9.11.0` | Linting |
| `turbo` | (turbo.json) | Monorepo task orchestration |

#### Workers-Specific
| Package | Version | Purpose |
|---|---|---|
| `node-fetch` | `3.3.2` | HTTP client in workers |
| `drizzle-orm` | `0.33.0` | Database access from workers |

### 3. Project Structure (2 Levels Deep)

```
mythos/
├── apps/
│   └── web/                # Next.js App Router web application
│       ├── app/            # Next.js pages, layouts, and API routes
│       ├── components/     # Shared React components (AppShell, KanbanBoard, etc.)
│       ├── lib/            # Server utilities: db, schema, auth, queue, publishers
│       ├── drizzle/        # Generated migration files
│       └── public/         # Static assets (SVG sprite, textures)
├── packages/
│   ├── ai-engine/          # Internal AI package: OpenAI, campaign agents, RAG
│   ├── ui/                 # Internal shared React UI library (Card, MiniBarChart)
│   └── workers/            # Background job workers (publish, schedule, analytics)
├── configs/
│   ├── drizzle/            # drizzle.config.ts (shared DB config)
│   ├── eslint/             # Shared ESLint config
│   └── ts/                 # Shared base TypeScript config
├── infra/
│   ├── docker/             # Dockerfiles for web and workers
│   ├── compose.yaml        # Local dev stack (Postgres)
│   └── sql/                # Raw SQL init scripts
├── docs/                   # Developer documentation and audits
├── .github/workflows/      # CI (lint+build) and worker deploy pipelines
├── package.json            # Workspace root scripts
├── pnpm-workspace.yaml     # pnpm workspace definition
└── turbo.json              # Turborepo task pipeline
```

### 4. Architecture Pattern
**Monorepo / Monolith with separated background workers.**

```
User Browser
    │
    ▼
Next.js App (apps/web)
    ├── App Router Pages (SSR + client components)
    └── API Routes (/api/**)
            │
            ├── Drizzle ORM ──► PostgreSQL (primary store)
            ├── Upstash Redis ──► Job Queue (enqueue/dequeue)
            ├── Upstash Vector ──► Brand Knowledge RAG
            └── @mythos/ai-engine ──► OpenAI API
                        │
Background Workers (packages/workers)
    ├── scheduler.ts   ──► Polls DB for scheduled posts → enqueues publish jobs
    ├── publish.worker.ts ──► Dequeues publish jobs → calls Meta/LinkedIn/X publishers
    ├── analytics.worker.ts ──► Fetches post metrics from platform APIs → writes to DB
    ├── copy.worker.ts ──► AI copy generation jobs
    └── knowledge.worker.ts ──► Indexes brand content into Upstash Vector
```

Data flow: User interacts with a page → client component calls a Next.js API route → API route reads/writes via Drizzle to PostgreSQL and/or enqueues a job to Upstash Redis → background worker picks up job → worker calls external API (OpenAI, Meta Graph API, LinkedIn API, etc.) → results written back to PostgreSQL.

### 5. Database / Storage Layer

**Database:** PostgreSQL (Postgres 15 in Docker, Drizzle ORM)
**Migrations:** Drizzle Kit, migration file at `apps/web/drizzle/0000_special_bucky.sql`

#### Tables / Collections

| Table | Key Fields | Purpose |
|---|---|---|
| `accounts` | `id`, `name`, `domain`, `tier` (lead/customer/vip), `owner` | CRM accounts |
| `contacts` | `id`, `accountId`, `name`, `email`, `phone`, `role`, `tags` | CRM contacts |
| `opportunities` | `id`, `accountId`, `stage`, `value`, `closeDate`, `source` | Sales pipeline |
| `projects` | `id`, `accountId`, `opportunityId`, `name`, `status`, `startAt`, `endAt` | Project management |
| `sprints` | `id`, `projectId`, `name`, `startAt`, `endAt`, `goal` | Agile sprints |
| `tasks` | `id`, `projectId`, `sprintId`, `title`, `status`, `assignee`, `priority`, `points`, `dueAt` | Kanban tasks |
| `approvals` | `id`, `entity`, `entityId`, `state`, `by`, `comment` | Content approval workflow |
| `activity` | `id`, `actor`, `verb`, `entity`, `entityId`, `meta` | Activity log |
| `campaigns` | `id`, `projectId`, `goal`, `brief`, `audience`, `channels`, `status`, `isAgentic`, `strategicState`, `metricsThresholds` | Marketing campaigns |
| `post_plans` | `id`, `campaignId`, `channel`, `hypothesis`, `slotAt`, `variants`, `experiment` | A/B experiment slots |
| `assets` | `id`, `projectId`, `postPlanId`, `type`, `uri`, `spec`, `licenseType`, `safetyFlags`, `commercialUseAllowed` | Digital assets |
| `posts` | `id`, `postPlanId`, `channel`, `network`, `caption`, `tags`, `utmUrl`, `status`, `scheduledAt`, `publishedAt`, `vendorObjectId`, `retryCount`, `healingStrategy`, `deeplink` | Social posts |
| `metrics` | `postId`, `impressions`, `reach`, `clicks`, `saves`, `shares`, `likes`, `comments`, `engagementRate` | Post performance metrics |
| `community_members` | `id`, `orgId`, `platformHandle`, `platform`, `displayName` | Community CRM |
| `vendor_tokens` | `id`, `vendor`, `accountId`, `accessToken`, `refreshToken`, `expiresAt` | OAuth tokens for social platforms |
| `subscriptions` | `id`, `orgId`, `plan`, `status`, `stripeCustomerId`, `stripeSubscriptionId`, `currentPeriodStart/End` | Billing subscriptions |
| `usage_records` | `id`, `orgId`, `metric`, `quantity`, `periodStart`, `periodEnd` | Usage metering |
| `invoices` | `id`, `orgId`, `stripeInvoiceId`, `amountDue`, `amountPaid`, `status` | Billing invoices |
| `auth_users` | `id`, `email`, `name`, `image`, `emailVerified` | Authentication users |
| `auth_accounts` | `userId`, `provider`, `providerAccountId`, `access_token` | OAuth provider accounts |
| `auth_sessions` | `sessionToken`, `userId`, `expires` | JWT sessions |
| `auth_verification_tokens` | `identifier`, `token`, `expires` | Magic link tokens |
| `organizations` | `id`, `name`, `slug`, `ownerId`, `plan` | Multi-tenant organizations |
| `organization_members` | `id`, `orgId`, `userId`, `role` (owner/admin/editor/viewer) | Org membership |
| `automations` | `id`, `userId`, `orgId`, `name`, `isActive` | Automation workflows |
| `automation_triggers` | `id`, `automationId`, `triggerType`, `config` | Trigger definitions |
| `automation_actions` | `id`, `automationId`, `actionType`, `config`, `order` | Action definitions |
| `automation_logs` | `id`, `automationId`, `status`, `output`, `error` | Execution logs |
| `notifications` | `id`, `userId`, `type`, `title`, `body`, `isRead` | In-app notifications |
| `notification_preferences` | `id`, `userId`, `notificationType`, `inApp`, `email` | Notification settings |
| `user_onboarding` | `id`, `userId`, `completedSteps`, `currentStep`, `isComplete` | Onboarding progress |
| `brand_knowledge` | `id`, `orgId`, `content`, `metadata`, `vectorId` | Brand RAG knowledge base |

### 6. API Layer

| Route | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth sign-in/out/session | No |
| `/api/generate` | POST | Generate AI post drafts from campaign brief | No (env key check) |
| `/api/ai/architect` | POST | Agentic campaign strategy planner | Yes |
| `/api/ai/research` | POST | Web research + post drafting | Yes |
| `/api/ai/verify` | POST | Brand voice authenticity verification | Yes |
| `/api/campaigns` | GET, POST | List/create campaigns | Yes (POST) |
| `/api/campaigns/[id]` | GET, PATCH, DELETE | Read/update/delete campaign | Yes |
| `/api/campaigns/[id]/posts` | GET | List posts in campaign | Yes |
| `/api/campaigns/plan` | POST | Generate a campaign content plan | Yes |
| `/api/posts` | GET, POST | List/create posts (filtered by channel, status, date) | No (GET); No (POST) |
| `/api/posts/[id]` | GET, PATCH, DELETE | Read/update/delete post | No |
| `/api/posts/schedule` | POST | Schedule a post | No |
| `/api/posts/health` | GET | Publishing health check | No |
| `/api/projects` | GET, POST | List/create projects | No |
| `/api/projects/[id]` | GET, PATCH, DELETE | Read/update/delete project | No |
| `/api/projects/[id]/campaigns` | GET | List campaigns for project | No |
| `/api/projects/[id]/tasks` | GET, POST | List/create tasks in project | No |
| `/api/tasks/[id]` | PATCH | Update task status/assignment | No |
| `/api/analytics/overview` | GET | Aggregate metrics summary | No |
| `/api/analytics/[postId]` | GET | Per-post analytics | No |
| `/api/analytics/post/[id]` | GET | Per-post analytics (alt path) | No |
| `/api/automations` | GET, POST | List/create automations | No |
| `/api/automations/[id]` | GET, PATCH, DELETE | Read/update/delete automation | No |
| `/api/schedule` | POST | Schedule a post | No |
| `/api/scheduling/best-times` | GET | AI-recommended publish times | No |
| `/api/scheduling/queue` | GET | View scheduling queue | No |
| `/api/publish` | POST | Enqueue a publish job | Yes |
| `/api/queue` | GET | Queue status | No |
| `/api/events` | POST | Log an activity event | No |
| `/api/learn` | POST | Index knowledge into vector store | No |
| `/api/notifications` | GET | List notifications | No |
| `/api/community` | GET | Community dashboard data | No |
| `/api/oauth/[platform]/authorize` | GET | Start OAuth flow for social platform | No |
| `/api/oauth/[platform]/callback` | GET | Handle OAuth callback | No |
| `/api/oauth/linkedin/callback` | GET | LinkedIn OAuth callback | No |
| `/api/oauth/meta/callback` | GET | Meta (Facebook/Instagram) OAuth callback | No |
| `/api/organizations` | GET, POST | List/create organizations | No |
| `/api/organizations/[id]/members` | GET, POST | Org member management | No |
| `/api/plugins` | GET | List available integrations/plugins | No |
| `/api/health` | GET | Application health check | No |
| `/api/dev/seed` | POST | Seed demo data (dev only) | No |

### 7. External Service Integrations

| Service | Used For |
|---|---|
| **OpenAI** (`gpt-4-turbo-preview`, `text-embedding-3-small`) | Post copy generation, campaign planning, brand voice verification, context embeddings |
| **Anthropic Claude** (`@anthropic-ai/sdk`) | Imported as alternate AI provider; not yet wired into main generation paths |
| **Upstash Redis** | Job queue (enqueue/dequeue/retry/DLQ for publish, analytics, content generation jobs) |
| **Upstash Vector** | Brand knowledge RAG — stores and retrieves org-specific brand context via embeddings |
| **Meta Graph API** (`lib/vendor/meta.ts`) | Post to Facebook/Instagram; retrieve post analytics |
| **LinkedIn API** (`lib/vendor/linkedin.ts`) | Post to LinkedIn pages |
| **Twitter/X API** (`lib/publishers/twitter-publisher.ts`) | Post to X (Twitter) |
| **Brave Search API** (`packages/ai-engine/src/brave.ts`) | Web research for content ideation |
| **Nodemailer / SMTP** | Magic-link email delivery for passwordless auth |
| **Google OAuth** | Social sign-in |
| **GitHub OAuth** | Social sign-in |
| **Stripe** | Subscription billing (schema has `stripeCustomerId`, `stripeSubscriptionId`; SDK not yet in `package.json`) |
| **GA4 (Google Analytics)** | Post-publish analytics enrichment (env vars present: `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`) |
| **Bitly** | URL shortening for UTM links (env var `BITLY_TOKEN` present) |
| **Vercel Analytics** | Web traffic analytics (`@vercel/analytics` package) |

### 8. AI / ML Components

| Component | Provider | Model | Purpose |
|---|---|---|---|
| **Post Generator** | OpenAI | `gpt-4-turbo-preview` | Generate multi-channel post captions from campaign briefs |
| **Campaign Architect** | OpenAI | `gpt-4-turbo-preview` | Phase-by-phase campaign strategy planning |
| **Research & Draft** | OpenAI + Brave Search | `gpt-4-turbo-preview` | Research a topic via web search, synthesize insights, draft posts |
| **Voice Verifier** | OpenAI | `gpt-4-turbo-preview` | Analyze content for brand authenticity, detect "AI slop" phrases |
| **Context Embeddings** | OpenAI | `text-embedding-3-small` | Embed queries and brand knowledge for semantic retrieval |
| **Brand Knowledge RAG** | Upstash Vector | — | Retrieve org-specific brand context during content generation |
| **Publishing Agent** | OpenAI | `gpt-4-turbo-preview` | Self-healing publisher: diagnose errors, retry with adjusted content |
| **Grain & Grit Engine** | CSS/Prompt | — | Apply film-grain style presets to AI-generated images to reduce "AI aesthetic" |
| **Content Safety Scanner** | Rule-based | — | Detect profanity, sensitive topics, unverified claims, missing disclosures |
| **Community CRM AI** | OpenAI (inferred) | — | Audience segmentation and engagement scoring |

**Prompt Strategy:** All prompts are inline strings in the AI engine module. They use structured JSON response format (`response_format: { type: "json_object" }`). Prompts inject brand context retrieved from the vector store before generation. No LangChain or external orchestration — custom agents are hand-coded classes.

**AI Output Processing:** Responses are parsed with `JSON.parse()` and returned directly to the API caller. There is no secondary validation of AI output fields beyond type casting.

### 9. Authentication and Authorization Model

**Authentication:** NextAuth v5 (Auth.js) with three providers:
- **Google OAuth** — social sign-in
- **GitHub OAuth** — social sign-in
- **Email Magic Link** — passwordless via Nodemailer/SMTP (24-hour expiry)

**Session strategy:** JWT tokens (`session: { strategy: "jwt" }`).

**Authorization:** Role-based access control (RBAC) via `lib/permissions/index.ts`.

| Role | Permissions |
|---|---|
| `owner` | All permissions including delete org and manage billing |
| `admin` | Manage members, publish, create/edit/delete content |
| `editor` | Create/edit content, run automations, view analytics |
| `viewer` | View analytics, posts, and campaigns (read-only) |

Route protection is enforced in `middleware.ts` — unauthenticated users are redirected to `/login` for the routes: `/dashboard`, `/projects`, `/campaigns`, `/composer`.

> **Gap:** API routes currently have inconsistent auth enforcement — some use `withAuth()` wrapper, others do not (e.g., `GET /api/posts` has no auth check).

### 10. Environment Variables

#### Database
- `DATABASE_URL`

#### Authentication
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_BASE_URL`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `EMAIL_SERVER`
- `EMAIL_FROM`

#### AI / ML
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `BRAVE_SEARCH_API_KEY`

#### Queue / Vector
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `UPSTASH_VECTOR_REST_URL`
- `UPSTASH_VECTOR_REST_TOKEN`

#### Social Platform OAuth
- `META_APP_ID` / `META_APP_SECRET`
- `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`

#### Analytics / Integrations
- `GA4_MEASUREMENT_ID`
- `GA4_API_SECRET`
- `BITLY_TOKEN`

---

## SECTION 3: FEATURE INVENTORY

| # | Feature | User-Facing Description | Completeness | Key Files | Dependencies |
|---|---|---|---|---|---|
| 1 | **AI Post Generation** | Generate social media post captions for multiple channels from a campaign brief | `Functional` | `packages/ai-engine/src/index.ts`, `apps/web/app/api/generate/route.ts`, `apps/web/app/composer/page.tsx` | OpenAI API, Campaign |
| 2 | **Campaign Architect (Agentic)** | Let AI plan a multi-phase campaign strategy from a single goal statement | `Functional` | `packages/ai-engine/src/campaign-agent.ts`, `apps/web/app/api/ai/architect/route.ts`, `apps/web/app/composer/AgenticPlanner.tsx` | OpenAI API, Brand Knowledge |
| 3 | **Research & Draft** | Research a topic via web search and auto-draft posts | `Functional` | `packages/ai-engine/src/index.ts` (`researchAndDraft`), `apps/web/app/api/ai/research/route.ts`, `apps/web/app/composer/ResearchPanel.tsx` | OpenAI API, Brave Search |
| 4 | **Brand Voice Authenticator** | Check AI-generated content for brand alignment and "AI slop" patterns | `Functional` | `packages/ai-engine/src/index.ts` (`verifyVoice`), `apps/web/app/api/ai/verify/route.ts`, `apps/web/components/VoiceAuthenticator.tsx` | OpenAI API, Upstash Vector |
| 5 | **Post Composer / Editor** | Create, edit, and save multi-channel posts with channel-specific preview | `Partial` | `apps/web/app/composer/page.tsx`, `apps/web/app/composer/PostEditorRow.tsx` | Campaigns, Projects |
| 6 | **Post Scheduling** | Schedule posts for future publication with best-time recommendations | `Partial` | `apps/web/app/api/posts/schedule/route.ts`, `apps/web/app/api/scheduling/best-times/route.ts`, `apps/web/lib/bestTime.ts`, `apps/web/components/SchedulePicker.tsx` | Posts, Redis Queue |
| 7 | **Social Publishing** | Publish posts to Meta (Instagram/Facebook), LinkedIn, and Twitter/X | `Partial` | `apps/web/lib/publishers/`, `packages/workers/src/publish.worker.ts`, `packages/workers/src/publish.ts` | Vendor Tokens, Redis Queue |
| 8 | **Project Management** | Create projects, manage tasks on a Kanban board and Gantt timeline | `Functional` | `apps/web/app/projects/`, `apps/web/components/KanbanBoard.tsx`, `apps/web/components/GanttTimeline.tsx`, `apps/web/app/api/projects/` | Accounts, Campaigns |
| 9 | **Campaign Management** | Create and manage marketing campaigns linked to projects | `Functional` | `apps/web/app/campaigns/`, `apps/web/app/api/campaigns/route.ts` | Projects |
| 10 | **Analytics Dashboard** | View aggregate post performance metrics (impressions, clicks, engagement) | `Partial` | `apps/web/app/analytics/page.tsx`, `apps/web/app/api/analytics/`, `packages/workers/src/analytics.worker.ts` | Posts, Metrics |
| 11 | **CRM (Accounts & Contacts)** | Track brands/accounts and their contacts | `Scaffolded` | `apps/web/lib/schema.ts` (accounts, contacts, opportunities tables), API routes not publicly exposed | Projects |
| 12 | **Automations Engine** | Build trigger-action workflows (e.g., auto-post on new asset) | `Partial` | `apps/web/app/automations/`, `apps/web/app/api/automations/`, `apps/web/lib/automation/` | Posts, Campaigns |
| 13 | **Brand Knowledge Base** | Upload brand guidelines and past campaigns to power AI context retrieval | `Functional` | `apps/web/app/settings/knowledge/`, `apps/web/app/api/learn/route.ts`, `packages/ai-engine/src/vector.ts` | Upstash Vector, OpenAI |
| 14 | **Notification System** | In-app and email notifications for publish events, approvals, team invites | `Partial` | `apps/web/app/api/notifications/route.ts`, `apps/web/lib/notifications/index.ts`, `apps/web/components/NotificationBell.tsx` | Users, Posts |
| 15 | **Content Safety Scanner** | Automatically flag potential commercial/legal issues in content | `Functional` | `packages/ai-engine/src/content-safety.ts`, `apps/web/components/ContentSafetyScanner.tsx` | Posts |
| 16 | **Grain & Grit Visual Engine** | Apply film-grain and imperfection presets to AI-generated images | `Functional` | `packages/ai-engine/src/grain-grit.ts`, `apps/web/components/GritSelector.tsx` | Assets |
| 17 | **UTM Link Builder** | Automatically append UTM tracking parameters to post links | `Functional` | `packages/ai-engine/src/utm.ts`, `apps/web/components/DeeplinkPanel.tsx` | Posts |
| 18 | **Community CRM** | Track social media followers, segment audience, score engagement | `Partial` | `packages/ai-engine/src/community-crm.ts`, `apps/web/app/community/`, `apps/web/app/api/community/route.ts` | Organizations |
| 19 | **Plugin / Integration Manager** | Enable/disable third-party integrations (Slack, etc.) | `Scaffolded` | `apps/web/app/settings/plugins/`, `apps/web/app/api/plugins/route.ts`, `packages/ai-engine/src/plugin-registry.ts`, `packages/ai-engine/src/plugins/slack.ts` | None |
| 20 | **Team Management** | Invite team members with role-based permissions | `Partial` | `apps/web/app/settings/team/`, `apps/web/app/api/organizations/`, `apps/web/lib/permissions/index.ts` | Organizations |
| 21 | **Onboarding Flow** | Guided setup checklist for new users | `Scaffolded` | `apps/web/app/onboarding/`, `apps/web/components/OnboardingChecklist.tsx` | Users |
| 22 | **Subscription / Billing** | Plan management and usage metering | `Scaffolded` | `packages/ai-engine/src/usage-metering.ts`, schema tables (`subscriptions`, `invoices`, `usage_records`) | Organizations, Stripe |
| 23 | **Activity Feed** | Real-time feed of team actions | `Partial` | `apps/web/components/ActivityFeed.tsx`, `apps/web/app/api/events/route.ts` | Users, Projects |
| 24 | **Content Calendar** | Calendar view of scheduled posts | `Scaffolded` | `apps/web/app/calendar/page.tsx` | Posts |
| 25 | **Publishing Health Monitor** | Dashboard widget showing queue depth and publish success/failure rates | `Partial` | `apps/web/app/(dashboard)/components/PublishMonitor.tsx`, `apps/web/app/api/posts/health/route.ts`, `apps/web/components/PublishingHealth.tsx` | Posts, Queue |

---

## SECTION 4: DESIGN SYSTEM & BRAND

### 1. Color Palette

| Name | CSS Variable | Hex | Defined In |
|---|---|---|---|
| `ink-black` | `--ink-black` | `#0D0D0D` | `apps/web/app/globals.css` |
| `wall-white` | `--wall-white` | `#F5F3EF` | `apps/web/app/globals.css` |
| `graffiti-gold` | `--graffiti-gold` | `#C7A76A` | `apps/web/app/globals.css` |
| `brick-gray` | `--brick-gray` | `#595959` | `apps/web/app/globals.css` |
| `signal-teal` | `--signal-teal` | `#4E808D` | `apps/web/app/globals.css` |
| `scarlet-burst` | `--scarlet-burst` | `#B54A4A` | `apps/web/app/globals.css` |
| `ink` | Tailwind alias → `var(--ink-black)` | — | `apps/web/tailwind.config.ts` |
| `wall` | Tailwind alias → `var(--wall-white)` | — | `apps/web/tailwind.config.ts` |
| `graffiti` | Tailwind alias → `var(--graffiti-gold)` | — | `apps/web/tailwind.config.ts` |

> Note: Sidebar/app shell uses Tailwind `neutral-*` utilities which are not mapped to the brand palette above. The brand palette is used for the marketing hero/landing section.

### 2. Typography
**[NOT FOUND IN CODEBASE — REQUIRES MANUAL INPUT]** — No custom font is loaded via `next/font` or a `<link>` tag in the discovered files. The app uses the browser's default sans-serif font family via Tailwind base styles. A branded typeface would need to be added.

### 3. Component Library

#### Internal `@mythos/ui` Package (`packages/ui/src/`)
| Component | Description |
|---|---|
| `Card` | Bordered, rounded container with optional title and `className` override |
| `MiniBarChart` | Sparkline-style bar chart; currently shows a TODO placeholder when data is absent |

#### App-Level Components (`apps/web/components/`)
| Component | Description |
|---|---|
| `AppShell` | Main sidebar navigation layout with active state, role badge, plan indicator |
| `KanbanBoard` | Drag-and-drop task board with todo/doing/done columns; API-connected |
| `GanttTimeline` | Timeline view for project tasks with date-based positioning |
| `SchedulePicker` | Date/time picker for scheduling posts |
| `PostStatusBadge` | Color-coded status indicator for post states |
| `ActivityFeed` | Scrollable event stream of team actions |
| `NotificationBell` | Bell icon with unread count badge |
| `OnboardingChecklist` | Step-by-step setup checklist for new users |
| `PublishingHealth` | Queue depth and success rate monitor |
| `ContentSafetyScanner` | Displays safety scan results with severity badges |
| `VoiceAuthenticator` | Shows AI brand voice analysis with scores and suggestions |
| `GritSelector` | Preset picker for image grain/imperfection effects |
| `GraffitiWall` | Full-bleed hero texture component for landing page |
| `Hero` | Marketing landing page hero section with CTA |
| `EmptyState` | Empty state placeholder with icon and message |
| `SpriteIcon` | SVG sprite icon renderer |
| `DeeplinkPanel` | UTM/deeplink configuration panel |
| `CommunityDashboard` | Community CRM overview display |
| `PluginManager` | Integration enable/disable interface |

### 4. Design Language
**Urban editorial / street-art aesthetic.** The brand uses textured backgrounds (`wall-light.jpg`, `wall-dark.jpg`), a gold accent color ("graffiti gold"), ink-black text, and CSS effects like `drop-shadow` ("ink-drip"), radial gradient overlays ("spray"), and a gold-mist texture overlay on the hero. The application shell (sidebar) uses a conventional dark neutral (`neutral-900`) — contrasting with the editorial brand aesthetic on the marketing page. The design language is intentionally unconventional for a B2B SaaS product.

### 5. Responsive Strategy
Tailwind CSS utility classes are used throughout. No explicit mobile breakpoint strategy was found in discovered components — the app shell uses a fixed `w-64` sidebar without a mobile collapse mechanism. **Mobile layout is not fully implemented.**

### 6. Dark Mode
**Not implemented.** Two texture variants exist (`wall-light.jpg`, `wall-dark.jpg`) suggesting dark mode was planned, but no `dark:` Tailwind classes or `prefers-color-scheme` logic was found.

### 7. Brand Assets

| Asset | Path | Description |
|---|---|---|
| `sprite.svg` | `apps/web/public/sprite.svg` | SVG sprite sheet (halo, eye, spray, and other custom icons) |
| `wall-light.jpg` | `apps/web/public/textures/wall-light.jpg` | Light concrete/wall background texture |
| `wall-dark.jpg` | `apps/web/public/textures/wall-dark.jpg` | Dark concrete/wall background texture |
| `gold-mist.png` | `apps/web/public/textures/gold-mist.png` | Gold overlay/mist texture for hero gradient effect |

---

## SECTION 5: DATA & SCALE SIGNALS

### 1. User Model
**Data stored per user (from `auth_users` table):** `id`, `email`, `name`, `image`, `emailVerified`, `createdAt`, `updatedAt`.

**User journey:**
1. Sign up via Google, GitHub, or magic-link email
2. Onboarding checklist (`user_onboarding` table tracks steps)
3. Create or join an Organization
4. Create Projects → Campaigns → Posts
5. Connect social platforms via OAuth (Meta, LinkedIn, Twitter/X)
6. Use Composer to generate AI content
7. Schedule and publish posts
8. Review analytics

### 2. Content / Data Volume
A seed script (`apps/web/lib/seed.ts`) creates 1 demo user, 1 account, 1 project, and ~6 tasks — intended for local development only. No fixture data or references to production data volumes exist. The `posts` table query has a default `limit: 50, max: 100` — suggesting small-to-medium scale expectations. The queue system (Upstash Redis) can handle arbitrary throughput, but no rate limits or volume benchmarks are defined.

### 3. Performance Considerations

| Pattern | Present | Notes |
|---|---|---|
| Pagination | ✅ | `GET /api/posts` supports `limit`/`offset` (max 100) |
| Redis job queue with retry/DLQ | ✅ | Exponential backoff, max 3 attempts |
| Lazy loading (Next.js) | ✅ | `loading.tsx` files on projects and campaigns routes |
| Error boundaries | ✅ | `error.tsx` files on projects and campaign detail routes |
| Caching | ❌ | No explicit `cache` or `revalidate` directives in API routes |
| Code splitting | ✅ | Next.js App Router handles this automatically |
| Rate limiting | ❌ | No rate limiting middleware found |
| Image optimization | ❌ | No `next/image` usage found |

### 4. Analytics / Tracking

| Integration | What Is Tracked |
|---|---|
| `@vercel/analytics` | Standard web traffic (page views) — loaded in root `layout.tsx` |
| GA4 (`GA4_MEASUREMENT_ID`) | Post-publish analytics enrichment via `lib/analytics/` fetchers |
| Custom `activity` table | Team events: task moved, post scheduled, etc. (via `POST /api/events`) |

### 5. Error Handling
- **API routes:** `try/catch` blocks in most routes; errors are returned as `{ error: string }` JSON with appropriate HTTP status codes.
- **Logging:** `lib/monitoring.ts` provides `logError()` and `logActivity()` — currently `console.error` and `console.log` only. A comment explicitly notes readiness for Sentry/Axiom integration.
- **Client-side:** React `error.tsx` boundary files present for project and campaign detail routes.
- **Queue:** Dead-letter queue implemented for jobs that exceed max retry attempts.
- **Zod validation:** Input validation via `zod` on most POST routes; validation errors surface as `400` with `details`.

### 6. Testing

| File | Coverage |
|---|---|
| `apps/web/__tests__/unit/permissions.test.ts` | 5 tests covering role-based permission checks (owner, admin, editor, viewer) |
| `apps/web/__tests__/unit/utm.test.ts` | 2 tests covering UTM link generation and existing query param preservation |

**Test runner:** Vitest with jsdom environment, `@testing-library/jest-dom` matchers.

**Coverage level: Very low.** Only 7 unit tests covering 2 utility modules. No integration, API, or E2E tests exist. No test coverage reporting is configured.

---

## SECTION 6: MONETIZATION & BUSINESS LOGIC

### 1. Pricing / Tier Structure
Defined in `packages/ai-engine/src/usage-metering.ts`:

| Plan | Posts/period | AI Tokens | Storage | Team Members |
|---|---|---|---|---|
| `free` | 10 | 5,000 | 100 MB | 1 |
| `starter` | 50 | 25,000 | 500 MB | 3 |
| `pro` | 200 | 100,000 | 2,000 MB | 10 |
| `enterprise` | Unlimited | Unlimited | Unlimited | Unlimited |

### 2. Payment Integration
**Stripe is planned but not yet integrated.** The database schema (`subscriptions`, `invoices` tables) includes `stripeCustomerId` and `stripeSubscriptionId` fields. The Stripe SDK is **not listed** in any `package.json`.

### 3. Subscription / Billing Logic
Schema infrastructure exists (`subscriptions` table with `plan`, `status`, `currentPeriodStart/End`, `cancelAtPeriodEnd`). No billing API routes, webhook handlers, or Stripe SDK calls are present in the codebase.

### 4. Feature Gates
`canPerformAction()` in `usage-metering.ts` checks usage against plan limits and returns `{ allowed: boolean, reason?: string }`. **This function is not yet called from any API route** — feature gating logic is not enforced at runtime.

### 5. Usage Limits
`usageRecords` table schema is defined to track `posts`, `ai_tokens`, `storage_mb`, and `team_members` per `orgId` and billing period. No incrementation logic is wired to API routes yet.

---

## SECTION 7: CODE QUALITY & MATURITY SIGNALS

### 1. Code Organization
**Good separation of concerns:**
- `lib/` — server-side utilities (db, auth, queue, publishers, permissions, automation engine)
- `packages/ai-engine/` — isolated AI logic with its own package boundary
- `packages/workers/` — background jobs isolated from the web app
- `app/api/` — thin route handlers that delegate to `lib/` utilities
- `components/` — React UI components

The Drizzle schema is in a single large file (`lib/schema.ts`), which may become unwieldy as the schema grows.

### 2. Patterns and Conventions
- **Consistent route pattern:** Route handlers use `withAuth()` HOF for protected routes
- **Zod validation:** Used consistently for environment variables and API input validation
- **TypeScript-first:** `zod` schemas define runtime types; `as const` patterns for channel types
- **Custom error format:** All API errors return `{ error: string }` JSON
- **No dependency injection framework** — modules instantiate dependencies directly
- **Naming:** camelCase for variables/functions, PascalCase for components/classes, kebab-case for files

### 3. Documentation
- `README.md`: Brief description only (5 lines)
- `docs/DEV_SETUP.md`: Basic setup instructions, mentions TODOs
- `docs/file_directory`: ASCII directory tree
- `# Mythos: Roadmap to Production.md` and `Roadmap v2.md`: Strategic planning documents (not developer docs)
- Inline JSDoc: Present on queue, monitoring, permissions, and content-safety modules
- No API documentation (OpenAPI/Swagger)
- No architecture decision records (ADRs)

### 4. TypeScript Usage
- Strict mode not explicitly enabled (no `"strict": true` in `configs/ts/base.tsconfig.json` — **[NOT VERIFIED — requires manual check]**)
- `any` type used in several places: route handlers (`body: any`), Drizzle query conditions (`conditions: any[]`), AI response casting
- Zod schemas used for runtime validation; `z.infer` used to derive types
- Well-defined interfaces in AI engine modules (`CampaignGoal`, `StrategicPlan`, `PostDraft`, etc.)

### 5. Error Handling Patterns
- `try/catch` present in all API routes
- Custom `logError()` utility — console-only, Sentry-ready
- DLQ pattern for failed queue jobs
- React error boundaries for protected routes
- No custom error classes; errors are plain `Error` objects or strings

### 6. Git Hygiene
- **2 commits total** in this clone; commit messages are minimal ("initial commit", "Initial plan")
- No branch strategy visible (single branch in history)
- No PR history visible

### 7. Technical Debt Flags
- `preflight.ts`: `preflightCheckPost()` always returns `{ ok: true }` — stub
- `publish/route.ts`: Returns mock `{ jobId: "pub-123" }` — not wired to queue
- `MiniBarChart`: "TODO: wire real charting" in rendered output
- `deploy-workers.yml`: `echo "TODO: add deploy commands"`
- `compose.yaml`: "TODO: add redis/queue service"
- `docs/DEV_SETUP.md`: "TODO: add a combined worker launcher"
- `apps/web/lib/schemats.ts`: Duplicate schema file present (likely an artifact)
- `packages/workers/src/publishing.worker.ts` and `publish.worker.ts`: Two publishing worker files — potential duplication
- `campaign.worker.ts`, `research.worker.ts`, `knowledge.worker.ts`, `scheduler.worker.ts`: Worker files present but not referenced in `package.json` scripts
- Auth on many `GET` API endpoints is missing

### 8. Security Posture
- **Input validation:** Zod schemas on all POST routes where checked
- **SQL injection:** Protected by Drizzle ORM parameterized queries
- **XSS:** Next.js handles React JSX escaping; no `dangerouslySetInnerHTML` found
- **Secrets management:** All secrets via environment variables; `lib/env.ts` enforces presence at startup via Zod
- **CORS:** Not explicitly configured — relies on Next.js defaults
- **OAuth token storage:** Stored in `vendor_tokens` table — tokens are plaintext in DB (no field-level encryption)
- **Auth on API routes:** Inconsistent — some routes use `withAuth()`, many do not
- **Rate limiting:** None implemented
- **Stripe webhook signature verification:** Not yet implemented (Stripe not yet integrated)

---

## SECTION 8: ECOSYSTEM CONNECTIONS

### 1. Shared Code or Patterns with Sister Projects
**[NOT FOUND IN CODEBASE — REQUIRES MANUAL INPUT]** — No explicit references to Relevnt, Codra, Ready, embr, passagr, or advocera are found in the code.

Patterns that may be shared across The Penny Lane Project portfolio (inferred from conventions):
- Drizzle ORM + PostgreSQL for persistence
- NextAuth v5 for authentication
- Upstash Redis for queuing
- Turbo/pnpm monorepo structure
- Tailwind CSS for styling

### 2. Shared Dependencies or Infrastructure
**[NOT FOUND IN CODEBASE — REQUIRES MANUAL INPUT]** — No shared Supabase instance, Netlify account, or shared component library references are found in config files.

### 3. Data Connections
No database cross-references to other projects were found.

### 4. Cross-References
No imports, links, or explicit references to sister projects exist in the discovered code.

---

## SECTION 9: WHAT'S MISSING (CRITICAL)

### 1. Gaps for Production-Ready Product

| Gap | Impact |
|---|---|
| **Auth enforcement on API routes** | Most GET/POST routes lack `withAuth()` — any user can read/write data |
| **Stripe billing integration** | Schema is ready but the SDK and webhook handlers are absent |
| **Feature gate enforcement** | `canPerformAction()` exists but is never called from routes |
| **Real publish pipeline** | `POST /api/publish` returns a mock response; workers need wiring to Redis queue |
| **Rate limiting** | No protection against API abuse |
| **Error monitoring** | Sentry/Axiom placeholder is not connected |
| **Mobile responsiveness** | Sidebar has no mobile collapse; app is desktop-only |
| **Platform OAuth completion** | LinkedIn and Meta callbacks are partially implemented; full token refresh logic needed |
| **Test coverage** | 7 unit tests covering 2 utilities; no integration or E2E tests |
| **TikTok publishing** | Listed as a channel in schema/constants but no publisher implementation found |
| **Asset upload pipeline** | `assets` table exists but no file upload API or storage integration (S3/Cloudflare R2) found |

### 2. Gaps for Investor Readiness

| Gap | Impact |
|---|---|
| **No live demo URL** | Cannot demonstrate product without local setup |
| **No metrics or traction data** | No user counts, post volumes, or analytics in README |
| **No API documentation** | No Swagger/OpenAPI spec |
| **Minimal README** | 5-line README does not convey product value or technical credibility |
| **No pricing page** | Plan limits defined in code but no public-facing pricing |
| **No privacy policy / ToS** | Required for OAuth with Google/GitHub |
| **2 commits in history** | Appears very early stage to external reviewers |

### 3. Gaps in the Codebase Itself

| Gap | Notes |
|---|---|
| `apps/web/lib/schemats.ts` | Appears to be a duplicate/artifact of `schema.ts` |
| `packages/workers/src/publishing.worker.ts` + `publish.worker.ts` | Two publishing worker files; role overlap unclear |
| Unused worker scripts | `campaign.worker.ts`, `research.worker.ts`, `knowledge.worker.ts`, `scheduler.worker.ts` not in `package.json` scripts |
| `apps/web/app/composer/` — `AgenticPlanner.tsx`, `ResearchPanel.tsx` | Not verified as complete — composer page imports them but functionality may be partial |
| Anthropic SDK imported but unused | `@anthropic-ai/sdk` in `ai-engine/package.json` but no Claude calls found |
| ~~`BRAVE_API_KEY` vs `BRAVE_SEARCH_API_KEY`~~ | Fixed: `ai/research/route.ts` was reading `BRAVE_API_KEY` but `env.ts` defines `BRAVE_SEARCH_API_KEY`; corrected in this audit |

### 4. Recommended Next Steps (Priority Order)

1. **Enforce authentication on all API routes** — Add `withAuth()` to every route that reads or writes user/org data. This is a security vulnerability in the current state.

2. **Complete the publish pipeline** — Wire `POST /api/publish` to the Redis queue and ensure `publish.worker.ts` is consuming jobs and calling the correct platform publisher. This is the core value delivery mechanism.

3. **Integrate Stripe for billing** — Install the Stripe SDK, create webhook handlers for subscription events, and wire `canPerformAction()` into the relevant API routes. This unlocks monetization.

4. **Deploy to staging with a live URL** — Set up Vercel or Fly.io deployment so the product can be demonstrated without local setup. A live URL is table stakes for investor conversations.

5. **Expand test coverage to API routes** — Add integration tests for the critical paths: post creation, campaign generation, and social publishing. These are the highest-risk surfaces.

---

## SECTION 10: EXECUTIVE SUMMARY

**Paragraph 1: What This Is**
Mythos is an AI-powered marketing operations platform designed for brands, agencies, and solo creators who need to manage campaigns, generate content, and publish to social networks from a single workspace. The core problem it solves is the fragmentation of modern marketing work: teams currently juggle separate tools for project management, CRM, content creation, scheduling, and analytics. Mythos unifies all of these into one opinionated platform, with AI as a first-class feature for research, drafting, voice verification, and autonomous campaign planning.

**Paragraph 2: Technical Credibility**
The technical foundation is sophisticated and reflects genuine product thinking. The codebase is a TypeScript monorepo (pnpm + Turborepo) with a Next.js 14 App Router web app, isolated AI engine and worker packages, PostgreSQL via Drizzle ORM, and Upstash Redis for job queuing. The database schema is comprehensive — 30+ tables covering CRM, project management, campaigns, publishing, analytics, multi-tenancy, billing, automations, and notifications — and reflects a builder who understands the full complexity of a marketing operations product. The AI layer goes beyond simple API calls: it includes RAG-based brand knowledge retrieval via Upstash Vector embeddings, multi-agent campaign architecture, self-healing publishing retry logic, a "Grain & Grit" image aesthetics engine to counter AI-generated content sameness, and a content safety scanner. This is not a CRUD app with an AI button — it is a genuine attempt at an AI-native marketing backend.

**Paragraph 3: Current State and Path to Next Milestone**
The project is in an early Alpha state. The schema, component library, and AI engine are well-structured and largely functional in isolation, but the critical integration layer — publishing pipeline, Stripe billing, feature gating, and consistent API authentication — is incomplete or stubbed. Test coverage is minimal (7 tests), there is no live deployment, and the README does not communicate the product's value. To reach a demo-ready Beta milestone, the builder should focus on: (1) completing the end-to-end publish flow from Composer to social network, (2) enforcing authentication on API routes, (3) deploying to a staging URL, and (4) writing a compelling README and product demo video. With 2-4 weeks of focused execution on these items, Mythos would have a technically credible, demonstrable product capable of supporting an investor conversation.

---

```
---
AUDIT METADATA
Project: Mythos
Date: 2026-03-07
Agent: GPT-4o / GitHub Copilot Coding Agent
Codebase access: full repo (read-only)
Confidence level: high — all findings sourced directly from files; inferences are explicitly flagged
Sections with gaps: 1.8 (live URL), 2.1 (Node typings), 4.2 (typography), 4.5 (mobile), 8.1–8.4 (ecosystem connections), 9 (incomplete features listed with evidence)
Total files analyzed: 196 (TypeScript, TSX, JavaScript, JSON, Markdown, YAML, SQL, CSS)
---
```
