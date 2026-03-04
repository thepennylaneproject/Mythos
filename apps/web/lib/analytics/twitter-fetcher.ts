/**
 * Twitter/X analytics fetcher.
 */
import { BaseFetcher, StandardMetrics } from "./types";

export class TwitterFetcher extends BaseFetcher {
  constructor(accessToken: string) {
    super(accessToken, "twitter");
  }

  async fetchMetrics(platformPostId: string): Promise<StandardMetrics> {
    try {
      const res = await fetch(
        `https://api.twitter.com/2/tweets/${platformPostId}?tweet.fields=public_metrics`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      );

      if (!res.ok) {
        console.error("[twitter-fetcher] Failed to fetch:", await res.text());
        return this.emptyMetrics();
      }

      const data = await res.json();
      const pm = data.data?.public_metrics || {};

      return {
        impressions: pm.impression_count || 0,
        reach: 0, // Twitter doesn't provide reach
        engagements: (pm.like_count || 0) + (pm.retweet_count || 0) + (pm.reply_count || 0),
        likes: pm.like_count || 0,
        comments: pm.reply_count || 0,
        shares: pm.retweet_count || 0,
        saves: pm.bookmark_count || 0,
        clicks: 0,
      };
    } catch (error) {
      console.error("[twitter-fetcher] Error:", error);
      return this.emptyMetrics();
    }
  }

  private emptyMetrics(): StandardMetrics {
    return { impressions: 0, reach: 0, engagements: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 };
  }
}
