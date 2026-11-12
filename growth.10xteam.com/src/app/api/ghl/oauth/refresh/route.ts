import { actor, requireSession, db } from "@/lib/onboarding/store";
import { sameOrigin, unseal, seal, HttpError } from "@/lib/onboarding/security";
import { json, failure } from "@/lib/onboarding/http";
import { oauthSettings, assertBoundLocation } from "@/lib/ghl/oauth-context";
import { refreshAccessToken } from "@/lib/ghl/client";
import type { GhlOAuthSession } from "@/types/ghl.types";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const a = await actor();
    const s = await requireSession(a);
    if (!a.userId || a.userId !== s.owner_user_id)
      throw new HttpError(403, "Se requiere acceso del titular.");
    const config = oauthSettings();
    const now = new Date().toISOString();
    const { data, error } = await db()
      .from("onboarding_credentials")
      .update({ refresh_lock_at: now })
      .eq("session_id", s.id)
      .is("refresh_lock_at", null)
      .select("ciphertext")
      .maybeSingle();
    if (error || !data)
      throw new HttpError(
        409,
        "La conexión requiere revisión o una nueva autorización.",
      );
    const previous = unseal<GhlOAuthSession>(data.ciphertext, s.id);
    assertBoundLocation(s, previous);
    const token = await refreshAccessToken({
      ...config,
      refreshToken: previous.refreshToken,
      userType: "Location",
    });
    assertBoundLocation(s, token);
    const { data: stored, error: write } = await db()
      .from("onboarding_credentials")
      .update({
        ciphertext: seal(token, s.id),
        expires_at: token.expiresAt,
        updated_at: now,
        refresh_lock_at: null,
      })
      .eq("session_id", s.id)
      .eq("refresh_lock_at", now)
      .select("session_id")
      .maybeSingle();
    if (write || !stored)
      throw new HttpError(503, "Se requiere volver a autorizar la conexión.");
    return json({ ok: true, expiresAt: token.expiresAt });
  } catch (e) {
    return failure(e);
  }
}
