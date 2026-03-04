export const POST_STATUSES = [
  "draft",
  "scheduled",
  "ready_to_publish",
  "publishing",
  "published",
  "failed"
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export function isPostStatus(value: unknown): value is PostStatus {
  return typeof value === "string" && POST_STATUSES.includes(value as PostStatus);
}

export const POST_STATUS_META: Record<PostStatus, { label: string; tone: "neutral" | "warning" | "info" | "success" | "error" }> = {
  draft: { label: "Draft", tone: "neutral" },
  scheduled: { label: "Scheduled", tone: "warning" },
  ready_to_publish: { label: "Ready to publish", tone: "info" },
  publishing: { label: "Publishing", tone: "info" },
  published: { label: "Published", tone: "success" },
  failed: { label: "Failed", tone: "error" }
};
