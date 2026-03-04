/**
 * Best-time scheduling API - suggests optimal posting times.
 * GET /api/scheduling/best-times
 */
import { NextRequest, NextResponse } from "next/server";

interface TimeSlot {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  hour: number; // 0-23
  score: number; // 0-100 (higher is better)
  reason: string;
}

// Platform-specific best practices (industry data)
const PLATFORM_BEST_TIMES: Record<string, TimeSlot[]> = {
  meta: [
    { dayOfWeek: 2, hour: 14, score: 95, reason: "Peak Instagram engagement on Tuesday afternoon" },
    { dayOfWeek: 3, hour: 11, score: 90, reason: "High Facebook reach mid-week mornings" },
    { dayOfWeek: 4, hour: 13, score: 88, reason: "Thursday lunch break browsing" },
  ],
  twitter: [
    { dayOfWeek: 1, hour: 9, score: 92, reason: "Monday morning Twitter activity high" },
    { dayOfWeek: 3, hour: 12, score: 89, reason: "Wednesday lunchtime engagement" },
    { dayOfWeek: 4, hour: 15, score: 85, reason: "Thursday afternoon discussions" },
  ],
  linkedin: [
    { dayOfWeek: 2, hour: 10, score: 94, reason: "B2B professionals most active Tuesday mornings" },
    { dayOfWeek: 3, hour: 11, score: 91, reason: "Wednesday late morning optimal for thought leadership" },
    { dayOfWeek: 4, hour: 9, score: 87, reason: "Thursday start of day for industry news" },
  ],
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") || "meta";

  const slots = PLATFORM_BEST_TIMES[platform] || PLATFORM_BEST_TIMES.meta;

  // Convert to user-friendly format
  const recommendations = slots.map((slot) => ({
    ...slot,
    dayName: DAY_NAMES[slot.dayOfWeek],
    timeDisplay: `${slot.hour.toString().padStart(2, "0")}:00`,
  }));

  return NextResponse.json({
    platform,
    recommendations,
    methodology: "Based on industry best practices and platform-specific engagement patterns",
  });
}
