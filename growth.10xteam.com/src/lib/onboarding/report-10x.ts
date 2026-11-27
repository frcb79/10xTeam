import { selectWorkflowBlueprints, type WorkflowBlueprint } from "./workflow-blueprints";

// 10xteam Growth OS — motor de escenarios del Reporte Estratégico.
// Supuestos declarados de modelación; NO son benchmarks ni promesas de ingresos.
export type Currency = "MXN" | "USD";
export type Sector = "consultoria" | "profesionales" | "financiero" | "comercio" | "citas" | "otros" | "agencias" | "inmobiliario" | "automotriz" | "salud" | "restaurantes" | "educacion" | "servicios_locales";
export type Goal = "captacion" | "seguimiento" | "eficiencia" | "conversion" | "citas" | "reactivacion" | "contenido" | "calificacion";
export type Channel = "referidos" | "web" | "redes" | "whatsapp" | "anuncios" | "prospeccion" | "ninguno";
export type Role = "fundador" | "director" | "ventas" | "operaciones";

export type ReportInput = {
  sector: Sector;
  goal: Goal;
  leads: number;
  manualHoursWeek: number;
  role: Role;
  // Se usan porcentajes solo cuando la persona los conoce; suma = 100.
  roleMix?: Partial<Record<Role, number>>;
  channel: Channel;
  channelMix?: Partial<Record<Exclude<Channel,"ninguno">, number>>;
  avgSale: number | null;
  closeRate: number | null;
  currency: Currency;
};
export type ThreeScenarios = "prudente" | "central" | "amplio";
export type ReportScenario = {
  recoveredHoursMonth: number;
  capacityValueMonth: number;
  grossSalesOpportunityMonth: number;
  estimatedProspectsMonth: number;
  conditional: boolean;
};
export type Recommendation = { title: string; detail: string; module: string; kind: "native_recipe" | "configuration" | "needs_review" };
export type Report = {
  input: ReportInput;
  startsWithoutLeads: boolean;
  roleHourlyReference: number;
  roleShare: Record<Role, number>;
  channelSummary: string;
  channelShare: Partial<Record<Exclude<Channel,"ninguno">, number>>;
    assumptions: {closeRatePercent: number; avgSale: number; hourly: number; targetProspects: number};
  inferred: string[];
  audiences: string[];
  buyingTrigger: string;
  friction: string;
  acquisition: string;
  growthThesis: string;
  pillars: {label:string; state:string; signal:string}[];
  scenarios: Record<ThreeScenarios,ReportScenario>;
  recommendations: Recommendation[];
  workflowCandidates: WorkflowBlueprint[];
  stages: string[];
};
const profiles:Record<Sector,{
  audiences:string[]; trigger:string; friction:string; acquisition:string;
  stages:string[]; coreModule:string
}> = {
  consultoria:{
    audiences:["Dueños que quieren crecer sin ampliar estructura", "Directores que buscan ejecución y resultados medibles"],
    trigger:"Una meta comercial o un proyecto que ya no puede esperar",
    friction:"Dudas sobre alcance, retorno y capacidad de ejecución",
    acquisition:"LinkedIn, alianzas profesionales y referidos",
    stages:["Primer contacto","Calificación","Diagnóstico","Propuesta","Decisión"],
    coreModule:"Diagnóstico de necesidad y seguimiento de propuestas"
  },
  profesionales:{
    audiences:["Empresas que necesitan asesoría recurrente", "Personas con una necesidad puntual y decisión cercana"],
    trigger:"Un problema específico que requiere confianza y rapidez",
    friction:"La comparación entre especialistas y la falta de claridad de la propuesta",
    acquisition:"Referidos, búsqueda local y contenido de autoridad",
    stages:["Consulta","Calificación","Cita","Propuesta","Cierre"],
    coreModule:"Solicitud, cita y recuperación de consultas"
  },
  financiero:{
    audiences:["Empresas con necesidades de capital o liquidez", "Personas con necesidad financiera elegible"],
    trigger:"Una inversión, compra o necesidad de financiamiento",
    friction:"Documentación, elegibilidad y confianza en el proceso",
    acquisition:"Alianzas, referidos y educación financiera",
    stages:["Solicitud","Perfilamiento","Validación","Opciones","Decisión"],
    coreModule:"Precalificación y recordatorios sin información sensible",
  },
  comercio:{
    audiences:["Compradores comparando proveedores", "Clientes existentes con potencial de recompra"],
    trigger:"Disponibilidad, promoción o necesidad de reposición",
    friction:"Respuesta lenta y falta de seguimiento post-cotización",
    acquisition:"Redes sociales, búsqueda y remarketing con permiso",
    stages:["Interés","Contacto","Cotización","Compra","Recompra"],
    coreModule:"Cotizaciones y recompra",
  },
  citas:{
    audiences:["Personas listas para agendar un servicio", "Clientes que necesitan seguimiento periódico"],
    trigger:"Disponibilidad de agenda y confianza para reservar",
    friction:"Fricción para encontrar horario y cancelaciones",
    acquisition:"Reseñas, búsqueda local y referidos",
    stages:["Interés","Solicitud","Cita","Atención","Continuidad"],
    coreModule:"Agenda y confirmaciones autorizadas",
  },
  agencias:{
    audiences:["Empresas que requieren adquisición rentable y constante","Marcas que necesitan campañas conectadas a ventas"],
    trigger:"Una meta de pipeline, generación de demanda o posicionamiento medible",
    friction:"Demostrar atribución de resultados y velocidad de respuesta",
    acquisition:"Prospección B2B, alianzas, contenido demostrable y referidos",
    stages:["Entrada","Brief","Diagnóstico","Propuesta","Contrato"],
    coreModule:"Calificación comercial y tablero de rendimiento de campañas"
  },
  inmobiliario:{
    audiences:["Compradores comparando propiedades y financiamiento","Propietarios con intención de vender o rentar"],
    trigger:"Una oportunidad de inmueble, cambio de casa o inversión",
    friction:"Citas, tiempos de contacto y calificación de presupuesto",
    acquisition:"Portales, referidos, redes y búsqueda local",
    stages:["Lead","Calificación","Visita","Oferta","Cierre"],
    coreModule:"Seguimiento de visitas y oportunidades por inmueble"
  },
  automotriz:{
    audiences:["Compradores que comparan vehículos y planes","Clientes actuales con intención de renovación"],
    trigger:"Cambio de vehículo, oferta o necesidad de financiamiento",
    friction:"Cita de prueba, cotización, disponibilidad y objeciones",
    acquisition:"Campañas, inventario disponible y referidos",
    stages:["Interés","Calificación","Cotización","Prueba","Venta"],
    coreModule:"Seguimiento de cotizaciones y pruebas de manejo"
  },
  salud:{
    audiences:["Pacientes que solicitan una primera consulta","Pacientes recurrentes que necesitan continuidad"],
    trigger:"Una necesidad de consulta o tratamiento específico",
    friction:"Tiempos de respuesta, disponibilidad y confianza profesional",
    acquisition:"Búsqueda local, reseñas y referidos",
    stages:["Consulta","Contacto","Cita","Atención","Seguimiento"],
    coreModule:"Citas y recordatorios con consentimiento; no automatizar datos clínicos"
  },
  restaurantes:{
    audiences:["Comensales de la zona que buscan una experiencia","Clientes frecuentes y grupos con reservaciones"],
    trigger:"Una comida, evento o reserva con fecha definida",
    friction:"Descubrimiento, disponibilidad y cancelaciones",
    acquisition:"Reseñas, búsqueda local, redes y referidos",
    stages:["Interés","Reserva","Confirmación","Visita","Regreso"],
    coreModule:"Reservaciones, confirmaciones y fidelización"
  },
  educacion:{
    audiences:["Familias que comparan alternativas de aprendizaje","Profesionales que buscan desarrollar habilidades"],
    trigger:"Inscripción, cambio de programa o actualización profesional",
    friction:"Comparación de programas, becas y tiempos de respuesta",
    acquisition:"Búsqueda, sesiones informativas, referidos y contenido educativo",
    stages:["Consulta","Orientación","Visita","Inscripción","Seguimiento"],
    coreModule:"Seguimiento de interesados e inscripciones"
  },
  servicios_locales:{
    audiences:["Hogares con necesidades inmediatas","Empresas que contratan proveedores recurrentes"],
    trigger:"Urgencia, mantenimiento preventivo o recomendación",
    friction:"Disponibilidad, cotización y confianza",
    acquisition:"Google, referencias locales, WhatsApp y reseñas",
    stages:["Solicitud","Diagnóstico","Cotización","Servicio","Recompra"],
    coreModule:"Cotizaciones y confirmaciones de servicio"
  },
  otros:{
    audiences:["Compradores con una necesidad inmediata", "Clientes repetitivos de mayor valor"],
    trigger:"La necesidad de resolver un problema de manera confiable",
    friction:"Falta de respuesta consistente y seguimiento",
    acquisition:"Referidos y el canal con mayor intención real",
    stages:["Entrada","Contacto","Calificación","Oferta","Resultado"],
    coreModule:"Captura y seguimiento por etapas",
  },
};
const rate:Record<Currency,Record<Role,number>>={
  MXN:{fundador:650,director:450,ventas:260,operaciones:140},
  USD:{fundador:70,director:50,ventas:30,operaciones:16},
};
const saleAssumption:Record<Currency,number>={MXN:15000,USD:900};
const scenarioConfig={
  prudente:{time:0.2,uplift:0.05,target:15},
  central:{time:0.4,uplift:0.12,target:35},
  amplio:{time:0.6,uplift:0.22,target:60}
} as const;
const round=(n:number)=>Math.round(n);
const decimal=(n:number)=>Math.round(n*10)/10;
const safe=(n:number,min:number,max:number,name:string)=>{
  if(!Number.isFinite(n)||n<min||n>max) throw new Error("Valor fuera de rango: "+name);
};
export const defaultReportInput:ReportInput={
  sector:"consultoria",goal:"seguimiento",leads:50,manualHoursWeek:6,
  role:"fundador",roleMix:{fundador:100},channel:"referidos",channelMix:{referidos:100},avgSale:null,closeRate:null,currency:"MXN",
};

const actions:Record<Goal,Recommendation>={
  captacion:{title:"Crear una entrada constante de oportunidades",detail:"Definir segmentos, mensajes y captación por fuentes con consentimiento y métricas.",module:"Prospección + captación",kind:"configuration"},
  seguimiento:{title:"Que ningún prospecto quede olvidado",detail:"Asignar responsable, etapa y siguiente tarea. Los mensajes externos requieren revisión.",module:"Pipeline + tareas",kind:"native_recipe"},
  eficiencia:{title:"Recuperar horas para vender más",detail:"Reducir captura doble, clasificación y reportes manuales antes de automatizar tareas críticas.",module:"Formularios + automatización interna",kind:"native_recipe"},
  conversion:{title:"Convertir mejor cada oportunidad",detail:"Registrar objeciones, medir el avance y establecer seguimientos útiles.",module:"Pipeline + propuestas",kind:"native_recipe"},
  citas:{title:"Conseguir y confirmar más citas",detail:"Reducir fricción para agendar y preparar recordatorios con consentimiento.",module:"Agenda + seguimiento",kind:"native_recipe"},
  reactivacion:{title:"Volver a conversar con clientes elegibles",detail:"Identificar clientes inactivos con permiso vigente y preparar mensajes para su revisión.",module:"Segmentación + recuperación",kind:"needs_review"},
  contenido:{title:"Crear contenido que apoye la venta",detail:"Definir mensajes, campañas y materiales con revisión antes de publicar.",module:"Marketing + IA asistida",kind:"configuration"},
  calificacion:{title:"Distinguir prospectos con mayor intención",detail:"Preparar preguntas de calificación y prioridades para el equipo comercial.",module:"Formularios + CRM",kind:"configuration"}
};
const pillars:{label:string;state:string;signal:string}[]=[
  {label:"Atracción",state:"A diagnosticar",signal:"Canal y segmentos prioritarios"},
  {label:"Velocidad",state:"Mejorable",signal:"Respuesta inicial y asignación"},
  {label:"Conversión",state:"Por medir",signal:"Avance entre etapas y objeciones"},
  {label:"Continuidad",state:"Por activar",signal:"Seguimiento y reactivación"},
];

export function buildReport(input:ReportInput):Report {
  safe(input.leads,0,100000,"prospectos");
  safe(input.manualHoursWeek,0,80,"horas");
  if(input.avgSale!==null)safe(input.avgSale,0,1e9,"ticket");
  if(input.closeRate!==null)safe(input.closeRate,0,100,"conversión");
  const p=profiles[input.sector];
  if(!p||!rate[input.currency]?.[input.role]||!actions[input.goal])throw new Error("Perfil inválido");
  const roles:Role[]=["fundador","director","ventas","operaciones"];
  const roleShare=Object.fromEntries(roles.map(r=>[r,input.roleMix?.[r]??(input.roleMix?0:r===input.role?100:0)])) as Record<Role,number>;
  for(const v of Object.values(roleShare))safe(v,0,100,"responsable");
  if(Math.abs(Object.values(roleShare).reduce((a,b)=>a+b,0)-100)>0.001)throw new Error("La distribución de responsables debe sumar 100%.");
  const hourly=roles.reduce((sum,r)=>sum+roleShare[r]/100*rate[input.currency][r],0);
  const sourceKeys:Exclude<Channel,"ninguno">[]=["referidos","web","redes","whatsapp","anuncios","prospeccion"];
  const channelShare:Partial<Record<Exclude<Channel,"ninguno">,number>>=
    input.channelMix??(input.channel==="ninguno"?{}:{[input.channel]:100});
  for(const key of Object.keys(channelShare)){
    if(!sourceKeys.includes(key as Exclude<Channel,"ninguno">))throw new Error("Canal no reconocido.");
  }
  for(const v of Object.values(channelShare))safe(v,0,100,"canal");
  const channelSum=Object.values(channelShare).reduce((a,b)=>a+b,0);
  if(input.leads>0&&Math.abs(channelSum-100)>0.001)throw new Error("Las fuentes deben sumar 100%.");
  const labels:Record<Exclude<Channel,"ninguno">,string>={
    referidos:"Referidos",web:"Web",redes:"Redes",whatsapp:"WhatsApp",anuncios:"Publicidad",prospeccion:"Prospección directa"
  };
  const channelSummary=input.leads===0?"Todavía no hay una fuente constante registrada":
    sourceKeys.filter(k=>(channelShare[k]??0)>0).map(k=>labels[k]+" "+channelShare[k]+"%").join(" · ");
  const startsWithoutLeads=input.leads===0;
  const inferred:string[]=[];
  const avgSale=input.avgSale??saleAssumption[input.currency];
  const closeRatePercent=input.closeRate??(startsWithoutLeads?3:5);
  if(input.avgSale===null)inferred.push("Valor de venta");
  if(input.closeRate===null)inferred.push("Tasa de conversión");
  // La contribución de ventas es sólo un escenario condicionado a demanda y ventas nuevas.
  // Si no hay leads, simular la META DE CAPTACIÓN, no resultados de clientes existentes.
  // Para negocios con leads, no crear nuevas fuentes de demanda: probar mejora relativa.
  const scenarios={} as Record<ThreeScenarios,ReportScenario>;
  for(const key of ["prudente","central","amplio"] as const){
    const cfg=scenarioConfig[key];
    const recovered=input.manualHoursWeek*4.33*cfg.time;
    const projected=startStartsTarget(input.leads,cfg.target);
    const grossSales=startsWithoutLeads
      ? projected*closeRatePercent/100*avgSale
      : input.leads*closeRatePercent/100*avgSale*cfg.uplift;
    scenarios[key]={
      recoveredHoursMonth:decimal(recovered),
      capacityValueMonth:round(recovered*hourly),
      grossSalesOpportunityMonth:round(grossSales),
      estimatedProspectsMonth:projected,
      conditional:true,
    };
  }
  const signal=startsWithoutLeads
    ?"Tu primera prioridad es generar demanda, antes de optimizar un embudo que aún no existe."
    :input.goal==="captacion"
      ?"La oportunidad está en sumar canales medibles y aprovechar mejor cada contacto."
      :"Ya existe una entrada de prospectos: el crecimiento puede empezar por mejorar el proceso comercial.";
  const recs:Recommendation[]=[
    actions[input.goal],
    {title:p.coreModule,detail:"Configurar el recorrido comercial según tu sector; validar cada automatización antes de publicarla.",module:"Growth OS por perfil",kind:"native_recipe"},
    {title:"Tablero de oportunidades reales",detail:"Visualizar origen, velocidad de atención, negocios abiertos y avances para tomar decisiones.",module:"CRM + reportes",kind:"configuration"},
  ];
  if(startsWithoutLeads){
    recs[0]={title:"Tu primer motor de prospección",detail:"Construir una primera fuente de clientes potenciales, probar mensajes con consentimiento y medir conversaciones útiles. Los volúmenes que ves son objetivos hipotéticos, no prospectos ya conseguidos.",module:"Captación + segmentación",kind:"configuration"};
  }
  return {
    input,startsWithoutLeads,roleHourlyReference:hourly,roleShare,channelSummary,channelShare,
    assumptions:{closeRatePercent,avgSale,hourly,targetProspects:scenarios.central.estimatedProspectsMonth},
    inferred,audiences:p.audiences,buyingTrigger:p.trigger,friction:p.friction,acquisition:p.acquisition,
    growthThesis:signal,pillars,recommendations:recs,workflowCandidates:selectWorkflowBlueprints(input.sector,input.goal,!startsWithoutLeads),scenarios,stages:p.stages
  };
}
function startStartsTarget(current:number,target:number){return current===0?target:current;}
