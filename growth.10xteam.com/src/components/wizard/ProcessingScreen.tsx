"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "@/hooks/useWizard";
import { calculateOpportunity, formatCurrency } from "@/lib/utils/opportunity";

const STAGES = [
  { title: "Consolidando respuestas", detail: "Unimos negocio, ICP y proceso para una lectura util." },
  { title: "Construyendo tu perfil estrategico", detail: "Aterrizamos dolores, promesa y diferenciador." },
  { title: "Calculando oportunidad real", detail: "Modelamos costo de no actuar y potencial de crecimiento." },
  { title: "Preparando tu entrega final", detail: "Ordenamos todo para revisar, ajustar y activar." },
];

export function ProcessingScreen() {
  const router = useRouter();
  const { state, setStatus } = useWizard();
  const [progress, setProgress] = useState(8);
  const [readyToContinue, setReadyToContinue] = useState(false);
  const opportunity = useMemo(
    () => calculateOpportunity(state.answers.step6, state.answers.step2?.priceRange),
    [state.answers.step2?.priceRange, state.answers.step6]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer);
          setReadyToContinue(true);
          return value;
        }
        const next = Math.min(value + (value > 88 ? 1 : value > 68 ? 2 : 3), 100);
        if (next >= 100) {
          setReadyToContinue(true);
        }
        return next;
      });
    }, 900);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const handleContinue = () => {
    setStatus("complete");
    router.replace("/wizard/complete");
  };

  const activeStageIndex = useMemo(() => {
    if (progress < 35) return 0;
    if (progress < 58) return 1;
    if (progress < 80) return 2;
    return 3;
  }, [progress]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col justify-center px-5 py-10 md:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Estamos preparando tu entrega</p>
        <h2 className="mt-3 text-3xl font-semibold text-stone-50 md:text-4xl">Transformando tus respuestas en un</h2>
        <p className="mt-2 text-2xl font-semibold text-cyan-300 md:text-3xl">Diagnóstico Estratégico 10x</p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300">
          {state.scrapedContent
            ? "Ya tenemos el contexto de tu negocio. Ahora lo convertimos en una version accionable para vender mejor."
            : "Estamos estructurando tus respuestas para convertirlas en un diagnóstico claro, vendible y accionable."}
        </p>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-stone-100">Avance de construccion</p>
              <p className="text-xs text-stone-400">Etapas reales de procesamiento del diagnóstico</p>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
              {progress}%
            </span>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-6 space-y-3">
            {STAGES.map((stage, index) => {
              const isDone = index < activeStageIndex;
              const isCurrent = index === activeStageIndex;
              return (
                <div key={stage.title} className={`rounded-2xl border px-4 py-3 ${isDone ? "border-emerald-300/25 bg-emerald-300/10" : isCurrent ? "border-cyan-300/25 bg-cyan-300/10" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${isDone ? "bg-emerald-300/20 text-emerald-100" : isCurrent ? "bg-cyan-300/20 text-cyan-100" : "bg-white/10 text-stone-400"}`}>
                      {isDone ? "✓" : index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-50">{stage.title}</p>
                      <p className="text-xs text-stone-400">{stage.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {opportunity && (
            <div className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-100">Costo de no actuar</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(opportunity.totalMonthly)}/mes</p>
              <p className="mt-2 text-xs text-rose-100/90">
                Tiempo: {formatCurrency(opportunity.timeCostMonthly)} · Leads perdidos: {formatCurrency(opportunity.lostLeadsValueMonthly)} · Crecimiento: {formatCurrency(opportunity.growthValueMonthly)}
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-sm text-stone-300">
              {readyToContinue
                ? "Tu diagnóstico ya está listo. Ahora puedes revisarlo y ajustar antes de agendar activación."
                : "Estamos terminando los ultimos ajustes para entregarte una version convincente y util."}
            </p>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!readyToContinue}
              className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
