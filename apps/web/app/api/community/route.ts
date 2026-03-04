import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { communityMembers, engagementEvents, organizations } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { calculateSuperfanScore } from "@mythos/ai-engine";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's org
    const [userOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, session.user.id!));

    if (!userOrg) {
      return NextResponse.json({ members: [], stats: { total: 0, superfans: 0, ambassadors: 0 } });
    }

    // Fetch community members
    const members = await db
      .select()
      .from(communityMembers)
      .where(eq(communityMembers.orgId, userOrg.id))
      .orderBy(desc(communityMembers.superfanScore))
      .limit(50);

    // Calculate stats
    const stats = {
      total: members.length,
      superfans: members.filter(m => m.tier === "superfan" || m.tier === "ambassador").length,
      ambassadors: members.filter(m => m.tier === "ambassador").length,
      engaged: members.filter(m => m.tier === "engaged").length,
    };

    return NextResponse.json({ members, stats });
  } catch (error: any) {
    console.error("[api/community] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch community" }, { status: 500 });
  }
}
