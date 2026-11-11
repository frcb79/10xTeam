"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  buildReport,
  type ReportInput,
} from "@/lib/onboarding/report-10x";

type ModuleId =
  | "report" | "crm" | "leads" | "workflows" | "content"
  | "appointments" | "analytics" | "intelligence";

export const moduleCatalog: ReadonlyArray<{
  id: ModuleId; label: string; description: string; short: string;
}> = [
  {id:"report",label:"Mi Reporte 10xteam",description:"Tu análisis estratégico inicial",short:"01"},
  {id:"crm",label:"CRM y oportunidades",description:"Pipeline, ventas y seguimiento",short:"02"},
  {id:"leads",label:"Motor de prospectos",description:"Fuentes, formularios y calificación",short:"03"},
  {id:"workflows",label:"Automatizaciones",description:"Procesos sugeridos para tu sector",short:"04"},
  {id:"content",label:"Marketing e IA",description:"Contenido, campañas y mensajes",short:"05"},
  {id:"appointments",label:"Citas y calendario",description:"Reservas y recordatorios",short:"06"},
  {id:"analytics",label:"Analítica comercial",description:"Indicadores y oportunidades",short:"07"},
  {id:"intelligence",label:"Mi Inteligencia 10x",description:"Tu perfil comercial en evolución",short:"08"},
] as const;

export const previewPlans = [
  {id:"growth",label:"10x Growth",priceMXN:1990,priceUSD:129,setupMXN:3500,setupUSD:229,subaccounts:1,aiCreditMXN:200,description:"Una empresa, todas las capacidades principales."},
  {id:"scale",label:"10x Scale",priceMXN:3990,priceUSD:349,setupMXN:7500,setupUSD:489,subaccounts:3,aiCreditMXN:700,description:"Tres negocios o marcas con mayor capacidad incluida."},
] as const;
type PlanId = (typeof previewPlans)[number]["id"];

const money=(v:number, currency:string)=>new Intl.NumberFormat("es-MX",{
  style:"currency",currency,maximumFractionDigits:0
}).format(v);
const sectors:Record<ReportInput["sector"],string>={
  consultoria:"Consultoría", profesionales:"Servicios profesionales",
  financiero:"Servicios financieros", comercio:"Comercio",
  citas:"Servicios con citas", otros:"Otros negocios",
};
const colors = {
  violet:"text-[#7050DB]",
  light:"bg-[#F5F2FF]",
  border:"border-[#EAE4FB]",
  dark:"text-[#24213B]",
};

function Placeholder({name,items}: {name:string; items:string[]}) {
  return <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
    <div className="rounded-2xl border border-[#E9E5F1] bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#785ED0]">Vista conceptual · sin datos de clientes</p>
      <h3 className="mt-4 text-2xl font-semibold text-[#26213B]">{name}</h3>
      <div className="mt-6 space-y-3">
        {items.map((item,i)=><div key={item} className="flex items-center gap-4 rounded-xl border border-[#ECE9F1] bg-[#FCFBFF] p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEE8FF] text-xs font-bold text-[#7251DC]">0{i+1}</span>
          <p className="text-sm font-medium text-[#403B52]">{item}</p>
          <span className="ml-auto text-[11px] font-medium text-[#8C829B]">Propuesto</span>
        </div>)}
      </div>
    </div>
    <div className="rounded-2xl border border-[#D5E8DF] bg-[#F1FAF5] p-6">
      <div className="text-3xl font-semibold text-[#235343]">0</div>
      <p className="mt-2 text-sm font-semibold text-[#31674F]">Acciones activadas</p>
      <p className="mt-4 text-sm leading-6 text-[#668273]">
        Esto es una demostración interactiva de tu futura plataforma.
        Ningún prospecto, mensaje, calendario o automatización ha sido creado.
      </p>
    </div>
  </div>;
}

export default function PlatformPreview({input,report}:{
  input:ReportInput;report:ReactNode;
}){
  const model=useMemo(()=>buildReport(input),[input]);
  const [module,setModule]=useState<ModuleId>("report");
  const [activation,setActivation]=useState(false);
  const [plan,setPlan]=useState<PlanId>("growth");
  const [exit,setExit]=useState(false);
  const [reason,setReason]=useState("");
  const [surveyAcknowledged,setSurveyAcknowledged]=useState(false);
  const current=moduleCatalog.find(m=>m.id===module)!;
  const selectedPlan=previewPlans.find(p=>p.id===plan)!;
  const selectedPrice=money(input.currency==="MXN"?selectedPlan.priceMXN:selectedPlan.priceUSD,input.currency);
  const showReport=module==="report";

  return <div className="min-h-screen bg-[#F7F7FA] text-[#26213A]">
    <div className="border-b border-[#EAE7F0] bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-7">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#211B39] px-3 py-1.5">
            <Image src="/Logo_10xteam.png" alt="10xteam" width={114} height={46}
              className="h-8 w-auto object-contain" priority/>
          </div>
          <span className="hidden border-l border-[#DFDCE5] pl-3 text-xs font-semibold uppercase tracking-widest text-[#766C86] sm:block">Growth OS</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full border border-[#D8CFFC] bg-[#F5F1FF] px-3 py-2 font-semibold text-[#6A4AD5]">Vista previa · No es una cuenta GHL activa</span>
          <button onClick={()=>setExit(true)} className="font-medium text-[#6F6580] underline underline-offset-4">Salir de la demostración</button>
        </div>
      </div>
    </div>
    <div className="mx-auto grid max-w-[1440px] items-start gap-0 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b border-[#E4E1ED] bg-white px-4 py-5 lg:sticky lg:top-0 lg:min-h-[calc(100vh-82px)] lg:border-b-0 lg:border-r">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8F879A]">Tu espacio de crecimiento</p>
        <p className="mt-2 px-3 text-sm font-semibold text-[#342D49]">{sectors[input.sector]} · Vista inicial</p>
        <div className="mt-5 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
          {moduleCatalog.map(m=><button key={m.id} onClick={()=>{setModule(m.id);setActivation(false);}}
            aria-current={module===m.id?"page":undefined}
            className={"flex items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-semibold transition sm:text-sm "+
              (module===m.id?"bg-[#ECE7FF] text-[#6744D0]":"text-[#625A72] hover:bg-[#F7F4FF]")}>
            <span className={"text-[10px] font-bold "+(module===m.id?"text-[#6544C4]":"text-[#AAA1B6]")}>{m.short}</span>
            <span>{m.label}</span>
          </button>)}
        </div>
        <div className="mt-7 rounded-2xl border border-[#E4DDF8] bg-[#F8F5FF] p-4">
          <p className="text-sm font-semibold text-[#443072]">¿Te gustaría verlo funcionando?</p>
          <p className="mt-2 text-xs leading-5 text-[#776A92]">Elige Growth o Scale para revisar la activación y la prueba propuesta.</p>
          <button onClick={()=>setActivation(true)}
            className="mt-4 w-full rounded-xl bg-[#7250E4] px-4 py-3 text-xs font-bold text-white hover:bg-[#5B3CC5]">
            Explorar planes y prueba
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-7 md:px-8">
        {activation? <div className="mx-auto max-w-4xl space-y-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7454C7]">Activación / Vista de producto</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Elige cómo quieres comenzar</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B6476]">
              Ya exploraste la plataforma y tu reporte. La próxima etapa propuesta es una prueba de 14 días;
              antes de activarla mostraremos las condiciones, la fecha del primer cobro y, si corresponde,
              la cuota de implementación. Esta demostración todavía no puede iniciar suscripciones.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {previewPlans.map(p=><button key={p.id} aria-pressed={plan===p.id}
              onClick={()=>setPlan(p.id)}
              className={"rounded-2xl border-2 bg-white p-6 text-left transition "+
                (plan===p.id?"border-[#805CE8] shadow-[0_12px_28px_#5b3cc514]":"border-[#E6E1EE] hover:border-[#D5C4FA]")}>
              <p className="text-lg font-semibold text-[#33284E]">{p.label}</p>
              <p className="mt-2 text-sm leading-6 text-[#776D85]">{p.description}</p>
              <p className="mt-5 text-2xl font-bold tracking-tight text-[#39275D]">
                {money(input.currency==="MXN"?p.priceMXN:p.priceUSD,input.currency)}
                <span className="ml-1 text-xs font-normal text-[#756B80]">/ mes</span>
              </p>
              <p className="mt-2 text-xs text-[#81798B]">{p.subaccounts} {p.subaccounts===1?"negocio":"negocios"} · Crédito IA publicado: {money(p.aiCreditMXN,"MXN")}/mes</p>
              <p className="mt-1 text-xs text-[#81798B]">Setup anunciado: {money(input.currency==="MXN"?p.setupMXN:p.setupUSD,input.currency)} (momento de cobro por definir)</p>
            </button>)}
          </div>
          <div className="rounded-2xl border border-[#D9D1F1] bg-[#F3EEFF] p-6">
            <h2 className="text-xl font-semibold">Prueba de 14 días · Diseño comercial, no activada</h2>
            <p className="mt-3 text-sm leading-6 text-[#625577]">
              Seleccionaste {selectedPlan.label} ({selectedPrice}/mes de referencia). La página pública
              actual todavía anuncia prueba sin tarjeta, mientras que el flujo que estamos diseñando
              propone registrar la tarjeta antes de activar. Debemos unificar la oferta y aprobar
              checkout, cobros, cancelación y tratamiento del setup antes de habilitar esta etapa.
            </p>
            <button disabled className="mt-5 cursor-not-allowed rounded-xl bg-[#BEB3D7] px-5 py-3 text-sm font-semibold text-white" title="Checkout en desarrollo">
              Iniciar 14 días y registrar tarjeta · Próximamente
            </button>
            <p className="mt-3 text-xs text-[#7B6B92]">No recogemos datos bancarios ni creamos subcuentas en esta demostración.</p>
          </div>
          <button className="text-sm font-semibold text-[#7351CF] underline underline-offset-4" onClick={()=>setActivation(false)}>← Volver a explorar mi plataforma</button>
        </div>:<>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#7A55D7]">Vista previa de tu Growth OS</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">{current.label}</h1>
              <p className="mt-1 text-sm text-[#797183]">{current.description}</p></div>
            <button onClick={()=>setActivation(true)} className="rounded-full bg-[#7250E4] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5B3CC5]">Explorar mis 14 días</button>
          </div>
          {showReport ? <div className="overflow-hidden rounded-2xl border border-[#E9E5F2] bg-[#FBFBFD]">
            {report}
          </div> : module==="crm" ? <Placeholder name="Tu proceso comercial" items={model.stages} />
            : module==="leads" ? <Placeholder name="Tu sistema de prospección" items={[
              "Captura de oportunidades por origen",
              "Segmentación inicial de clientes: "+model.audiences[0],
              "Calificación y tareas internas",
              "Prospectos nuevos por fuente (por medir)",
            ]} />
            : module==="workflows" ? <Placeholder name="Recetas de automatización para tu perfil" items={
              model.workflowCandidates.map(w=>w.purpose+" · Por revisar")
            } />
            : module==="content" ? <Placeholder name="Campañas y contenido" items={[
              "Calendario editorial asociado al objetivo comercial",
              "Borradores de publicaciones y mensajes con revisión humana",
              "Ideas para activar "+model.acquisition.toLowerCase(),
              "Asistencia IA disponible según plan y consumo contratado",
            ]} />
            : module==="appointments" ? <Placeholder name="Agenda y gestión de citas" items={[
              "Conexión voluntaria de calendarios",
              "Horarios disponibles y reglas de reserva",
              "Recordatorios con consentimiento",
              "Seguimiento posterior a cada cita",
            ]} />
            : module==="analytics" ? <Placeholder name="Indicadores para tomar mejores decisiones" items={[
              "Prospectos por fuente y fecha",
              "Tiempo de primera respuesta",
              "Conversión por etapa del proceso",
              "Oportunidades sin siguiente tarea",
            ]} />
            : <div className="space-y-5">
              <div className="rounded-2xl border border-[#E6E0F3] bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7455CB]">Mi Inteligencia 10x · Vista previa</p>
                <h2 className="mt-3 text-2xl font-semibold">Tu perfil de negocio mejora contigo</h2>
                <p className="mt-3 text-sm leading-6 text-[#71697A]">Aquí reuniremos tu industria, cliente ideal, oferta, objeciones, canales y resultados para que los agentes puedan recomendar cambios. Nada se completa o compra automáticamente en esta demostración.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E6E0F3] bg-white p-6">
                  <h3 className="font-semibold">Lo que ya sabemos</h3>
                  <p className="mt-3 text-sm text-[#635B70]">Industria: {sectors[input.sector]}</p>
                  <p className="mt-2 text-sm text-[#635B70]">Prioridad: {model.growthThesis}</p>
                  <p className="mt-2 text-sm text-[#635B70]">Cliente probable: {model.audiences[0]}</p>
                </div>
                <div className="rounded-2xl border border-[#D9EADC] bg-[#F1FAF3] p-6">
                  <h3 className="font-semibold">Lo que completarás después</h3>
                  <p className="mt-3 text-sm leading-6 text-[#597466]">Oferta, clientes reales, objeciones, mensajes, integraciones y métricas mensuales. Cada dato bajo tu control, en una sección propia de 10xteam dentro de GHL.</p>
                  <p className="mt-4 text-xs font-semibold text-[#347554]">Perfil progresivo · No consume tokens todavía</p>
                </div>
              </div>
            </div>}
        </>}
      </main>
    </div>
    {exit&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E192A]/55 p-4" role="dialog" aria-modal="true" aria-label="Salir de demostración">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7552CA]">Tu opinión nos ayudará a mejorar</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#33294A]">¿Qué te faltó para querer activar?</h2>
        <p className="mt-2 text-sm text-[#756C83]">Esta pregunta es opcional y, por ahora, permanece local: la demo no envía ni guarda respuestas.</p>
        <div className="mt-5 space-y-2">
          {["Quiero ver una demostración con datos reales","Necesito entender mejor los precios","Prefiero decidir más adelante","Me faltan funcionalidades","Otra razón"].map(r=>
            <label key={r} className="flex items-center gap-3 rounded-xl border border-[#E9E4EF] p-3 text-sm">
              <input type="radio" name="exitReason" checked={reason===r} onChange={()=>setReason(r)}/>{r}
            </label>)}
        </div>
        {surveyAcknowledged&&<p className="mt-3 text-xs text-[#806B94]">Has indicado «{reason||"Sin respuesta"}». No se ha enviado a nadie.</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={()=>setSurveyAcknowledged(true)} className="rounded-xl bg-[#7250E4] px-5 py-3 text-sm font-semibold text-white">Confirmar mi elección</button>
          <a href="https://growth.10xteam.com.mx/" className="rounded-xl border border-[#E1DBED] px-5 py-3 text-sm font-semibold text-[#55446A]">Salir sin activar</a>
          <button onClick={()=>{setExit(false);setSurveyAcknowledged(false);}} className="rounded-xl border border-[#E1DBED] px-5 py-3 text-sm font-semibold">Seguir explorando</button>
        </div>
      </div>
    </div>}
  </div>;
}
