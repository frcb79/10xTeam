export type ICPType = "b2b" | "b2c" | "mixed" | "freelancer";

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export type WizardStatus =
  | "idle"
  | "scraping"
  | "scraping_complete"
  | "in_progress"
  | "processing"
  | "complete"
  | "error";

export type ChannelType =
  | "whatsapp"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "email"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "custom";

export type ContentFormat =
  | "text"
  | "short_video"
  | "long_video"
  | "images"
  | "documents"
  | "podcast";

export type FunnelFlow =
  | "cold_prospect"
  | "warm_prospect"
  | "referral"
  | "info_requested_no_response"
  | "proposal_seen_disappeared"
  | "attended_demo"
  | "has_objections"
  | "ready_to_close"
  | "new_client"
  | "active_client"
  | "at_risk_client"
  | "wants_to_cancel"
  | "churned_client"
  | "referral_program"
  | "custom";

export interface PrefillConfidence {
  oneLiner: number;
  industry: number;
  mainPain: number;
  mainOutcome: number;
  differentiator: number;
}

export interface InfluencerProfile {
  role: string;
  influence: "high" | "medium" | "low";
  keyArgument: string;
}

export type CompanySizeRange =
  | "1-5"
  | "6-20"
  | "21-50"
  | "51-200"
  | "201-500"
  | "500+";

export interface Step2Answers {
  businessName: string;
  oneLiner: string;
  industry: string;
  industrySubcategory: string;
  icpType: ICPType;
  productType: string;
  revenueModel: string;
  priceRange: string;
  marginBand: string;
  purchaseFrequency: string;
}

export interface Step3B2BAnswers {
  primaryDecisionMaker: string;
  secondaryInfluencers: InfluencerProfile[];
  companySizeRange: CompanySizeRange;
  targetIndustry: string;
  geographyPriority: string;
  mainPain: string;
  mainPainConsequences: string;
  costOfInaction: string;
  costOfInactionAmount: string;
  mainOutcome: string;
  outcomeTimeline: string;
  typicalInvestmentRange: string;
  budgetType: "personal" | "business" | "both";
  decisionAuthority: "alone" | "needs_approval" | "committee";
}

export interface Step3B2CAnswers {
  ageRange: string;
  lifeStage: string[];
  incomeLevel: string;
  geography: string;
  mainPain: string;
  mainDesire: string;
  costOfInaction: string;
  mainOutcome: string;
  outcomeTimeline: string;
  typicalInvestmentRange: string;
  paysFromOwnPocket: boolean;
}

export type SalesCycleDuration =
  | "same_day"
  | "1-7_days"
  | "1-4_weeks"
  | "1-3_months"
  | "3+_months";

export interface Step4Answers {
  salesCycleDuration: SalesCycleDuration;
  salesCycleNotes: string;
  topObjection: string;
  topObjectionResolution: string;
  antiICP: string;
  highRiskICP: string;
  mainCompetitors: string;
  whyChoseUs: string;
  whyCompetitorsFail: string;
  uniqueDifferentiator: string;
}

export interface ChannelConfig {
  channel: ChannelType;
  customName?: string;
  activityLevel: "high" | "medium" | "low";
  useForProspecting: boolean;
  useForContent: boolean;
}

export interface CustomFlow {
  name: string;
  description: string;
  contactStage: string;
  goalWithMaterials: string;
}

export interface Step5Answers {
  activeChannels: ChannelConfig[];
  preferredContactMethod: ChannelType;
  contentFormats: ContentFormat[];
  selectedFlows: FunnelFlow[];
  customFlows: CustomFlow[];
}

export type OwnerRole = "owner_operator" | "has_team" | "uses_agencies";

export type ManualMarketingHours =
  | "less_2hrs"
  | "2_5hrs"
  | "5_10hrs"
  | "more_10hrs";

export type LeadResponseTime =
  | "under_5min"
  | "5_30min"
  | "30min_2hrs"
  | "more_2hrs";

export type SaleType =
  | "one_time"
  | "monthly_recurring"
  | "annual_recurring"
  | "package_renewal"
  | "mixed";

export type RenewalFrequency =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual";

export type MonthlyNewClients = "1_3" | "4_10" | "11_20" | "20_plus";

export type AcquisitionCostBand =
  | "under_500"
  | "500_2000"
  | "2000_8000"
  | "over_8000"
  | "unknown";

export type GrossMarginBand =
  | "under_20"
  | "20_40"
  | "40_60"
  | "over_60"
  | "prefer_not_say";

export interface Step6EconomicsAnswers {
  ownerRole: OwnerRole;
  manualMarketingHours: ManualMarketingHours;
  leadResponseTime: LeadResponseTime;
  productDescription: string;
  clientValue: string;
  saleType: SaleType;
  renewalFrequency: RenewalFrequency | null;
  monthlyNewClients: MonthlyNewClients;
  activeClients: string;
  acquisitionCost: AcquisitionCostBand;
  grossMargin: GrossMarginBand;
}

export interface WizardAnswers {
  step2: Step2Answers | null;
  step3_b2b: Step3B2BAnswers | null;
  step3_b2c: Step3B2CAnswers | null;
  step4: Step4Answers | null;
  step5: Step5Answers | null;
  step6: Step6EconomicsAnswers | null;
}

export interface ICPQualityScore {
  total: number;
  breakdown: {
    painInClientWords: number;
    measurablePromise: number;
    exclusiveDifferentiator: number;
    actionableTrigger: number;
  };
  suggestions: string[];
  canProceed: boolean;
}

export interface ICPCard {
  version: number;
  archetypeName: string;
  profileDescription: string;
  primaryDecisionMaker: string;
  secondaryInfluencers: InfluencerProfile[];
  trigger: string;
  mainPain: string;
  costOfInaction: string;
  topFear: string;
  previousSolutionsTried: string;
  uniqueMechanism: string;
  channels: ChannelType[];
  promise: string;
  antiICP: string;
  highRiskICP: string;
  economicProfile: {
    investmentRange: string;
    budgetType: string;
    decisionAuthority: string;
  };
  icpScore: ICPQualityScore;
  createdAt: string;
  updatedAt: string;
}

export interface ElevatorPitchSet {
  whatsapp: string;
  linkedin: string;
  inPerson: string;
}

export interface PitchDeckSlide {
  slideNumber: number;
  title: string;
  visibleText: string;
  presenterNotes: string;
}

export interface PitchDeckStructure {
  slides: PitchDeckSlide[];
}

export interface PostIdea {
  weekNumber: number;
  topic: string;
  angle: "education" | "pain" | "proof" | "mechanism" | "community" | "offer";
  format: "text" | "carousel" | "reel" | "image";
  hook: string;
  cta: string;
}

export interface ObjectionResponse {
  objection: string;
  response: string;
  followUpQuestion: string;
}

export interface GeneratedOutputs {
  icpCard: ICPCard;
  elevatorPitch: ElevatorPitchSet;
  botPrompt: string;
  emailSubjectLines: string[];
  pitchDeckStructure: PitchDeckStructure;
  monthlyPostIdeas: PostIdea[];
  objectionResponses: ObjectionResponse[];
  uniqueMechanism: string;
}

export interface WizardState {
  currentStep: WizardStep;
  status: WizardStatus;
  completedSteps: WizardStep[];
  icpType: ICPType | null;
  websiteUrl: string | null;
  scrapedContent: string | null;
  prefillConfidence: PrefillConfidence | null;
  answers: WizardAnswers;
  icpScore: ICPQualityScore | null;
  generatedOutputs: GeneratedOutputs | null;
  error: string | null;
}

export type WizardAction =
  | { type: "SET_STEP"; payload: WizardStep }
  | { type: "SET_STATUS"; payload: WizardStatus }
  | { type: "SET_WEBSITE_URL"; payload: string }
  | { type: "SET_SCRAPED_CONTENT"; payload: { content: string; confidence: PrefillConfidence } }
  | { type: "SET_ICP_TYPE"; payload: ICPType }
  | { type: "UPDATE_STEP2"; payload: Step2Answers }
  | { type: "UPDATE_STEP3_B2B"; payload: Step3B2BAnswers }
  | { type: "UPDATE_STEP3_B2C"; payload: Step3B2CAnswers }
  | { type: "UPDATE_STEP4"; payload: Step4Answers }
  | { type: "UPDATE_STEP5"; payload: Step5Answers }
  | { type: "UPDATE_STEP6"; payload: Step6EconomicsAnswers }
  | { type: "SET_ICP_SCORE"; payload: ICPQualityScore }
  | { type: "SET_GENERATED_OUTPUTS"; payload: GeneratedOutputs }
  | { type: "COMPLETE_STEP"; payload: WizardStep }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET" };