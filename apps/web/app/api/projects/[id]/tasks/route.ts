import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { isTaskStatus, TASK_STATUSES, TaskStatus, parseDate } from "@/lib/pm";
import { withAuth } from "@/lib/auth";

async function ensureProject(id: string) {
  const [proj] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, id));
  return proj;
}

export const GET = withAuth(async (_: NextRequest, { params }: { params: { id: string } }) => {
  const project = await ensureProject(params.id);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const rows = await db.select().from(tasks).where(eq(tasks.projectId, params.id)).orderBy(desc(tasks.createdAt));
  return NextResponse.json(rows.map(t => ({ ...t, status: isTaskStatus(t.status) ? t.status : "todo" as const })));
});

export const POST = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const project = await ensureProject(params.id);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Task title is required" }, { status: 400 });
  }

  let status: TaskStatus = "todo";
  if (body?.status !== undefined) {
    if (!isTaskStatus(body.status)) {
      return NextResponse.json({ error: `Status must be one of: ${TASK_STATUSES.join(", ")}` }, { status: 400 });
    }
    status = body.status;
  }

  const dueAt = parseDate(body?.dueAt);
  if (body?.dueAt && !dueAt) {
    return NextResponse.json({ error: "Invalid dueAt date" }, { status: 400 });
  }

  const [created] = await db.insert(tasks).values({
    projectId: params.id,
    title,
    status,
    dueAt: dueAt ?? undefined
  }).returning();

  return NextResponse.json(created, { status: 201 });
});
