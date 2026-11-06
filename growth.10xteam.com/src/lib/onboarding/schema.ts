import { z } from "zod";

const text = z.string().trim().max(4000);
const short = z.string().trim().max(200);
const list = z.array(short).max(30);
const channel = z.enum([
  "whatsapp",
  "linkedin",
  "instagram",
  "facebook",
  "email",
  "youtube",
  "tiktok",
  "twitter",
  "custom",
]);
const b2b = z.object({
  primaryDecisionMaker: short,
  secondaryInfluencers: z
    .array(
      z.object({
        role: short,
        influence: z.enum(["high", "medium", "low"]),
        keyArgument: text,
      }),
    )
    .max(10),
  companySizeRange: z.enum([
    "1-5",
    "6-20",
    "21-50",
    "51-200",
    "201-500",
    "500+",
  ]),
  targetIndustry: short,
  geographyPriority: short,
  mainPain: text,
  mainPainConsequences: text,
  costOfInaction: text,
  costOfInactionAmount: short,
  mainOutcome: text,
  outcomeTimeline: short,
  typicalInvestmentRange: short,
  budgetType: z.enum(["personal", "business", "both"]),
  decisionAuthority: z.enum(["alone", "needs_approval", "committee"]),
});
const b2c = z.object({
  ageRange: short,
  lifeStage: list,
  incomeLevel: short,
  geography: short,
  mainPain: text,
  mainDesire: text,
  costOfInaction: text,
  mainOutcome: text,
  outcomeTimeline: short,
  typicalInvestmentRange: short,
  paysFromOwnPocket: z.boolean(),
});
export const answersSchema = z.object({
  step2: z
    .object({
      businessName: short.min(2),
      oneLiner: text.min(8),
      industry: short.min(1),
      industrySubcategory: short,
      icpType: z.enum(["b2b", "b2c", "mixed", "freelancer"]),
      productType: short,
      revenueModel: short,
      priceRange: short,
      marginBand: short,
      purchaseFrequency: short,
    })
    .nullable(),
  step3_b2b: b2b.nullable(),
  step3_b2c: b2c.nullable(),
  step4: z
    .object({
      salesCycleDuration: z.enum([
        "same_day",
        "1-7_days",
        "1-4_weeks",
        "1-3_months",
        "3+_months",
      ]),
      salesCycleNotes: text,
      topObjection: text,
      topObjectionResolution: text,
      antiICP: text,
      highRiskICP: text,
      mainCompetitors: list,
      whyChoseUs: text,
      whyCompetitorsFail: text,
      uniqueDifferentiator: text,
    })
    .nullable(),
  step5: z
    .object({
      activeChannels: z
        .array(
          z.object({
            channel,
            customName: short.optional(),
            activityLevel: z.enum(["high", "medium", "low"]),
            useForProspecting: z.boolean(),
            useForContent: z.boolean(),
          }),
        )
        .max(15),
      preferredContactMethod: channel,
      contentFormats: z
        .array(
          z.enum([
            "text",
            "short_video",
            "long_video",
            "images",
            "documents",
            "podcast",
          ]),
        )
        .max(6),
      selectedFlows: z
        .array(
          z.enum([
            "cold_prospect",
            "warm_prospect",
            "referral",
            "info_requested_no_response",
            "proposal_seen_disappeared",
            "attended_demo",
            "has_objections",
            "ready_to_close",
            "new_client",
            "active_client",
            "at_risk_client",
            "wants_to_cancel",
            "churned_client",
            "referral_program",
            "custom",
          ]),
        )
        .max(15),
      customFlows: z
        .array(
          z.object({
            name: short,
            description: text,
            contactStage: short,
            goalWithMaterials: text,
          }),
        )
        .max(10),
    })
    .nullable(),
  step6: z
    .object({
      ownerRole: z.enum(["owner_operator", "has_team", "uses_agencies"]),
      manualMarketingHours: z.enum([
        "less_2hrs",
        "2_5hrs",
        "5_10hrs",
        "more_10hrs",
      ]),
      leadResponseTime: z.enum([
        "under_5min",
        "5_30min",
        "30min_2hrs",
        "more_2hrs",
      ]),
      productDescription: text,
      clientValue: short,
      ownerName: short.min(2),
      ownerEmail: z.string().email().max(254),
      ownerPhone: short,
      saleType: z.enum([
        "one_time",
        "monthly_recurring",
        "annual_recurring",
        "package_renewal",
        "mixed",
      ]),
      renewalFrequency: z
        .enum(["weekly", "monthly", "quarterly", "semiannual", "annual"])
        .nullable(),
      monthlyNewClients: z.enum(["1_3", "4_10", "11_20", "20_plus"]),
      activeClients: short,
      acquisitionCost: z.enum([
        "under_500",
        "500_2000",
        "2000_8000",
        "over_8000",
        "unknown",
      ]),
      grossMargin: z.enum([
        "under_20",
        "20_40",
        "40_60",
        "over_60",
        "prefer_not_say",
      ]),
    })
    .nullable(),
});

export const moduleIds = [
  "crm",
  "forms",
  "calendar",
  "email",
  "whatsapp",
  "social",
  "payments",
  "ai",
] as const;
export const moduleIdSchema = z.enum(moduleIds);
export type ModuleId = (typeof moduleIds)[number];
export const modeSchema = z.enum([
  "keep",
  "connect",
  "migrate",
  "create",
  "defer",
]);
export type ModuleMode = z.infer<typeof modeSchema>;
export const contextSchema = z
  .object({
    goal: z.enum(["leads", "sales", "appointments", "retention"]),
    target90Days: text.min(5),
    monthlyLeads: z.number().int().min(0).max(1e7).nullable(),
    conversionPercent: z.number().min(0).max(100).nullable(),
    bottleneck: z.enum([
      "demand",
      "followup",
      "closing",
      "no_shows",
      "retention",
      "unknown",
    ]),
    channelResults: text,
    tools: text,
    preserve: text.min(2),
    brandVoice: text,
    contentCadence: text,
    budget: z.enum(["none", "limited", "available", "unknown"]),
    capacity: short,
    restrictions: text,
    sharedSocialIdentity: z.boolean(),
    calendarHosts: text,
    country: z.enum(["MX", "US"]),
    timezone: short.refine((v) => {
      try {
        new Intl.DateTimeFormat("es", { timeZone: v });
        return true;
      } catch {
        return false;
      }
    }, "Zona horaria inválida"),
    currency: z.enum(["MXN", "USD"]),
    language: z.enum(["es", "en"]),
    websiteUrl: z.union([
      z.literal(""),
      z
        .string()
        .url()
        .max(2048)
        .refine((v) => new URL(v).protocol === "https:", "Usa https"),
    ]),
    requiredChannels: z
      .array(z.enum(["email", "whatsapp", "social", "payments", "ai"]))
      .max(5),
  })
  .superRefine((v, ctx) => {
    if (v.goal === "appointments" && !v.calendarHosts.trim())
      ctx.addIssue({
        code: "custom",
        path: ["calendarHosts"],
        message: "Indica quién atiende las citas y sus horarios.",
      });
  });
export type BusinessContext = z.infer<typeof contextSchema>;
export const defaultContext: BusinessContext = {
  goal: "leads",
  target90Days: "",
  monthlyLeads: null,
  conversionPercent: null,
  bottleneck: "unknown",
  channelResults: "",
  tools: "",
  preserve: "",
  brandVoice: "",
  contentCadence: "",
  budget: "unknown",
  capacity: "",
  restrictions: "",
  sharedSocialIdentity: false,
  calendarHosts: "",
  country: "MX",
  timezone: "America/Mexico_City",
  currency: "MXN",
  language: "es",
  websiteUrl: "",
  requiredChannels: [],
};

export const draftSchema = z.object({
  currentStep: z.number().int().min(1).max(6),
  answers: answersSchema,
  websiteUrl: z.string().max(2048).nullable().optional(),
  context: contextSchema.optional(),
});
export type OnboardingDraft = z.infer<typeof draftSchema>;
export const emptyDraft: OnboardingDraft = {
  currentStep: 1,
  answers: {
    step2: null,
    step3_b2b: null,
    step3_b2c: null,
    step4: null,
    step5: null,
    step6: null,
  },
};

export function requireCompleteAnswers(value: unknown) {
  const answers = answersSchema.parse(value);
  const type = answers.step2?.icpType;
  if (
    !answers.step2 ||
    !answers.step4 ||
    !answers.step5 ||
    !answers.step6 ||
    ((type === "b2b" || type === "mixed") && !answers.step3_b2b) ||
    ((type === "b2c" || type === "freelancer") && !answers.step3_b2c)
  ) {
    throw new Error("Completa los pasos del diagnóstico antes de continuar.");
  }
  // Ignore stale answers from a previously selected business type.
  return {
    ...answers,
    step3_b2b:
      type === "b2c" || type === "freelancer" ? null : answers.step3_b2b,
    step3_b2c: type === "b2b" ? null : answers.step3_b2c,
  };
}
