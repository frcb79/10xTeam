import { HttpError } from "@/lib/onboarding/security";
import type { OnboardingSession } from "@/lib/onboarding/model";
import type { GhlOAuthSession } from "@/types/ghl.types";
export function assertBoundLocation(
  session: OnboardingSession,
  token: GhlOAuthSession,
  companyId = process.env.GHL_COMPANY_ID,
) {
  if (
    !companyId ||
    !session.provision.locationId ||
    token.userType !== "Location" ||
    token.scope?.trim() !== "locations.readonly" ||
    token.companyId !== companyId ||
    token.locationId !== session.provision.locationId ||
    !token.accessToken ||
    !token.refreshToken
  )
    throw new HttpError(
      403,
      "La cuenta autorizada no coincide con tu negocio.",
    );
}
export function oauthSettings() {
  const {
    GHL_CLIENT_ID: clientId,
    GHL_CLIENT_SECRET: clientSecret,
    GHL_REDIRECT_URI: redirectUri,
  } = process.env;
  if (
    process.env.GHL_OAUTH_ENABLED !== "true" ||
    !clientId ||
    !clientSecret ||
    !redirectUri ||
    !process.env.GHL_COMPANY_ID ||
    Buffer.from(process.env.ONBOARDING_ENCRYPTION_KEY ?? "", "base64")
      .length !== 32
  )
    throw new HttpError(
      503,
      "La conexión del proveedor está pendiente de configuración.",
    );
  return { clientId, clientSecret, redirectUri };
}

export function validOAuthReturn(redirectUri: string, requestUrl: string) {
  return ["/api/connections/callback", "/api/ghl/oauth/callback"].some(
    (path) => redirectUri === new URL(path, requestUrl).href,
  );
}
