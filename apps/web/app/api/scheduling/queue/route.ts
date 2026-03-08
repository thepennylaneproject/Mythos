/**
 * Content queue/backlog API - posts without scheduled times.
 * GET /api/scheduling/queue
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq, isNull, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get draft posts without scheduled time (backlog)
    const backlog = await db
      .select()
      .from(posts)
      .where(eq(posts.status, "draft"))
      .orderBy(desc(posts.id))
      .limit(50);

    // Get scheduled posts (queue)
    const scheduled = await db
      .select()
      .from(posts)
      .where(eq(posts.status, "scheduled"))
      .orderBy(posts.scheduledAt)
      .limit(50);

    return NextResponse.json({
      backlog: backlog.length,
      scheduled: scheduled.length,
      posts: {
        backlog,
        scheduled,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
