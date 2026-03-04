import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { accounts, projects, sprints, tasks } from "@/lib/schema";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async () => {
  const [acct] = await db.insert(accounts).values({ name: "Demo Client", tier: "customer" }).returning();
  const start = new Date();
  const end = new Date(Date.now() + 14 * 86400000);

  const [proj] = await db.insert(projects).values({
    accountId: acct.id, name: "Mythos Launch", status: "planned", startAt: start, endAt: end
  }).returning();

  const [sp] = await db.insert(sprints).values({
    projectId: proj.id, name: "Sprint 1", startAt: start, endAt: new Date(Date.now() + 7 * 86400000), goal: "MVP spine"
  }).returning();

  await db.insert(tasks).values([
    { projectId: proj.id, sprintId: sp.id, title: "Auth scaffold", status: "todo", points: 3 },
    { projectId: proj.id, sprintId: sp.id, title: "Kanban + Gantt", status: "doing", points: 5 },
    { projectId: proj.id, sprintId: sp.id, title: "Publish queue stubs", status: "review", points: 3 }
  ]);

  return NextResponse.json({ ok: true, proj });
});
