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
    const { topic, channels, brandVoice } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const ai = new AIEngine({ openaiApiKey });

    const result = await ai.researchAndDraft(topic, channels || ["meta", "linkedin", "x"], {
      brandVoice,
      braveApiKey: process.env.BRAVE_SEARCH_API_KEY,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[api/ai/research] error:", error);
    return NextResponse.json({ error: error.message || "Research failed" }, { status: 500 });
  }
}
