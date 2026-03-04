import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { desc, or, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch posts with health-related info (failed or with retries)
    const healthPosts = await db
      .select({
        id: posts.id,
        channel: posts.channel,
        publishStatus: posts.publishStatus,
        retryCount: posts.retryCount,
        healingStrategy: posts.healingStrategy,
        errorMessage: posts.errorMessage,
      })
      .from(posts)
      .where(
        or(
          eq(posts.publishStatus, "failed"),
          eq(posts.publishStatus, "queued"),
          eq(posts.publishStatus, "uploading")
        )
      )
      .orderBy(desc(posts.lastRetryAt))
      .limit(20);

    return NextResponse.json({ posts: healthPosts });
  } catch (error: any) {
    console.error("[api/posts/health] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch health" }, { status: 500 });
  }
}
