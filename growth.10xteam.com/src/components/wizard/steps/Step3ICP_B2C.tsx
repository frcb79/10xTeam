"use client";

import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";

const INDUSTRY_EXAMPLES: Record<string, { profile: string[]; pain: string[]; outcome: string[] }> = {
  salud_odontologia: {
    profile: [
      "Persona adulta que quiere resolver un tratamiento dental importante, pero posterga por miedo, costo o desconfianza.",
      "Paciente con capacidad de pago que busca claridad, confianza y seguimiento antes de decidir.",
    ],
    pain: [
      "Quiere atenderse, pero pospone porque no siente suficiente confianza o seguimiento para avanzar.",
      "Pide información, pero entre dudas, tiempo y costo no termina agendando ni aceptando tratamiento.",
    ],
    outcome: [
      "Sentirse seguro para agendar, presentarse a valoración y avanzar a tratamiento con más confianza.",
      "Tener claridad del proceso, costo y beneficio para decidir sin tanta fricción.",
    ],
  },
  salud_bienestar: {
    profile: [
      "Mujer de 30-45 años, profesionista, con poco tiempo y cansada de intentar soluciones sueltas.",
      "Hombre o mujer con ingresos estables que sí pagaría por una solución clara y acompañada.",
    ],
    pain: [
      "Ha probado varias opciones, pero no logra sostener resultados y termina abandonando.",
      "Siente frustración porque invierte tiempo y dinero, pero no ve avance claro ni seguimiento real.",
    ],
    outcome: [
      "Lograr un cambio visible en 8-12 semanas con una metodología que sí pueda mantener.",
      "Tener claridad, acompañamiento y resultados medibles sin volver a empezar cada mes.",
    ],
  },
  educacion: {
    profile: [
      "Profesional joven que quiere crecer laboralmente y busca una formación aplicable, no solo teoría.",
      "Persona con trabajo actual que pagaría por avanzar más rápido con una ruta clara.",
    ],
    pain: [
      "Consume contenido, pero sigue sin una ruta concreta para obtener resultados reales.",
      "Se siente estancado porque ha tomado cursos sin implementación ni acompañamiento cercano.",
    ],
    outcome: [
      "Aprender una habilidad útil y convertirla en avance profesional visible en pocas semanas.",
      "Tener una ruta clara de implementación que sí lleve a certificación, empleo o más ingresos.",
    ],
  },
  ecommerce: {
    profile: [
      "Comprador digital que compara opciones, reseñas y confianza antes de pagar.",
      "Cliente con intención real, pero sensible a seguimiento, prueba social y claridad de oferta.",
    ],
    pain: [
      "Le interesa el producto, pero abandona porque no ve suficiente confianza, urgencia o claridad para comprar hoy.",
      "Ha comprado antes en línea, pero desconfía si no hay seguimiento o información clara después del interés inicial.",
    ],
    outcome: [
      "Comprar con más confianza y claridad sobre qué recibirá y por qué vale la pena hacerlo ahora.",
      "Sentir menos fricción en la decisión y avanzar con mayor seguridad a la compra.",
    ],
  },
  otro: {
    profile: [
      "Persona con intención real de compra, contexto específico y urgencia por resolver el problema.",
      "Cliente que ya intentó otras opciones y hoy valora más claridad, confianza y resultado.",
    ],
    pain: [
      "Intenta resolverlo sola, pero se frustra por falta de claridad y consistencia.",
      "Tiene el problema presente, pero no encuentra una solución que le dé confianza para avanzar.",
    ],
    outcome: [
      "Lograr un resultado medible con una ruta realista y sostenible.",
      "Tener más claridad, avance visible y una solución que sí se sostenga en su rutina.",
    ],
  },
};

export function Step3ICP_B2C() {
  const { state, updateStep3B2C, goNext, goPrev } = useWizard();
  const current = state.answers.step3_b2c;
  const industry = state.answers.step2?.industry ?? "otro";
  const examples = INDUSTRY_EXAMPLES[industry] ?? INDUSTRY_EXAMPLES.otro;
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
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 3 · Buyer Persona consumidor</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">Define a la persona que compra para sí misma</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
        Esta ruta aplica cuando el comprador final es una persona. Nos enfocamos en dolor real, deseo y resultado medible.
      </p>
      <div className="mt-6 grid gap-4">
        <label className="block text-sm text-stone-300">
          Buyer Persona y contexto de vida
          <input value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. 28-45" />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.profile.join(" · ")}</p>
        </label>
        <label className="block text-sm text-stone-300">
          Dolor principal
          <textarea value={mainPain} onChange={(e) => setMainPain(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Intenta resolverlo sola, se frustra por falta de claridad y abandona por no ver avance constante." />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.pain.join(" · ")}</p>
        </label>
        <label className="block text-sm text-stone-300">
          Resultado esperado
          <textarea value={mainOutcome} onChange={(e) => setMainOutcome(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Lograr un resultado medible en 8-12 semanas con un metodo que pueda sostener en su rutina real." />
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
