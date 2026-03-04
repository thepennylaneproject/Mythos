import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { isProjectStatus, PROJECT_STATUSES, ProjectStatus } from "@/lib/pm";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
  return NextResponse.json(rows);
});

export const POST = withAuth(async (req: NextRequest) => {
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  let status: ProjectStatus = "planned";
  if (body?.status !== undefined) {
    if (!isProjectStatus(body.status)) {
      return NextResponse.json({ error: `Status must be one of: ${PROJECT_STATUSES.join(", ")}` }, { status: 400 });
    }
    status = body.status;
  }

  const [created] = await db.insert(projects).values({ name, status }).returning();
  return NextResponse.json(created, { status: 201 });
});
