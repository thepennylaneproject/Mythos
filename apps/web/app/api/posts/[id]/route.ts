import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, metrics } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdatePostSchema = z.object({
  channel: z.string().max(48).optional(),
  network: z.string().max(24).optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
  altText: z.string().optional(),
  utmUrl: z.string().url().optional(),
  status: z.enum(["draft", "scheduled", "ready_to_publish", "published", "failed"]).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

// GET /api/posts/[id] - Get single post with metrics
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

    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Fetch associated metrics
    const [postMetrics] = await db.select().from(metrics).where(eq(metrics.postId, id));

    return NextResponse.json({ post, metrics: postMetrics || null });
  } catch (error: any) {
    console.error("[api/posts/[id]] GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch post" }, { status: 500 });
  }
}

// PATCH /api/posts/[id] - Update post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = UpdatePostSchema.parse(body);

    const updateData: any = { ...data };
    if (data.scheduledAt !== undefined) {
      updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    }

    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post: updated });
  } catch (error: any) {
    console.error("[api/posts/[id]] PATCH error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.format() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update post" }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning({ id: posts.id });

    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true, id: deleted.id });
  } catch (error: any) {
    console.error("[api/posts/[id]] DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete post" }, { status: 500 });
  }
}
