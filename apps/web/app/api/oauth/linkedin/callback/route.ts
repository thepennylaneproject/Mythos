import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // TODO: Exchange `code` for LinkedIn access token and attach to user session.
  return NextResponse.json({
    provider: "linkedin",
    received: { code, state },
    message: "Callback stub ok",
  });
}
