import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, posts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { CHANNELS, Channel, isChannel } from "@/lib/channels";
import { parseDate } from "@/lib/pm";
import { withAuth } from "@/lib/auth";

async function ensureCampaign(id: string) {
  const [row] = await db.select({ id: campaigns.id }).from(campaigns).where(eq(campaigns.id, id));
  return row;
}

type PostInput = {
  channel?: Channel;
  caption?: string;
  scheduledAt?: string | null;
};

function normalizePosts(body: any): PostInput[] | null {
  if (Array.isArray(body?.posts)) return body.posts;
  if (body && typeof body === "object") return [body];
  return null;
}

export const GET = withAuth(async (_: NextRequest, { params }: { params: { id: string } }) => {
  const campaign = await ensureCampaign(params.id);
  if (!campaign) return NextResponse.json({ error: "campaign not found" }, { status: 404 });

  const rows = await db.select().from(posts).where(eq(posts.campaignId, params.id)).orderBy(desc(posts.createdAt));
  return NextResponse.json(rows);
});

export const POST = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const campaign = await ensureCampaign(params.id);
  if (!campaign) return NextResponse.json({ error: "campaign not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const inputs = normalizePosts(body);
  if (!inputs || inputs.length === 0) {
    return NextResponse.json({ error: "At least one post is required" }, { status: 400 });
  }

  const values: typeof posts.$inferInsert[] = [];
  for (const item of inputs) {
    const channel = isChannel(item?.channel) ? item.channel : null;
    const caption = typeof item?.caption === "string" ? item.caption.trim() : "";
    if (!channel) {
      return NextResponse.json({ error: `channel is required and must be one of ${CHANNELS.join(", ")}` }, { status: 400 });
    }
    if (!caption) {
      return NextResponse.json({ error: "caption is required" }, { status: 400 });
    }

    let scheduledAt = parseDate(item?.scheduledAt);
    if (item?.scheduledAt && !scheduledAt) {
      return NextResponse.json({ error: "Invalid scheduledAt date" }, { status: 400 });
    }

    values.push({
      campaignId: params.id,
      channel,
      network: channel,
      caption,
      scheduledAt: scheduledAt ?? null,
      status: scheduledAt ? "scheduled" : "draft"
    });
  }

  const created = await db.insert(posts).values(values).returning();
  return NextResponse.json(created, { status: 201 });
});
