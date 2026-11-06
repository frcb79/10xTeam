import { z } from "zod";
import type { OnboardingSession } from "@/lib/onboarding/model";
import { HttpError } from "@/lib/onboarding/security";
import {
  expectedCustomValues,
  type ProvisionProvider,
  type SnapshotRelease,
} from "@/lib/onboarding/provision";

const releaseSchema = z.object({
  snapshotId: z.string().min(1),
  version: z.string().min(1),
  validated: z.literal(true),
  noExternalActions: z.literal(true),
  pipelineName: z.string().min(1),
  workflowNames: z.array(z.string().min(1)).min(1),
  formNames: z.array(z.string().min(1)),
  calendarNames: z.array(z.string().min(1)),
});
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
  locations?: { id: string; name?: string; email?: string }[];
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

export class GhlProvisionProvider implements ProvisionProvider {
  constructor(
    private readonly agencyToken: string,
    private readonly companyId: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {
    if (!agencyToken || !companyId)
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
  async createLocation(s: OnboardingSession, release: SnapshotRelease) {
    const c = s.draft.context!;
    const a = s.draft.answers;
    const existing = await this.request(
      "/locations/search?" +
        new URLSearchParams({
          companyId: this.companyId,
          email: a.step6!.ownerEmail,
        }),
      this.agencyToken,
    );
    if (!Array.isArray(existing.locations))
      throw new HttpError(502, "No se pudo comprobar si existe el negocio.");
    if (
      existing.locations.some(
        (location) =>
          location.name?.trim().toLowerCase() ===
          a.step2!.businessName.trim().toLowerCase(),
      )
    )
      throw new HttpError(
        409,
        "Ya existe una cuenta candidata. Verificar y vincularla antes de volver a crear.",
      );
    const result = await this.request("/locations/", this.agencyToken, "POST", {
      companyId: this.companyId,
      name: a.step2!.businessName,
      email: a.step6!.ownerEmail,
      country: c.country,
      timezone: c.timezone,
      website: c.websiteUrl || undefined,
      snapshotId: release.snapshotId,
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
    const r = await this.request(
      `/locations/${encodeURIComponent(id)}`,
      this.agencyToken,
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
    const token = await this.request(
      "/oauth/locationToken",
      this.agencyToken,
      "POST",
      new URLSearchParams({
        companyId: this.companyId,
        locationId: payload.locationId,
      }),
    );
    if (!token.access_token || token.locationId !== payload.locationId)
      throw new HttpError(403, "Destino de contacto inválido.");
    const result = await this.request(
      "/contacts/upsert",
      token.access_token,
      "POST",
      payload,
    );
    if (!result.contact?.id || result.contact.locationId !== payload.locationId)
      throw new HttpError(502, "No se confirmó el contacto en el destino.");
    return result.contact.id;
  }
  async configure(s: OnboardingSession, release: SnapshotRelease) {
    const id = s.provision.locationId!;
    const token = await this.request(
      "/oauth/locationToken",
      this.agencyToken,
      "POST",
      new URLSearchParams({ companyId: this.companyId, locationId: id }),
    );
    if (!token.access_token || token.locationId !== id)
      throw new HttpError(403, "No se pudo comprobar el acceso al negocio.");
    const read = (path: string) => this.request(path, token.access_token!);
    const root = `/locations/${encodeURIComponent(id)}/customValues`;
    const values = (await read(root)).customValues ?? [];
    // Only namespaced placeholders from the approved snapshot, and only empty or previously managed values.
    // Existing client changes require a separate, explicit change request.
    const managedValues: Record<string, string> = {};
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
        await this.request(
          `${root}/${encodeURIComponent(current.id)}`,
          token.access_token,
          "PUT",
          { name, value },
        );
      managedValues[name] = value;
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
    const query = `?locationId=${encodeURIComponent(id)}`;
    const [p, f, w, c] = await Promise.all([
      read(`/opportunities/pipelines${query}`),
      read(`/forms/${query}`),
      read(`/workflows/${query}`),
      read(`/calendars/${query}`),
    ]);
    const pipelines = p.pipelines ?? [];
    const pipeline = pipelines.find((p) => p.name === release.pipelineName);
    if (
      !pipeline ||
      s.plan!.pipelineStages.some(
        (stage) => !pipeline.stages?.some((s) => s.name === stage),
      )
    )
      throw new HttpError(
        409,
        "Las etapas del pipeline no corresponden al plan aprobado.",
      );
    const requireAssets = (names: string[], items: Item[]) =>
      names.map((name) => {
        const matches = items.filter((i) => i.name === name);
        if (matches.length !== 1)
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
    return {
      managedValues,
      assets: {
        pipelines: [pipeline.id],
        forms: requireAssets(release.formNames, f.forms ?? []),
        workflows: requireAssets(release.workflowNames, w.workflows ?? []),
        calendars: requireAssets(release.calendarNames, c.calendars ?? []),
      },
    };
  }
}
