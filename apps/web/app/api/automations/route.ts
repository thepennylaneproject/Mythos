/**
 * Automations API - List and create automations.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { automations, automationTriggers, automationActions } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const CreateAutomationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.object({
    type: z.enum(["schedule", "post_published", "new_asset", "webhook", "manual"]),
    config: z.record(z.any()).optional(),
  }),
  actions: z.array(
    z.object({
      type: z.enum(["create_post", "generate_content", "send_notification", "update_campaign", "fetch_analytics", "webhook"]),
      config: z.record(z.any()).optional(),
    })
  ),
});

// GET /api/automations - List automations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .select()
      .from(automations)
      .orderBy(desc(automations.createdAt));

    return NextResponse.json({ automations: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/automations - Create automation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = CreateAutomationSchema.parse(body);

    // Create automation
    const [automation] = await db
      .insert(automations)
      .values({
        name: data.name,
        description: data.description,
        isActive: false,
      })
      .returning();

    // Create trigger
    await db.insert(automationTriggers).values({
      automationId: automation.id,
      triggerType: data.trigger.type,
      config: data.trigger.config || {},
    });

    // Create actions
    for (let i = 0; i < data.actions.length; i++) {
      await db.insert(automationActions).values({
        automationId: automation.id,
        actionType: data.actions[i].type,
        config: data.actions[i].config || {},
        order: i,
      });
    }

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.format() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
