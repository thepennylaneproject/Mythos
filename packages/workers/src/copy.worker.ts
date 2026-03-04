import { startWorker } from "./jobs";
import { AIEngine } from "@mythos/ai-engine";

const ai = new AIEngine({ openaiApiKey: process.env.OPENAI_API_KEY });

startWorker("copy", async (payload: any) => {
  console.log("[copy-worker] generating copy for campaign:", payload.campaignName);
  
  if (!payload.campaignName) {
    throw new Error("campaignName is required");
  }

  try {
    const posts = await ai.generatePosts({
      campaignName: payload.campaignName,
      goal: payload.goal,
      brief: payload.brief,
      audience: payload.audience,
      channels: payload.channels || ["meta", "linkedin", "x", "tiktok"],
      brandVoice: payload.brandVoice
    });

    console.log("[copy-worker] successfully generated posts:", posts.length, JSON.stringify(posts, null, 2));
    // In a real system, we'd save these to the DB or return them to the queue
  } catch (error) {
    console.error("[copy-worker] error:", error);
    throw error;
  }
});
