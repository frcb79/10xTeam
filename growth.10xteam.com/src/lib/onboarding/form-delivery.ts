import { currentConnection } from "./connections";
import type { OnboardingSession } from "./model";
import { HttpError } from "./security";
export type FormRoute = {
  source: string;
  session_id: string;
  location_id: string;
  service_field_id: string;
  enabled: boolean;
};
export type FormLead = {
  name: string;
  email: string;
  service_type: string | null;
  source: string;
};
export function formDestination(
  session: OnboardingSession,
  route: FormRoute,
  lead: FormLead,
) {
  const formModule = session.plan?.modules.find((m) => m.id === "forms");
  if (
    ["revoked", "failed"].includes(currentConnection(session, "forms")?.state ?? "") ||
    !route.enabled ||
    !session.owner_user_id ||
    session.provision.status !== "configured" ||
    route.session_id !== session.id ||
    route.location_id !== session.provision.locationId ||
    lead.source !== route.source ||
    !formModule ||
    !["connect", "create"].includes(formModule.mode) ||
    formModule.consent?.actorId !== session.owner_user_id ||
    formModule.consent?.planVersion !== session.plan?.version ||
    formModule.consent?.scope !== "prepare_forms_no_paid_services"
  )
    throw new HttpError(409, "Destino o autorización pendientes.");
  const devOffers: Record<string, string> = {
    mvp: "Llave en Mano",
    celula: "10x Dev Squad",
  };
  const service =
    lead.source === "dev_contact"
      ? devOffers[lead.service_type ?? ""]
      : lead.service_type;
  if (!service)
    throw new HttpError(409, "Revisa la oferta antes de sincronizar.");
  return {
    locationId: route.location_id,
    email: lead.email.trim().toLowerCase(),
    name: lead.name,
    source: route.source,
    customFields: [{ id: route.service_field_id, field_value: service }],
  };
}
