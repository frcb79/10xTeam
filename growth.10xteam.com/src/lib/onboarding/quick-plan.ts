import type { Step2Answers } from "@/types/wizard.types";
import type { ConfigurationPlan, ModuleState, Recommendation } from "./model";
import {
  contextSchema,
  defaultContext,
  moduleIds,
  type BusinessContext,
} from "./schema";
import { moduleHelp } from "./plan";

// Limited to an authenticated QA pilot at the command boundary.
// A quick plan is an explicit proposal, not a six-step diagnostic or consent.
export function buildQuickPlan(
  businessAccountId: string,
  business: Step2Answers,
  goal: "leads" | "sales",
  version: number,
  now = new Date().toISOString(),
): { plan: ConfigurationPlan; context: BusinessContext } {
  if (
    !business.businessName.trim() ||
    !business.oneLiner.trim() ||
    !business.industry.trim()
  )
    throw new Error("Faltan los datos básicos del negocio.");

  const archetype =
    business.icpType === "b2b" || business.icpType === "mixed"
      ? "b2b"
      : "consumer";
  const context = contextSchema.parse({
    ...defaultContext,
    goal,
    target90Days:
      goal === "leads"
        ? "Conseguir prospectos y medir sus fuentes"
        : "Mejorar el seguimiento y avance de oportunidades",
    preserve: "No alterar sitios, formularios ni canales existentes sin revisión",
  });
  const stages =
    archetype === "b2b"
      ? ["Nuevo prospecto", "Calificación", "Diagnóstico", "Propuesta", "Decisión"]
      : ["Nuevo interesado", "Contacto", "Oferta", "Decisión"];
  const recommendations: Recommendation[] = [
    {
      id: "quick_capture",
      title: "Capturar prospectos en un solo lugar",
      rationale: "Recomendación estándar para el sector elegido, no evaluación de los canales actuales.",
      action: "Preparar un formulario y clasificar los contactos por origen, sin modificar el sitio actual.",
      metric: "Prospectos por fuente",
      evidenceKeys: ["step2.industry", "context.goal"],
      method: "rules-v1",
      status: "proposed",
    },
    {
      id: "quick_followup",
      title: "Organizar seguimiento y tareas internas",
      rationale: "El perfil y las objeciones reales del comprador quedan por definir.",
      action: "Proponer etapas de venta y una tarea interna por solicitud; no activar mensajes automáticos.",
      metric: "Oportunidades con siguiente tarea",
      evidenceKeys: ["step2.icpType", "context.goal"],
      method: "rules-v1",
      status: "proposed",
    },
    {
      id: "quick_measure",
      title: "Medir avance entre etapas",
      rationale: "Sin datos históricos no es posible estimar resultados o conversiones individuales.",
      action: "Preparar indicadores básicos de origen, calificación y avance; validar definiciones con el titular.",
      metric: "Conversión entre etapas",
      evidenceKeys: ["step2.productType", "context.goal"],
      method: "rules-v1",
      status: "proposed",
    },
  ];
  const modules: ModuleState[] = moduleIds.map((id) => ({
    id,
    required: id === "crm" || id === "forms",
    mode: id === "crm" ? "create" : id === "forms" ? "connect" : "defer",
    status: id === "crm" || id === "forms" ? "selected" : "deferred",
    nextAction: moduleHelp[id],
  }));

  const facts: ConfigurationPlan["memory"]["facts"] = [
    ...Object.entries(business).map(([key, value]) => ({
      key: "step2." + key,
      value,
      source: "customer" as const,
      status:
        value === null || value === "" || value === "unknown"
          ? ("pending" as const)
          : ("confirmed" as const),
      recordedAt: now,
    })),
    ...Object.entries(context).map(([key, value]) => ({
      key: "context." + key,
      value,
      source: key === "goal" ? ("customer" as const) : ("wizard" as const),
      status:
        key === "goal"
          ? ("confirmed" as const)
          : value === null || value === "" || (Array.isArray(value) && !value.length)
            ? ("pending" as const)
            : ("inferred" as const),
      recordedAt: now,
    })),
    {
      key: "plan_mode",
      value: "qa_quickstart",
      source: "wizard" as const,
      status: "inferred" as const,
      recordedAt: now,
    },
  ];
  const plan: ConfigurationPlan = {
    version,
    archetype,
    snapshotKey: "core-" + archetype,
    pipelineStages: stages,
    customValues: {
      "10x_business_name": business.businessName,
      "10x_offer": business.oneLiner,
      "10x_ideal_customer": "",
      "10x_primary_goal": context.target90Days,
      "10x_brand_voice": "",
      "10x_preserve": context.preserve,
    },
    workflows: ["Asignación y tarea interna para nuevo prospecto"],
    modules,
    kpis: recommendations.map((r) => r.metric),
    coreTest:
      "Formulario sintético → contacto único → oportunidad → tarea interna → métrica; reenvío sin duplicados",
    generatedAt: now,
    memory: {
      schemaVersion: 1,
      businessAccountId,
      facts,
      recommendations,
      unknowns: [
        "Comprador ideal y proceso de decisión",
        "Canales y permisos del negocio",
        "Volumen y conversión actuales",
        "Objeciones y restricciones reales",
        "Revisión de los valores sugeridos antes de activar servicios",
      ],
      agentPolicy: {
        crossAccountData: false,
        execution: "approval_required",
        paidAI: "disabled",
      },
    },
  };
  return { plan, context };
}
