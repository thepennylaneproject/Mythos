import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, uuid, text, timestamp, jsonb, integer, varchar } from "drizzle-orm/pg-core";
import { Pool } from "pg";

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  goal: varchar("goal", { length: 48 }),
  brief: text("brief"),
  audience: jsonb("audience").$type<string[]>(),
  channels: jsonb("channels").$type<string[]>(),
  brandTokensId: uuid("brand_tokens_id"),
  status: varchar("status", { length: 24 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow()
});

export const postPlans = pgTable("post_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  channel: varchar("channel", { length: 48 }),
  hypothesis: text("hypothesis"),
  slotAt: timestamp("slot_at"),
  variants: integer("variants").default(2),
  experiment: jsonb("experiment")
});

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  postPlanId: uuid("post_plan_id").references(() => postPlans.id),
  type: varchar("type", { length: 24 }), // copy | image | video | thumbnail
  variant: varchar("variant", { length: 12 }).default("v1"),
  uri: text("uri"),
  spec: jsonb("spec"),
  checksum: varchar("checksum", { length: 128 })
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  postPlanId: uuid("post_plan_id").references(() => postPlans.id),
  channel: varchar("channel", { length: 48 }),
  caption: text("caption"),
  tags: jsonb("tags").$type<string[]>(),
  altText: text("alt_text"),
  utmUrl: text("utm_url"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  vendorPostId: text("vendor_post_id"),
  status: varchar("status", { length: 24 }).default("queued")
});

export const metrics = pgTable("metrics", {
  postId: uuid("post_id").references(() => posts.id).primaryKey(),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  clicks: integer("clicks").default(0),
  saves: integer("saves").default(0),
  shares: integer("shares").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  watchTimeSec: integer("watch_time_sec").default(0),
  cvr: integer("cvr").default(0),
  fetchedAt: timestamp("fetched_at").defaultNow()
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);