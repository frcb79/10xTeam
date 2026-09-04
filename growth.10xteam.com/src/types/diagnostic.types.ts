import type { GeneratedOutputs, ICPCard, WizardAnswers, WizardState } from "@/types/wizard.types";
import type { OpportunityResult } from "@/lib/utils/opportunity";

export type DiagnosticStatus =
  | "wizard_completed"
  | "call_pending"
  | "call_booked"
  | "activated"
  | "trial_active"
  | "paid_active";

export interface DiagnosticNarratives {
  executiveSummary: string;
  buyerPersona: {
    name: string;
    role: string;
    dayInLife: string;
    unspokenThought: string;
    influences: string;
    twelveMonthVision: string;
  };
  beliefMap: Array<{
    belief: string;
    asset: string;
    signal: string;
  }>;
  voice: {
    whatsapp: string;
    instagramHook: string;
    instagramCaption: string;
    emailSubject: string;
    emailBody: string;
    reelScript: string;
  };
}

export interface DiagnosticReport {
  id: string;
  createdAt: string;
  answers: WizardAnswers;
  icpCard: ICPCard;
  opportunity: OpportunityResult;
  generatedOutputs?: GeneratedOutputs | null;
  narratives: DiagnosticNarratives;
}

export interface DiagnosticRecord {
  id: string;
  status: DiagnosticStatus;
  createdAt: string;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  businessName: string;
  industry: string;
  oneLiner: string;
  icpSummary: {
    profile: string;
    pain: string;
    outcome: string;
  };
  mechanismSummary: {
    objection: string;
    differentiator: string;
  };
  channels: string[];
  estimatedOpportunityMonthly: string;
  sourceState: Pick<WizardState, "icpScore">;
  report?: DiagnosticReport;
}
