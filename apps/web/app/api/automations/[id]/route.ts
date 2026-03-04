/**
 * Single automation API - Get, update, delete, run, test.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { automations, automationTriggers, automationActions, automationLogs } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { runAutomation, testAutomation } from "@/lib/automation/engine";

// GET /api/automations/[id] - Get automation with triggers/actions
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [automation] = await db.select().from(automations).where(eq(automations.id, id));
    if (!automation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const triggers = await db.select().from(automationTriggers).where(eq(automationTriggers.automationId, id));
    const actions = await db.select().from(automationActions).where(eq(automationActions.automationId, id));
    const logs = await db
      .select()
      .from(automationLogs)
      .where(eq(automationLogs.automationId, id))
      .orderBy(desc(automationLogs.startedAt))
      .limit(10);

    return NextResponse.json({ automation, triggers, actions, logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/automations/[id] - Update automation (toggle active, update name)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(automations)
      .set(body)
      .where(eq(automations.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ automation: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/automations/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(automations).where(eq(automations.id, id));
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/automations/[id] - Run or test automation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "test") {
      const result = await testAutomation(id);
      return NextResponse.json(result);
    } else {
      const result = await runAutomation(id, "api");
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
