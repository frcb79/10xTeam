"use client";

import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";

const INDUSTRY_EXAMPLES: Record<string, {
  objection: string[];
  resolution: string[];
  differentiator: string[];
}> = {
  salud_odontologia: {
    objection: [
      '"Ya invertimos en marketing y no vimos pacientes reales."',
      '"No quiero meter más herramientas si mi equipo no las va a usar."',
    ],
    resolution: [
      "Mostramos cuántas valoraciones se están perdiendo entre recepción, seguimiento y cierre, y planteamos activación simple desde el día 1.",
      "Reducimos carga operativa con seguimiento guiado y activación enfocada en agenda y tratamientos, no en vanity metrics.",
    ],
    differentiator: [
      "No solo generamos leads: ordenamos respuesta, seguimiento y recuperación de pacientes con un sistema accionable.",
      "Traducimos interés en tratamientos aceptados con seguimiento por etapa y lenguaje del paciente correcto.",
    ],
  },
  salud_medicina: {
    objection: [
      '"No quiero sumar otra herramienta si mi equipo ya está saturado."',
      '"Ya hemos invertido en marketing y no vimos suficientes citas reales."',
    ],
    resolution: [
      "Mostramos cuánta fuga existe entre interés, respuesta y consulta, y activamos un proceso más ligero para recepción y seguimiento.",
      "Aterrizamos resultados en citas confirmadas y agenda aprovechada, no en métricas superficiales.",
    ],
    differentiator: [
      "No solo atraemos interés: ordenamos respuesta, seguimiento y conversión a cita para aprovechar mejor la agenda.",
      "Convertimos demanda médica en una secuencia comercial más clara y operable por el equipo.",
    ],
  },
  consultoria: {
    objection: [
      '"Ya tenemos referidos; no sé si necesito cambiar mi proceso comercial."',
      '"No quiero volverme dependiente de campañas que luego no se sostienen."',
    ],
    resolution: [
      "Mostramos el costo de depender solo de referidos y cómo un sistema simple protege pipeline y seguimiento sin complicar la operación.",
      "Empezamos con un sprint acotado y métricas concretas para demostrar avance sin inflar promesas.",
    ],
    differentiator: [
      "No entregamos táctica suelta: construimos un proceso comercial que mueve creencias, seguimiento y cierre.",
      "Conectamos diagnóstico, objeciones y secuencia comercial para que la propuesta no se enfríe.",
    ],
  },
  legal: {
    objection: [
      '"Mi despacho vive de reputación; no quiero volver esto demasiado comercial."',
      '"Ya hacemos seguimiento, pero no sé si vale la pena formalizarlo más."',
    ],
    resolution: [
      "Mostramos que un proceso comercial ordenado no le quita reputación al despacho; la protege y convierte mejor las consultas correctas.",
      "Aterrizamos la pérdida real entre primera consulta, propuesta y anticipo para que el costo de no actuar sea visible.",
    ],
    differentiator: [
      "No empujamos venta agresiva: estructuramos seguimiento profesional para que la consulta correcta sí avance a contratación.",
      "Conectamos confianza, urgencia y seguimiento sin romper el tono del despacho.",
    ],
  },
  financiero: {
    objection: [
      '"Mi negocio depende de confianza; no quiero automatizar algo tan sensible."',
      '"Si respondo rápido pero no cierro, el problema no es solo velocidad."',
    ],
    resolution: [
      "Mostramos cómo automatización y seguimiento no sustituyen confianza: la sostienen con rapidez, claridad y siguiente paso oportuno.",
      "Ordenamos qué pasa entre interés, cita, documentos y cierre para que el avance no dependa solo de memoria o insistencia manual.",
    ],
    differentiator: [
      "No solo contestamos más rápido: estructuramos la conversación para mover confianza e intención hacia contratación.",
      "Traducimos interés financiero en avance por etapa con seguimiento más preciso y menos fuga.",
    ],
  },
  marketing_agencia: {
    objection: [
      '"Ya tenemos un pipeline, pero el problema es que los prospectos se enfrían."',
      '"No quiero otra capa de complejidad si mi equipo ya usa varias herramientas."',
    ],
    resolution: [
      "Mostramos dónde se enfrían las propuestas y cómo un sistema de seguimiento más claro mejora cierre sin complicar la operación.",
      "Aterrizamos la mejora en cierre, tiempo de seguimiento y menos dependencia del fundador.",
    ],
    differentiator: [
      "No entregamos más tareas: ordenamos el proceso comercial para que interés, propuesta y objeciones avancen con consistencia.",
      "Convertimos capacidad de ejecución en una máquina comercial más repetible y menos improvisada.",
    ],
  },
  ecommerce: {
    objection: [
      '"Ya tengo tráfico; no sé si realmente necesito otra capa de seguimiento."',
      '"No quiero depender de descuentos para vender más."',
    ],
    resolution: [
      "Mostramos cómo seguimiento, recompra y recuperación elevan conversión sin regalar margen con descuentos constantes.",
      "Aterrizamos el impacto en recompra, abandono recuperado y valor por cliente, no solo en más tráfico.",
    ],
    differentiator: [
      "No solo perseguimos ventas nuevas: activamos seguimiento para recuperar intención y aumentar recompra.",
      "Ordenamos señales de comportamiento y automatización para vender mejor con el tráfico que ya existe.",
    ],
  },
  otro: {
    objection: [
      '"Ya lo intentamos antes y no funcionó."',
      '"Suena bien, pero no sé si esto sí aplique para mi negocio."',
    ],
    resolution: [
      "Aterrizamos el costo de no actuar con datos del negocio y proponemos una activación clara, medible y de bajo riesgo.",
      "Mostramos por qué lo anterior falló y qué cambia ahora en el proceso, no solo en la promesa.",
    ],
    differentiator: [
      "Combinamos diagnóstico, seguimiento automatizado y activación guiada para mover más oportunidades a cierre.",
      "Convertimos información del negocio en un sistema comercial accionable, no en un documento bonito.",
    ],
  },
};

export function Step4Process() {
  const { state, updateStep4, goNext, goPrev } = useWizard();
  const current = state.answers.step4;
  const industry = state.answers.step2?.industry ?? "otro";
  const examples = INDUSTRY_EXAMPLES[industry] ?? INDUSTRY_EXAMPLES.otro;
  const [salesCycleDuration, setSalesCycleDuration] = useState(current?.salesCycleDuration ?? "1-4_weeks");
  const [topObjection, setTopObjection] = useState(current?.topObjection ?? "Precio");
  const [topObjectionResolution, setTopObjectionResolution] = useState(
    current?.topObjectionResolution ?? ""
  );
  const [antiICP, setAntiICP] = useState(current?.antiICP ?? "");
  const [highRiskICP, setHighRiskICP] = useState(current?.highRiskICP ?? "");
  const [mainCompetitors, setMainCompetitors] = useState(current?.mainCompetitors ?? "");
  const [whyCompetitorsFail, setWhyCompetitorsFail] = useState(
    current?.whyCompetitorsFail ?? "Falta de seguimiento consistente"
  );
  const [uniqueDifferentiator, setUniqueDifferentiator] = useState(
    current?.uniqueDifferentiator ?? ""
  );

  const handleContinue = () => {
    updateStep4({
      salesCycleDuration,
      salesCycleNotes: "Ciclo definido para el MVP",
      topObjection,
      topObjectionResolution,
      antiICP,
      highRiskICP,
      mainCompetitors,
      whyChoseUs: "Metodo, seguimiento y ejecucion guiada",
      whyCompetitorsFail,
      uniqueDifferentiator,
    });
    goNext();
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 4 · Proceso</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">Como vendes y por que te eligen</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
        Este bloque traduce tu metodología a argumentos de conversión: objeciones, costo de inacción y mecanismo único.
      </p>
      <div className="mt-6 grid gap-4">
        <label className="block text-sm text-stone-300">
          Ciclo de venta
          <select value={salesCycleDuration} onChange={(e) => setSalesCycleDuration(e.target.value as typeof salesCycleDuration)} className="wizard-select mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
            <option value="same_day">Mismo día</option>
            <option value="1-7_days">1-7 días</option>
            <option value="1-4_weeks">1-4 semanas</option>
            <option value="1-3_months">1-3 meses</option>
            <option value="3+_months">3+ meses</option>
          </select>
        </label>
        <label className="block text-sm text-stone-300">
          Objecion principal
          <textarea value={topObjection} onChange={(e) => setTopObjection(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Ya invertimos antes y no funciono; no quiero volver a gastar sin evidencia." />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.objection.join(" · ")}</p>
        </label>
        <label className="block text-sm text-stone-300">
          Como la resuelves cuando funciona
          <textarea value={topObjectionResolution} onChange={(e) => setTopObjectionResolution(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Mostramos costo de no actuar con su data actual y proponemos un primer sprint de bajo riesgo con metricas semanales." />
          <p className="mt-2 text-xs leading-5 text-stone-400">Ejemplos: {examples.resolution.join(" · ")}</p>
        </label>
        <label className="block text-sm text-stone-300">
          A quien NO quieres como cliente
          <textarea value={antiICP} onChange={(e) => setAntiICP(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Quien busca solo precio bajo, no implementa y espera resultados sin compromiso operativo." />
        </label>
        <label className="block text-sm text-stone-300">
          Perfil que parece ideal pero trae riesgo
          <textarea value={highRiskICP} onChange={(e) => setHighRiskICP(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Negocio con urgencia extrema pero sin capacidad de ejecucion ni responsable interno claro." />
        </label>
        <label className="block text-sm text-stone-300">
          Con quien te comparan hoy
          <textarea value={mainCompetitors} onChange={(e) => setMainCompetitors(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Agencias genericas, freelancers por hora y operacion interna sin metodo." />
        </label>
        <label className="block text-sm text-stone-300">
          Por que fallan esas alternativas
          <textarea value={whyCompetitorsFail} onChange={(e) => setWhyCompetitorsFail(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Se enfocan en tacticas sueltas, no mueven creencias del comprador y no sostienen seguimiento por etapa." />
        </label>
        <label className="block text-sm text-stone-300">
          Mecanismo unico (que haces diferente)
          <textarea value={uniqueDifferentiator} onChange={(e) => setUniqueDifferentiator(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Combinamos diagnostico de creencias + secuencia automatizada + seguimiento humano en 72h para convertir interes tibio en decision." />
          <p className="mt-2 text-xs leading-5 text-amber-200">Ejemplos: {examples.differentiator.join(" · ")}</p>
        </label>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={goPrev} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200">Atrás</button>
        <button type="button" onClick={handleContinue} className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950">Continuar</button>
      </div>
    </div>
  );
}
