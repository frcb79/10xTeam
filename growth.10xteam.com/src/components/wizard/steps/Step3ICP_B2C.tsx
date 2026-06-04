"use client";

import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";

export function Step3ICP_B2C() {
  const { state, updateStep3B2C, goNext, goPrev } = useWizard();
  const current = state.answers.step3_b2c;
  const [ageRange, setAgeRange] = useState(current?.ageRange ?? "");
  const [mainPain, setMainPain] = useState(current?.mainPain ?? "");
  const [mainOutcome, setMainOutcome] = useState(current?.mainOutcome ?? "");

  const handleContinue = () => {
    updateStep3B2C({
      ageRange,
      lifeStage: [],
      incomeLevel: "",
      geography: "México",
      mainPain,
      mainDesire: mainOutcome,
      costOfInaction: `Seguir con ${mainPain.toLowerCase()}`,
      mainOutcome,
      outcomeTimeline: "90 días",
      typicalInvestmentRange: "Pendiente",
      paysFromOwnPocket: false,
    });
    goNext();
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 3 · ICP B2C</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">Perfil de cliente final</h2>
      <div className="mt-6 grid gap-4">
        <label className="block text-sm text-stone-300">
          Rango de edad
          <input value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. 28-45" />
        </label>
        <label className="block text-sm text-stone-300">
          Dolor principal
          <textarea value={mainPain} onChange={(e) => setMainPain(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" />
        </label>
        <label className="block text-sm text-stone-300">
          Resultado esperado
          <textarea value={mainOutcome} onChange={(e) => setMainOutcome(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" />
        </label>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={goPrev} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200">Atrás</button>
        <button type="button" onClick={handleContinue} className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950">Continuar</button>
      </div>
    </div>
  );
}
