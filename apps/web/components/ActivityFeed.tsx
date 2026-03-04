"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  async function fetchActivity() {
    try {
      // In production, this would likely hit the notifications table
      // or a dedicated activity log table.
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setActivities(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setLoading(false);
    }
  }

  const icons: Record<string, string> = {
    post_published: "✅",
    post_failed: "❌",
    approval_needed: "⏳",
    approval_granted: "👍",
    team_invite: "✉️",
    automation_failed: "⚠️",
    default: "📝",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b bg-neutral-50 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">Recent Activity</h3>
        <button onClick={fetchActivity} className="text-sm text-blue-600 hover:text-blue-700">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-neutral-500">Loading activity...</div>
      ) : activities.length === 0 ? (
        <div className="p-8 text-center text-neutral-500 italic">No recent activity</div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {activities.slice(0, 10).map((activity) => (
            <div key={activity.id} className="p-4 flex gap-4 hover:bg-neutral-50 transition">
              <div className="text-2xl pt-1">
                {icons[activity.type] || icons.default}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-neutral-900">{activity.title}</span>
                  <span className="text-xs text-neutral-400">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {activity.body && (
                  <p className="text-sm text-neutral-500 leading-relaxed">{activity.body}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
