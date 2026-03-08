import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

// TODO: Wire to the publishing worker queue. This endpoint should enqueue
// a PUBLISH_POST job and return the real job ID from the queue. The worker
// in packages/workers/src/queue-consumer.ts handles the actual platform dispatch.
export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  return NextResponse.json({ jobId: "pub-123", body });
});
