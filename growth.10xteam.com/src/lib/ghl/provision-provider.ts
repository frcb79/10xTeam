import { z } from "zod";
import type { OnboardingSession } from "@/lib/onboarding/model";
import { HttpError } from "@/lib/onboarding/security";
import {
  allowedLab,
  expectedCustomValues,
  type ProvisionProvider,
  type SnapshotRelease,
} from "@/lib/onboarding/provision";

const releaseAssetsSchema = z.object({
  version: z.string().min(1),
  reviewReference: z.string().regex(/^[a-zA-Z0-9_-]{4,80}$/),
  validated: z.literal(true),
  noExternalActions: z.literal(true),
  pipelineName: z.string().min(1),
  workflowNames: z.array(z.string().min(1)).min(1),
  formNames: z.array(z.string().min(1)),
  calendarNames: z.array(z.string().min(1)),
});
// Never represent an inventory of an existing LAB as an importable snapshot.
const releaseSchema = z.union([
  releaseAssetsSchema.extend({ kind: z.literal("snapshot").optional(), snapshotId: z.string().min(1) }).strict(),
  releaseAssetsSchema.extend({
    kind: z.literal("existing_lab"),
    locationId: z.string().regex(/^[a-zA-Z0-9_-]{5,100}$/),
    inventoryReference: z.string().regex(/^[a-zA-Z0-9_-]{4,80}$/),
  }).strict(),
  releaseAssetsSchema.extend({ kind: z.literal("blank") }).strict(),
]);
export function snapshotRelease(key: string): SnapshotRelease | undefined {
  try {
    const catalog = z
      .record(z.string(), releaseSchema)
      .parse(JSON.parse(process.env.GHL_SNAPSHOT_RELEASES ?? "{}"));
    return catalog[key];
  } catch {
    throw new HttpError(503, "El catálogo de configuración necesita revisión.");
  }
}
type Item = {
  id: string;
  name: string;
  value?: string;
  stages?: { name: string }[];
  status?: string;
};
type Identity = {
  id: string;
  companyId?: string;
  name?: string;
  email?: string;
  website?: string;
};
type Payload = {
  name?: string;
  email?: string;
  website?: string;
  contact?: { id: string; locationId: string };
  locations?: Identity[];
  id?: string;
  companyId?: string;
  access_token?: string;
  locationId?: string;
  location?: Identity;
  customValues?: Item[];
  pipelines?: Item[];
  forms?: Item[];
  workflows?: Item[];
  calendars?: Item[];
};

// A location credential is sufficient for an existing LAB. Never fall back to an
// agency credential when LAB configuration is incomplete or its binding changes.
export function configuredProvider(fetcher: typeof fetch = fetch) {
  const company = process.env.GHL_COMPANY_ID ?? "";
  const token = process.env.GHL_LAB_ACCESS_TOKEN;
  const location = process.env.GHL_LAB_LOCATION_ID;
  if (token !== undefined || location !== undefined) {
    if (!token || !location || !allowedLab(location))
      throw new HttpError(503, "Revisa la credencial y la location autorizada de LAB.");
    return new GhlProvisionProvider(token, company, fetcher, location);
  }
  return new GhlProvisionProvider(process.env.GHL_AGENCY_ACCESS_TOKEN ?? "", company, fetcher);
}

export class GhlProvisionProvider implements ProvisionProvider {
  constructor(
    private readonly accessToken: string,
    private readonly companyId: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly labLocation?: string,
  ) {
    if (!accessToken || !companyId)
      throw new HttpError(503, "La conexión de configuración está pendiente.");
  }
  private async request(
    path: string,
    token: string,
    method = "GET",
    body?: unknown,
  ): Promise<Payload> {
    let response: Response;
    try {
      response = await this.fetcher(
        `https://services.leadconnectorhq.com${path}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            Version: "v3",
            "Content-Type":
              body instanceof URLSearchParams
                ? "application/x-www-form-urlencoded"
                : "application/json",
            Accept: "application/json",
          },
          body:
            body instanceof URLSearchParams
              ? body
              : body === undefined
                ? undefined
                : JSON.stringify(body),
          signal: AbortSignal.timeout(12_000),
          cache: "no-store",
          redirect: "error",
        },
      );
    } catch {
      throw new HttpError(
        502,
        "El proveedor no confirmó la operación. Comprobar su resultado antes de reintentar.",
      );
    }
    if (!response.ok)
      throw new HttpError(
        response.status === 429 ? 429 : 502,
        response.status === 429
          ? "El proveedor pidió esperar. Reintenta después sin volver a crear la cuenta."
          : `El proveedor rechazó la operación (${response.status}). Revisar permisos o configuración.`,
      );
    return response.json();
  }
  private checkDestination(id: string) {
    if (this.labLocation && (id !== this.labLocation || !allowedLab(id)))
      throw new HttpError(403, "La credencial de LAB está limitada a su location.");
  }
  private async locationToken(id: string) {
    this.checkDestination(id);
    if (this.labLocation) return this.accessToken;
    const grant = await this.request(
      "/oauth/location-token", this.accessToken, "POST",
      new URLSearchParams({ companyId: this.companyId, locationId: id }),
    );
    if (!grant.access_token || grant.locationId !== id)
      throw new HttpError(403, "No se pudo comprobar el acceso al negocio.");
    return grant.access_token;
  }
  async checkCreate(s: OnboardingSession) {
    if (this.labLocation || process.env.GHL_LOCATION_CREATION_ENABLED !== "true")
      throw new HttpError(
        409,
        "La creación de cuentas requiere autorización específica. Vincula una LAB autorizada.",
      );
    const a = s.draft.answers;
    if (!a.step2?.businessName?.trim() || !a.step6?.ownerEmail?.trim() || !s.draft.context)
      throw new HttpError(
        409,
        "Faltan nombre, correo del titular y contexto para crear una subcuenta.",
      );
    if (
      !process.env.GHL_APPROVED_CREATION_SESSION_IDS?.split(",")
        .map((value) => value.trim())
        .includes(s.id)
    )
      throw new HttpError(
        403,
        "Falta la autorización de creación para este negocio.",
      );
    const norm = (value?: string) => value?.trim().toLowerCase();
    const host = (value?: string) => {
      try {
        return new URL(value ?? "").hostname.toLowerCase();
      } catch {
        return undefined;
      }
    };
    const website = host(s.draft.context?.websiteUrl);
    const pageSize = 10;
    for (let skip = 0; skip < 10000; skip += pageSize) {
      const query = new URLSearchParams({
        companyId: this.companyId,
        skip: String(skip),
        limit: String(pageSize),
      });
      const { locations } = await this.request(
        "/locations/search?" + query,
        this.accessToken,
      );
      if (!Array.isArray(locations)) break;
      if (
        locations.some(
          (location) =>
            norm(location.name) === norm(a.step2!.businessName) ||
            norm(location.email) === norm(a.step6!.ownerEmail) ||
            (website && website === host(location.website)),
        )
      )
        throw new HttpError(
          409,
          "Ya existe una cuenta candidata. Revisa nombre, dominio y titular antes de crear.",
        );
      if (locations.length < pageSize) return;
    }
    throw new HttpError(
      409,
      "No se pudo verificar el inventario completo de la agencia.",
    );
  }
  async createLocation(s: OnboardingSession, release: SnapshotRelease) {
    if (release.kind === "existing_lab")
      throw new HttpError(403, "El inventario de LAB no es un snapshot importable; no permite crear locations.");
    if (this.labLocation) throw new HttpError(403, "La LAB sólo permite vincular la cuenta existente.");
    const c = s.draft.context;
    const a = s.draft.answers;
    if (!c || !a.step2?.businessName?.trim() || !a.step6?.ownerEmail?.trim())
      throw new HttpError(409, "Falta identidad completa para crear una subcuenta.");
    const snapshotFields =
      release.kind === "blank" ? {} : { snapshotId: release.snapshotId };
    const result = await this.request("/locations/", this.accessToken, "POST", {
      companyId: this.companyId,
      name: a.step2.businessName,
      email: a.step6.ownerEmail,
      country: c.country,
      timezone: c.timezone,
      website: c.websiteUrl || undefined,
      ...snapshotFields,
    });
    const id = result.id ?? result.location?.id;
    if (!id)
      throw new HttpError(
        502,
        "El proveedor no devolvió un identificador verificable.",
      );
    return id;
  }
  async verifyLocation(id: string, expected?: OnboardingSession) {
    this.checkDestination(id);
    const r = await this.request(
      `/locations/${encodeURIComponent(id)}`,
      this.accessToken,
    );
    if (
      (r.location?.id ?? r.id) !== id ||
      (r.location?.companyId ?? r.companyId) !== this.companyId
    )
      throw new HttpError(
        403,
        "La cuenta no pertenece a la agencia autorizada.",
      );
    if (expected) {
      const record = r.location ?? r;
      const normal = (v: string | undefined) => v?.trim().toLowerCase();
      const email = expected.draft.answers.step6?.ownerEmail;
      const business = expected.draft.answers.step2?.businessName;
      if (
        !email ||
        !business ||
        normal(record.email) !== normal(email) ||
        normal(record.name) !== normal(business)
      ) {
        throw new HttpError(
          409,
          "La identidad de la cuenta no coincide con el negocio que autorizó la configuración.",
        );
      }
    }
  }
  async upsertFormContact(payload: {
    locationId: string;
    email: string;
    name: string;
    source: string;
    customFields: { id: string; field_value: string }[];
  }) {
    await this.verifyLocation(payload.locationId);
    const token = await this.locationToken(payload.locationId);
    const result = await this.request(
      "/contacts/upsert",
      token,
      "POST",
      payload,
    );
    if (!result.contact?.id || result.contact.locationId !== payload.locationId)
      throw new HttpError(502, "No se confirmó el contacto en el destino.");
    return result.contact.id;
  }
  async configure(s: OnboardingSession, release: SnapshotRelease) {
    const id = s.provision.locationId!;
    const token = await this.locationToken(id);
    const read = (path: string) => this.request(path, token);
    const root = `/locations/${encodeURIComponent(id)}/customValues`;
    const values = (await read(root)).customValues ?? [];
    const query = `?locationId=${encodeURIComponent(id)}`;
    const [p, f, w, c] = await Promise.all([
      read(`/opportunities/pipelines${query}`),
      read(`/forms/${query}`),
      read(`/workflows/${query}`),
      read(`/calendars/${query}`),
    ]);
    const pipelines = p.pipelines ?? [];
    const matching = pipelines.filter((p) => p.name === release.pipelineName);
    const pipeline = matching[0];
    if (
      matching.length !== 1 ||
      !pipeline.id ||
      JSON.stringify(pipeline.stages?.map((stage) => stage.name)) !==
        JSON.stringify(s.plan!.pipelineStages)
    )
      throw new HttpError(
        409,
        "Las etapas del pipeline no corresponden al plan aprobado.",
      );
    const requireAssets = (names: string[], items: Item[]) =>
      names.map((name) => {
        const matches = items.filter((i) => i.name === name);
        if (matches.length !== 1 || !matches[0].id)
          throw new HttpError(
            409,
            "La plantilla todavía no terminó de cargar o requiere revisión de sus activos.",
          );
        return matches[0].id;
      });
    if (
      s.plan!.archetype === "appointments"
        ? release.calendarNames.length === 0
        : release.formNames.length === 0
    )
      throw new HttpError(
        409,
        "La plantilla no incluye el activo principal del negocio.",
      );
    const assets = {
      pipelines: [pipeline.id],
      forms: requireAssets(release.formNames, f.forms ?? []),
      workflows: requireAssets(release.workflowNames, w.workflows ?? []),
      calendars: requireAssets(release.calendarNames, c.calendars ?? []),
    };
    // Only namespaced placeholders from the approved snapshot, and only empty or previously managed values.
    // Existing client changes require a separate, explicit change request.
    const managedValues: Record<string, string> = {};
    const changes: { id: string; name: string; value: string }[] = [];
    for (const [name, value] of expectedCustomValues(s.plan!)) {
      const matches = values.filter((v) => v.name === name);
      if (matches.length !== 1)
        throw new HttpError(
          409,
          `Falta verificar el campo de configuración ${name}.`,
        );
      const current = matches[0];
      const previous = s.provision.managedValues?.[name];
      if (
        current.value &&
        current.value !== value &&
        current.value !== previous
      )
        throw new HttpError(
          409,
          "Existe una personalización previa. Se requiere revisión antes de reemplazarla.",
        );
      if (current.value !== value)
        changes.push({ id: current.id, name, value });
      managedValues[name] = value;
    }
    for (const { id: fieldId, name, value } of changes) {
      await this.request(
        `${root}/${encodeURIComponent(fieldId)}`,
        token,
        "PUT",
        { name, value },
      );
    }
    const verified = (await read(root)).customValues ?? [];
    if (
      Object.entries(managedValues).some(
        ([name, value]) =>
          !verified.some((v) => v.name === name && v.value === value),
      )
    )
      throw new HttpError(
        502,
        "La personalización aún no se refleja en el proveedor.",
      );
    return { managedValues, assets };
  }
}
