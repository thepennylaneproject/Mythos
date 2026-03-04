/**
 * Automation engine - orchestrates trigger checks and action execution.
 */
import { db } from "@/lib/db";
import { automations, automationActions, automationLogs } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { executeAction, ActionConfig } from "./actions";

export interface AutomationRun {
  automationId: string;
  logId: string;
  status: "running" | "success" | "failed";
  output?: Record<string, any>;
  error?: string;
}

// Run an automation by ID
export async function runAutomation(automationId: string, triggeredBy: string = "manual"): Promise<AutomationRun> {
  console.log(`[engine] running automation ${automationId}`);

  // Get automation
  const [automation] = await db.select().from(automations).where(eq(automations.id, automationId));
  if (!automation) {
    return { automationId, logId: "", status: "failed", error: "Automation not found" };
  }

  // Create log entry
  const [log] = await db
    .insert(automationLogs)
    .values({
      automationId,
      status: "running",
      triggeredBy,
    })
    .returning();

  // Get actions in order
  const actions = await db
    .select()
    .from(automationActions)
    .where(eq(automationActions.automationId, automationId))
    .orderBy(asc(automationActions.order));

  let context: Record<string, any> = {};
  let allSucceeded = true;

  // Execute actions in sequence
  for (const action of actions) {
    const result = await executeAction(
      { type: action.actionType, config: action.config || {} } as ActionConfig,
      context
    );

    if (!result.success) {
      allSucceeded = false;
      await db
        .update(automationLogs)
        .set({ status: "failed", completedAt: new Date(), error: result.error })
        .where(eq(automationLogs.id, log.id));

      return { automationId, logId: log.id, status: "failed", error: result.error };
    }

    // Chain output to next action
    context = { ...context, ...result.output };
  }

  // Mark success
  await db
    .update(automationLogs)
    .set({ status: "success", completedAt: new Date(), output: context })
    .where(eq(automationLogs.id, log.id));

  return { automationId, logId: log.id, status: "success", output: context };
}

// Dry run (test mode) - simulates without side effects
export async function testAutomation(automationId: string): Promise<AutomationRun> {
  console.log(`[engine] testing automation ${automationId} (dry run)`);

  const [automation] = await db.select().from(automations).where(eq(automations.id, automationId));
  if (!automation) {
    return { automationId, logId: "", status: "failed", error: "Automation not found" };
  }

  const actions = await db
    .select()
    .from(automationActions)
    .where(eq(automationActions.automationId, automationId))
    .orderBy(asc(automationActions.order));

  return {
    automationId,
    logId: "test-run",
    status: "success",
    output: { actionsCount: actions.length, dryRun: true },
  };
}
