"use client";

import {useEffect,useMemo,useState} from "react";
import Image from "next/image";
import PlatformPreview from "./platform-preview";
import Link from "next/link";
import {
  buildReport,defaultReportInput,type ReportInput,type Sector,type Goal,
  type Channel,type Role,type Currency,type ReportScenario,type ThreeScenarios,
} from "@/lib/onboarding/report-10x";

const sectorNames:Record<Sector,string>={
  consultoria:"Consultoría y servicios B2B",
  profesionales:"Abogados, contadores y profesionales",
  financiero:"Créditos, seguros y servicios financieros",
  comercio:"Comercio y productos",
  citas:"Servicios que se venden con cita",
  otros:"Otros negocios"
};
const goalNames:Record<Goal,string>={
  captacion:"Necesito conseguir más prospectos",
  seguimiento:"Quiero que no se pierdan oportunidades",
  eficiencia:"Quiero liberar tiempo del equipo",
  conversion:"Quiero cerrar más ventas"
};
const channelNames:Record<Channel,string>={
  referidos:"Referidos y recomendaciones",
  web:"Sitio web y formularios",
  redes:"Redes sociales",
  whatsapp:"WhatsApp y mensajes",
  anuncios:"Publicidad",
  ninguno:"Todavía no tengo un canal constante"
};
const roleNames:Record<Role,string>={
  fundador:"Fundador / dueño",
  director:"Director / gerente",
  ventas:"Vendedor / asesor",
  operaciones:"Operación / administración"
};
const formatMoney=(v:number,c:Currency)=>new Intl.NumberFormat(c==="MXN"?"es-MX":"en-US",{
  style:"currency",currency:c,maximumFractionDigits:0
}).format(v);
const formatNumber=(v:number)=>new Intl.NumberFormat("es-MX",{maximumFractionDigits:1}).format(v);
const panel="rounded-[1.4rem] border border-[#E7E0EF] bg-white shadow-[0_10px_35px_rgba(25,48,45,0.035)]";
const select="mt-2 w-full rounded-xl border border-[#DFD7EB] bg-white px-4 py-3 text-[#2D2644] outline-none transition focus:border-[#7250E4] focus:ring-2 focus:ring-[#7250E4]/10";
const question="block text-sm font-semibold text-[#423653]";

function Selector<T extends string|number>({title,hint,value,onChange,items}:{
  title:string; hint?:string; value:T;onChange:(v:T)=>void;items:[T,string][]
}){return <label className="block">
  <span className={question}>{title}</span>
  {hint&&<span className="mt-1 block text-xs text-[#82788E]">{hint}</span>}
  <select className={select} value={value} onChange={e=>onChange(
    (typeof value==="number"?Number(e.target.value):e.target.value) as T
  )}>
    {items.map(([v,label])=><option key={String(v)} value={v}>{label}</option>)}
  </select>
</label>;}
function Kpi({label,value,context,tone}:{
  label:string;value:string;context:string;tone:"teal"|"blue"|"sand"
}){
  const t={teal:"bg-[#F2ECFF] border-[#DAD0FB]",blue:"bg-[#ECF0FB] border-[#D9E1F7]",sand:"bg-[#FAEEDB] border-[#F0DDC4]"}[tone];
  return <div className={"rounded-[1.35rem] border p-5 md:p-6 "+t}>
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#526B62]">{label}</p>
    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#193C34] md:text-4xl">{value}</p>
    <p className="mt-2 text-sm leading-5 text-[#566D65]">{context}</p>
  </div>;
}
function SectionHeader({eyebrow,children}:{
  eyebrow:string;children:React.ReactNode
}){return <div className="mb-5">
  <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#7250E4]">{eyebrow}</p>
  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2A243D] md:text-3xl">{children}</h2>
</div>;}
function ProspectReport({input,onEdit}: {input:ReportInput;onEdit:()=>void}){
  const report=useMemo(()=>buildReport(input),[input]);
  const [scenario,setScenario]=useState<ThreeScenarios>("central");
  const [showActivation,setShowActivation]=useState(false);
  const a=report.scenarios[scenario],base=report.scenarios.central;
  const zero=report.startsWithoutLeads;
  return <div>
    <div className="mx-auto max-w-6xl px-5 pt-9 md:px-8">
      <button onClick={onEdit} className="text-sm font-semibold text-[#7250E4] hover:underline">← Cambiar mis respuestas</button>
    </div>
    <main className="mx-auto max-w-6xl space-y-8 px-5 pb-20 pt-5 text-[#2A243D] md:px-8">
      <section className={panel+" relative overflow-hidden p-7 md:p-12"}>
        <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[6rem] bg-[#ECE5FF] md:h-48 md:w-48"/>
        <div className="relative max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7250E4]">Reporte Estratégico 10xteam · Visión inicial</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-[#17362F] md:text-[3.4rem]">
            Tu próximo crecimiento necesita un sistema, no más tareas.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-7 text-[#6C637C]">{report.growthThesis}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#F0EBFE] px-4 py-2 text-xs font-semibold text-[#6851AB]">{sectorNames[input.sector]}</span>
            <span className="rounded-full bg-[#F1F2EF] px-4 py-2 text-xs font-semibold text-[#456158]">{goalNames[input.goal]}</span>
            <span className="rounded-full bg-[#F1F2EF] px-4 py-2 text-xs font-semibold text-[#456158]">Diagnóstico preliminar · sin datos privados</span>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><SectionHeader eyebrow="01 / Capacidad y crecimiento">La oportunidad que podrías desarrollar</SectionHeader>
          <p className="-mt-3 max-w-3xl text-sm leading-6 text-[#677C74]">
            {zero
              ?"Como hoy no recibes prospectos, estimamos una meta de captación de prueba. No presentamos ventas inexistentes como si ya hubieran sucedido."
              :"Simulamos qué podría ocurrir si aprovechas mejor la demanda que ya recibes."}
          </p></div>
          <div className="flex rounded-full border border-[#DBE3DE] bg-white p-1">
            {([["prudente","Prudente"],["central","Base"],["amplio","Potencial"]] as const).map(([key,name])=>
              <button key={key} onClick={()=>setScenario(key)} aria-pressed={scenario===key}
                className={"rounded-full px-3 py-2 text-xs font-semibold transition "+(scenario===key?"bg-[#7250E4] text-white":"text-[#4B6C60] hover:bg-[#E9F3ED]")}>{name}</button>)}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Kpi tone="teal" label="Tiempo que podrías recuperar" value={formatNumber(a.recoveredHoursMonth)+" h/mes"}
            context={"Capacidad para prospección, atención y tareas estratégicas."}/>
          <Kpi tone="blue" label="Valor equivalente de ese tiempo" value={formatMoney(a.capacityValueMonth,input.currency)}
            context={"Referencia económica del rol: "+roleNames[input.role]+". No es ahorro de nómina automático."}/>
          <Kpi tone="sand"
            label={zero?"Escenario de primeras ventas":"Posibles ventas adicionales"}
            value={formatMoney(a.grossSalesOpportunityMonth,input.currency)}
            context={zero
              ?"Condicionado a captar "+a.estimatedProspectsMonth+" prospectos/mes y convertir una parte; no son ventas aseguradas."
              :"Ingreso bruto hipotético de una mejora relativa en conversión, no utilidad."}/>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#DEE9E3] bg-[#EFF7F2] px-4 py-3 text-sm text-[#355D4E]">
          <span>{zero?"Objetivo de arranque: "+a.estimatedProspectsMonth+" prospectos nuevos al mes":"Entrada declarada: "+input.leads+" prospectos al mes"}</span>
          <span>{scenario==="central"?"Escenario base":scenario==="prudente"?"Hipótesis prudente":"Hipótesis de mayor alcance"} · no garantizado</span>
        </div>
      </section>

      <section className={panel+" p-6 md:p-9"}>
        <SectionHeader eyebrow="02 / Inteligencia comercial">Cómo vemos tu mercado y a tus compradores</SectionHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#F2F6F1] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#527565]">Clientes probables a priorizar</p>
            {report.audiences.map((x,i)=><p className="mt-4 flex gap-3 text-sm leading-6" key={x}><span className="font-bold text-[#7250E4]">0{i+1}</span>{x}</p>)}
            <p className="mt-4 text-xs text-[#718078]">Segmentos orientativos del sector; se afinan con tu información real.</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E3E9E4] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#527565]">Qué suele activar una decisión</p>
              <p className="mt-2 text-sm leading-6 text-[#2D4C40]">{report.buyingTrigger}</p>
            </div>
            <div className="rounded-2xl border border-[#E3E9E4] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#527565]">Fricción probable antes del cierre</p>
              <p className="mt-2 text-sm leading-6 text-[#2D4C40]">{report.friction}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-[#DAE8DC] bg-[#F8FCF8] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#527565]">Canales sugeridos para probar</p>
          <p className="mt-2 text-base font-semibold text-[#392B62]">{report.acquisition}</p>
          <p className="mt-2 text-xs text-[#607569]">Tu canal declarado: {channelNames[input.channel]}. No se asumen campañas activas ni datos obtenidos de terceros.</p>
        </div>
      </section>

      <section className={panel+" p-6 md:p-9"}>
        <SectionHeader eyebrow="03 / Recorrido comercial">Así organizaríamos tus oportunidades</SectionHeader>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {report.stages.map((stage,i)=><div key={stage} className="relative rounded-xl bg-[#F3F7F4] px-4 py-5">
            <span className="text-xs font-bold text-[#7250E4]">ETAPA 0{i+1}</span>
            <p className="mt-2 text-sm font-semibold">{stage}</p>
          </div>)}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {report.pillars.map((p,i)=><div key={p.label} className="border-l-2 border-[#8DBDAA] pl-3">
            <p className="text-sm font-semibold">{p.label}</p>
            <p className="mt-1 text-xs text-[#677E72]">{p.signal}</p>
          </div>)}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={panel+" p-6 md:p-9"}>
          <SectionHeader eyebrow="04 / Sistema propuesto">Qué pondríamos a trabajar primero</SectionHeader>
          <div className="space-y-4">
            {report.recommendations.map((item,i)=><div key={item.title} className="flex gap-4 border-b border-[#ECF0EB] pb-4 last:border-none last:pb-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0EAFF] text-sm font-bold text-[#7250E4]">{i+1}</span>
              <div>
                <p className="text-base font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#667B70]">{item.detail}</p>
                <p className="mt-2 text-xs font-semibold text-[#7250E4]">{item.module} · Por configurar</p>
              </div>
            </div>)}
          </div>
          <div className="mt-6 border-t border-[#E2E9E2] pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#537666]">Automatizaciones propuestas para tu perfil</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {report.workflowCandidates.map(w=><span key={w.id} className="rounded-full bg-[#E9F4ED] px-3 py-2 text-xs font-medium text-[#255843]">{w.purpose} · Borrador</span>)}
            </div>
            <p className="mt-3 text-xs text-[#77877D]">Se revisarán en GHL antes de activarlas. No hay comunicaciones externas autorizadas.</p>
          </div>
        </div>
        <div className="rounded-[1.4rem] border border-[#D5E5D9] bg-[#F2EDF9] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#23664E]">Capacidad del equipo</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#35294D]">El tiempo del fundador también tiene valor.</h3>
          <p className="mt-4 text-sm leading-6 text-[#496758]">Si recuperamos {formatNumber(base.recoveredHoursMonth)} horas al mes, el valor equivalente cambia según quién hoy hace ese trabajo.</p>
          <div className="mt-5 space-y-3">
            {(["operaciones","ventas","director","fundador"] as const).map(role=>{
              const tariff:Record<Currency,Record<Role,number>>={
                MXN:{operaciones:140,ventas:260,director:450,fundador:650},
                USD:{operaciones:16,ventas:30,director:50,fundador:70}
              };
              return <div key={role} className="flex items-center justify-between gap-2 border-b border-[#C9DFCF] pb-2 text-sm">
                <span>{roleNames[role]}</span>
                <strong>{formatMoney(base.recoveredHoursMonth*tariff[input.currency][role],input.currency)}/mes</strong>
              </div>;
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#577164]">Valores de tiempo hipotéticos por rol. Recuperar tiempo no implica reducir gasto de nómina; puede aprovecharse para captar y atender mejor.</p>
        </div>
      </section>

      <section className="rounded-[1.4rem] bg-[#292345] p-7 text-white md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D5C5FF]">05 / Tu ruta inicial</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Los primeros 30 días, con prioridades claras.</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            ["01 · Base","Crear el espacio comercial, definir etapas y comprobar la recepción de un prospecto."],
            ["02 · Movimiento","Probar el canal más prometedor y establecer seguimiento con tareas internas."],
            ["03 · Mejora","Revisar conversaciones, oportunidades, tiempos y ajustar la primera automatización."]
          ].map(([k,v])=><div key={k} className="rounded-xl border border-white/25 bg-white/10 p-5">
            <p className="font-semibold text-[#E0D4FF]">{k}</p><p className="mt-3 text-sm leading-6 text-[#F2EDFF]">{v}</p>
          </div>)}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#2D2550] hover:bg-[#EAF5EC]"
            onClick={()=>setShowActivation(x=>!x)} aria-expanded={showActivation}>
            {showActivation?"Ocultar activación":"Conoce cómo activar tu Growth OS"}
          </button>
          <p className="text-xs text-[#CFDFD6]">Sin enviar mensajes ni abrir cuentas automáticamente desde este reporte.</p>
        </div>
        {showActivation&&<div className="mt-5 rounded-xl border border-white/25 bg-white/10 p-5 text-sm leading-6 text-[#E7F3EB]">
          <strong>Tu siguiente paso será simple:</strong> confirmar identidad y plan, autorizar tu subcuenta,
          validar configuración inicial y conectar canales sólo cuando los necesites.
          El registro conectado a este nuevo reporte y los cobros siguen en fase de desarrollo;
          no simularemos que ya existe una prueba comercial activada.
        </div>}
      </section>

      <footer className="pb-8 text-center text-[11px] leading-5 text-[#788A80]">
        Estimaciones orientativas construidas con respuestas y supuestos de simulación; no son promesas de resultados
        ni ahorros de efectivo. Los escenarios dependen de captación, conversión y costos reales.
        Referencias generales sobre productividad comercial:{" "}
        <a className="underline" target="_blank" rel="noreferrer" href="https://www.salesforce.com/news/stat-library/all-stats/">Salesforce, State of Sales</a>
        {" "}y{" "}
        <a className="underline" target="_blank" rel="noreferrer" href="https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier">McKinsey, potencial de IA</a>.
        Los porcentajes del simulador y valores por hora son hipótesis de 10xteam; no se atribuyen a estos estudios.
      </footer>
    </main>
  </div>;
}

export default function ReportExperience(){
  const [input,setInput]=useState<ReportInput>(defaultReportInput);
  const [screen,setScreen]=useState<"questions"|"analysis"|"platform">("questions");
  const [analysisStep,setAnalysisStep]=useState(0);
  const computedReport=useMemo(()=>buildReport(input),[input]);
  useEffect(()=>{
    if(screen!=="analysis")return;
    // Displays actual locally computed result stages; does not claim remote AI.
    const timers=[
      window.setTimeout(()=>setAnalysisStep(1),350),
      window.setTimeout(()=>setAnalysisStep(2),760),
      window.setTimeout(()=>setAnalysisStep(3),1150),
      window.setTimeout(()=>setScreen("platform"),1750),
    ];
    return ()=>timers.forEach(window.clearTimeout);
  },[screen]);
  const set=<K extends keyof ReportInput>(k:K,value:ReportInput[K])=>setInput(v=>({...v,[k]:value}));
  const sales=input.currency==="MXN"?[5000,15000,35000,75000,150000]:[250,900,2500,5000,12000];
  if(screen==="platform")return <PlatformPreview input={input} report={
    <ProspectReport input={input} onEdit={()=>{setScreen("questions");window.scrollTo(0,0);}}/>
  }/>;
  if(screen==="analysis")return <div className="flex min-h-screen items-center justify-center bg-[#F8F7FC] px-5 text-[#28213F]">
    <main className="w-full max-w-xl rounded-3xl border border-[#E5DDF4] bg-white p-8 shadow-[0_22px_80px_#62558C11] md:p-11" role="status" aria-live="polite">
      <div className="inline-flex rounded-xl bg-[#241E3D] px-4 py-2">
        <Image src="/Logo_10xteam.png" alt="10xteam" width={124} height={48} className="h-9 w-auto object-contain"/>
      </div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#7859C8]">Preparando tu experiencia</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Tu negocio, visto desde otra perspectiva.</h1>
      <p className="mt-3 text-sm leading-6 text-[#716982]">
        Estamos organizando tus respuestas con reglas por industria y escenarios ilustrativos. No consultamos datos privados ni ejecutamos IA externa.
      </p>
      <div className="mt-8 space-y-5">
        {[
          "Identificando oportunidades para "+sectorNames[input.sector],
          "Organizando el recorrido comercial en "+computedReport.stages.length+" etapas",
          "Preparando tres escenarios y sus supuestos",
          "Construyendo tu vista inicial de Growth OS"
        ].map((step,i)=><div key={step} className="flex items-center gap-3 text-sm">
          <span className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold "+(analysisStep>=i?"bg-[#EDE6FF] text-[#7354D2]":"bg-[#F1F0F3] text-[#AAA3B0]")}>
            {analysisStep>i?"✓":String(i+1).padStart(2,"0")}
          </span>
          <span className={analysisStep>=i?"font-medium text-[#322946]":"text-[#AAA3B0]"}>{step}</span>
        </div>)}
      </div>
      <div className="mt-8 h-2 overflow-hidden rounded-full bg-[#EEEAF5]">
        <div className="h-full rounded-full bg-[#7856E5] transition-all duration-500 motion-reduce:transition-none"
             style={{width:((analysisStep+1)/4*100)+"%"}}/>
      </div>
      <p className="mt-4 text-xs text-[#938B9E]">Visualización de preparación local · Esta versión no crea una cuenta real.</p>
    </main>
  </div>;
  return <div className="min-h-screen bg-[#F8F7FC] text-[#2A243D]" style={{fontFamily:"'Aptos','Segoe UI',Arial,sans-serif"}}>
    <header className="border-b border-[#E4E8E0] bg-white/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="rounded-xl bg-[#231B3B] px-3 py-1.5"><Image src="/Logo_10xteam.png" alt="10xteam" width={128} height={50} className="h-8 w-auto object-contain" priority/></span>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#806E9A]">Growth OS</span>
        </Link>
        <span className="text-xs font-medium text-[#6A7F73]">Análisis inicial · Sin registro ni compromiso</span>
      </div>
    </header>
    
    <main className="mx-auto max-w-5xl px-5 pb-20 pt-12 md:px-8 md:pt-20">
      <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="lg:sticky lg:top-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7250E4]">Tu negocio, con una perspectiva diferente</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.13] tracking-[-0.045em] md:text-5xl">
            Descubre las oportunidades que hoy no estás aprovechando.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-7 text-[#62776D]">
            No necesitas conocer tus métricas de memoria.
            Con unas respuestas rápidas trazamos un punto de partida para tu crecimiento.
          </p>
          <div className="mt-10 rounded-2xl border border-[#E5D9FB] bg-[#F2EEFF] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6650B7]">Lo que recibirás</p>
            <div className="mt-4 space-y-3 text-sm font-medium text-[#30574A]">
              <p>✓ Oportunidades de crecimiento por sector</p>
              <p>✓ Tiempo y capacidad comercial recuperables</p>
              <p>✓ Perfil inicial de clientes y recorrido de venta</p>
              <p>✓ Tres prioridades para tu Growth OS</p>
            </div>
          </div>
        </section>
        <section className={panel+" p-6 md:p-9"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Conozcamos tu operación</h2>
            <select aria-label="Moneda" className="rounded-lg border border-[#DFD7EB] bg-[#FAFCF8] px-3 py-2 text-sm"
              value={input.currency} onChange={e=>setInput(v=>({...v,currency:e.target.value as Currency,avgSale:null}))}>
              <option value="MXN">México · MXN</option><option value="USD">Estados Unidos · USD</option>
            </select>
          </div>
          <p className="mt-2 text-sm text-[#73887B]">Sólo selección múltiple. No pedimos datos personales.</p>
          <div className="mt-7 grid gap-5">
            <Selector title="1. ¿A qué se dedica tu negocio?" value={input.sector}
              onChange={v=>set("sector",v)} items={Object.entries(sectorNames) as [Sector,string][]}/>
            <Selector title="2. ¿Qué te gustaría mejorar primero?" value={input.goal}
              onChange={v=>set("goal",v)} items={Object.entries(goalNames) as [Goal,string][]}/>
            <Selector title="3. ¿Cuántos prospectos recibes aproximadamente al mes?" value={input.leads}
              onChange={v=>set("leads",v)} items={[[0,"Todavía no tengo prospectos"],[10,"1–20"],[50,"21–80"],[125,"81–200"],[300,"Más de 200"]]}/>
            <Selector title="4. ¿Cuántas horas a la semana dedican a tareas repetitivas?" hint="Seguimiento manual, capturas, recordatorios y coordinación." value={input.manualHoursWeek}
              onChange={v=>set("manualHoursWeek",v)} items={[[2,"1–3 horas"],[6,"4–8 horas"],[12,"9–15 horas"],[20,"Más de 15 horas"]]}/>
            <Selector title="5. ¿Quién realiza principalmente esas tareas?" value={input.role}
              onChange={v=>set("role",v)} items={Object.entries(roleNames) as [Role,string][]}/>
            <Selector title="6. ¿De dónde llegan hoy tus oportunidades?" value={input.channel}
              onChange={v=>set("channel",v)} items={Object.entries(channelNames) as [Channel,string][]}/>
            <Selector title="7. ¿Qué valor aproximado tiene una venta?" value={input.avgSale??"unknown"}
              onChange={v=>set("avgSale",v==="unknown"?null:Number(v))}
              items={[["unknown","No lo sé"],...sales.map(v=>[v,formatMoney(v,input.currency)])] as [number|string,string][]}/>
            <Selector title="8. ¿Conoces tu tasa de cierre?" value={input.closeRate??"unknown"}
              onChange={v=>set("closeRate",v==="unknown"?null:Number(v))}
              items={[["unknown","No lo sé"],[2,"2%"],[5,"5%"],[10,"10%"],[20,"20%"],[35,"35%"]] as [number|string,string][]}/>
          </div>
          <button onClick={()=>{setAnalysisStep(0);setScreen("analysis");window.scrollTo({top:0,behavior:"smooth"});}}
            className="mt-8 w-full rounded-full bg-[#7250E4] px-6 py-4 text-sm font-semibold text-white hover:bg-[#5B3CC5]">
            Preparar mi Reporte Estratégico 10xteam
          </button>
          <p className="mt-4 text-center text-xs leading-5 text-[#829289]">
            Verás tu Reporte 10xteam dentro de una vista previa de Growth OS. No registramos datos ni activamos servicios.
          </p>
        </section>
      </div>
    </main>
  </div>;
}
