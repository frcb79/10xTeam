# 10xTeam Wizard — Especificación Técnica
## Parte 1 de 5: Arquitectura, Stack, Tipos y Base de Datos

> **Cómo usar este documento:**
> Sube esta parte a tu AI en VSCode antes de empezar cualquier archivo nuevo.
> Dile: *"Este es el spec de arquitectura del proyecto. Úsalo como referencia para
> cualquier código que generemos."*
> Las partes 2–5 se suben cuando empieces cada módulo correspondiente.

---

## 1. Contexto del Proyecto

**Qué es:** Una plataforma web (app separada de la landing page) donde los clientes de
10xTeam Growth completan un wizard de onboarding que define su ICP, activa su cuenta en
GHL, genera todos sus materiales de venta y configura su bot de WhatsApp — de forma
automática, sin intervención del equipo de 10xTeam.

**URL de la app:** `app.growth.10xteam.com.mx`
**URL pública:** `growth.10xteam.com.mx` (ya construida, separada)

**Flujo resumido:**
```
Landing page → Signup → Wizard (5 pasos) → Processing (90 seg) → Dashboard
```

---

## 2. Tech Stack Definitivo

```
Frontend + Backend:   Next.js 14 (App Router, TypeScript)
Base de datos:        Supabase (PostgreSQL + Auth + Storage + Realtime)
Estilos:              Tailwind CSS + shadcn/ui
Deploy:               Vercel
Scraping:             Jina AI Reader (r.jina.ai — gratis, zero config)
IA principal:         Claude API (Anthropic) — claude-3-5-haiku para análisis rápido,
                                               claude-sonnet-4-5 para generación compleja
CRM/Bot/Pipeline:     GHL API v2 (GoHighLevel)
Pagos MXN:            MercadoPago
Pagos USD:            Stripe
Email transaccional:  Resend + React Email
WhatsApp:             GHL LeadConnector (nativo — sin 360dialog)
Monitoreo:            Sentry (errores) + Posthog (analytics de producto)
```

---

## 3. Estructura de Carpetas

```
app.growth.10xteam.com.mx/
│
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (app)/                        # Rutas protegidas (requieren auth)
│   │   ├── layout.tsx                # Layout con sidebar del dashboard
│   │   ├── dashboard/page.tsx
│   │   ├── wizard/
│   │   │   ├── layout.tsx            # Layout del wizard (sin sidebar)
│   │   │   ├── page.tsx              # Redirect a /wizard/step/1
│   │   │   ├── step/
│   │   │   │   └── [step]/page.tsx   # Pasos dinámicos 1–5
│   │   │   ├── processing/page.tsx   # Pantalla de carga/activación
│   │   │   └── complete/page.tsx     # Pantalla de resultados
│   │   ├── icp/page.tsx
│   │   ├── materiales/page.tsx
│   │   ├── bot/page.tsx
│   │   ├── campanas/page.tsx
│   │   ├── contenido/page.tsx
│   │   └── reportes/page.tsx
│   │
│   └── api/                          # API Routes (backend)
│       ├── scrape/route.ts           # POST: scraping con Jina
│       ├── generate/
│       │   ├── icp/route.ts          # POST: genera ICP Card con Claude
│       │   ├── materials/route.ts    # POST: genera materiales específicos
│       │   ├── bot-prompt/route.ts   # POST: genera prompt del bot
│       │   └── content/route.ts      # POST: genera calendario de contenido
│       ├── ghl/
│       │   ├── create-account/route.ts
│       │   ├── apply-snapshot/route.ts
│       │   ├── activate-bot/route.ts
│       │   └── webhooks/route.ts     # Recibe eventos de GHL
│       └── payments/
│           ├── stripe/route.ts
│           └── mercadopago/route.ts
│
├── components/
│   ├── wizard/                       # Todos los componentes del wizard
│   │   ├── WizardShell.tsx           # Contenedor con estado global
│   │   ├── WizardProgress.tsx        # Barra de progreso
│   │   ├── steps/
│   │   │   ├── Step1Entry.tsx
│   │   │   ├── Step2Business.tsx
│   │   │   ├── Step3ICP.tsx          # Se bifurca según icp_type
│   │   │   ├── Step3ICP_B2B.tsx
│   │   │   ├── Step3ICP_B2C.tsx
│   │   │   ├── Step4Process.tsx
│   │   │   └── Step5Channels.tsx
│   │   ├── ProcessingScreen.tsx
│   │   └── ResultsScreen.tsx
│   │
│   ├── dashboard/                    # Componentes del dashboard principal
│   ├── ui/                           # shadcn/ui components
│   └── shared/                       # Componentes reutilizables
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Supabase browser client
│   │   ├── server.ts                 # Supabase server client
│   │   └── middleware.ts
│   ├── ghl/
│   │   ├── client.ts                 # GHL API client
│   │   └── endpoints.ts              # Todas las llamadas a GHL
│   ├── claude/
│   │   ├── client.ts                 # Claude API client
│   │   └── generators.ts             # Funciones de generación
│   ├── jina/
│   │   └── scraper.ts                # Función de scraping
│   ├── prompts/
│   │   ├── context.ts                # El Bloque 0: contexto base
│   │   ├── voice.ts                  # El Bloque 1: guardrails
│   │   ├── cold-outreach.ts          # Bloque 2
│   │   ├── nurture.ts                # Bloque 3
│   │   ├── closing.ts                # Bloque 4
│   │   ├── reactivation.ts           # Bloque 5
│   │   ├── clients.ts                # Bloque 6
│   │   ├── winback.ts                # Bloque 7
│   │   ├── social.ts                 # Bloque 8
│   │   └── bot.ts                    # Bloque 9
│   └── utils/
│       ├── icp-score.ts              # Calcula el ICP Quality Score
│       └── validators.ts             # Validaciones del wizard
│
├── types/
│   ├── wizard.types.ts               # ← VER SECCIÓN 5
│   ├── icp.types.ts
│   ├── ghl.types.ts
│   └── supabase.types.ts             # Auto-generado por Supabase CLI
│
├── config/
│   ├── wizard.config.ts              # ← VER PARTE 2
│   └── flows.config.ts               # Configuración de flujos del funnel
│
├── hooks/
│   ├── useWizard.ts                  # Hook del estado del wizard
│   ├── useICP.ts                     # Hook para operaciones con ICP
│   └── useGHL.ts                     # Hook para operaciones con GHL
│
├── middleware.ts                     # Auth middleware de Supabase
├── .env.local                        # ← VER SECCIÓN 6
└── next.config.ts
```

---

## 4. Variables de Entorno

Crear el archivo `.env.local` en la raíz del proyecto con estas variables:

```bash
# ── SUPABASE ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # Solo en server — nunca exponer al cliente

# ── ANTHROPIC (Claude API) ────────────────────────────────
ANTHROPIC_API_KEY=

# ── OPENAI ────────────────────────────────────────────────
OPENAI_API_KEY=

# ── GOOGLE AI (Gemini) ────────────────────────────────────
GOOGLE_AI_API_KEY=

# ── DEEPSEEK ──────────────────────────────────────────────
DEEPSEEK_API_KEY=

# ── GHL (GoHighLevel API v2) ──────────────────────────────
GHL_API_KEY=                         # Agency API key del plan SaaS Pro
GHL_AGENCY_ID=                       # ID de la agencia en GHL
GHL_WEBHOOK_SECRET=                  # Para validar webhooks entrantes de GHL
GHL_MOCK_MODE=true

# ── STRIPE ────────────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# ── MERCADOPAGO ───────────────────────────────────────────
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=

# ── RESEND (email transaccional) ─────────────────────────
RESEND_API_KEY=

# ── SENTRY ────────────────────────────────────────────────
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# ── POSTHOG ───────────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# ── APP ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://app.growth.10xteam.com.mx
NEXT_PUBLIC_LANDING_URL=https://growth.10xteam.com.mx

# ── AI DEV OVERRIDES ──────────────────────────────────────
AI_DEV_MODE=true
AI_DEV_PROVIDER=google
AI_DEV_MODEL=gemini-1.5-flash
```

> **Nota de seguridad:** Variables con `NEXT_PUBLIC_` son accesibles desde el cliente
> (browser). NUNCA poner claves secretas con ese prefijo. El `SUPABASE_SERVICE_ROLE_KEY`,
> el `ANTHROPIC_API_KEY` y los tokens de GHL solo van en variables sin `NEXT_PUBLIC_`.

---

## 5. TypeScript — Tipos Completos del Proyecto

### `types/wizard.types.ts`

```typescript
// ── ENUMS ─────────────────────────────────────────────────────────────────

export type ICPType = 'b2b' | 'b2c' | 'mixed' | 'freelancer'

export type WizardStep = 1 | 2 | 3 | 4 | 5

export type WizardStatus =
  | 'idle'
  | 'scraping'
  | 'scraping_complete'
  | 'in_progress'
  | 'processing'   // Pantalla de carga — generando outputs + activando GHL
  | 'complete'
  | 'error'

export type ChannelType =
  | 'whatsapp'
  | 'linkedin'
  | 'instagram'
  | 'facebook'
  | 'email'
  | 'youtube'
  | 'tiktok'
  | 'twitter'

export type ContentFormat =
  | 'text'
  | 'short_video'
  | 'long_video'
  | 'images'
  | 'documents'
  | 'podcast'

export type FunnelFlow =
  | 'cold_prospect'
  | 'warm_prospect'
  | 'referral'
  | 'info_requested_no_response'
  | 'proposal_seen_disappeared'
  | 'attended_demo'
  | 'has_objections'
  | 'ready_to_close'
  | 'new_client'
  | 'active_client'
  | 'at_risk_client'
  | 'wants_to_cancel'
  | 'churned_client'
  | 'referral_program'
  | 'custom'        // Flujo personalizado definido por el usuario

// ── WIZARD STATE ──────────────────────────────────────────────────────────

export interface WizardState {
  currentStep: WizardStep
  status: WizardStatus
  completedSteps: WizardStep[]
  icpType: ICPType | null
  websiteUrl: string | null
  scrapedContent: string | null    // Contenido extraído por Jina
  prefillConfidence: PrefillConfidence | null
  answers: WizardAnswers
  icpScore: ICPQualityScore | null
  generatedOutputs: GeneratedOutputs | null
  error: string | null
}

export interface PrefillConfidence {
  // Score por campo de 0–1 indicando qué tan bien se extrajo del sitio
  oneLiner: number
  industry: number
  mainPain: number
  mainOutcome: number
  differentiator: number
}

// ── RESPUESTAS DEL WIZARD ─────────────────────────────────────────────────

export interface WizardAnswers {
  // PASO 2 — El negocio
  step2: Step2Answers | null

  // PASO 3 — El cliente ideal (bifurcado)
  step3_b2b: Step3B2BAnswers | null
  step3_b2c: Step3B2CAnswers | null

  // PASO 4 — Proceso y diferenciación
  step4: Step4Answers | null

  // PASO 5 — Canales y flujos
  step5: Step5Answers | null
}

export interface Step2Answers {
  businessName: string
  oneLiner: string              // Q01: ¿Qué hace en una oración?
  industry: string              // Q02: ¿En qué industria?
  industrySubcategory: string
  icpType: ICPType              // Selector B2B/B2C/Mixto/Freelancer
}

export interface Step3B2BAnswers {
  // Q03 B2B
  primaryDecisionMaker: string          // Cargo del decisor principal
  secondaryInfluencers: InfluencerProfile[] // ICPs secundarios
  companySizeRange: CompanySizeRange
  targetIndustry: string
  geographyPriority: string
  // Q04
  mainPain: string                       // En palabras del cliente
  mainPainConsequences: string
  // Q05
  costOfInaction: string
  costOfInactionAmount: string           // Cantidad estimada (MXN/USD)
  // Q06
  mainOutcome: string                    // Resultado concreto y medible
  outcomeTimeline: string                // En qué tiempo
  // Q14 — Económica
  typicalInvestmentRange: string
  budgetType: 'personal' | 'business' | 'both'
  decisionAuthority: 'alone' | 'needs_approval' | 'committee'
}

export interface InfluencerProfile {
  role: string
  influence: 'high' | 'medium' | 'low'
  keyArgument: string    // Qué argumento mueve su aprobación
}

export type CompanySizeRange =
  | '1-5'
  | '6-20'
  | '21-50'
  | '51-200'
  | '201-500'
  | '500+'

export interface Step3B2CAnswers {
  // Q03 B2C
  ageRange: string
  lifeStage: string[]
  incomeLevel: string
  geography: string
  // Q04
  mainPain: string
  mainDesire: string
  // Q05
  costOfInaction: string
  // Q06
  mainOutcome: string
  outcomeTimeline: string
  // Q14 — Económica
  typicalInvestmentRange: string
  paysFromOwnPocket: boolean
}

export interface Step4Answers {
  // Q07 — Ciclo de venta
  salesCycleDuration: SalesCycleDuration
  salesCycleNotes: string
  // Q08 — Objeciones
  topObjection: string
  topObjectionResolution: string
  // Q09 — Anti-ICP + Alto Riesgo
  antiICP: string
  highRiskICP: string
  // Q10 — Competencia
  mainCompetitors: string          // Descripción por categoría, no por nombre
  whyChoseUs: string
  whyCompetitorsFail: string
  // Q11 — Diferenciador
  uniqueDifferentiator: string
}

export type SalesCycleDuration =
  | 'same_day'
  | '1-7_days'
  | '1-4_weeks'
  | '1-3_months'
  | '3+_months'

export interface Step5Answers {
  // Q12 — Canales
  activeChannels: ChannelConfig[]
  preferredContactMethod: ChannelType
  contentFormats: ContentFormat[]
  // Q13 — Flujos
  selectedFlows: FunnelFlow[]
  customFlows: CustomFlow[]
}

export interface ChannelConfig {
  channel: ChannelType
  activityLevel: 'high' | 'medium' | 'low'
  useForProspecting: boolean
  useForContent: boolean
}

export interface CustomFlow {
  name: string
  description: string           // Qué es este flujo
  contactStage: string          // En qué momento del proceso está el contacto
  goalWithMaterials: string     // Qué quiere lograr con los materiales
}

// ── ICP QUALITY SCORE ─────────────────────────────────────────────────────

export interface ICPQualityScore {
  total: number                  // 0–100
  breakdown: {
    painInClientWords: number    // 0–25: El dolor está en palabras del cliente
    measurablePromise: number    // 0–25: La promesa es medible y tiene tiempo
    exclusiveDifferentiator: number // 0–25: El diferenciador no es copiable
    actionableTrigger: number    // 0–25: El detonador es accionable
  }
  suggestions: string[]          // Qué mejorar para subir el score
  canProceed: boolean            // false si score < 40 (mínimo para generar)
}

// ── OUTPUTS GENERADOS ─────────────────────────────────────────────────────

export interface GeneratedOutputs {
  icpCard: ICPCard
  elevatorPitch: ElevatorPitchSet
  botPrompt: string
  emailSubjectLines: string[]    // 5 opciones
  pitchDeckStructure: PitchDeckStructure
  monthlyPostIdeas: PostIdea[]   // 12 ideas
  objectionResponses: ObjectionResponse[]
  uniqueMechanism: string        // Construido por Claude
}

export interface ICPCard {
  version: number
  archetypeName: string          // "Laura — Directora de Clínica Dental Privada"
  profileDescription: string
  primaryDecisionMaker: string
  secondaryInfluencers: InfluencerProfile[]
  trigger: string
  mainPain: string
  costOfInaction: string
  topFear: string
  previousSolutionsTried: string
  uniqueMechanism: string
  channels: ChannelType[]
  promise: string
  antiICP: string
  highRiskICP: string
  economicProfile: {
    investmentRange: string
    budgetType: string
    decisionAuthority: string
  }
  icpScore: ICPQualityScore
  createdAt: string
  updatedAt: string
}

export interface ElevatorPitchSet {
  whatsapp: string               // Versión para WhatsApp (más corta)
  linkedin: string               // Versión para LinkedIn
  inPerson: string               // Versión para presentación en persona
}

export interface PitchDeckStructure {
  slides: PitchDeckSlide[]
}

export interface PitchDeckSlide {
  slideNumber: number
  title: string
  visibleText: string            // Máximo 40 palabras en pantalla
  presenterNotes: string         // 60–100 palabras para decir en voz alta
}

export interface PostIdea {
  weekNumber: number
  topic: string
  angle: 'education' | 'pain' | 'proof' | 'mechanism' | 'community' | 'offer'
  format: 'text' | 'carousel' | 'reel' | 'image'
  hook: string
  cta: string
}

export interface ObjectionResponse {
  objection: string
  response: string
  followUpQuestion: string
}

// ── WIZARD ACTIONS (para useReducer) ─────────────────────────────────────

export type WizardAction =
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'SET_STATUS'; payload: WizardStatus }
  | { type: 'SET_WEBSITE_URL'; payload: string }
  | { type: 'SET_SCRAPED_CONTENT'; payload: { content: string; confidence: PrefillConfidence } }
  | { type: 'SET_ICP_TYPE'; payload: ICPType }
  | { type: 'UPDATE_STEP2'; payload: Step2Answers }
  | { type: 'UPDATE_STEP3_B2B'; payload: Step3B2BAnswers }
  | { type: 'UPDATE_STEP3_B2C'; payload: Step3B2CAnswers }
  | { type: 'UPDATE_STEP4'; payload: Step4Answers }
  | { type: 'UPDATE_STEP5'; payload: Step5Answers }
  | { type: 'SET_ICP_SCORE'; payload: ICPQualityScore }
  | { type: 'SET_GENERATED_OUTPUTS'; payload: GeneratedOutputs }
  | { type: 'COMPLETE_STEP'; payload: WizardStep }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }
```

---

### `types/icp.types.ts`

```typescript
import type { ICPCard, FunnelFlow, CustomFlow } from './wizard.types'

// ── VERSIÓN GUARDADA EN BASE DE DATOS ─────────────────────────────────────

export interface ICPProfile {
  id: string
  businessId: string
  version: number
  isActive: boolean
  card: ICPCard
  activatedFlows: FunnelFlow[]
  customFlows: CustomFlow[]
  ghlCustomFieldsId: string | null  // ID del campo custom en GHL donde se guardó
  createdAt: string
  updatedAt: string
}

// ── EVOLUCIÓN MENSUAL ──────────────────────────────────────────────────────

export interface ICPMonthlyReview {
  id: string
  icpProfileId: string
  month: string                      // "2026-07"
  reviewedBy: 'auto' | 'user'
  changes: ICPChange[]
  botInsights: BotInsight[]
  createdAt: string
}

export interface ICPChange {
  field: keyof ICPCard
  previousValue: string
  newValue: string
  reason: string
}

export interface BotInsight {
  week: string
  nonICPLeadsCount: number           // Leads marcados como "no ICP"
  uncoveredObjections: string[]      // Objeciones no cubiertas en el ICP
  uncoveredQuestions: string[]       // Preguntas frecuentes no en el ICP
}
```

---

### `types/ghl.types.ts`

```typescript
// ── ESTRUCTURA DE GHL API v2 ───────────────────────────────────────────────

export interface GHLSubAccount {
  id: string                    // locationId en GHL
  name: string
  email: string
  phone: string
  timezone: string
  country: string
  state: string
  city: string
}

export interface GHLSnapshot {
  id: string
  name: string
  industry: string
}

export interface GHLConversationAISettings {
  enabled: boolean
  mode: 'autopilot' | 'suggestive'
  botName: string
  prompt: string
  channels: GHLChannel[]
}

export type GHLChannel = 'whatsapp' | 'sms' | 'instagram' | 'facebook' | 'live_chat'

export interface GHLCustomField {
  id: string
  name: string
  value: string
  type: 'TEXT' | 'LARGE_TEXT' | 'NUMERICAL' | 'DATE' | 'DROPDOWN'
}

export interface GHLWebhookEvent {
  type: GHLWebhookEventType
  locationId: string
  timestamp: string
  data: Record<string, unknown>
}

export type GHLWebhookEventType =
  | 'contact.created'
  | 'contact.updated'
  | 'opportunity.created'
  | 'opportunity.status_changed'
  | 'appointment.created'
  | 'appointment.updated'
  | 'conversation.message_received'

// ── ACTIVATION SEQUENCE RESULT ────────────────────────────────────────────

export interface GHLActivationResult {
  success: boolean
  locationId: string | null
  snapshotApplied: boolean
  customFieldsSet: boolean
  botActivated: boolean
  campaignsActivated: boolean
  errors: string[]
}
```

---

## 6. Schema de Base de Datos — Supabase

Ejecutar estas migraciones en el orden indicado en el SQL editor de Supabase.

### Migración 01: Tabla de Negocios

```sql
-- 01_create_businesses.sql

create table public.businesses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  website_url   text,
  industry      text,
  icp_type      text check (icp_type in ('b2b', 'b2c', 'mixed', 'freelancer')),

  -- GHL Integration
  ghl_location_id   text unique,
  ghl_snapshot_id   text,

  -- Wizard state
  wizard_completed      boolean default false,
  wizard_completed_at   timestamptz,
  wizard_step_current   integer default 1,

  -- Plan
  plan          text check (plan in ('trial', 'solo', 'pyme', 'empresa')) default 'trial',
  trial_ends_at timestamptz default (now() + interval '14 days'),

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS
alter table public.businesses enable row level security;

create policy "Users can view own businesses"
  on public.businesses for select
  using (auth.uid() = user_id);

create policy "Users can insert own businesses"
  on public.businesses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own businesses"
  on public.businesses for update
  using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function update_updated_at();
```

---

### Migración 02: Tabla de ICP Profiles

```sql
-- 02_create_icp_profiles.sql

create table public.icp_profiles (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,

  -- Versioning
  version         integer not null default 1,
  is_active       boolean not null default true,

  -- Wizard raw answers (para poder re-generar si es necesario)
  wizard_answers  jsonb not null default '{}',

  -- Generated ICP Card
  icp_card        jsonb not null default '{}',

  -- ICP Score
  icp_score       jsonb,

  -- Active flows
  active_flows    text[] default '{}',
  custom_flows    jsonb default '[]',

  -- Bot
  bot_prompt      text,

  -- GHL
  ghl_custom_fields_id  text,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Solo puede haber un ICP activo por negocio
create unique index one_active_icp_per_business
  on public.icp_profiles (business_id)
  where is_active = true;

-- RLS
alter table public.icp_profiles enable row level security;

create policy "Users can view own ICP profiles"
  on public.icp_profiles for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = icp_profiles.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can insert own ICP profiles"
  on public.icp_profiles for insert
  with check (
    exists (
      select 1 from public.businesses
      where businesses.id = icp_profiles.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can update own ICP profiles"
  on public.icp_profiles for update
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = icp_profiles.business_id
      and businesses.user_id = auth.uid()
    )
  );

create trigger icp_profiles_updated_at
  before update on public.icp_profiles
  for each row execute function update_updated_at();
```

---

### Migración 03: Tabla de Materiales

```sql
-- 03_create_materials.sql

create type material_type as enum (
  'pitch_deck',
  'proposal',
  'one_pager',
  'script_call',
  'script_bot',
  'email_cold_sequence',
  'email_nurture_sequence',
  'email_reactivation_sequence',
  'linkedin_messages',
  'whatsapp_messages',
  'posts_monthly',
  'ads_copy',
  'newsletter'
);

create table public.materials (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  icp_version     integer not null,

  type            material_type not null,
  flow            text,              -- Flujo del funnel al que pertenece
  channel         text,              -- Canal específico si aplica

  content         jsonb not null,    -- El contenido estructurado
  pdf_url         text,              -- URL en Supabase Storage si hay PDF

  -- Metadata
  month           text,              -- "2026-07" para materiales mensuales
  is_approved     boolean default false,
  approved_at     timestamptz,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.materials enable row level security;

create policy "Users can manage own materials"
  on public.materials for all
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = materials.business_id
      and businesses.user_id = auth.uid()
    )
  );

create trigger materials_updated_at
  before update on public.materials
  for each row execute function update_updated_at();
```

---

### Migración 04: Tabla de Eventos Analytics (webhooks de GHL)

```sql
-- 04_create_analytics_events.sql

create table public.analytics_events (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,

  event_type        text not null,
  ghl_contact_id    text,
  ghl_location_id   text,

  source            text,            -- whatsapp, email, linkedin, etc.
  channel           text,
  campaign_name     text,

  payload           jsonb default '{}',

  created_at        timestamptz default now()
);

-- No necesita updated_at — eventos son inmutables

alter table public.analytics_events enable row level security;

create policy "Users can view own analytics"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = analytics_events.business_id
      and businesses.user_id = auth.uid()
    )
  );

-- Solo el service role puede insertar (vía webhooks del servidor)
create policy "Service role can insert analytics"
  on public.analytics_events for insert
  with check (true);  -- El service role bypasea RLS

-- Índices para queries de dashboard
create index analytics_events_business_id_idx on public.analytics_events(business_id);
create index analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index analytics_events_type_idx on public.analytics_events(event_type);
```

---

### Migración 05: Tabla de Tokens de GHL

```sql
-- 05_create_ghl_tokens.sql

create table public.ghl_tokens (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null unique references public.businesses(id) on delete cascade,

  access_token    text not null,
  refresh_token   text not null,
  expires_at      timestamptz not null,

  -- Los tokens se encriptan con pgcrypto en producción
  -- Por ahora se guardan en texto — agregar encriptación antes de ir a producción

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.ghl_tokens enable row level security;

-- Solo el service role accede a tokens — nunca el usuario directamente
create policy "No direct user access to tokens"
  on public.ghl_tokens for all
  using (false);

create trigger ghl_tokens_updated_at
  before update on public.ghl_tokens
  for each row execute function update_updated_at();
```

---

## 7. Inicialización del Proyecto en VSCode

Una vez que tengas este spec, estos son los comandos para iniciar el proyecto:

```bash
# 1. Crear el proyecto Next.js con TypeScript
npx create-next-app@latest app.growth.10xteam --typescript --tailwind --eslint --app --src-dir=false

cd app.growth.10xteam

# 2. Instalar dependencias principales
npm install @supabase/supabase-js @supabase/ssr
npm install @anthropic-ai/sdk
npm install openai                    # Para GPT-4o y DeepSeek (misma SDK)
npm install @google/generative-ai     # Para Gemini
npm install resend
npm install @sentry/nextjs
npm install posthog-js

# 3. Instalar shadcn/ui
npx shadcn@latest init
# Elegir: Default, slate, CSS variables: yes

# 4. Agregar componentes de shadcn que necesitamos
npx shadcn@latest add button input label textarea select
npx shadcn@latest add card progress badge separator
npx shadcn@latest add form (usa react-hook-form + zod)
npx shadcn@latest add toast
npx shadcn@latest add dialog

# 5. Instalar Supabase CLI (para generar tipos)
npm install -D supabase
npx supabase login
npx supabase init

# 6. Crear el archivo de variables de entorno
cp .env.example .env.local
# Llenar las variables de la Sección 6 de este documento

# 7. Generar tipos de Supabase automáticamente (después de crear las tablas)
npx supabase gen types typescript --project-id TU_PROJECT_ID > types/supabase.types.ts
```

---

## 8. Middleware de Autenticación

```typescript
// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas protegidas — requieren autenticación
  const protectedPaths = ['/dashboard', '/wizard', '/icp', '/materiales',
                          '/bot', '/campanas', '/contenido', '/reportes']

  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Si no está autenticado y trata de entrar a ruta protegida
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Si está autenticado y va a login/signup, redirigir al dashboard
  if (user && (request.nextUrl.pathname === '/login' ||
               request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 9. Clientes de Supabase

```typescript
// lib/supabase/client.ts — Para uso en Client Components

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts — Para uso en Server Components y API Routes

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — no puede setear cookies directamente
          }
        },
      },
    }
  )
}
```

```typescript
// lib/supabase/service.ts — Para API Routes que necesitan el service role
// NUNCA usar en Client Components

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
```

---

## Qué sigue — Parte 2

La **Parte 2** cubre:
- El archivo `wizard.config.ts` completo con las 14 preguntas como objetos de configuración
- La lógica de branching B2B/B2C/Mixto
- Las reglas de validación por pregunta
- El algoritmo del ICP Quality Score
- El `useReducer` del wizard con todos sus cases
- El `WizardContext` y el hook `useWizard`

**Cómo usar esta Parte 1 en VSCode:**
1. Abre tu proyecto en VSCode
2. Crea los archivos listados en la Sección 3 (estructura de carpetas)
3. Copia cada bloque de código a su archivo correspondiente
4. Sube este .md a tu AI con el prompt:
   *"Este es el spec de arquitectura del proyecto 10xTeam Wizard. Úsalo como referencia
   para todo el código que generemos. Empecemos por [el archivo que quieras implementar]."*
