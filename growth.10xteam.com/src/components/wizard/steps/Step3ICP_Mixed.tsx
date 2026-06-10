"use client";

import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";

const MIXED_EXAMPLES: Record<string, { persona: string[]; pain: string[]; outcome: string[] }> = {
  otro: {
    persona: [
      "Dueño o líder comercial que influye en la compra, aunque el usuario final también pesa en la decisión.",
      "Perfil que combina criterio de negocio con sensibilidad del consumidor final.",
    ],
    pain: [
      "Hay interés, pero el mensaje no termina de conectar ni con quien paga ni con quien usa la solución.",
      "Se pierde avance porque el proceso comercial no traduce bien valor de negocio y valor percibido por la persona final.",
    ],
    outcome: [
      "Tener un mensaje más claro para mover a la compra tanto desde lógica de negocio como desde valor percibido.",
      "Cerrar más con un proceso que responda a ambos lados de la decisión.",
    ],
  },
};

export function Step3ICP_Mixed() {
  const { state, updateStep3B2B, goNext, goPrev } = useWizard();
  const examples = MIXED_EXAMPLES.otro;
  const [primaryDecisionMaker, setPrimaryDecisionMaker] = useState(state.answers.step3_b2b?.primaryDecisionMaker ?? "");
  const [mainPain, setMainPain] = useState(state.answers.step3_b2b?.mainPain ?? state.answers.step3_b2c?.mainPain ?? "");
  const [mainOutcome, setMainOutcome] = useState(state.answers.step3_b2b?.mainOutcome ?? state.answers.step3_b2c?.mainOutcome ?? "");

  const handleContinue = () => {
    updateStep3B2B({
      primaryDecisionMaker,
      secondaryInfluencers: [],
      companySizeRange: "21-50",
      targetIndustry: state.answers.step2?.industry ?? "",
      geographyPriority: "México",
      mainPain,
      mainPainConsequences: mainPain,
      costOfInaction: `Seguir con ${mainPain.toLowerCase()}`,
      costOfInactionAmount: "Pendiente",
      mainOutcome,
      outcomeTimeline: "90 días",
      typicalInvestmentRange: "Pendiente",
      budgetType: "both",
      decisionAuthority: "needs_approval",
    });
    goNext();
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 3 · Buyer Persona mixto</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">Unifica negocio y consumidor en un perfil accionable</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
        Usa esta ruta si vendes tanto a empresa o negocio como a consumidor final. Define la persona compradora principal y el dolor común para ambas rutas.
      </p>
      <div className="mt-6 grid gap-4">
        <label className="block text-sm text-stone-300">
          Buyer Persona principal
          <input value={primaryDecisionMaker} onChange={(e) => setPrimaryDecisionMaker(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Dueño o responsable principal" />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.persona.join(" · ")}</p>
        </label>
        <label className="block text-sm text-stone-300">
          Dolor principal
          <textarea value={mainPain} onChange={(e) => setMainPain(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. El mensaje actual no termina de convencer ni a quien paga ni a quien usa la solución." />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.pain.join(" · ")}</p>
        </label>
        <label className="block text-sm text-stone-300">
          Resultado esperado
          <textarea value={mainOutcome} onChange={(e) => setMainOutcome(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Lograr un mensaje y seguimiento que convierta mejor en ambos tipos de cliente." />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.outcome.join(" · ")}</p>
        </label>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={goPrev} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200">Atrás</button>
        <button type="button" onClick={handleContinue} className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950">Continuar</button>
      </div>
    </div>
  );
}
