import type { WizardState } from "@/types/wizard.types";

export type DiagnosticStatus =
  | "wizard_completed"
  | "call_pending"
  | "call_booked"
  | "activated"
  | "trial_active"
  | "paid_active";

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
}
