import { actor, db } from "@/lib/onboarding/store";
import type { AIModel, AIProvider, AITask } from "@/types/ai.types";

export async function reserveAIUsage(input: { businessId:string; provider:AIProvider; model:AIModel; task:AITask; maxCost:number }) {
  if(process.env.AI_PAID_EXECUTION_ENABLED!=="true" || !/^[a-f0-9-]{36}$/i.test(input.businessId) || !Number.isFinite(input.maxCost) || input.maxCost<=0) throw new Error("El uso de IA de pago requiere un presupuesto autorizado.");
  const {userId}=await actor(); if(!userId)throw new Error("Se requiere un titular autenticado.");
  const {data,error}=await db().rpc("reserve_10x_ai",{p_business:input.businessId,p_user:userId,p_provider:input.provider,p_model:input.model,p_task:input.task,p_max_cost:input.maxCost});
  if(error||typeof data!=="string")throw new Error("No hay presupuesto autorizado disponible.");
  return data;
}
export async function settleAIUsage(id:string,businessId:string,inputTokens:number,outputTokens:number,cost:number) {
  if(!Number.isFinite(cost)||cost<=0||inputTokens<=0||outputTokens<0)throw new Error("Consumo pendiente de conciliación.");
  const {data,error}=await db().from("ai_usage").update({input_tokens:inputTokens,output_tokens:outputTokens,cost_usd:cost,metadata:{reservation_status:"settled"}}).eq("id",id).eq("business_id",businessId).eq("metadata->>reservation_status","reserved").select("id").maybeSingle();
  if(error||!data)throw new Error("Consumo pendiente de conciliación.");
}
