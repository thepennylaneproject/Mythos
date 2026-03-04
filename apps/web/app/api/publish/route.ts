import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  return NextResponse.json({ jobId: "pub-123", body });
});
