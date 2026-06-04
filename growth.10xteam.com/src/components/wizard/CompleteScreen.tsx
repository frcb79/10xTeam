"use client";

import Link from "next/link";
import { useWizard } from "@/hooks/useWizard";

export function CompleteScreen() {
  const { state, reset } = useWizard();
  const step2 = state.answers.step2;
  const step3 = state.answers.step3_b2b ?? state.answers.step3_b2c;
  const step4 = state.answers.step4;
  const step5 = state.answers.step5;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-5 py-10 md:px-8">
      <div className="rounded-[2rem] border border-emerald-400/20 bg-slate-950/85 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Completado</p>
        <h2 className="mt-3 text-3xl font-semibold text-stone-50 md:text-4xl">Tu reporte ya se ve como algo presentable</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-300">
          Este cierre ya no es solo un “terminaste”. Es una vista de revisión que te deja confirmar lo que ingresaste, mostrar avance y preparar la siguiente fase sin perder contexto.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card title="ICP Score" value={state.icpScore ? `${state.icpScore.total}/100` : "Pendiente"} />
          <Card title="Canales elegidos" value={step5?.activeChannels?.length ? `${step5.activeChannels.length}` : "Pendiente"} />
          <Card title="Estado" value={state.status} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-stone-100">Resumen de lo que ingresaste</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ReportCard label="Negocio" value={step2?.businessName ?? "Pendiente"} />
              <ReportCard label="Industria" value={step2?.industry ?? "Pendiente"} />
              <ReportCard label="Oferta" value={step2?.productType ?? "Pendiente"} />
              <ReportCard label="Modelo de ingresos" value={step2?.revenueModel ?? "Pendiente"} />
              <ReportCard label="Ticket promedio" value={step2?.priceRange ?? "Pendiente"} />
              <ReportCard label="Margen" value={step2?.marginBand ?? "Pendiente"} />
              <ReportCard label="Frecuencia de compra" value={step2?.purchaseFrequency ?? "Pendiente"} />
              <ReportCard label="Cliente ideal" value={step3?.primaryDecisionMaker ?? step3?.ageRange ?? "Pendiente"} />
              <ReportCard label="Resultado" value={step3?.mainOutcome ?? "Pendiente"} />
              <ReportCard label="Dolor" value={step3?.mainPain ?? "Pendiente"} />
              <ReportCard label="Diferenciador" value={step4?.uniqueDifferentiator ?? "Pendiente"} />
              <ReportCard label="Canales" value={step5?.activeChannels?.map((channel) => channel.channel).join(", ") ?? "Pendiente"} />
              <ReportCard label="Etapas" value={step5?.selectedFlows?.join(", ") ?? "Pendiente"} />
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-stone-100">Qué sigue después</p>
            <div className="mt-4 space-y-3 text-sm text-stone-300">
              <NextStep title="1. Revisar la plantilla ideal de ICP" text="Te deja una versión premium para ventas y demos." />
              <NextStep title="2. Afinar la generación final" text="Convertir este reporte en outputs listos para operar." />
              <NextStep title="3. Activar materiales por canal" text="Emails, mensajes y contenido con el mismo criterio." />
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-stone-100">Template ideal de ICP</p>
                <p className="text-sm text-stone-400">Un formato pensado para vender el sistema con claridad y efecto WOW.</p>
              </div>
              <Link href="/wizard/template" className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                Abrir template
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <MiniTemplate title="Portada" text="Nombre del ICP + frase de impacto." />
              <MiniTemplate title="Problema" text="Dolor, costo de no actuar y contexto real." />
              <MiniTemplate title="Promesa" text="Resultado medible con tiempo concreto." />
              <MiniTemplate title="Mecanismo" text="Por qué el sistema sí funciona diferente." />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-stone-100">Botones de salida</p>
            <p className="mt-2 text-sm text-stone-400">Te sirven para volver a empezar o limpiar un borrador viejo. No borran el valor construido; solo el estado de esta sesión.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/wizard/step/1" className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950">
                Empezar nuevo reporte
              </Link>
              <button type="button" onClick={reset} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200">
                Limpiar borrador
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{title}</p>
      <p className="mt-2 text-lg font-semibold text-stone-50">{value}</p>
    </div>
  );
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-2 text-sm font-medium leading-5 text-stone-50">{value}</p>
    </div>
  );
}

function NextStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <p className="text-sm font-semibold text-stone-50">{title}</p>
      <p className="mt-1 text-sm text-stone-400">{text}</p>
    </div>
  );
}

function MiniTemplate({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <p className="text-sm font-semibold text-stone-50">{title}</p>
      <p className="mt-1 text-sm text-stone-400">{text}</p>
    </div>
  );
}
