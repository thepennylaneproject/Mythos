/**
 * Analytics API - Get metrics for a single post.
 * GET /api/analytics/post/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { metrics, posts } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get post
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get metrics
    const [postMetrics] = await db.select().from(metrics).where(eq(metrics.postId, id));

    return NextResponse.json({
      post: {
        id: post.id,
        channel: post.channel,
        caption: post.caption?.slice(0, 100),
        status: post.status,
        publishedAt: post.publishedAt,
      },
      metrics: postMetrics || {
        impressions: 0,
        reach: 0,
        clicks: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
      },
    });
  } catch (error: any) {
    console.error("[api/analytics/post] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
