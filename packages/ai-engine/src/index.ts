import OpenAI from "openai";
import { z } from "zod";
export * from "./brave";
export * from "./utm";
export * from "./vector";
export * from "./campaign-agent";
export * from "./publishing-agent";
export * from "./deeplink";
export * from "./community-crm";
export * from "./grain-grit";
export * from "./plugin-registry";
export * from "./usage-metering";
export * from "./content-safety";

export const GeneratorInputSchema = z.object({
  campaignName: z.string(),
  goal: z.string().optional(),
  brief: z.string().optional(),
  audience: z.array(z.string()).optional(),
  channels: z.array(z.string()),
  brandVoice: z.string().optional(),
  orgId: z.string().optional(),
});

export type GeneratorInput = z.infer<typeof GeneratorInputSchema>;

export interface PostDraft {
  channel: string;
  caption: string;
  altText?: string;
  tags?: string[];
}

export interface VoiceVerificationResult {
  score: number;
  resonance: number;
  roboticPhrases: Array<{ phrase: string; reason: string }>;
  suggestions: Array<{ original: string; suggested: string; reason: string }>;
  gritAdvice: string;
}

import { VectorService } from "./vector";

export class AIEngine {
  private openai?: OpenAI;
  private vector?: VectorService;

  constructor(config: { 
    openaiApiKey?: string;
    vectorUrl?: string;
    vectorToken?: string;
  }) {
    if (config.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    }
    if (config.vectorUrl && config.vectorToken) {
      this.vector = new VectorService({
        url: config.vectorUrl,
        token: config.vectorToken,
      });
    }
  }

  async retrieveContext(query: string, orgId: string): Promise<string[]> {
    if (!this.openai || !this.vector) return [];

    // Generate embedding for the query
    const embeddingResponse = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const vector = embeddingResponse.data[0].embedding;

    // Search vector store
    const matches = await this.vector.query(vector, {
      topK: 5,
      filter: `orgId = "${orgId}"`,
    });

    return matches.map((m) => m.data).filter(Boolean) as string[];
  }

  async indexDocument(id: string, content: string, orgId: string, metadata: Record<string, any>): Promise<void> {
    if (!this.openai || !this.vector) {
      throw new Error("AI Engine not fully configured for indexing");
    }

    const embeddingResponse = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });

    const vector = embeddingResponse.data[0].embedding;

    await this.vector.upsert(id, vector, { ...metadata, orgId }, content);
  }

  async verifyVoice(content: string, orgId: string): Promise<VoiceVerificationResult> {
    if (!this.openai) {
      throw new Error("OpenAI API key is missing");
    }

    // 1. Retrieve Brand Context
    const context = await this.retrieveContext(content, orgId);
    const contextualKnowledge = context.length > 0 
      ? `RELEVANT BRAND KNOWLEDGE:\n${context.map((c, i) => `[${i + 1}] ${c}`).join("\n")}`
      : "No specific brand knowledge found. Use general high-quality, human-centric writing principles.";

    // 2. Prompt for Analysis
    const prompt = `
      You are an expert editor specializing in brand authenticity and human resonance.
      Analyze the following content against the provided brand knowledge.
      
      CONTENT TO ANALYZE:
      "${content}"

      ${contextualKnowledge}

      Evaluate the content for:
      1. Brand Alignment: How well does it match the tone and style guide?
      2. Human Resonance (Anti-Slop): Does it avoid generic AI-sounding phrases (e.g., "digital tapestry," "delve," "ever-evolving")? 
      3. Grit & Imperfection: Does it feel organic/human?

      Return a JSON object with:
      - score: integer (1-100, overall authenticity)
      - resonance: integer (1-100, how well it connects emotionally)
      - roboticPhrases: array of { phrase: string, reason: string } identifying generic AI markers
      - suggestions: array of { original: string, suggested: string, reason: string } for specific edits
      - gritAdvice: string (advice on how to add "grit" or strategic human imperfections to the content)
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const resultString = response.choices[0].message.content;
    if (!resultString) throw new Error("Failed to verify voice");

    return JSON.parse(resultString) as VoiceVerificationResult;
  }

  async researchAndDraft(
    topic: string,
    channels: string[],
    options?: { brandVoice?: string; braveApiKey?: string }
  ): Promise<{ insights: string[]; posts: PostDraft[] }> {
    if (!this.openai) {
      throw new Error("OpenAI API key is missing");
    }

    let searchResults: Array<{ title: string; description: string }> = [];

    // 1. Research phase (using Brave Search if API key is provided)
    if (options?.braveApiKey) {
      const { BraveSearch } = await import("./brave");
      const brave = new BraveSearch(options.braveApiKey);
      const results = await brave.search(topic, 5);
      searchResults = results.map((r) => ({
        title: r.title,
        description: r.description,
      }));
    }

    // 2. Synthesize insights
    const synthesisPrompt = `
      You are a research analyst. Synthesize the following search results into key insights.
      
      TOPIC: "${topic}"
      
      SEARCH RESULTS:
      ${searchResults.length > 0 
        ? searchResults.map((r, i) => `[${i + 1}] ${r.title}: ${r.description}`).join("\n")
        : "No search results available. Generate insights based on your knowledge of the topic."}
      
      Extract 3-5 key insights that would be valuable for creating social media content.
      Return a JSON object with: { insights: string[] }
    `;

    const synthesisResponse = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: synthesisPrompt }],
      response_format: { type: "json_object" },
    });

    const synthesisContent = synthesisResponse.choices[0].message.content;
    if (!synthesisContent) throw new Error("Failed to synthesize research");
    const { insights } = JSON.parse(synthesisContent) as { insights: string[] };

    // 3. Draft posts based on insights
    const draftPrompt = `
      You are a social media strategist. Create posts for the following channels based on research insights.
      
      TOPIC: "${topic}"
      INSIGHTS:
      ${insights.map((ins, i) => `${i + 1}. ${ins}`).join("\n")}
      
      CHANNELS: ${channels.join(", ")}
      BRAND VOICE: ${options?.brandVoice || "Professional yet engaging"}
      
      For each channel, create a post that leverages these insights.
      Return a JSON object with: { posts: [{ channel: string, caption: string, tags?: string[] }] }
    `;

    const draftResponse = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: draftPrompt }],
      response_format: { type: "json_object" },
    });

    const draftContent = draftResponse.choices[0].message.content;
    if (!draftContent) throw new Error("Failed to draft posts");
    const { posts } = JSON.parse(draftContent) as { posts: PostDraft[] };

    return { insights, posts };
  }

  async generatePosts(input: GeneratorInput): Promise<PostDraft[]> {
    if (!this.openai) {
      throw new Error("OpenAI API key is missing");
    }

    let contextualKnowledge = "";
    if (input.campaignName && input.brandVoice) {
      // Simple heuristic for context retrieval
      const context = await this.retrieveContext(
        `${input.campaignName} ${input.goal || ""} ${input.brief || ""}`, 
        (input as any).orgId || "default"
      );
      if (context.length > 0) {
        contextualKnowledge = `
          RELEVANT BRAND KNOWLEDGE:
          ${context.map((c, i) => `[${i + 1}] ${c}`).join("\n")}
        `;
      }
    }

    const prompt = `
      You are an expert marketing strategist. 
      Generate a set of social media posts for the following campaign:
      Campaign: ${input.campaignName}
      Goal: ${input.goal || "Not specified"}
      Brief: ${input.brief || "Not specified"}
      Audience: ${input.audience?.join(", ") || "Not specified"}
      Channels: ${input.channels.join(", ")}
      Brand Voice: ${input.brandVoice || "Professional yet engaging"}

      ${contextualKnowledge}

      For each channel, provide a caption, optional alt text, and relevant tags.
      Return the result as a JSON array of objects with the following keys: channel, caption, altText, tags.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Failed to generate content");

    const parsed = JSON.parse(content);
    return parsed.posts || parsed;
  }

  async planCampaign(input: GeneratorInput): Promise<{ slots: any[] }> {
    if (!this.openai) {
      throw new Error("OpenAI API key is missing");
    }

    const prompt = `
      You are a strategic marketing planner. 
      Create a 2-week campaign plan based on the following:
      Campaign: ${input.campaignName}
      Goal: ${input.goal || "Not specified"}
      Brief: ${input.brief || "Not specified"}
      Audience: ${input.audience?.join(", ") || "Not specified"}
      Channels: ${input.channels.join(", ")}

      Return a JSON object with a "slots" key containing an array of post slots.
      Each slot should have:
      - channel: one of [${input.channels.join(", ")}]
      - day: integer (1 to 14)
      - theme: brief description of the post theme
      - hypothesis: what you expect this post to achieve
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Failed to plan campaign");

    return JSON.parse(content);
  }
}
