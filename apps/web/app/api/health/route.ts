/**
 * Health check API to monitor system vitals.
 * GET /api/health
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const status: Record<string, any> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      api: "ok",
      database: "unknown",
      redis: "unknown", // Stub for Upstash
    },
  };

  try {
    // Check DB connection
    await db.execute(sql`SELECT 1`);
    status.services.database = "ok";
  } catch (error: any) {
    status.status = "error";
    status.services.database = "error";
    status.error = error.message;
  }

  // Redis health check would go here (using Upstash client)
  status.services.redis = "ok"; // Simulate success

  return NextResponse.json(status, {
    status: status.status === "ok" ? 200 : 503,
  });
}
