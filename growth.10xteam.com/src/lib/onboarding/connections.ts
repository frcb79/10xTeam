import { z } from "zod";
import type { OnboardingSession } from "./model";

export const services = {
  facebook: ["Facebook", "Social Planner · Meta"],
  instagram: ["Instagram", "Social Planner · Meta"],
  linkedin: ["LinkedIn", "Social Planner · LinkedIn"],
  google_business: ["Google Business Profile", "Google · perfil administrado"],
  email: ["Buzón", "OAuth del buzón"],
  calendar: ["Agenda", "OAuth de Google o Microsoft"],
  whatsapp: ["WhatsApp", "Meta Embedded Signup"],
  phone: ["Telefonía", "Configuración del operador"],
  dns: ["DNS", "Proveedor del dominio"],
  forms: ["Formulario web", "Backend del sitio"],
  payments: ["Pagos", "Proveedor de pagos"],
} as const;
export const serviceSchema = z.enum([
  "facebook",
  "instagram",
  "linkedin",
  "google_business",
  "email",
  "calendar",
  "whatsapp",
  "phone",
  "dns",
  "forms",
  "payments",
]);
export type ServiceId = z.infer<typeof serviceSchema>;
export type ConnectionEvent = {
  service: ServiceId;
  state: "authorized" | "connected" | "tested" | "failed" | "revoked";
  scopes: string[];
  actorId: string;
  at: string;
  planVersion: number;
  locationId: string;
  reference: string;
};
export function currentConnection(
  s: Pick<OnboardingSession, "plan" | "provision">,
  service: ServiceId,
) {
  return s.plan?.connections
    ?.filter(
      (e) =>
        e.service === service &&
        e.planVersion === s.plan?.version &&
        e.locationId === s.provision.locationId,
    )
    .at(-1);
}
export function assetPreview(
  s: Pick<OnboardingSession, "plan" | "provision" | "evidence">,
) {
  if (!s.plan) return [];
  const rows = [
    ["Pipeline", "pipelines", s.plan.pipelineStages.join(" → "), "crm"],
    [
      "Formulario",
      "forms",
      s.plan.modules.find((m) => m.id === "forms")?.nextAction,
      "forms",
    ],
    ["Automatización", "workflows", s.plan.workflows.join(" · "), ""],
    [
      "Agenda",
      "calendars",
      s.plan.modules.find((m) => m.id === "calendar")?.nextAction,
      "calendar",
    ],
    ["Dashboard", "", s.plan.kpis.join(" · "), ""],
  ];
  return rows.map(([name, group, detail, module]) => {
    const selected = s.plan!.modules.find((m) => m.id === module);
    const prepared =
      group === "pipelines" ||
      group === "workflows" ||
      (selected && selected.mode !== "defer");
    const installed = Boolean(
      s.provision.locationId &&
        s.provision.snapshotVersion &&
        s.provision.assets?.[group!]?.length,
    );
    const connection =
      module === "forms" || module === "calendar"
        ? currentConnection(s, module)
        : undefined;
    const gate =
      module &&
      s.evidence
        .filter(
          (e) =>
            e.gate === "module:" + module &&
            e.locationId === s.provision.locationId &&
            e.planVersion === s.plan!.version,
        )
        .at(-1);
    let status = installed ? "Instalado" : prepared ? "Preparado" : "Propuesto";
    if (connection?.state === "failed" || connection?.state === "revoked")
      status = "Requiere revisión";
    else if (
      connection?.state === "tested" ||
      (installed && gate && gate.kind === "real" && gate.outcome === "pass")
    )
      status = "Probado y funcional";
    else if (connection?.state === "connected") status = "Conectado";
    return { name, detail, status };
  });
}
