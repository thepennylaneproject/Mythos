import { pgTable, uuid, text, varchar, timestamp, jsonb, integer, boolean, primaryKey, uniqueIndex, pgTableCreator } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
import { PostStatus } from "./postStatus";

// =================== CRM ===================
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  domain: text("domain"),
  tier: varchar("tier", { length: 10 }).$type<"lead" | "customer" | "vip">(),
  owner: uuid("owner"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role"),
  tags: jsonb("tags").$type<string[]>()
});

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  stage: varchar("stage", { length: 16 }).$type<"discover" | "proposal" | "won" | "lost">().default("discover"),
  value: integer("value").default(0),
  closeDate: timestamp("close_date"),
  source: text("source")
});

// =================== Projects / PM ===================
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  name: text("name").notNull(),
  status: varchar("status", { length: 16 }).$type<"planned" | "active" | "paused" | "done">().default("planned"),
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const sprints = pgTable("sprints", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  goal: text("goal")
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  sprintId: uuid("sprint_id").references(() => sprints.id),
  title: text("title").notNull(),
  status: varchar("status", { length: 12 }).$type<"todo" | "doing" | "review" | "blocked" | "done">().default("todo"),
  assignee: uuid("assignee"),
  priority: varchar("priority", { length: 8 }).$type<"low" | "med" | "high" | "urgent">().default("med"),
  startAt: timestamp("start_at"),
  dueAt: timestamp("due_at"),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  entity: varchar("entity", { length: 12 }).$type<"task" | "asset" | "post">().notNull(),
  entityId: uuid("entity_id").notNull(),
  state: varchar("state", { length: 16 }).$type<"requested" | "approved" | "changes">().default("requested"),
  by: uuid("by"),
  comment: text("comment"),
  ts: timestamp("ts").defaultNow()
});

export const activity = pgTable("activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  actor: uuid("actor"),
  verb: varchar("verb", { length: 16 }).notNull(),
  entity: varchar("entity", { length: 16 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  meta: jsonb("meta"),
  ts: timestamp("ts").defaultNow()
});

// =================== Marketing Ops ===================
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  goal: varchar("goal", { length: 48 }),
  brief: text("brief"),
  audience: jsonb("audience").$type<string[]>(),
  channels: jsonb("channels").$type<string[]>(),
  brandTokensId: uuid("brand_tokens_id"),
  status: varchar("status", { length: 24 }).$type<"draft" | "scheduled" | "live" | "completed">().default("draft"),
  // Agentic Mode fields (Tier 7.1)
  isAgentic: boolean("is_agentic").default(false),
  strategicState: jsonb("strategic_state").$type<{
    currentPhase: string;
    reasoning: string;
    plannedActions: Array<{ type: string; description: string; scheduledFor?: string }>;
    completedActions: string[];
  }>(),
  metricsThresholds: jsonb("metrics_thresholds").$type<{
    targetCTR?: number;
    targetEngagement?: number;
    targetConversions?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow()
});

export const postPlans = pgTable("post_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }),
  channel: varchar("channel", { length: 48 }),
  hypothesis: text("hypothesis"),
  slotAt: timestamp("slot_at"),
  variants: integer("variants").default(2),
  experiment: jsonb("experiment")
});

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  postPlanId: uuid("post_plan_id").references(() => postPlans.id),
  type: varchar("type", { length: 24 }), // copy | image | video | audio | doc | thumbnail
  variant: varchar("variant", { length: 12 }).default("v1"),
  uri: text("uri"),
  spec: jsonb("spec"),
  checksum: varchar("checksum", { length: 128 }),
  rightsOk: boolean("rights_ok").default(true),
  // Commercial Safety fields (Tier 9.3)
  licenseType: varchar("license_type", { length: 32 }).$type<"owned" | "licensed" | "royalty_free" | "creative_commons" | "ai_generated" | "unknown">().default("unknown"),
  licenseSource: text("license_source"), // e.g., "Unsplash", "Shutterstock", "DALL-E"
  licenseExpiry: timestamp("license_expiry"),
  safetyFlags: jsonb("safety_flags").$type<{
    scanned: boolean;
    issues: string[];
    score: number; // 0-100, higher is safer
  }>(),
  commercialUseAllowed: boolean("commercial_use_allowed").default(true)
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  postPlanId: uuid("post_plan_id").references(() => postPlans.id, { onDelete: "set null" }),
  channel: varchar("channel", { length: 48 }),
  network: varchar("network", { length: 24 }), // instagram|facebook|linkedin|tiktok|x...
  caption: text("caption"),
  tags: jsonb("tags").$type<string[]>(),
  altText: text("alt_text"),
  utmUrl: text("utm_url"),
  status: varchar("status", { length: 24 }).$type<PostStatus>().default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  vendorObjectType: varchar("vendor_object_type", { length: 32 }),
  vendorObjectId: text("vendor_object_id"),
  publishStatus: varchar("publish_status", { length: 16 }).$type<"queued" | "uploading" | "processing" | "posted" | "failed">().default("queued"),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  // Self-Healing Publishing fields (Tier 7.3)
  retryCount: integer("retry_count").default(0),
  lastRetryAt: timestamp("last_retry_at"),
  healingStrategy: jsonb("healing_strategy").$type<{
    diagnosis: string;
    actionsTaken: string[];
    resolved: boolean;
  }>(),
  // Deeplink Publishing fields (Tier 8.1)
  deeplink: jsonb("deeplink").$type<{
    url: string;
    fallbackUrl: string;
    platform: string;
  }>()
});

export const metrics = pgTable("metrics", {
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).primaryKey(),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  clicks: integer("clicks").default(0),
  saves: integer("saves").default(0),
  shares: integer("shares").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  engagementRate: integer("engagement_rate").default(0), // Changed from real to integer based on common practice for percentage-like metrics
  fetchedAt: timestamp("fetched_at").defaultNow()
});

// =================== Community CRM (Tier 8.2) ===================
export const communityMembers = pgTable("community_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  platformHandle: varchar("platform_handle", { length: 128 }).notNull(),
  platform: varchar("platform", { length: 24 }).notNull(), // instagram, x, linkedin, tiktok
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  superfanScore: integer("superfan_score").default(0), // 0-100
  tier: varchar("tier", { length: 16 }).$type<"casual" | "engaged" | "superfan" | "ambassador">().default("casual"),
  totalEngagements: integer("total_engagements").default(0),
  lastEngagedAt: timestamp("last_engaged_at"),
  tags: jsonb("tags").$type<string[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const engagementEvents = pgTable("engagement_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => communityMembers.id, { onDelete: "cascade" }),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "set null" }),
  eventType: varchar("event_type", { length: 24 }).$type<"like" | "comment" | "share" | "save" | "reply" | "mention">().notNull(),
  content: text("content"), // e.g., comment text
  sentiment: varchar("sentiment", { length: 12 }).$type<"positive" | "neutral" | "negative">(),
  weight: integer("weight").default(1), // for scoring: like=1, comment=3, share=5, etc.
  createdAt: timestamp("created_at").defaultNow()
});

// =================== Plugin System (Tier 9.1) ===================
export const plugins = pgTable("plugins", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 64 }).notNull(),
  type: varchar("type", { length: 16 }).$type<"webhook" | "native" | "oauth">().notNull(),
  enabled: boolean("enabled").default(true),
  events: jsonb("events").$type<string[]>(), // e.g., ["post.created", "post.published"]
  config: jsonb("config").$type<{
    webhookUrl?: string;
    secret?: string;
    headers?: Record<string, string>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const pluginExecutions = pgTable("plugin_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  pluginId: uuid("plugin_id").references(() => plugins.id, { onDelete: "cascade" }),
  event: varchar("event", { length: 48 }).notNull(),
  status: varchar("status", { length: 16 }).$type<"pending" | "success" | "failed">().default("pending"),
  payload: jsonb("payload"),
  response: jsonb("response"),
  errorMessage: text("error_message"),
  executedAt: timestamp("executed_at").defaultNow()
});

// =================== Vendor tokens ===================
export const vendorTokens = pgTable("vendor_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendor: varchar("vendor", { length: 16 }).$type<"meta" | "linkedin" | "tiktok" | "x">().notNull(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  meta: jsonb("meta")
});

// =================== Monetization (Tier 9.2) ===================
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  plan: varchar("plan", { length: 24 }).$type<"free" | "starter" | "pro" | "enterprise">().default("free"),
  status: varchar("status", { length: 16 }).$type<"active" | "canceled" | "past_due" | "trialing">().default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const usageRecords = pgTable("usage_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  metric: varchar("metric", { length: 32 }).$type<"posts" | "ai_tokens" | "storage_mb" | "team_members">().notNull(),
  quantity: integer("quantity").default(0),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  stripeInvoiceId: text("stripe_invoice_id"),
  amountDue: integer("amount_due"), // cents
  amountPaid: integer("amount_paid"),
  status: varchar("status", { length: 16 }).$type<"draft" | "open" | "paid" | "void">().default("draft"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  createdAt: timestamp("created_at").defaultNow()
});

// =================== Auth ===================
const authTable = pgTableCreator((name) => `auth_${name}`);

export const users = authTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name"),
  image: text("image"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
}, (table) => ({
  emailIdx: uniqueIndex("auth_users_email_unique").on(table.email)
}));

export const authAccounts = authTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccount["type"]>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state")
}, (table) => ({
  providerProviderAccountId: primaryKey({ columns: [table.provider, table.providerAccountId] })
}));

export const sessions = authTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const verificationTokens = authTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  compositePk: primaryKey({ columns: [table.identifier, table.token] })
}));

// =================== Organizations ===================
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 64 }).notNull(),
  ownerId: uuid("owner_id").references(() => users.id),
  plan: varchar("plan", { length: 24 }).$type<"free" | "pro" | "enterprise">().default("free"),
  createdAt: timestamp("created_at").defaultNow()
});

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 16 }).$type<"owner" | "admin" | "editor" | "viewer">().default("viewer"),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at")
});

// =================== Automations ===================
export const automations = pgTable("automations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});

export const automationTriggers = pgTable("automation_triggers", {
  id: uuid("id").primaryKey().defaultRandom(),
  automationId: uuid("automation_id").references(() => automations.id, { onDelete: "cascade" }),
  triggerType: varchar("trigger_type", { length: 32 }).$type<"schedule" | "post_published" | "new_asset" | "webhook" | "manual">().notNull(),
  config: jsonb("config").$type<Record<string, any>>()
});

export const automationActions = pgTable("automation_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  automationId: uuid("automation_id").references(() => automations.id, { onDelete: "cascade" }),
  actionType: varchar("action_type", { length: 32 }).$type<"create_post" | "generate_content" | "send_notification" | "update_campaign" | "fetch_analytics" | "webhook">().notNull(),
  config: jsonb("config").$type<Record<string, any>>(),
  order: integer("order").default(0)
});

export const automationLogs = pgTable("automation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  automationId: uuid("automation_id").references(() => automations.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 16 }).$type<"running" | "success" | "failed">().notNull(),
  triggeredBy: varchar("triggered_by", { length: 32 }),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  output: jsonb("output"),
  error: text("error")
});

// =================== Notifications ===================
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 32 }).$type<"post_published" | "post_failed" | "approval_needed" | "approval_granted" | "team_invite" | "analytics_alert" | "automation_failed">().notNull(),
  title: text("title").notNull(),
  body: text("body"),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  notificationType: varchar("notification_type", { length: 32 }).notNull(),
  inApp: boolean("in_app").default(true),
  email: boolean("email").default(true),
  emailDigest: boolean("email_digest").default(false)
});

// =================== Onboarding ===================
export const userOnboarding = pgTable("user_onboarding", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  completedSteps: jsonb("completed_steps").$type<string[]>().default([]),
  currentStep: integer("current_step").default(0),
  isComplete: boolean("is_complete").default(false),
  completedAt: timestamp("completed_at")
});

// =================== Intelligence ===================
export const brandKnowledge = pgTable("brand_knowledge", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<{
    source: string;
    type: "style_guide" | "tone" | "asset_context" | "past_campaign";
    tags?: string[];
  }>(),
  vectorId: text("vector_id"),
  createdAt: timestamp("created_at").defaultNow()
});
