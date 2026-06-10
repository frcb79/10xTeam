"use client";

import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";

const BUSINESS_STAGES = [
  { value: "inicio", label: "Inicio (0-12 meses)", desc: "Validando oferta y primeros clientes" },
  { value: "estable", label: "Estable", desc: "Ingresos recurrentes y operacion definida" },
  { value: "escalando", label: "Escalando", desc: "Con demanda activa y cuellos por resolver" },
] as const;

const SOLO_EXAMPLES: Record<string, { profile: string[]; pain: string[]; outcome: string[] }> = {
  legal: {
    profile: [
      "Abogado independiente con buena reputación, pero ventas irregulares y seguimiento poco sistemático.",
      "Dueño de despacho pequeño que depende demasiado de referidos y respuestas manuales.",
    ],
    pain: [
      "Recibe consultas, pero muchas se enfrían después del primer contacto por falta de seguimiento claro.",
      "La carga operativa le gana al seguimiento comercial y deja ir oportunidades que sí tenían potencial.",
    ],
    outcome: [
      "Cerrar más consultas con un proceso comercial más firme y profesional.",
      "Tener seguimiento más ordenado sin depender de memoria o improvisación.",
    ],
  },
  financiero: {
    profile: [
      "Asesor financiero independiente con pipeline irregular y demasiada dependencia de seguimiento manual.",
      "Broker pequeño que necesita responder más rápido y mover mejor el interés a cita y cierre.",
    ],
    pain: [
      "El prospecto se enfría rápido si no recibe respuesta y avance claro en poco tiempo.",
      "Hay interés, pero falta estructura para mover al cliente desde la primera conversación hasta la contratación.",
    ],
    outcome: [
      "Tener más citas efectivas y más cierres con seguimiento mejor organizado.",
      "Reducir fuga de oportunidades por tiempos lentos o seguimiento inconsistente.",
    ],
  },
  consultoria: {
    profile: [
      "Dueño de despacho pequeño que vende bien uno a uno, pero no tiene proceso comercial repetible.",
      "Consultor independiente con buen servicio, pero pipeline irregular y demasiada dependencia de referidos.",
    ],
    pain: [
      "Tiene conversaciones, pero no seguimiento firme; las propuestas se enfrían y el cierre depende de insistir manualmente.",
      "Dedica demasiado tiempo a vender y poco a operar, pero aun así el pipeline sigue impredecible.",
    ],
    outcome: [
      "Tener flujo semanal de oportunidades y un proceso que cierre más sin perseguir manualmente cada lead.",
      "Ordenar el seguimiento para depender menos del fundador y convertir con más consistencia.",
    ],
  },
  marketing_agencia: {
    profile: [
      "Dueña de agencia boutique con buen servicio, pero seguimiento comercial inconsistente.",
      "Fundador de agencia que vive entre operación, ventas y entrega, sin sistema claro para cerrar mejor.",
    ],
    pain: [
      "Recibe interesados, pero entre juntas, propuestas y operación deja ir oportunidades por falta de seguimiento.",
      "Tiene buen trabajo y casos, pero no una secuencia comercial que convierta interés tibio en cierre.",
    ],
    outcome: [
      "Cerrar más prospectos con mejor proceso y menos dependencia del fundador en cada conversación.",
      "Tener pipeline más sano, urgencia más clara y propuestas que no se enfríen tan fácil.",
    ],
  },
  salud_bienestar: {
    profile: [
      "Dueña de negocio de bienestar que vende bien uno a uno, pero sin sistema para sostener la demanda.",
      "Profesional de salud o bienestar con buen servicio, pero seguimiento comercial improvisado.",
    ],
    pain: [
      "Tiene interesados, pero entre operación, atención y contenido deja ir oportunidades valiosas.",
      "Depende demasiado de mensajes manuales y eso hace que la conversión sea irregular.",
    ],
    outcome: [
      "Tener flujo más estable de prospectos y un proceso más claro para convertirlos en clientes activos.",
      "Vender con más constancia sin cargar toda la conversión en trabajo manual.",
    ],
  },
  otro: {
    profile: [
      "Dueño de negocio local de servicios con ventas irregulares y dependencia de recomendaciones.",
      "Profesional independiente que vende bien cuando habla con el cliente correcto, pero no tiene sistema para repetirlo.",
    ],
    pain: [
      "Tiene interés, pero no seguimiento. Responde tarde, pierde conversaciones y no convierte de forma constante.",
      "El negocio genera oportunidades, pero no las mueve con orden ni urgencia.",
    ],
    outcome: [
      "Tener flujo semanal de prospectos calificados y un proceso que convierta sin perseguir manualmente cada lead.",
      "Cerrar con más consistencia y depender menos de la improvisación comercial.",
    ],
  },
};

export function Step3ICP_Solo() {
  const { state, updateStep3B2C, goNext, goPrev } = useWizard();
  const current = state.answers.step3_b2c;
  const industry = state.answers.step2?.industry ?? "otro";
  const examples = SOLO_EXAMPLES[industry] ?? SOLO_EXAMPLES.otro;

  const [businessStage, setBusinessStage] = useState(current?.lifeStage?.[0] ?? "estable");
  const [clientProfile, setClientProfile] = useState(current?.ageRange ?? "");
  const [mainPain, setMainPain] = useState(current?.mainPain ?? "");
  const [mainOutcome, setMainOutcome] = useState(current?.mainOutcome ?? "");

  const handleContinue = () => {
    updateStep3B2C({
      ageRange: clientProfile,
      lifeStage: [businessStage],
      incomeLevel: current?.incomeLevel ?? "pendiente",
      geography: current?.geography ?? "México",
      mainPain,
      mainDesire: mainOutcome,
      costOfInaction: `Seguir con ${mainPain.toLowerCase()}`,
      mainOutcome,
      outcomeTimeline: "90 días",
      typicalInvestmentRange: current?.typicalInvestmentRange ?? "Pendiente",
      paysFromOwnPocket: true,
    });
    goNext();
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 3 · Buyer Persona negocio</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">Define el perfil de negocio que más se beneficia</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
        Esta ruta es para profesional independiente o negocio pequeño. Aquí no usamos tamaño de empresa: usamos etapa real de negocio.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <p className="mb-3 text-sm font-medium text-stone-200">1) Etapa del negocio cliente</p>
          <div className="grid gap-3 md:grid-cols-3">
            {BUSINESS_STAGES.map((item) => {
              const active = businessStage === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setBusinessStage(item.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-sm font-semibold text-stone-100">{item.label}</p>
                  <p className="mt-1 text-xs text-stone-400">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block text-sm text-stone-300">
          2) Buyer Persona de ese cliente
          <textarea
            value={clientProfile}
            onChange={(event) => setClientProfile(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
            placeholder="Ej. Dueño de negocio local de servicios, con ventas irregulares y alta dependencia de recomendaciones."
          />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.profile.join(" · ")}</p>
        </label>

        <label className="block text-sm text-stone-300">
          3) Dolor urgente del cliente
          <textarea
            value={mainPain}
            onChange={(event) => setMainPain(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
            placeholder="Ej. Tiene interes, pero no seguimiento. Responde tarde, pierde conversaciones y no convierte de forma constante."
          />
          <p className="mt-1 text-xs leading-5 text-stone-400">Ejemplos: {examples.pain.join(" · ")}</p>
        </label>

        <label className="block text-sm text-stone-300">
          4) Resultado concreto esperado
          <textarea
            value={mainOutcome}
            onChange={(event) => setMainOutcome(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
            placeholder="Ej. Tener flujo semanal de prospectos calificados y un proceso que convierta sin perseguir manualmente cada lead."
          />
          <p className="mt-1 text-xs leading-5 text-stone-400">Ejemplos: {examples.outcome.join(" · ")}</p>
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
