/**
 * Analytics fetcher types and base class.
 */

export interface StandardMetrics {
  impressions: number;
  reach: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  videoViews?: number;
  videoWatchTime?: number;
}

export abstract class BaseFetcher {
  protected accessToken: string;
  protected platform: string;

  constructor(accessToken: string, platform: string) {
    this.accessToken = accessToken;
    this.platform = platform;
  }

  abstract fetchMetrics(platformPostId: string): Promise<StandardMetrics>;
}
