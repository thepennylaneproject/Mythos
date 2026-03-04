import { NextRequest, NextResponse } from "next/server";
import { CampaignAgent, CampaignGoal, AIEngine } from "@mythos/ai-engine";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { objective, constraints, orgId } = body;

    if (!objective) {
      return NextResponse.json({ error: "Objective is required" }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Optionally retrieve brand context
    let brandContext: string | undefined;
    if (orgId && process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
      const aiEngine = new AIEngine({
        openaiApiKey,
        vectorUrl: process.env.UPSTASH_VECTOR_REST_URL,
        vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN,
      });
      const context = await aiEngine.retrieveContext(objective, orgId);
      if (context.length > 0) {
        brandContext = context.join("\n");
      }
    }

    const agent = new CampaignAgent(openaiApiKey);
    const goal: CampaignGoal = {
      objective,
      constraints,
      brandContext,
    };

    const plan = await agent.architectCampaign(goal);

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("[api/ai/architect] error:", error);
    return NextResponse.json({ error: error.message || "Failed to architect campaign" }, { status: 500 });
  }
}
