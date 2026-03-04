"use client";

import { useState, useEffect } from "react";

interface OverviewMetrics {
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

interface PostCounts {
  total: number;
  published?: number;
  scheduled?: number;
  draft?: number;
  failed?: number;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [posts, setPosts] = useState<PostCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  async function fetchOverview() {
    try {
      const res = await fetch("/api/analytics/overview");
      const data = await res.json();
      setMetrics(data.metrics);
      setPosts(data.posts);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  const metricCards = [
    { label: "Impressions", value: metrics?.totalImpressions || 0, color: "bg-blue-500" },
    { label: "Reach", value: metrics?.totalReach || 0, color: "bg-green-500" },
    { label: "Clicks", value: metrics?.totalClicks || 0, color: "bg-purple-500" },
    { label: "Likes", value: metrics?.totalLikes || 0, color: "bg-pink-500" },
    { label: "Comments", value: metrics?.totalComments || 0, color: "bg-orange-500" },
    { label: "Shares", value: metrics?.totalShares || 0, color: "bg-cyan-500" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Analytics Dashboard</h1>

        {loading ? (
          <div className="text-center text-neutral-500 py-12">Loading analytics...</div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {metricCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4"
                >
                  <div className={`w-10 h-10 ${card.color} rounded-lg mb-3 flex items-center justify-center text-white text-lg`}>
                    {card.value > 1000 ? "📈" : "📊"}
                  </div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {card.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-500">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Post Status Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Post Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neutral-900">{posts?.total || 0}</div>
                  <div className="text-sm text-neutral-500">Total Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{posts?.published || 0}</div>
                  <div className="text-sm text-neutral-500">Published</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{posts?.scheduled || 0}</div>
                  <div className="text-sm text-neutral-500">Scheduled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neutral-600">{posts?.draft || 0}</div>
                  <div className="text-sm text-neutral-500">Drafts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{posts?.failed || 0}</div>
                  <div className="text-sm text-neutral-500">Failed</div>
                </div>
              </div>
            </div>

            {/* Placeholder for Charts */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Performance Over Time</h2>
              <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400">
                📊 Chart visualization coming soon (Recharts/Chart.js integration)
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
