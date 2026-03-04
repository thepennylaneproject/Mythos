import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, sprints, tasks } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { isProjectStatus, isTaskStatus, PROJECT_STATUSES } from "@/lib/pm";
import { withAuth } from "@/lib/auth";

async function getProjectWithRelations(id: string) {
  const [proj] = await db.select().from(projects).where(eq(projects.id, id));
  if (!proj) return null;

  const spr = await db.select().from(sprints).where(eq(sprints.projectId, proj.id)).orderBy(desc(sprints.startAt));
  const tks = await db.select().from(tasks).where(eq(tasks.projectId, proj.id)).orderBy(desc(tasks.createdAt));

  return {
    ...proj,
    sprints: spr,
    tasks: tks.map(t => ({ ...t, status: isTaskStatus(t.status) ? t.status : "todo" as const }))
  };
}

export const GET = withAuth(async (_: NextRequest, { params }: { params: { id: string } }) => {
  const proj = await getProjectWithRelations(params.id);
  if (!proj) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(proj);
});

export const PATCH = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updates: Partial<typeof projects.$inferInsert> = {};

  if (body?.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
    }
    updates.name = body.name.trim();
  }

  if (body?.status !== undefined) {
    if (!isProjectStatus(body.status)) {
      return NextResponse.json({ error: `Status must be one of: ${PROJECT_STATUSES.join(", ")}` }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db.update(projects).set(updates).where(eq(projects.id, params.id)).returning();
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
});

export const DELETE = withAuth(async (_: NextRequest, { params }: { params: { id: string } }) => {
  const [deleted] = await db.delete(projects).where(eq(projects.id, params.id)).returning({ id: projects.id });
  if (!deleted) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
});
