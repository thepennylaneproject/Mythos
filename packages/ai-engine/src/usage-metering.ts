/**
 * Usage Metering: Track and limit resource usage.
 */

export type UsageMetric = "posts" | "ai_tokens" | "storage_mb" | "team_members";

export interface PlanLimits {
  posts: number;
  ai_tokens: number;
  storage_mb: number;
  team_members: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    posts: 10,
    ai_tokens: 5000,
    storage_mb: 100,
    team_members: 1,
  },
  starter: {
    posts: 50,
    ai_tokens: 25000,
    storage_mb: 500,
    team_members: 3,
  },
  pro: {
    posts: 200,
    ai_tokens: 100000,
    storage_mb: 2000,
    team_members: 10,
  },
  enterprise: {
    posts: Infinity,
    ai_tokens: Infinity,
    storage_mb: Infinity,
    team_members: Infinity,
  },
};

export interface UsageSummary {
  metric: UsageMetric;
  used: number;
  limit: number;
  percentage: number;
  overLimit: boolean;
}

/**
 * Calculate usage summary for a given metric.
 */
export function calculateUsage(
  metric: UsageMetric,
  used: number,
  plan: string
): UsageSummary {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const limit = limits[metric];
  const percentage = limit === Infinity ? 0 : Math.round((used / limit) * 100);

  return {
    metric,
    used,
    limit,
    percentage: Math.min(percentage, 100),
    overLimit: used > limit,
  };
}

/**
 * Check if an action is allowed based on usage limits.
 */
export function canPerformAction(
  metric: UsageMetric,
  currentUsage: number,
  plan: string,
  increment: number = 1
): { allowed: boolean; reason?: string } {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const limit = limits[metric];

  if (limit === Infinity) {
    return { allowed: true };
  }

  if (currentUsage + increment > limit) {
    return {
      allowed: false,
      reason: `You've reached your ${metric.replace("_", " ")} limit (${limit}). Upgrade your plan to continue.`,
    };
  }

  return { allowed: true };
}

/**
 * Format usage for display.
 */
export function formatUsageDisplay(summary: UsageSummary): string {
  if (summary.limit === Infinity) {
    return `${summary.used} (Unlimited)`;
  }
  return `${summary.used} / ${summary.limit}`;
}
