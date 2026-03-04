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

    const ai = new AIEngine({ openaiApiKey });
    const plan = await ai.planCampaign(result.data);

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("[api/campaigns/plan] error:", error);
    return NextResponse.json({ error: error.message || "Campaign planning failed" }, { status: 500 });
  }
}
