const GHL_AUTHORIZE_BASE_URL = "https://marketplace.gohighlevel.com/oauth/chooselocation";

const DEFAULT_SCOPES = [
  "contacts.readonly",
  "contacts.write",
  "locations.readonly",
  "conversations.write",
].join(" ");

export function buildGhlAuthorizeUrl(): string | null {
  const clientId = process.env.GHL_CLIENT_ID;
  const redirectUri = process.env.GHL_REDIRECT_URI;
  if (!clientId || !redirectUri) return null;

  const scopes = process.env.GHL_OAUTH_SCOPES ?? DEFAULT_SCOPES;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
  });

  return `${GHL_AUTHORIZE_BASE_URL}?${params.toString()}`;
}
