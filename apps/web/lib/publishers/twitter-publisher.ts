/**
 * Twitter/X publisher using API v2.
 */
import { BasePublisher, PlatformPost, PublishResult } from "./types";

export class TwitterPublisher extends BasePublisher {
  constructor(accessToken: string) {
    super(accessToken, "twitter");
  }

  async publish(post: PlatformPost): Promise<PublishResult> {
    try {
      // Twitter API v2 tweet endpoint
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: post.caption,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.detail || error.title || "Tweet failed" };
      }

      const result = await res.json();
      return {
        success: true,
        platformPostId: result.data?.id,
        platformData: result.data,
      };
    } catch (error: any) {
      return { success: false, error: error.message || "Unknown error" };
    }
  }

  async delete(platformPostId: string): Promise<boolean> {
    try {
      const res = await fetch(`https://api.twitter.com/2/tweets/${platformPostId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${this.accessToken}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getPostStats(platformPostId: string): Promise<Record<string, number>> {
    try {
      const res = await fetch(
        `https://api.twitter.com/2/tweets/${platformPostId}?tweet.fields=public_metrics`,
        { headers: { "Authorization": `Bearer ${this.accessToken}` } }
      );
      if (!res.ok) return {};
      const data = await res.json();
      return data.data?.public_metrics || {};
    } catch {
      return {};
    }
  }
}
