/**
 * OAuth configuration for supported social platforms.
 */

export type SupportedPlatform = "meta" | "twitter" | "linkedin" | "tiktok";

export interface OAuthConfig {
  platform: SupportedPlatform;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
}

// Platform configurations pulled from environment
export function getOAuthConfig(platform: SupportedPlatform): OAuthConfig | null {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  switch (platform) {
    case "meta":
      if (!process.env.META_APP_ID || !process.env.META_APP_SECRET) return null;
      return {
        platform: "meta",
        clientId: process.env.META_APP_ID,
        clientSecret: process.env.META_APP_SECRET,
        authorizeUrl: "https://www.facebook.com/v18.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
        scopes: [
          "pages_show_list",
          "pages_read_engagement",
          "pages_manage_posts",
          "instagram_basic",
          "instagram_content_publish",
          "publish_video",
        ],
        redirectUri: `${baseUrl}/api/oauth/meta/callback`,
      };

    case "twitter":
      if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) return null;
      return {
        platform: "twitter",
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        authorizeUrl: "https://twitter.com/i/oauth2/authorize",
        tokenUrl: "https://api.twitter.com/2/oauth2/token",
        scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
        redirectUri: `${baseUrl}/api/oauth/twitter/callback`,
      };

    case "linkedin":
      if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) return null;
      return {
        platform: "linkedin",
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
        tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
        scopes: ["r_liteprofile", "r_emailaddress", "w_member_social"],
        redirectUri: `${baseUrl}/api/oauth/linkedin/callback`,
      };

    case "tiktok":
      // Stub for future implementation
      return null;

    default:
      return null;
  }
}

export function getSupportedPlatforms(): SupportedPlatform[] {
  return ["meta", "twitter", "linkedin", "tiktok"];
}

export function isPlatformConfigured(platform: SupportedPlatform): boolean {
  return getOAuthConfig(platform) !== null;
}
