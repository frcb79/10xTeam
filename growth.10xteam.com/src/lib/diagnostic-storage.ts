import type { DiagnosticRecord, DiagnosticStatus } from "@/types/diagnostic.types";
import type { WizardState } from "@/types/wizard.types";
import { calculateOpportunity } from "@/lib/utils/opportunity";

const CURRENT_DIAGNOSTIC_KEY = "growth.currentDiagnostic";

function safeString(value: string | undefined | null): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Pendiente";
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createDiagnosticFromWizardState(state: WizardState): DiagnosticRecord {
  const step2 = state.answers.step2;
  const step3 = state.answers.step3_b2b ?? state.answers.step3_b2c;
  const step4 = state.answers.step4;
  const step5 = state.answers.step5;
  const step6 = state.answers.step6;
  const opportunity = calculateOpportunity(step6, step2?.priceRange);

  return {
    id: `diag_${randomId()}`,
    status: "wizard_completed",
    createdAt: new Date().toISOString(),
    contact: {
      name: safeString(step6?.ownerName),
      email: safeString(step6?.ownerEmail),
      phone: safeString(step6?.ownerPhone),
    },
    businessName: safeString(step2?.businessName),
    industry: safeString(step2?.industry),
    oneLiner: safeString(step2?.oneLiner),
    icpSummary: {
      profile: safeString(
        state.answers.step3_b2b?.primaryDecisionMaker ?? state.answers.step3_b2c?.ageRange,
      ),
      pain: safeString(step3?.mainPain),
      outcome: safeString(step3?.mainOutcome),
    },
    mechanismSummary: {
      objection: safeString(step4?.topObjection),
      differentiator: safeString(step4?.uniqueDifferentiator),
    },
    channels:
      step5?.activeChannels?.map((channel) =>
        channel.channel === "custom" ? channel.customName ?? "Canal personalizado" : channel.channel,
      ) ?? [],
    estimatedOpportunityMonthly:
      opportunity && Number.isFinite(opportunity.totalMonthly)
        ? String(Math.max(0, Math.round(opportunity.totalMonthly)))
        : "0",
    sourceState: {
      icpScore: state.icpScore,
    },
  };
}

export function saveCurrentDiagnostic(record: DiagnosticRecord): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_DIAGNOSTIC_KEY, JSON.stringify(record));
}

export function loadCurrentDiagnostic(): DiagnosticRecord | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(CURRENT_DIAGNOSTIC_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DiagnosticRecord;
  } catch {
    return null;
  }
}

export function updateCurrentDiagnosticStatus(status: DiagnosticStatus): DiagnosticRecord | null {
  const current = loadCurrentDiagnostic();
  if (!current) return null;

  const updated: DiagnosticRecord = {
    ...current,
    status,
  };

  saveCurrentDiagnostic(updated);
  return updated;
}
