import { POST_STATUS_META, PostStatus } from "@/lib/postStatus";

type StatusTone = "neutral" | "warning" | "info" | "success" | "error";

const toneStyles: Record<StatusTone, { bg: string; border: string; text: string }> = {
  neutral: { bg: "bg-neutral-100", border: "border-neutral-200", text: "text-neutral-800" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" },
  info: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800" },
  success: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800" },
  error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" }
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const meta = POST_STATUS_META[status];
  const tone = toneStyles[meta.tone];

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${tone.bg} ${tone.border} ${tone.text}`}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      {meta.label}
    </span>
  );
}
