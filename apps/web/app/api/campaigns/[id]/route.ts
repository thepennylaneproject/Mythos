import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (_: NextRequest, { params }: { params: { id: string } }) => {
  const [row] = await db.select().from(campaigns).where(eq(campaigns.id, params.id));
  if (!row) {
    return NextResponse.json({ error: "campaign not found" }, { status: 404 });
  }
  return NextResponse.json(row);
});
