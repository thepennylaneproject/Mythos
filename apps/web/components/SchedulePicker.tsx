import { useMemo } from "react";
import { eachHourOfInterval, subDays } from "date-fns";

export function useBestHours(history: Array<{ ts: string; score: number }>) {
  // naive: bucket by hour-of-day across last 28 days
  const buckets = new Array(24).fill(0);
  history.forEach(h => {
    const d = new Date(h.ts);
    buckets[d.getHours()] += h.score;
  });
  const ranked = buckets
    .map((sum, hour) => ({ hour, sum }))
    .sort((a,b) => b.sum - a.sum)
    .slice(0, 3)
    .map(b => b.hour);
  return ranked;
}

export default function SchedulePicker() {
  const history = []; // fetch from API later
  const hours = useBestHours(history);
  const nextDays = useMemo(() => eachHourOfInterval({ start: new Date(), end: subDays(new Date(), -7) }), []);
  return (
    <div className="mt-4">
      <p className="text-sm">Suggested hours: {hours.join(", ")} (local)</p>
      {/* add UI to select an exact time */}
    </div>
  );
}