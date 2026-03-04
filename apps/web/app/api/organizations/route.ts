/**
 * Organizations API - List and create organizations.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, organizationMembers } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const CreateOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
});

// GET /api/organizations - List user's organizations
export async function GET(req: NextRequest) {
  try {
    // In production, filter by userId from session
    const result = await db.select().from(organizations).orderBy(desc(organizations.createdAt));
    return NextResponse.json({ organizations: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/organizations - Create organization
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateOrgSchema.parse(body);

    // TODO: Get userId from session
    const userId = "00000000-0000-0000-0000-000000000000";

    const [org] = await db
      .insert(organizations)
      .values({
        name: data.name,
        slug: data.slug,
        ownerId: userId,
      })
      .returning();

    // Add owner as member
    await db.insert(organizationMembers).values({
      orgId: org.id,
      userId,
      role: "owner",
      joinedAt: new Date(),
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.format() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
