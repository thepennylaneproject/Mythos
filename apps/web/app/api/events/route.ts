import { NextRequest, NextResponse } from "next/server";
import { runAutomations } from "@/lib/automations";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  await runAutomations({ id: "evt", ...body, ts: new Date().toISOString() });
  return NextResponse.json({ ok: true });
});
