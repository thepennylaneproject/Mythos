# Mythos: Roadmap to Production

## From MVP Skeleton → Full-Stack AI Storytelling Platform

**Current State Summary:** Next.js 14 App Router monorepo with basic pages (marketing, dashboard, projects with Kanban/Gantt, campaigns, composer), stub API routes, skeletal workers, and Drizzle ORM schema. Missing: auth, real scheduling, publishing, analytics, queue implementation, and campaign/asset management flows.

**Vision:** The "last content tool you'll ever need" — combining Canva's design, HubSpot's automation, Monday.com's workflows, and Zapier's integrations, all powered by AI.

---

## Roadmap Overview

| Tier | Focus | Est. Time | Dependencies |
|------|-------|-----------|--------------|
| **0** | Foundation & Infrastructure | 8-12 hrs | None |
| **1** | Core MVP - Content Management | 16-24 hrs | Tier 0 |
| **2** | AI Content Engine | 12-18 hrs | Tier 1 |
| **3** | Publishing & Analytics | 16-22 hrs | Tier 2 |
| **4** | Automation & Collaboration | 14-20 hrs | Tier 3 |
| **5** | Polish & Launch | 12-16 hrs | Tier 4 |

**Total:** ~78-112 hours to production-ready

---

## TIER 0: Foundation & Infrastructure

*Everything else depends on this. No skipping.*

### Phase 0.1: Authentication System
**Est. Time:** 3-4 hours

**Current State:**
- No auth middleware
- No session/provider
- Schema has `accounts` table but no `users` table
- API routes are unprotected

**Deliverables:**
1. NextAuth.js configuration with providers (Google, GitHub, email magic link)
2. User model and session schema in Drizzle
3. Auth middleware for protected routes
4. `(auth)` route group with login/signup pages
5. Session provider wrapper in root layout
6. Protected API route helper

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. The codebase uses Next.js 14 App Router, TypeScript, Tailwind, Drizzle ORM, and PostgreSQL.

CURRENT STATE:
- No authentication exists
- Drizzle schema at apps/web/lib/schema.ts has accounts table but no users
- API routes at apps/web/app/api/* are unprotected
- No middleware.ts exists

TASK: Implement complete authentication system

REQUIREMENTS:
1. NextAuth.js v5 (Auth.js) configuration
   - Providers: Google OAuth, GitHub OAuth, Email magic link
   - JWT strategy for sessions
   - Callbacks for user creation/signin

2. Database schema updates (Drizzle):
   - users table (id, email, name, image, emailVerified, createdAt, updatedAt)
   - accounts table (OAuth provider linking)
   - sessions table
   - verificationTokens table
   
3. Middleware (middleware.ts in app root):
   - Protect /dashboard/* routes
   - Protect /projects/* routes
   - Protect /campaigns/* routes
   - Protect /composer/* routes
   - Allow public: /, /login, /signup, /api/auth/*

4. Auth pages (apps/web/app/(auth)/):
   - /login/page.tsx - login form with OAuth buttons + magic link
   - /signup/page.tsx - registration flow
   - Shared layout with minimal header

5. Session provider in root layout
6. Helper: withAuth() wrapper for API routes that returns 401 if no session

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 0.2: Environment & Database Setup
**Est. Time:** 2-3 hours

**Current State:**
- .env files exist but no per-env separation
- Zod validation in apps/web/lib/env.ts
- No migrations folder/output
- No seed data

**Deliverables:**
1. Environment configuration (dev/staging/prod)
2. Drizzle migrations setup and initial migration
3. Database seed script with test data
4. Connection pooling configuration

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. The codebase uses Next.js 14 App Router, TypeScript, Drizzle ORM, and PostgreSQL.

CURRENT STATE:
- Basic env validation at apps/web/lib/env.ts
- Drizzle schema at apps/web/lib/schema.ts
- Drizzle config at configs/drizzle/drizzle.config.ts
- DB pool at apps/web/lib/db.ts
- No migrations exist
- No seed data
- Docker Compose at infra/compose.yaml

TASK: Complete environment and database setup

REQUIREMENTS:
1. Environment configuration:
   - Separate .env.example, .env.development, .env.production templates
   - Enhanced Zod validation in env.ts covering all needed vars:
     - DATABASE_URL
     - NEXTAUTH_SECRET, NEXTAUTH_URL
     - OAuth provider credentials (GOOGLE_*, GITHUB_*)
     - AI provider keys (OPENAI_API_KEY, ANTHROPIC_API_KEY)
     - Redis/queue URL (UPSTASH_REDIS_*)
     - Social platform credentials (META_*, TWITTER_*, LINKEDIN_*)

2. Drizzle migrations:
   - drizzle.config.ts updates for migrations output
   - Initial migration from current schema
   - package.json scripts: db:generate, db:migrate, db:push, db:studio

3. Seed script (packages/workers/src/seed.ts or apps/web/lib/seed.ts):
   - Create test user
   - Create sample project with tasks
   - Create sample campaign with posts
   - Create mock vendor tokens for testing
   
4. Connection pooling:
   - Configure for serverless (Neon/Supabase pooler) or traditional Postgres
   - Add connection retry logic

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 0.3: Queue Implementation
**Est. Time:** 3-4 hours

**Current State:**
- Mock queue stub at apps/web/lib/queue.ts
- Worker stubs at packages/workers/src/*.worker.ts
- jobs.ts exists but doesn't do real work

**Deliverables:**
1. Upstash Redis queue implementation
2. Job types and payloads definitions
3. Queue producer (enqueue jobs from API)
4. Queue consumer (process jobs in workers)
5. Retry and error handling logic

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to implement a real job queue for background tasks.

CURRENT STATE:
- Mock queue at apps/web/lib/queue.ts (just a stub)
- Worker files at packages/workers/src/:
  - publish.worker.ts (has skeleton polling loop)
  - scheduler.worker.ts (stub)
  - analytics.worker.ts (stub)
  - generation.worker.ts (stub)
- jobs.ts exists but doesn't process real payloads
- Vendor helpers at apps/web/lib/vendor/*.ts (unused)

TASK: Implement real queue system using Upstash Redis

REQUIREMENTS:
1. Queue implementation (apps/web/lib/queue.ts):
   - Use @upstash/redis and @upstash/qstash
   - Job types enum: PUBLISH_POST, SCHEDULE_POST, FETCH_ANALYTICS, GENERATE_CONTENT
   - Type-safe job payloads for each type
   - enqueue(jobType, payload) function
   - dequeue() function with visibility timeout
   - acknowledge(jobId) function
   - retry(jobId, delay) function

2. Queue producer API (apps/web/app/api/queue/route.ts):
   - POST endpoint to enqueue jobs (protected, internal use)
   - Validate job type and payload
   - Return job ID

3. Worker consumer pattern (packages/workers/src/queue-consumer.ts):
   - Poll queue for jobs
   - Route to appropriate worker based on job type
   - Handle success/failure
   - Implement exponential backoff for retries
   - Max retries: 3
   - Dead letter queue for failed jobs

4. Update each worker to:
   - Accept typed payload
   - Access database (import from shared lib)
   - Log progress (structured JSON)
   - Return success/failure status

5. Worker runner script (packages/workers/src/run.ts):
   - Start all workers
   - Graceful shutdown handling
   - Health check endpoint

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

## TIER 1: Core MVP - Content Management

*Get the basics working end-to-end*

### Phase 1.1: Projects & Tasks Completion
**Est. Time:** 4-5 hours

**Current State:**
- Basic CRUD + UI exists (projects list/detail with Kanban/Gantt)
- Missing: user/account scoping, task assignments, comments/history, filtering/sorting

**Deliverables:**
1. User-scoped project queries
2. Task assignment system
3. Task comments and activity history
4. Filtering and sorting for projects/tasks
5. Status update flows in UI

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. The projects/tasks feature needs completion.

CURRENT STATE:
- Project pages at apps/web/app/projects/...
- Kanban and Gantt views exist
- API routes at apps/web/app/api/projects/..., .../tasks/
- Basic CRUD works but not user-scoped
- Drizzle schema has projects and tasks tables

TASK: Complete the projects and tasks feature

REQUIREMENTS:
1. User scoping:
   - All project queries filtered by userId from session
   - Projects have ownerId (creator) and members (collaborators)
   - Schema update: add members relation table if needed

2. Task assignment system:
   - Tasks can be assigned to project members
   - Schema: tasks.assigneeId (nullable, references users)
   - UI: assignee dropdown in task modal
   - Assignee avatar display on Kanban cards

3. Comments and activity:
   - New table: task_comments (id, taskId, userId, content, createdAt)
   - New table: task_activity (id, taskId, userId, action, metadata, createdAt)
   - Actions: created, status_changed, assigned, commented, due_date_changed
   - UI: activity feed in task detail sidebar

4. Filtering and sorting:
   - Projects list: filter by status, sort by name/date/activity
   - Tasks: filter by status, assignee, due date range
   - Search tasks by title/description
   - URL query params for shareable filtered views

5. UI polish:
   - Status change dropdown on task cards
   - Due date picker with visual overdue indicator
   - Drag-drop between status columns updates DB
   - Optimistic updates for snappy UX

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 1.2: Campaign Creation Flow
**Est. Time:** 4-5 hours

**Current State:**
- Schema for campaigns exists
- Only campaign creation endpoint (stub)
- Minimal campaign page at apps/web/app/campaigns/[id]/page.tsx

**Deliverables:**
1. Complete campaign CRUD API
2. Campaign brief editor UI
3. Campaign status workflow
4. Campaign list/dashboard view

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to build the complete campaign creation and management flow.

CURRENT STATE:
- Schema: campaigns table exists in apps/web/lib/schema.ts
- API: apps/web/app/api/campaigns/route.ts (create only, stub)
- UI: apps/web/app/campaigns/[id]/page.tsx (minimal)
- No campaign list view
- No campaign brief editor

TASK: Build complete campaign management system

REQUIREMENTS:
1. Campaign data model enhancements:
   - Fields: id, userId, projectId (optional), name, brief, status, targetPlatforms[], startDate, endDate, createdAt, updatedAt
   - Status enum: DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED
   - targetPlatforms: array of FACEBOOK, INSTAGRAM, TWITTER, LINKEDIN, TIKTOK, YOUTUBE

2. API endpoints (apps/web/app/api/campaigns/):
   - GET / - list campaigns (paginated, filterable by status)
   - POST / - create campaign
   - GET /[id] - get campaign with posts
   - PATCH /[id] - update campaign
   - DELETE /[id] - soft delete (archive)
   - POST /[id]/duplicate - clone campaign

3. Campaign brief editor:
   - Rich text editor for campaign brief/strategy
   - Target audience definition fields
   - Goals and KPIs section
   - Brand voice/tone guidelines input
   - Reference links/assets attachment

4. Campaign list page (apps/web/app/campaigns/page.tsx):
   - Grid/list view toggle
   - Filter by status
   - Sort by date/name
   - Quick actions: edit, duplicate, archive
   - Campaign card showing: name, status, platforms, post count, date range

5. Campaign detail page enhancement:
   - Header with campaign info and quick stats
   - Tabs: Overview, Posts, Analytics, Settings
   - Overview: brief display, timeline, progress
   - Posts tab: list of posts in this campaign (Phase 1.4)

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 1.3: Asset Management System
**Est. Time:** 4-5 hours

**Current State:**
- Schema mentions assets table
- No upload/management APIs
- No UI for asset management

**Deliverables:**
1. Asset upload API with S3/R2 storage
2. Asset library UI
3. Asset organization (folders/tags)
4. Asset linking to campaigns/posts

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to implement asset management for media files.

CURRENT STATE:
- Schema has assets table (basic fields)
- No upload functionality
- No asset library UI
- Using Next.js 14 App Router

TASK: Build complete asset management system

REQUIREMENTS:
1. Asset schema updates (Drizzle):
   - id, userId, campaignId (optional), name, type (IMAGE, VIDEO, AUDIO, DOCUMENT), 
   - url, thumbnailUrl, size, mimeType, width, height, duration (for video/audio)
   - folderId (optional), tags[], metadata (JSON)
   - createdAt, updatedAt

2. Folders and organization:
   - asset_folders table: id, userId, name, parentId (nullable for nesting), createdAt
   - Tags: simple string array on asset, no separate table needed

3. Storage integration (apps/web/lib/storage.ts):
   - Abstract storage interface
   - Implementation for Cloudflare R2 (S3-compatible)
   - Upload function with presigned URLs
   - Delete function
   - Generate thumbnail for images/videos

4. API endpoints (apps/web/app/api/assets/):
   - GET / - list assets (paginated, filter by type/folder/campaign/tags)
   - POST /upload-url - get presigned upload URL
   - POST / - create asset record after upload
   - PATCH /[id] - update metadata/tags/folder
   - DELETE /[id] - delete asset and file
   - POST /folders - CRUD for folders

5. Asset library UI (apps/web/app/assets/page.tsx):
   - Grid view with thumbnails
   - Folder sidebar navigation
   - Upload dropzone (drag & drop)
   - Multi-select for bulk operations
   - Filter by type, search by name/tags
   - Asset detail modal with metadata editing
   - Copy URL button for each asset

6. Asset picker component (for use in post editor):
   - Modal that embeds asset library
   - Select single or multiple assets
   - Returns selected asset(s) to parent

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 1.4: Post Management & Scheduling Foundation
**Est. Time:** 4-5 hours

**Current State:**
- Schema for posts exists
- Schedule/publish routes are stubs
- No post creation UI
- No calendar view

**Deliverables:**
1. Post CRUD API
2. Post editor component
3. Post calendar view
4. Basic scheduling (store scheduled time, not actual publishing yet)

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to build post management and scheduling foundation.

CURRENT STATE:
- Schema: posts table exists
- API stubs at apps/web/app/api/posts/schedule, apps/web/app/api/publish
- No post creation UI
- Composer page at apps/web/app/composer/page.tsx (basic)

TASK: Build post management and scheduling system (without actual publishing - that's Phase 3)

REQUIREMENTS:
1. Post schema enhancements (Drizzle):
   - id, userId, campaignId (optional), platform, content (text)
   - mediaAssetIds[] (references assets), 
   - scheduledAt (timestamp), publishedAt (timestamp, nullable)
   - status: DRAFT, SCHEDULED, PUBLISHING, PUBLISHED, FAILED
   - platformPostId (external ID after published), platformData (JSON for platform-specific fields)
   - createdAt, updatedAt

2. API endpoints (apps/web/app/api/posts/):
   - GET / - list posts (paginated, filter by campaign/platform/status/date range)
   - POST / - create post (draft)
   - GET /[id] - get post with assets
   - PATCH /[id] - update post
   - DELETE /[id] - delete post
   - POST /[id]/schedule - set scheduledAt and status=SCHEDULED
   - POST /[id]/unschedule - clear scheduledAt and status=DRAFT

3. Post editor component (apps/web/components/PostEditor.tsx):
   - Platform selector (can select multiple for cross-posting)
   - Rich text content editor with character count
   - Platform-specific previews (show how it'll look on Twitter vs Instagram)
   - Asset picker integration (attach images/videos)
   - Hashtag suggestions based on content
   - Schedule picker (date/time with timezone)
   - Save draft / Schedule buttons

4. Content calendar (apps/web/app/calendar/page.tsx):
   - Month/week/day views
   - Drag-drop posts to reschedule
   - Color coding by platform
   - Click post to edit
   - Quick-add button for new posts

5. Composer page update (apps/web/app/composer/page.tsx):
   - Full-featured post creation flow
   - Campaign selector (optional)
   - Multi-post creation (batch)
   - Save and schedule flow

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

## TIER 2: AI Content Engine

*The "magic" that makes Mythos special*

### Phase 2.1: AI Provider Integration
**Est. Time:** 3-4 hours

**Deliverables:**
1. AI provider abstraction layer
2. OpenAI integration
3. Anthropic integration
4. Provider switching and fallback logic

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to integrate AI providers for content generation.

CURRENT STATE:
- No AI integration exists
- Will need to support multiple providers
- Workers exist for generation at packages/workers/src/generation.worker.ts (stub)

TASK: Build AI provider integration layer

REQUIREMENTS:
1. AI provider abstraction (apps/web/lib/ai/):
   - provider.ts: Abstract interface for AI providers
     - generateText(prompt, options): Promise<string>
     - generateChat(messages, options): Promise<string>
     - generateImage(prompt, options): Promise<string> (URL)
     - generateEmbedding(text): Promise<number[]>
   - Options: model, maxTokens, temperature, systemPrompt

2. OpenAI implementation (apps/web/lib/ai/openai.ts):
   - Text generation with GPT-4/GPT-4-turbo
   - Image generation with DALL-E 3
   - Embeddings with text-embedding-3-small
   - Proper error handling and rate limiting

3. Anthropic implementation (apps/web/lib/ai/anthropic.ts):
   - Text generation with Claude 3.5 Sonnet
   - Chat with proper message formatting
   - System prompts handling

4. Provider manager (apps/web/lib/ai/index.ts):
   - getProvider(name): returns configured provider instance
   - Default provider from env
   - Fallback logic: if primary fails, try secondary
   - Cost tracking: log token usage per request

5. AI API routes (apps/web/app/api/ai/):
   - POST /generate - general text generation
   - POST /chat - chat completion
   - POST /image - image generation
   - All require auth, rate limited per user tier

6. Types and utilities:
   - AI request/response types
   - Token counting utility
   - Cost calculation per model

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 2.2: Content Generation Features
**Est. Time:** 4-5 hours

**Deliverables:**
1. Post copy generation
2. Copy variations generator
3. Platform-specific optimization
4. Hashtag and caption suggestions

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to build AI-powered content generation features.

CURRENT STATE:
- AI provider layer exists (from Phase 2.1)
- Post editor exists
- Campaign brief editor exists

TASK: Build AI content generation features for social media posts

REQUIREMENTS:
1. Prompt templates (apps/web/lib/ai/prompts/):
   - post-generation.ts: Generate social post from topic/brief
   - copy-variations.ts: Create N variations of existing copy
   - platform-optimize.ts: Adapt content for specific platform
   - hashtag-suggest.ts: Suggest relevant hashtags
   - caption-generate.ts: Generate captions for images/videos

2. Generation API endpoints (apps/web/app/api/ai/content/):
   - POST /generate-post
     - Input: topic, platform, tone, brief (optional), campaignId (optional)
     - Output: generated content, suggested hashtags
   - POST /variations
     - Input: original content, count, platform
     - Output: array of variations
   - POST /optimize
     - Input: content, targetPlatform
     - Output: optimized content (length, format, style adjusted)
   - POST /hashtags
     - Input: content, platform, count
     - Output: array of hashtag suggestions with relevance scores

3. Brand voice integration:
   - User can define brand voice in settings (tone, dos/don'ts, sample posts)
   - Include brand voice in all generation prompts
   - Brand voice schema and storage

4. UI integration:
   - "Generate with AI" button in post editor
   - AI suggestions sidebar showing variations
   - "Optimize for [platform]" quick action
   - Hashtag suggestions below content editor
   - Accept/reject suggestions flow

5. Generation worker update (packages/workers/src/generation.worker.ts):
   - Process GENERATE_CONTENT jobs from queue
   - Support batch generation for campaigns
   - Store results in DB

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 2.3: Image Generation & Multi-Modal Support
**Est. Time:** 3-4 hours

**Deliverables:**
1. AI image generation from prompts
2. Image-to-post generation (describe image, generate caption)
3. Content repurposing (blog → social posts)

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to add image generation and multi-modal AI features.

CURRENT STATE:
- AI provider layer with image generation capability
- Asset management system exists
- Post editor exists

TASK: Build multi-modal AI content features

REQUIREMENTS:
1. Image generation flow:
   - POST /api/ai/image/generate
     - Input: prompt, style (optional), aspectRatio (1:1, 16:9, 9:16, 4:5)
     - Uses DALL-E 3 via AI provider
     - Saves generated image to asset storage
     - Returns asset record with URL
   - UI: Image generation modal
     - Prompt input with style suggestions
     - Aspect ratio picker (with platform recommendations)
     - Preview generated image
     - Save to assets / Insert into post

2. Image analysis and captioning:
   - POST /api/ai/image/analyze
     - Input: imageUrl or assetId
     - Uses GPT-4 Vision
     - Output: description, suggested caption, detected objects/themes
   - UI: "Generate caption from image" button in post editor
     - Analyzes attached image
     - Suggests captions based on image content

3. Content repurposing:
   - POST /api/ai/repurpose
     - Input: sourceContent (long text/URL), targetPlatforms[]
     - Output: array of platform-optimized posts
   - Use cases:
     - Blog post URL → Twitter thread + LinkedIn post + Instagram carousel text
     - Video transcript → summary posts for multiple platforms
   - UI: Repurpose wizard
     - Paste content or URL
     - Select target platforms
     - Review and edit each generated post
     - Schedule all at once

4. Template system:
   - Predefined content templates (announcement, promotion, behind-scenes, etc.)
   - AI fills in template with user's specifics
   - Templates stored in DB, users can create custom

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 2.4: AI Assistant & Smart Suggestions
**Est. Time:** 2-3 hours

**Deliverables:**
1. Contextual AI assistant chat
2. Smart post timing suggestions
3. Content gap analysis

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to add an AI assistant and smart suggestions.

CURRENT STATE:
- AI provider layer exists
- Post and campaign data in database
- User brand voice stored

TASK: Build AI assistant and smart suggestion features

REQUIREMENTS:
1. AI assistant chat (apps/web/components/AIAssistant.tsx):
   - Floating chat widget accessible throughout app
   - Context-aware: knows current page, selected campaign, recent activity
   - Can answer questions about content strategy
   - Can execute commands: "Create a post about [topic]", "Show my scheduled posts"
   - Conversation history (session-based, not persisted long-term)

2. Assistant API (apps/web/app/api/ai/assistant/):
   - POST /chat
     - Input: message, context (currentPage, campaignId, etc.)
     - Output: response, actions (optional - things for UI to do)
   - Uses system prompt with:
     - User's brand voice
     - Current campaigns/posts context
     - Available actions

3. Smart timing suggestions:
   - POST /api/ai/suggest-times
     - Input: platform, content type (optional)
     - Output: array of recommended times with reasoning
   - Based on:
     - Industry best practices (built-in knowledge)
     - User's past post performance (if available)
     - Platform-specific patterns

4. Content gap analysis:
   - POST /api/ai/content-gaps
     - Input: campaignId or date range
     - Output: suggestions for content types/topics not yet covered
   - Analyzes existing posts and suggests:
     - Missing platforms (you haven't posted to LinkedIn this week)
     - Missing content types (no video content recently)
     - Trending topics in their niche (basic, from prompts)

5. UI integration:
   - AI suggestions panel in dashboard
   - "Best time to post" indicator in scheduler
   - Content gap cards in campaign overview

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

## TIER 3: Publishing & Analytics

*Connect to the real world*

### Phase 3.1: OAuth & Vendor Token Management
**Est. Time:** 4-5 hours

**Deliverables:**
1. OAuth flows for social platforms
2. Token storage and refresh
3. Connection status UI
4. Platform management settings

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to implement OAuth connections to social platforms.

CURRENT STATE:
- Schema has vendor_tokens table
- Vendor helpers at apps/web/lib/vendor/*.ts (unused)
- No OAuth flows implemented
- No connection UI

TASK: Implement OAuth flows for social platform connections

REQUIREMENTS:
1. Supported platforms:
   - Meta (Facebook/Instagram) - Meta Graph API
   - Twitter/X - OAuth 2.0
   - LinkedIn - OAuth 2.0
   - (TikTok and YouTube as future additions - stub the interface)

2. Token schema (update vendor_tokens):
   - id, userId, platform, accessToken (encrypted), refreshToken (encrypted)
   - expiresAt, scopes[], platformUserId, platformUsername
   - isActive, lastUsedAt, createdAt, updatedAt

3. OAuth implementation (apps/web/lib/oauth/):
   - oauth-config.ts: Platform-specific OAuth configs (clientId, secret, scopes, URLs)
   - oauth-flow.ts: Generic OAuth flow handler
   - token-manager.ts: Store, retrieve, refresh tokens
   - Token encryption using crypto (AES-256)

4. API routes (apps/web/app/api/oauth/):
   - GET /[platform]/authorize - redirect to platform OAuth
   - GET /[platform]/callback - handle callback, store tokens
   - DELETE /[platform] - disconnect platform
   - POST /[platform]/refresh - manually refresh token

5. Platform connections UI (apps/web/app/settings/connections/page.tsx):
   - List of available platforms with connect/disconnect
   - Connection status: connected (green), expired (yellow), disconnected (gray)
   - Connected account info: username, profile pic
   - Permissions/scopes granted
   - Last used timestamp
   - "Reconnect" for expired tokens

6. Token refresh worker:
   - Background job to refresh tokens before expiry
   - Alert user if refresh fails (email notification stub)

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 3.2: Publishing Engine
**Est. Time:** 4-5 hours

**Deliverables:**
1. Platform-specific publishers
2. Publish worker implementation
3. Error handling and retries
4. Publishing status tracking

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to implement the actual publishing engine.

CURRENT STATE:
- OAuth and token management exists (Phase 3.1)
- Posts can be scheduled (Phase 1.4)
- Queue system exists (Phase 0.3)
- Publish worker stub at packages/workers/src/publish.worker.ts

TASK: Build the publishing engine to actually post to social platforms

REQUIREMENTS:
1. Publisher interface (apps/web/lib/publishers/):
   - types.ts: PublishResult, PublishError, PlatformPost types
   - base-publisher.ts: Abstract publisher class
   - Methods: publish(post), delete(platformPostId), getPostStats(platformPostId)

2. Platform publishers:
   - meta-publisher.ts: Facebook and Instagram via Graph API
     - Support: text, images, videos, carousels
     - Handle FB pages vs IG business accounts
   - twitter-publisher.ts: X/Twitter via API v2
     - Support: text, images, polls
     - Thread support for long content
   - linkedin-publisher.ts: LinkedIn via API
     - Support: text, images, articles
     - Company pages vs personal profiles

3. Publish worker (packages/workers/src/publish.worker.ts):
   - Process PUBLISH_POST jobs
   - Get post data from DB
   - Get user's tokens for platform
   - Call appropriate publisher
   - Update post status: PUBLISHED or FAILED
   - Store platformPostId and platformData
   - On failure: increment retry count, re-queue with delay (up to 3 retries)

4. Scheduler worker (packages/workers/src/scheduler.worker.ts):
   - Run every minute
   - Query posts where scheduledAt <= now AND status = SCHEDULED
   - Enqueue PUBLISH_POST job for each

5. API endpoints:
   - POST /api/posts/[id]/publish-now - immediate publish (skip schedule)
   - GET /api/posts/[id]/status - detailed publish status
   - POST /api/posts/[id]/retry - manually retry failed post

6. UI updates:
   - Publishing status indicator on posts
   - "Publish Now" button for drafts
   - Retry button for failed posts
   - View live post link after published

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 3.3: Analytics Ingestion
**Est. Time:** 4-5 hours

**Deliverables:**
1. Metrics collection from platforms
2. Analytics worker implementation
3. Metrics aggregation and storage
4. Historical data management

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to implement analytics data collection.

CURRENT STATE:
- Metrics table exists in schema
- Analytics worker stub at packages/workers/src/analytics.worker.ts
- Posts have platformPostId after publishing
- OAuth tokens available for API calls

TASK: Build analytics ingestion system

REQUIREMENTS:
1. Metrics schema (update/verify):
   - id, postId, platform, fetchedAt
   - impressions, reach, engagements, likes, comments, shares, saves, clicks
   - videoViews, videoWatchTime (for video posts)
   - rawData (JSON - full API response for platform-specific metrics)

2. Analytics fetchers (apps/web/lib/analytics/):
   - types.ts: StandardMetrics interface (normalized across platforms)
   - base-fetcher.ts: Abstract fetcher class
   - meta-fetcher.ts: FB/IG Insights API
   - twitter-fetcher.ts: X Analytics API
   - linkedin-fetcher.ts: LinkedIn Analytics API

3. Analytics worker (packages/workers/src/analytics.worker.ts):
   - Process FETCH_ANALYTICS jobs
   - Job payload: postId or userId+platform (for bulk)
   - Fetch metrics from platform API
   - Normalize to StandardMetrics
   - Upsert into metrics table
   - Schedule next fetch (more frequent for new posts)

4. Fetch scheduling logic:
   - New posts (< 24h): fetch every 2 hours
   - Recent posts (1-7 days): fetch every 6 hours
   - Older posts (7-30 days): fetch daily
   - Old posts (> 30 days): fetch weekly

5. Aggregation:
   - Daily rollups: aggregate metrics per day per post
   - Campaign rollups: total metrics across all posts in campaign
   - Account rollups: metrics by platform per user
   - Store in separate aggregated_metrics table or compute on-demand

6. API endpoints:
   - GET /api/analytics/post/[id] - metrics for single post
   - GET /api/analytics/campaign/[id] - aggregated campaign metrics
   - GET /api/analytics/overview - user's overall metrics summary
   - Parameters: dateRange, granularity (hour/day/week)

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 3.4: Analytics Dashboard
**Est. Time:** 4-5 hours

**Deliverables:**
1. Analytics overview dashboard
2. Post performance charts
3. Campaign analytics view
4. Export functionality

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to build analytics visualization UI.

CURRENT STATE:
- Analytics data being collected (Phase 3.3)
- Dashboard page exists at apps/web/app/(dashboard)/page.tsx (basic)
- No charts or visualizations

TASK: Build analytics dashboard and visualization

REQUIREMENTS:
1. Dashboard overview (apps/web/app/(dashboard)/page.tsx):
   - Key metrics cards: total reach, engagements, posts published (this week/month)
   - Trend indicators: up/down from previous period
   - Recent activity feed
   - Quick actions: create post, view calendar

2. Analytics page (apps/web/app/analytics/page.tsx):
   - Date range selector (preset: 7d, 30d, 90d, custom)
   - Platform filter
   - Campaign filter
   
3. Charts (use Recharts or Chart.js):
   - Engagement over time (line chart)
   - Reach by platform (bar chart)
   - Post performance comparison (scatter plot: reach vs engagement)
   - Best posting times heatmap (day/hour grid)
   - Top performing posts table

4. Post analytics detail:
   - Individual post metrics page
   - Metrics over time since publish
   - Platform-specific metrics breakdown
   - Compare to average performance

5. Campaign analytics (apps/web/app/campaigns/[id]/analytics/page.tsx):
   - Campaign-specific metrics aggregation
   - Post-by-post performance table
   - Campaign goals vs actual progress
   - Platform breakdown within campaign

6. Export functionality:
   - Export to CSV: metrics data
   - Export to PDF: visual report (basic)
   - Scheduled reports (stub for future)

7. AI insights integration:
   - "AI Analysis" section with generated insights
   - "Your video posts get 40% more engagement"
   - "Best time to post on Instagram: Tuesday 2pm"
   - Call existing AI suggestion endpoints

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

## TIER 4: Automation & Collaboration

*Power features for growth*

### Phase 4.1: Workflow Automation Builder
**Est. Time:** 5-6 hours

**Deliverables:**
1. Automation rule engine
2. Trigger and action definitions
3. Visual workflow builder UI
4. Automation execution

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to build Zapier-like automation features.

CURRENT STATE:
- Queue system exists
- Publishing engine exists
- AI content generation exists
- No automation system

TASK: Build workflow automation system

REQUIREMENTS:
1. Automation data model (Drizzle):
   - automations table: id, userId, name, description, isActive, createdAt, updatedAt
   - automation_triggers table: id, automationId, triggerType, config (JSON)
   - automation_actions table: id, automationId, actionType, config (JSON), order

2. Trigger types:
   - SCHEDULE: run at specific times (cron expression)
   - POST_PUBLISHED: when a post is published
   - NEW_ASSET: when asset is uploaded
   - WEBHOOK: external webhook received
   - MANUAL: user-triggered

3. Action types:
   - CREATE_POST: create post from template/AI
   - GENERATE_CONTENT: AI content generation
   - SEND_NOTIFICATION: email/in-app notification
   - UPDATE_CAMPAIGN: change campaign status
   - FETCH_ANALYTICS: trigger analytics fetch
   - WEBHOOK: call external URL

4. Automation engine (apps/web/lib/automation/):
   - engine.ts: Process automations
   - triggers.ts: Trigger handlers
   - actions.ts: Action executors
   - Chained actions: output of one → input of next

5. API endpoints:
   - CRUD for automations
   - POST /api/automations/[id]/test - dry run
   - POST /api/automations/[id]/run - manual trigger
   - GET /api/automations/[id]/logs - execution history

6. Automation builder UI (apps/web/app/automations/):
   - List of automations with status toggle
   - Visual flow builder:
     - Trigger node at top
     - Action nodes connected below
     - Drag to add actions
     - Click to configure each node
   - Test mode: run with sample data
   - Execution logs view

7. Pre-built templates:
   - "Auto-post on schedule" - schedule trigger → create post → publish
   - "Cross-post new content" - post published → generate variations → create posts
   - "Weekly analytics email" - schedule trigger → fetch analytics → send email

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 4.2: Team Collaboration
**Est. Time:** 4-5 hours

**Deliverables:**
1. Organization/workspace system
2. Team member management
3. Role-based permissions
4. Content approval workflows

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to add team collaboration features.

CURRENT STATE:
- User authentication exists
- Posts and campaigns are user-scoped
- No organization/team concept
- No approval workflows

TASK: Build team collaboration system

REQUIREMENTS:
1. Organization data model:
   - organizations table: id, name, slug, ownerId, plan, createdAt
   - organization_members table: id, orgId, userId, role, invitedAt, joinedAt
   - Roles: OWNER, ADMIN, EDITOR, VIEWER

2. Permission system:
   - permissions.ts: Define permissions per role
   - OWNER: all permissions + delete org
   - ADMIN: manage members, all content actions
   - EDITOR: create/edit content, cannot delete campaigns
   - VIEWER: read-only
   - Middleware to check permissions on API routes

3. Organization context:
   - Users can belong to multiple orgs
   - Org selector in header
   - All content scoped to current org
   - Personal workspace (no org) still supported

4. Team management UI (apps/web/app/settings/team/):
   - Invite member (by email)
   - Member list with roles
   - Change role / remove member
   - Pending invitations
   - Organization settings (name, billing)

5. Approval workflows:
   - Posts can require approval before publishing
   - New status: PENDING_APPROVAL
   - Approval config per organization
   - Approvers: specific users or roles (ADMIN+)
   - Notifications when approval needed/granted

6. Approval UI:
   - "Submit for Approval" button (for editors)
   - Approval queue for approvers
   - Approve/reject with comments
   - Activity log showing approval history

7. Invitation flow:
   - Email invitation with link
   - Accept page for new users (signup) or existing users (join)
   - Invitation expiry (7 days)

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 4.3: Enhanced Scheduling & Content Calendar
**Est. Time:** 3-4 hours

**Deliverables:**
1. Best-time scheduling with AI
2. Content queue/backlog
3. Recurring posts
4. Calendar enhancements

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to enhance scheduling and calendar features.

CURRENT STATE:
- Basic scheduling exists (Phase 1.4)
- Content calendar exists
- AI suggestions exist
- Analytics data available

TASK: Enhance scheduling with smart features

REQUIREMENTS:
1. Best-time scheduling:
   - When scheduling, show recommended times
   - Based on: platform best practices, user's historical performance
   - "Auto-schedule" option: let Mythos pick best time
   - Show expected reach indicator per time slot

2. Content queue:
   - Backlog view: posts without scheduled times
   - Queue settings per platform:
     - Posting frequency (e.g., 2/day on Twitter, 1/day on LinkedIn)
     - Time slots (9am, 2pm, 6pm)
   - "Add to Queue" - auto-assigns next available slot
   - Queue reordering (drag to prioritize)

3. Recurring posts:
   - Schedule post to repeat (daily, weekly, monthly)
   - recurring_posts table: id, originalPostId, frequency, nextRunAt, endDate
   - Each occurrence creates a new post from template
   - Option to vary content slightly (AI variation)

4. Calendar enhancements:
   - Color coding by: platform, campaign, status
   - Bulk operations: select multiple → reschedule/delete
   - Drag between days to reschedule
   - Slot visualization: show available vs filled slots
   - Conflict warning: too many posts at same time

5. Timezone handling:
   - User timezone setting
   - Schedule in user's timezone, store as UTC
   - Display times in user's timezone
   - Team members see their own timezone

6. API updates:
   - POST /api/posts/queue - add to queue
   - GET /api/schedule/suggestions - get best times
   - POST /api/posts/recurring - create recurring post

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 4.4: Notifications & Activity
**Est. Time:** 2-3 hours

**Deliverables:**
1. In-app notification system
2. Email notifications
3. Activity feed
4. Notification preferences

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to add notification system.

CURRENT STATE:
- User authentication exists
- Team collaboration exists
- Various events occur (posts published, approvals needed, etc.)
- No notification system

TASK: Build notification system

REQUIREMENTS:
1. Notification data model:
   - notifications table: id, userId, type, title, body, data (JSON), isRead, createdAt
   - Notification types: POST_PUBLISHED, POST_FAILED, APPROVAL_NEEDED, APPROVAL_GRANTED, 
     TEAM_INVITE, ANALYTICS_ALERT, AUTOMATION_FAILED

2. Notification service (apps/web/lib/notifications/):
   - create(userId, type, data) - create notification
   - markRead(notificationId)
   - markAllRead(userId)
   - getUnreadCount(userId)

3. In-app notifications:
   - Bell icon in header with unread count
   - Dropdown with recent notifications
   - Click to navigate to relevant item
   - "Mark all read" action

4. Email notifications:
   - email-templates/: HTML templates for each notification type
   - Use Resend or SendGrid for delivery
   - Digest option: daily summary instead of individual emails
   - Transactional emails: password reset, team invites (these always send)

5. Notification preferences (apps/web/app/settings/notifications/):
   - Toggle each notification type on/off for:
     - In-app
     - Email
     - Email digest
   - notification_preferences table: userId, notificationType, inApp, email, emailDigest

6. Activity feed:
   - Activity feed on dashboard
   - Per-campaign activity log
   - Types: post created, published, scheduled, failed, edited, approved

7. Integration points:
   - Publish worker: notify on success/failure
   - Approval system: notify when approval needed/granted
   - Automation: notify on failure
   - Analytics: notify on unusual metrics (future)

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

## TIER 5: Polish & Launch

*Ready for users*

### Phase 5.1: Onboarding Flow
**Est. Time:** 3-4 hours

**Deliverables:**
1. Welcome wizard
2. Platform connection guide
3. First post creation walkthrough
4. Feature discovery tooltips

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to create onboarding experience.

CURRENT STATE:
- All core features built
- New users land on dashboard with no guidance
- No onboarding flow

TASK: Build comprehensive onboarding experience

REQUIREMENTS:
1. Welcome wizard (first login):
   - Step 1: Welcome, explain what Mythos does
   - Step 2: "What do you want to achieve?" (grow audience, save time, create better content)
   - Step 3: Connect first social platform
   - Step 4: Create first post with AI assistance
   - Step 5: Schedule or publish
   - Store onboarding progress, allow skip/resume

2. Onboarding checklist (dashboard sidebar):
   - Visible until all steps complete
   - [ ] Complete profile
   - [ ] Connect a social account
   - [ ] Create your first post
   - [ ] Schedule a post
   - [ ] Explore AI features
   - Progress bar showing completion
   - Rewards/celebration on completion

3. Feature discovery:
   - Contextual tooltips on first visit to each section
   - "New" badges on features user hasn't tried
   - Guided tour option (re-trigger from help menu)

4. Empty states:
   - When no posts: "Create your first post" CTA with guidance
   - When no campaigns: Explain campaigns, suggest creating one
   - When no analytics: Explain data will appear after posting

5. Template gallery for quick start:
   - Pre-made post templates by industry/use case
   - Campaign templates (product launch, weekly series, etc.)
   - One-click use template

6. Help resources:
   - Help button → drawer with common questions
   - Links to documentation (stub)
   - Contact support option
   - Video tutorials (embed YouTube placeholders)

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 5.2: Testing & Quality
**Est. Time:** 4-5 hours

**Deliverables:**
1. Unit tests for critical functions
2. Integration tests for API routes
3. E2E tests for key flows
4. Test utilities and fixtures

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to add testing.

CURRENT STATE:
- No tests exist
- Complex features: auth, publishing, AI generation, automations
- Next.js 14 App Router, TypeScript

TASK: Implement testing infrastructure and critical tests

REQUIREMENTS:
1. Testing setup:
   - Vitest for unit and integration tests
   - Playwright for E2E tests
   - Test database setup (use Docker Compose test service)
   - package.json scripts: test, test:unit, test:integration, test:e2e

2. Unit tests (apps/web/__tests__/unit/):
   - AI prompt templates
   - Token encryption/decryption
   - Permission checking logic
   - Queue job payload validation
   - Metrics aggregation calculations

3. Integration tests (apps/web/__tests__/integration/):
   - Auth API routes (login, session)
   - Post CRUD API
   - Campaign CRUD API
   - AI generation API (mock AI provider)
   - Queue enqueue/dequeue

4. E2E tests (apps/web/__tests__/e2e/):
   - User signup → login → dashboard
   - Create and schedule a post
   - Connect social account (mock OAuth)
   - Create campaign with posts
   - Full publish flow (mock publisher)

5. Test utilities:
   - Test user factory
   - Mock data generators
   - API test helpers (authenticated requests)
   - Database reset between tests

6. CI configuration:
   - GitHub Actions workflow
   - Run tests on PR
   - Lint check
   - Type check
   - Coverage report

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 5.3: Performance & Monitoring
**Est. Time:** 3-4 hours

**Deliverables:**
1. Performance optimizations
2. Error tracking setup
3. Logging infrastructure
4. Health checks

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Need to optimize performance and add monitoring.

CURRENT STATE:
- Functional application
- Console logs only
- No performance optimization
- No error tracking

TASK: Add performance optimization and monitoring

REQUIREMENTS:
1. Performance optimization:
   - API route caching where appropriate (revalidate patterns)
   - Database query optimization (add missing indexes)
   - Image optimization (Next.js Image component usage)
   - Code splitting for large components
   - Lazy loading for analytics charts

2. Error tracking:
   - Sentry integration
   - Client-side error boundary
   - Server-side error capture
   - Custom error context (userId, orgId)
   - Source maps upload for debugging

3. Structured logging:
   - Logger utility (apps/web/lib/logger.ts)
   - JSON format with: timestamp, level, message, context
   - Log levels: debug, info, warn, error
   - Request ID tracking
   - Sensitive data redaction

4. Monitoring:
   - Health check endpoint: GET /api/health
     - Database connection
     - Redis connection
     - External services status
   - Metrics endpoint: GET /api/metrics (basic stats)
   - Worker health reporting

5. Database monitoring:
   - Slow query logging
   - Connection pool monitoring
   - Query count per request

6. Alerts (stub for production):
   - High error rate alert
   - Worker failure alert
   - Database connection issues

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

### Phase 5.4: Deployment & Launch
**Est. Time:** 2-3 hours

**Deliverables:**
1. Production deployment configuration
2. Environment setup documentation
3. Migration and rollback procedures
4. Launch checklist

**Self-Contained Prompt:**
```
I'm building Mythos, an AI storytelling platform. Ready for production deployment.

CURRENT STATE:
- Complete application
- Docker Compose for local dev
- No production deployment config

TASK: Set up production deployment

REQUIREMENTS:
1. Deployment options documentation:
   - Vercel (recommended for web app)
   - Railway/Render for workers
   - Cloudflare R2 for assets
   - Upstash for Redis/Queue
   - Neon/Supabase for Postgres

2. Vercel configuration:
   - vercel.json with proper settings
   - Environment variable setup guide
   - Edge function considerations
   - Build optimization settings

3. Worker deployment:
   - Dockerfile for workers
   - Railway/Render configuration
   - Environment variable mapping
   - Scaling configuration

4. Database migration:
   - Production migration script
   - Rollback procedures
   - Backup before migration
   - Zero-downtime migration strategy

5. Launch checklist (LAUNCH_CHECKLIST.md):
   - [ ] All environment variables set
   - [ ] Database migrated
   - [ ] OAuth apps configured for production URLs
   - [ ] DNS configured
   - [ ] SSL certificates active
   - [ ] Error tracking verified
   - [ ] Monitoring dashboards set up
   - [ ] Backup system configured
   - [ ] Rate limiting enabled
   - [ ] Security headers configured

6. Post-launch:
   - Feature flags for gradual rollout
   - A/B testing infrastructure (stub)
   - Feedback collection widget

OUTPUT: Complete file contents for all new/modified files with clear file paths.
```

---

## Quick Reference: Dependency Graph

```
TIER 0 (Foundation)
├── 0.1 Auth ────────────────────────────────┐
├── 0.2 Environment & DB ────────────────────┤
└── 0.3 Queue ───────────────────────────────┤
                                             │
TIER 1 (Core MVP)                            │
├── 1.1 Projects & Tasks ←───────────────────┤
├── 1.2 Campaign Creation ←──────────────────┤
├── 1.3 Asset Management ←───────────────────┤
└── 1.4 Post Management ←────────────────────┘
                    │
TIER 2 (AI Engine)  │
├── 2.1 AI Provider Integration ←────────────┤
├── 2.2 Content Generation ←─────────────────┤
├── 2.3 Image & Multi-Modal ←────────────────┤
└── 2.4 AI Assistant ←───────────────────────┘
                    │
TIER 3 (Publishing) │
├── 3.1 OAuth & Tokens ←─────────────────────┤
├── 3.2 Publishing Engine ←──────────────────┤
├── 3.3 Analytics Ingestion ←────────────────┤
└── 3.4 Analytics Dashboard ←────────────────┘
                    │
TIER 4 (Power Features)                      │
├── 4.1 Automation Builder ←─────────────────┤
├── 4.2 Team Collaboration ←─────────────────┤
├── 4.3 Enhanced Scheduling ←────────────────┤
└── 4.4 Notifications ←──────────────────────┘
                    │
TIER 5 (Launch)     │
├── 5.1 Onboarding ←─────────────────────────┤
├── 5.2 Testing ←────────────────────────────┤
├── 5.3 Performance & Monitoring ←───────────┤
└── 5.4 Deployment ←─────────────────────────┘
```

---

## Recommended Execution Strategy

### MVP Launch (Tiers 0-3): ~52-71 hours
This gets you a functional product that can:
- Authenticate users
- Create and schedule posts with AI assistance
- Publish to real social platforms
- Show analytics

### Full Platform (Tiers 4-5): ~26-41 hours additional
Adds power features:
- Automation workflows
- Team collaboration
- Enhanced scheduling
- Production-ready infrastructure

### Suggested Weekly Plan
- **Week 1-2:** Tier 0 + Tier 1 (Foundation + Core MVP)
- **Week 3:** Tier 2 (AI Engine)
- **Week 4:** Tier 3 (Publishing & Analytics)
- **Week 5:** Tier 4 (Automation & Collaboration)
- **Week 6:** Tier 5 (Polish & Launch)

---

## Notes

1. **Each prompt is self-contained** - Can be used in a fresh chat with full context
2. **Prompts build on each other** - Follow tier order, don't skip dependencies
3. **Adjust scope as needed** - Each prompt can be split further if too large
4. **Test as you go** - Don't wait for Tier 5 to start testing critical paths

---

*Built for Mythos. Ready to ship. 🚀*