/**
 * Analytics overview API - User's overall metrics summary.
 * GET /api/analytics/overview
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { metrics, posts } from "@/lib/schema";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Aggregate metrics across all posts
    const result = await db
      .select({
        totalImpressions: sql<number>`COALESCE(SUM(${metrics.impressions}), 0)`,
        totalReach: sql<number>`COALESCE(SUM(${metrics.reach}), 0)`,
        totalClicks: sql<number>`COALESCE(SUM(${metrics.clicks}), 0)`,
        totalLikes: sql<number>`COALESCE(SUM(${metrics.likes}), 0)`,
        totalComments: sql<number>`COALESCE(SUM(${metrics.comments}), 0)`,
        totalShares: sql<number>`COALESCE(SUM(${metrics.shares}), 0)`,
      })
      .from(metrics);

    // Count posts by status
    const postCounts = await db
      .select({
        status: posts.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(posts)
      .groupBy(posts.status);

    const statusCounts: Record<string, number> = {};
    postCounts.forEach((pc) => {
      if (pc.status) statusCounts[pc.status] = Number(pc.count);
    });

    return NextResponse.json({
      metrics: result[0] || {},
      posts: {
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        ...statusCounts,
      },
    });
  } catch (error: any) {
    console.error("[api/analytics/overview] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
