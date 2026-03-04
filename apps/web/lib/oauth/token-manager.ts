/**
 * Token manager for storing, retrieving, and refreshing OAuth tokens.
 * Tokens are encrypted at rest using AES-256.
 */
import { db } from "@/lib/db";
import { vendorTokens } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { getOAuthConfig, SupportedPlatform } from "./oauth-config";

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET?.slice(0, 32) || "";
const IV_LENGTH = 16;

function encrypt(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    console.warn("[token-manager] No encryption key set, storing tokens unencrypted");
    return text;
  }
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32 || !text.includes(":")) {
    return text; // Unencrypted or no key
  }
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export interface StoredToken {
  id: string;
  platform: SupportedPlatform;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  platformUserId?: string;
  platformUsername?: string;
}

export async function storeToken(
  accountId: string,
  platform: SupportedPlatform,
  accessToken: string,
  refreshToken: string | null,
  expiresAt: Date | null,
  meta?: Record<string, any>
): Promise<string> {
  const encryptedAccess = encrypt(accessToken);
  const encryptedRefresh = refreshToken ? encrypt(refreshToken) : null;

  // Upsert: delete existing then insert
  await db.delete(vendorTokens).where(
    and(eq(vendorTokens.accountId, accountId), eq(vendorTokens.vendor, platform))
  );

  const [token] = await db
    .insert(vendorTokens)
    .values({
      vendor: platform,
      accountId,
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      expiresAt,
      meta: meta || {},
    })
    .returning({ id: vendorTokens.id });

  return token.id;
}

export async function getToken(
  accountId: string,
  platform: SupportedPlatform
): Promise<StoredToken | null> {
  const [token] = await db
    .select()
    .from(vendorTokens)
    .where(and(eq(vendorTokens.accountId, accountId), eq(vendorTokens.vendor, platform)));

  if (!token) return null;

  return {
    id: token.id,
    platform: token.vendor as SupportedPlatform,
    accessToken: decrypt(token.accessToken),
    refreshToken: token.refreshToken ? decrypt(token.refreshToken) : null,
    expiresAt: token.expiresAt,
    platformUserId: (token.meta as any)?.platformUserId,
    platformUsername: (token.meta as any)?.platformUsername,
  };
}

export async function deleteToken(accountId: string, platform: SupportedPlatform): Promise<boolean> {
  const result = await db
    .delete(vendorTokens)
    .where(and(eq(vendorTokens.accountId, accountId), eq(vendorTokens.vendor, platform)))
    .returning({ id: vendorTokens.id });

  return result.length > 0;
}

export async function refreshToken(accountId: string, platform: SupportedPlatform): Promise<boolean> {
  const token = await getToken(accountId, platform);
  if (!token || !token.refreshToken) return false;

  const config = getOAuthConfig(platform);
  if (!config) return false;

  try {
    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    });

    if (!response.ok) {
      console.error(`[token-manager] Failed to refresh ${platform} token:`, await response.text());
      return false;
    }

    const data = await response.json();
    const newExpiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null;

    await storeToken(
      accountId,
      platform,
      data.access_token,
      data.refresh_token || token.refreshToken,
      newExpiry
    );

    return true;
  } catch (error) {
    console.error(`[token-manager] Error refreshing ${platform} token:`, error);
    return false;
  }
}

export async function getAllTokensForAccount(accountId: string): Promise<StoredToken[]> {
  const tokens = await db
    .select()
    .from(vendorTokens)
    .where(eq(vendorTokens.accountId, accountId));

  return tokens.map((token) => ({
    id: token.id,
    platform: token.vendor as SupportedPlatform,
    accessToken: decrypt(token.accessToken),
    refreshToken: token.refreshToken ? decrypt(token.refreshToken) : null,
    expiresAt: token.expiresAt,
    platformUserId: (token.meta as any)?.platformUserId,
    platformUsername: (token.meta as any)?.platformUsername,
  }));
}
