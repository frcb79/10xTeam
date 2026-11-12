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
  agencias:"Agencias de marketing y servicios digitales",
  inmobiliario:"Inmobiliarias y asesores de bienes raíces",
  automotriz:"Agencias, distribuidores y asesores automotrices",
  salud:"Clínicas, consultorios y bienestar",
  restaurantes:"Restaurantes, cafeterías y hospitalidad",
  educacion:"Escuelas, academias y cursos",
  servicios_locales:"Servicios locales y mantenimiento",
  otros:"Otro negocio"
};
const goalNames:Record<Goal,string>={
  captacion:"Necesito conseguir más prospectos",
  seguimiento:"Quiero que no se pierdan oportunidades",
  eficiencia:"Quiero liberar tiempo del equipo",
  conversion:"Quiero cerrar más ventas",
  citas:"Quiero conseguir y confirmar citas",
  reactivacion:"Quiero recuperar clientes inactivos",
  contenido:"Quiero mejorar campañas y contenido",
  calificacion:"Quiero distinguir prospectos de calidad"
};
const channelNames:Record<Channel,string>={
  referidos:"Referidos y recomendaciones",
  web:"Sitio web y formularios",
  redes:"Redes sociales",
  whatsapp:"WhatsApp y mensajes",
  anuncios:"Publicidad pagada",
  prospeccion:"Prospección directa",
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
const roleKeys=["fundador","director","ventas","operaciones"] as const;
const sourceKeys=["referidos","web","redes","whatsapp","anuncios","prospeccion"] as const;
type SourceKey=typeof sourceKeys[number];
function redistribute<K extends string>(keys:readonly K[],current:Partial<Record<K,number>>,changed:K,next:number):Record<K,number>{
  const amount=Math.max(0,Math.min(100,Math.round(next/5)*5));
  const result={} as Record<K,number>;
  result[changed]=amount;
  const others=keys.filter(x=>x!==changed);
  const rest=100-amount;
  const weights=others.map(k=>current[k]??0);
  const total=weights.reduce((a,b)=>a+b,0);
  let allocated=0;
  others.forEach((k,i)=>{
    const portion=i===others.length-1?rest-allocated:
      total>0?Math.floor(rest*weights[i]/total/5)*5:
      i===0?rest:0;
    result[k]=portion;
    allocated+=portion;
  });
  return result;
}
function ShareEditor<K extends string>({title,help,keys,labels,mix,onChange,presets}:{
  title:string;help:string;keys:readonly K[];labels:Record<K,string>;
  mix:Partial<Record<K,number>>;onChange:(next:Record<K,number>)=>void;
  presets:Array<{label:string;values:Partial<Record<K,number>>}>;
}){
  return <fieldset className="rounded-2xl border border-[#E8E1F3] bg-[#FBFAFE] p-4">
    <legend className="px-1 text-sm font-semibold text-[#423653]">{title}</legend>
    <p className="text-xs leading-5 text-[#82788E]">{help}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {presets.map(p=><button type="button" key={p.label} onClick={()=>onChange(Object.fromEntries(keys.map(k=>[k,p.values[k]??0])) as Record<K,number>)}
        className="rounded-full border border-[#D6CBF4] bg-white px-3 py-2 text-xs font-semibold text-[#6D52B4] hover:bg-[#F2EBFF]">{p.label}</button>)}
    </div>
    <details className="mt-3 rounded-xl border border-[#E2DAEE] bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold text-[#7051CE]">Ajustar porcentajes por {keys.length===4?"responsable":"fuente"}</summary>
      <p className="mt-2 text-xs text-[#877C93]">Los porcentajes se distribuyen automáticamente para sumar 100%.</p>
      <div className="mt-3 space-y-3">
        {keys.map(k=><label className="grid grid-cols-[minmax(0,1fr)_48px] items-center gap-3" key={k}>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-[#443652]">{labels[k]}</span>
            <input type="range" className="mt-1 block w-full accent-[#7250E4]" min={0} max={100} step={5}
              aria-label={labels[k]+" porcentaje"} value={mix[k]??0}
              onChange={e=>onChange(redistribute(keys,mix,k,Number(e.target.value)))}/>
          </div>
          <span className="text-right text-xs font-semibold text-[#7050CC]">{mix[k]??0}%</span>
        </label>)}
      </div>
      <div className="mt-4 text-right text-xs font-bold text-[#7250E4]">Total: {keys.reduce((a,k)=>a+(mix[k]??0),0)}%</div>
    </details>
  </fieldset>;
}
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
            Una estrategia de crecimiento para {sectorNames[input.sector].toLowerCase()}. 
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
            context={"Valor de capacidad ponderado entre las personas que hacen esas tareas. No es ahorro de nómina automático."}/>
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
          <p className="mt-2 text-xs text-[#607569]">Fuentes declaradas: {report.channelSummary}. No se asumen campañas activas ni datos de terceros.</p>
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
          <p className="mt-4 text-sm leading-6 text-[#496758]">Con {formatNumber(base.recoveredHoursMonth)} horas mensuales potencialmente liberables, el valor cambia según quién realiza el trabajo. Tu cálculo pondera la participación de cada rol.</p>
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


      <section className={panel+" p-6 md:p-9"}>
        <SectionHeader eyebrow="05 / Diagnóstico comercial">Las oportunidades que investigaríamos primero</SectionHeader>
        <p className="mb-6 max-w-4xl text-sm leading-6 text-[#6B617D]">
          No inventamos una puntuación para tu empresa. Esta es una hipótesis inicial a partir de tu industria,
          prioridad, mezcla de canales y horas declaradas. Se irá confirmando con datos de uso reales.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {k:"01",title:"Atracción de compradores adecuados",signal:report.channelSummary,
              action:"Identificar fuentes repetibles y separar consultas de oportunidades calificadas."},
            {k:"02",title:"Velocidad y seguimiento",signal:report.friction,
              action:"Asignar responsables, tareas y medir el tiempo hasta la primera respuesta."},
            {k:"03",title:"Conversión y experiencia comercial",signal:report.buyingTrigger,
              action:"Crear etapas claras, guiar conversaciones y dar continuidad a propuestas."},
            {k:"04",title:"Productividad y uso de IA",signal:formatNumber(base.recoveredHoursMonth)+" horas mensuales liberables en escenario base",
              action:"Automatizar tareas administrativas y dar más tiempo a prospección y atención."},
          ].map(item=><div key={item.k} className="rounded-2xl border border-[#E8E2F2] bg-[#FCFAFF] p-5">
            <p className="text-xs font-bold tracking-[0.14em] text-[#7250E4]">ÁREA {item.k}</p>
            <h3 className="mt-2 text-lg font-semibold text-[#302742]">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#615970]">{item.signal}</p>
            <p className="mt-4 border-t border-[#ECE4F5] pt-3 text-xs leading-5 text-[#755F91]"><strong>Acción sugerida:</strong> {item.action}</p>
          </div>)}
        </div>
      </section>

      <section className={panel+" p-6 md:p-9"}>
        <SectionHeader eyebrow="06 / Ecosistema Growth OS">Mucho más que un CRM: tu sistema comercial completo</SectionHeader>
        <p className="mb-6 max-w-4xl text-sm leading-6 text-[#6B617D]">
          Estas son capacidades y módulos que podrías aprovechar progresivamente. Las conexiones externas,
          el consumo de IA y ciertas funciones pueden requerir activación o costos de proveedores.
          Ninguna aparece aquí como ya configurada en tu negocio.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Prospección","Segmentos, fuentes, campañas de captación y criterios de calificación"],
            ["CRM y pipelines","Contactos, oportunidades, responsables y próximas acciones"],
            ["Automatizaciones","Tareas, reglas y workflows para cada etapa"],
            ["WhatsApp y conversaciones","Atención multicanal y bandeja de mensajes tras conexión"],
            ["Email marketing","Plantillas, campañas y seguimiento con dominio autorizado"],
            ["IA y asistentes","Borradores, respuestas, calificación y agentes con límites"],
            ["Citas y calendarios","Reservas, disponibilidad, confirmaciones y recordatorios"],
            ["Sitios y formularios","Landing pages, captación, formularios y encuestas"],
            ["Contenido y redes","Planeación, publicaciones y seguimiento de resultados"],
            ["Reactivación de clientes","Segmentación y campañas responsables para contactos elegibles"],
            ["Reputación y reseñas","Solicitudes y seguimiento de opiniones con consentimiento"],
            ["Analítica y reportes","Fuentes, conversiones, oportunidades, actividad y adopción"]
          ].map(([title,description],i)=><div key={title} className="rounded-2xl border border-[#E7E2EE] bg-[#FBFAFE] p-5">
            <span className="text-xs font-bold text-[#8563D7]">{String(i+1).padStart(2,"0")}</span>
            <h3 className="mt-2 text-sm font-semibold text-[#342848]">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-[#756B85]">{description}</p>
          </div>)}
        </div>
        <p className="mt-5 text-xs leading-5 text-[#7D7489]">Tu primera versión se enfocará en las áreas de mayor prioridad. No todas las integraciones son necesarias para comenzar.</p>
      </section>

      <section className={panel+" p-6 md:p-9"}>
        <SectionHeader eyebrow="07 / Acompañamiento inteligente">Mi Inteligencia 10x aprenderá de tu negocio</SectionHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Hoy","Entendemos tu sector, prioridad y proceso de compra probable, sin pedirte un formulario interminable."],
            ["Durante la prueba","Podrás completar tu oferta, objeciones, horarios y canales desde la plataforma, cuando lo necesites."],
            ["Cada mes","El sistema podrá sugerir ajustes con base en datos autorizados de prospección, conversión y uso."]
          ].map(([title,description],i)=><div key={title} className="rounded-2xl bg-[#F3EEFF] p-5">
            <p className="text-xs font-bold text-[#7654CB]">ETAPA {i+1}</p>
            <h3 className="mt-3 font-semibold text-[#36284D]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#6E607E]">{description}</p>
          </div>)}
        </div>
        <div className="mt-5 rounded-2xl bg-[#F9F6FF] p-5 text-sm text-[#514469]">
          <strong>Una muestra para {sectorNames[input.sector].toLowerCase()}:</strong> prepararíamos
          tu primer guion de calificación, el mensaje de respuesta inicial y las preguntas que ayudan a identificar compradores reales.
          El contenido se podrá revisar antes de activar campañas, bots o envíos.
        </div>
      </section>

      <section className={panel+" p-6 md:p-9"}>
        <SectionHeader eyebrow="08 / Hoja de ruta">De tus primeros 14 días a una operación en crecimiento</SectionHeader>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["Días 1–2","Base funcional","Cuenta real, etapas y un primer formulario probado."],
            ["Días 3–5","Conectar","Conexión voluntaria de los canales prioritarios y capacitación breve."],
            ["Días 6–10","Optimizar","Revisar tareas, calificar oportunidades y ajustar automatizaciones."],
            ["Días 11–14","Decidir","Mostrar actividad real, métricas iniciales y propuesta de continuidad."]
          ].map(([when,title,description])=><div key={when} className="rounded-xl border border-[#E7E0EF] p-4">
            <p className="text-xs font-bold text-[#7353C7]">{when}</p>
            <h3 className="mt-2 text-base font-semibold text-[#342849]">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-[#756D82]">{description}</p>
          </div>)}
        </div>
        <p className="mt-5 text-xs text-[#83768E]">Secuencia propuesta; la activación real depende de permisos, servicios conectados y validaciones funcionales.</p>
      </section>

      <section className="rounded-[1.4rem] bg-[#292345] p-7 text-white md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D5C5FF]">09 / Tu ruta inicial</p>
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
      window.setTimeout(()=>setAnalysisStep(1),2200),
      window.setTimeout(()=>setAnalysisStep(2),4400),
      window.setTimeout(()=>setAnalysisStep(3),6800),
      window.setTimeout(()=>setScreen("platform"),9500),
    ];
    return ()=>timers.forEach(window.clearTimeout);
  },[screen]);
  const set=<K extends keyof ReportInput>(k:K,value:ReportInput[K])=>setInput(v=>({...v,[k]:value}));
  const sales=input.currency==="MXN"?[5000,15000,35000,75000,150000]:[250,900,2500,5000,12000];
  const setLeads=(v:number)=>setInput(prev=>({
    ...prev,leads:v,channel:v===0?"ninguno":prev.channel==="ninguno"?"referidos":prev.channel,
    channelMix:v===0?{}:prev.leads===0?{referidos:100}:prev.channelMix
  }));
  const roleMix=input.roleMix??{[input.role]:100};
  const channelMix=input.channelMix??(input.channel==="ninguno"?{}:{[input.channel]:100});
  if(screen==="platform")return <PlatformPreview input={input} report={
    <ProspectReport input={input} onEdit={()=>{setScreen("questions");window.scrollTo(0,0);}}/>
  }/>;
  if(screen==="analysis")return <div className="flex min-h-screen items-center justify-center bg-[#F8F7FC] px-5 text-[#28213F]">
    <main className="w-full max-w-xl rounded-3xl border border-[#E5DDF4] bg-white p-8 shadow-[0_22px_80px_#62558C11] md:p-11" role="status" aria-live="polite">
      <div className="inline-flex rounded-xl bg-[#241E3D] px-4 py-2">
        <Image src="/Logo_10xteam.png" alt="10xteam" width={124} height={48} className="h-9 w-auto object-contain mix-blend-screen"/>
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
          <span className="rounded-xl bg-black px-3 py-1.5"><Image src="/Logo_10xteam.png" alt="10xteam" width={128} height={50} className="h-8 w-auto object-contain mix-blend-screen" priority/></span>
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
              onChange={setLeads} items={[[0,"Todavía no tengo prospectos"],[10,"1–20"],[50,"21–80"],[125,"81–200"],[300,"Más de 200"]]}/>
            <div>
              <Selector title="4. ¿Cuántas horas semanales invierte tu equipo en tareas repetitivas?" hint="Suma el tiempo de todas las personas involucradas, no por prospecto." value={input.manualHoursWeek}
                onChange={v=>set("manualHoursWeek",v)} items={[[0,"Casi nada"],[2,"1–3 horas"],[6,"4–8 horas"],[12,"9–15 horas"],[20,"16–25 horas"],[35,"Más de 25 horas"]]}/>
              <details className="mt-2 rounded-xl border border-[#E7E2F1] bg-[#F8F5FE] px-4 py-3 text-xs text-[#766A89]">
                <summary className="cursor-pointer font-semibold text-[#6F50CE]">ⓘ ¿Qué tiempo debo incluir? (toca para ver ejemplos)</summary>
                <p className="mt-2 leading-5">Incluye copiar datos entre sistemas, revisar leads, asignar responsables,
                preparar reportes, agendar manualmente, recordar seguimientos o responder preguntas repetidas.
                Ejemplo: dos personas que invierten 3 horas cada una = 6 horas semanales. No incluyas el tiempo de
                vender o atender personalmente que quieras conservar.</p>
              </details>
            </div>
            <ShareEditor<Role> title="5. ¿Quién realiza ese trabajo y en qué proporción?"
              help="Puedes elegir un ejemplo y afinar los porcentajes. Esto nos permite valorar correctamente el tiempo de cada persona."
              keys={roleKeys} labels={roleNames} mix={roleMix}
              onChange={mix=>setInput(v=>({...v,roleMix:mix,role:roleKeys.find(k=>mix[k]===Math.max(...Object.values(mix)))??"fundador"}))}
              presets={[
                {label:"Sólo fundador",values:{fundador:100}},
                {label:"Equipo de ventas",values:{ventas:100}},
                {label:"Operaciones",values:{operaciones:100}},
                {label:"Equipo compartido",values:{fundador:25,director:25,ventas:25,operaciones:25}},
              ]}/>
            {input.leads===0?
              <div className="rounded-xl border border-[#E0D6F3] bg-[#F8F4FF] p-4 text-sm text-[#66507C]">
                <p className="font-semibold">6. Tu primera fuente de prospectos todavía está por definir.</p>
                <p className="mt-2 text-xs leading-5">Al no recibir prospectos, no tiene sentido inventar porcentajes. Tu reporte presentará una estrategia de captación inicial.</p>
              </div>:
              <ShareEditor<SourceKey> title="6. ¿De dónde llegan tus prospectos actualmente?"
                help="Puedes indicar varias fuentes y su proporción aproximada. Las recomendaciones priorizarán lo que ya funciona."
                keys={sourceKeys} labels={channelNames} mix={channelMix}
                onChange={mix=>setInput(v=>({...v,channelMix:mix,channel:sourceKeys.find(k=>mix[k]===Math.max(...Object.values(mix)))??"referidos"}))}
                presets={[
                  {label:"Sólo referidos",values:{referidos:100}},
                  {label:"Redes + WhatsApp",values:{redes:50,whatsapp:50}},
                  {label:"Digital y anuncios",values:{web:30,redes:30,anuncios:40}},
                  {label:"Fuentes diversas",values:{referidos:25,web:20,redes:20,whatsapp:20,anuncios:10,prospeccion:5}}
                ]}/>
            }
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
