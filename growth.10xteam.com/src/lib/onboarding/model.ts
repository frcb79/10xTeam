import type { ConnectionEvent } from "./connections";
import type { DiagnosticRecord } from "@/types/diagnostic.types";
import type { ModuleId, ModuleMode, OnboardingDraft } from "./schema";

export type Evidence = {
  gate: string;
  outcome: "pass" | "fail";
  kind: "real" | "simulation";
  reference: string;
  actorId: string;
  recordedAt: string;
  planVersion: number;
  locationId: string;
};
export type ModuleState = {
  id: ModuleId;
  mode: ModuleMode;
  required: boolean;
  status:
    | "selected"
    | "waiting_customer"
    | "waiting_provider"
    | "manual_review"
    | "deferred"
    | "tested";
  nextAction: string;
  consent?: { actorId: string; at: string; scope: string; planVersion: number };
};
export type Recommendation = {
  id: string;
  title: string;
  rationale: string;
  evidenceKeys: string[];
  action: string;
  metric: string;
  method: "rules-v1";
  status: "proposed";
};
export type BusinessMemory = {
  schemaVersion: 1;
  businessAccountId: string;
  facts: Array<{
    key: string;
    value: unknown;
    source: "customer" | "wizard";
    status: "confirmed" | "pending" | "inferred";
    recordedAt: string;
  }>;
  recommendations: Recommendation[];
  unknowns: string[];
  agentPolicy: {
    crossAccountData: false;
    execution: "approval_required";
    paidAI: "disabled";
  };
};
export type ConfigurationPlan = {
  connections?: ConnectionEvent[];
  version: number;
  archetype: "b2b" | "consumer" | "appointments";
  snapshotKey: string;
  pipelineStages: string[];
  customValues: Record<string, string>;
  modules: ModuleState[];
  kpis: string[];
  workflows: string[];
  memory: BusinessMemory;
  coreTest: string;
  generatedAt: string;
};
export type ProvisionState = {
  status:
    | "not_started"
    | "running"
    | "waiting_provider"
    | "manual_review"
    | "configured";
  locationId?: string;
  snapshotId?: string;
  snapshotVersion?: string;
  lastError?: string;
  runId?: string;
  createAttempted?: boolean;
  managedValues?: Record<string, string>;
  assets?: Record<string, string[]>;
};
export type OnboardingSession = {
  id: string;
  owner_user_id: string | null;
  guest_hash: string | null;
  version: number;
  draft: OnboardingDraft;
  plan: ConfigurationPlan | null;
  diagnostic: DiagnosticRecord | null;
  provision: ProvisionState;
  commercial_trial_started_at?: string | null;
  commercial_trial_ends_at?: string | null;
  evidence: Evidence[];
  functional_ready_at: string | null;
  created_at: string;
  updated_at: string;
};
export type Actor = {
  userId: string | null;
  guestHash: string | null;
  operator: boolean;
};

export function ownsSession(
  actor: Actor,
  session: Pick<OnboardingSession, "owner_user_id" | "guest_hash">,
): boolean {
  return session.owner_user_id
    ? actor.userId === session.owner_user_id
    : Boolean(actor.guestHash && actor.guestHash === session.guest_hash);
}

export const globalGates = [
  "contract",
  "owner_access",
  "locale",
  "snapshot_assets",
  "cost_controls",
  "continuity",
  "isolation",
  "core_e2e",
  "public_ssl",
  "observability",
  "handoff",
  "trial_policy",
] as const;
export function readiness(session: OnboardingSession) {
  const required = [
    ...globalGates,
    ...(session.plan?.modules
      .filter((m) => m.required)
      .map((m) => `module:${m.id}`) ?? []),
  ];
  const gates = required.map((gate) => {
    const e = session.evidence
      .filter(
        (e) =>
          e.gate === gate &&
          e.planVersion === session.plan?.version &&
          (e.locationId === session.provision.locationId ||
            (gate === "contract" && e.locationId === "pending")),
      )
      .at(-1);
    return {
      gate,
      passed: e?.outcome === "pass" && e.kind === "real",
      evidence: e ?? null,
    };
  });
  const consents = session.plan?.modules
    .filter(
      (m) => m.required && ["create", "connect", "migrate"].includes(m.mode),
    )
    .every(
      (m) =>
        m.consent?.actorId === session.owner_user_id &&
        m.consent?.planVersion === session.plan?.version,
    );
  const latestConnections = new Map(
    (session.plan?.connections ?? [])
      .filter(
        (e) =>
          e.planVersion === session.plan?.version &&
          e.locationId === session.provision.locationId,
      )
      .map((e) => [e.service, e.state]),
  );
  const ready = Boolean(
    consents &&
      session.owner_user_id &&
      session.plan &&
      session.provision.locationId &&
      session.provision.status === "configured" &&
      gates.every((g) => g.passed) &&
      ![...latestConnections.values()].some(
        (state) => state === "failed" || state === "revoked",
      ),
  );
  return {
    status:
      ready && session.functional_ready_at ? "FUNCTIONAL_READY" : "PENDING",
    ready,
    gates,
    trialStarted: Boolean(session.commercial_trial_started_at),
  };
}
