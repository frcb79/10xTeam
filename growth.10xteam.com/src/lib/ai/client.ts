import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveTaskConfig } from "@/config/ai.config";
import { checkUsageLimit, trackAIUsage } from "@/lib/ai/usage";
import { createServiceClient } from "@/lib/supabase/service";
import type { AIResponse, AITask } from "@/types/ai.types";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const google = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

const deepseek = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com/v1" })
  : null;

const FALLBACK_PRICE_MAP: Record<string, { input: number; output: number }> = {
  "anthropic:claude-haiku-4-5": { input: 0.8, output: 4.0 },
  "anthropic:claude-sonnet-4-5": { input: 3.0, output: 15.0 },
  "openai:gpt-4o-mini": { input: 0.15, output: 0.6 },
  "openai:gpt-4o": { input: 2.5, output: 10.0 },
  "google:gemini-1.5-flash": { input: 0.075, output: 0.3 },
  "google:gemini-1.5-pro": { input: 1.25, output: 5.0 },
  "deepseek:deepseek-chat": { input: 0.14, output: 0.28 },
};

let runtimePriceMap = { ...FALLBACK_PRICE_MAP };
let pricingCacheExpiresAt = 0;

const PRICING_CACHE_TTL_MS = 5 * 60 * 1000;

export async function generateWithAI(params: {
  task: AITask;
  systemPrompt: string;
  userPrompt: string;
  businessId?: string;
  metadata?: Record<string, unknown>;
}): Promise<AIResponse<string>> {
  const { task, systemPrompt, userPrompt, businessId = "dev-local", metadata = {} } = params;
  const config = resolveTaskConfig(task);

  await refreshPricingFromDB();

  if (process.env.AI_DEV_MODE === "true") {
    return {
      content: `[AI_DEV_MODE] task=${task} provider=${config.provider} model=${config.model}`,
      usage: { inputTokens: 0, outputTokens: 0, costUSD: 0 },
      provider: config.provider,
      model: config.model,
      task,
    };
  }

  const usageLimit = await checkUsageLimit(businessId);
  if (!usageLimit.canProceed) {
    throw new Error(
      `AI usage limit reached. Current: $${usageLimit.currentCostUSD.toFixed(4)} / ` +
        `Limit: $${usageLimit.limitUSD.toFixed(2)}. ${usageLimit.message}`
    );
  }

  let aiResponse: AIResponse<string>;

  switch (config.provider) {
    case "anthropic": {
      if (!anthropic) throw new Error("ANTHROPIC_API_KEY is missing");
      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: config.maxOutputTokens,
        temperature: config.temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      aiResponse = {
        content: response.content[0]?.type === "text" ? response.content[0].text : "",
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          costUSD: estimateCost(
            config.provider,
            config.model,
            response.usage.input_tokens,
            response.usage.output_tokens
          ),
        },
        provider: config.provider,
        model: config.model,
        task,
      };
      break;
    }
    case "openai": {
      if (!openai) throw new Error("OPENAI_API_KEY is missing");
      const response = await openai.chat.completions.create({
        model: config.model,
        max_tokens: config.maxOutputTokens,
        temperature: config.temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      const inputTokens = response.usage?.prompt_tokens ?? 0;
      const outputTokens = response.usage?.completion_tokens ?? 0;
      aiResponse = {
        content: response.choices[0]?.message?.content ?? "",
        usage: {
          inputTokens,
          outputTokens,
          costUSD: estimateCost(config.provider, config.model, inputTokens, outputTokens),
        },
        provider: config.provider,
        model: config.model,
        task,
      };
      break;
    }
    case "google": {
      if (!google) throw new Error("GOOGLE_AI_API_KEY is missing");
      const model = google.getGenerativeModel({
        model: config.model,
        systemInstruction: systemPrompt,
      });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens: config.maxOutputTokens,
          temperature: config.temperature,
        },
      });
      const response = result.response;
      const inputTokens = response.usageMetadata?.promptTokenCount ?? 0;
      const outputTokens = response.usageMetadata?.candidatesTokenCount ?? 0;
      aiResponse = {
        content: response.text(),
        usage: {
          inputTokens,
          outputTokens,
          costUSD: estimateCost(config.provider, config.model, inputTokens, outputTokens),
        },
        provider: config.provider,
        model: config.model,
        task,
      };
      break;
    }
    case "deepseek": {
      if (!deepseek) throw new Error("DEEPSEEK_API_KEY is missing");
      const response = await deepseek.chat.completions.create({
        model: config.model,
        max_tokens: config.maxOutputTokens,
        temperature: config.temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      const inputTokens = response.usage?.prompt_tokens ?? 0;
      const outputTokens = response.usage?.completion_tokens ?? 0;
      aiResponse = {
        content: response.choices[0]?.message?.content ?? "",
        usage: {
          inputTokens,
          outputTokens,
          costUSD: estimateCost(config.provider, config.model, inputTokens, outputTokens),
        },
        provider: config.provider,
        model: config.model,
        task,
      };
      break;
    }
    default:
      throw new Error(`Unknown provider for task ${task}`);
  }

  await trackAIUsage({
    businessId,
    provider: aiResponse.provider,
    model: aiResponse.model,
    task,
    inputTokens: aiResponse.usage.inputTokens,
    outputTokens: aiResponse.usage.outputTokens,
    costUSD: aiResponse.usage.costUSD,
    metadata,
  });

  return aiResponse;
}

function estimateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = runtimePriceMap[`${provider}:${model}`];
  if (!pricing) return 0;

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

async function refreshPricingFromDB(): Promise<void> {
  const now = Date.now();
  if (now < pricingCacheExpiresAt) return;

  const supabase = createServiceClient();
  if (!supabase) {
    pricingCacheExpiresAt = now + PRICING_CACHE_TTL_MS;
    runtimePriceMap = { ...FALLBACK_PRICE_MAP };
    return;
  }

  const { data, error } = await supabase
    .from("ai_pricing")
    .select("provider, model, input_cost_per_1m_tokens, output_cost_per_1m_tokens")
    .eq("is_active", true);

  if (error || !data || data.length === 0) {
    pricingCacheExpiresAt = now + PRICING_CACHE_TTL_MS;
    runtimePriceMap = { ...FALLBACK_PRICE_MAP };
    return;
  }

  const dbPrices: Record<string, { input: number; output: number }> = {};

  for (const row of data) {
    const key = `${row.provider}:${row.model}`;
    dbPrices[key] = {
      input: Number(row.input_cost_per_1m_tokens ?? 0),
      output: Number(row.output_cost_per_1m_tokens ?? 0),
    };
  }

  runtimePriceMap = {
    ...FALLBACK_PRICE_MAP,
    ...dbPrices,
  };
  pricingCacheExpiresAt = now + PRICING_CACHE_TTL_MS;
}
