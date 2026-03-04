/**
 * Organization members API - List, invite, update role, remove.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizationMembers, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer"]),
});

const UpdateRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["admin", "editor", "viewer"]),
});

// GET /api/organizations/[id]/members - List members
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params;

    const members = await db
      .select({
        id: organizationMembers.id,
        role: organizationMembers.role,
        joinedAt: organizationMembers.joinedAt,
        invitedAt: organizationMembers.invitedAt,
        userId: organizationMembers.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(organizationMembers)
      .leftJoin(users, eq(users.id, organizationMembers.userId))
      .where(eq(organizationMembers.orgId, orgId));

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/organizations/[id]/members - Invite member
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params;
    const body = await req.json();
    const data = InviteSchema.parse(body);

    // Find or create user by email
    let [user] = await db.select().from(users).where(eq(users.email, data.email));

    if (!user) {
      // Create placeholder user (will be activated on invite acceptance)
      [user] = await db.insert(users).values({ email: data.email }).returning();
    }

    // Add as member
    const [member] = await db
      .insert(organizationMembers)
      .values({
        orgId,
        userId: user.id,
        role: data.role,
        invitedAt: new Date(),
      })
      .returning();

    // TODO: Send invite email

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.format() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/organizations/[id]/members - Update member role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params;
    const body = await req.json();
    const data = UpdateRoleSchema.parse(body);

    const [updated] = await db
      .update(organizationMembers)
      .set({ role: data.role })
      .where(
        and(eq(organizationMembers.id, data.memberId), eq(organizationMembers.orgId, orgId))
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/organizations/[id]/members?memberId=xxx - Remove member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params;
    const url = new URL(req.url);
    const memberId = url.searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "memberId required" }, { status: 400 });
    }

    await db
      .delete(organizationMembers)
      .where(
        and(eq(organizationMembers.id, memberId), eq(organizationMembers.orgId, orgId))
      );

    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
