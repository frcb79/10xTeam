import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveTaskConfig } from "@/config/ai.config";
import { reserveAIUsage, settleAIUsage } from "@/lib/ai/usage";
import { createServiceClient } from "@/lib/supabase/service";
import type { AIResponse, AITask } from "@/types/ai.types";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ maxRetries: 0, apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ maxRetries: 0, apiKey: process.env.OPENAI_API_KEY })
  : null;

const google = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

const deepseek = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({ maxRetries: 0, apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com/v1" })
  : null;

let runtimePriceMap: Record<string, { input: number; output: number }> = {};
let pricingCacheExpiresAt = 0;

const PRICING_CACHE_TTL_MS = 5 * 60 * 1000;

export async function generateWithAI(params: {
  task: AITask;
  systemPrompt: string;
  userPrompt: string;
  outputSchema?: Record<string, unknown>;
  businessId?: string;
  metadata?: Record<string, unknown>;
}): Promise<AIResponse<string>> {
  const { task, systemPrompt, userPrompt, outputSchema, businessId = "dev-local" } = params;
  const config = resolveTaskConfig(task);



  // Sin proveedor de desarrollo, conservar mocks para instalaciones locales sin credenciales.
  // Con AI_DEV_PROVIDER configurado, ejecutar ese proveedor real para validar la experiencia.
  if (process.env.AI_DEV_MODE === "true" && !process.env.AI_DEV_PROVIDER) {
    return {
      content: `[AI_DEV_MODE] task=${task} provider=${config.provider} model=${config.model}`,
      usage: { inputTokens: 0, outputTokens: 0, costUSD: 0 },
      provider: config.provider,
      model: config.model,
      task,
    };
  }

  if (process.env.AI_PAID_EXECUTION_ENABLED !== "true" || businessId === "dev-local") {
    throw new Error("IA de pago desactivada para este registro.");
  }
  await refreshPricingFromDB();
  // A UTF-8 byte upper bound plus message/schema overhead is conservative for text-only requests.
  const inputBound = Buffer.byteLength(systemPrompt + userPrompt + JSON.stringify(outputSchema ?? {})) + 2048;
  const maxCost = estimateCost(config.provider,config.model,inputBound,config.maxOutputTokens);
  const reservation = await reserveAIUsage({businessId,provider:config.provider,model:config.model,task,maxCost});
  let aiResponse: AIResponse<string>;

  switch (config.provider) {
    case "anthropic": {
      if (!anthropic) throw new Error("ANTHROPIC_API_KEY is missing");
      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: config.maxOutputTokens,
        ...(config.model === "claude-opus-5" ? {} : { temperature: config.temperature }),
        ...(outputSchema ? { output_config: { format: { type: "json_schema" as const, schema: outputSchema } } } : {}),
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      aiResponse = {
        content: response.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("\n"),
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

  await settleAIUsage(reservation,businessId,aiResponse.usage.inputTokens,aiResponse.usage.outputTokens,aiResponse.usage.costUSD);

  return aiResponse;
}

function estimateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = runtimePriceMap[`${provider}:${model}`];
  if (!pricing || !Number.isFinite(pricing.input) || !Number.isFinite(pricing.output) || pricing.input <= 0 || pricing.output <= 0) throw new Error("Tarifa de IA pendiente de verificar.");

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
    runtimePriceMap = {};
    return;
  }

  const { data, error } = await supabase
    .from("ai_pricing")
    .select("provider, model, input_cost_per_1m_tokens, output_cost_per_1m_tokens")
    .eq("is_active", true);

  if (error || !data || data.length === 0) {
    pricingCacheExpiresAt = now + PRICING_CACHE_TTL_MS;
    runtimePriceMap = {};
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
    ...dbPrices,
  };
  pricingCacheExpiresAt = now + PRICING_CACHE_TTL_MS;
}
