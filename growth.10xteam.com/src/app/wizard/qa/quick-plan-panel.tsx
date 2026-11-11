"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";

export function QuickPlanPanel() {
  const router = useRouter();
  const { remote } = useWizard();
  const s = remote.view?.session;
  const [goal, setGoal] = useState<"leads" | "sales">("leads");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!s) return <p className="p-6">Recuperando tu negocio QA…</p>;
  if (s.plan)
    return (
      <main className="mx-auto max-w-3xl space-y-5 px-5 py-12 text-stone-100">
        <h1 className="text-2xl font-semibold">El plan preliminar ya está guardado</h1>
        <Link className="text-cyan-300 underline" href="/wizard/complete">
          Revisar el plan y sus autorizaciones
        </Link>
      </main>
    );
  const business = s.draft.answers.step2;
  if (!business)
    return <p className="p-6">Primero completa los datos básicos del negocio.</p>;
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-5 py-12 text-stone-100">
      <p className="text-sm text-cyan-300">Consultoría LAB · Ruta de prueba</p>
      <h1 className="text-3xl font-semibold">Prepara tu plan sin llenar los otros cuatro pasos</h1>
      <p>
        Recuperamos <strong>{business.businessName}</strong> y su industria.
        No volveremos a pedirte lo que ya registraste.
      </p>
      <section className="rounded-2xl border border-white/15 bg-slate-900/75 p-6">
        <label className="block space-y-2">
          <span className="font-semibold">¿Qué deseas priorizar inicialmente?</span>
          <select
            className="w-full rounded-xl bg-slate-800 p-3"
            value={goal}
            onChange={(e) => setGoal(e.target.value as "leads" | "sales")}
          >
            <option value="leads">Conseguir y ordenar prospectos</option>
            <option value="sales">Mejorar seguimiento y ventas</option>
          </select>
        </label>
        <p className="mt-4 text-sm text-stone-300">
          Prepararemos un plan estándar con CRM, pipeline y formularios de prueba.
          Comprador, presupuesto, resultados y canales quedan <strong>por confirmar</strong>.
          La propuesta no activa HighLevel ni autoriza cobros o mensajes.
        </p>
        {error && <p role="alert" className="mt-3 text-amber-300">{error}</p>}
        <button
          className="mt-5 rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 disabled:opacity-50"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await remote.command("quick_plan", {
                goal,
                acceptedAssumptions: true,
              });
              router.push("/wizard/complete");
            } catch (e) {
              setError(e instanceof Error ? e.message : "No se pudo crear el plan.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Preparando…" : "Preparar plan preliminar"}
        </button>
      </section>
    </main>
  );
}
