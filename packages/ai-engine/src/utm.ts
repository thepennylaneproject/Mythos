export function generateUtmUrl(baseUrl: string, meta: { source: string; medium: string; campaign: string; content?: string }): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("utm_source", meta.source);
    url.searchParams.set("utm_medium", meta.medium);
    url.searchParams.set("utm_campaign", meta.campaign);
    if (meta.content) {
      url.searchParams.set("utm_content", meta.content);
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}
