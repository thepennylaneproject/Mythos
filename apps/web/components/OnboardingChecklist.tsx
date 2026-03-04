"use client";

const CHECKLIST_ITEMS = [
  { id: "profile", label: "Complete your profile", href: "/settings" },
  { id: "connect", label: "Connect a social account", href: "/settings/connections" },
  { id: "post", label: "Create your first post", href: "/composer" },
  { id: "schedule", label: "Schedule a post", href: "/calendar" },
  { id: "ai", label: "Explore AI features", href: "/composer" },
];

interface OnboardingChecklistProps {
  completedSteps: string[];
}

export function OnboardingChecklist({ completedSteps = [] }: OnboardingChecklistProps) {
  const completed = completedSteps.length;
  const total = CHECKLIST_ITEMS.length;
  const progress = (completed / total) * 100;

  if (completed === total) {
    return null; // Hide when complete
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-neutral-900">Getting Started</h3>
        <span className="text-sm text-neutral-500">{completed}/{total}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-neutral-100 rounded-full mb-4">
        <div
          className="h-2 bg-blue-600 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => {
          const isComplete = completedSteps.includes(item.id);
          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 p-2 rounded-lg transition ${
                isComplete ? "text-neutral-400" : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isComplete ? "bg-green-500 border-green-500" : "border-neutral-300"
              }`}>
                {isComplete && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={isComplete ? "line-through" : ""}>{item.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
