"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadCurrentDiagnostic } from "@/lib/diagnostic-storage";
import type { DiagnosticRecord } from "@/types/diagnostic.types";

function truncateText(value: string, max = 84): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}...`;
}

function BlurredLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-stone-400">{label}</p>
      <p className="mt-1 text-sm text-stone-100 blur-[2.8px] select-none">{value}</p>
    </div>
  );
}

export default function ActivacionPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticRecord | null>(null);

  useEffect(() => {
    setDiagnostic(loadCurrentDiagnostic());
  }, []);

  const preview = useMemo(() => {
    if (!diagnostic) return null;

    return {
      businessName: truncateText(diagnostic.businessName, 38),
      industry: truncateText(diagnostic.industry, 36),
      oneLiner: truncateText(diagnostic.oneLiner, 96),
      profile: truncateText(diagnostic.icpSummary.profile, 56),
      pain: truncateText(diagnostic.icpSummary.pain, 92),
      outcome: truncateText(diagnostic.icpSummary.outcome, 92),
      objection: truncateText(diagnostic.mechanismSummary.objection, 78),
      differentiator: truncateText(diagnostic.mechanismSummary.differentiator, 78),
    };
  }, [diagnostic]);

  if (!preview) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl px-5 py-12 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Activación</p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-50">Aún no hay un diagnóstico activo</h1>
          <p className="mt-3 text-sm text-stone-300">
            Completa el wizard para generar tu diagnóstico y desbloquear el preview de activación.
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
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Activación · Preview</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-50 md:text-4xl">
          Ya analizamos tu negocio. Aquí está tu preview estratégico.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-300">
          Este preview es intencionalmente limitado. En la llamada de activación te presentamos el diagnóstico
          completo aplicado a tu caso, con prioridades y plan de ejecución.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-stone-100">Diagnóstico estratégico (vista limitada)</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <BlurredLine label="Empresa" value={preview.businessName} />
              <BlurredLine label="Industria" value={preview.industry} />
              <BlurredLine label="Propuesta" value={preview.oneLiner} />
              <BlurredLine label="Perfil ICP" value={preview.profile} />
              <BlurredLine label="Dolor principal" value={preview.pain} />
              <BlurredLine label="Resultado esperado" value={preview.outcome} />
              <BlurredLine label="Objeción crítica" value={preview.objection} />
              <BlurredLine label="Diferenciador" value={preview.differentiator} />
            </div>
            <p className="mt-4 text-xs text-stone-400">
              Vista parcial para preparación de llamada. El contenido completo se comparte en activación.
            </p>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-stone-100">Siguiente paso</p>
            <p className="mt-2 text-sm text-stone-300">
              Agenda tu llamada para revisar el diagnóstico completo de tu negocio y activar todo el sistema.
            </p>

            <a
              href="https://calendar.10xteam.com.mx/activacion"
              target="_blank"
              rel="noreferrer"
              className="mt-5 block rounded-full bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-slate-950"
            >
              Agendar llamada de activación
            </a>

            <a
              href="/diagnostico-estrategico-10x-template.html"
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-2.5 text-center text-sm font-semibold text-cyan-100"
            >
              Diagnóstico Completo Muestra
            </a>

            <Link
              href="/wizard/complete"
              className="mt-3 block rounded-full border border-white/15 px-5 py-2.5 text-center text-sm font-semibold text-stone-200"
            >
              Volver al resumen
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
