# 10xTeam Wizard — Especificación Técnica
## Parte 2 de 5: Multi-AI, Control de Costos, Wizard Config y State Management

> **Cómo usar esta parte:**
> Sube la Parte 1 primero como contexto base, luego agrega esta parte.
> Prompt sugerido: *"Tengo el spec de arquitectura (Parte 1) y ahora tengo la Parte 2
> con el sistema multi-AI, la configuración del wizard y el estado. Implementemos
> [el archivo que quieras empezar]."*

---

## 1. Arquitectura Multi-AI

### 1.1 — La decisión: cuándo usar cada proveedor

La regla de oro es **calidad donde importa, precio donde no importa**.
Un error en el ICP Card arruina todos los materiales del mes. Un post de Instagram
mediocre se puede regenerar. El costo de un error es más alto que el costo del token.

```
TAREA                               PROVEEDOR             RAZÓN
─────────────────────────────────────────────────────────────────────
Análisis de sitio web (scraping)    Claude Haiku          Rápido, barato, suficiente
Pre-llenado del wizard              Claude Haiku          Clasificación y extracción
Generación del ICP Card completo    Claude Sonnet         Máxima calidad — es la base
Pitch deck (10 slides)              Claude Sonnet         Requiere coherencia larga
Propuesta comercial                 Claude Sonnet         Documento crítico de ventas
Script del bot de WhatsApp          Claude Sonnet         Prompt complejo, crítico
Emails (secuencias frías/nurture)   GPT-4o mini           Excelente para email copy
Posts de redes sociales             Gemini 1.5 Flash      Buena calidad, más barato
Ads copy (variantes)                Gemini 1.5 Flash      Volumen alto, menor criticidad
One-pager                           GPT-4o mini           Formato estructurado corto
Newsletter mensual                  GPT-4o mini           Tono editorial
ICP Quality Score (evaluación)      Claude Haiku          Solo análisis, no generación
Regeneración mensual de posts       DeepSeek V3           Volumen masivo, bajo costo
Reactivación de leads dormidos      DeepSeek V3           Secuencias repetitivas
Win-back emails                     GPT-4o mini           Tono emocional importante
```

### 1.2 — Costos estimados por proveedor (referencia 2026)

```
PROVEEDOR            MODELO              INPUT (1M tokens)  OUTPUT (1M tokens)
─────────────────────────────────────────────────────────────────────────────
Anthropic            claude-haiku-4-5    $0.80              $4.00
Anthropic            claude-sonnet-4-5   $3.00              $15.00
Google               gemini-1.5-flash    $0.075             $0.30
OpenAI               gpt-4o-mini         $0.15              $0.60
OpenAI               gpt-4o              $2.50              $10.00
DeepSeek             deepseek-chat       $0.14              $0.28
```

> **Nota importante:** Los precios cambian. El sistema debe leer los costos de la base
> de datos (tabla `ai_pricing`), no del código. Así se actualizan sin deploy.

---

## 2. Tipos del Sistema Multi-AI

### `types/ai.types.ts`

```typescript
// ── PROVEEDORES ────────────────────────────────────────────────────────────

export type AIProvider = 'anthropic' | 'openai' | 'google' | 'deepseek'

export type AIModel =
  // Anthropic
  | 'claude-haiku-4-5'
  | 'claude-sonnet-4-5'
  // OpenAI
  | 'gpt-4o-mini'
  | 'gpt-4o'
  // Google
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro'
  // DeepSeek
  | 'deepseek-chat'

// ── TAREAS ─────────────────────────────────────────────────────────────────

export type AITask =
  | 'scrape_analysis'          // Análisis del contenido scrapeado
  | 'wizard_prefill'           // Pre-llenado del wizard
  | 'icp_generation'           // Generación del ICP Card completo
  | 'icp_score'                // Cálculo del ICP Quality Score
  | 'bot_prompt'               // Generación del prompt del bot
  | 'pitch_deck'               // Pitch deck completo
  | 'proposal'                 // Propuesta comercial
  | 'one_pager'                // One-pager
  | 'call_script'              // Scripts de llamada
  | 'email_cold'               // Secuencia email frío
  | 'email_nurture'            // Secuencia nurture
  | 'email_reactivation'       // Reactivación de inactivos
  | 'email_winback'            // Win-back
  | 'email_client'             // Emails para clientes activos
  | 'linkedin_messages'        // Mensajes de LinkedIn
  | 'whatsapp_messages'        // Mensajes de WhatsApp outbound
  | 'posts_monthly'            // Calendario de posts mensual
  | 'post_single'              // Un post individual
  | 'ads_copy'                 // Copy de anuncios
  | 'newsletter'               // Newsletter mensual
  | 'social_reel_script'       // Guión de reel

// ── CONFIGURACIÓN DE ROUTING ───────────────────────────────────────────────

export interface AITaskConfig {
  task: AITask
  provider: AIProvider
  model: AIModel
  maxInputTokens: number
  maxOutputTokens: number
  temperature: number         // 0.0 (determinista) — 1.0 (creativo)
  description: string         // Para logs y debugging
}

export interface AIClientRuntimeConfig {
  devMode: boolean
  devProvider?: AIProvider
  devModel?: AIModel
}

// ── USO Y COSTOS ───────────────────────────────────────────────────────────

export interface AIUsageRecord {
  id: string
  businessId: string
  provider: AIProvider
  model: AIModel
  task: AITask
  inputTokens: number
  outputTokens: number
  costUSD: number             // Costo calculado en el momento
  month: string               // "2026-07"
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AIUsageSummary {
  businessId: string
  month: string
  totalCostUSD: number
  byProvider: Record<AIProvider, ProviderUsageSummary>
  byTask: Record<AITask, number>  // costo en USD por tarea
  planAllowanceUSD: number
  overageUSD: number
  overageCharged: boolean
}

export interface ProviderUsageSummary {
  totalInputTokens: number
  totalOutputTokens: number
  totalCostUSD: number
  calls: number
}

// ── RESPUESTA UNIFICADA ────────────────────────────────────────────────────

export interface AIResponse<T = string> {
  content: T
  usage: {
    inputTokens: number
    outputTokens: number
    costUSD: number
  }
  provider: AIProvider
  model: AIModel
  task: AITask
}

// ── PRICING (se lee de DB) ─────────────────────────────────────────────────

export interface AIPricing {
  provider: AIProvider
  model: AIModel
  inputCostPer1MTokens: number   // en USD
  outputCostPer1MTokens: number
  updatedAt: string
}

// ── LÍMITES POR PLAN ───────────────────────────────────────────────────────

export interface PlanAIAllowance {
  plan: 'trial' | 'solo' | 'pyme' | 'empresa'
  monthlyAllowanceUSD: number    // Incluido en el plan
  overageRateMultiplier: number  // ej: 1.5 = cobrar al 150% del costo real
  hardLimit: boolean             // Si true: bloquear. Si false: cobrar overage.
  hardLimitUSD: number           // Solo si hardLimit = false
}
```

---

## 3. Migraciones de Base de Datos para AI

### Migración 06: Tabla de Precios de AI

```sql
-- 06_create_ai_pricing.sql

create table public.ai_pricing (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null,
  model         text not null,
  input_cost_per_1m_tokens   numeric(10,6) not null,
  output_cost_per_1m_tokens  numeric(10,6) not null,
  is_active     boolean default true,
  updated_at    timestamptz default now(),

  unique(provider, model)
);

-- Datos iniciales — actualizar cuando cambien los precios
insert into public.ai_pricing
  (provider, model, input_cost_per_1m_tokens, output_cost_per_1m_tokens)
values
  ('anthropic', 'claude-haiku-4-5',    0.800000,  4.000000),
  ('anthropic', 'claude-sonnet-4-5',   3.000000, 15.000000),
  ('openai',    'gpt-4o-mini',         0.150000,  0.600000),
  ('openai',    'gpt-4o',              2.500000, 10.000000),
  ('google',    'gemini-1.5-flash',    0.075000,  0.300000),
  ('google',    'gemini-1.5-pro',      1.250000,  5.000000),
  ('deepseek',  'deepseek-chat',       0.140000,  0.280000);

-- RLS: solo service role puede modificar
alter table public.ai_pricing enable row level security;

create policy "Public can read pricing"
  on public.ai_pricing for select
  using (true);
```

---

### Migración 07: Tabla de Uso de AI

```sql
-- 07_create_ai_usage.sql

create table public.ai_usage (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,

  provider        text not null,
  model           text not null,
  task            text not null,

  input_tokens    integer not null default 0,
  output_tokens   integer not null default 0,
  cost_usd        numeric(10,6) not null default 0,

  month           text not null,     -- "2026-07" para agrupar por mes
  metadata        jsonb default '{}',

  created_at      timestamptz default now()
);

-- Índices para queries de resumen mensual
create index ai_usage_business_month_idx
  on public.ai_usage(business_id, month);

create index ai_usage_provider_idx
  on public.ai_usage(provider);

-- RLS
alter table public.ai_usage enable row level security;

create policy "Users can view own AI usage"
  on public.ai_usage for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = ai_usage.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Service role can insert usage"
  on public.ai_usage for insert
  with check (true);
```

---

### Migración 08: Tabla de Límites por Plan y Overage

```sql
-- 08_create_plan_ai_allowances.sql

create table public.plan_ai_allowances (
  plan                      text primary key,
  monthly_allowance_usd     numeric(8,2) not null,
  overage_rate_multiplier   numeric(4,2) not null default 1.5,
  hard_limit                boolean not null default false,
  hard_limit_usd            numeric(8,2),
  updated_at                timestamptz default now()
);

insert into public.plan_ai_allowances
  (plan, monthly_allowance_usd, overage_rate_multiplier, hard_limit, hard_limit_usd)
values
  ('trial',   1.00,  2.0,  true,  1.50),   -- Trial: $1 incluido, bloquear al límite
  ('solo',    3.00,  1.5,  false, 15.00),  -- Solo: $3 incluido, overage hasta $15
  ('pyme',    8.00,  1.5,  false, 40.00),  -- Pyme: $8 incluido, overage hasta $40
  ('empresa', 25.00, 1.3,  false, 150.00); -- Empresa: $25 incluido, overage hasta $150

alter table public.plan_ai_allowances enable row level security;

create policy "Public can read plan allowances"
  on public.plan_ai_allowances for select
  using (true);
```

---

### Migración 09: Tabla de Overage de AI

```sql
-- 09_create_ai_overage.sql

create table public.ai_overage (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,

  month           text not null,
  base_cost_usd   numeric(10,6) not null,
  charge_usd      numeric(10,6) not null,   -- Lo que se cobra (con multiplicador)
  charged_at      timestamptz,
  charge_status   text check (charge_status in ('pending', 'charged', 'failed', 'waived'))
                  default 'pending',

  stripe_charge_id     text,
  mercadopago_charge_id text,

  created_at      timestamptz default now(),

  unique(business_id, month)
);

alter table public.ai_overage enable row level security;

create policy "Users can view own overage"
  on public.ai_overage for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = ai_overage.business_id
      and businesses.user_id = auth.uid()
    )
  );
```

---

### Migración 10: Tabla de Drafts del Wizard

```sql
-- 10_create_wizard_drafts.sql

create table public.wizard_drafts (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  draft         jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now(),

  unique (business_id)
);

create index wizard_drafts_updated_at_idx
  on public.wizard_drafts(updated_at desc);

alter table public.wizard_drafts enable row level security;

create policy "Users can view own wizard draft"
  on public.wizard_drafts for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = wizard_drafts.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Service role can upsert wizard drafts"
  on public.wizard_drafts for insert
  with check (true);

create policy "Service role can update wizard drafts"
  on public.wizard_drafts for update
  using (true)
  with check (true);
```

---

## 4. El Cliente Unificado de AI

### `lib/ai/client.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, AIModel, AITask, AIResponse, AITaskConfig } from '@/types/ai.types'
import { AI_TASK_ROUTING } from '@/config/ai.config'
import { trackAIUsage, checkUsageLimit } from './usage'

// ── CLIENTES DE CADA PROVEEDOR ─────────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// DeepSeek usa la misma interfaz que OpenAI
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com/v1',
})

// ── FUNCIÓN PRINCIPAL ──────────────────────────────────────────────────────

/**
 * Genera contenido usando el proveedor correcto según la tarea.
 * Rastrea el uso y verifica límites antes de ejecutar.
 */
export async function generateWithAI(params: {
  task: AITask
  systemPrompt: string
  userPrompt: string
  businessId: string
  metadata?: Record<string, unknown>
}): Promise<AIResponse<string>> {
  const { task, systemPrompt, userPrompt, businessId, metadata = {} } = params

  // 1. Obtener la configuración de routing para esta tarea
  const baseConfig = AI_TASK_ROUTING[task]
  const config = process.env.AI_DEV_MODE === 'true'
    ? {
        ...baseConfig,
        provider: (process.env.AI_DEV_PROVIDER as AIProvider | undefined) ?? baseConfig.provider,
        model: (process.env.AI_DEV_MODEL as AIModel | undefined) ?? baseConfig.model,
      }
    : baseConfig
  if (!config) throw new Error(`No AI config found for task: ${task}`)

  // 2. Verificar si el negocio puede hacer esta llamada (límite de plan)
  const limitCheck = await checkUsageLimit(businessId)
  if (!limitCheck.canProceed) {
    throw new Error(
      `AI usage limit reached. Current: $${limitCheck.currentCostUSD.toFixed(4)} / ` +
      `Limit: $${limitCheck.limitUSD.toFixed(2)}. ` +
      limitCheck.message
    )
  }

  // 3. Ejecutar la llamada al proveedor correspondiente
  let response: AIResponse<string>

  switch (config.provider) {
    case 'anthropic':
      response = await callAnthropic({ config, systemPrompt, userPrompt, task })
      break
    case 'openai':
      response = await callOpenAI({ config, systemPrompt, userPrompt, task })
      break
    case 'google':
      response = await callGemini({ config, systemPrompt, userPrompt, task })
      break
    case 'deepseek':
      response = await callDeepSeek({ config, systemPrompt, userPrompt, task })
      break
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`)
  }

  // 4. Registrar el uso en Supabase
  await trackAIUsage({
    businessId,
    provider: response.provider,
    model: response.model,
    task,
    inputTokens: response.usage.inputTokens,
    outputTokens: response.usage.outputTokens,
    costUSD: response.usage.costUSD,
    metadata,
  })

  return response
}

// ── LLAMADAS POR PROVEEDOR ─────────────────────────────────────────────────

async function callAnthropic(params: {
  config: AITaskConfig
  systemPrompt: string
  userPrompt: string
  task: AITask
}): Promise<AIResponse<string>> {
  const { config, systemPrompt, userPrompt, task } = params

  const pricing = await getModelPricing('anthropic', config.model)

  const response = await anthropic.messages.create({
    model: config.model,
    max_tokens: config.maxOutputTokens,
    temperature: config.temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const inputTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens
  const costUSD = calculateCost(inputTokens, outputTokens, pricing)

  return {
    content: response.content[0].type === 'text' ? response.content[0].text : '',
    usage: { inputTokens, outputTokens, costUSD },
    provider: 'anthropic',
    model: config.model,
    task,
  }
}

async function callOpenAI(params: {
  config: AITaskConfig
  systemPrompt: string
  userPrompt: string
  task: AITask
}): Promise<AIResponse<string>> {
  const { config, systemPrompt, userPrompt, task } = params

  const pricing = await getModelPricing('openai', config.model)

  const response = await openai.chat.completions.create({
    model: config.model,
    max_tokens: config.maxOutputTokens,
    temperature: config.temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const inputTokens = response.usage?.prompt_tokens ?? 0
  const outputTokens = response.usage?.completion_tokens ?? 0
  const costUSD = calculateCost(inputTokens, outputTokens, pricing)

  return {
    content: response.choices[0]?.message?.content ?? '',
    usage: { inputTokens, outputTokens, costUSD },
    provider: 'openai',
    model: config.model,
    task,
  }
}

async function callGemini(params: {
  config: AITaskConfig
  systemPrompt: string
  userPrompt: string
  task: AITask
}): Promise<AIResponse<string>> {
  const { config, systemPrompt, userPrompt, task } = params

  const pricing = await getModelPricing('google', config.model)

  const model = google.getGenerativeModel({
    model: config.model,
    systemInstruction: systemPrompt,
  })

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      maxOutputTokens: config.maxOutputTokens,
      temperature: config.temperature,
    },
  })

  const response = result.response
  const inputTokens = response.usageMetadata?.promptTokenCount ?? 0
  const outputTokens = response.usageMetadata?.candidatesTokenCount ?? 0
  const costUSD = calculateCost(inputTokens, outputTokens, pricing)

  return {
    content: response.text(),
    usage: { inputTokens, outputTokens, costUSD },
    provider: 'google',
    model: config.model,
    task,
  }
}

async function callDeepSeek(params: {
  config: AITaskConfig
  systemPrompt: string
  userPrompt: string
  task: AITask
}): Promise<AIResponse<string>> {
  const { config, systemPrompt, userPrompt, task } = params

  const pricing = await getModelPricing('deepseek', config.model)

  // DeepSeek usa la misma API que OpenAI
  const response = await deepseek.chat.completions.create({
    model: config.model,
    max_tokens: config.maxOutputTokens,
    temperature: config.temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const inputTokens = response.usage?.prompt_tokens ?? 0
  const outputTokens = response.usage?.completion_tokens ?? 0
  const costUSD = calculateCost(inputTokens, outputTokens, pricing)

  return {
    content: response.choices[0]?.message?.content ?? '',
    usage: { inputTokens, outputTokens, costUSD },
    provider: 'deepseek',
    model: config.model,
    task,
  }
}

// ── HELPERS ────────────────────────────────────────────────────────────────

function calculateCost(
  inputTokens: number,
  outputTokens: number,
  pricing: { inputCostPer1MTokens: number; outputCostPer1MTokens: number }
): number {
  const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1MTokens
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1MTokens
  return inputCost + outputCost
}

// Obtiene el pricing desde Supabase (con cache de 1 hora en producción)
// Por simplicidad en desarrollo, usar los valores del config
async function getModelPricing(provider: AIProvider, model: AIModel) {
  // TODO: Fetch from Supabase ai_pricing table with in-memory cache
  // Por ahora usar valores hardcoded del AI_TASK_ROUTING config
  const config = Object.values(AI_TASK_ROUTING).find(
    c => c.provider === provider && c.model === model
  )
  // Fallback pricing si no se encuentra
  return {
    inputCostPer1MTokens: 1.0,
    outputCostPer1MTokens: 4.0,
  }
}
```

---

### `lib/ai/usage.ts`

```typescript
import { createServiceClient } from '@/lib/supabase/service'
import type { AIProvider, AIModel, AITask } from '@/types/ai.types'

/**
 * Registra el uso de AI en Supabase
 */
export async function trackAIUsage(params: {
  businessId: string
  provider: AIProvider
  model: AIModel
  task: AITask
  inputTokens: number
  outputTokens: number
  costUSD: number
  metadata?: Record<string, unknown>
}) {
  const supabase = createServiceClient()
  const month = new Date().toISOString().substring(0, 7) // "2026-07"

  const { error } = await supabase
    .from('ai_usage')
    .insert({
      business_id: params.businessId,
      provider: params.provider,
      model: params.model,
      task: params.task,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      cost_usd: params.costUSD,
      month,
      metadata: params.metadata ?? {},
    })

  if (error) {
    // No lanzar error — el tracking no debe bloquear la generación
    console.error('Failed to track AI usage:', error)
  }
}

/**
 * Verifica si el negocio puede hacer otra llamada a AI este mes
 */
export async function checkUsageLimit(businessId: string): Promise<{
  canProceed: boolean
  currentCostUSD: number
  limitUSD: number
  isOverage: boolean
  message: string
}> {
  const supabase = createServiceClient()
  const month = new Date().toISOString().substring(0, 7)

  // 1. Obtener el plan del negocio
  const { data: business } = await supabase
    .from('businesses')
    .select('plan')
    .eq('id', businessId)
    .single()

  const plan = business?.plan ?? 'trial'

  // 2. Obtener el límite del plan
  const { data: allowance } = await supabase
    .from('plan_ai_allowances')
    .select('*')
    .eq('plan', plan)
    .single()

  if (!allowance) {
    return { canProceed: true, currentCostUSD: 0, limitUSD: 999, isOverage: false, message: '' }
  }

  // 3. Calcular el gasto del mes actual
  const { data: usage } = await supabase
    .from('ai_usage')
    .select('cost_usd')
    .eq('business_id', businessId)
    .eq('month', month)

  const currentCostUSD = usage?.reduce((sum, row) => sum + Number(row.cost_usd), 0) ?? 0

  // 4. Evaluar si puede continuar
  const monthlyAllowance = Number(allowance.monthly_allowance_usd)
  const hardLimitUSD = Number(allowance.hard_limit_usd ?? 9999)

  if (currentCostUSD < monthlyAllowance) {
    // Dentro del plan — sin costo adicional
    return {
      canProceed: true,
      currentCostUSD,
      limitUSD: monthlyAllowance,
      isOverage: false,
      message: 'Within plan allowance',
    }
  }

  if (!allowance.hard_limit && currentCostUSD < hardLimitUSD) {
    // En zona de overage pero no alcanzó el hard limit
    return {
      canProceed: true,
      currentCostUSD,
      limitUSD: hardLimitUSD,
      isOverage: true,
      message: `Overage mode: additional usage will be charged at ${allowance.overage_rate_multiplier}x rate`,
    }
  }

  // Alcanzó el límite máximo
  return {
    canProceed: false,
    currentCostUSD,
    limitUSD: hardLimitUSD,
    isOverage: true,
    message: `Monthly AI limit reached ($${hardLimitUSD}). Please upgrade your plan or wait until next month.`,
  }
}

/**
 * Obtiene el resumen de uso del mes para el dashboard
 */
export async function getMonthlyUsageSummary(businessId: string, month?: string) {
  const supabase = createServiceClient()
  const targetMonth = month ?? new Date().toISOString().substring(0, 7)

  const { data: usage } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('business_id', businessId)
    .eq('month', targetMonth)

  if (!usage || usage.length === 0) {
    return { totalCostUSD: 0, byProvider: {}, byTask: {}, calls: 0 }
  }

  const summary = usage.reduce((acc, row) => {
    acc.totalCostUSD += Number(row.cost_usd)
    acc.calls += 1

    if (!acc.byProvider[row.provider]) {
      acc.byProvider[row.provider] = { totalCostUSD: 0, calls: 0, totalTokens: 0 }
    }
    acc.byProvider[row.provider].totalCostUSD += Number(row.cost_usd)
    acc.byProvider[row.provider].calls += 1
    acc.byProvider[row.provider].totalTokens += row.input_tokens + row.output_tokens

    if (!acc.byTask[row.task]) acc.byTask[row.task] = 0
    acc.byTask[row.task] += Number(row.cost_usd)

    return acc
  }, {
    totalCostUSD: 0,
    calls: 0,
    byProvider: {} as Record<string, { totalCostUSD: number; calls: number; totalTokens: number }>,
    byTask: {} as Record<string, number>,
  })

  return summary
}
```

---

### `config/ai.config.ts`

```typescript
import type { AITask, AITaskConfig } from '@/types/ai.types'

/**
 * Routing de tareas a proveedores.
 * Cambiar el proveedor aquí cambia el proveedor para todos los lugares
 * donde se usa esa tarea — sin tocar otro código.
 */
export const AI_TASK_ROUTING: Record<AITask, AITaskConfig> = {
  scrape_analysis: {
    task: 'scrape_analysis',
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
    maxInputTokens: 8000,
    maxOutputTokens: 2000,
    temperature: 0.1,
    description: 'Analiza contenido scrapeado y extrae campos del wizard',
  },
  wizard_prefill: {
    task: 'wizard_prefill',
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
    maxInputTokens: 6000,
    maxOutputTokens: 1500,
    temperature: 0.1,
    description: 'Pre-llena el wizard con datos extraídos del sitio',
  },
  icp_generation: {
    task: 'icp_generation',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    maxInputTokens: 4000,
    maxOutputTokens: 3000,
    temperature: 0.3,
    description: 'Genera el ICP Card completo — máxima calidad',
  },
  icp_score: {
    task: 'icp_score',
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
    maxInputTokens: 3000,
    maxOutputTokens: 800,
    temperature: 0.0,
    description: 'Calcula el ICP Quality Score',
  },
  bot_prompt: {
    task: 'bot_prompt',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    maxInputTokens: 4000,
    maxOutputTokens: 2500,
    temperature: 0.2,
    description: 'Genera el prompt completo del bot de WhatsApp',
  },
  pitch_deck: {
    task: 'pitch_deck',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    maxInputTokens: 3000,
    maxOutputTokens: 3500,
    temperature: 0.4,
    description: 'Genera el pitch deck completo de 10 slides',
  },
  proposal: {
    task: 'proposal',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    maxInputTokens: 3000,
    maxOutputTokens: 4000,
    temperature: 0.3,
    description: 'Genera la propuesta comercial completa',
  },
  one_pager: {
    task: 'one_pager',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxInputTokens: 2000,
    maxOutputTokens: 800,
    temperature: 0.4,
    description: 'Genera el one-pager',
  },
  call_script: {
    task: 'call_script',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxInputTokens: 2500,
    maxOutputTokens: 2000,
    temperature: 0.3,
    description: 'Genera scripts de llamada y manejo de objeciones',
  },
  email_cold: {
    task: 'email_cold',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxInputTokens: 2000,
    maxOutputTokens: 2000,
    temperature: 0.5,
    description: 'Genera secuencia de emails fríos (5 toques)',
  },
  email_nurture: {
    task: 'email_nurture',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxInputTokens: 2000,
    maxOutputTokens: 2000,
    temperature: 0.5,
    description: 'Genera secuencia de emails de nurture (4 emails)',
  },
  email_reactivation: {
    task: 'email_reactivation',
    provider: 'deepseek',
    model: 'deepseek-chat',
    maxInputTokens: 2000,
    maxOutputTokens: 1500,
    temperature: 0.5,
    description: 'Genera secuencia de reactivación de leads inactivos',
  },
  email_winback: {
    task: 'email_winback',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxInputTokens: 2000,
    maxOutputTokens: 1500,
    temperature: 0.5,
    description: 'Genera secuencia win-back para clientes que se fueron',
  },
  email_client: {
    task: 'email_client',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxInputTokens: 2000,
    maxOutputTokens: 2000,
    temperature: 0.4,
    description: 'Genera emails para clientes activos (onboarding, retención, upsell)',
  },
  linkedin_messages: {
    task: 'linkedin_messages',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxInputTokens: 1500,
    maxOutputTokens: 1000,
    temperature: 0.5,
    description: 'Genera mensajes de LinkedIn (conexión + seguimiento)',
  },
  whatsapp_messages: {
    task: 'whatsapp_messages',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxInputTokens: 1500,
    maxOutputTokens: 800,
    temperature: 0.5,
    description: 'Genera mensajes de WhatsApp outbound',
  },
  posts_monthly: {
    task: 'posts_monthly',
    provider: 'google',
    model: 'gemini-1.5-flash',
    maxInputTokens: 3000,
    maxOutputTokens: 6000,
    temperature: 0.7,
    description: 'Genera el calendario completo de 30 posts mensuales',
  },
  post_single: {
    task: 'post_single',
    provider: 'google',
    model: 'gemini-1.5-flash',
    maxInputTokens: 2000,
    maxOutputTokens: 600,
    temperature: 0.7,
    description: 'Genera un post individual para redes sociales',
  },
  ads_copy: {
    task: 'ads_copy',
    provider: 'google',
    model: 'gemini-1.5-flash',
    maxInputTokens: 2000,
    maxOutputTokens: 1200,
    temperature: 0.6,
    description: 'Genera copy para anuncios (3 variantes por ad set)',
  },
  newsletter: {
    task: 'newsletter',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxInputTokens: 2000,
    maxOutputTokens: 1500,
    temperature: 0.5,
    description: 'Genera el newsletter mensual',
  },
  social_reel_script: {
    task: 'social_reel_script',
    provider: 'google',
    model: 'gemini-1.5-flash',
    maxInputTokens: 1500,
    maxOutputTokens: 500,
    temperature: 0.7,
    description: 'Genera guión de reel de 30-60 segundos',
  },
}
```

---

## 5. Configuración del Wizard

### `config/wizard.config.ts`

```typescript
import type { ICPType } from '@/types/wizard.types'

// ── INTERFACES DE CONFIG ───────────────────────────────────────────────────

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio_cards'     // Tarjetas seleccionables (como el selector B2B/B2C)
  | 'channel_picker'  // Selector especial de canales con nivel de actividad
  | 'flow_picker'     // Selector de flujos del funnel
  | 'range_select'    // Selector de rango (ciclo de venta, tamaño de empresa)

export interface QuestionOption {
  value: string
  label: string
  description?: string
  icon?: string
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'minWords' | 'noGenericWords' | 'custom'
  value?: number | string[]
  message: string
  // noGenericWords: rechaza respuestas con palabras como "bueno", "calidad", "servicio"
  // minWords: mínimo de palabras para considerar la respuesta suficiente
}

export interface WizardQuestion {
  id: string
  step: 1 | 2 | 3 | 4 | 5
  block: 'A' | 'B_b2b' | 'B_b2c' | 'B_common' | 'C' | 'D' | 'E'
  type: QuestionType
  label: string                    // Texto de la pregunta (versión B2B/genérica)
  labelB2C?: string                // Versión B2C si es diferente
  labelFreelancer?: string         // Versión para PF/solopreneur
  placeholder?: string
  helperText?: string              // Texto de ayuda debajo del campo
  options?: QuestionOption[]       // Para select, multiselect, radio_cards
  validation: ValidationRule[]
  icpLayer: 'situational' | 'descriptive' | 'psychographic' | 'behavioral' | 'economic'
  systemOutput: string             // Qué activa en el sistema (para la UI)
  followUpProbe?: string           // Si la respuesta es vaga, mostrar esta sonda
  prefillKey?: string              // Clave del objeto de prefill del scraping
  showOnlyFor?: ICPType[]          // Si existe, solo mostrar para estos tipos de ICP
  icpScoreWeight?: number          // Peso en el ICP Quality Score (0–25)
}

// ── PALABRAS GENÉRICAS PROHIBIDAS ─────────────────────────────────────────

export const GENERIC_WORDS = [
  'calidad', 'excelencia', 'innovación', 'innovador', 'integral', 'personalizado',
  'comprometidos', 'dedicados', 'expertos', 'líderes', 'mejor', 'superior',
  'único', 'solución', 'servicio', 'mundo', 'clase mundial', 'a tu medida',
]

// ── LAS 14 PREGUNTAS DEL WIZARD ───────────────────────────────────────────

export const WIZARD_QUESTIONS: WizardQuestion[] = [

  // ═══ PASO 2 — EL NEGOCIO ═══════════════════════════════════════════════

  {
    id: 'one_liner',
    step: 2,
    block: 'A',
    type: 'textarea',
    label: '¿Qué hace tu empresa en una sola oración?',
    labelB2C: '¿A qué te dedicas y qué ofreces?',
    placeholder: 'Ejemplo: Ayudamos a clínicas dentales en CDMX a llenar su agenda con pacientes calificados usando un sistema automatizado de seguimiento por WhatsApp.',
    helperText: 'Incluye: ¿A quién ayudas? ¿Con qué resultado? ¿Cómo?',
    validation: [
      { type: 'required', message: 'Esta descripción es necesaria para generar todos tus materiales.' },
      { type: 'minWords', value: 10, message: 'Necesitamos al menos 10 palabras para una descripción útil.' },
      { type: 'noGenericWords', value: GENERIC_WORDS, message: 'Evita palabras genéricas. Sé más específico sobre a quién ayudas y qué resultado obtienes.' },
    ],
    icpLayer: 'descriptive',
    systemOutput: 'Pitch de 30 segundos · Bio de perfil · Primera frase del bot · Headline del pitch deck',
    followUpProbe: 'Intenta completar: "Ayudamos a [QUIÉN ESPECÍFICO] a [RESULTADO MEDIBLE] mediante [CÓMO]."',
    prefillKey: 'oneLiner',
    icpScoreWeight: 0,
  },

  {
    id: 'industry',
    step: 2,
    block: 'A',
    type: 'select',
    label: '¿En qué industria o sector opera tu negocio?',
    options: [
      { value: 'salud_odontologia', label: 'Salud — Odontología' },
      { value: 'salud_medicina', label: 'Salud — Medicina General / Especialidades' },
      { value: 'salud_bienestar', label: 'Salud — Bienestar, Nutrición, Fitness' },
      { value: 'inmobiliaria', label: 'Inmobiliaria y Construcción' },
      { value: 'educacion', label: 'Educación y Capacitación' },
      { value: 'legal', label: 'Legal — Despachos Jurídicos' },
      { value: 'financiero', label: 'Financiero — Seguros, Inversiones, Crédito' },
      { value: 'consultoria', label: 'Consultoría y Servicios Profesionales' },
      { value: 'tecnologia', label: 'Tecnología y Software' },
      { value: 'restaurantes', label: 'Restaurantes y Alimentos' },
      { value: 'retail', label: 'Retail y Comercio' },
      { value: 'manufactura', label: 'Manufactura e Industria' },
      { value: 'marketing_agencia', label: 'Marketing y Agencias Digitales' },
      { value: 'ecommerce', label: 'E-commerce y Ventas en Línea' },
      { value: 'otro', label: 'Otro (especificar)' },
    ],
    validation: [
      { type: 'required', message: 'Selecciona la industria de tu negocio.' },
    ],
    icpLayer: 'descriptive',
    systemOutput: 'Activa el Snapshot de GHL para tu industria · Vocabulario del copy',
    prefillKey: 'industry',
    icpScoreWeight: 0,
  },

  {
    id: 'icp_type',
    step: 2,
    block: 'A',
    type: 'radio_cards',
    label: '¿A quién le vendes principalmente?',
    options: [
      {
        value: 'b2b',
        label: 'Empresas (B2B)',
        description: 'Vendes a negocios, equipos o tomadores de decisión en empresas',
        icon: '🏢',
      },
      {
        value: 'b2c',
        label: 'Personas (B2C)',
        description: 'Vendes directamente a consumidores o personas individuales',
        icon: '👤',
      },
      {
        value: 'mixed',
        label: 'Ambos',
        description: 'Vendes tanto a empresas como a personas — ICP mixto',
        icon: '🔀',
      },
      {
        value: 'freelancer',
        label: 'Profesional / Solopreneur',
        description: 'Tu cliente es un profesional independiente o dueño de negocio unipersonal',
        icon: '🧑‍💼',
      },
    ],
    validation: [
      { type: 'required', message: 'Selecciona a quién le vendes.' },
    ],
    icpLayer: 'descriptive',
    systemOutput: 'Define el flujo de preguntas del Paso 3 (B2B o B2C)',
    icpScoreWeight: 0,
  },

  // ═══ PASO 3 B2B ═════════════════════════════════════════════════════════

  {
    id: 'decision_maker_b2b',
    step: 3,
    block: 'B_b2b',
    type: 'text',
    label: '¿Quién toma la decisión de comprarte? ¿Cuál es su cargo o rol exacto?',
    placeholder: 'Ej: Director Comercial, Dueño del negocio, Gerente de Marketing',
    helperText: 'Piensa en tus últimos 5 clientes — ¿quién firmó o autorizó el pago?',
    validation: [
      { type: 'required', message: 'Necesitamos el cargo del decisor para calibrar el tono de todos los materiales.' },
      { type: 'minLength', value: 3, message: 'Por favor especifica el cargo.' },
    ],
    icpLayer: 'descriptive',
    systemOutput: 'Tono del copy (ejecutivo/operativo) · Targeting de LinkedIn Ads · Preguntas de calificación del bot',
    followUpProbe: 'De tus últimos 5 clientes, ¿cuál fue el cargo exacto de quien autorizó el pago? Usa eso.',
    showOnlyFor: ['b2b', 'mixed'],
    icpScoreWeight: 0,
  },

  {
    id: 'company_size_b2b',
    step: 3,
    block: 'B_b2b',
    type: 'range_select',
    label: '¿Qué tan grande es la empresa cliente ideal?',
    options: [
      { value: '1-5', label: '1–5 empleados', description: 'Microempresa / solopreneur' },
      { value: '6-20', label: '6–20 empleados', description: 'Empresa pequeña' },
      { value: '21-50', label: '21–50 empleados', description: 'Empresa mediana pequeña' },
      { value: '51-200', label: '51–200 empleados', description: 'Empresa mediana' },
      { value: '201-500', label: '201–500 empleados', description: 'Empresa grande' },
      { value: '500+', label: '500+ empleados', description: 'Corporativo' },
    ],
    validation: [
      { type: 'required', message: 'Selecciona el tamaño de empresa.' },
    ],
    icpLayer: 'descriptive',
    systemOutput: 'Segmentación de base de datos · Targeting de ads por tamaño de empresa',
    showOnlyFor: ['b2b', 'mixed'],
    icpScoreWeight: 0,
  },

  // ═══ PASO 3 B2C ═════════════════════════════════════════════════════════

  {
    id: 'client_profile_b2c',
    step: 3,
    block: 'B_b2c',
    type: 'textarea',
    label: '¿Quién es tu cliente ideal? Descríbelo en términos de edad, situación de vida y perfil general.',
    labelFreelancer: '¿Cuál es el perfil del profesional o emprendedor que más se beneficia de lo que ofreces?',
    placeholder: 'Ej: Mujer de 35–50 años, dueña de negocio propio con 1–5 años, ingresos familiares de $50K–$150K MXN/mes, ubicada en CDMX o MTY.',
    validation: [
      { type: 'required', message: 'Necesitamos el perfil del cliente para personalizar todos los materiales.' },
      { type: 'minWords', value: 12, message: 'Describe con más detalle — incluye edad, situación y contexto.' },
    ],
    icpLayer: 'descriptive',
    systemOutput: 'Tono del copy · Targeting de Meta Ads · Segmentación de base de datos',
    followUpProbe: 'Piensa en tu mejor cliente de los últimos 6 meses. Descríbelo: ¿cuántos años tiene, qué hace, cómo es su vida?',
    showOnlyFor: ['b2c', 'freelancer', 'mixed'],
    icpScoreWeight: 0,
  },

  // ═══ PREGUNTAS COMUNES PASO 3 ═══════════════════════════════════════════

  {
    id: 'main_pain',
    step: 3,
    block: 'B_common',
    type: 'textarea',
    label: '¿Cuál es el problema más urgente o frustrante que tiene tu cliente ideal — el que te busca para resolver?',
    labelB2C: '¿Qué dolor, deseo o necesidad tiene tu cliente que lo llevaría a buscarte activamente?',
    placeholder: 'Ej: Su agenda tiene huecos constantes, los pacientes que agendan no siempre llegan, y no tienen ningún proceso proactivo para recordarles o recuperar a los que se fueron.',
    helperText: '⚡ Escríbelo como tu cliente lo diría — con sus palabras, no con vocabulario técnico de tu industria.',
    validation: [
      { type: 'required', message: 'El dolor es la base de todos tus materiales de comunicación.' },
      { type: 'minWords', value: 15, message: 'Necesitamos más detalle para generar copy que conecte. Describe las consecuencias específicas.' },
      { type: 'noGenericWords', value: GENERIC_WORDS, message: 'El dolor está muy genérico. ¿Qué pasa específicamente en el día a día del cliente?' },
    ],
    icpLayer: 'situational',
    systemOutput: 'Hook de todos los materiales · Subject lines de email · Primera línea del bot · Slide del problema en el pitch deck',
    followUpProbe: '¿Cómo lo describiría tu cliente cuando habla del problema con un amigo o colega? Usa esas palabras exactas.',
    prefillKey: 'mainPain',
    icpScoreWeight: 25,   // 25% del ICP Score
  },

  {
    id: 'cost_of_inaction',
    step: 3,
    block: 'B_common',
    type: 'textarea',
    label: '¿Qué pasa si tu cliente NO resuelve este problema en los próximos 6 meses? ¿Qué pierde concretamente?',
    placeholder: 'Ej: Siguen pagando renta y nómina con agenda al 60%. Cada mes sin sistema de recuperación pierden entre $30,000 y $80,000 MXN en ingresos que ya deberían tener.',
    helperText: 'Incluye números si puedes — dinero perdido, tiempo desperdiciado, posición competitiva afectada.',
    validation: [
      { type: 'required', message: 'El costo de inacción es el argumento de urgencia más poderoso.' },
      { type: 'minWords', value: 10, message: 'Necesitamos más detalle sobre las consecuencias concretas.' },
    ],
    icpLayer: 'psychographic',
    systemOutput: 'Agitación del dolor en secuencias · Slide de ROI en pitch deck · Argumentos de urgencia en el cierre',
    followUpProbe: 'En términos de dinero: ¿cuánto le cuesta a tu cliente cada mes que no resuelve esto? Da un rango conservador.',
    icpScoreWeight: 0,
  },

  {
    id: 'main_outcome',
    step: 3,
    block: 'B_common',
    type: 'textarea',
    label: '¿Qué resultado concreto y medible obtiene tu cliente cuando trabaja contigo?',
    placeholder: 'Ej: En las primeras 4 semanas la agenda llega al 85%+ con pacientes calificados. El costo por paciente nuevo baja de $800 MXN a menos de $200 MXN.',
    helperText: 'Incluye: ¿Qué resultado? ¿Cuánto? ¿En qué tiempo?',
    validation: [
      { type: 'required', message: 'La promesa de resultado es el elemento más repetido en todos tus materiales.' },
      { type: 'minWords', value: 10, message: 'Necesitamos una promesa con métrica y tiempo. Sé específico.' },
    ],
    icpLayer: 'behavioral',
    systemOutput: 'La promesa central del pitch deck · CTA de todos los materiales · La Godfather Offer · Headline del perfil',
    followUpProbe: '¿Cuál es el resultado más conservador que puedes garantizar? Empieza con ese número.',
    prefillKey: 'mainOutcome',
    icpScoreWeight: 25,   // 25% del ICP Score
  },

  // ═══ PASO 4 — PROCESO Y DIFERENCIACIÓN ══════════════════════════════════

  {
    id: 'sales_cycle',
    step: 4,
    block: 'C',
    type: 'radio_cards',
    label: '¿Cuánto tiempo pasa normalmente desde el primer contacto hasta que alguien compra?',
    options: [
      { value: 'same_day', label: 'El mismo día', description: 'Decisión inmediata' },
      { value: '1-7_days', label: '1–7 días', description: 'Ciclo corto' },
      { value: '1-4_weeks', label: '1–4 semanas', description: 'Ciclo medio' },
      { value: '1-3_months', label: '1–3 meses', description: 'Ciclo largo' },
      { value: '3+_months', label: 'Más de 3 meses', description: 'Ciclo muy largo' },
    ],
    validation: [
      { type: 'required', message: 'El ciclo de venta define el timing de todas las secuencias.' },
    ],
    icpLayer: 'behavioral',
    systemOutput: 'Número de toques en secuencias · Timing del bot · Cuándo activar flujo "lead que no avanza"',
    icpScoreWeight: 0,
  },

  {
    id: 'top_objection',
    step: 4,
    block: 'C',
    type: 'textarea',
    label: '¿Cuál es la objeción más común que escuchas antes de que alguien compre? ¿Cómo la resuelves cuando funciona?',
    placeholder: 'Ej: "Es caro." Lo resolvemos mostrando el costo de la silla vacía — si tiene 8 huecos por semana a $2,500 cada uno, deja $80,000 al mes en la mesa. Frente a eso nuestro costo es evidente.',
    validation: [
      { type: 'required', message: 'La objeción y su resolución alimentan el bot y los scripts de cierre.' },
      { type: 'minWords', value: 15, message: 'Incluye cómo la resuelves — esa es la parte más valiosa.' },
    ],
    icpLayer: 'psychographic',
    systemOutput: 'Scripts de objeciones del bot · Emails de cierre · Slide de objeciones en pitch · Scripts de llamada',
    followUpProbe: '¿Qué argumento concreto hace que el prospecto diga "tiene razón" y avance?',
    icpScoreWeight: 0,
  },

  {
    id: 'anti_icp',
    step: 4,
    block: 'C',
    type: 'textarea',
    label: '¿Qué perfil de cliente definitivamente NO quieres? ¿Y cuál parece bueno pero termina siendo problemático?',
    placeholder: 'No queremos: clínicas solo interesadas en el precio más bajo, doctores que no quieren delegar nada. Alto riesgo: clínicas que crecieron muy rápido y pueden superar nuestra capacidad.',
    helperText: 'El anti-ICP protege el tiempo del equipo. El "alto riesgo" se verifica con criterio adicional antes de aceptar.',
    validation: [
      { type: 'required', message: 'El anti-ICP activa el scoring negativo en el CRM.' },
    ],
    icpLayer: 'psychographic',
    systemOutput: 'Scoring negativo en CRM · Preguntas de calificación del bot · Criterios de prospección',
    icpScoreWeight: 0,
  },

  {
    id: 'unique_differentiator',
    step: 4,
    block: 'D',
    type: 'textarea',
    label: '¿Con quién te comparan tus prospectos? ¿Por qué te eligen a ti y qué es lo más difícil de copiar de lo que haces?',
    placeholder: 'Nos comparan con agencias genéricas de redes sociales. Nos eligen porque somos los únicos especializados en salud dental. Lo más difícil de copiar: nuestros flujos específicos para recuperar pacientes que no volvieron.',
    helperText: 'Combina: la razón por la que fallan las alternativas + lo que haces de manera diferente en el proceso.',
    validation: [
      { type: 'required', message: 'El diferenciador es el elemento más repetido en todos tus materiales.' },
      { type: 'minWords', value: 15, message: 'Necesitamos más detalle sobre qué hace diferente tu proceso — no tus resultados.' },
      { type: 'noGenericWords', value: GENERIC_WORDS, message: 'El diferenciador está muy genérico. ¿Qué haces de forma diferente en el proceso que produce resultados consistentes?' },
    ],
    icpLayer: 'psychographic',
    systemOutput: 'El Mecanismo Único en todos los materiales · Respuesta del bot a competidores · Slide de diferenciación',
    followUpProbe: '¿Qué puedes hacer tú que si el cliente se va a la competencia no puede obtener de forma idéntica?',
    prefillKey: 'differentiator',
    icpScoreWeight: 25,   // 25% del ICP Score
  },

  {
    id: 'economic_profile',
    step: 4,
    block: 'D',
    type: 'textarea',
    label: '¿Cuánto está acostumbrado a invertir tu cliente ideal en soluciones como la tuya? ¿El dinero sale de su bolsillo o de un presupuesto empresarial?',
    labelB2C: '¿Cuánto está dispuesto a invertir tu cliente ideal? ¿Es una decisión que toma solo o consulta con alguien?',
    placeholder: 'Ej: Invierten entre $5,000 y $15,000 MXN/mes en servicios externos. En clínicas medianas el dueño lo aprueba directamente. En las más grandes hay un presupuesto de operación.',
    validation: [
      { type: 'required', message: 'El perfil económico calibra el pricing y el tono de los argumentos de valor.' },
      { type: 'minWords', value: 10, message: 'Incluye el rango de inversión y quién aprueba.' },
    ],
    icpLayer: 'economic',
    systemOutput: 'Tono de argumentos de valor · Estructura de la propuesta · Respuesta del bot al preguntar por precio',
    icpScoreWeight: 0,
  },

  // ═══ PASO 5 — CANALES Y FLUJOS ═══════════════════════════════════════════

  {
    id: 'channels',
    step: 5,
    block: 'E',
    type: 'channel_picker',
    label: '¿En qué canales está tu cliente ideal? Selecciona y define el nivel de actividad.',
    validation: [
      { type: 'required', message: 'Selecciona al menos un canal.' },
    ],
    icpLayer: 'behavioral',
    systemOutput: 'Activa canales en GHL Social Planner · Formato de 30 posts mensuales · Configuración multicanal del bot',
    icpScoreWeight: 25,   // 25% del ICP Score
  },

  {
    id: 'funnel_flows',
    step: 5,
    block: 'E',
    type: 'flow_picker',
    label: '¿Cuáles de estos flujos de contacto existen en tu proceso de ventas?',
    helperText: 'Selecciona todos los que aplican. Puedes agregar flujos propios de tu negocio.',
    validation: [
      { type: 'required', message: 'Selecciona al menos 2 flujos para empezar.' },
    ],
    icpLayer: 'behavioral',
    systemOutput: 'Activa campañas específicas en GHL · Genera materiales por etapa · Configura workflows de seguimiento',
    icpScoreWeight: 0,
  },
]

// ── HELPERS DE CONFIG ──────────────────────────────────────────────────────

/** Obtiene las preguntas de un paso específico filtradas por tipo de ICP */
export function getStepQuestions(
  step: 1 | 2 | 3 | 4 | 5,
  icpType: ICPType | null
): WizardQuestion[] {
  return WIZARD_QUESTIONS.filter(q => {
    if (q.step !== step) return false
    if (q.block === 'B_common') return true
    if (!q.showOnlyFor) return true
    if (!icpType) return true
    return q.showOnlyFor.includes(icpType)
  })
}

/** Obtiene el texto correcto de la pregunta según el tipo de ICP */
export function getQuestionLabel(
  question: WizardQuestion,
  icpType: ICPType | null
): string {
  if (icpType === 'b2c' || icpType === 'freelancer') {
    return question.labelB2C ?? question.label
  }
  if (icpType === 'freelancer') {
    return question.labelFreelancer ?? question.labelB2C ?? question.label
  }
  return question.label
}
```

---

## 6. ICP Quality Score — Algoritmo

### `lib/utils/icp-score.ts`

```typescript
import type { WizardAnswers, ICPQualityScore } from '@/types/wizard.types'
import { GENERIC_WORDS } from '@/config/wizard.config'

/**
 * Calcula el ICP Quality Score localmente (sin AI) para feedback instantáneo.
 * El score de IA (más preciso) se calcula después en el servidor.
 */
export function calculateLocalICPScore(answers: WizardAnswers): ICPQualityScore {
  const step3 = answers.step3_b2b ?? answers.step3_b2c
  const step4 = answers.step4

  const scores = {
    painInClientWords: scorePain(step3?.mainPain ?? ''),
    measurablePromise: scorePromise(step3?.mainOutcome ?? ''),
    exclusiveDifferentiator: scoreDifferentiator(step4?.uniqueDifferentiator ?? ''),
    actionableTrigger: scoreTrigger(step4?.uniqueMechanism ?? '', step3?.mainPain ?? ''),
  }

  const total = Object.values(scores).reduce((sum, s) => sum + s, 0)

  const suggestions: string[] = []

  if (scores.painInClientWords < 20) {
    suggestions.push(
      'El dolor necesita estar en las palabras exactas de tu cliente — no en vocabulario técnico. ' +
      'Pregúntate: ¿cómo lo describiría cuando habla con un amigo?'
    )
  }

  if (scores.measurablePromise < 20) {
    suggestions.push(
      'La promesa necesita un número específico y un tiempo concreto. ' +
      'Ej: "20 citas nuevas en el primer mes" en lugar de "más citas".'
    )
  }

  if (scores.exclusiveDifferentiator < 20) {
    suggestions.push(
      'El diferenciador describe adjetivos, no un proceso. ' +
      '¿Qué haces específicamente diferente en el proceso que produce resultados consistentes?'
    )
  }

  if (scores.actionableTrigger < 20) {
    suggestions.push(
      'El detonador necesita ser un evento o circunstancia específica que puedas identificar ' +
      'en prospección: ¿qué pasa en el negocio del cliente justo antes de que empiece a buscar?'
    )
  }

  return {
    total,
    breakdown: scores,
    suggestions,
    canProceed: total >= 40,  // Mínimo para generar materiales
  }
}

// ── FUNCIONES DE SCORING ───────────────────────────────────────────────────

function scorePain(pain: string): number {
  if (!pain || pain.length < 20) return 0

  const words = pain.toLowerCase().split(/\s+/)
  const wordCount = words.length
  const hasGenericWords = GENERIC_WORDS.some(gw => pain.toLowerCase().includes(gw))
  const hasConsequences = pain.includes('porque') || pain.includes('ya que') ||
                          pain.includes('esto causa') || pain.includes('resultado')
  const isSufficientlyLong = wordCount >= 20

  let score = 5  // base

  if (!hasGenericWords) score += 8
  if (hasConsequences) score += 7
  if (isSufficientlyLong) score += 5

  return Math.min(score, 25)
}

function scorePromise(outcome: string): number {
  if (!outcome || outcome.length < 10) return 0

  const hasNumber = /\d/.test(outcome)
  const hasTime = /semana|mes|día|hora|año|weeks?|month|days?/i.test(outcome)
  const hasPercentage = /%|por ciento/i.test(outcome)
  const isSpecific = outcome.split(/\s+/).length >= 10

  let score = 5

  if (hasNumber) score += 8
  if (hasTime) score += 7
  if (hasPercentage) score += 3
  if (isSpecific) score += 2

  return Math.min(score, 25)
}

function scoreDifferentiator(differentiator: string): number {
  if (!differentiator || differentiator.length < 20) return 0

  const hasGenericWords = GENERIC_WORDS.some(gw =>
    differentiator.toLowerCase().includes(gw)
  )
  const hasMechanism = differentiator.toLowerCase().includes('proceso') ||
                       differentiator.toLowerCase().includes('sistema') ||
                       differentiator.toLowerCase().includes('método') ||
                       differentiator.toLowerCase().includes('única')
  const isSpecific = differentiator.split(/\s+/).length >= 15

  let score = 5

  if (!hasGenericWords) score += 8
  if (hasMechanism) score += 7
  if (isSpecific) score += 5

  return Math.min(score, 25)
}

function scoreTrigger(mechanism: string, pain: string): number {
  // El trigger se infiere del dolor y el mecanismo
  if (!pain || pain.length < 10) return 0

  const hasSpecificEvent = /cuando|después|antes de|al momento|por fin|ya que/i.test(pain)
  const hasMechanismDefined = mechanism.length > 20

  let score = 5

  if (hasSpecificEvent) score += 12
  if (hasMechanismDefined) score += 8

  return Math.min(score, 25)
}
```

---

## 7. State Management del Wizard

### `hooks/useWizard.tsx`

```typescript
'use client'

import { createContext, useContext, useReducer, useCallback } from 'react'
import type {
  WizardState,
  WizardAction,
  WizardStep,
  ICPType,
  Step2Answers,
  Step3B2BAnswers,
  Step3B2CAnswers,
  Step4Answers,
  Step5Answers,
} from '@/types/wizard.types'

// ── ESTADO INICIAL ─────────────────────────────────────────────────────────

const initialState: WizardState = {
  currentStep: 1,
  status: 'idle',
  completedSteps: [],
  icpType: null,
  websiteUrl: null,
  scrapedContent: null,
  prefillConfidence: null,
  answers: {
    step2: null,
    step3_b2b: null,
    step3_b2c: null,
    step4: null,
    step5: null,
  },
  icpScore: null,
  generatedOutputs: null,
  error: null,
}

// ── REDUCER ────────────────────────────────────────────────────────────────

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }

    case 'SET_STATUS':
      return { ...state, status: action.payload, error: null }

    case 'SET_WEBSITE_URL':
      return { ...state, websiteUrl: action.payload, status: 'scraping' }

    case 'SET_SCRAPED_CONTENT':
      return {
        ...state,
        scrapedContent: action.payload.content,
        prefillConfidence: action.payload.confidence,
        status: 'scraping_complete',
      }

    case 'SET_ICP_TYPE':
      return { ...state, icpType: action.payload }

    case 'UPDATE_STEP2':
      return {
        ...state,
        answers: { ...state.answers, step2: action.payload },
        icpType: action.payload.icpType,
      }

    case 'UPDATE_STEP3_B2B':
      return {
        ...state,
        answers: { ...state.answers, step3_b2b: action.payload },
      }

    case 'UPDATE_STEP3_B2C':
      return {
        ...state,
        answers: { ...state.answers, step3_b2c: action.payload },
      }

    case 'UPDATE_STEP4':
      return {
        ...state,
        answers: { ...state.answers, step4: action.payload },
      }

    case 'UPDATE_STEP5':
      return {
        ...state,
        answers: { ...state.answers, step5: action.payload },
      }

    case 'SET_ICP_SCORE':
      return { ...state, icpScore: action.payload }

    case 'SET_GENERATED_OUTPUTS':
      return {
        ...state,
        generatedOutputs: action.payload,
        status: 'complete',
      }

    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.payload)
          ? state.completedSteps
          : [...state.completedSteps, action.payload],
      }

    case 'SET_ERROR':
      return { ...state, error: action.payload, status: 'error' }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

// ── CONTEXT ────────────────────────────────────────────────────────────────

interface WizardContextValue {
  state: WizardState
  // Navegación
  goToStep: (step: WizardStep) => void
  goNext: () => void
  goPrev: () => void
  // Scraping
  setWebsiteUrl: (url: string) => void
  setScrapedContent: (content: string, confidence: WizardState['prefillConfidence']) => void
  // Respuestas
  setICPType: (type: ICPType) => void
  updateStep2: (data: Step2Answers) => void
  updateStep3B2B: (data: Step3B2BAnswers) => void
  updateStep3B2C: (data: Step3B2CAnswers) => void
  updateStep4: (data: Step4Answers) => void
  updateStep5: (data: Step5Answers) => void
  // Estado
  setStatus: (status: WizardState['status']) => void
  setError: (error: string) => void
  completeStep: (step: WizardStep) => void
  setGeneratedOutputs: (outputs: WizardState['generatedOutputs']) => void
  setICPScore: (score: WizardState['icpScore']) => void
  reset: () => void
  // Helpers
  canGoNext: boolean
  isStepCompleted: (step: WizardStep) => boolean
  getStep3Component: () => 'b2b' | 'b2c' | 'mixed'
}

const WizardContext = createContext<WizardContextValue | null>(null)

// ── PROVIDER ───────────────────────────────────────────────────────────────

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  const goToStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const goNext = useCallback(() => {
    if (state.currentStep < 5) {
      dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep })
      dispatch({ type: 'SET_STEP', payload: (state.currentStep + 1) as WizardStep })
    }
  }, [state.currentStep])

  const goPrev = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: (state.currentStep - 1) as WizardStep })
    }
  }, [state.currentStep])

  const canGoNext = state.status !== 'processing' && state.status !== 'error'

  const isStepCompleted = useCallback(
    (step: WizardStep) => state.completedSteps.includes(step),
    [state.completedSteps]
  )

  const getStep3Component = useCallback((): 'b2b' | 'b2c' | 'mixed' => {
    const type = state.icpType
    if (type === 'b2c' || type === 'freelancer') return 'b2c'
    if (type === 'mixed') return 'mixed'
    return 'b2b'
  }, [state.icpType])

  const value: WizardContextValue = {
    state,
    goToStep,
    goNext,
    goPrev,
    setWebsiteUrl: (url) => dispatch({ type: 'SET_WEBSITE_URL', payload: url }),
    setScrapedContent: (content, confidence) =>
      dispatch({ type: 'SET_SCRAPED_CONTENT', payload: { content, confidence: confidence! } }),
    setICPType: (type) => dispatch({ type: 'SET_ICP_TYPE', payload: type }),
    updateStep2: (data) => dispatch({ type: 'UPDATE_STEP2', payload: data }),
    updateStep3B2B: (data) => dispatch({ type: 'UPDATE_STEP3_B2B', payload: data }),
    updateStep3B2C: (data) => dispatch({ type: 'UPDATE_STEP3_B2C', payload: data }),
    updateStep4: (data) => dispatch({ type: 'UPDATE_STEP4', payload: data }),
    updateStep5: (data) => dispatch({ type: 'UPDATE_STEP5', payload: data }),
    setStatus: (status) => dispatch({ type: 'SET_STATUS', payload: status }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    completeStep: (step) => dispatch({ type: 'COMPLETE_STEP', payload: step }),
    setGeneratedOutputs: (outputs) =>
      dispatch({ type: 'SET_GENERATED_OUTPUTS', payload: outputs! }),
    setICPScore: (score) => dispatch({ type: 'SET_ICP_SCORE', payload: score! }),
    reset: () => dispatch({ type: 'RESET' }),
    canGoNext,
    isStepCompleted,
    getStep3Component,
  }

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

// ── HOOK ───────────────────────────────────────────────────────────────────

export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
```

---

## Qué sigue — Parte 3

La **Parte 3** cubre:
- Cada pantalla del wizard implementada como componente React
- La pantalla de scraping con feedback visual (loading states)
- El componente del ICP Score con feedback en tiempo real
- La pantalla de procesamiento con el progreso de activación de GHL
- La pantalla de resultados con los outputs organizados
- El layout general del wizard con la barra de progreso
- El manejo de errores y estados de carga

**Cómo usar esta Parte 2:**
Sube la Parte 1 y la Parte 2 juntas al inicio de tu sesión de VSCode con el prompt:
*"Tengo el spec completo del 10xTeam Wizard en dos partes. La Parte 1 tiene arquitectura,
tipos y DB. La Parte 2 tiene multi-AI, wizard config y state management. Quiero empezar
con [archivo específico]. Úsalos como referencia."*
