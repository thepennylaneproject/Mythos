export function bestHours(history: Array<{ ts: string; score: number }>) {
  const buckets = new Array(24).fill(0);
  history.forEach(h => { const d = new Date(h.ts); buckets[d.getHours()] += h.score; });
  return buckets.map((sum, hour) => ({ hour, sum })).sort((a,b)=>b.sum-a.sum).slice(0,3).map(b=>b.hour);
}
