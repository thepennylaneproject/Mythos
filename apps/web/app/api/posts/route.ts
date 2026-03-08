import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, postPlans } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, gte, lte, inArray } from "drizzle-orm";
import { z } from "zod";

const CreatePostSchema = z.object({
  postPlanId: z.string().uuid().optional(),
  channel: z.string().max(48),
  network: z.string().max(24).optional(),
  caption: z.string(),
  tags: z.array(z.string()).optional(),
  altText: z.string().optional(),
  utmUrl: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
});

const QuerySchema = z.object({
  campaignId: z.string().uuid().optional(),
  channel: z.string().optional(),
  status: z.enum(["draft", "scheduled", "ready_to_publish", "published", "failed"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

// GET /api/posts - List posts with filtering
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    const query = QuerySchema.parse(params);

    let conditions: any[] = [];

    if (query.channel) {
      conditions.push(eq(posts.channel, query.channel));
    }
    if (query.status) {
      conditions.push(eq(posts.status, query.status));
    }
    if (query.from) {
      conditions.push(gte(posts.scheduledAt, new Date(query.from)));
    }
    if (query.to) {
      conditions.push(lte(posts.scheduledAt, new Date(query.to)));
    }

    const result = await db
      .select()
      .from(posts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(posts.scheduledAt))
      .limit(query.limit)
      .offset(query.offset);

    return NextResponse.json({ posts: result, count: result.length });
  } catch (error: any) {
    console.error("[api/posts] GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/posts - Create post
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = CreatePostSchema.parse(body);

    const [newPost] = await db
      .insert(posts)
      .values({
        postPlanId: data.postPlanId,
        channel: data.channel,
        network: data.network,
        caption: data.caption,
        tags: data.tags,
        altText: data.altText,
        utmUrl: data.utmUrl,
        status: data.scheduledAt ? "scheduled" : "draft",
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      })
      .returning();

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error: any) {
    console.error("[api/posts] POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.format() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 });
  }
}
