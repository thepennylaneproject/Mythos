/**
 * OAuth callback route - exchanges code for tokens.
 * GET /api/oauth/[platform]/callback
 */
import { NextRequest, NextResponse } from "next/server";
import { getOAuthConfig, SupportedPlatform } from "@/lib/oauth/oauth-config";
import { storeToken } from "@/lib/oauth/token-manager";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const config = getOAuthConfig(platform as SupportedPlatform);

  if (!config) {
    return NextResponse.redirect("/settings/connections?error=invalid_platform");
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`/settings/connections?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect("/settings/connections?error=no_code");
  }

  // Verify state
  const storedState = req.cookies.get(`oauth_state_${platform}`)?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect("/settings/connections?error=state_mismatch");
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[oauth/callback] Token exchange failed for ${platform}:`, errorText);
      return NextResponse.redirect("/settings/connections?error=token_exchange_failed");
    }

    const tokenData = await tokenResponse.json();
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;

    // Get user info for display (platform-specific)
    let platformUserId = "";
    let platformUsername = "";

    if (platform === "meta") {
      const meRes = await fetch(
        `https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name`
      );
      if (meRes.ok) {
        const me = await meRes.json();
        platformUserId = me.id;
        platformUsername = me.name;
      }
    }

    // TODO: Get accountId from session - using placeholder for now
    const accountId = "00000000-0000-0000-0000-000000000000";

    await storeToken(
      accountId,
      platform as SupportedPlatform,
      tokenData.access_token,
      tokenData.refresh_token || null,
      expiresAt,
      { platformUserId, platformUsername }
    );

    const response = NextResponse.redirect("/settings/connections?success=true");
    response.cookies.delete(`oauth_state_${platform}`);
    return response;
  } catch (error) {
    console.error(`[oauth/callback] Error for ${platform}:`, error);
    return NextResponse.redirect("/settings/connections?error=unknown");
  }
}
