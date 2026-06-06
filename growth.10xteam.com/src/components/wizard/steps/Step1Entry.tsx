"use client";

import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";
import { ICPScoreMeter } from "@/components/wizard/ICPScoreMeter";
import type { PrefillConfidence } from "@/types/wizard.types";

interface PrefillResponse {
  oneLiner: string;
  industry: string;
  mainPain: string;
  mainOutcome: string;
  differentiator: string;
  confidence: PrefillConfidence;
}

export function Step1Entry() {
  const { state, setWebsiteUrl, setScrapedContent, goNext, setError, setStatus } = useWizard();
  const [url, setUrl] = useState(state.websiteUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "reading" | "analyzing" | "done" | "error">("idle");

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setPhase("reading");
    setStatus("scraping");
    setWebsiteUrl(url.trim());

    try {
      setPhase("analyzing");

      const scrapeResponse = await fetch("/api/wizard/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: url.trim() }),
      });

      if (!scrapeResponse.ok) {
        throw new Error("No pudimos leer el sitio. Puedes continuar manualmente.");
      }

      const scrapePayload = await scrapeResponse.json() as { scrapedContent?: string };
      const scrapedContent = scrapePayload.scrapedContent ?? "";

      const prefillResponse = await fetch("/api/wizard/prefill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: url.trim(), scrapedContent }),
      });

      if (!prefillResponse.ok) {
        throw new Error("No pudimos pre-llenar el formulario. Revisa y continúa manualmente.");
      }

      const prefill = await prefillResponse.json() as PrefillResponse;
      setScrapedContent(scrapedContent, prefill.confidence);
      sessionStorage.setItem("wizard_prefill", JSON.stringify(prefill));
      setPhase("done");

      window.setTimeout(() => goNext(), 650);
    } catch (error) {
      setPhase("error");
      setStatus("error");
      setError(error instanceof Error ? error.message : "No pudimos leer el sitio.");
    } finally {
      setLoading(false);
    }
  };

  const handleManual = () => {
    setStatus("in_progress");
    goNext();
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-start">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 1 · Inicio</p>
        <h2 className="mt-3 text-3xl font-semibold text-stone-50 md:text-4xl">Arranquemos con tu negocio</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300">
          Si tienes sitio web, lo analizamos para pre-llenar la mayor parte del formulario. Si no, puedes continuar manualmente.
        </p>

        <div className="mt-8 rounded-3xl border border-cyan-300/15 bg-slate-950/70 p-5">
          <label className="block text-sm text-stone-300">
            URL del sitio
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://tuempresa.com"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none transition focus:border-cyan-300/60"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !url.trim()}
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analizando..." : "Analizar y pre-llenar"}
            </button>
            <button
              type="button"
              onClick={handleManual}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200"
            >
              Llenar manualmente
            </button>
          </div>

          <div className="mt-4 text-sm text-stone-400">
            {phase === "idle" && "Puedes usar la URL o pasar directo al formulario."}
            {phase === "reading" && "Leyendo el sitio..."}
            {phase === "analyzing" && "Extrayendo campos para pre-llenado..."}
            {phase === "done" && "Listo. Ya pre-llenamos lo que pudimos."}
            {phase === "error" && "No pudimos leer el sitio. Puedes continuar manualmente."}
          </div>
        </div>
      </section>

      <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Lo que ganas</p>
        <div className="space-y-3 text-sm text-stone-300">
          <InfoCard title="Más velocidad" text="Empiezas con datos sugeridos en lugar de llenar todo desde cero." />
          <InfoCard title="Menos fricción" text="Si el sitio falla, seguimos manualmente sin romper el flujo." />
          <InfoCard title="Mejor base" text="El contexto scrapeado alimenta el resto del wizard y los materiales." />
        </div>
        <ICPScoreMeter total={state.icpScore?.total ?? null} />
      </aside>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <p className="font-medium text-stone-50">{title}</p>
      <p className="mt-1 text-sm text-stone-400">{text}</p>
    </div>
  );
}
