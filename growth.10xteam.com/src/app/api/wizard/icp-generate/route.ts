import { NextResponse } from "next/server";
import { generateWithAI } from "@/lib/ai/client";
import { calculateLocalICPScore } from "@/lib/utils/icp-score";
import type {
  ChannelType,
  ICPCard,
  Step3B2BAnswers,
  Step3B2CAnswers,
  WizardAnswers,
} from "@/types/wizard.types";

interface IcpGenerateRequestBody {
  businessId?: string;
  answers?: WizardAnswers;
}

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IcpGenerateRequestBody;

    if (!body.answers) {
      return NextResponse.json(
        { error: "Missing wizard answers payload." },
        { status: 400 }
      );
    }

    const { step2, step3_b2b, step3_b2c, step4, step5 } = body.answers;
    const step3 = step3_b2b ?? step3_b2c;

    if (!step2 || !step3 || !step4) {
      return NextResponse.json(
        {
          error:
            "Wizard answers are incomplete. step2, step3 and step4 are required.",
        },
        { status: 400 }
      );
    }

    let parsedAIFields: Partial<AIICPFields> | null = null;
    let warning: string | null = null;
    let aiMeta: { provider: string; model: string; usage: unknown } | null = null;

    try {
      const ai = await generateWithAI({
        task: "icp_generation",
        systemPrompt:
          "Eres estratega B2B senior. Devuelve solo JSON valido sin markdown.",
        userPrompt: `Genera los campos faltantes de un ICP card y responde SOLO este JSON exacto:\n{\n  "archetypeName": "",\n  "profileDescription": "",\n  "trigger": "",\n  "topFear": "",\n  "previousSolutionsTried": "",\n  "promise": "",\n  "uniqueMechanism": ""\n}\n\nContexto del wizard:\n${JSON.stringify(
          {
            step2,
            step3,
            step4,
            step5,
          },
          null,
          2
        )}`,
        businessId: body.businessId,
        metadata: { source: "wizard_icp_generate" },
      });

      parsedAIFields = safeParseAIFields(ai.content);
      aiMeta = {
        provider: ai.provider,
        model: ai.model,
        usage: ai.usage,
      };

      if (!parsedAIFields) {
        warning = "AI response could not be parsed; using fallback values.";
      }
    } catch (error) {
      warning =
        error instanceof Error
          ? error.message
          : "AI generation failed; using fallback values.";
    }

    const score = calculateLocalICPScore(body.answers);
    const now = new Date().toISOString();

    const card: ICPCard = {
      version: 1,
      archetypeName:
        parsedAIFields?.archetypeName ||
        `${step2.industry} - ${resolvePrimaryDecisionMaker(step3)}`,
      profileDescription:
        parsedAIFields?.profileDescription ||
        `Perfil enfocado en ${resolvePrimaryDecisionMaker(step3)} que necesita resolver ${step3.mainPain.toLowerCase()} para lograr ${step3.mainOutcome.toLowerCase()}.`,
      primaryDecisionMaker: resolvePrimaryDecisionMaker(step3),
      secondaryInfluencers: isStep3B2B(step3) ? step3.secondaryInfluencers : [],
      trigger:
        parsedAIFields?.trigger ||
        `Cuando ${step3.mainPain.toLowerCase()} afecta conversion o ingresos.`,
      mainPain: step3.mainPain,
      costOfInaction: step3.costOfInaction,
      topFear:
        parsedAIFields?.topFear ||
        "Seguir invirtiendo sin lograr pipeline predecible.",
      previousSolutionsTried:
        parsedAIFields?.previousSolutionsTried ||
        "Acciones tacticas aisladas sin sistema de seguimiento.",
      uniqueMechanism:
        parsedAIFields?.uniqueMechanism || step4.uniqueDifferentiator,
      channels:
        step5?.activeChannels?.length
          ? step5.activeChannels.map((channel) => channel.channel)
          : DEFAULT_CHANNELS,
      promise: parsedAIFields?.promise || step3.mainOutcome,
      antiICP: step4.antiICP,
      highRiskICP: step4.highRiskICP,
      economicProfile: {
        investmentRange: step3.typicalInvestmentRange,
        budgetType: resolveBudgetType(step3),
        decisionAuthority: resolveDecisionAuthority(step3),
      },
      icpScore: score,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({
      icpCard: card,
      warning,
      ai: aiMeta,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not generate ICP card." },
      { status: 500 }
    );
  }
}

function safeParseAIFields(raw: string): Partial<AIICPFields> | null {
  try {
    const normalized = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return JSON.parse(normalized) as Partial<AIICPFields>;
  } catch {
    return null;
  }
}

function isStep3B2B(value: Step3B2BAnswers | Step3B2CAnswers): value is Step3B2BAnswers {
  return "primaryDecisionMaker" in value;
}

function resolvePrimaryDecisionMaker(step3: Step3B2BAnswers | Step3B2CAnswers): string {
  if (isStep3B2B(step3)) return step3.primaryDecisionMaker;
  return "Consumidor final";
}

function resolveBudgetType(step3: Step3B2BAnswers | Step3B2CAnswers): string {
  if (isStep3B2B(step3)) return step3.budgetType;
  return step3.paysFromOwnPocket ? "personal" : "business";
}

function resolveDecisionAuthority(step3: Step3B2BAnswers | Step3B2CAnswers): string {
  if (isStep3B2B(step3)) return step3.decisionAuthority;
  return "alone";
}
