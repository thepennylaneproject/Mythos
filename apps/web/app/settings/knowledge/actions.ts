"use server";

import { db } from "@/lib/db";
import { brandKnowledge } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { enqueue, JobType } from "@/lib/queue";

export async function addKnowledgeAction(formData: FormData) {
  const orgId = formData.get("orgId") as string;
  const content = formData.get("content") as string;
  const type = formData.get("type") as any;

  if (!orgId || !content) {
    throw new Error("Missing required fields");
  }

  // 1. Insert into database
  const [newEntry] = await db
    .insert(brandKnowledge)
    .values({
      orgId,
      content,
      metadata: {
        source: "Manual Entry",
        type,
      },
    })
    .returning();

  // 2. Enqueue indexing job
  await enqueue("intelligence", JobType.INDEX_KNOWLEDGE, { knowledgeId: newEntry.id });

  revalidatePath("/settings/knowledge");
}
