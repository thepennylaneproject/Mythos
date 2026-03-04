import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // TODO: Exchange `code` for Meta access token and persist session.
  return NextResponse.json({
    provider: "meta",
    received: { code, state },
    message: "Callback stub ok",
  });
}
