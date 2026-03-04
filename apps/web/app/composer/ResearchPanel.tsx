"use client";

import { useState } from "react";
import { PostDraft } from "@mythos/ai-engine";

interface ResearchPanelProps {
  onPostsGenerated: (posts: PostDraft[]) => void;
  channels?: string[];
  brandVoice?: string;
}

export function ResearchPanel({ onPostsGenerated, channels = ["meta", "linkedin", "x"], brandVoice }: ResearchPanelProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  const handleResearch = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setInsights([]);
    try {
      const res = await fetch("/api/ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, channels, brandVoice }),
      });
      if (!res.ok) throw new Error("Research failed");
      const data = await res.json();
      setInsights(data.insights || []);
      onPostsGenerated(data.posts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50/50 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
          🔍
        </div>
        <div>
          <h3 className="font-bold text-lg">Research Mode</h3>
          <p className="text-xs text-muted-foreground">Enter a topic. AI researches and drafts posts.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-neutral-600 block mb-1">Research Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g., Latest trends in AI-generated content"
          />
        </div>

        <button
          onClick={handleResearch}
          disabled={loading || !topic.trim()}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg disabled:opacity-50 transition-all hover:bg-blue-700"
        >
          {loading ? "Researching..." : "Research & Draft Posts"}
        </button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {insights.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <span>💡</span> Research Insights
          </h4>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="text-xs bg-white border rounded-lg p-3 text-neutral-700">
                {insight}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-muted-foreground italic">
            Posts have been generated based on these insights. Review them below.
          </p>
        </div>
      )}
    </div>
  );
}
