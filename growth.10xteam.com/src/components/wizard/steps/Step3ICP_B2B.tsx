"use client";

import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";

const INDUSTRY_EXAMPLES: Record<string, {
  buyerPersona: string[];
  pain: string[];
  outcome: string[];
}> = {
  salud_odontologia: {
    buyerPersona: [
      "Dueño de clínica dental con 2-4 sillones y presión por mantener agenda llena.",
      "Directora de clínica que necesita más tratamientos aceptados, no solo valoraciones.",
    ],
    pain: [
      "Llegan prospectos, pero la recepción responde tarde y muchas valoraciones no se convierten en tratamiento.",
      "La agenda tiene huecos y no existe un proceso constante para recuperar pacientes que no agendaron o no regresaron.",
    ],
    outcome: [
      "Tener más valoraciones convertidas en tratamientos pagados y una agenda más estable durante el mes.",
      "Subir aceptación de tratamientos y reducir fugas entre primer contacto, cita y cierre.",
    ],
  },
  salud_medicina: {
    buyerPersona: [
      "Dueño de clínica o médico especialista que necesita agenda más estable sin cargar todo en recepción.",
      "Administrador de clínica que debe justificar inversión con más citas y mejor aprovechamiento de agenda.",
    ],
    pain: [
      "Llegan interesados, pero entre respuesta tardía, cancelaciones y poco seguimiento se pierden citas valiosas.",
      "La agenda depende demasiado de recomendaciones y no existe un proceso firme para mover interesados a consulta pagada.",
    ],
    outcome: [
      "Tener más citas confirmadas, menos fuga entre contacto y consulta, y mejor ocupación de agenda.",
      "Subir conversión de prospecto a paciente con un seguimiento más rápido y más ordenado.",
    ],
  },
  inmobiliaria: {
    buyerPersona: [
      "Director comercial de desarrollo inmobiliario que necesita acelerar citas y apartados.",
      "Asesor senior con alto volumen de leads pero seguimiento inconsistente.",
    ],
    pain: [
      "Los leads llegan, pero se enfrían entre el primer contacto y la visita al desarrollo.",
      "Hay mucho interés inicial, pero poco seguimiento estructurado para mover al prospecto a cita y cierre.",
    ],
    outcome: [
      "Convertir más leads en visitas agendadas y más visitas en apartados.",
      "Tener seguimiento por etapa para no perder prospectos tibios con intención real.",
    ],
  },
  consultoria: {
    buyerPersona: [
      "Socio o fundador de firma que hoy depende demasiado de referidos y seguimiento manual.",
      "Director de consultoría que necesita pipeline predecible sin perseguir cada oportunidad.",
    ],
    pain: [
      "Tienen conversaciones valiosas, pero propuestas que se enfrían por falta de seguimiento y urgencia.",
      "El pipeline depende del fundador y no existe un sistema que ayude a convertir interés en cierre.",
    ],
    outcome: [
      "Cerrar más propuestas abiertas con mejor seguimiento y claridad de valor.",
      "Tener flujo comercial más predecible sin cargar toda la venta en una sola persona.",
    ],
  },
  tecnologia: {
    buyerPersona: [
      "Head of Sales o fundador SaaS que necesita mover demos a oportunidades reales.",
      "Líder comercial que ya genera demanda pero pierde avance entre demo, follow-up y cierre.",
    ],
    pain: [
      "El equipo consigue demos, pero no existe una cadencia clara para moverlas a propuesta o cierre.",
      "Hay fuga entre lead, demo y decisión porque el seguimiento no responde al comportamiento del prospecto.",
    ],
    outcome: [
      "Subir conversión de demo a oportunidad y reducir tiempo de seguimiento comercial.",
      "Tener pipeline más sano y visibilidad clara de qué prospectos sí están listos para avanzar.",
    ],
  },
  legal: {
    buyerPersona: [
      "Socio o director de despacho que necesita convertir más consultas en clientes pagados.",
      "Abogado fundador con buen expertise, pero sin seguimiento comercial consistente después del primer contacto.",
    ],
    pain: [
      "Llegan consultas, pero muchas se enfrían entre la primera llamada, la propuesta y el cierre.",
      "El despacho responde bien cuando hay tiempo, pero no tiene una cadencia comercial que sostenga conversiones.",
    ],
    outcome: [
      "Cerrar más asuntos con seguimiento profesional y mejor urgencia comercial.",
      "Tener un pipeline más claro desde consulta inicial hasta firma o anticipo.",
    ],
  },
  financiero: {
    buyerPersona: [
      "Broker, asesor o director comercial que vive de velocidad de respuesta y confianza percibida.",
      "Responsable comercial de firma financiera que necesita mover más prospectos a análisis y cierre.",
    ],
    pain: [
      "El prospecto muestra interés, pero se enfría rápido si no recibe seguimiento oportuno y claro.",
      "La operación depende de respuestas manuales y eso reduce citas, análisis completos y cierres.",
    ],
    outcome: [
      "Tener más prospectos calificados llegando a cita y más oportunidades avanzando a cierre.",
      "Reducir fuga entre interés inicial, documentación y decisión de compra.",
    ],
  },
  manufactura: {
    buyerPersona: [
      "Director comercial o gerente general que necesita pipeline más predecible en cuentas industriales.",
      "Líder de ventas B2B que trabaja oportunidades largas y necesita seguimiento estructurado.",
    ],
    pain: [
      "Las oportunidades avanzan lento y muchas se enfrían por falta de seguimiento entre cotización y decisión.",
      "Se generan contactos valiosos, pero el proceso comercial no mantiene urgencia ni visibilidad de avance.",
    ],
    outcome: [
      "Acelerar seguimiento comercial y tener más control sobre oportunidades que sí van a cerrar.",
      "Mover más cuentas industriales de interés a cotización y de cotización a cierre.",
    ],
  },
  marketing_agencia: {
    buyerPersona: [
      "Fundador de agencia que quiere dejar de perseguir propuestas y mejorar su tasa de cierre.",
      "Director comercial de agencia que necesita ordenar pipeline y seguimiento por etapa.",
    ],
    pain: [
      "Las propuestas se enfrían porque no existe una secuencia comercial clara después de la llamada inicial.",
      "Hay interés, pero el equipo no sostiene seguimiento ni objeciones con el mismo nivel de consistencia.",
    ],
    outcome: [
      "Cerrar más propuestas con un proceso comercial más convincente y repetible.",
      "Tener pipeline más ordenado y menos dependencia del fundador en cada cierre.",
    ],
  },
  otro: {
    buyerPersona: [
      "Persona responsable de comprar o autorizar el servicio dentro del negocio.",
      "Perfil que siente el problema, compara opciones y necesita justificar la decisión.",
    ],
    pain: [
      "Hay interés inicial, pero se pierde entre conversaciones sueltas, seguimiento débil y poca urgencia.",
      "El negocio genera oportunidades, pero no tiene un sistema claro para convertirlas con consistencia.",
    ],
    outcome: [
      "Cerrar más oportunidades con un proceso de seguimiento más ordenado y convincente.",
      "Reducir fugas del pipeline y tener más claridad de qué sí convierte.",
    ],
  },
};

export function Step3ICP_B2B() {
  const { state, updateStep3B2B, goNext, goPrev } = useWizard();
  const current = state.answers.step3_b2b;
  const industry = state.answers.step2?.industry ?? "otro";
  const examples = INDUSTRY_EXAMPLES[industry] ?? INDUSTRY_EXAMPLES.otro;
  const [primaryDecisionMaker, setPrimaryDecisionMaker] = useState(current?.primaryDecisionMaker ?? "");
  const [mainPain, setMainPain] = useState(current?.mainPain ?? "");
  const [mainOutcome, setMainOutcome] = useState(current?.mainOutcome ?? "");
  const [companySizeRange, setCompanySizeRange] = useState(current?.companySizeRange ?? "21-50");

  const handleContinue = () => {
    updateStep3B2B({
      primaryDecisionMaker,
      secondaryInfluencers: [],
      companySizeRange,
      targetIndustry: state.answers.step2?.industry ?? "",
      geographyPriority: "México",
      mainPain,
      mainPainConsequences: mainPain,
      costOfInaction: `Seguir con ${mainPain.toLowerCase()}`,
      costOfInactionAmount: "Pendiente",
      mainOutcome,
      outcomeTimeline: "90 días",
      typicalInvestmentRange: "Pendiente",
      budgetType: "business",
      decisionAuthority: "needs_approval",
    });
    goNext();
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 3 · Buyer Persona empresa</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">Define a la persona compradora y su realidad de compra</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
        En esta ruta construimos tu Buyer Persona empresa: quién compra, qué riesgo percibe y qué resultado necesita justificar internamente.
      </p>
      <div className="mt-6 grid gap-4">
        <label className="block text-sm text-stone-300">
          Buyer Persona principal
          <input value={primaryDecisionMaker} onChange={(e) => setPrimaryDecisionMaker(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Director comercial o dueña de clínica" />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.buyerPersona.join(" · ")}</p>
        </label>
        <label className="block text-sm text-stone-300">
          Tamaño de empresa cliente (si aplica)
          <select value={companySizeRange} onChange={(e) => setCompanySizeRange(e.target.value as typeof companySizeRange)} className="wizard-select mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
            <option value="1-5">1–5</option>
            <option value="6-20">6–20</option>
            <option value="21-50">21–50</option>
            <option value="51-200">51–200</option>
            <option value="201-500">201–500</option>
            <option value="500+">500+</option>
          </select>
        </label>
        <label className="block text-sm text-stone-300">
          Dolor principal
          <textarea value={mainPain} onChange={(e) => setMainPain(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Llegan prospectos, pero no existe seguimiento firme y el pipeline se enfría antes de cerrar." />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.pain.join(" · ")}</p>
        </label>
        <label className="block text-sm text-stone-300">
          Resultado esperado
          <textarea value={mainOutcome} onChange={(e) => setMainOutcome(e.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Subir conversión de lead a cita y ordenar el seguimiento para cerrar con más consistencia." />
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
