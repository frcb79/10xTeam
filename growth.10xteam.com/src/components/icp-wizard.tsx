"use client";

import { useEffect, useMemo, useState } from "react";
import type { GeneratedMaterials, WizardData } from "@/types/icp";
import type { ICPCard, ICPQualityScore, WizardAnswers } from "@/types/wizard.types";

const initialData: WizardData = {
  companyName: "",
  industry: "",
  employeeRange: "",
  idealRole: "",
  mainPain: "",
  expectedOutcome: "",
  preferredChannels: [],
  monthlyLeadGoal: "",
};

const steps = [
  "Negocio",
  "Cliente ideal",
  "Oferta",
  "Canales",
  "Resumen",
];

const channels = ["LinkedIn", "Instagram", "Facebook", "Email", "WhatsApp", "Ads"];
const WIZARD_DRAFT_KEY = "icp_wizard_draft_v2";

interface WizardPrefillResponse {
  oneLiner: string;
  industry: string;
  mainPain: string;
  mainOutcome: string;
  differentiator: string;
}

interface WizardDraftPayload {
  step: number;
  data: WizardData;
  updatedAt: string;
}

function getInitialWizardDraft(): { step: number; data: WizardData } {
  if (typeof window === "undefined") {
    return { step: 0, data: initialData };
  }

  try {
    const raw = window.localStorage.getItem(WIZARD_DRAFT_KEY);
    if (!raw) return { step: 0, data: initialData };

    const parsed = JSON.parse(raw) as { step?: number; data?: WizardData };
    const safeStep =
      typeof parsed.step === "number" && parsed.step >= 0 && parsed.step < steps.length
        ? parsed.step
        : 0;

    return {
      step: safeStep,
      data: parsed.data ?? initialData,
    };
  } catch {
    return { step: 0, data: initialData };
  }
}

export function IcpWizard() {
  const [draft] = useState(getInitialWizardDraft);
  const [step, setStep] = useState(draft.step);
  const [data, setData] = useState<WizardData>(draft.data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<GeneratedMaterials | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [icpScore, setIcpScore] = useState<ICPQualityScore | null>(null);
  const [prefillUrl, setPrefillUrl] = useState("");
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [icpDraft, setIcpDraft] = useState<ICPCard | null>(null);
  const [icpDraftLoading, setIcpDraftLoading] = useState(false);
  const [icpDraftError, setIcpDraftError] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const hasScoringInputs = data.mainPain.trim().length > 0 && data.expectedOutcome.trim().length > 0;
  const visibleScore = hasScoringInputs ? icpScore : null;

  const canAdvance = useMemo(() => {
    if (step === 0) {
      return data.companyName.trim() && data.industry.trim() && data.employeeRange;
    }
    if (step === 1) {
      return data.idealRole.trim() && data.mainPain.trim();
    }
    if (step === 2) {
      return data.expectedOutcome.trim();
    }
    if (step === 3) {
      return data.preferredChannels.length > 0 && data.monthlyLeadGoal;
    }
    return true;
  }, [data, step]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify({ step, data }));
  }, [step, data]);

  useEffect(() => {
    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch("/api/wizard/draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draft: {
              step,
              data,
              updatedAt: new Date().toISOString(),
            } satisfies WizardDraftPayload,
          }),
        });

        if (!response.ok && !cancelled) {
          // No rompemos UX por fallas de sync server-side.
          // Local storage sigue siendo fuente de verdad inmediata.
          console.warn("wizard draft sync failed");
        }
      } catch {
        if (!cancelled) {
          console.warn("wizard draft sync failed");
        }
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [step, data]);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromServer = async () => {
      try {
        const response = await fetch("/api/wizard/draft", { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as { draft: WizardDraftPayload | null };
        if (!payload.draft || cancelled) return;

        const hasLocalProgress =
          draft.step > 0 ||
          draft.data.companyName.trim().length > 0 ||
          draft.data.mainPain.trim().length > 0;

        if (hasLocalProgress) return;

        if (payload.draft.step >= 0 && payload.draft.step < steps.length) {
          setStep(payload.draft.step);
        }
        setData(payload.draft.data);
      } catch {
        // Silent fallback a localStorage.
      }
    };

    void hydrateFromServer();

    return () => {
      cancelled = true;
    };
    // draft es valor inicial congelado por lazy init; usamos este estado para decidir hydration.
  }, [draft]);

  useEffect(() => {
    if (!data.mainPain.trim() || !data.expectedOutcome.trim()) {
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      if (cancelled) return;
      setScoring(true);
      setScoreError(null);

      try {
        const response = await fetch("/api/wizard/icp-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers: mapWizardAnswers(data) }),
        });

        if (!response.ok) {
          const apiError = (await response.json()) as { error?: string };
          throw new Error(apiError.error ?? "No fue posible calcular el score ICP.");
        }

        const payload = (await response.json()) as { score: ICPQualityScore };
        if (!cancelled) setIcpScore(payload.score);
      } catch (requestError) {
        if (!cancelled) {
          setScoreError(
            requestError instanceof Error
              ? requestError.message
              : "No fue posible calcular el score ICP."
          );
        }
      } finally {
        if (!cancelled) setScoring(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [data]);

  const generateMaterials = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/icp/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wizardData: data,
          icpCard: icpDraft,
        }),
      });

      if (!response.ok) {
        const apiError = (await response.json()) as { error?: string };
        throw new Error(apiError.error ?? "Error generando materiales.");
      }

      const payload = (await response.json()) as GeneratedMaterials;
      setMaterials(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar materiales."
      );
    } finally {
      setLoading(false);
    }
  };

  const prefillFromWebsite = async () => {
    if (!prefillUrl.trim()) {
      setPrefillError("Comparte una URL valida para autollenar campos.");
      return;
    }

    setPrefillLoading(true);
    setPrefillError(null);

    try {
      const scrapeResponse = await fetch("/api/wizard/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ websiteUrl: prefillUrl.trim() }),
      });

      let scrapedContent: string | undefined;

      if (scrapeResponse.ok) {
        const scrapePayload = (await scrapeResponse.json()) as { scrapedContent?: string };
        scrapedContent = scrapePayload.scrapedContent;
      }

      const response = await fetch("/api/wizard/prefill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteUrl: prefillUrl.trim(),
          scrapedContent,
        }),
      });

      if (!response.ok) {
        const apiError = (await response.json()) as { error?: string };
        throw new Error(apiError.error ?? "No fue posible autollenar el wizard.");
      }

      const payload = (await response.json()) as WizardPrefillResponse;

      setData((prev) => ({
        ...prev,
        companyName: prev.companyName || inferCompanyName(prefillUrl),
        industry: payload.industry || prev.industry,
        mainPain: payload.mainPain || prev.mainPain,
        expectedOutcome: payload.mainOutcome || prev.expectedOutcome,
      }));
    } catch (requestError) {
      setPrefillError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible autollenar el wizard."
      );
    } finally {
      setPrefillLoading(false);
    }
  };

  const generateIcpDraft = async () => {
    setIcpDraftLoading(true);
    setIcpDraftError(null);

    try {
      const response = await fetch("/api/wizard/icp-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: mapWizardAnswers(data) }),
      });

      if (!response.ok) {
        const apiError = (await response.json()) as { error?: string };
        throw new Error(apiError.error ?? "No fue posible generar ICP base.");
      }

      const payload = (await response.json()) as { icpCard: ICPCard; warning?: string | null };

      setIcpDraft(payload.icpCard);
      if (payload.warning) {
        setIcpDraftError(payload.warning);
      }
    } catch (requestError) {
      setIcpDraftError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar ICP base."
      );
    } finally {
      setIcpDraftLoading(false);
    }
  };

  const next = () => {
    if (step < steps.length - 1 && canAdvance) {
      setStep((value) => value + 1);
    }
  };

  const back = () => {
    if (step > 0) {
      setStep((value) => value - 1);
    }
  };

  const toggleChannel = (channel: string) => {
    setData((prev) => {
      const exists = prev.preferredChannels.includes(channel);
      return {
        ...prev,
        preferredChannels: exists
          ? prev.preferredChannels.filter((item) => item !== channel)
          : [...prev.preferredChannels, channel],
      };
    });
  };

  return (
    <section id="wizard" className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Wizard ICP</p>
          <h3 className="text-2xl font-semibold text-stone-100">Define tu cliente ideal en minutos</h3>
        </div>
        <span className="rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-300">
          Paso {step + 1}/{steps.length}
        </span>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-stone-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-7 text-sm text-stone-400">{steps[step]}</div>

      <div className="mb-6 rounded-2xl border border-stone-800 bg-stone-900 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-stone-100">ICP Quality Score (preview)</p>
          {scoring ? (
            <span className="text-xs text-cyan-300">Calculando...</span>
          ) : visibleScore ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                visibleScore.total >= 70
                  ? "bg-emerald-900/40 text-emerald-300"
                  : visibleScore.total >= 40
                    ? "bg-amber-900/40 text-amber-300"
                    : "bg-rose-900/40 text-rose-300"
              }`}
            >
              {visibleScore.total}/100
            </span>
          ) : (
            <span className="text-xs text-stone-400">Completa dolor y promesa para calcular</span>
          )}
        </div>

        {visibleScore && (
          <div className="grid gap-2 text-xs text-stone-300 md:grid-cols-2">
            <p>Dolor en palabras del cliente: {visibleScore.breakdown.painInClientWords}/25</p>
            <p>Promesa medible: {visibleScore.breakdown.measurablePromise}/25</p>
            <p>Diferenciador exclusivo: {visibleScore.breakdown.exclusiveDifferentiator}/25</p>
            <p>Detonador accionable: {visibleScore.breakdown.actionableTrigger}/25</p>
          </div>
        )}

        {scoreError && (
          <p className="mt-3 rounded-xl border border-rose-700 bg-rose-900/20 p-3 text-xs text-rose-300">
            {scoreError}
          </p>
        )}
      </div>

      {step === 0 && (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-100">Autollenado inteligente</p>
              <button
                type="button"
                onClick={prefillFromWebsite}
                disabled={prefillLoading}
                className="rounded-full bg-teal-300 px-4 py-2 text-xs font-semibold text-stone-950 disabled:opacity-50"
              >
                {prefillLoading ? "Analizando..." : "Autollenar con IA"}
              </button>
            </div>
            <label className="mt-3 flex flex-col gap-2 text-sm text-stone-300">
              URL del sitio
              <input
                className="rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
                value={prefillUrl}
                onChange={(event) => setPrefillUrl(event.target.value)}
                placeholder="https://tuempresa.com"
              />
            </label>
            <p className="mt-2 text-xs text-stone-400">
              Precarga industria, dolor principal y resultado esperado para acelerar onboarding.
            </p>
            {prefillError && (
              <p className="mt-3 rounded-xl border border-rose-700 bg-rose-900/20 p-3 text-xs text-rose-300">
                {prefillError}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-stone-300">
              Nombre de empresa
              <input
                className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
                value={data.companyName}
                onChange={(event) => setData({ ...data, companyName: event.target.value })}
                placeholder="Ej. Credito Negocios"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-300">
              Industria
              <input
                className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
                value={data.industry}
                onChange={(event) => setData({ ...data, industry: event.target.value })}
                placeholder="Ej. Servicios financieros"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-300 md:col-span-2">
              Tamano de empresa
              <select
                className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
                value={data.employeeRange}
                onChange={(event) => setData({ ...data, employeeRange: event.target.value })}
              >
                <option value="">Selecciona una opcion</option>
                <option value="1-10">1 a 10 personas</option>
                <option value="11-50">11 a 50 personas</option>
                <option value="51-200">51 a 200 personas</option>
                <option value="200+">Mas de 200 personas</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Rol del comprador ideal
            <input
              className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.idealRole}
              onChange={(event) => setData({ ...data, idealRole: event.target.value })}
              placeholder="Ej. Director comercial"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Dolor principal
            <textarea
              className="min-h-28 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.mainPain}
              onChange={(event) => setData({ ...data, mainPain: event.target.value })}
              placeholder="Ej. Generan leads, pero no convierten por falta de seguimiento"
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Resultado esperado
            <textarea
              className="min-h-28 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.expectedOutcome}
              onChange={(event) => setData({ ...data, expectedOutcome: event.target.value })}
              placeholder="Ej. Multiplicar citas calificadas en 90 dias"
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-sm text-stone-300">Canales prioritarios</p>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => {
                const selected = data.preferredChannels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      selected
                        ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                        : "border-stone-700 bg-stone-900 text-stone-300"
                    }`}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Meta mensual de leads calificados
            <select
              className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.monthlyLeadGoal}
              onChange={(event) => setData({ ...data, monthlyLeadGoal: event.target.value })}
            >
              <option value="">Selecciona una meta</option>
              <option value="10-20">10-20 leads</option>
              <option value="21-50">21-50 leads</option>
              <option value="51-100">51-100 leads</option>
              <option value="100+">100+ leads</option>
            </select>
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
              <p className="mb-2 text-sm font-semibold text-stone-100">Resumen ICP</p>
              <ul className="space-y-2 text-sm text-stone-300">
                <li><strong>Empresa:</strong> {data.companyName}</li>
                <li><strong>Industria:</strong> {data.industry}</li>
                <li><strong>Tamano:</strong> {data.employeeRange}</li>
                <li><strong>Rol:</strong> {data.idealRole}</li>
                <li><strong>Canales:</strong> {data.preferredChannels.join(", ")}</li>
                <li><strong>Meta:</strong> {data.monthlyLeadGoal}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
              <p className="mb-2 text-sm font-semibold text-stone-100">Output de activacion</p>
              <p className="mb-3 text-sm text-stone-400">
                Este output alimenta: mensajes de prospeccion, one-pager comercial y secuencias de seguimiento.
              </p>
              <pre className="overflow-auto rounded-xl bg-stone-950 p-3 text-xs text-teal-200">
{JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-100">Materiales por canal</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={generateIcpDraft}
                  disabled={icpDraftLoading}
                  className="rounded-full border border-teal-300/40 bg-teal-300/10 px-4 py-2 text-xs font-semibold text-teal-200 disabled:opacity-50"
                >
                  {icpDraftLoading ? "Generando ICP..." : "Generar ICP base"}
                </button>
                <button
                  type="button"
                  onClick={generateMaterials}
                  disabled={loading}
                  className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-stone-950 disabled:opacity-50"
                >
                  {loading ? "Generando..." : "Generar materiales"}
                </button>
              </div>
            </div>

            {icpDraft && (
              <div className="mt-4 rounded-xl border border-stone-800 bg-stone-950 p-3 text-sm text-stone-300">
                <p className="mb-2 text-xs uppercase tracking-[0.14em] text-teal-300">ICP base generado</p>
                <p><strong>Arquetipo:</strong> {icpDraft.archetypeName}</p>
                <p className="mt-1"><strong>Promesa:</strong> {icpDraft.promise}</p>
                <p className="mt-1"><strong>Mecanismo:</strong> {icpDraft.uniqueMechanism}</p>
                <p className="mt-1"><strong>Trigger:</strong> {icpDraft.trigger}</p>
              </div>
            )}

            {icpDraftError && (
              <p className="mt-3 rounded-xl border border-amber-600 bg-amber-900/20 p-3 text-sm text-amber-200">
                {icpDraftError}
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-xl border border-rose-700 bg-rose-900/20 p-3 text-sm text-rose-300">
                {error}
              </p>
            )}

            {materials && (
              <div className="mt-4 grid gap-4">
                <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 text-sm text-stone-300">
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-teal-300">Resumen generado</p>
                  {materials.icpSummary}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(materials.channels).map(([channel, item]) => (
                    <article key={channel} className="rounded-xl border border-stone-800 bg-stone-950 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">{channel}</p>
                      <h4 className="mt-2 text-sm font-semibold text-stone-100">{item.headline}</h4>
                      <p className="mt-2 text-sm text-stone-300">{item.message}</p>
                      <p className="mt-2 text-xs text-teal-300">CTA: {item.cta}</p>
                    </article>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <ListCard title="One-pager" items={materials.onePagerOutline} />
                  <ListCard title="Pitch deck" items={materials.pitchDeckOutline} />
                  <ListCard title="Guion de llamada" items={materials.callScript} />
                </div>

                <div className="rounded-xl border border-stone-800 bg-stone-950 p-3">
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-teal-300">Contenido social</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {materials.socialPosts.map((post) => (
                      <article key={`${post.channel}-${post.title}`} className="rounded-lg border border-stone-800 bg-stone-900 p-3">
                        <p className="text-xs text-cyan-300">{post.channel}</p>
                        <p className="mt-1 text-sm font-semibold text-stone-100">{post.title}</p>
                        <p className="mt-2 text-sm text-stone-300">{post.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance || step === steps.length - 1}
          className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}

function inferCompanyName(url: string): string {
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(normalized).hostname.replace(/^www\./, "");
    const root = hostname.split(".")[0] ?? "";
    return root
      .split(/[-_]/)
      .filter(Boolean)
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(" ");
  } catch {
    return "";
  }
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-950 p-3">
      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-cyan-300">{title}</p>
      <ul className="space-y-2 text-sm text-stone-300">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function mapWizardAnswers(data: WizardData): WizardAnswers {
  return {
    step2: {
      businessName: data.companyName,
      oneLiner: `Ayudamos a empresas de ${data.industry} a mejorar conversion comercial con seguimiento estructurado.`,
      industry: data.industry,
      industrySubcategory: data.industry,
      icpType: "b2b",
      productType: "servicio",
      revenueModel: "recurrente_mensual",
      priceRange: "3000_10000",
      marginBand: "40_60",
      purchaseFrequency: "mensual",
    },
    step3_b2b: {
      primaryDecisionMaker: data.idealRole,
      secondaryInfluencers: [],
      companySizeRange: normalizeCompanySize(data.employeeRange),
      targetIndustry: data.industry,
      geographyPriority: "Mexico",
      mainPain: data.mainPain,
      mainPainConsequences: data.mainPain,
      costOfInaction: `Si no se corrige, no se alcanza la meta de ${data.monthlyLeadGoal}.`,
      costOfInactionAmount: "N/A",
      mainOutcome: data.expectedOutcome,
      outcomeTimeline: "90 dias",
      typicalInvestmentRange: "Pendiente",
      budgetType: "business",
      decisionAuthority: "needs_approval",
    },
    step3_b2c: null,
    step4: {
      salesCycleDuration: "1-4_weeks",
      salesCycleNotes: "Ciclo comercial estimado",
      topObjection: "Precio",
      topObjectionResolution: "Comparar costo de inaccion vs inversion",
      antiICP: "Clientes solo enfocados en precio",
      highRiskICP: "Clientes con expectativas irreales",
      mainCompetitors: "Alternativas manuales y agencias genericas",
      whyChoseUs: "Ejecucion enfocada a conversion",
      whyCompetitorsFail: "Falta de seguimiento",
      uniqueDifferentiator: `Proceso comercial estandarizado para ${data.industry} con foco en ${data.expectedOutcome}`,
    },
    step5: null,
  };
}

function normalizeCompanySize(value: string) {
  if (value === "1-10") return "1-5" as const;
  if (value === "11-50") return "21-50" as const;
  if (value === "51-200") return "51-200" as const;
  return "201-500" as const;
}
