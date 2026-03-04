/**
 * Community CRM: Superfan engagement scoring and tracking.
 */

export interface EngagementWeights {
  like: number;
  comment: number;
  share: number;
  save: number;
  reply: number;
  mention: number;
}

const DEFAULT_WEIGHTS: EngagementWeights = {
  like: 1,
  comment: 3,
  share: 5,
  save: 2,
  reply: 4,
  mention: 6,
};

export type MemberTier = "casual" | "engaged" | "superfan" | "ambassador";

export interface SuperfanMetrics {
  totalScore: number;
  tier: MemberTier;
  engagementCount: number;
  recentActivity: number; // points from last 30 days
}

/**
 * Calculate superfan score based on engagement events.
 */
export function calculateSuperfanScore(
  events: Array<{ eventType: keyof EngagementWeights; createdAt: Date }>,
  weights: EngagementWeights = DEFAULT_WEIGHTS
): SuperfanMetrics {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  let totalScore = 0;
  let recentActivity = 0;

  for (const event of events) {
    const weight = weights[event.eventType] || 1;
    totalScore += weight;

    if (event.createdAt.getTime() > thirtyDaysAgo) {
      recentActivity += weight;
    }
  }

  // Normalize to 0-100 scale (assuming max ~200 points for superfan)
  const normalizedScore = Math.min(100, Math.round((totalScore / 200) * 100));

  // Determine tier
  let tier: MemberTier;
  if (normalizedScore >= 80) {
    tier = "ambassador";
  } else if (normalizedScore >= 50) {
    tier = "superfan";
  } else if (normalizedScore >= 20) {
    tier = "engaged";
  } else {
    tier = "casual";
  }

  return {
    totalScore: normalizedScore,
    tier,
    engagementCount: events.length,
    recentActivity,
  };
}

/**
 * Get tier badge styling.
 */
export function getTierStyle(tier: MemberTier): { color: string; emoji: string; label: string } {
  switch (tier) {
    case "ambassador":
      return { color: "bg-purple-100 text-purple-700", emoji: "👑", label: "Ambassador" };
    case "superfan":
      return { color: "bg-pink-100 text-pink-700", emoji: "⭐", label: "Superfan" };
    case "engaged":
      return { color: "bg-blue-100 text-blue-700", emoji: "💙", label: "Engaged" };
    default:
      return { color: "bg-gray-100 text-gray-600", emoji: "👋", label: "Casual" };
  }
}
