type Trend = "up" | "down" | "flat";

export interface InsightsMiniProps {
  label: string;
  value: string | number;
  trend?: Trend;
}

function trendLabel(trend?: Trend) {
  if (trend === "up") return "▲";
  if (trend === "down") return "▼";
  return "•";
}

export default function InsightsMini({ label, value, trend = "flat" }: InsightsMiniProps) {
  return (
    <div className="rounded-lg border p-4 bg-white shadow-sm">
      <div className="text-sm text-neutral-600">{label}</div>
      <div className="flex items-baseline justify-between mt-2">
        <div className="text-2xl font-semibold">{value}</div>
        <span className="text-xs text-neutral-500">{trendLabel(trend)}</span>
      </div>
    </div>
  );
}
