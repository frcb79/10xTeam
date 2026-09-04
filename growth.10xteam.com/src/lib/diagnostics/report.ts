import { generateWithAI } from "@/lib/ai/client";
import { generateICPCard } from "@/lib/diagnostics/icp";
import { upsertDiagnosticRecord } from "@/lib/diagnostics/repository";
import { calculateOpportunity } from "@/lib/utils/opportunity";
import type { DiagnosticNarratives, DiagnosticRecord, DiagnosticReport } from "@/types/diagnostic.types";
import type { GeneratedOutputs, WizardAnswers } from "@/types/wizard.types";

const NARRATIVE_QUALITY_REFERENCE = `Referencia de tono y profundidad, no de contenido para copiar:
- Buyer persona: "Laura empieza el día revisando WhatsApp antes de levantarse. Administra una empresa familiar con 22 empleados y dos hijos en universidad. No le falta dinero: le falta tiempo y le sobra preocupación por su imagen."
- Creencia: "El resultado va a verse natural; no van a darse cuenta." Se construye con casos antes/después de perfiles similares y la señal es que guarda o comparte ese caso.`;

const NARRATIVE_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    executiveSummary: { type: "string", description: "Non-empty executive summary sized to the specific evidence available in the diagnostic." },
    buyerPersona: {
      type: "object",
      properties: {
        name: { type: "string", description: "Non-empty plausible fictional name." },
        role: { type: "string", description: "Non-empty buyer role." },
        dayInLife: { type: "string", description: "Non-empty narrative scene sized to the evidence available in the diagnostic." },
        unspokenThought: { type: "string", description: "Non-empty first-person thought grounded in the diagnostic." },
        influences: { type: "string", description: "Non-empty description grounded in the diagnostic." },
        twelveMonthVision: { type: "string", description: "Non-empty description grounded in the diagnostic." },
      },
      required: ["name", "role", "dayInLife", "unspokenThought", "influences", "twelveMonthVision"],
      additionalProperties: false,
    },
    beliefMap: {
      type: "array",
      items: {
        type: "object",
        properties: {
          belief: { type: "string", description: "Non-empty buyer belief grounded in the diagnostic." },
          asset: { type: "string", description: "Non-empty concrete asset grounded in the diagnostic." },
          signal: { type: "string", description: "Non-empty observable buyer action grounded in the diagnostic." },
        },
        required: ["belief", "asset", "signal"],
        additionalProperties: false,
      },
    },
    voice: {
      type: "object",
      properties: {
        whatsapp: { type: "string", description: "Non-empty conversational WhatsApp message grounded in the diagnostic." },
        instagramHook: { type: "string", description: "Non-empty social hook grounded in the diagnostic." },
        instagramCaption: { type: "string", description: "Non-empty human social caption grounded in the diagnostic." },
        emailSubject: { type: "string", description: "Non-empty natural email subject grounded in the diagnostic." },
        emailBody: { type: "string", description: "Non-empty personal email grounded in the diagnostic." },
        reelScript: { type: "string", description: "Non-empty reel script with scene, on-screen text and useful turn grounded in the diagnostic." },
      },
      required: ["whatsapp", "instagramHook", "instagramCaption", "emailSubject", "emailBody", "reelScript"],
      additionalProperties: false,
    },
  },
  required: ["executiveSummary", "buyerPersona", "beliefMap", "voice"],
  additionalProperties: false,
} as const;

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
      task: "diagnostic_narratives",
      systemPrompt: "Eres estratega de crecimiento y editor de marca senior. Devuelve solo JSON valido, en espanol mexicano, concreto y sin promesas no verificables. Tu estándar es un diagnóstico que suena investigado y escrito por una persona, nunca como una plantilla de IA o un manual de ventas. Antes de responder, revisa en silencio que cada campo cumpla las reglas y reescribe los que podrían aplicarse sin cambios a cualquier PyME.",
      outputSchema: NARRATIVE_OUTPUT_SCHEMA,
      userPrompt: `Crea narrativas para un diagnóstico comercial usando exactamente este JSON: {"executiveSummary":"","buyerPersona":{"name":"","role":"","dayInLife":"","unspokenThought":"","influences":"","twelveMonthVision":""},"beliefMap":[{"belief":"","asset":"","signal":""}],"voice":{"whatsapp":"","instagramHook":"","instagramCaption":"","emailSubject":"","emailBody":"","reelScript":""}}. Genera exactamente 8 elementos en beliefMap.

    Reglas obligatorias:
    1. Nunca repitas la misma oración textual en dos secciones. Si una idea central aparece en resumen ejecutivo, buyer persona, belief map, voz o cualquier otro campo, exprésala con lenguaje distinto y desde el propósito de esa sección.
    2. Para cada una de las 8 creencias, usa específicamente industria, mainPain, mainPainConsequences y antiICP. Cada creencia debe sonar como un pensamiento de este prospecto, no como una lección universal de ventas. Cubre estos ocho ángulos, uno por fila y en este orden: (1) el costo cotidiano del dolor, (2) la consecuencia operativa declarada, (3) por qué fallaron las alternativas o competidores nombrados, (4) la tarea o punto de fricción que debe cambiar, (5) el costo de no actuar usando solo los datos disponibles, (6) una prueba concreta del mecanismo diferenciador, (7) la objeción económica declarada, (8) la condición de confianza para decidir excluyendo al anti-ICP. Cada activo debe nombrar una pieza concreta y útil para esta industria, por ejemplo una auditoría de conversaciones, una captura de un proceso, un guion o una comparación con las herramientas declaradas; cada señal debe ser una acción observable del prospecto. No escribas "estadísticas", "casos de éxito", "artículos", "testimonios" o "comparativas" sin especificar qué caso, pregunta, escena, dato o prueba contienen. Prohibido usar generalidades como "integrar procesos", "mejorar el rendimiento", "solución integral", "capacitación esencial", "crecimiento sostenido" o "seguimiento efectivo" salvo que el contexto las vuelva concretas.
    3. Buyer persona: el nombre debe ser ficticio y plausible, nunca el nombre del dueño, contacto o usuario del wizard. En dayInLife escribe una escena de 3 a 5 oraciones con al menos dos detalles observables del contexto: industria, herramienta/canal declarado, momento del día, interacción, tarea o frustración reciente. Incluye tensión humana y una consecuencia de mainPainConsequences. Evita el esqueleto "revisa el pipeline y pierde oportunidades". No inventes datos biográficos, cifras, clientes, credenciales o situaciones específicas que el contexto no permita inferir razonablemente.
    4. Voz: whatsapp, post social (instagramHook e instagramCaption), email y reel deben sonar como mensajes reales de una persona a otra. Ancla cada pieza a una situación concreta distinta extraída del diagnóstico: una tarea manual, canal, competidor, consecuencia, objeción o decisión del comprador. No reutilices la misma pregunta o argumento entre canales. No uses emojis de venta, exceso de signos de exclamación, hashtags genéricos, frases como "descubre cómo optimizar", "no dejes que", "cambiarlo todo", "buen seguimiento", "sistema integrado" o llamados publicitarios vacíos. El WhatsApp debe abrir una conversación sobre una situación puntual; el post debe partir de una observación que el comprador reconocería; el email debe incluir un asunto natural y un mensaje breve que parezca escrito uno a uno; el reel debe indicar una escena, texto en pantalla y giro útil, no sólo una pregunta retórica.
    5. No copies literalmente ni la referencia ni el contexto. Usa la referencia solo para igualar profundidad, especificidad y naturalidad.
    6. Control final silencioso: completa todos los campos con texto; entrega exactamente ocho creencias; ninguna oración completa debe repetirse entre executiveSummary, buyerPersona, beliefMap y voice; cada creencia debe mencionar o implicar un detalle exclusivo del contexto; y elimina cualquier frase que funcione igual para una clínica, restaurante, despacho y consultoría.
    7. La longitud de cada sección debe reflejar la cantidad de información específica disponible en las respuestas del wizard, no un conteo de palabras fijo. Con pocos datos, sé breve y honesto: no rellenes con texto genérico. Con datos ricos, cubre todo el detalle disponible aunque la sección sea más larga que el ejemplo de referencia. No gastes el espacio repitiendo el contexto ni explicando tus decisiones.

    ${NARRATIVE_QUALITY_REFERENCE}

    Contexto del diagnóstico:
    ${JSON.stringify({ icpCard, answers, opportunity })}`,
      businessId,
      metadata: { source: "diagnostic_report_narratives" },
    });
    return parseNarratives(response.content, fallback);
  } catch (error) {
    console.error(
      "Diagnostic narrative generation failed:",
      error instanceof Error ? error.message : "Unknown AI generation error",
    );
    return fallback;
  }
}

function parseNarratives(raw: string, fallback: DiagnosticNarratives): DiagnosticNarratives {
  try {
    const normalized = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const start = normalized.indexOf("{");
    const end = normalized.lastIndexOf("}");
    const json = start >= 0 && end > start ? normalized.slice(start, end + 1) : normalized;
    const parsed = JSON.parse(json) as Partial<DiagnosticNarratives>;
    if (!parsed.buyerPersona || !Array.isArray(parsed.beliefMap) || !parsed.voice) {
      console.error("Diagnostic narrative response did not match the expected JSON shape.");
      return fallback;
    }
    return {
      executiveSummary: parsed.executiveSummary || fallback.executiveSummary,
      buyerPersona: { ...fallback.buyerPersona, ...parsed.buyerPersona },
      beliefMap: parsed.beliefMap.length ? parsed.beliefMap.slice(0, 8).map((item, index) => ({ ...fallback.beliefMap[index], ...item })) : fallback.beliefMap,
      voice: { ...fallback.voice, ...parsed.voice },
    };
  } catch (error) {
    console.error(
      "Diagnostic narrative response could not be parsed:",
      error instanceof Error ? error.message : "Unknown JSON parse error",
    );
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