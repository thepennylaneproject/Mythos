/**
 * Meta (Facebook/Instagram) publisher using Graph API.
 */
import { BasePublisher, PlatformPost, PublishResult } from "./types";

export class MetaPublisher extends BasePublisher {
  private pageId: string;

  constructor(accessToken: string, pageId: string) {
    super(accessToken, "meta");
    this.pageId = pageId;
  }

  async publish(post: PlatformPost): Promise<PublishResult> {
    try {
      const endpoint = post.network === "instagram"
        ? `https://graph.facebook.com/v18.0/${this.pageId}/media`
        : `https://graph.facebook.com/v18.0/${this.pageId}/feed`;

      // For Instagram, we need a two-step process; for Facebook, single POST
      if (post.network === "instagram" && post.mediaUrls?.length) {
        // Step 1: Create media container
        const containerRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: post.mediaUrls[0],
            caption: post.caption,
            access_token: this.accessToken,
          }),
        });

        if (!containerRes.ok) {
          const error = await containerRes.json();
          return { success: false, error: error.error?.message || "Container creation failed" };
        }

        const container = await containerRes.json();

        // Step 2: Publish the container
        const publishRes = await fetch(
          `https://graph.facebook.com/v18.0/${this.pageId}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: container.id,
              access_token: this.accessToken,
            }),
          }
        );

        if (!publishRes.ok) {
          const error = await publishRes.json();
          return { success: false, error: error.error?.message || "Publish failed" };
        }

        const result = await publishRes.json();
        return { success: true, platformPostId: result.id, platformData: result };
      } else {
        // Facebook text/link post
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: post.caption,
            access_token: this.accessToken,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          return { success: false, error: error.error?.message || "Post failed" };
        }

        const result = await res.json();
        return { success: true, platformPostId: result.id, platformData: result };
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Unknown error" };
    }
  }

  async delete(platformPostId: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${platformPostId}?access_token=${this.accessToken}`,
        { method: "DELETE" }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async getPostStats(platformPostId: string): Promise<Record<string, number>> {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${platformPostId}/insights?metric=impressions,reach,engagement&access_token=${this.accessToken}`
      );
      if (!res.ok) return {};
      const data = await res.json();
      const stats: Record<string, number> = {};
      data.data?.forEach((metric: any) => {
        stats[metric.name] = metric.values?.[0]?.value || 0;
      });
      return stats;
    } catch {
      return {};
    }
  }
}
