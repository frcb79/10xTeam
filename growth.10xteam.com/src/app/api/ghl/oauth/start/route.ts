import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  actor,
  requireSession,
  db,
  cookieOptions,
} from "@/lib/onboarding/store";
import {
  sameOrigin,
  readJson,
  hash,
  HttpError,
} from "@/lib/onboarding/security";
import { json, failure } from "@/lib/onboarding/http";
import { buildGhlAuthorizeUrl } from "@/lib/ghl/authorize";
import { oauthSettings, validOAuthReturn } from "@/lib/ghl/oauth-context";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const config = oauthSettings();
    if (!validOAuthReturn(config.redirectUri, request.url))
      throw new HttpError(503, "Revisar el retorno autorizado de la conexión.");
    const { id } = z
      .object({ id: z.string().uuid() })
      .strict()
      .parse(await readJson(request));
    const a = await actor();
    const s = await requireSession(a, id);
    if (!a.userId || a.userId !== s.owner_user_id || !s.provision.locationId)
      throw new HttpError(
        403,
        "El titular debe autorizar su cuenta configurada.",
      );
    const nonce = randomBytes(32).toString("base64url");
    const expires = new Date(Date.now() + 600000).toISOString();
    const { error } = await db()
      .from("onboarding_oauth_states")
      .insert({
        nonce_hash: hash(nonce),
        session_id: id,
        actor_id: a.userId,
        expires_at: expires,
      });
    if (error) throw new HttpError(503, "No se pudo iniciar la conexión.");
    (await cookies()).set("10x_oauth_state", nonce, {
      ...cookieOptions,
      maxAge: 600,
    });
    return json({ url: buildGhlAuthorizeUrl(nonce) });
  } catch (e) {
    return failure(e);
  }
}
