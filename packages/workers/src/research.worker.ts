import { startWorker } from "./jobs";
import { BraveSearch } from "@mythos/ai-engine";

const brave = new BraveSearch(process.env.BRAVE_SEARCH_API_KEY || "");

startWorker("research", async (payload: any) => {
  console.log("[research-worker] starting research for:", payload.topic || payload.campaignName);
  
  if (!process.env.BRAVE_SEARCH_API_KEY) {
    console.warn("[research-worker] BRAVE_SEARCH_API_KEY not set, using stub data.");
    return;
  }

  try {
    const query = payload.topic || `latest trends for ${payload.campaignName}`;
    const results = await brave.search(query);
    
    console.log("[research-worker] research complete with", results.length, "results:", JSON.stringify(results, null, 2));
    // In production, results would be saved to the DB or pushed to a results queue
  } catch (error) {
    console.error("[research-worker] search failed:", error);
    throw error;
  }
});
