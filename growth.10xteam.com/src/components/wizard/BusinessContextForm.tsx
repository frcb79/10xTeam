"use client";
import { useState } from "react";
import {
  contextSchema,
  defaultContext,
  type BusinessContext,
} from "@/lib/onboarding/schema";
import { conditionalQuestions } from "@/lib/onboarding/plan";

const fieldClass =
  "mt-2 block w-full rounded-xl border border-white/20 bg-slate-900 p-3 text-stone-100";
const options = {
  journey: { self: "Por mi cuenta", assisted: "Con mi asesor en llamada" },
  goal: {
    leads: "Conseguir prospectos",
    sales: "Convertir oportunidades",
    appointments: "Concretar citas",
    retention: "Retener o renovar clientes",
  },
  bottleneck: {
    demand: "Faltan prospectos",
    followup: "Falta seguimiento",
    closing: "Se pierden propuestas",
    no_shows: "No se presentan a las citas",
    retention: "No renuevan",
    unknown: "Aún no lo sé",
  },
  budget: {
    none: "Sin inversión adicional",
    limited: "Presupuesto limitado",
    available: "Presupuesto disponible",
    unknown: "Por definir",
  },
  country: { MX: "México", US: "Estados Unidos" },
  currency: { MXN: "MXN", USD: "USD" },
  language: { es: "Español", en: "English" },
};
const channels = {
  calendar: "Agenda",
  email: "Correo",
  whatsapp: "WhatsApp",
  social: "Redes sociales",
  payments: "Pagos",
  ai: "IA",
} as const;
export function BusinessContextForm({
  initial,
  websiteUrl,
  busy,
  onSubmit,
}: {
  initial?: BusinessContext;
  websiteUrl?: string | null;
  busy: boolean;
  onSubmit: (c: BusinessContext) => Promise<void>;
}) {
  const [data, setData] = useState<BusinessContext>(
    () => initial ?? { ...defaultContext, websiteUrl: websiteUrl || "" },
  );
  const [error, setError] = useState("");
  const visible = conditionalQuestions(data);
  const set = <K extends keyof BusinessContext>(
    key: K,
    value: BusinessContext[K],
  ) => setData((prev) => ({ ...prev, [key]: value }));
  const choose = (key: keyof typeof options, label: string) => (
    <label>
      {label}
      <select
        className={fieldClass}
        value={data[key] ?? "self"}
        onChange={(e) => set(key, e.target.value as never)}
      >
        {Object.entries(options[key]).map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
  const input = (
    key:
      | "target90Days"
      | "channelResults"
      | "tools"
      | "preserve"
      | "brandVoice"
      | "contentCadence"
      | "capacity"
      | "restrictions"
      | "calendarHosts"
      | "timezone"
      | "websiteUrl",
    label: string,
    required = false,
  ) => (
    <label>
      {label}
      <input
        className={fieldClass}
        required={required}
        maxLength={key === "timezone" ? 120 : 2000}
        value={data[key] ?? "self"}
        onChange={(e) => set(key, e.target.value)}
      />
    </label>
  );
  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const parsed = contextSchema.safeParse({
          ...data,
          calendarHosts: data.goal === "appointments" ? data.calendarHosts : "",
          conversionPercent: visible.includes("conversionPercent")
            ? data.conversionPercent
            : null,
        });
        if (!parsed.success) {
          setError(parsed.error.issues.map((i) => i.message).join(" "));
          return;
        }
        try {
          await onSubmit(parsed.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "No se pudo guardar.");
        }
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {choose("journey", "¿Cómo estás completando el alta?")}
        {choose("goal", "¿Qué resultado quieres conseguir primero?")}
        {choose("bottleneck", "¿Dónde se detiene la venta?")}
        {input(
          "target90Days",
          "¿Qué resultado medible buscas en los próximos 90 días?",
          true,
        )}
        <label>
          Prospectos por mes · deja vacío si no lo sabes
          <input
            type="number"
            className={fieldClass}
            min="0"
            max="10000000"
            value={data.monthlyLeads ?? ""}
            onChange={(e) =>
              set(
                "monthlyLeads",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </label>
        {visible.includes("conversionPercent") && (
          <label>
            Porcentaje de prospectos que compran
            <input
              type="number"
              className={fieldClass}
              min="0"
              max="100"
              step=".1"
              value={data.conversionPercent ?? ""}
              onChange={(e) =>
                set(
                  "conversionPercent",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
          </label>
        )}
        {input(
          "channelResults",
          "¿Qué canal te trae mejores prospectos y cómo lo sabes?",
        )}
        {choose("budget", "Recursos para captar clientes")}
        {visible.includes("calendarHosts") &&
          input(
            "calendarHosts",
            "¿Quién atiende las citas y en qué horarios?",
            true,
          )}
        {input("tools", "Herramientas y procesos actuales")}
        {input(
          "preserve",
          "¿Qué debemos conservar al configurar tu negocio?",
          true,
        )}
        {input("capacity", "Equipo y capacidad de atención")}
        {input(
          "restrictions",
          "Restricciones operativas, de comunicación o de tu industria",
        )}
      </div>
      <details className="rounded-xl border border-white/15 p-4">
        <summary>Marca, contenido y configuración regional</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {input("brandVoice", "Tono de marca, estilo visual y referencias")}
          {input("contentCadence", "Formatos y frecuencia de publicación")}
          {input("websiteUrl", "Sitio que debemos conservar (https://)")}
          {choose("country", "País")}
          {choose("currency", "Moneda")}
          {choose("language", "Idioma")}
          {input("timezone", "Zona horaria IANA", true)}
        </div>
      </details>
      <fieldset>
        <legend>¿Algún canal es indispensable para cumplir tu objetivo?</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {(Object.keys(channels) as (keyof typeof channels)[]).map((id) => (
            <label key={id}>
              <input
                type="checkbox"
                checked={data.requiredChannels.includes(id)}
                onChange={(e) =>
                  set(
                    "requiredChannels",
                    e.target.checked
                      ? [...data.requiredChannels, id]
                      : data.requiredChannels.filter((c) => c !== id),
                  )
                }
              />{" "}
              {channels[id]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <input
          type="checkbox"
          checked={data.sharedSocialIdentity}
          onChange={(e) => set("sharedSocialIdentity", e.target.checked)}
        />{" "}
        Mi negocio comparte redes con otra marca o cuenta.
      </label>
      {visible.includes("socialRoutingReview") && (
        <p className="text-sm text-amber-200">
          Revisaremos quién publica y a qué negocio deben llegar mensajes y
          prospectos antes de solicitar acceso.
        </p>
      )}
      {error && (
        <p role="alert" className="text-amber-200">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950"
      >
        {busy ? "Guardando…" : "Guardar y preparar mi configuración"}
      </button>
    </form>
  );
}
