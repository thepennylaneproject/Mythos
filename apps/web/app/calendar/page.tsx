"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";

interface Post {
  id: string;
  channel: string;
  caption: string;
  status: string;
  scheduledAt: string | null;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [currentDate]);

  async function fetchPosts() {
    setLoading(true);
    const from = startOfMonth(currentDate).toISOString();
    const to = endOfMonth(currentDate).toISOString();

    try {
      const res = await fetch(`/api/posts?from=${from}&to=${to}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Group posts by date
  const postsByDate: Record<string, Post[]> = {};
  posts.forEach((post) => {
    if (post.scheduledAt) {
      const dateKey = format(parseISO(post.scheduledAt), "yyyy-MM-dd");
      if (!postsByDate[dateKey]) postsByDate[dateKey] = [];
      postsByDate[dateKey].push(post);
    }
  });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const channelColors: Record<string, string> = {
    meta: "bg-blue-500",
    linkedin: "bg-sky-600",
    x: "bg-neutral-800",
    tiktok: "bg-pink-500",
    default: "bg-gray-400",
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Content Calendar</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-neutral-200 transition"
            >
              ← Prev
            </button>
            <span className="text-lg font-medium">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-neutral-200 transition"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          {Object.entries(channelColors).filter(([k]) => k !== "default").map(([channel, color]) => (
            <div key={channel} className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="capitalize">{channel}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-neutral-100 border-b border-neutral-200">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-neutral-600">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayPosts = postsByDate[dateKey] || [];

              return (
                <div
                  key={dateKey}
                  className={`min-h-[120px] p-2 border-b border-r border-neutral-100 ${
                    isToday(day) ? "bg-blue-50" : ""
                  } ${!isSameMonth(day, currentDate) ? "bg-neutral-50" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(day) ? "text-blue-600" : "text-neutral-700"
                  }`}>
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className={`text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${
                          channelColors[post.channel] || channelColors.default
                        }`}
                        title={post.caption}
                      >
                        {post.caption.slice(0, 30)}...
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-xs text-neutral-500 px-2">
                        +{dayPosts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="mt-4 text-center text-neutral-500">Loading posts...</div>
        )}
      </div>
    </div>
  );
}
