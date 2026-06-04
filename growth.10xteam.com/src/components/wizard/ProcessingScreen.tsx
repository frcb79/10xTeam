"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "@/hooks/useWizard";

const STAGES = [
  { title: "Consolidando respuestas", detail: "Unimos negocio, ICP y proceso." },
  { title: "Armando el perfil ideal", detail: "Convertimos lo ingresado en un documento claro." },
  { title: "Preparando materiales", detail: "Generamos una base comercial lista para vender." },
  { title: "Creando el reporte WOW", detail: "Ordenamos todo para que se vea convincente y premium." },
];

export function ProcessingScreen() {
  const router = useRouter();
  const { state } = useWizard();
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(value + 11, 96));
    }, 320);

    const redirectTimer = window.setTimeout(() => {
      router.replace("/wizard/complete");
    }, 3200);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(redirectTimer);
    };
  }, [router]);

  const activeStageIndex = useMemo(() => {
    if (progress < 35) return 0;
    if (progress < 58) return 1;
    if (progress < 80) return 2;
    return 3;
  }, [progress]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col justify-center px-5 py-10 md:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Estamos creando tu ICP</p>
        <h2 className="mt-3 text-3xl font-semibold text-stone-50 md:text-4xl">Transformando tus respuestas en un reporte premium</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300">
          {state.scrapedContent
            ? "Ya tenemos contexto de tu sitio. Ahora lo estamos ordenando para que se vea como un documento que un cliente sí quiere leer."
            : "Estamos usando tus respuestas para construir un perfil claro, útil y listo para ventas."}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-stone-100">Avance de construcción</p>
                <p className="text-xs text-stone-400">Lo que estamos creando detrás de escena</p>
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
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Lo que verá el cliente</p>
            <div className="mt-4 space-y-3 text-sm text-stone-300">
              <InfoLine label="Negocio" value={state.answers.step2?.businessName ?? "Pendiente"} />
              <InfoLine label="Industria" value={state.answers.step2?.industry ?? "Pendiente"} />
              <InfoLine label="Cliente ideal" value={state.answers.step3_b2b?.primaryDecisionMaker ?? state.answers.step3_b2c?.ageRange ?? "Pendiente"} />
              <InfoLine label="Resultado" value={state.answers.step3_b2b?.mainOutcome ?? state.answers.step3_b2c?.mainOutcome ?? "Pendiente"} />
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm font-medium text-stone-100">Documento en construcción</p>
              <p className="mt-2 text-sm text-stone-400">
                Estamos preparando una versión que ya sirve para mostrar, revisar y vender.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
      <span className="text-stone-400">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-stone-100">{value}</span>
    </div>
  );
}
