import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, projects } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (_: NextRequest, { params }: { params: { id: string } }) => {
  const [proj] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, params.id));
  if (!proj) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const rows = await db.select().from(campaigns).where(eq(campaigns.projectId, params.id)).orderBy(desc(campaigns.createdAt));
  return NextResponse.json(rows);
});
