"use client";

import { useEffect, useState } from "react";

interface PostHealth {
  id: string;
  channel: string;
  publishStatus: string;
  retryCount: number;
  healingStrategy?: {
    diagnosis: string;
    actionsTaken: string[];
    resolved: boolean;
  };
  errorMessage?: string;
}

export function PublishingHealth() {
  const [posts, setPosts] = useState<PostHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch("/api/posts/health");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error("Failed to fetch publishing health:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
  }, []);

  const failedPosts = posts.filter((p) => p.publishStatus === "failed");
  const healingPosts = posts.filter((p) => p.retryCount > 0 && p.publishStatus !== "posted");
  const successRate = posts.length > 0
    ? Math.round((posts.filter((p) => p.publishStatus === "posted").length / posts.length) * 100)
    : 100;

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading publishing health...</div>;
  }

  return (
    <div className="border rounded-xl p-6 bg-card space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span>💊</span> Publishing Health
        </h3>
        <div className={`text-sm font-bold px-3 py-1 rounded-full ${successRate > 90 ? 'bg-green-100 text-green-700' : successRate > 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {successRate}% Success Rate
        </div>
      </div>

      {failedPosts.length === 0 && healingPosts.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">All systems healthy. No failed posts.</p>
      ) : (
        <div className="space-y-4">
          {failedPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 bg-red-50/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase text-red-600">{post.channel}</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  Retry #{post.retryCount}
                </span>
              </div>
              {post.healingStrategy && (
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground"><strong>Diagnosis:</strong> {post.healingStrategy.diagnosis}</p>
                  <p className="text-muted-foreground">
                    <strong>Actions:</strong> {post.healingStrategy.actionsTaken.join(" → ")}
                  </p>
                </div>
              )}
              {post.errorMessage && (
                <p className="text-[10px] text-red-500 mt-2 font-mono truncate">{post.errorMessage}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
