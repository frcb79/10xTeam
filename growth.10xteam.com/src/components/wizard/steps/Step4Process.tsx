"use client";

import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";

export function Step4Process() {
  const { state, updateStep4, goNext, goPrev } = useWizard();
  const current = state.answers.step4;
  const [salesCycleDuration, setSalesCycleDuration] = useState(current?.salesCycleDuration ?? "1-4_weeks");
  const [topObjection, setTopObjection] = useState(current?.topObjection ?? "Precio");
  const [whyCompetitorsFail, setWhyCompetitorsFail] = useState(current?.whyCompetitorsFail ?? "Falta de seguimiento consistente");
  const [uniqueDifferentiator, setUniqueDifferentiator] = useState(current?.uniqueDifferentiator ?? "Proceso comercial estandarizado con seguimiento y cadencias claras");

  const handleContinue = () => {
    updateStep4({
      salesCycleDuration,
      salesCycleNotes: "Ciclo definido para el MVP",
      topObjection,
      topObjectionResolution: "Mostrar costo de inacción y siguiente paso concreto",
      antiICP: "Clientes que solo buscan precio",
      highRiskICP: "Clientes que quieren resultados rápidos sin compromiso operativo",
      mainCompetitors: "Alternativas manuales y agencias genéricas",
      whyChoseUs: "Sistema y enfoque comercial",
      whyCompetitorsFail,
      uniqueDifferentiator,
    });
    goNext();
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 4 · Proceso</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">Cómo vendes y por qué te eligen</h2>
      <div className="mt-6 grid gap-4">
        <label className="block text-sm text-stone-300">
          Ciclo de venta
          <select value={salesCycleDuration} onChange={(e) => setSalesCycleDuration(e.target.value as typeof salesCycleDuration)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
            <option value="same_day">Mismo día</option>
            <option value="1-7_days">1-7 días</option>
            <option value="1-4_weeks">1-4 semanas</option>
            <option value="1-3_months">1-3 meses</option>
            <option value="3+_months">3+ meses</option>
          </select>
        </label>
        <label className="block text-sm text-stone-300">
          Objeción principal
          <textarea value={topObjection} onChange={(e) => setTopObjection(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" />
        </label>
        <label className="block text-sm text-stone-300">
          Por qué fallan las alternativas
          <textarea value={whyCompetitorsFail} onChange={(e) => setWhyCompetitorsFail(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" />
        </label>
        <label className="block text-sm text-stone-300">
          Diferenciador único
          <textarea value={uniqueDifferentiator} onChange={(e) => setUniqueDifferentiator(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" />
        </label>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={goPrev} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200">Atrás</button>
        <button type="button" onClick={handleContinue} className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950">Continuar</button>
      </div>
    </div>
  );
}
