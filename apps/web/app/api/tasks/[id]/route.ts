import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isTaskStatus, TASK_STATUSES, parseDate } from "@/lib/pm";
import { withAuth } from "@/lib/auth";

export const PATCH = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updates: Partial<typeof tasks.$inferInsert> = {};

  if (body?.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "Title must be a non-empty string" }, { status: 400 });
    }
    updates.title = body.title.trim();
  }

  if (body?.status !== undefined) {
    if (!isTaskStatus(body.status)) {
      return NextResponse.json({ error: `Status must be one of: ${TASK_STATUSES.join(", ")}` }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body?.dueAt !== undefined) {
    const parsed = parseDate(body.dueAt);
    if (body.dueAt && !parsed) {
      return NextResponse.json({ error: "Invalid dueAt date" }, { status: 400 });
    }
    updates.dueAt = parsed ?? null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, params.id)).returning();
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
});

export const DELETE = withAuth(async (_: NextRequest, { params }: { params: { id: string } }) => {
  const [deleted] = await db.delete(tasks).where(eq(tasks.id, params.id)).returning({ id: tasks.id });
  if (!deleted) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
});
