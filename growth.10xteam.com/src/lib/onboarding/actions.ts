import { buildPlan } from "./plan";
import {
  readiness,
  globalGates,
  type Actor,
  type OnboardingSession,
} from "./model";
import type { Command } from "./commands";
import { HttpError } from "./security";
import {
  provisionPrerequisites,
  provisionSession,
  type ProvisionProvider,
  type SnapshotRelease,
} from "./provision";

type Change = Partial<
  Pick<
    OnboardingSession,
    | "draft"
    | "plan"
    | "diagnostic"
    | "provision"
    | "evidence"
    | "functional_ready_at"
  >
>;
export interface ActionDependencies {
  save: (
    current: OnboardingSession,
    patch: Change,
    event: string,
    actor: string,
  ) => Promise<OnboardingSession>;
  diagnostic?: (
    draft: OnboardingSession["draft"],
  ) => Promise<NonNullable<OnboardingSession["diagnostic"]>>;
  startTrial?: boolean;
  enabled: boolean;
  release: (key: string) => SnapshotRelease | undefined;
  provider: () => ProvisionProvider;
}
export async function execute(
  s: OnboardingSession,
  a: Actor,
  cmd: Exclude<Command, { action: "open" }>,
  deps: ActionDependencies,
) {
  if (s.id !== cmd.id || s.version !== cmd.version)
    throw new HttpError(409, "El registro cambió. Recarga antes de continuar.");
  if (s.provision.status === "running" && cmd.action !== "reconcile")
    throw new HttpError(409, "La configuración está en curso.");
  if (
    ["save", "plan", "module"].includes(cmd.action) &&
    s.provision.createAttempted
  )
    throw new HttpError(
      409,
      "La configuración ya comenzó. Solicita una revisión para conservar los activos existentes.",
    );
  if (
    s.owner_user_id &&
    s.owner_user_id !== a.userId &&
    !["evidence", "ready", "reconcile", "provision"].includes(cmd.action)
  )
    throw new HttpError(
      403,
      "Sólo el titular puede modificar estas decisiones.",
    );
  const actorId = a.userId ?? "guest:" + s.id;
  const save = (patch: Change, event: string) =>
    deps.save(s, patch, event, actorId);
  switch (cmd.action) {
    case "save":
      return save(
        {
          draft: cmd.draft,
          plan: null,
          diagnostic: null,
          evidence: [],
          functional_ready_at: null,
        },
        "draft_saved",
      );
    case "plan": {
      if (!s.draft.context)
        throw new HttpError(400, "Completa objetivos y continuidad.");
      let plan;
      try {
        plan = buildPlan(s.id, s.draft.answers, s.draft.context, s.version + 1);
      } catch {
        throw new HttpError(
          400,
          "Completa el diagnóstico de negocio antes de preparar tu configuración.",
        );
      }
      const diagnostic = deps.diagnostic
        ? await deps.diagnostic(s.draft)
        : s.diagnostic;
      return save(
        { plan, diagnostic, evidence: [], functional_ready_at: null },
        "plan_generated",
      );
    }
    case "module": {
      if (!s.plan) throw new HttpError(409, "Genera primero tu plan.");
      const target = s.plan.modules.find((m) => m.id === cmd.module)!;
      if (target.required && cmd.mode === "defer")
        throw new HttpError(
          400,
          "Este módulo es necesario para el objetivo que elegiste.",
        );
      const modules = s.plan.modules.map((m) => {
        const value = { ...m, consent: undefined };
        if (m.id !== target.id) return value;
        return {
          ...value,
          mode: cmd.mode,
          status:
            cmd.mode === "defer"
              ? ("deferred" as const)
              : ("waiting_customer" as const),
        };
      });
      return save(
        {
          plan: { ...s.plan, version: s.version + 1, modules },
          evidence: [],
          functional_ready_at: null,
        },
        "module_selected",
      );
    }
    case "approve_core":
    case "authorize_module": {
      if (!s.plan || !a.userId || a.userId !== s.owner_user_id)
        throw new HttpError(403, "Se requiere autorización del titular.");
      const id = cmd.action === "approve_core" ? "crm" : cmd.module;
      const selectedModule = s.plan.modules.find((m) => m.id === id)!;
      if (selectedModule.mode === "defer")
        throw new HttpError(400, "Primero selecciona el módulo.");
      if (cmd.action === "approve_core" && selectedModule.mode !== "create")
        throw new HttpError(
          409,
          "Conservar o migrar tu CRM requiere revisión antes de configurar.",
        );
      const consent = {
        actorId,
        at: new Date().toISOString(),
        planVersion: s.plan.version,
        scope:
          cmd.action === "approve_core"
            ? "provision_core_no_paid_services"
            : "prepare_" + id + "_no_paid_services",
      };
      return save(
        {
          plan: {
            ...s.plan,
            modules: s.plan.modules.map((m) =>
              m.id === id ? { ...m, consent, status: "waiting_provider" } : m,
            ),
          },
        },
        "authorization_recorded",
      );
    }
    case "provision": {
      const release = s.plan ? deps.release(s.plan.snapshotKey) : undefined;
      provisionPrerequisites(s, deps.enabled, release);
      return provisionSession(
        s,
        deps.provider(),
        (current, provision, event) =>
          deps.save(current, { provision }, event, actorId),
        release!,
      );
    }
    case "reconcile": {
      if (!a.operator || !deps.enabled || !s.plan)
        throw new HttpError(
          403,
          "Reconciliación reservada al operador autorizado.",
        );
      if (
        !s.provision.createAttempted ||
        (s.provision.locationId && s.provision.locationId !== cmd.locationId) ||
        s.provision.status === "configured"
      )
        throw new HttpError(409, "No se puede reemplazar la cuenta vinculada.");
      if (Date.now() - Date.parse(s.updated_at) < 120000)
        throw new HttpError(409, "Espera a que finalice el intento anterior.");
      await deps.provider().verifyLocation(cmd.locationId, s);
      return save(
        {
          provision: {
            ...s.provision,
            locationId: cmd.locationId,
            status: "waiting_provider",
            lastError: undefined,
          },
          evidence: [
            ...s.evidence,
            {
              gate: "reconciliation",
              outcome: "pass",
              kind: "real",
              reference: cmd.reference,
              actorId,
              recordedAt: new Date().toISOString(),
              planVersion: s.plan.version,
              locationId: cmd.locationId,
            },
          ],
        },
        "location_reconciled",
      );
    }
    case "evidence": {
      if (!a.operator || !a.userId || !s.plan)
        throw new HttpError(
          403,
          "Sólo el operador autorizado puede verificar resultados.",
        );
      const allowed = [
        ...globalGates,
        ...s.plan.modules.map((m) => "module:" + m.id),
      ];
      if (
        !allowed.includes(cmd.gate) ||
        (!s.provision.locationId && cmd.gate !== "contract")
      )
        throw new HttpError(400, "Criterio o cuenta inválidos.");
      const evidence = [
        ...s.evidence,
        {
          gate: cmd.gate,
          outcome: cmd.outcome,
          kind: cmd.kind,
          reference: cmd.reference,
          actorId,
          recordedAt: new Date().toISOString(),
          planVersion: s.plan.version,
          locationId: s.provision.locationId ?? "pending",
        },
      ];
      const modules = s.plan.modules.map((m) =>
        cmd.gate === "module:" + m.id && cmd.kind === "real"
          ? {
              ...m,
              status:
                cmd.outcome === "pass"
                  ? ("tested" as const)
                  : ("manual_review" as const),
            }
          : m,
      );
      return save(
        { evidence, plan: { ...s.plan, modules }, functional_ready_at: null },
        "evidence_recorded",
      );
    }
    case "ready":
      if (!a.operator || !readiness(s).ready)
        throw new HttpError(
          409,
          "Faltan verificaciones para declarar el negocio listo.",
        );
      if (
        s.functional_ready_at &&
        (!deps.startTrial || s.commercial_trial_started_at)
      )
        return s;
      return save(
        {
          functional_ready_at:
            s.functional_ready_at ?? new Date().toISOString(),
        },
        deps.startTrial
          ? "functional_ready_trial_authorized"
          : "functional_ready",
      );
  }
}
