"use client";
import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns";

type Bar = { id: string; label: string; startAt: string; endAt: string; lane?: string; color?: string; };

export default function GanttTimeline({ start, end, bars }: { start: string; end: string; bars: Bar[]; }) {
  const s0 = startOfDay(new Date(start));
  const e0 = startOfDay(new Date(end));
  const totalDays = Math.max(1, differenceInCalendarDays(e0, s0) + 1);
  const gridCols = new Array(totalDays).fill(0);

  function pct(from: Date, to: Date) {
    const clampedStart = new Date(Math.max(+startOfDay(new Date(from)), +s0));
    const clampedEnd = startOfDay(new Date(Math.min(+startOfDay(new Date(to)), +e0)));
    const offset = differenceInCalendarDays(clampedStart, s0);
    const span = Math.max(1, differenceInCalendarDays(clampedEnd, clampedStart) + 1);
    return { left: (offset / totalDays) * 100, width: (span / totalDays) * 100 };
  }

  const lanes = Array.from(new Set(bars.map(b => b.lane || "Default")));

  return (
    <div className="w-full">
      <div className="grid text-xs text-neutral-500" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0,1fr))` }}>
        {gridCols.map((_, i) => {
          const d = addDays(s0, i);
          return <div key={i} className="px-1 py-1 border-b border-neutral-200">{format(d, "MM/dd")}</div>;
        })}
      </div>
      <div className="space-y-4 mt-2">
        {lanes.map(lane => (
          <div key={lane}>
            <div className="text-xs font-medium text-neutral-600 mb-1">{lane}</div>
            <div className="relative h-12 border border-neutral-200 rounded-lg bg-white">
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0,1fr))` }}>
                {gridCols.map((_, i) => (<div key={i} className="border-r border-neutral-100" />))}
              </div>
              {bars.filter(b => (b.lane || "Default") === lane).map(b => {
                const { left, width } = pct(new Date(b.startAt), new Date(b.endAt));
                return (
                  <div key={b.id}
                       className="absolute top-1 h-8 rounded-md text-xs text-white flex items-center px-2 shadow"
                       style={{ left: `${left}%`, width: `${width}%`, background: b.color || "linear-gradient(90deg,#0D0D0D,#595959)" }}
                       title={`${b.label} • ${format(new Date(b.startAt), "MMM d")} – ${format(new Date(b.endAt), "MMM d")}`}
                  >
                    <span className="truncate">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
