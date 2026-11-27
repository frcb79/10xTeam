const url = "https://marketplace.gohighlevel.com/oauth/chooselocation";
export function buildGhlAuthorizeUrl(state: string) {
  const client_id = process.env.GHL_CLIENT_ID;
  const redirect_uri = process.env.GHL_REDIRECT_URI;
  if (!client_id || !redirect_uri || !state) return null;
  const params = new URLSearchParams({
    response_type: "code",
    client_id,
    redirect_uri,
    state,
    scope: "locations.readonly",
  });
  return url + "?" + params.toString();
}
