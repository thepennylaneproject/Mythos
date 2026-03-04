import { NextRequest, NextResponse } from "next/server";
import { AIEngine, GeneratorInputSchema } from "@mythos/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = GeneratorInputSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
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
    const posts = await ai.generatePosts({
      ...result.data,
      orgId: (body as any).orgId, // We'll need to formalize this in the schema later or get it from session
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("[api/generate] error:", error);
    return NextResponse.json({ error: error.message || "Content generation failed" }, { status: 500 });
  }
}
