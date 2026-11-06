"use client";
import { useState } from "react";
import { sendCommand, type SessionView } from "@/hooks/useOnboardingSession";
export function ReviewPanel({ initial }: { initial: SessionView }) {
  const [view, setView] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const s = view.session;
  async function submit(action: string, fields: Record<string, unknown> = {}) {
    setBusy(true);
    setMessage("");
    try {
      setView(
        await sendCommand({ action, id: s.id, version: s.version, ...fields }),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Falló la operación.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-7 text-stone-100">
      <h1 className="text-2xl font-semibold">
        Verificación de {s.draft.answers.step2?.businessName}
      </h1>
      <p>
        {s.provision.status} · {view.readiness.status}
      </p>
      <p>{s.plan?.coreTest}</p>
      <ul>
        {view.readiness.gates.map((g) => (
          <li key={g.gate}>
            {g.passed ? "✓" : "Pendiente"} · {g.gate}{" "}
            {g.evidence && " · " + g.evidence.reference}
          </li>
        ))}
      </ul>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(
            "evidence",
            Object.fromEntries(new FormData(e.currentTarget)),
          );
        }}
      >
        <label>
          Criterio{" "}
          <select name="gate">
            {view.readiness.gates
              .filter((g) => s.provision.locationId || g.gate === "contract")
              .map((g) => (
                <option key={g.gate}>{g.gate}</option>
              ))}
          </select>
        </label>
        <label>
          Entorno{" "}
          <select name="kind">
            <option value="simulation">Simulación</option>
            <option value="real">Prueba real verificable</option>
          </select>
        </label>
        <label>
          Resultado{" "}
          <select name="outcome">
            <option value="fail">Pendiente de corrección</option>
            <option value="pass">Superado</option>
          </select>
        </label>
        <label>
          Referencia de evidencia (sin secretos){" "}
          <input
            name="reference"
            minLength={8}
            maxLength={500}
            required
            className="w-full rounded bg-slate-800 p-2"
          />
        </label>
        <button disabled={busy} className="rounded bg-slate-700 p-2">
          Registrar evidencia
        </button>
      </form>
      {view.executionEnabled && s.plan && (
        <button
          disabled={busy}
          onClick={() => void submit("provision")}
          className="rounded bg-slate-700 p-2"
        >
          Ejecutar o reintentar alta autorizada
        </button>
      )}
      {["manual_review", "running", "waiting_provider"].includes(
        s.provision.status,
      ) &&
        view.executionEnabled && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit(
                "reconcile",
                Object.fromEntries(new FormData(e.currentTarget)),
              );
            }}
          >
            <label>
              Location comprobada <input name="locationId" required />
            </label>
            <label>
              Evidencia de identidad del negocio{" "}
              <input name="reference" minLength={8} required />
            </label>
            <button disabled={busy}>Reconciliar</button>
          </form>
        )}
      <button
        disabled={busy || !view.readiness.ready}
        onClick={() => void submit("ready")}
        className="rounded bg-cyan-300 p-2 text-slate-950 disabled:opacity-40"
      >
        Confirmar entrega funcional
      </button>
      <p role="status">{message}</p>
    </main>
  );
}
