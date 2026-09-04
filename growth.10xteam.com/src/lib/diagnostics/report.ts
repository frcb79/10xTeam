import { generateWithAI } from "@/lib/ai/client";
import { generateICPCard } from "@/lib/diagnostics/icp";
import { upsertDiagnosticRecord } from "@/lib/diagnostics/repository";
import { calculateOpportunity } from "@/lib/utils/opportunity";
import type { DiagnosticNarratives, DiagnosticRecord, DiagnosticReport } from "@/types/diagnostic.types";
import type { GeneratedOutputs, WizardAnswers } from "@/types/wizard.types";

export async function generateDiagnosticReport(
  answers: WizardAnswers,
  businessId?: string,
  generatedOutputs?: GeneratedOutputs | null,
): Promise<DiagnosticRecord> {
  if (!answers.step2 || !answers.step6) {
    throw new Error("Wizard answers are incomplete. step2 and step6 are required.");
  }

  const { icpCard } = await generateICPCard(answers, businessId);
  const opportunity = calculateOpportunity(answers.step6, answers.step2.priceRange);
  if (!opportunity) throw new Error("Could not calculate the business opportunity.");

  const now = new Date().toISOString();
  const report: DiagnosticReport = {
    id: `diag_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    createdAt: now,
    answers,
    icpCard,
    opportunity,
    generatedOutputs: generatedOutputs ?? null,
    narratives: await generateNarratives(icpCard, answers, opportunity, businessId),
  };

  const record: DiagnosticRecord = {
    id: report.id,
    status: "wizard_completed",
    createdAt: now,
    contact: {
      name: answers.step6.ownerName,
      email: answers.step6.ownerEmail,
      phone: answers.step6.ownerPhone,
    },
    businessName: answers.step2.businessName,
    industry: answers.step2.industry,
    oneLiner: answers.step2.oneLiner,
    icpSummary: {
      profile: icpCard.primaryDecisionMaker,
      pain: icpCard.mainPain,
      outcome: icpCard.promise,
    },
    mechanismSummary: {
      objection: answers.step4?.topObjection ?? "Pendiente",
      differentiator: icpCard.uniqueMechanism,
    },
    channels: icpCard.channels,
    estimatedOpportunityMonthly: String(Math.round(opportunity.totalMonthly)),
    sourceState: { icpScore: icpCard.icpScore },
    report,
  };

  const persisted = await upsertDiagnosticRecord(record);
  if (!persisted) throw new Error("Could not persist the diagnostic report.");
  return record;
}

async function generateNarratives(
  icpCard: DiagnosticReport["icpCard"],
  answers: WizardAnswers,
  opportunity: DiagnosticReport["opportunity"],
  businessId?: string,
): Promise<DiagnosticNarratives> {
  const fallback = createFallbackNarratives(icpCard, answers, opportunity);

  try {
    const response = await generateWithAI({
      // This task is routed to Gemini Flash in AI_DEV_MODE through the existing config.
      task: "posts_monthly",
      systemPrompt: "Eres estratega de crecimiento senior. Devuelve solo JSON valido, en espanol mexicano, concreto y sin promesas no verificables.",
      userPrompt: `Crea narrativas para un diagnostico comercial usando exactamente este JSON: {"executiveSummary":"","buyerPersona":{"name":"","role":"","dayInLife":"","unspokenThought":"","influences":"","twelveMonthVision":""},"beliefMap":[{"belief":"","asset":"","signal":""}],"voice":{"whatsapp":"","instagramHook":"","instagramCaption":"","emailSubject":"","emailBody":"","reelScript":""}}. Genera 8 elementos en beliefMap. Contexto: ${JSON.stringify({ icpCard, answers, opportunity })}`,
      businessId,
      metadata: { source: "diagnostic_report_narratives" },
    });
    return parseNarratives(response.content, fallback);
  } catch {
    return fallback;
  }
}

function parseNarratives(raw: string, fallback: DiagnosticNarratives): DiagnosticNarratives {
  try {
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim()) as Partial<DiagnosticNarratives>;
    if (!parsed.buyerPersona || !Array.isArray(parsed.beliefMap) || !parsed.voice) return fallback;
    return {
      executiveSummary: parsed.executiveSummary || fallback.executiveSummary,
      buyerPersona: { ...fallback.buyerPersona, ...parsed.buyerPersona },
      beliefMap: parsed.beliefMap.length ? parsed.beliefMap.slice(0, 8).map((item, index) => ({ ...fallback.beliefMap[index], ...item })) : fallback.beliefMap,
      voice: { ...fallback.voice, ...parsed.voice },
    };
  } catch {
    return fallback;
  }
}

function createFallbackNarratives(
  icpCard: DiagnosticReport["icpCard"],
  answers: WizardAnswers,
  opportunity: DiagnosticReport["opportunity"],
): DiagnosticNarratives {
  const business = answers.step2?.businessName ?? "tu negocio";
  const product = answers.step6?.productDescription ?? "tu oferta";
  const channels = icpCard.channels.join(", ") || "los canales prioritarios";
  const buyer = icpCard.primaryDecisionMaker;
  const beliefMap = [
    ["El problema actual tiene un costo real y no debe seguir posponiéndose.", `Contenido que muestra el costo mensual de $${Math.round(opportunity.totalMonthly).toLocaleString("es-MX")} MXN.`, "Solicita entender el impacto en su negocio."],
    ["Las soluciones que probó antes no resolvieron la causa de fondo.", `Explicación de por qué ${icpCard.previousSolutionsTried.toLowerCase()}`, "Compara su proceso actual con una alternativa."],
    [`${product} es una ruta viable para lograr ${icpCard.promise.toLowerCase()}.`, "Caso de uso y diagnóstico inicial.", "Pregunta cómo aplicaría a su caso."],
    [`El mecanismo ${icpCard.uniqueMechanism} reduce el riesgo de actuar.`, "Demostración del proceso y sus etapas.", "Pide ver cómo funciona."],
    ["El resultado esperado es alcanzable con una ejecución consistente.", "Prueba social y casos comparables.", "Pregunta por resultados concretos."],
    ["El proceso puede implementarse sin complicar la operación.", "Checklist de activación y acompañamiento.", "Acepta revisar el plan de inicio."],
    ["La inversión se justifica frente al costo de no actuar.", "Calculadora de oportunidad y plan de retorno.", "Pide opciones de implementación."],
    [`${business} entiende su contexto y puede acompañar la decisión.`, "Llamada de activación con diagnóstico aplicado.", "Agenda una conversación."],
  ].map(([belief, asset, signal]) => ({ belief, asset, signal }));

  return {
    executiveSummary: `${business} puede convertir mejor su demanda actual si ordena el seguimiento alrededor de ${icpCard.mainPain.toLowerCase()}. La oportunidad estimada es de $${Math.round(opportunity.totalMonthly).toLocaleString("es-MX")} MXN al mes al reducir fuga y activar crecimiento de forma consistente.`,
    buyerPersona: {
      name: buyer.split(" ")[0] || "Cliente ideal",
      role: buyer,
      dayInLife: `Opera con poco margen para tareas manuales y necesita resolver ${icpCard.mainPain.toLowerCase()} sin sumar complejidad al equipo.`,
      unspokenThought: `Quiere ${icpCard.promise.toLowerCase()}, pero teme ${icpCard.topFear.toLowerCase()}`,
      influences: `Evalúa opciones por ${channels}, evidencia relevante y una explicación clara de por qué ${icpCard.uniqueMechanism.toLowerCase()} funciona.`,
      twelveMonthVision: `Busca una operación comercial más predecible y la capacidad de ${icpCard.promise.toLowerCase()} sin depender de improvisación.`,
    },
    beliefMap,
    voice: {
      whatsapp: `Hola, gracias por escribir a ${business}. Vimos que buscas resolver ${icpCard.mainPain.toLowerCase()}. ¿Te comparto cómo trabajamos ${icpCard.uniqueMechanism.toLowerCase()} para ayudarte a ${icpCard.promise.toLowerCase()}?`,
      instagramHook: `El costo de seguir con ${icpCard.mainPain.toLowerCase()}`,
      instagramCaption: `No se trata de hacer más por hacer más. Se trata de resolver ${icpCard.mainPain.toLowerCase()} con un proceso que te acerque a ${icpCard.promise.toLowerCase()}.`,
      emailSubject: `Una forma clara de avanzar hacia ${icpCard.promise.toLowerCase()}`,
      emailBody: `Hola, sabemos que ${icpCard.mainPain.toLowerCase()} puede frenar decisiones importantes. En ${business} ayudamos a crear una ruta clara con ${icpCard.uniqueMechanism.toLowerCase()}. ¿Tiene sentido revisarlo en una llamada breve?`,
      reelScript: `0-3s: ${icpCard.mainPain}. 4-15s: Explica por qué ocurre. 16-25s: Presenta ${icpCard.uniqueMechanism}. 26-30s: Invita a conocer la ruta para ${icpCard.promise.toLowerCase()}.`,
    },
  };
}