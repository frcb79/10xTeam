import type { GhlOAuthSession } from "@/types/ghl.types";

export const GHL_SESSION_COOKIE = "ghl_oauth_v1";

export function encodeGhlSession(session: GhlOAuthSession): string {
  return Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
}

export function decodeGhlSession(value: string): GhlOAuthSession | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    return JSON.parse(json) as GhlOAuthSession;
  } catch {
    return null;
  }
}
