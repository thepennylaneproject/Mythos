/**
 * OAuth authorization route - redirects to platform OAuth.
 * GET /api/oauth/[platform]/authorize
 */
import { NextRequest, NextResponse } from "next/server";
import { getOAuthConfig, SupportedPlatform } from "@/lib/oauth/oauth-config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const config = getOAuthConfig(platform as SupportedPlatform);

  if (!config) {
    return NextResponse.json(
      { error: `Platform ${platform} is not configured` },
      { status: 400 }
    );
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in cookie for verification on callback
  const authUrl = new URL(config.authorizeUrl);
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", config.redirectUri);
  authUrl.searchParams.set("scope", config.scopes.join(" "));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  // Platform-specific params
  if (platform === "twitter") {
    authUrl.searchParams.set("code_challenge", "challenge"); // Simplified; use PKCE in production
    authUrl.searchParams.set("code_challenge_method", "plain");
  }

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 minutes
    sameSite: "lax",
  });

  return response;
}
