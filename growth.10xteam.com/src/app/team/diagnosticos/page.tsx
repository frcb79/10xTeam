"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadCurrentDiagnostic, saveCurrentDiagnostic } from "@/lib/diagnostic-storage";
import type { DiagnosticRecord, DiagnosticStatus } from "@/types/diagnostic.types";

const STATUS_LABELS: Record<DiagnosticStatus, string> = {
  wizard_completed: "Wizard completado",
  call_pending: "Llamada pendiente",
  call_booked: "Llamada agendada",
  activated: "Activado",
  trial_active: "Trial activo",
  paid_active: "Pago activo",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-stone-400">{label}</p>
      <p className="mt-1 text-sm text-stone-100">{value}</p>
    </div>
  );
}

export default function TeamDiagnosticosPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticRecord | null>(null);

  const updateDiagnosticStatus = async (status: DiagnosticStatus) => {
    if (!diagnostic) return;

    const updated: DiagnosticRecord = {
      ...diagnostic,
      status,
    };

    saveCurrentDiagnostic(updated);
    setDiagnostic(updated);

    try {
      await fetch("/api/diagnostics/current", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, diagnosticId: diagnostic.id }),
      });
    } catch {
      // Keep local fallback when network/API is unavailable.
    }
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await fetch("/api/diagnostics/current", { cache: "no-store" });
        if (response.ok) {
          const payload = (await response.json()) as { diagnostic: DiagnosticRecord | null };
          if (mounted && payload.diagnostic) {
            setDiagnostic(payload.diagnostic);
            return;
          }
        }
      } catch {
        // Ignore and continue with local fallback.
      }

      if (mounted) {
        setDiagnostic(loadCurrentDiagnostic());
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (!diagnostic) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl px-5 py-12 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Equipo · Diagnósticos</p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-50">No hay diagnóstico cargado</h1>
          <p className="mt-3 text-sm text-stone-300">
            Completa un wizard para preparar la llamada con la vista interna completa.
          </p>
          <Link
            href="/wizard"
            className="mt-6 inline-flex rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950"
          >
            Ir al wizard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10 md:px-8">
      <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-950/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Equipo · Diagnóstico interno</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-50 md:text-4xl">{diagnostic.businessName}</h1>
        <p className="mt-3 text-sm text-stone-300">
          Vista completa para preparar la llamada de activación. Este contenido no debe mostrarse al prospecto
          antes de la llamada.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Field label="ID diagnóstico" value={diagnostic.id} />
          <Field label="Estado" value={STATUS_LABELS[diagnostic.status] ?? diagnostic.status} />
          <Field label="Creado" value={new Date(diagnostic.createdAt).toLocaleString()} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Contacto" value={diagnostic.contact?.name ?? "Pendiente"} />
          <Field label="Email" value={diagnostic.contact?.email ?? "Pendiente"} />
          <Field label="Telefono" value={diagnostic.contact?.phone ?? "Pendiente"} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-stone-100">Negocio e ICP</p>
            <div className="mt-4 grid gap-3">
              <Field label="Industria" value={diagnostic.industry} />
              <Field label="One-liner" value={diagnostic.oneLiner} />
              <Field label="Perfil" value={diagnostic.icpSummary.profile} />
              <Field label="Dolor" value={diagnostic.icpSummary.pain} />
              <Field label="Resultado" value={diagnostic.icpSummary.outcome} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-stone-100">Mecanismo y oportunidad</p>
            <div className="mt-4 grid gap-3">
              <Field label="Objeción" value={diagnostic.mechanismSummary.objection} />
              <Field label="Diferenciador" value={diagnostic.mechanismSummary.differentiator} />
              <Field label="Canales" value={diagnostic.channels.join(", ") || "Pendiente"} />
              <Field
                label="Oportunidad mensual estimada"
                value={`$${Number(diagnostic.estimatedOpportunityMonthly).toLocaleString("es-MX")} MXN`}
              />
              <Field
                label="ICP score"
                value={diagnostic.sourceState.icpScore ? `${diagnostic.sourceState.icpScore.total}/100` : "Pendiente"}
              />
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => updateDiagnosticStatus("call_booked")}
            className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2.5 text-sm font-semibold text-cyan-100"
          >
            Marcar llamada agendada
          </button>
          <button
            type="button"
            onClick={() => updateDiagnosticStatus("activated")}
            className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-5 py-2.5 text-sm font-semibold text-emerald-100"
          >
            Marcar activado
          </button>
          <Link
            href="/activacion"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200"
          >
            Ver vista prospecto
          </Link>
          <a
            href="https://calendar.10xteam.com.mx/activacion"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950"
          >
            Abrir agenda de llamada
          </a>
        </div>
      </div>
    </div>
  );
}
