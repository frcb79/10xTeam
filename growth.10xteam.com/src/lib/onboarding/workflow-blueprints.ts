import type { Goal, Sector } from "./report-10x";

export type WorkflowBlueprint = {
  id: string;
  purpose: string;
  category: "CRM" | "Citas" | "Conversión" | "Captación";
  source: "ghl_template_candidate" | "existing_internal_draft";
  trigger: string;
  actions: string[];
  requiresChannelApproval: boolean;
  state: "proposal_only";
};

// These are INTERNAL recommendation identifiers, NOT verified GHL template ids.
// HighLevel's template library is chosen by UI and can be copied across subaccounts.
// Never publish workflows or send messages based solely on these recommendations.
const library: Record<string,WorkflowBlueprint>={
  capture: {
    id:"10x_capture_assign", purpose:"Captura, asignación y primera tarea", category:"CRM",
    source:"ghl_template_candidate", trigger:"Formulario recibido",
    actions:["Deduplicar contacto","Crear oportunidad","Asignar tarea interna"],
    requiresChannelApproval:false,state:"proposal_only",
  },
  followup: {
    id:"10x_followup_tasks", purpose:"Seguimiento de propuestas sin conversaciones perdidas", category:"Conversión",
    source:"ghl_template_candidate", trigger:"Etapa u oportunidad actualizada",
    actions:["Recordatorio interno","Revisar antigüedad de oportunidad"],
    requiresChannelApproval:false,state:"proposal_only",
  },
  appointment: {
    id:"10x_appointment_cycle", purpose:"Confirmaciones y seguimiento de citas", category:"Citas",
    source:"ghl_template_candidate", trigger:"Cita reservada",
    actions:["Asignar responsable","Preparar recordatorios para aprobación"],
    requiresChannelApproval:true,state:"proposal_only",
  },
  first_demand: {
    id:"10x_first_demand", purpose:"Primera fuente de prospectos y seguimiento", category:"Captación",
    source:"existing_internal_draft", trigger:"Prospecto de fuente autorizada",
    actions:["Validar origen y consentimiento","Calificar","Crear oportunidad y tarea"],
    requiresChannelApproval:false,state:"proposal_only",
  },
  reactivation: {
    id:"10x_reactivate", purpose:"Reactivación responsable de interesados", category:"Conversión",
    source:"ghl_template_candidate", trigger:"Contacto inactivo y elegible",
    actions:["Revisar consentimiento vigente","Crear tarea de reactivación"],
    requiresChannelApproval:true,state:"proposal_only",
  },
};

export function selectWorkflowBlueprints(sector:Sector,goal:Goal,hasLeads:boolean):WorkflowBlueprint[]{
  const keys=[
    hasLeads?"capture":"first_demand",
    sector==="citas"?"appointment":goal==="conversion"?"reactivation":"followup",
  ];
  return [...new Set(keys)].map(k=>({...library[k],actions:[...library[k].actions]}));
}
