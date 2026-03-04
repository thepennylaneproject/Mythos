/**
 * Production-ready Redis queue using Upstash.
 * Implements enqueue, dequeue, acknowledge, and retry with dead-letter queue.
 */
import { Redis } from "@upstash/redis";

// Initialize Redis from environment
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Job Types
export enum JobType {
  PUBLISH_POST = "PUBLISH_POST",
  SCHEDULE_POST = "SCHEDULE_POST",
  FETCH_ANALYTICS = "FETCH_ANALYTICS",
  GENERATE_CONTENT = "GENERATE_CONTENT",
  RESEARCH = "RESEARCH",
  GENERATE_IMAGE = "GENERATE_IMAGE",
  INDEX_KNOWLEDGE = "INDEX_KNOWLEDGE",
  CAMPAIGN_REVIEW = "CAMPAIGN_REVIEW",
}

// Job Payloads
export interface PublishPostPayload {
  postId: string;
  channel: string;
}

export interface SchedulePostPayload {
  postId: string;
  scheduledAt: string;
}

export interface FetchAnalyticsPayload {
  postId: string;
  platform: string;
}

export interface GenerateContentPayload {
  campaignName: string;
  goal?: string;
  brief?: string;
  audience?: string[];
  channels: string[];
  brandVoice?: string;
}

export interface ResearchPayload {
  topic: string;
  campaignName?: string;
}

export interface GenerateImagePayload {
  prompt: string;
  style?: string;
  aspectRatio?: string;
}

export interface IndexKnowledgePayload {
  knowledgeId: string;
}

export interface CampaignReviewPayload {
  campaignId: string;
}

export type JobPayload =
  | PublishPostPayload
  | SchedulePostPayload
  | FetchAnalyticsPayload
  | GenerateContentPayload
  | ResearchPayload
  | GenerateImagePayload
  | IndexKnowledgePayload
  | CampaignReviewPayload;

export interface Job<T = JobPayload> {
  id: string;
  type: JobType;
  payload: T;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  lastAttemptAt?: string;
}

const QUEUE_PREFIX = "mythos:queue:";
const DLQ_PREFIX = "mythos:dlq:";
const MAX_ATTEMPTS = 3;

/**
 * Enqueue a job to the specified topic.
 */
export async function enqueue<T extends JobPayload>(
  topic: string,
  type: JobType,
  payload: T
): Promise<string> {
  const job: Job<T> = {
    id: crypto.randomUUID(),
    type,
    payload,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(`${QUEUE_PREFIX}${topic}`, JSON.stringify(job));
  console.log(`[queue] enqueued job ${job.id} to ${topic}`);
  return job.id;
}

/**
 * Dequeue a job from the specified topic.
 * Returns null if no jobs are available.
 */
export async function dequeue(topic: string): Promise<Job | null> {
  const raw = await redis.rpop(`${QUEUE_PREFIX}${topic}`);
  if (!raw) return null;

  const job = JSON.parse(raw as string) as Job;
  job.attempts += 1;
  job.lastAttemptAt = new Date().toISOString();

  console.log(`[queue] dequeued job ${job.id} from ${topic} (attempt ${job.attempts})`);
  return job;
}

/**
 * Acknowledge successful job completion.
 * Simply logs for now; can be extended to track completed jobs.
 */
export async function acknowledge(jobId: string): Promise<void> {
  console.log(`[queue] acknowledged job ${jobId}`);
}

/**
 * Retry a failed job with exponential backoff, or move to DLQ if max attempts reached.
 */
export async function retry(topic: string, job: Job): Promise<void> {
  if (job.attempts >= job.maxAttempts) {
    // Move to dead-letter queue
    await redis.lpush(`${DLQ_PREFIX}${topic}`, JSON.stringify(job));
    console.log(`[queue] job ${job.id} moved to DLQ after ${job.attempts} attempts`);
    return;
  }

  // Re-enqueue with exponential backoff delay (simulated by pushing back to queue)
  const delay = Math.pow(2, job.attempts) * 1000; // 2s, 4s, 8s...
  console.log(`[queue] retrying job ${job.id} in ${delay}ms`);

  setTimeout(async () => {
    await redis.lpush(`${QUEUE_PREFIX}${topic}`, JSON.stringify(job));
  }, delay);
}

/**
 * Get jobs in the dead-letter queue for a topic.
 */
export async function getDLQJobs(topic: string): Promise<Job[]> {
  const raw = await redis.lrange(`${DLQ_PREFIX}${topic}`, 0, -1);
  return raw.map((r) => JSON.parse(r as string) as Job);
}

/**
 * Get queue length for a topic.
 */
export async function getQueueLength(topic: string): Promise<number> {
  return redis.llen(`${QUEUE_PREFIX}${topic}`);
}
