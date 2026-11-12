"use client";
import { useState } from "react";
import { services, type ServiceId } from "@/lib/onboarding/connections";
export function ConnectionForm({
  verify,
  busy,
  submit,
}: {
  verify: boolean;
  busy: boolean;
  submit: (fields: Record<string, unknown>) => void;
}) {
  const [service, choose] = useState<ServiceId>("forms");
  return (
    <details className="mt-4">
      <summary>
        {verify
          ? "Registrar verificación del proveedor"
          : "Registrar permiso por servicio"}
      </summary>
      <form
        className="mt-3 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const values = new FormData(e.currentTarget);
          submit({
            service,
            state: values.get("state"),
            scopes: String(values.get("scopes"))
              .split(",")
              .map((scope) => scope.trim()),
            reference: values.get("reference"),
          });
        }}
      >
        <label>
          Servicio{" "}
          <select
            className="rounded bg-slate-800 p-2"
            value={service}
            onChange={(e) => choose(e.target.value as ServiceId)}
          >
            {Object.entries(services).map(([key, [name]]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Decisión{" "}
          <select className="rounded bg-slate-800 p-2" name="state">
            {(verify
              ? [
                  ["connected", "Conexión comprobada"],
                  ["tested", "Prueba funcional aprobada"],
                  ["failed", "Falló la verificación"],
                ]
              : [
                  ["authorized", "Autorizo el alcance indicado"],
                  ["revoked", "Revoco el permiso"],
                ]
            ).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Permisos específicos separados por comas{" "}
          <input
            name="scopes"
            required
            maxLength={250}
            placeholder="p. ej. forms.readonly"
            className="rounded bg-slate-800 p-2"
          />
        </label>
        <label>
          Folio interno de la evidencia{" "}
          <input
            name="reference"
            required
            minLength={4}
            maxLength={80}
            pattern="[a-zA-Z0-9_\-]+"
            placeholder="p. ej. QA-0148"
            className="rounded bg-slate-800 p-2"
          />
        </label>
        <button
          className="justify-self-start rounded bg-slate-700 px-4 py-2"
          disabled={busy}
        >
          Guardar registro
        </button>
      </form>
    </details>
  );
}
