import type { DiagnosticRecord } from "@/types/diagnostic.types";
import type { ConfigurationPlan, OnboardingSession } from "./model";
import { requireCompleteAnswers, type OnboardingDraft } from "./schema";

export function strategicRecord(draft: OnboardingDraft): DiagnosticRecord {
  const a = requireCompleteAnswers(draft.answers);
  const buyer = a.step3_b2b ?? a.step3_b2c!;
  return {
    id: "diag_" + crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "wizard_completed",
    businessName: a.step2!.businessName,
    industry: a.step2!.industry,
    oneLiner: a.step2!.oneLiner,
    contact: {
      name: a.step6!.ownerName,
      email: a.step6!.ownerEmail,
      phone: a.step6!.ownerPhone,
    },
    icpSummary: {
      profile:
        a.step3_b2b?.primaryDecisionMaker ??
        a.step3_b2c?.lifeStage.join(", ") ??
        "",
      pain: buyer.mainPain,
      outcome: buyer.mainOutcome,
    },
    mechanismSummary: {
      objection: a.step4!.topObjection,
      differentiator: a.step4!.uniqueDifferentiator,
    },
    channels: a
      .step5!.activeChannels.filter((ch) => ch.useForProspecting)
      .map((ch) => ch.customName || ch.channel),
  };
}

export function strategySections(
  d: DiagnosticRecord,
  plan: ConfigurationPlan | null,
) {
  const pending = (value: string) => /por confirmar|pendiente/i.test(value);
  const sections = [
    {
      title: "Información declarada del negocio",
      lines: [
        d.oneLiner,
        d.icpSummary.profile,
        d.icpSummary.pain,
        d.icpSummary.outcome,
        d.mechanismSummary.differentiator,
      ].filter((line) => line && !pending(line)),
    },
  ];
  if (!plan) return sections;
  const primary = plan.memory.recommendations[0];
  const channels = d.channels.length
    ? d.channels.join(", ")
    : plan.archetype === "b2b"
      ? "referidos y búsqueda manual de empresas con el perfil elegido"
      : "referidos y formulario del negocio";
  return [
    ...sections,
    {
      title: "Hipótesis de captación",
      lines: [
        plan.archetype === "b2b"
          ? "Clasificar las solicitudes por oferta y preguntar quién decide la compra durante el primer diagnóstico. Validar el perfil con las primeras oportunidades."
          : "Clasificar solicitudes por necesidad y canal de entrada. Preguntar a los primeros compradores qué motivó su decisión.",
      ],
    },
    {
      title: "Prioridades propuestas",
      lines: plan.memory.recommendations.map(
        (r) => r.title + ". " + r.rationale + " " + r.action,
      ),
    },
    {
      title: "Prospección y seguimiento",
      lines: [
        "Canal para la primera prueba · " + channels,
        "Pipeline propuesto · " + plan.pipelineStages.join(" → "),
        ...plan.workflows,
      ],
    },
    {
      title: "Herramientas y uso de IA",
      lines: plan.modules
        .filter((m) => m.mode !== "defer")
        .map((m) => m.nextAction)
        .concat(
          "IA propuesta · preparar borradores de seguimiento a partir de la etapa y la objeción registrada. El responsable revisa cada borrador. Activar consumo requiere un presupuesto aprobado.",
        ),
    },
    {
      title: "Primeros 30 días",
      lines: [
        "Semana 1 · validar el perfil y la oferta con el titular, asignar el responsable y medir la línea base.",
        "Semanas 2–4 · " + (primary?.action ?? plan.coreTest),
        "Verificar el recorrido · " + plan.coreTest,
      ],
    },
    {
      title: "Días 31 a 90",
      lines: [
        "Comparar cohortes por canal, oferta y etapa del pipeline.",
        "Revisar el objetivo declarado · " +
          plan.customValues["10x_primary_goal"],
        "Mantener el canal que genere oportunidades calificadas con costo y capacidad aceptables para el negocio.",
      ],
    },
    { title: "Indicadores a medir", lines: plan.kpis },
    {
      title: "Datos pendientes de confirmar",
      lines: [
        ...plan.memory.unknowns,
        ...[d.icpSummary.profile, d.icpSummary.pain].filter(pending),
        ...(!d.mechanismSummary.objection
          ? ["Objeción de compra más frecuente"]
          : []),
      ],
    },
  ];
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ]!,
  );
}
export function renderStrategy(
  session: Pick<OnboardingSession, "diagnostic" | "plan">,
) {
  const d = session.diagnostic!;
  const sections = strategySections(d, session.plan);
  return `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Diagnóstico · ${escapeHtml(d.businessName)}</title><style>body{max-width:780px;margin:3rem auto;padding:0 1.4rem;color:#183343;font:17px/1.55 system-ui}header{border-bottom:3px solid #087b77}h1{line-height:1.12}h2{color:#086766;font-size:1.2rem;margin-top:2rem}li{margin:.4rem 0}@media print{h2{break-after:avoid}body{margin:0}}</style><header><p>10xteam Growth OS · Diagnóstico comercial</p><h1>${escapeHtml(d.businessName)}</h1></header>${sections.map((s) => "<section><h2>" + escapeHtml(s.title) + "</h2><ul>" + s.lines.map((line) => "<li>" + escapeHtml(line) + "</li>").join("") + "</ul></section>").join("")}</html>`;
}
