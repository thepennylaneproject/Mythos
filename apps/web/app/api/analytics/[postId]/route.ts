import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (_: NextRequest, { params }: { params: { postId: string } }) => {
  return NextResponse.json({ postId: params.postId, impressions: 0, reach: 0 });
});
