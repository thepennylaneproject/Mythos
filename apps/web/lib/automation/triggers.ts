/**
 * Automation trigger handlers.
 */
import { db } from "@/lib/db";
import { automationTriggers, automations } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export type TriggerType = "schedule" | "post_published" | "new_asset" | "webhook" | "manual";

export interface TriggerContext {
  automationId: string;
  triggerType: TriggerType;
  payload?: Record<string, any>;
}

// Check if a trigger should fire based on event
export async function checkTrigger(type: TriggerType, eventData: Record<string, any>): Promise<string[]> {
  // Find active automations with this trigger type
  const triggers = await db
    .select({
      automationId: automationTriggers.automationId,
      config: automationTriggers.config,
    })
    .from(automationTriggers)
    .innerJoin(automations, eq(automations.id, automationTriggers.automationId))
    .where(and(eq(automationTriggers.triggerType, type), eq(automations.isActive, true)));

  // Return automation IDs that should be triggered
  return triggers.map((t) => t.automationId!);
}

// Schedule trigger check (called by cron)
export async function checkScheduleTriggers(): Promise<string[]> {
  // In production, this would check cron expressions against current time
  console.log("[triggers] checking schedule triggers...");
  return checkTrigger("schedule", { timestamp: new Date().toISOString() });
}
