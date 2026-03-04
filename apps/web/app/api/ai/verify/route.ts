import { NextRequest, NextResponse } from "next/server";
import { AIEngine } from "@mythos/ai-engine";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, orgId } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const ai = new AIEngine({ 
      openaiApiKey,
      vectorUrl: process.env.UPSTASH_VECTOR_REST_URL,
      vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });

    const analysis = await ai.verifyVoice(content, orgId || "default");

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("[api/ai/verify] error:", error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
