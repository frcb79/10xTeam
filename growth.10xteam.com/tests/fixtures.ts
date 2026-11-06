import type { WizardAnswers } from "../src/types/wizard.types";
import { defaultContext } from "../src/lib/onboarding/schema";
import { buildPlan } from "../src/lib/onboarding/plan";
import type { Actor, OnboardingSession } from "../src/lib/onboarding/model";
import type { SnapshotRelease } from "../src/lib/onboarding/provision";
export const owner = "00000000-0000-4000-8000-000000000001";
export const other = "00000000-0000-4000-8000-000000000002";
export const ba = "10000000-0000-4000-8000-000000000001";
export const actor: Actor = { userId: owner, guestHash: null, operator: false };
export const answers: WizardAnswers = {
  step2: {
    businessName: "Taller Nube QA",
    oneLiner:
      "Implementamos sistemas de inventario para pequeños distribuidores.",
    industry: "tecnologia",
    industrySubcategory: "",
    icpType: "b2b",
    productType: "servicio",
    revenueModel: "venta_unica",
    priceRange: "10000_50000",
    marginBand: "40_60",
    purchaseFrequency: "anual",
  },
  step3_b2b: {
    primaryDecisionMaker: "Dirección de operaciones",
    secondaryInfluencers: [],
    companySizeRange: "6-20",
    targetIndustry: "Distribución",
    geographyPriority: "México",
    mainPain: "No conocen el inventario disponible para comprometer entregas.",
    mainPainConsequences: "Cancelaciones",
    costOfInaction: "Pérdida de pedidos",
    costOfInactionAmount: "Pendiente",
    mainOutcome: "Saber qué se puede entregar antes de cotizar",
    outcomeTimeline: "90 días",
    typicalInvestmentRange: "Pendiente",
    budgetType: "business",
    decisionAuthority: "needs_approval",
  },
  step3_b2c: null,
  step4: {
    salesCycleDuration: "1-3_months",
    salesCycleNotes: "",
    topObjection: "Tiempo de implantación",
    topObjectionResolution: "Prueba de alcance",
    antiICP: "Sin responsable",
    highRiskICP: "",
    mainCompetitors: [],
    whyChoseUs: "Continuidad",
    whyCompetitorsFail: "",
    uniqueDifferentiator: "Trabajamos con el inventario actual",
  },
  step5: {
    activeChannels: [
      {
        channel: "linkedin",
        activityLevel: "medium",
        useForProspecting: true,
        useForContent: false,
      },
    ],
    preferredContactMethod: "email",
    contentFormats: ["text"],
    selectedFlows: ["cold_prospect"],
    customFlows: [],
  },
  step6: {
    ownerRole: "has_team",
    manualMarketingHours: "2_5hrs",
    leadResponseTime: "more_2hrs",
    productDescription: "Configuración de inventario",
    clientValue: "25000",
    ownerName: "Titular de prueba",
    ownerEmail: "owner@example.test",
    ownerPhone: "+12025550100",
    saleType: "one_time",
    renewalFrequency: null,
    monthlyNewClients: "1_3",
    activeClients: "2",
    acquisitionCost: "unknown",
    grossMargin: "prefer_not_say",
  },
};
export const context = {
  ...defaultContext,
  target90Days: "Obtener cinco solicitudes calificadas",
  preserve: "Formulario y marca actuales",
  budget: "none" as const,
  bottleneck: "demand" as const,
  monthlyLeads: 0,
  sharedSocialIdentity: true,
};
export const release: SnapshotRelease = {
  snapshotId: "synthetic-core",
  reviewReference: "QA-synthetic-01",
  version: "v1",
  validated: true,
  noExternalActions: true,
  pipelineName: "Ventas",
  workflowNames: ["Asignación"],
  formNames: ["Solicitud"],
  calendarNames: [],
};
export function session(): OnboardingSession {
  return {
    id: ba,
    owner_user_id: owner,
    guest_hash: null,
    version: 1,
    draft: {
      currentStep: 6,
      answers: structuredClone(answers),
      context: { ...context },
    },
    plan: buildPlan(ba, answers, context, 1),
    diagnostic: null,
    provision: { status: "not_started" },
    evidence: [],
    functional_ready_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
