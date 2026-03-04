/**
 * Publisher types and base class for social platform publishing.
 */

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformData?: Record<string, any>;
  error?: string;
}

export interface PlatformPost {
  id: string;
  channel: string;
  network: string;
  caption: string;
  mediaUrls?: string[];
  altText?: string;
  tags?: string[];
}

export abstract class BasePublisher {
  protected accessToken: string;
  protected platform: string;

  constructor(accessToken: string, platform: string) {
    this.accessToken = accessToken;
    this.platform = platform;
  }

  abstract publish(post: PlatformPost): Promise<PublishResult>;
  abstract delete(platformPostId: string): Promise<boolean>;
  abstract getPostStats(platformPostId: string): Promise<Record<string, number>>;
}
