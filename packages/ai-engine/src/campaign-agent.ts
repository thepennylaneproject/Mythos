import OpenAI from "openai";

export interface CampaignGoal {
  objective: string; // e.g., "Generate 50 waitlist signups"
  constraints?: {
    budget?: string;
    platforms?: string[];
    frequency?: string; // e.g., "3 posts per week"
    duration?: string; // e.g., "2 weeks"
  };
  brandContext?: string; // Injected from Brand Knowledge Base
}

export interface StrategicPlan {
  phases: Array<{
    name: string;
    description: string;
    duration: string;
    posts: Array<{
      channel: string;
      angle: string;
      scheduledFor?: string;
    }>;
  }>;
  reasoning: string;
  successMetrics: {
    targetCTR?: number;
    targetEngagement?: number;
    targetConversions?: number;
  };
}

export class CampaignAgent {
  private openai: OpenAI;

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
  }

  async architectCampaign(goal: CampaignGoal): Promise<StrategicPlan> {
    const prompt = `
      You are a world-class marketing strategist. A brand has given you a goal.
      Your job is to architect a full campaign strategy to achieve this goal.

      GOAL:
      "${goal.objective}"

      CONSTRAINTS:
      - Budget: ${goal.constraints?.budget || "Not specified"}
      - Platforms: ${goal.constraints?.platforms?.join(", ") || "Any"}
      - Frequency: ${goal.constraints?.frequency || "Flexible"}
      - Duration: ${goal.constraints?.duration || "Flexible"}

      BRAND CONTEXT (if available):
      ${goal.brandContext || "No specific brand context provided. Use general best practices."}

      Think step-by-step:
      1. What phases should this campaign have? (e.g., Tease, Launch, Sustain, Recap)
      2. For each phase, what posts should be created and on which channels?
      3. What is the strategic reasoning behind this structure?
      4. What metrics should we track to measure success?

      Return a JSON object with:
      - phases: array of { name: string, description: string, duration: string, posts: [{ channel: string, angle: string, scheduledFor?: string }] }
      - reasoning: string (your strategic thinking)
      - successMetrics: { targetCTR?: number, targetEngagement?: number, targetConversions?: number }
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Failed to architect campaign");

    return JSON.parse(content) as StrategicPlan;
  }

  async generatePhaseContent(
    plan: StrategicPlan,
    phaseName: string,
    brandVoice?: string
  ): Promise<Array<{ channel: string; caption: string; angle: string }>> {
    const phase = plan.phases.find((p) => p.name === phaseName);
    if (!phase) throw new Error(`Phase "${phaseName}" not found in plan`);

    const prompt = `
      You are a content strategist. Generate social media posts for the following campaign phase.

      PHASE: ${phase.name}
      DESCRIPTION: ${phase.description}
      STRATEGIC REASONING: ${plan.reasoning}

      POSTS TO GENERATE:
      ${phase.posts.map((p, i) => `${i + 1}. ${p.channel}: ${p.angle}`).join("\n")}

      BRAND VOICE: ${brandVoice || "Professional yet engaging"}

      For each post, provide:
      - channel: string
      - caption: string (the actual post content)
      - angle: string (the strategic angle this post takes)

      Return a JSON array.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Failed to generate phase content");

    const parsed = JSON.parse(content);
    return parsed.posts || parsed;
  }
}
