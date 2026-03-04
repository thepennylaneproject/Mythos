"use client";

import { useState } from "react";
import { StrategicPlan } from "@mythos/ai-engine";

interface AgenticPlannerProps {
  onPlanGenerated: (plan: StrategicPlan) => void;
  orgId?: string;
}

export function AgenticPlanner({ onPlanGenerated, orgId }: AgenticPlannerProps) {
  const [objective, setObjective] = useState("");
  const [duration, setDuration] = useState("2 weeks");
  const [frequency, setFrequency] = useState("3 posts per week");
  const [platforms, setPlatforms] = useState<string[]>(["meta", "linkedin", "x"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<StrategicPlan | null>(null);

  const handleArchitect = async () => {
    if (!objective.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          constraints: { duration, frequency, platforms },
          orgId,
        }),
      });
      if (!res.ok) throw new Error("Failed to architect campaign");
      const data = await res.json();
      setPlan(data);
      onPlanGenerated(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 bg-primary/5 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
          🤖
        </div>
        <div>
          <h3 className="font-bold text-lg">Agentic Mode</h3>
          <p className="text-xs text-muted-foreground">Define a goal. Let the AI architect the strategy.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-neutral-600 block mb-1">Campaign Objective</label>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g., Generate 50 waitlist signups for a new AI writing tool"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
            >
              <option value="1 week">1 Week</option>
              <option value="2 weeks">2 Weeks</option>
              <option value="1 month">1 Month</option>
              <option value="Ongoing">Ongoing</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 block mb-1">Posting Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
            >
              <option value="1 post per week">1 post/week</option>
              <option value="3 posts per week">3 posts/week</option>
              <option value="Daily">Daily</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleArchitect}
          disabled={loading || !objective.trim()}
          className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg disabled:opacity-50 transition-all hover:bg-primary/90"
        >
          {loading ? "Architecting Strategy..." : "Generate Strategic Plan"}
        </button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {plan && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <span>📋</span> Agent's Strategic Plan
          </h4>
          <div className="space-y-3">
            {plan.phases.map((phase, i) => (
              <div key={i} className="border rounded-lg p-4 bg-card">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-sm">{phase.name}</h5>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{phase.duration}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{phase.description}</p>
                <div className="flex flex-wrap gap-2">
                  {phase.posts.map((post, j) => (
                    <span key={j} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase font-medium">
                      {post.channel}: {post.angle}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground italic">
            <strong>Agent's Reasoning:</strong> {plan.reasoning}
          </div>
        </div>
      )}
    </div>
  );
}
