/**
 * Queue consumer that routes jobs to appropriate worker handlers.
 * Run this as a long-running process via `tsx src/queue-consumer.ts`.
 */
import { dequeue, acknowledge, retry, Job, JobType } from "../../../apps/web/lib/queue";

// Worker handlers
type WorkerHandler = (payload: any) => Promise<void>;

const handlers: Record<JobType, WorkerHandler> = {
  [JobType.PUBLISH_POST]: async (payload) => {
    console.log("[worker:publish] processing:", payload);
    // Import and call publish logic here
  },
  [JobType.SCHEDULE_POST]: async (payload) => {
    console.log("[worker:schedule] processing:", payload);
    // Import and call scheduling logic here
  },
  [JobType.FETCH_ANALYTICS]: async (payload) => {
    console.log("[worker:analytics] processing:", payload);
    // Import and call analytics logic here
  },
  [JobType.GENERATE_CONTENT]: async (payload) => {
    console.log("[worker:generate] processing:", payload);
    // Import AIEngine and generate content
    const { AIEngine } = await import("@mythos/ai-engine");
    const ai = new AIEngine({ openaiApiKey: process.env.OPENAI_API_KEY });
    const posts = await ai.generatePosts(payload);
    console.log("[worker:generate] generated", posts.length, "posts");
  },
  [JobType.RESEARCH]: async (payload) => {
    console.log("[worker:research] processing:", payload);
    const { BraveSearch } = await import("@mythos/ai-engine");
    if (!process.env.BRAVE_SEARCH_API_KEY) {
      console.warn("[worker:research] BRAVE_SEARCH_API_KEY not set");
      return;
    }
    const brave = new BraveSearch(process.env.BRAVE_SEARCH_API_KEY);
    const results = await brave.search(payload.topic || payload.campaignName);
    console.log("[worker:research] found", results.length, "results");
  },
  [JobType.GENERATE_IMAGE]: async (payload) => {
    console.log("[worker:image] processing:", payload);
    // Fal.ai/Stability stub - simulated
    await new Promise((r) => setTimeout(r, 2000));
    console.log("[worker:image] generated mock image for:", payload.prompt);
  },
};

const POLL_INTERVAL_MS = 1000;
const TOPICS = ["default", "content", "publish", "analytics"];

async function processQueue(topic: string): Promise<void> {
  const job = await dequeue(topic);
  if (!job) return;

  const handler = handlers[job.type];
  if (!handler) {
    console.error(`[consumer] no handler for job type: ${job.type}`);
    await retry(topic, job);
    return;
  }

  try {
    await handler(job.payload);
    await acknowledge(job.id);
  } catch (error) {
    console.error(`[consumer] job ${job.id} failed:`, error);
    await retry(topic, job);
  }
}

async function runConsumer(): Promise<void> {
  console.log("[consumer] starting queue consumer...");
  console.log("[consumer] polling topics:", TOPICS.join(", "));

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("[consumer] shutting down...");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    console.log("[consumer] shutting down...");
    process.exit(0);
  });

  // Poll loop
  while (true) {
    for (const topic of TOPICS) {
      await processQueue(topic);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

runConsumer().catch((err) => {
  console.error("[consumer] fatal error:", err);
  process.exit(1);
});
