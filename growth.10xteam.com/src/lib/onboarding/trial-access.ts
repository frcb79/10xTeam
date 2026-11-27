// Diseño sin efectos secundarios de la prueba real de 10xteam.
// La elegibilidad no aprovisiona subcuentas, no modifica usuarios ni factura.
export type TrialPlan = "growth" | "scale";
export type TrialGateInput = {
  plan:TrialPlan;
  verifiedEmail:boolean;
  acceptedTerms:boolean;
  hasUsedTrial:boolean;
  rateLimitExceeded:boolean;
  agencyReady:boolean;
  businessNameValid:boolean;
  prospectCountry:"MX"|"US"|"other";
  permissionsAccepted:boolean;
};
export type TrialGateResult = {
  eligible:boolean;
  blockers:string[];
  requiresCard:false;
  trialDays:14;
  onSuccess:"start_provisioning";
};

export const TRIAL_DAYS=14 as const;
export function trialEligibility(input:TrialGateInput):TrialGateResult {
  const blockers:string[]=[];
  if(!["growth","scale"].includes(input.plan))blockers.push("PLAN_INVALID");
  if(!input.verifiedEmail)blockers.push("EMAIL_NOT_VERIFIED");
  if(!input.acceptedTerms)blockers.push("TERMS_NOT_ACCEPTED");
  if(!input.permissionsAccepted)blockers.push("PROVISIONING_NOT_AUTHORIZED");
  if(input.hasUsedTrial)blockers.push("TRIAL_ALREADY_USED");
  if(input.rateLimitExceeded)blockers.push("RATE_LIMIT");
  if(!input.agencyReady)blockers.push("AGENCY_NOT_READY");
  if(!input.businessNameValid)blockers.push("BUSINESS_INCOMPLETE");
  if(input.prospectCountry==="other")blockers.push("COUNTRY_REVIEW_REQUIRED");
  return {eligible:blockers.length===0,blockers,requiresCard:false,trialDays:TRIAL_DAYS,onSuccess:"start_provisioning"};
}
export function trialWindow(readyAt:string){
  const start=new Date(readyAt);
  if(!Number.isFinite(start.getTime()))throw new Error("Fecha inválida.");
  const end=new Date(start.getTime()+TRIAL_DAYS*24*60*60*1000);
  return {startsAt:start.toISOString(),endsAt:end.toISOString()};
}
// Se llama únicamente después del E2E que confirma CRM funcional.
// El contrato debe informar exactamente cuándo inicia la prueba.
export function isTrialExpired(at:string,endsAt:string){
  const when=new Date(at).getTime(),end=new Date(endsAt).getTime();
  if(!Number.isFinite(when)||!Number.isFinite(end))throw new Error("Fecha inválida.");
  return when>=end;
}
