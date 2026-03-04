import { NextRequest, NextResponse } from "next/server";
import { enqueue, JobType } from "@/lib/queue";
import { z } from "zod";

const EnqueueSchema = z.object({
  topic: z.string().default("default"),
  type: z.nativeEnum(JobType),
  payload: z.record(z.unknown()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = EnqueueSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.format() },
        { status: 400 }
      );
    }

    const { topic, type, payload } = result.data;
    const jobId = await enqueue(topic, type, payload as any);

    return NextResponse.json({ jobId, topic, type });
  } catch (error: any) {
    console.error("[api/queue] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enqueue job" },
      { status: 500 }
    );
  }
}
