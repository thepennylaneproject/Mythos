import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest) => {
  const { postPlanId, channel, scheduledAt, utmUrl, caption, tags, altText } = await req.json();

  const [post] = await db.insert(posts).values({
    postPlanId,
    channel,
    scheduledAt: new Date(scheduledAt),
    utmUrl,
    caption,
    tags,
    altText,
    publishStatus: "queued"
  }).returning();

  return NextResponse.json({ id: post.id });
});
