import { headers } from "next/headers";

export function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env;
  const hdrs = headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") || "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}
