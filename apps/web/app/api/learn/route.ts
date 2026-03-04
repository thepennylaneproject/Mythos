import { NextRequest, NextResponse } from "next/server";
// stub: wire in your bandit update here
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  // body: { postId, variant, reward }
  return NextResponse.json({ ok: true });
});
