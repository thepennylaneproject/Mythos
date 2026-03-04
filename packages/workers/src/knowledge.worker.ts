import { db } from "../../../apps/web/lib/db";
import { brandKnowledge } from "../../../apps/web/lib/schema";
import { AIEngine } from "@mythos/ai-engine";
import { eq } from "drizzle-orm";

export async function processKnowledgeIndexing(jobId: string, payload: { knowledgeId: string }) {
  const { knowledgeId } = payload;

  // 1. Fetch the raw knowledge entry
  const [entry] = await db
    .select()
    .from(brandKnowledge)
    .where(eq(brandKnowledge.id, knowledgeId));

  if (!entry) {
    throw new Error(`Knowledge entry not found: ${knowledgeId}`);
  }

  // 2. Initialize AI Engine (needs credentials)
  const ai = new AIEngine({
    openaiApiKey: process.env.OPENAI_API_KEY,
    vectorUrl: process.env.UPSTASH_VECTOR_REST_URL,
    vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN,
  });

  // 3. Index the document
  const vectorId = `${entry.orgId}:${entry.id}`;
  await ai.indexDocument(
    vectorId,
    entry.content,
    entry.orgId!,
    {
      source: entry.metadata?.source || "unknown",
      type: entry.metadata?.type || "asset_context",
    }
  );

  // 4. Update the database record
  await db
    .update(brandKnowledge)
    .set({ vectorId })
    .where(eq(brandKnowledge.id, knowledgeId));

  console.log(`[knowledge-worker] Indexed knowledge ${knowledgeId} for org ${entry.orgId}`);
}
