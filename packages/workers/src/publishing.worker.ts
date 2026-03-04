/**
 * Publishing Worker: Self-healing post publication.
 */
import { db } from "../../../apps/web/lib/db";
import { posts } from "../../../apps/web/lib/schema";
import { eq } from "drizzle-orm";
import { PublishingAgent } from "@mythos/ai-engine";
import { enqueue, JobType } from "../../../apps/web/lib/queue";

const agent = new PublishingAgent();

export async function processPublishPost(jobId: string, payload: { postId: string; channel: string }) {
  const { postId, channel } = payload;

  // 1. Fetch post
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) {
    console.log(`[publish-worker] Post ${postId} not found.`);
    return;
  }

  try {
    // 2. Update status to uploading
    await db.update(posts).set({ publishStatus: "uploading" }).where(eq(posts.id, postId));

    // 3. Simulate publishing (replace with actual platform SDK calls)
    await simulatePublish(channel, post.caption || "");

    // 4. Success!
    await db.update(posts).set({
      publishStatus: "posted",
      publishedAt: new Date(),
      healingStrategy: post.healingStrategy 
        ? { ...post.healingStrategy, resolved: true }
        : undefined,
    }).where(eq(posts.id, postId));

    console.log(`[publish-worker] Post ${postId} published successfully to ${channel}.`);

  } catch (error: any) {
    // 5. Failure - invoke self-healing
    const errorCode = error.code || error.status?.toString() || "UNKNOWN";
    const errorMessage = error.message || "Unknown error";

    const diagnosis = agent.diagnose(errorCode, errorMessage);
    const currentRetryCount = post.retryCount || 0;
    const shouldRetry = agent.shouldRetry(currentRetryCount, diagnosis);
    const healingAction = agent.prescribeFix(diagnosis);

    // Update post with failure info
    await db.update(posts).set({
      publishStatus: "failed",
      errorCode,
      errorMessage,
      retryCount: currentRetryCount + 1,
      lastRetryAt: new Date(),
      healingStrategy: {
        diagnosis: diagnosis.recommendation,
        actionsTaken: [...(post.healingStrategy?.actionsTaken || []), healingAction.description],
        resolved: false,
      },
    }).where(eq(posts.id, postId));

    console.log(`[publish-worker] Post ${postId} failed: ${diagnosis.failureType}. Retry: ${shouldRetry}`);

    // 6. Schedule retry if appropriate
    if (shouldRetry) {
      const delayMs = agent.getBackoffDelay(currentRetryCount, diagnosis.suggestedWaitMs);
      console.log(`[publish-worker] Scheduling retry for post ${postId} in ${delayMs}ms`);
      
      // In a real implementation, use a delayed queue or scheduler
      setTimeout(async () => {
        await enqueue("publishing", JobType.PUBLISH_POST, { postId, channel });
      }, delayMs);
    }
  }
}

async function simulatePublish(channel: string, caption: string): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Simulate random failures for testing (remove in production)
  if (Math.random() < 0.1) {
    throw { code: "429", message: "Rate limit exceeded" };
  }
  if (Math.random() < 0.05) {
    throw { code: "NETWORK", message: "Connection timeout" };
  }
  
  // Success
  console.log(`[simulate] Published to ${channel}: "${caption.substring(0, 50)}..."`);
}
