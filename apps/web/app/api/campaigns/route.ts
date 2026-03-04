import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, projects } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { CHANNELS, isChannel } from "@/lib/channels";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest) => {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const projectId = typeof body?.projectId === "string" ? body.projectId : "";
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });

  const [proj] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId));
  if (!proj) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  let channelsList: string[] | undefined;
  if (Array.isArray(body?.channels)) {
    const filtered = body.channels.filter((c: unknown) => isChannel(c));
    if (!filtered.length && body.channels.length) {
      return NextResponse.json({ error: `channels must be one of: ${CHANNELS.join(", ")}` }, { status: 400 });
    }
    channelsList = filtered.length ? filtered : undefined;
  }

  const goal = typeof body?.goal === "string" ? body.goal.trim() : undefined;
  const brief = typeof body?.brief === "string" ? body.brief.trim() : undefined;

  const [created] = await db.insert(campaigns).values({
    projectId,
    name,
    goal: goal || null,
    brief: brief || null,
    channels: channelsList
  }).returning();

  return NextResponse.json(created, { status: 201 });
});
