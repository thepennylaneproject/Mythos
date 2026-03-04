import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plugins, pluginExecutions, organizations } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// GET: List plugins for current org
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, session.user.id!));

    if (!userOrg) {
      return NextResponse.json({ plugins: [] });
    }

    const orgPlugins = await db
      .select()
      .from(plugins)
      .where(eq(plugins.orgId, userOrg.id));

    return NextResponse.json({ plugins: orgPlugins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create new plugin
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, session.user.id!));

    if (!userOrg) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await req.json();
    const { name, type, events, config } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const [newPlugin] = await db
      .insert(plugins)
      .values({
        orgId: userOrg.id,
        name,
        type,
        events: events || [],
        config: config || {},
        enabled: true,
      })
      .returning();

    return NextResponse.json(newPlugin);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
