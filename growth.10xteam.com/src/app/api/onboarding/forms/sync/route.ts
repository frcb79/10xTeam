import { db } from "@/lib/onboarding/store";
import { equalSecret, HttpError } from "@/lib/onboarding/security";
import { failure, json } from "@/lib/onboarding/http";
import { formDestination } from "@/lib/onboarding/form-delivery";
import { GhlProvisionProvider } from "@/lib/ghl/provision-provider";
import type { OnboardingSession } from "@/lib/onboarding/model";

export async function POST(request: Request) {
  try {
    const secret = process.env.ONBOARDING_FORM_WORKER_SECRET;
    if (
      !secret ||
      secret.length < 32 ||
      !equalSecret(
        request.headers.get("authorization") ?? "",
        "Bearer " + secret,
      )
    )
      throw new HttpError(403, "Acceso denegado.");
    if (process.env.ONBOARDING_FORM_SYNC_ENABLED !== "true")
      throw new HttpError(409, "La sincronización está desactivada.");
    const client = db();
    const { data: next, error } = await client
      .from("onboarding_form_outbox")
      .select("id")
      .eq("status", "pending")
      .order("updated_at")
      .limit(1)
      .maybeSingle();
    if (error) throw new HttpError(503, "Cola no disponible.");
    if (!next) return json({ processed: 0 });
    const lock = await client
      .from("onboarding_form_outbox")
      .update({ status: "sending", updated_at: new Date().toISOString() })
      .eq("id", next.id)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();
    if (lock.error) throw new HttpError(503, "No se pudo reservar el envío.");
    if (!lock.data) return json({ processed: 0 });
    const job = lock.data;
    try {
      const [s, r, l] = await Promise.all([
        client
          .from("onboarding_sessions")
          .select("*")
          .eq("id", job.session_id)
          .single(),
        client
          .from("onboarding_form_routes")
          .select("*")
          .eq("source", job.source)
          .eq("session_id", job.session_id)
          .eq("location_id", job.location_id)
          .single(),
        client
          .from("contact_leads")
          .select("name,email,service_type,source")
          .eq("id", job.lead_id)
          .single(),
      ]);
      if (!s.data || !r.data || !l.data) throw new Error("missing_binding");
      const target = formDestination(
        s.data as OnboardingSession,
        r.data,
        l.data,
      );
      const provider = new GhlProvisionProvider(
        process.env.GHL_AGENCY_ACCESS_TOKEN ?? "",
        process.env.GHL_COMPANY_ID ?? "",
      );
      const contactId = await provider.upsertFormContact(target);
      const done = await client
        .from("onboarding_form_outbox")
        .update({
          status: "done",
          provider_contact_id: contactId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "sending")
        .select("id")
        .single();
      if (done.error) throw new Error("write_uncertain");
      return json({ processed: 1 });
    } catch {
      await client
        .from("onboarding_form_outbox")
        .update({ status: "review", updated_at: new Date().toISOString() })
        .eq("id", job.id)
        .eq("status", "sending");
      throw new HttpError(
        409,
        "Reconciliar el contacto y la ruta antes de reintentar.",
      );
    }
  } catch (e) {
    return failure(e);
  }
}
