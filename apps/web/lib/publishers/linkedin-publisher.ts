/**
 * LinkedIn publisher using API.
 */
import { BasePublisher, PlatformPost, PublishResult } from "./types";

export class LinkedInPublisher extends BasePublisher {
  private authorUrn: string;

  constructor(accessToken: string, authorUrn: string) {
    super(accessToken, "linkedin");
    this.authorUrn = authorUrn; // e.g., "urn:li:person:ABC123" or "urn:li:organization:123456"
  }

  async publish(post: PlatformPost): Promise<PublishResult> {
    try {
      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: this.authorUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: post.caption },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.message || "LinkedIn post failed" };
      }

      const result = await res.json();
      return {
        success: true,
        platformPostId: result.id,
        platformData: result,
      };
    } catch (error: any) {
      return { success: false, error: error.message || "Unknown error" };
    }
  }

  async delete(platformPostId: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(platformPostId)}`,
        {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${this.accessToken}` },
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async getPostStats(platformPostId: string): Promise<Record<string, number>> {
    try {
      const res = await fetch(
        `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(platformPostId)}`,
        { headers: { "Authorization": `Bearer ${this.accessToken}` } }
      );
      if (!res.ok) return {};
      const data = await res.json();
      return {
        likes: data.likesSummary?.totalLikes || 0,
        comments: data.commentsSummary?.totalFirstLevelComments || 0,
      };
    } catch {
      return {};
    }
  }
}
