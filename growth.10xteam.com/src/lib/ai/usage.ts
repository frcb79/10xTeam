import { createServiceClient } from "@/lib/supabase/service";
import type { AIModel, AIProvider, AITask } from "@/types/ai.types";

export async function trackAIUsage(params: {
  businessId: string;
  provider: AIProvider;
  model: AIModel;
  task: AITask;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createServiceClient();
  if (!supabase) return;

  const month = new Date().toISOString().slice(0, 7);

  await supabase.from("ai_usage").insert({
    business_id: params.businessId,
    provider: params.provider,
    model: params.model,
    task: params.task,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    cost_usd: params.costUSD,
    month,
    metadata: params.metadata ?? {},
  });
}

export async function checkUsageLimit(businessId: string): Promise<{
  canProceed: boolean;
  currentCostUSD: number;
  limitUSD: number;
  isOverage: boolean;
  message: string;
}> {
  const supabase = createServiceClient();
  if (!supabase) {
    return {
      canProceed: true,
      currentCostUSD: 0,
      limitUSD: 999,
      isOverage: false,
      message: "Supabase service disabled, usage checks skipped.",
    };
  }

  const month = new Date().toISOString().slice(0, 7);

  const { data: business } = await supabase
    .from("businesses")
    .select("plan")
    .eq("id", businessId)
    .single();

  const plan = business?.plan ?? "trial";

  const { data: allowance } = await supabase
    .from("plan_ai_allowances")
    .select("*")
    .eq("plan", plan)
    .single();

  if (!allowance) {
    return {
      canProceed: true,
      currentCostUSD: 0,
      limitUSD: 999,
      isOverage: false,
      message: "Plan allowance config missing.",
    };
  }

  const { data: usageRows } = await supabase
    .from("ai_usage")
    .select("cost_usd")
    .eq("business_id", businessId)
    .eq("month", month);

  const currentCostUSD = (usageRows ?? []).reduce((sum, row) => {
    return sum + Number(row.cost_usd ?? 0);
  }, 0);

  const monthlyAllowance = Number(allowance.monthly_allowance_usd ?? 0);
  const hardLimitUSD = Number(allowance.hard_limit_usd ?? 9999);

  if (currentCostUSD < monthlyAllowance) {
    return {
      canProceed: true,
      currentCostUSD,
      limitUSD: monthlyAllowance,
      isOverage: false,
      message: "Within plan allowance",
    };
  }

  if (!allowance.hard_limit && currentCostUSD < hardLimitUSD) {
    return {
      canProceed: true,
      currentCostUSD,
      limitUSD: hardLimitUSD,
      isOverage: true,
      message: "Overage mode enabled",
    };
  }

  return {
    canProceed: false,
    currentCostUSD,
    limitUSD: hardLimitUSD,
    isOverage: true,
    message: "Monthly AI limit reached",
  };
}
