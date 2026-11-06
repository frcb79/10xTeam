import type { WizardAnswers } from "@/types/wizard.types";
import {
  contextSchema,
  requireCompleteAnswers,
  type BusinessContext,
  type ModuleId,
} from "./schema";
import type { ConfigurationPlan, ModuleState, Recommendation } from "./model";

export const moduleHelp: Record<ModuleId, string> = {
  crm: "Revisar etapas, responsables y una oportunidad de prueba. No se importan contactos existentes sin autorización.",
  forms:
    "Conectar el formulario conservando tu sitio; probar captura, origen y duplicados con datos sintéticos.",
  calendar:
    "El titular autoriza su agenda con el proveedor. Confirmar horarios, conflictos, reprogramación y cancelación.",
  email:
    "El titular autoriza su buzón; el dominio de envío requiere verificar DNS, entrega y bajas. No cambiamos MX automáticamente.",
  whatsapp:
    "Revisar número y elegibilidad con Meta; aceptar costos antes de conectar. Seleccionarlo no contrata el servicio.",
  social:
    "Autorizar cada activo y función: publicación, mensajes y formularios de leads. Compartir marca no autoriza compartir conversaciones.",
  payments:
    "El titular conecta su pasarela y aprueba condiciones. Los cobros del negocio son independientes de su suscripción.",
  ai: "Aprobar finalidad, fuentes y presupuesto con límite antes de activar IA de pago. El diagnóstico inicial usa reglas sin consumo externo.",
};

export function conditionalQuestions(
  c: Pick<BusinessContext, "goal" | "bottleneck" | "sharedSocialIdentity">,
) {
  return [
    "target90Days",
    "monthlyLeads",
    "channelResults",
    "tools",
    "preserve",
    "budget",
    "restrictions",
    ...(c.goal === "appointments" ? ["calendarHosts"] : []),
    ...(c.bottleneck === "closing" || c.goal === "sales"
      ? ["conversionPercent"]
      : []),
    ...(c.sharedSocialIdentity ? ["socialRoutingReview"] : []),
  ];
}

export function buildPlan(
  id: string,
  answersInput: WizardAnswers,
  contextInput: BusinessContext,
  version: number,
  now = new Date().toISOString(),
): ConfigurationPlan {
  const a = requireCompleteAnswers(answersInput);
  const c = contextSchema.parse(contextInput);
  const business = a.step2!;
  const icp = a.step3_b2b ?? a.step3_b2c!;
  const archetype =
    c.goal === "appointments"
      ? "appointments"
      : business.icpType === "b2b" || business.icpType === "mixed"
        ? "b2b"
        : "consumer";
  const stages =
    archetype === "appointments"
      ? [
          "Solicitud",
          "Cita pendiente",
          "Cita confirmada",
          "Atendido",
          "Seguimiento",
        ]
      : archetype === "b2b"
        ? [
            "Nuevo prospecto",
            "Calificación",
            "Diagnóstico",
            "Propuesta",
            "Decisión",
          ]
        : ["Nuevo interesado", "Contacto", "Oferta", "Decisión"];
  const recommendations: Recommendation[] = [];
  const add = (
    id: string,
    title: string,
    rationale: string,
    action: string,
    metric: string,
    evidenceKeys: string[],
  ) =>
    recommendations.push({
      id,
      title,
      rationale,
      action,
      metric,
      evidenceKeys,
      method: "rules-v1",
      status: "proposed",
    });
  if (c.bottleneck === "demand" || c.goal === "leads" || c.monthlyLeads === 0) {
    add(
      "acquisition",
      "Probar una fuente de prospectos con encaje",
      `${business.businessName} ofrece ${business.oneLiner}. El cliente definido necesita: ${icp.mainPain}. Objetivo declarado: ${c.target90Days}.`,
      archetype === "b2b"
        ? "Definir una lista pequeña de empresas del mercado declarado, verificar encaje y preparar acercamientos sujetos a autorización; medir conversaciones calificadas."
        : "Probar una oferta para el público declarado mediante contenido, referidos o formulario; registrar origen y calidad antes de ampliar inversión.",
      "Prospectos calificados por origen",
      [
        "step2.oneLiner",
        "step3.mainPain",
        "context.target90Days",
        "context.monthlyLeads",
      ],
    );
  }
  if (c.goal === "appointments")
    add(
      "appointments",
      "Reducir fricción para reservar",
      `El objetivo requiere citas. Disponibilidad declarada: ${c.calendarHosts}.`,
      "Configurar agenda y probar reserva, conflicto, reprogramación y cancelación sin notificaciones externas.",
      "Citas confirmadas / solicitudes",
      ["context.goal", "context.calendarHosts"],
    );
  if (
    c.bottleneck === "followup" ||
    a.step6!.leadResponseTime === "more_2hrs" ||
    a.step6!.leadResponseTime === "30min_2hrs"
  )
    add(
      "followup",
      "Asignar cada oportunidad y su siguiente tarea",
      `Tiempo de respuesta declarado: ${a.step6!.leadResponseTime}. Ciclo comercial: ${a.step4!.salesCycleDuration}.`,
      "Crear tareas internas y responsables por etapa. Los mensajes requieren permiso y canal probado.",
      "Tiempo hasta primera respuesta; oportunidades sin siguiente tarea",
      ["step6.leadResponseTime", "step4.salesCycleDuration"],
    );
  if (c.goal === "retention")
    add(
      "retention",
      "Revisar continuidad de clientes",
      `Modelo de venta: ${a.step6!.saleType}. Objetivo: ${c.target90Days}.`,
      "Definir fechas de seguimiento y revisar señales autorizadas de renovación; preparar tareas internas antes de automatizar contacto.",
      "Renovaciones / clientes elegibles",
      ["step6.saleType", "context.target90Days"],
    );
  add(
    "conversion",
    "Medir el avance entre etapas",
    `La objeción declarada es: ${a.step4!.topObjection || "pendiente"}. Conversión actual: ${c.conversionPercent === null ? "desconocida" : `${c.conversionPercent}%`}.`,
    "Registrar motivos de pérdida y probar una respuesta a la objeción con evidencia del negocio.",
    "Oportunidades ganadas / oportunidades calificadas",
    ["step4.topObjection", "context.conversionPercent"],
  );
  add(
    "continuity",
    "Conservar lo que ya funciona",
    `Conservar: ${c.preserve}. Herramientas: ${c.tools || "sin especificar"}. Presupuesto: ${c.budget}.`,
    "Validar la configuración propuesta con el titular, preservar marca y procesos, y revisar el primer indicador a los 7 días.",
    "Capturas correctas; incidencias de transición",
    ["context.preserve", "context.tools", "context.budget"],
  );
  const required = new Set<ModuleId>([
    "crm",
    c.goal === "appointments" ? "calendar" : "forms",
    ...c.requiredChannels,
  ]);
  const modules = (Object.keys(moduleHelp) as ModuleId[]).map(
    (id): ModuleState => ({
      id,
      required: required.has(id),
      mode: required.has(id) ? (id === "crm" ? "create" : "connect") : "defer",
      status: required.has(id) ? "selected" : "deferred",
      nextAction: moduleHelp[id],
    }),
  );
  if (c.sharedSocialIdentity)
    modules.find((m) => m.id === "social")!.nextAction +=
      " Identidad compartida: confirmar destino único de mensajes/leads y responsables de publicación antes de conectar otra cuenta.";
  const facts: ConfigurationPlan["memory"]["facts"] = [];
  for (const [group, fields] of Object.entries({
    step2: a.step2,
    step3: icp,
    step4: a.step4,
    step5: a.step5,
    step6: a.step6,
    context: c,
  })) {
    for (const [key, value] of Object.entries(fields ?? {})) {
      if (["ownerEmail", "ownerPhone", "ownerName"].includes(key)) continue;
      const inferred =
        group === "step3" &&
        ["mixed", "freelancer"].includes(business.icpType) &&
        ![
          "primaryDecisionMaker",
          "mainPain",
          "mainOutcome",
          "ageRange",
        ].includes(key);
      const missing =
        value === null ||
        value === "" ||
        value === "unknown" ||
        value === "Pendiente";
      facts.push({
        key: group + "." + key,
        value,
        source: inferred ? "wizard" : "customer",
        status: missing ? "pending" : inferred ? "inferred" : "confirmed",
        recordedAt: now,
      });
    }
  }
  const channel = a.step5!.activeChannels.find((ch) => ch.useForProspecting);
  if (recommendations[0]?.id === "acquisition") {
    if (channel)
      recommendations[0].action +=
        " Empieza por el canal declarado: " +
        (channel.customName || channel.channel) +
        ".";
    if (c.budget === "none" || c.budget === "limited")
      recommendations[0].action +=
        " Prioriza captación orgánica y referidos con los recursos actuales.";
    recommendations[0].evidenceKeys.push(
      "step5.activeChannels",
      "context.budget",
    );
  }
  return {
    version,
    archetype,
    snapshotKey:
      c.goal === "retention" ? `retention-${archetype}` : `core-${archetype}`,
    pipelineStages: stages,
    generatedAt: now,
    customValues: {
      "10x_business_name": business.businessName,
      "10x_offer": business.oneLiner,
      "10x_ideal_customer":
        a.step3_b2b?.primaryDecisionMaker ?? "Consumidor final",
      "10x_primary_goal": c.target90Days,
      "10x_brand_voice": c.brandVoice,
      "10x_preserve": c.preserve,
    },
    workflows: [
      "Asignación y tarea interna para nuevo prospecto",
      ...(c.goal === "appointments" ? ["Seguimiento interno de citas"] : []),
      ...(c.goal === "retention"
        ? ["Tarea interna de revisión de renovación"]
        : []),
    ],
    modules,
    kpis: [...new Set(recommendations.map((r) => r.metric))],
    coreTest:
      c.goal === "retention"
        ? "Cliente de prueba → renovación prevista → tarea del responsable → resultado y métrica"
        : c.goal === "sales"
          ? "Formulario → contacto y oportunidad únicos → propuesta → decisión → conversión conciliada"
          : c.goal === "appointments"
            ? "Reserva → conflicto bloqueado → reprogramación/cancelación → métrica"
            : "Formulario público → contacto único → oportunidad → tarea interna → métrica; segundo envío sin duplicado",
    memory: {
      schemaVersion: 1,
      businessAccountId: id,
      facts,
      recommendations: recommendations.slice(0, 3),
      unknowns: [
        c.monthlyLeads === null ? "Volumen de prospectos" : "",
        c.conversionPercent === null ? "Conversión actual" : "",
        !c.channelResults ? "Resultados por canal" : "",
      ].filter(Boolean),
      agentPolicy: {
        crossAccountData: false,
        execution: "approval_required",
        paidAI: "disabled",
      },
    },
  };
}
