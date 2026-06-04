export type AIProvider = "anthropic" | "openai" | "google" | "deepseek";

export type AIModel =
  | "claude-haiku-4-5"
  | "claude-sonnet-4-5"
  | "gpt-4o-mini"
  | "gpt-4o"
  | "gemini-1.5-flash"
  | "gemini-1.5-pro"
  | "deepseek-chat";

export type AITask =
  | "scrape_analysis"
  | "wizard_prefill"
  | "icp_generation"
  | "icp_score"
  | "bot_prompt"
  | "pitch_deck"
  | "proposal"
  | "one_pager"
  | "call_script"
  | "email_cold"
  | "email_nurture"
  | "email_reactivation"
  | "email_winback"
  | "email_client"
  | "linkedin_messages"
  | "whatsapp_messages"
  | "posts_monthly"
  | "post_single"
  | "ads_copy"
  | "newsletter"
  | "social_reel_script";

export interface AITaskConfig {
  task: AITask;
  provider: AIProvider;
  model: AIModel;
  maxInputTokens: number;
  maxOutputTokens: number;
  temperature: number;
  description: string;
}

export interface AIPricing {
  provider: AIProvider;
  model: AIModel;
  inputCostPer1MTokens: number;
  outputCostPer1MTokens: number;
  updatedAt: string;
}

export interface AIResponse<T = string> {
  content: T;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUSD: number;
  };
  provider: AIProvider;
  model: AIModel;
  task: AITask;
}

export interface AIUsageRecord {
  id: string;
  businessId: string;
  provider: AIProvider;
  model: AIModel;
  task: AITask;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  month: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AIClientRuntimeConfig {
  devMode: boolean;
  devProvider?: AIProvider;
  devModel?: AIModel;
}
