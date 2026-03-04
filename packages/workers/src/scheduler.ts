import { and, eq, inArray, isNotNull, lte } from "drizzle-orm";
import { db, pool } from "../../apps/web/lib/db";
import { posts } from "../../apps/web/lib/schema";

const rawInterval = Number.parseInt(process.env.SCHEDULER_INTERVAL_MS ?? "30000", 10);
const INTERVAL_MS = Number.isFinite(rawInterval) && rawInterval > 0 ? rawInterval : 30000;

type DuePost = {
  id: string;
  scheduledAt: Date | null;
};

async function findDuePosts(now: Date): Promise<DuePost[]> {
  return db.select({ id: posts.id, scheduledAt: posts.scheduledAt })
    .from(posts)
    .where(and(
      eq(posts.status, "scheduled"),
      isNotNull(posts.scheduledAt),
      lte(posts.scheduledAt, now)
    ));
}

async function markReady(ids: string[]) {
  if (ids.length === 0) return [];
  return db.update(posts)
    .set({ status: "ready_to_publish" })
    .where(and(inArray(posts.id, ids), eq(posts.status, "scheduled")))
    .returning({ id: posts.id, scheduledAt: posts.scheduledAt });
}

async function runOnce() {
  const now = new Date();
  const due = await findDuePosts(now);
  if (due.length === 0) {
    console.log(`[scheduler] ${now.toISOString()} no due posts`);
    return;
  }

  const updated = await markReady(due.map(p => p.id));
  if (updated.length === 0) {
    console.log(`[scheduler] ${now.toISOString()} skipped updates (status changed concurrently)`);
    return;
  }

  const payload = updated.map(p => ({ id: p.id, scheduledAt: p.scheduledAt?.toISOString() }));
  console.log(`[scheduler] ${now.toISOString()} marked ready_to_publish`, payload);
}

export async function runScheduler() {
  if (!process.env.DATABASE_URL) {
    console.error("[scheduler] DATABASE_URL is required");
    process.exit(1);
  }

  console.log(`[scheduler] starting; interval=${INTERVAL_MS}ms`);
  try {
    await runOnce();
  } catch (err) {
    console.error("[scheduler] initial tick failed", err);
  }
  setInterval(() => {
    runOnce().catch(err => console.error("[scheduler] tick failed", err));
  }, INTERVAL_MS);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    console.log(`[scheduler] received ${signal}, shutting down`);
    await pool.end();
    process.exit(0);
  });
}

runScheduler().catch(err => {
  console.error("[scheduler] fatal error", err);
  process.exit(1);
});
