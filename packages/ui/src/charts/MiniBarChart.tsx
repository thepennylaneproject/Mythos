export interface MiniBarChartProps {
  values: number[];
  label?: string;
}

export function MiniBarChart({ values, label }: MiniBarChartProps) {
  if (!values.length) {
    return (
      <div className="rounded-md border p-4 text-sm text-neutral-600 bg-white">
        {label ?? "Mini chart"} — TODO: feed data
      </div>
    );
  }

  const max = Math.max(...values);

  return (
    <div className="rounded-md border p-4 bg-white">
      {label ? <div className="text-xs text-neutral-600 mb-2">{label}</div> : null}
      <div className="flex items-end gap-1 h-20">
        {values.map((val, idx) => (
          <div
            key={`${val}-${idx}`}
            className="flex-1 rounded-sm bg-gradient-to-t from-indigo-200 to-indigo-500"
            style={{ height: `${max ? (val / max) * 100 : 0}%`, minHeight: "6px" }}
          />
        ))}
      </div>
      <div className="text-[10px] text-neutral-500 mt-2">TODO: wire real charting</div>
    </div>
  );
}
