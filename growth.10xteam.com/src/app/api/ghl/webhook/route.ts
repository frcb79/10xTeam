import { verifiedEvent } from "@/lib/ghl/webhook";
import { db } from "@/lib/onboarding/store";
import { json, failure } from "@/lib/onboarding/http";
import { readBytes } from "@/lib/onboarding/security";
export async function POST(request: Request) {
  try {
    const raw = await readBytes(request, 100000);
    const event = verifiedEvent(raw, request.headers.get("x-ghl-signature"));
    if (!event) return json({ error: "Firma inválida." }, 401);
    if (
      event.ignored ||
      !process.env.GHL_COMPANY_ID ||
      (event.companyId && event.companyId !== process.env.GHL_COMPANY_ID)
    )
      return json({ ignored: true }, 202);
    const { data, error } = await db()
      .from("onboarding_sessions")
      .select("id")
      .eq("provision->>locationId", event.locationId)
      .maybeSingle();
    if (error) return json({ error: "Reintentar." }, 503);
    if (!data) return json({ ignored: true }, 202);
    const { error: write } = await db()
      .from("onboarding_webhooks")
      .insert({
        digest: event.digest,
        session_id: data.id,
        event_type: event.type,
      });
    if (write && write.code !== "23505")
      return json({ error: "Reintentar." }, 503);
    return json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
