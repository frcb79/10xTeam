import type { AITask, AITaskConfig, AIProvider, AIModel, AIClientRuntimeConfig } from "@/types/ai.types";

export const AI_TASK_ROUTING: Record<AITask, AITaskConfig> = {
  scrape_analysis: {
    task: "scrape_analysis",
    provider: "anthropic",
    model: "claude-haiku-4-5",
    maxInputTokens: 8000,
    maxOutputTokens: 2000,
    temperature: 0.1,
    description: "Analyze scraped content",
  },
  wizard_prefill: {
    task: "wizard_prefill",
    provider: "anthropic",
    model: "claude-haiku-4-5",
    maxInputTokens: 6000,
    maxOutputTokens: 1500,
    temperature: 0.1,
    description: "Prefill wizard answers",
  },
  icp_generation: {
    task: "icp_generation",
    provider: "anthropic",
    model: "claude-sonnet-4-5",
    maxInputTokens: 4000,
    maxOutputTokens: 3000,
    temperature: 0.3,
    description: "Generate ICP card",
  },
  icp_score: {
    task: "icp_score",
    provider: "anthropic",
    model: "claude-haiku-4-5",
    maxInputTokens: 3000,
    maxOutputTokens: 800,
    temperature: 0,
    description: "Evaluate ICP quality",
  },
  bot_prompt: {
    task: "bot_prompt",
    provider: "anthropic",
    model: "claude-sonnet-4-5",
    maxInputTokens: 4000,
    maxOutputTokens: 2500,
    temperature: 0.2,
    description: "Generate bot prompt",
  },
  pitch_deck: {
    task: "pitch_deck",
    provider: "anthropic",
    model: "claude-sonnet-4-5",
    maxInputTokens: 3000,
    maxOutputTokens: 3500,
    temperature: 0.4,
    description: "Generate pitch deck",
  },
  proposal: {
    task: "proposal",
    provider: "anthropic",
    model: "claude-sonnet-4-5",
    maxInputTokens: 3000,
    maxOutputTokens: 4000,
    temperature: 0.3,
    description: "Generate proposal",
  },
  one_pager: {
    task: "one_pager",
    provider: "openai",
    model: "gpt-4o-mini",
    maxInputTokens: 2000,
    maxOutputTokens: 800,
    temperature: 0.4,
    description: "Generate one-pager",
  },
  call_script: {
    task: "call_script",
    provider: "openai",
    model: "gpt-4o-mini",
    maxInputTokens: 2500,
    maxOutputTokens: 2000,
    temperature: 0.3,
    description: "Generate call script",
  },
  email_cold: {
    task: "email_cold",
    provider: "openai",
    model: "gpt-4o-mini",
    maxInputTokens: 2000,
    maxOutputTokens: 2000,
    temperature: 0.5,
    description: "Generate cold email sequence",
  },
  email_nurture: {
    task: "email_nurture",
    provider: "openai",
    model: "gpt-4o-mini",
    maxInputTokens: 2000,
    maxOutputTokens: 2000,
    temperature: 0.5,
    description: "Generate nurture sequence",
  },
  email_reactivation: {
    task: "email_reactivation",
    provider: "deepseek",
    model: "deepseek-chat",
    maxInputTokens: 2000,
    maxOutputTokens: 1500,
    temperature: 0.5,
    description: "Generate reactivation emails",
  },
  email_winback: {
    task: "email_winback",
    provider: "openai",
    model: "gpt-4o-mini",
    maxInputTokens: 2000,
    maxOutputTokens: 1500,
    temperature: 0.5,
    description: "Generate winback emails",
  },
  email_client: {
    task: "email_client",
    provider: "openai",
    model: "gpt-4o-mini",
    maxInputTokens: 2000,
    maxOutputTokens: 2000,
    temperature: 0.4,
    description: "Generate client lifecycle emails",
  },
  linkedin_messages: {
    task: "linkedin_messages",
    provider: "openai",
    model: "gpt-4o-mini",
    maxInputTokens: 1500,
    maxOutputTokens: 1000,
    temperature: 0.5,
    description: "Generate LinkedIn messages",
  },
  whatsapp_messages: {
    task: "whatsapp_messages",
    provider: "openai",
    model: "gpt-4o-mini",
    maxInputTokens: 1500,
    maxOutputTokens: 800,
    temperature: 0.5,
    description: "Generate WhatsApp outbound",
  },
  posts_monthly: {
    task: "posts_monthly",
    provider: "google",
    model: "gemini-1.5-flash",
    maxInputTokens: 3000,
    maxOutputTokens: 6000,
    temperature: 0.7,
    description: "Generate monthly post calendar",
  },
  post_single: {
    task: "post_single",
    provider: "google",
    model: "gemini-1.5-flash",
    maxInputTokens: 2000,
    maxOutputTokens: 600,
    temperature: 0.7,
    description: "Generate single social post",
  },
  ads_copy: {
    task: "ads_copy",
    provider: "google",
    model: "gemini-1.5-flash",
    maxInputTokens: 2000,
    maxOutputTokens: 1200,
    temperature: 0.6,
    description: "Generate ad copy",
  },
  newsletter: {
    task: "newsletter",
    provider: "openai",
    model: "gpt-4o-mini",
    maxInputTokens: 2000,
    maxOutputTokens: 1500,
    temperature: 0.5,
    description: "Generate monthly newsletter",
  },
  social_reel_script: {
    task: "social_reel_script",
    provider: "google",
    model: "gemini-1.5-flash",
    maxInputTokens: 1500,
    maxOutputTokens: 500,
    temperature: 0.7,
    description: "Generate social reel script",
  },
};

function parseDevModeConfig(): AIClientRuntimeConfig {
  const devMode = process.env.AI_DEV_MODE === "true";
  const devProvider = process.env.AI_DEV_PROVIDER as AIProvider | undefined;
  const devModel = process.env.AI_DEV_MODEL as AIModel | undefined;

  return { devMode, devProvider, devModel };
}

export function resolveTaskConfig(task: AITask): AITaskConfig {
  const base = AI_TASK_ROUTING[task];
  const runtime = parseDevModeConfig();

  if (!runtime.devMode) return base;

  return {
    ...base,
    provider: runtime.devProvider ?? base.provider,
    model: runtime.devModel ?? base.model,
    description: `[DEV_MODE] ${base.description}`,
  };
}
