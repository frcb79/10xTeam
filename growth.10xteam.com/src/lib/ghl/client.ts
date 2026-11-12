import type { GhlOAuthSession, GhlTokenResponse } from "@/types/ghl.types";

const GHL_OAUTH_BASE_URL = "https://services.leadconnectorhq.com/oauth/token";

function buildSessionFromToken(token: GhlTokenResponse): GhlOAuthSession {
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    scope: token.scope,
    userType: token.userType,
    companyId: token.companyId,
    locationId: token.locationId,
    userId: token.userId,
  };
}

export async function exchangeAuthorizationCode(input: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  userType?: "Company" | "Location";
}): Promise<GhlOAuthSession> {
  const response = await fetch(GHL_OAUTH_BASE_URL, {
    method: "POST",
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      grant_type: "authorization_code",
      code: input.code,
      user_type: input.userType ?? "Company",
      redirect_uri: input.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`GHL code exchange failed (${response.status})`);
  }

  const payload = (await response.json()) as GhlTokenResponse;
  return buildSessionFromToken(payload);
}

export async function refreshAccessToken(input: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  userType?: "Company" | "Location";
}): Promise<GhlOAuthSession> {
  const form = new URLSearchParams({
    client_id: input.clientId,
    client_secret: input.clientSecret,
    grant_type: "refresh_token",
    refresh_token: input.refreshToken,
    user_type: input.userType ?? "Company",
    redirect_uri: input.redirectUri,
  });

  const response = await fetch(GHL_OAUTH_BASE_URL, {
    method: "POST",
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`GHL refresh failed (${response.status})`);
  }

  const payload = (await response.json()) as GhlTokenResponse;
  return buildSessionFromToken(payload);
}
