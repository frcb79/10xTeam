import { randomUUID } from "node:crypto";
import type {
  ConfigurationPlan,
  OnboardingSession,
  ProvisionState,
} from "./model";
import { HttpError } from "./security";

export type SnapshotRelease = {
  version: string;
  reviewReference: string;
  validated: true;
  noExternalActions: true;
  pipelineName: string;
  workflowNames: string[];
  formNames: string[];
  calendarNames: string[];
} & (
  | { kind?: "snapshot"; snapshotId: string }
  | { kind: "existing_lab"; locationId: string; inventoryReference: string }
  | { kind: "blank" }
);
export interface ProvisionProvider {
  checkCreate?(session: OnboardingSession): Promise<void>;
  createLocation(
    session: OnboardingSession,
    release: SnapshotRelease,
  ): Promise<string>;
  configure(
    session: OnboardingSession,
    release: SnapshotRelease,
  ): Promise<Pick<ProvisionState, "managedValues" | "assets">>;
  verifyLocation(
    locationId: string,
    expected?: OnboardingSession,
  ): Promise<void>;
}
export type SaveProvision = (
  session: OnboardingSession,
  provision: ProvisionState,
  event: string,
) => Promise<OnboardingSession>;

export function allowedLab(id: string) {
  return (process.env.GHL_LAB_LOCATION_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .includes(id);
}

export function provisionPrerequisites(
  s: OnboardingSession,
  enabled: boolean,
  release?: SnapshotRelease,
) {
  if (!enabled)
    throw new HttpError(
      409,
      "La ejecución externa está desactivada. Tu plan y tus autorizaciones están guardados.",
    );
  if (!s.owner_user_id || !s.plan || !s.draft.context)
    throw new HttpError(
      409,
      "Inicia sesión y confirma el diagnóstico antes de configurar.",
    );
  if (
    !release?.validated ||
    !release.noExternalActions ||
    !release.reviewReference
  )
    throw new HttpError(
      409,
      "Falta validar y registrar la plantilla de configuración de este negocio.",
    );
  if (
    release?.kind === "existing_lab" &&
    (!allowedLab(release.locationId) ||
      (s.provision.locationId && s.provision.locationId !== release.locationId))
  )
    throw new HttpError(403, "La referencia de activos LAB no corresponde a la subcuenta autorizada.");
  const consent = s.plan.modules.find((m) => m.id === "crm")?.consent;
  if (
    !consent ||
    consent.actorId !== s.owner_user_id ||
    consent.planVersion !== s.plan.version ||
    consent.scope !== "provision_core_no_paid_services"
  )
    throw new HttpError(
      403,
      "Falta la autorización de configuración para esta versión.",
    );
  const contract = [...s.evidence]
    .reverse()
    .find(
      (e) =>
        e.gate === "contract" &&
        e.planVersion === s.plan!.version &&
        (e.locationId === "pending" || e.locationId === s.provision.locationId),
    );
  if (contract?.outcome !== "pass" || contract.kind !== "real")
    throw new HttpError(
      409,
      "La contratación o autorización de piloto requiere verificación del equipo.",
    );
}

// Durable CAS lock BEFORE any provider write. A timed-out create is never automatically repeated.
export async function provisionSession(
  s: OnboardingSession,
  provider: ProvisionProvider,
  save: SaveProvision,
  release: SnapshotRelease,
): Promise<OnboardingSession> {
  if (s.provision.status === "configured") return s;
  if (
    s.provision.status === "running" ||
    s.provision.status === "manual_review" ||
    (s.provision.createAttempted && !s.provision.locationId)
  )
    throw new HttpError(
      409,
      "Requiere reconciliación: comprobar la operación anterior antes de volver a configurar.",
    );
  const existingLab = release.kind === "existing_lab";
  const blank = release.kind === "blank";
  const sourceMode = existingLab ? "existing_lab" : blank ? "blank" : "snapshot";
  const expectedSnapshotId = existingLab || blank ? undefined : release.snapshotId;
  if (
    existingLab &&
    (!s.provision.locationId || s.provision.locationId !== release.locationId ||
      !allowedLab(release.locationId))
  )
    throw new HttpError(409, "Vincula primero la LAB existente aprobada; no se creará otra location.");
  if (
    (s.provision.assetMode && s.provision.assetMode !== sourceMode) ||
    (s.provision.snapshotId && s.provision.snapshotId !== expectedSnapshotId) ||
    (s.provision.snapshotVersion && s.provision.snapshotVersion !== release.version)
  )
    throw new HttpError(
      409,
      "La versión o procedencia de activos aprobada cambió. Reconciliar antes de continuar.",
    );
  if (!s.provision.locationId) await provider.checkCreate?.(s);
  let current = await save(
    s,
    {
      ...s.provision,
      status: "running",
      snapshotId: expectedSnapshotId,
      snapshotVersion: release.version,
      assetMode: sourceMode,
      assetReference: existingLab ? release.inventoryReference : release.reviewReference,
      runId: randomUUID(),
      createAttempted: true,
      lastError: undefined,
    },
    "provision_started",
  );
  try {
    if (!current.provision.locationId) {
      const locationId = await provider.createLocation(current, release);
      if (!locationId) throw new Error("location_missing");
      current = await save(
        current,
        { ...current.provision, locationId, snapshotVersion: release.version },
        "location_created",
      );
    }
    const id = current.provision.locationId!;
    const lab = current.evidence.some(
      (e) =>
        e.gate === "lab_binding" &&
        e.kind === "real" &&
        e.outcome === "pass" &&
        e.locationId === id &&
        e.planVersion === current.plan?.version,
    );
    if (lab && !allowedLab(id))
      throw new HttpError(403, "La LAB dejó de estar autorizada.");
    // verifyLocation always verifies the exact location and its agency. A reusable LAB
    // is assigned by an operator; a commercial location must match the business too.
    await provider.verifyLocation(id, lab ? undefined : current);
    if (blank && !s.provision.locationId) {
      // A blank location is intentionally NOT operational. The external location
      // was created exactly once; real assets must be prepared and then verified.
      // Retrying "provision" with the saved location cannot repeat creation.
      return await save(
        current,
        {
          ...current.provision,
          status: "waiting_provider",
          lastError: "Cuenta creada vacía. Faltan pipeline, formularios y workflows validados; no está lista para operar.",
        },
        "blank_location_created_assets_pending",
      );
    }
    const configured = await provider.configure(current, release);
    return await save(
      current,
      {
        ...current.provision,
        ...configured,
        status: "configured",
        lastError: undefined,
      },
      "configuration_verified",
    );
  } catch (error) {
    // A failed DB write may leave an earlier durable lock. Never erase it or blindly recreate.
    const status = current.provision.locationId
      ? "waiting_provider"
      : "manual_review";
    const code =
      error instanceof HttpError
        ? error.message
        : "No se pudo verificar la configuración. Reconciliar los recursos antes de reintentar.";
    return await save(
      current,
      { ...current.provision, status, lastError: code },
      "provision_paused",
    );
  }
}

export function expectedCustomValues(plan: ConfigurationPlan) {
  return Object.entries(plan.customValues).filter(([, value]) => value.trim());
}
