/**
 * Meta (Facebook/Instagram) analytics fetcher.
 */
import { BaseFetcher, StandardMetrics } from "./types";

export class MetaFetcher extends BaseFetcher {
  constructor(accessToken: string) {
    super(accessToken, "meta");
  }

  async fetchMetrics(platformPostId: string): Promise<StandardMetrics> {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${platformPostId}/insights?metric=impressions,reach,engagement,saved,shares&access_token=${this.accessToken}`
      );

      if (!res.ok) {
        console.error("[meta-fetcher] Failed to fetch metrics:", await res.text());
        return this.emptyMetrics();
      }

      const data = await res.json();
      const metrics: Record<string, number> = {};

      data.data?.forEach((metric: any) => {
        metrics[metric.name] = metric.values?.[0]?.value || 0;
      });

      return {
        impressions: metrics.impressions || 0,
        reach: metrics.reach || 0,
        engagements: metrics.engagement || 0,
        likes: 0, // Need separate call for reactions
        comments: 0,
        shares: metrics.shares || 0,
        saves: metrics.saved || 0,
        clicks: 0,
      };
    } catch (error) {
      console.error("[meta-fetcher] Error:", error);
      return this.emptyMetrics();
    }
  }

  private emptyMetrics(): StandardMetrics {
    return {
      impressions: 0,
      reach: 0,
      engagements: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
    };
  }
}
