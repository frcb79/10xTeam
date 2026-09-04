import { generateWithAI } from "@/lib/ai/client";
import { calculateLocalICPScore } from "@/lib/utils/icp-score";
import type {
  ChannelType,
  ICPCard,
  Step3B2BAnswers,
  Step3B2CAnswers,
  WizardAnswers,
} from "@/types/wizard.types";

interface AIICPFields {
  archetypeName: string;
  profileDescription: string;
  trigger: string;
  topFear: string;
  previousSolutionsTried: string;
  promise: string;
  uniqueMechanism: string;
}

const DEFAULT_CHANNELS: ChannelType[] = ["linkedin", "whatsapp", "email"];

export async function generateICPCard(answers: WizardAnswers, businessId?: string): Promise<{
  icpCard: ICPCard;
  warning: string | null;
  ai: { provider: string; model: string; usage: unknown } | null;
}> {
  const { step2, step3_b2b, step3_b2c, step4, step5 } = answers;
  const step3 = step3_b2b ?? step3_b2c;

  if (!step2 || !step3 || !step4) {
    throw new Error("Wizard answers are incomplete. step2, step3 and step4 are required.");
  }

  let parsedAIFields: Partial<AIICPFields> | null = null;
  let warning: string | null = null;
  let ai: { provider: string; model: string; usage: unknown } | null = null;

  try {
    const response = await generateWithAI({
      task: "icp_generation",
      systemPrompt:
        "Eres estratega B2B senior especializado en investigación de compradores. Escribe en español mexicano natural y específico. No inventes cifras, resultados, credenciales ni situaciones que no estén sustentadas por el contexto. Responde exclusivamente con JSON válido: sin markdown, sin texto adicional y sin bloques de código.",
      userPrompt: `Genera los campos estratégicos faltantes del ICP Card. Responde exactamente con este objeto JSON y completa todas las cadenas:\n{"archetypeName":"","profileDescription":"","trigger":"","topFear":"","previousSolutionsTried":"","promise":"","uniqueMechanism":""}\n\nReglas de calidad:\n- Ancla cada campo a la industria, el dolor principal, sus consecuencias, el anti-ICP, las objeciones y los canales declarados. Evita frases intercambiables como "pipeline predecible", "mejorar ventas" o "sistema integral" si el contexto no las concreta.\n- No repitas una misma oración textual en dos campos. Cada campo debe aportar un ángulo distinto del comprador y del negocio.\n- La promesa debe expresar el resultado declarado en palabras naturales, sin convertirla en un slogan genérico ni añadir porcentajes o plazos no proporcionados.\n\nContexto del wizard:\n${JSON.stringify({ step2, step3, step4: { ...step4, mainCompetitors: step4.mainCompetitors.slice(0, 10) }, step5 })}`,
      businessId,
      metadata: { source: "diagnostic_report" },
    });
    parsedAIFields = safeParseAIFields(response.content);
    ai = { provider: response.provider, model: response.model, usage: response.usage };
    if (!parsedAIFields) warning = "AI response could not be parsed; using fallback values.";
  } catch (error) {
    warning = error instanceof Error ? error.message : "AI generation failed; using fallback values.";
    console.error("Diagnostic ICP generation failed:", warning);
  }

  const now = new Date().toISOString();
  return {
    icpCard: {
      version: 1,
      archetypeName: parsedAIFields?.archetypeName || `${step2.industry} - ${resolvePrimaryDecisionMaker(step3)}`,
      profileDescription: parsedAIFields?.profileDescription || `Perfil enfocado en ${resolvePrimaryDecisionMaker(step3)} que necesita resolver ${step3.mainPain.toLowerCase()} para lograr ${step3.mainOutcome.toLowerCase()}.`,
      primaryDecisionMaker: resolvePrimaryDecisionMaker(step3),
      secondaryInfluencers: isStep3B2B(step3) ? step3.secondaryInfluencers : [],
      trigger: parsedAIFields?.trigger || `Cuando ${step3.mainPain.toLowerCase()} afecta conversion o ingresos.`,
      mainPain: step3.mainPain,
      costOfInaction: step3.costOfInaction,
      topFear: parsedAIFields?.topFear || "Seguir invirtiendo sin lograr pipeline predecible.",
      previousSolutionsTried: parsedAIFields?.previousSolutionsTried || "Acciones tacticas aisladas sin sistema de seguimiento.",
      uniqueMechanism: parsedAIFields?.uniqueMechanism || step4.uniqueDifferentiator,
      channels: step5?.activeChannels?.length ? step5.activeChannels.map((channel) => channel.channel) : DEFAULT_CHANNELS,
      promise: parsedAIFields?.promise || step3.mainOutcome,
      antiICP: step4.antiICP,
      highRiskICP: step4.highRiskICP,
      economicProfile: {
        investmentRange: step3.typicalInvestmentRange,
        budgetType: isStep3B2B(step3) ? step3.budgetType : step3.paysFromOwnPocket ? "personal" : "business",
        decisionAuthority: isStep3B2B(step3) ? step3.decisionAuthority : "alone",
      },
      icpScore: calculateLocalICPScore(answers),
      createdAt: now,
      updatedAt: now,
    },
    warning,
    ai,
  };
}

function safeParseAIFields(raw: string): Partial<AIICPFields> | null {
  try {
    return JSON.parse(raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim()) as Partial<AIICPFields>;
  } catch {
    return null;
  }
}

function isStep3B2B(value: Step3B2BAnswers | Step3B2CAnswers): value is Step3B2BAnswers {
  return "primaryDecisionMaker" in value;
}

function resolvePrimaryDecisionMaker(step3: Step3B2BAnswers | Step3B2CAnswers): string {
  return isStep3B2B(step3) ? step3.primaryDecisionMaker : "Consumidor final";
}