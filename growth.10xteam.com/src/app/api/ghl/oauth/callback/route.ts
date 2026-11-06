import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { actor, db, requireSession } from "@/lib/onboarding/store";
import { equalSecret, hash, seal, HttpError } from "@/lib/onboarding/security";
import { failure } from "@/lib/onboarding/http";
import { exchangeAuthorizationCode } from "@/lib/ghl/client";
import { assertBoundLocation, oauthSettings } from "@/lib/ghl/oauth-context";
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get("state") ?? "";
    const jar = await cookies();
    if (
      !state ||
      !equalSecret(state, jar.get("10x_oauth_state")?.value ?? "") ||
      !url.searchParams.get("code")
    )
      throw new HttpError(403, "Solicitud de conexión no reconocida.");
    const config = oauthSettings();
    const a = await actor();
    if (!a.userId) throw new HttpError(401, "Inicia sesión.");
    const now = new Date().toISOString();
    const { data, error } = await db()
      .from("onboarding_oauth_states")
      .update({ consumed_at: now })
      .eq("nonce_hash", hash(state))
      .eq("actor_id", a.userId)
      .is("consumed_at", null)
      .gt("expires_at", now)
      .select("session_id")
      .maybeSingle();
    jar.delete("10x_oauth_state");
    if (error || !data)
      throw new HttpError(403, "La autorización expiró o ya se utilizó.");
    const s = await requireSession(a, data.session_id);
    const token = await exchangeAuthorizationCode({
      ...config,
      code: url.searchParams.get("code")!,
      userType: "Location",
    });
    assertBoundLocation(s, token);
    const { error: write } = await db()
      .from("onboarding_credentials")
      .upsert({
        session_id: s.id,
        ciphertext: seal(token, s.id),
        expires_at: token.expiresAt,
        updated_at: now,
        refresh_lock_at: null,
      });
    if (write) throw new HttpError(503, "No se pudo guardar la conexión.");
    jar.delete("ghl_oauth_v1");
    return NextResponse.redirect(
      new URL("/wizard/complete", config.redirectUri),
    );
  } catch (e) {
    return failure(e);
  }
}
