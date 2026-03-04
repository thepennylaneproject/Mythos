import { dequeue } from "../../../apps/web/app/lib/queue";

export async function startWorker(topic: string, handler: (payload: any) => Promise<void>) {
  for (;;) {
    const job = await dequeue(topic);
    if (!job) {
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }
    try {
      await handler(job.payload);
    } catch (err) {
      console.error(`[${topic}] worker failed`, err);
    }
  }
}
