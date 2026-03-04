import { and, asc, eq } from "drizzle-orm";
import { db, pool } from "../../apps/web/lib/db";
import { posts } from "../../apps/web/lib/schema";
import { PostStatus } from "../../apps/web/lib/postStatus";

const rawInterval = Number.parseInt(process.env.PUBLISHER_INTERVAL_MS ?? "30000", 10);
const INTERVAL_MS = Number.isFinite(rawInterval) && rawInterval > 0 ? rawInterval : 30000;

type ReadyPost = {
  id: string;
  channel: string | null;
  caption: string | null;
  scheduledAt: Date | null;
};

async function findReadyPosts(limit = 20): Promise<ReadyPost[]> {
  return db.select({
    id: posts.id,
    channel: posts.channel,
    caption: posts.caption,
    scheduledAt: posts.scheduledAt
  }).from(posts)
    .where(eq(posts.status, "ready_to_publish"))
    .orderBy(asc(posts.scheduledAt))
    .limit(limit);
}

async function updateStatus(id: string, status: PostStatus, opts?: { onlyIf?: PostStatus; errorMessage?: string }) {
  const update: Partial<typeof posts.$inferInsert> = { status };
  if (status === "published") {
    update.publishedAt = new Date();
    update.errorMessage = null;
  }
  if (status === "failed") {
    update.errorMessage = opts?.errorMessage?.slice(0, 512) ?? "publish failed";
  }

  const where = opts?.onlyIf ? and(eq(posts.id, id), eq(posts.status, opts.onlyIf)) : eq(posts.id, id);
  const [row] = await db.update(posts).set(update).where(where).returning({ id: posts.id, status: posts.status });
  return row;
}

async function publishPost(post: ReadyPost) {
  const meta = {
    id: post.id,
    channel: post.channel,
    scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString() : null
  };

  console.log(`[publish] ${new Date().toISOString()} preparing`, meta);
  try {
    console.log("[publish] would publish payload", {
      ...meta,
      caption: post.caption
    });

    const updated = await updateStatus(post.id, "published", { onlyIf: "ready_to_publish" });
    if (!updated) {
      console.log(`[publish] ${post.id} skipped (status changed)`);
      return;
    }
    console.log(`[publish] ${post.id} marked published`);
  } catch (err: any) {
    console.error(`[publish] ${post.id} failed`, err);
    await updateStatus(post.id, "failed", { onlyIf: "ready_to_publish", errorMessage: err?.message || "publish failed" });
  }
}

async function runOnce() {
  const ready = await findReadyPosts();
  if (ready.length === 0) {
    console.log(`[publish] ${new Date().toISOString()} no ready posts`);
    return;
  }

  for (const post of ready) {
    await publishPost(post);
  }
}

export async function runPublishWorker() {
  if (!process.env.DATABASE_URL) {
    console.error("[publish] DATABASE_URL is required");
    process.exit(1);
  }

  console.log(`[publish] starting; interval=${INTERVAL_MS}ms`);
  try {
    await runOnce();
  } catch (err) {
    console.error("[publish] initial tick failed", err);
  }

  setInterval(() => {
    runOnce().catch(err => console.error("[publish] tick failed", err));
  }, INTERVAL_MS);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    console.log(`[publish] received ${signal}, shutting down`);
    await pool.end();
    process.exit(0);
  });
}

runPublishWorker().catch(err => {
  console.error("[publish] fatal error", err);
  process.exit(1);
});
