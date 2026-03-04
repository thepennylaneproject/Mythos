export const CHANNELS = ["meta", "linkedin", "x", "tiktok"] as const;
export type Channel = (typeof CHANNELS)[number];

export function isChannel(value: unknown): value is Channel {
  return typeof value === "string" && CHANNELS.includes(value as Channel);
}
