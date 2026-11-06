import { actor, requireSession, db } from "@/lib/onboarding/store";
import { failure, json } from "@/lib/onboarding/http";
export async function GET(request: Request) {
  try {
    const a = await actor();
    const s = await requireSession(a);
    const query = new URL(request.url).searchParams;
    if (
      !a.userId ||
      query.has("companyId") ||
      (query.has("locationId") &&
        query.get("locationId") !== s.provision.locationId)
    )
      return json({ connected: false }, 403);
    const { data, error } = await db()
      .from("onboarding_credentials")
      .select("expires_at")
      .eq("session_id", s.id)
      .maybeSingle();
    if (error) return json({ error: "No se pudo comprobar la conexión." }, 503);
    return json({
      connected: Boolean(data && Date.parse(data.expires_at) > Date.now()),
      expiresAt: data?.expires_at ?? null,
    });
  } catch (e) {
    return failure(e);
  }
}
