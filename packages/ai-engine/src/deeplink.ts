/**
 * Deeplink Generator: Create native app deeplinks for social platforms.
 */

export type SupportedPlatform = "instagram" | "tiktok" | "linkedin" | "x" | "facebook" | "threads";

export interface DeeplinkOptions {
  platform: SupportedPlatform;
  caption?: string;
  mediaUrl?: string;
  hashtags?: string[];
  url?: string;
}

export interface DeeplinkResult {
  deeplink: string;
  fallbackUrl: string;
  platform: SupportedPlatform;
  instructions: string;
}

/**
 * Generate a deeplink for the specified platform.
 */
export function generateDeeplink(options: DeeplinkOptions): DeeplinkResult {
  const { platform, caption, mediaUrl, hashtags, url } = options;
  const encodedCaption = encodeURIComponent(caption || "");
  const hashtagString = hashtags?.map(t => `#${t}`).join(" ") || "";
  const encodedHashtags = encodeURIComponent(hashtagString);
  const fullText = encodeURIComponent(`${caption || ""} ${hashtagString}`.trim());

  switch (platform) {
    case "instagram":
      // Instagram doesn't allow text pre-fill, but we can open the app
      return {
        deeplink: mediaUrl 
          ? `instagram://library?AssetPath=${encodeURIComponent(mediaUrl)}`
          : "instagram://camera",
        fallbackUrl: "https://www.instagram.com/",
        platform,
        instructions: "Open Instagram, navigate to create post. Paste your caption from clipboard.",
      };

    case "tiktok":
      return {
        deeplink: "tiktok://",
        fallbackUrl: "https://www.tiktok.com/upload",
        platform,
        instructions: "Open TikTok, tap the + button to create. Paste your caption from clipboard.",
      };

    case "linkedin":
      return {
        deeplink: url 
          ? `linkedin://shareArticle?url=${encodeURIComponent(url)}&summary=${encodedCaption}`
          : `linkedin://post?text=${fullText}`,
        fallbackUrl: `https://www.linkedin.com/feed/?shareActive=true&text=${fullText}`,
        platform,
        instructions: "Click to open LinkedIn with your post pre-filled.",
      };

    case "x":
      return {
        deeplink: `twitter://post?text=${fullText}`,
        fallbackUrl: `https://twitter.com/intent/tweet?text=${fullText}`,
        platform,
        instructions: "Click to open X (Twitter) with your post pre-filled.",
      };

    case "facebook":
      return {
        deeplink: url 
          ? `fb://share?link=${encodeURIComponent(url)}&quote=${encodedCaption}`
          : "fb://composer",
        fallbackUrl: url 
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodedCaption}`
          : "https://www.facebook.com/",
        platform,
        instructions: "Open Facebook to share. Paste your caption from clipboard.",
      };

    case "threads":
      return {
        deeplink: `threads://post?text=${fullText}`,
        fallbackUrl: `https://www.threads.net/intent/post?text=${fullText}`,
        platform,
        instructions: "Click to open Threads with your post pre-filled.",
      };

    default:
      return {
        deeplink: "",
        fallbackUrl: "",
        platform,
        instructions: "Platform not supported for deeplinks.",
      };
  }
}

/**
 * Determine if the current device likely supports native app deeplinks.
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
