# 10xTeam Wizard — Bloque F: Economía del Negocio
## Actualización al Wizard Spec (complementa Partes 1–5)

> **Cómo usar este archivo:**
> Este es un addendum al wizard spec. Contiene:
> 1. Las preguntas del Bloque F y su configuración
> 2. Los nuevos tipos de TypeScript necesarios
> 3. La lógica del ROI Calculator
> 4. El componente `Step4Economics.tsx`
> 5. La función que genera el mensaje personalizado de costo de oportunidad
>
> Sube este archivo junto con las Partes 1-5 cuando implementes el Bloque F.

---

## 1. Contexto del Bloque F

El Bloque F se agrega como segunda sección del Paso 4 del wizard, después de las preguntas
de diferenciación. Sus respuestas alimentan dos outputs críticos:

1. **La Calculadora de Oportunidad** en el WOW ICP Document (el mensaje personalizado
   de costo de oportunidad que se muestra en la Llamada de Activación)
2. **La personalización de materiales** — los prompts de IA usan el tipo de venta,
   el ticket y el ciclo para calibrar el tono de cierre de todos los materiales

---

## 2. Tipos TypeScript — Agregar a `types/wizard.types.ts`

```typescript
// ── BLOQUE F: ECONOMÍA DEL NEGOCIO ────────────────────────────────────────

export type OwnerRole =
  | 'owner_operator'    // Dueño/director que opera personalmente
  | 'has_team'          // Tiene equipo de marketing/ventas
  | 'uses_agencies'     // Trabaja con agencias o freelancers

export type TimeInMarketing =
  | 'less_2hrs'         // Menos de 2 horas/semana
  | '2_5hrs'            // 2–5 horas/semana
  | '5_10hrs'           // 5–10 horas/semana
  | 'more_10hrs'        // Más de 10 horas/semana

export type ResponseTime =
  | 'under_5min'        // Menos de 5 minutos
  | '5_30min'           // Entre 5 y 30 minutos
  | '30min_2hrs'        // Entre 30 minutos y 2 horas
  | 'more_2hrs'         // Más de 2 horas o al día siguiente

export type SaleType =
  | 'one_time'          // Venta única
  | 'monthly_recurring' // Recurrente mensual
  | 'annual_recurring'  // Recurrente anual
  | 'package_renewal'   // Paquete con renovación
  | 'mixed'             // Mixto

export type RenewalFrequency =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'

export type MonthlyNewClients =
  | '1_3'
  | '4_10'
  | '11_20'
  | '20_plus'

export type AcquisitionCost =
  | 'under_500'
  | '500_2000'
  | '2000_8000'
  | 'over_8000'
  | 'unknown'

export type GrossMargin =
  | 'under_20'
  | '20_40'
  | '40_60'
  | 'over_60'
  | 'prefer_not_say'

export interface BlockFAnswers {
  // F1 — Rol del dueño (obligatorio)
  ownerRole: OwnerRole

  // F2 — Tiempo en marketing (obligatorio)
  weeklyTimeInMarketing: TimeInMarketing

  // F3 — Tiempo de respuesta a leads (obligatorio)
  leadResponseTime: ResponseTime

  // F4 — Valor estimado por cliente nuevo (obligatorio)
  clientValue: string           // Número o rango, ej: "8500" o "5000-12000"
  clientValueNumeric: number    // Valor numérico calculado (midpoint si es rango)

  // F5 — Descripción del producto/servicio (opcional)
  productDescription: string

  // F6 — Tipo de venta (obligatorio)
  saleType: SaleType

  // F7 — Frecuencia si es recurrente (obligatorio si F6 !== 'one_time')
  renewalFrequency: RenewalFrequency | null

  // F8 — Clientes nuevos por mes (obligatorio)
  monthlyNewClients: MonthlyNewClients

  // F9 — Costo de adquisición actual (opcional pero recomendado)
  acquisitionCost: AcquisitionCost

  // F10 — Margen bruto (opcional)
  grossMargin: GrossMargin
}

// ── RESULTADO DE LA CALCULADORA DE OPORTUNIDAD ────────────────────────────

export interface OpportunityCalculation {
  // Componente 1: Costo del tiempo del dueño/equipo
  timeCostMonthly: number           // MXN/mes
  timeCostHours: number             // horas/mes estimadas
  timeCostHourlyRate: number        // tasa horaria usada

  // Componente 2: Costo de leads perdidos por respuesta lenta
  leadsLostMonthly: number          // número de leads perdidos/mes estimado
  leadsLostRevenue: number          // MXN perdidos por leads que se enfrían

  // Componente 3: Potencial de crecimiento no capturado
  growthPotentialMonthly: number    // MXN adicionales posibles con el sistema

  // Total
  totalMonthlyOpportunityCost: number   // Suma de los 3 componentes
  totalAnnualOpportunityCost: number    // × 12

  // El mensaje personalizado generado
  personalizedMessage: string           // El texto para mostrar en la llamada
  highlightedStat: string               // La cifra más impactante (para el headline)

  // LTV calculado
  estimatedLTV: number                  // Lifetime value estimado del cliente
}
```

---

## 3. Actualizar `types/wizard.types.ts` — Step4Answers

```typescript
// En el interface Step4Answers existente, AGREGAR al final:

export interface Step4Answers {
  // ... campos existentes ...
  salesCycleDuration: SalesCycleDuration
  salesCycleNotes: string
  topObjection: string
  topObjectionResolution: string
  antiICP: string
  highRiskICP: string
  mainCompetitors: string
  whyChoseUs: string
  whyCompetitorsFail: string
  uniqueDifferentiator: string

  // NUEVO — Bloque F (algunos opcionales)
  blockF: BlockFAnswers | null
}
```

---

## 4. Actualizar `types/wizard.types.ts` — GeneratedOutputs

```typescript
// En el interface GeneratedOutputs existente, AGREGAR:

export interface GeneratedOutputs {
  // ... campos existentes ...
  icpCard: ICPCard
  elevatorPitch: ElevatorPitchSet
  botPrompt: string
  emailSubjectLines: string[]
  pitchDeckStructure: PitchDeckStructure
  monthlyPostIdeas: PostIdea[]
  objectionResponses: ObjectionResponse[]
  uniqueMechanism: string

  // NUEVO — Calculadora de oportunidad
  opportunityCalculation: OpportunityCalculation | null
}
```

---

## 5. Actualizar `config/wizard.config.ts` — Preguntas del Bloque F

Agregar estas preguntas al array `WIZARD_QUESTIONS`:

```typescript
// ── BLOQUE F: ECONOMÍA DEL NEGOCIO (Paso 4, segunda sección) ────────────

{
  id: 'owner_role',
  step: 4,
  block: 'F',
  type: 'radio_cards',
  label: '¿Cuál es tu rol principal en el día a día del negocio?',
  options: [
    {
      value: 'owner_operator',
      label: 'Soy el dueño/director y me encargo personalmente de varias áreas incluyendo operación, ventas, marketing, etc.',
      icon: '👤',
    },
    {
      value: 'has_team',
      label: 'Tengo un equipo de marketing y ventas que se encarga de estas tareas',
      icon: '👥',
    },
    {
      value: 'uses_agencies',
      label: 'Trabajo con agencias o freelancers externos para el marketing',
      icon: '🏢',
    },
  ],
  validation: [{ type: 'required', message: 'Necesitamos saber tu rol para calcular correctamente el impacto del sistema.' }],
  icpLayer: 'economic',
  systemOutput: 'Calibra la tasa horaria en la calculadora de oportunidad',
  icpScoreWeight: 0,
},

{
  id: 'weekly_time_marketing',
  step: 4,
  block: 'F',
  type: 'radio_cards',
  label: '¿Cuánto tiempo estimas que pasa tu negocio a la semana creando contenido, prospectando leads por WhatsApp y otras tareas manuales de marketing?',
  options: [
    { value: 'less_2hrs', label: 'Menos de 2 horas/semana', description: 'Prácticamente nada' },
    { value: '2_5hrs', label: '2 a 5 horas/semana', description: 'Algo de tiempo' },
    { value: '5_10hrs', label: '5 a 10 horas/semana', description: 'Una parte importante de mi semana' },
    { value: 'more_10hrs', label: 'Más de 10 horas/semana', description: 'Es una actividad constante' },
  ],
  validation: [{ type: 'required', message: 'Esta pregunta define el costo de oportunidad de tu tiempo.' }],
  icpLayer: 'economic',
  systemOutput: 'Componente 1 de la calculadora: costo del tiempo',
  icpScoreWeight: 0,
},

{
  id: 'lead_response_time',
  step: 4,
  block: 'F',
  type: 'radio_cards',
  label: '¿Cuánto tardan normalmente en dar una respuesta calificada a un prospecto que les escribe?',
  helperText: 'Una "respuesta calificada" es cuando alguien del equipo realmente atiende y califica al prospecto — no solo un mensaje de "recibimos tu mensaje."',
  options: [
    { value: 'under_5min', label: 'Menos de 5 minutos', description: 'Respuesta prácticamente inmediata' },
    { value: '5_30min', label: 'Entre 5 y 30 minutos', description: 'Respuesta rápida' },
    { value: '30min_2hrs', label: 'Entre 30 minutos y 2 horas', description: 'Dependemos de la disponibilidad' },
    { value: 'more_2hrs', label: 'Más de 2 horas o al día siguiente', description: 'A veces los perdemos por tiempo' },
  ],
  validation: [{ type: 'required', message: 'El tiempo de respuesta impacta directamente cuántos leads se pierden.' }],
  icpLayer: 'behavioral',
  systemOutput: 'Componente 2 de la calculadora: leads perdidos por respuesta lenta',
  icpScoreWeight: 0,
},

{
  id: 'client_value',
  step: 4,
  block: 'F',
  type: 'text',
  label: '¿Cuál es el valor estimado de un cliente nuevo para tu negocio?',
  placeholder: 'Ej: $8,500 MXN · o un rango como $5,000–$15,000',
  helperText: 'No tiene que ser exacto — un rango aproximado es suficiente. Este dato hace que el cálculo de oportunidad sea real y personalizado para tu negocio.',
  validation: [
    { type: 'required', message: 'Este dato es clave para calcular el impacto real del sistema en tu negocio.' },
  ],
  icpLayer: 'economic',
  systemOutput: 'Base del cálculo de ROI en todos los materiales y en la Calculadora de Oportunidad',
  icpScoreWeight: 0,
},

{
  id: 'product_description',
  step: 4,
  block: 'F',
  type: 'textarea',
  label: '¿Puedes describir brevemente qué vendes?',
  placeholder: 'Ej: Implantes dentales y odontología estética de alta gama. Nuestro servicio estrella es el implante en una sola cita con tecnología de guía quirúrgica digital.',
  helperText: 'Esto nos ayuda a personalizar aún más tus materiales con el nombre real de tus servicios — no descripciones genéricas.',
  validation: [],  // Completamente opcional
  icpLayer: 'descriptive',
  systemOutput: 'Reemplaza las descripciones genéricas por el nombre real del producto/servicio en todos los materiales',
  icpScoreWeight: 0,
},

{
  id: 'sale_type',
  step: 4,
  block: 'F',
  type: 'radio_cards',
  label: '¿Cómo es tu modelo de venta principalmente?',
  options: [
    { value: 'one_time', label: 'Venta única', description: 'El cliente compra una vez', icon: '1️⃣' },
    { value: 'monthly_recurring', label: 'Recurrente mensual', description: 'Cobra mensualmente', icon: '📅' },
    { value: 'annual_recurring', label: 'Recurrente anual', description: 'Cobra anualmente', icon: '📆' },
    { value: 'package_renewal', label: 'Paquete con renovación', description: 'Paquetes que se renuevan', icon: '🔄' },
    { value: 'mixed', label: 'Mixto', description: 'Combinación de los anteriores', icon: '🔀' },
  ],
  validation: [{ type: 'required', message: 'El tipo de venta define el tono de cierre de todos tus materiales.' }],
  icpLayer: 'economic',
  systemOutput: 'Define si los materiales de cierre son transaccionales o de relación a largo plazo',
  icpScoreWeight: 0,
},

{
  id: 'renewal_frequency',
  step: 4,
  block: 'F',
  type: 'radio_cards',
  label: '¿Cada cuánto tiempo renuevan o te vuelven a comprar?',
  showOnlyWhen: { field: 'sale_type', notValue: 'one_time' },  // Solo si no es venta única
  options: [
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'semiannual', label: 'Semestral' },
    { value: 'annual', label: 'Anual' },
  ],
  validation: [],  // Opcional — se muestra solo si es recurrente
  icpLayer: 'economic',
  systemOutput: 'Calcula el LTV real del cliente para el argumento de retención',
  icpScoreWeight: 0,
},

{
  id: 'monthly_new_clients',
  step: 4,
  block: 'F',
  type: 'radio_cards',
  label: '¿Cuántos clientes nuevos consigues aproximadamente al mes hoy?',
  options: [
    { value: '1_3', label: '1 a 3 clientes/mes', description: 'Volumen bajo, ticket posiblemente alto' },
    { value: '4_10', label: '4 a 10 clientes/mes', description: 'Volumen medio' },
    { value: '11_20', label: '11 a 20 clientes/mes', description: 'Volumen bueno' },
    { value: '20_plus', label: 'Más de 20 clientes/mes', description: 'Alto volumen' },
  ],
  validation: [{ type: 'required', message: 'Esta es la línea base para proyectar el impacto del sistema.' }],
  icpLayer: 'economic',
  systemOutput: 'Línea base para calcular el potencial de crecimiento adicional',
  icpScoreWeight: 0,
},

{
  id: 'acquisition_cost',
  step: 4,
  block: 'F',
  type: 'radio_cards',
  label: '¿Cuánto te cuesta aproximadamente conseguir un cliente nuevo hoy?',
  helperText: 'Suma lo que gastas en publicidad más el tiempo de tu equipo en seguimiento, dividido entre los clientes que cierras. Si no lo sabes exactamente, selecciona la opción más cercana.',
  options: [
    { value: 'under_500', label: 'Menos de $500 MXN', description: 'Principalmente orgánico o referidos' },
    { value: '500_2000', label: '$500 a $2,000 MXN', description: 'Algo de publicidad o tiempo' },
    { value: '2000_8000', label: '$2,000 a $8,000 MXN', description: 'Inversión significativa' },
    { value: 'over_8000', label: 'Más de $8,000 MXN', description: 'Ciclo de venta largo o publicidad intensiva' },
    { value: 'unknown', label: 'No lo sé exactamente', description: 'El sistema te ayudará a calcularlo' },
  ],
  validation: [],  // Opcional
  icpLayer: 'economic',
  systemOutput: 'Argumento de ROI: "Hoy te cuesta $X por cliente — con el sistema sería $Y"',
  icpScoreWeight: 0,
},

{
  id: 'gross_margin',
  step: 4,
  block: 'F',
  type: 'radio_cards',
  label: '¿Cuál es tu margen bruto aproximado por venta?',
  helperText: 'El margen bruto es lo que te queda después de los costos directos del producto o servicio (materiales, costo del servicio), antes de gastos operativos.',
  options: [
    { value: 'under_20', label: 'Menos del 20%', description: 'Márgenes ajustados — cada cliente cuenta mucho' },
    { value: '20_40', label: '20% a 40%', description: 'Margen estándar' },
    { value: '40_60', label: '40% a 60%', description: 'Buen margen' },
    { value: 'over_60', label: 'Más del 60%', description: 'Excelente margen' },
    { value: 'prefer_not_say', label: 'Prefiero no decirlo', description: '' },
  ],
  validation: [],  // Opcional
  icpLayer: 'economic',
  systemOutput: 'Calibra la agresividad del argumento de ROI según si el margen justifica la inversión',
  icpScoreWeight: 0,
},
```

---

## 6. El Componente `Step4Economics.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useWizard } from '@/hooks/useWizard'
import { calculateOpportunity } from '@/lib/utils/opportunity-calculator'
import type { BlockFAnswers } from '@/types/wizard.types'

// Radio Card reutilizable para las opciones
function RadioCard({
  value, label, description, icon, selected, onClick,
}: {
  value: string; label: string; description?: string; icon?: string
  selected: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        p-4 rounded-xl border text-left transition-all w-full
        ${selected
          ? 'border-[#2563EB] bg-[#2563EB]/10'
          : 'border-[#1E2840] bg-[#111527] hover:border-[#2A3655]'
        }
      `}
    >
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <p className={`text-sm font-semibold leading-tight mb-1 ${selected ? 'text-white' : 'text-[#C8D0E0]'}`}>
        {label}
      </p>
      {description && (
        <p className="text-xs text-[#64748B] leading-tight">{description}</p>
      )}
    </button>
  )
}

export function Step4Economics() {
  const { state, updateStep4, goNext, goPrev } = useWizard()
  const existing = state.answers.step4?.blockF

  const [answers, setAnswers] = useState<Partial<BlockFAnswers>>({
    ownerRole:               existing?.ownerRole ?? undefined,
    weeklyTimeInMarketing:   existing?.weeklyTimeInMarketing ?? undefined,
    leadResponseTime:        existing?.leadResponseTime ?? undefined,
    clientValue:             existing?.clientValue ?? '',
    clientValueNumeric:      existing?.clientValueNumeric ?? 0,
    productDescription:      existing?.productDescription ?? '',
    saleType:                existing?.saleType ?? undefined,
    renewalFrequency:        existing?.renewalFrequency ?? null,
    monthlyNewClients:       existing?.monthlyNewClients ?? undefined,
    acquisitionCost:         existing?.acquisitionCost ?? undefined,
    grossMargin:             existing?.grossMargin ?? undefined,
  })

  // Preview del cálculo en tiempo real
  const liveCalc = answers.ownerRole &&
                   answers.weeklyTimeInMarketing &&
                   answers.leadResponseTime &&
                   answers.clientValue &&
                   answers.monthlyNewClients
    ? calculateOpportunity(answers as BlockFAnswers)
    : null

  function set<K extends keyof BlockFAnswers>(key: K, val: BlockFAnswers[K]) {
    setAnswers(prev => ({ ...prev, [key]: val }))
  }

  function parseClientValue(raw: string): number {
    const clean = raw.replace(/[$,\s]/g, '').replace(/MXN|mxn/gi, '')
    if (clean.includes('-') || clean.includes('–')) {
      const parts = clean.split(/[-–]/)
      const nums = parts.map(Number).filter(n => !isNaN(n))
      return nums.length === 2 ? (nums[0] + nums[1]) / 2 : 0
    }
    return Number(clean) || 0
  }

  function handleContinue() {
    // Verificar que los campos obligatorios estén llenos
    if (!answers.ownerRole || !answers.weeklyTimeInMarketing ||
        !answers.leadResponseTime || !answers.clientValue ||
        !answers.saleType || !answers.monthlyNewClients) return

    // Actualizar el step4 con el bloque F
    updateStep4({
      ...state.answers.step4!,
      blockF: {
        ...answers,
        clientValueNumeric: parseClientValue(answers.clientValue ?? ''),
      } as BlockFAnswers,
    })
    goNext()
  }

  const canContinue = !!answers.ownerRole &&
                      !!answers.weeklyTimeInMarketing &&
                      !!answers.leadResponseTime &&
                      !!answers.clientValue?.trim() &&
                      !!answers.saleType &&
                      !!answers.monthlyNewClients

  // ── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <p className="text-xs font-mono text-[#3B82F6] tracking-widest uppercase mb-3">
          Paso 4 — Economía de tu negocio
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-bold text-white leading-tight mb-2">
          Los números que hacen<br />
          <span className="italic text-[#3B82F6]">el sistema obvio</span>
        </h1>
        <p className="text-[#64748B] text-sm leading-relaxed">
          Esta información nos permite calcular el costo real de no tener el sistema —
          en dinero, en tiempo y en clientes perdidos. Solo toma 2 minutos.
        </p>
      </div>

      <div className="space-y-8">

        {/* F1 — Rol */}
        <div>
          <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
            ¿Cuál es tu rol en el día a día? <span className="text-[#E24B4A]">*</span>
          </p>
          <div className="flex flex-col gap-2">
            {[
              { value: 'owner_operator', label: 'Soy el dueño/director y me encargo personalmente de varias áreas incluyendo operación, ventas, marketing, etc.', icon: '👤' },
              { value: 'has_team', label: 'Tengo un equipo de marketing y ventas que se encarga de estas tareas', icon: '👥' },
              { value: 'uses_agencies', label: 'Trabajo con agencias o freelancers externos para el marketing', icon: '🏢' },
            ].map(opt => (
              <RadioCard
                key={opt.value}
                {...opt}
                selected={answers.ownerRole === opt.value}
                onClick={() => set('ownerRole', opt.value as any)}
              />
            ))}
          </div>
        </div>

        {/* F2 — Tiempo en marketing */}
        <div>
          <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
            ¿Cuánto tiempo a la semana en marketing manual? <span className="text-[#E24B4A]">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'less_2hrs', label: 'Menos de 2 hrs/semana' },
              { value: '2_5hrs', label: '2 a 5 hrs/semana' },
              { value: '5_10hrs', label: '5 a 10 hrs/semana' },
              { value: 'more_10hrs', label: 'Más de 10 hrs/semana' },
            ].map(opt => (
              <RadioCard
                key={opt.value}
                {...opt}
                selected={answers.weeklyTimeInMarketing === opt.value}
                onClick={() => set('weeklyTimeInMarketing', opt.value as any)}
              />
            ))}
          </div>
        </div>

        {/* F3 — Tiempo de respuesta */}
        <div>
          <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
            ¿Cuánto tardan en responder a un prospecto? <span className="text-[#E24B4A]">*</span>
          </p>
          <p className="text-xs text-[#64748B] mb-2">
            Respuesta calificada — alguien que realmente atiende al prospecto, no solo un mensaje automático
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'under_5min', label: 'Menos de 5 minutos' },
              { value: '5_30min', label: '5 a 30 minutos' },
              { value: '30min_2hrs', label: '30 min a 2 horas' },
              { value: 'more_2hrs', label: 'Más de 2 horas o al día siguiente' },
            ].map(opt => (
              <RadioCard
                key={opt.value}
                {...opt}
                selected={answers.leadResponseTime === opt.value}
                onClick={() => set('leadResponseTime', opt.value as any)}
              />
            ))}
          </div>
        </div>

        {/* F4 — Valor del cliente */}
        <div>
          <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
            ¿Cuánto vale aproximadamente un cliente nuevo para tu negocio? <span className="text-[#E24B4A]">*</span>
          </p>
          <p className="text-xs text-[#64748B] mb-2">
            Puede ser un rango. Este número hace que el cálculo sea real — no genérico.
          </p>
          <input
            type="text"
            value={answers.clientValue}
            onChange={e => set('clientValue', e.target.value)}
            placeholder="Ej: $8,500 MXN  ·  o un rango como $5,000 – $15,000"
            className="w-full bg-[#18203A] border border-[#2A3655] rounded-xl px-4 py-3
                      text-white placeholder:text-[#64748B] focus:outline-none
                      focus:border-[#3B82F6] transition-colors text-sm"
          />
        </div>

        {/* F5 — Descripción del producto (opcional) */}
        <div>
          <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
            ¿Qué vendes exactamente?{' '}
            <span className="text-[#64748B] font-normal">(opcional — mejora la personalización)</span>
          </p>
          <textarea
            value={answers.productDescription}
            onChange={e => set('productDescription', e.target.value)}
            rows={2}
            placeholder="Ej: Implantes dentales y odontología estética de alta gama. Nuestro servicio estrella es el implante en una sola cita con guía quirúrgica digital."
            className="w-full bg-[#18203A] border border-[#2A3655] rounded-xl px-4 py-3
                      text-white placeholder:text-[#64748B] focus:outline-none
                      focus:border-[#3B82F6] transition-colors text-sm resize-none"
          />
        </div>

        {/* F6 — Tipo de venta */}
        <div>
          <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
            ¿Cómo es tu modelo de venta? <span className="text-[#E24B4A]">*</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { value: 'one_time', label: 'Venta única', icon: '1️⃣' },
              { value: 'monthly_recurring', label: 'Recurrente mensual', icon: '📅' },
              { value: 'annual_recurring', label: 'Recurrente anual', icon: '📆' },
              { value: 'package_renewal', label: 'Paquete con renovación', icon: '🔄' },
              { value: 'mixed', label: 'Mixto', icon: '🔀' },
            ].map(opt => (
              <RadioCard
                key={opt.value}
                {...opt}
                selected={answers.saleType === opt.value}
                onClick={() => set('saleType', opt.value as any)}
              />
            ))}
          </div>
        </div>

        {/* F7 — Frecuencia de renovación (solo si es recurrente) */}
        {answers.saleType && answers.saleType !== 'one_time' && (
          <div>
            <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
              ¿Cada cuánto tiempo renuevan o te vuelven a comprar?
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensual' },
                { value: 'quarterly', label: 'Trimestral' },
                { value: 'semiannual', label: 'Semestral' },
                { value: 'annual', label: 'Anual' },
              ].map(opt => (
                <RadioCard
                  key={opt.value}
                  {...opt}
                  selected={answers.renewalFrequency === opt.value}
                  onClick={() => set('renewalFrequency', opt.value as any)}
                />
              ))}
            </div>
          </div>
        )}

        {/* F8 — Clientes nuevos por mes */}
        <div>
          <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
            ¿Cuántos clientes nuevos consigues al mes hoy? <span className="text-[#E24B4A]">*</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: '1_3', label: '1 a 3/mes' },
              { value: '4_10', label: '4 a 10/mes' },
              { value: '11_20', label: '11 a 20/mes' },
              { value: '20_plus', label: 'Más de 20/mes' },
            ].map(opt => (
              <RadioCard
                key={opt.value}
                {...opt}
                selected={answers.monthlyNewClients === opt.value}
                onClick={() => set('monthlyNewClients', opt.value as any)}
              />
            ))}
          </div>
        </div>

        {/* F9 — Costo de adquisición (opcional) */}
        <div>
          <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
            ¿Cuánto te cuesta conseguir un cliente nuevo hoy?{' '}
            <span className="text-[#64748B] font-normal">(opcional)</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { value: 'under_500', label: 'Menos de $500 MXN' },
              { value: '500_2000', label: '$500 a $2,000 MXN' },
              { value: '2000_8000', label: '$2,000 a $8,000 MXN' },
              { value: 'over_8000', label: 'Más de $8,000 MXN' },
              { value: 'unknown', label: 'No lo sé exactamente' },
            ].map(opt => (
              <RadioCard
                key={opt.value}
                {...opt}
                selected={answers.acquisitionCost === opt.value}
                onClick={() => set('acquisitionCost', opt.value as any)}
              />
            ))}
          </div>
        </div>

        {/* F10 — Margen bruto (opcional) */}
        <div>
          <p className="text-sm font-semibold text-[#C8D0E0] mb-1">
            ¿Cuál es tu margen bruto aproximado?{' '}
            <span className="text-[#64748B] font-normal">(opcional)</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { value: 'under_20', label: 'Menos del 20%' },
              { value: '20_40', label: '20% a 40%' },
              { value: '40_60', label: '40% a 60%' },
              { value: 'over_60', label: 'Más del 60%' },
              { value: 'prefer_not_say', label: 'Prefiero no decirlo' },
            ].map(opt => (
              <RadioCard
                key={opt.value}
                {...opt}
                selected={answers.grossMargin === opt.value}
                onClick={() => set('grossMargin', opt.value as any)}
              />
            ))}
          </div>
        </div>

        {/* Preview del cálculo en tiempo real */}
        {liveCalc && (
          <div className="bg-[#0A1218] border border-[#0EA5A0]/30 rounded-2xl p-5">
            <p className="text-xs font-mono text-[#0EA5A0] uppercase tracking-widest mb-3">
              Calculando tu costo de oportunidad...
            </p>
            <p className="text-2xl font-bold text-white font-['Fraunces'] mb-2">
              ${liveCalc.totalMonthlyOpportunityCost.toLocaleString('es-MX')} MXN/mes
            </p>
            <p className="text-sm text-[#64748B] leading-relaxed">
              {liveCalc.personalizedMessage}
            </p>
          </div>
        )}

      </div>

      {/* Navegación */}
      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={goPrev}
          className="px-6 py-3 rounded-xl border border-[#2A3655] text-[#C8D0E0]
                    hover:text-white hover:border-[#3B82F6] transition-all text-sm font-medium"
        >
          ← Atrás
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex-1 py-3 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white
                    font-semibold transition-all text-sm shadow-lg shadow-blue-500/20
                    disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
      {!canContinue && (
        <p className="text-xs text-[#64748B] text-center mt-2">
          * Los campos marcados son requeridos para continuar
        </p>
      )}
    </div>
  )
}
```

---

## 7. La Calculadora de Oportunidad — `lib/utils/opportunity-calculator.ts`

```typescript
import type { BlockFAnswers, OpportunityCalculation } from '@/types/wizard.types'

// ── TABLAS DE CONVERSIÓN ───────────────────────────────────────────────────

const HOURS_PER_WEEK: Record<string, { min: number; mid: number; max: number }> = {
  less_2hrs:  { min: 0.5,  mid: 1,    max: 2   },
  '2_5hrs':   { min: 2,    mid: 3.5,  max: 5   },
  '5_10hrs':  { min: 5,    mid: 7.5,  max: 10  },
  more_10hrs: { min: 10,   mid: 13,   max: 20  },
}

const HOURLY_RATE: Record<string, number> = {
  owner_operator: 750,    // $500–$1,000 MXN/hr (midpoint)
  has_team:       350,    // $250–$450 MXN/hr (empleado de marketing mid)
  uses_agencies:  200,    // Costo de coordinación + overhead
}

const LEAD_LOSS_RATE: Record<string, number> = {
  under_5min:  0.05,   // 5% de leads perdidos — respuesta excelente
  '5_30min':   0.15,   // 15% — bueno pero mejorable
  '30min_2hrs': 0.50,  // 50% — punto de inflexión (dato de industria)
  more_2hrs:   0.70,   // 70% — crítico
}

const CLIENTS_PER_MONTH: Record<string, { min: number; mid: number; max: number }> = {
  '1_3':    { min: 1, mid: 2,  max: 3  },
  '4_10':   { min: 4, mid: 7,  max: 10 },
  '11_20':  { min: 11, mid: 15, max: 20 },
  '20_plus':{ min: 20, mid: 25, max: 35 },
}

const GROWTH_POTENTIAL: Record<string, number> = {
  '1_3':    0.50,    // 50% de crecimiento — mucho espacio
  '4_10':   0.38,    // 38% — espacio significativo
  '11_20':  0.25,    // 25% — buen espacio
  '20_plus': 0.15,   // 15% — negocio maduro, optimización de CAC
}

// ── FUNCIÓN PRINCIPAL ──────────────────────────────────────────────────────

export function calculateOpportunity(f: BlockFAnswers): OpportunityCalculation {
  const clientValue  = f.clientValueNumeric || parseClientValue(f.clientValue)
  const hoursPerWeek = HOURS_PER_WEEK[f.weeklyTimeInMarketing]?.mid ?? 3.5
  const hourlyRate   = HOURLY_RATE[f.ownerRole] ?? 500
  const leadLossRate = LEAD_LOSS_RATE[f.leadResponseTime] ?? 0.30
  const clientsMid   = CLIENTS_PER_MONTH[f.monthlyNewClients]?.mid ?? 5
  const growthRate   = GROWTH_POTENTIAL[f.monthlyNewClients] ?? 0.30

  // ── COMPONENTE 1: Costo del tiempo ──────────────────────────────────────
  const timeCostHours   = hoursPerWeek * 4       // horas/mes
  const timeCostMonthly = timeCostHours * hourlyRate

  // ── COMPONENTE 2: Leads perdidos por respuesta lenta ────────────────────
  // Asumimos ~2 leads por cliente cerrado (tasa de cierre ~50%)
  const totalLeadsPerMonth = clientsMid * 2
  const leadsLostMonthly   = Math.round(totalLeadsPerMonth * leadLossRate)
  const leadsLostRevenue   = leadsLostMonthly * clientValue

  // ── COMPONENTE 3: Potencial de crecimiento no capturado ─────────────────
  const growthPotentialMonthly = clientsMid * growthRate * clientValue

  // ── TOTAL ────────────────────────────────────────────────────────────────
  const total  = timeCostMonthly + leadsLostRevenue + growthPotentialMonthly
  const annual = total * 12

  // ── LTV ESTIMADO ─────────────────────────────────────────────────────────
  const ltvMultiplier = getLTVMultiplier(f.saleType, f.renewalFrequency)
  const estimatedLTV  = clientValue * ltvMultiplier

  // ── EL MENSAJE PERSONALIZADO ─────────────────────────────────────────────
  const message = buildPersonalizedMessage({
    f,
    timeCostMonthly,
    timeCostHours,
    hourlyRate,
    leadsLostMonthly,
    leadLossRate,
    leadsLostRevenue,
    growthPotentialMonthly,
    total,
    clientValue,
    clientsMid,
  })

  return {
    timeCostMonthly:             Math.round(timeCostMonthly),
    timeCostHours:               Math.round(timeCostHours),
    timeCostHourlyRate:          hourlyRate,
    leadsLostMonthly,
    leadsLostRevenue:            Math.round(leadsLostRevenue),
    growthPotentialMonthly:      Math.round(growthPotentialMonthly),
    totalMonthlyOpportunityCost: Math.round(total),
    totalAnnualOpportunityCost:  Math.round(annual),
    personalizedMessage:         message,
    highlightedStat:             `$${Math.round(total).toLocaleString('es-MX')} MXN/mes`,
    estimatedLTV:                Math.round(estimatedLTV),
  }
}

// ── FUNCIÓN DE MENSAJE ────────────────────────────────────────────────────

function buildPersonalizedMessage(params: {
  f: BlockFAnswers
  timeCostMonthly: number
  timeCostHours: number
  hourlyRate: number
  leadsLostMonthly: number
  leadLossRate: number
  leadsLostRevenue: number
  growthPotentialMonthly: number
  total: number
  clientValue: number
  clientsMid: number
}): string {
  const {
    f, timeCostMonthly, timeCostHours, hourlyRate,
    leadsLostMonthly, leadLossRate, leadsLostRevenue,
    growthPotentialMonthly, total, clientValue, clientsMid,
  } = params

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-MX')}`
  const pct  = Math.round(leadLossRate * 100)
  const hoursDisplay = `${Math.round(timeCostHours)} horas al mes`

  // Sección 1 — Tiempo
  let part1 = ''
  if (f.ownerRole === 'owner_operator') {
    part1 = `Tú personalmente inviertes aproximadamente ${hoursDisplay} en tareas de marketing, prospección y seguimiento manual. Como dueño/director, tu tiempo vale alrededor de ${fmt(hourlyRate)} MXN la hora — lo que significa que estás invirtiendo ${fmt(timeCostMonthly)} MXN al mes de tu propio tiempo en operaciones que un sistema automatizado puede hacer por ti.`
  } else if (f.ownerRole === 'has_team') {
    part1 = `Tu equipo invierte aproximadamente ${hoursDisplay} en tareas de marketing y prospección manual. A un costo de ${fmt(hourlyRate)} MXN/hr en salario y carga laboral, eso representa ${fmt(timeCostMonthly)} MXN al mes en horas que el sistema puede liberar para actividades de mayor valor.`
  } else {
    part1 = `La coordinación con tus agencias y freelancers, más el tiempo interno de supervisión, representa aproximadamente ${fmt(timeCostMonthly)} MXN al mes en recursos de tiempo que el sistema puede optimizar.`
  }

  // Sección 2 — Leads perdidos
  let part2 = ''
  if (f.leadResponseTime === '30min_2hrs' || f.leadResponseTime === 'more_2hrs') {
    const timeLabel = f.leadResponseTime === '30min_2hrs'
      ? 'entre 30 minutos y 2 horas'
      : 'más de 2 horas'
    part2 = `Tus prospectos reciben respuesta calificada después de ${timeLabel}. Los estudios de comportamiento del consumidor en México muestran que tardando más de 30 minutos se pierde hasta el ${pct}% de los leads antes de que se enfríen o vayan con la competencia. Con tu ticket de ${fmt(clientValue)} MXN, eso son aproximadamente ${leadsLostMonthly} clientes potenciales y ${fmt(leadsLostRevenue)} MXN al mes que no cierran por tiempo de respuesta.`
  } else {
    part2 = `Tu tiempo de respuesta es bueno. Aun así, el sistema puede llevar esa respuesta de minutos a segundos para el ${pct}% de consultas que llegan fuera de horario o cuando el equipo está ocupado — protegiendo ${fmt(leadsLostRevenue)} MXN adicionales al mes.`
  }

  // Sección 3 — Potencial de crecimiento
  const addClients = Math.round(clientsMid * GROWTH_POTENTIAL[f.monthlyNewClients ?? '4_10'])
  const part3 = `Con un sistema de prospección activo, tu negocio tiene potencial de agregar ${addClients} clientes adicionales por mes en los primeros 90 días — lo que representa ${fmt(growthPotentialMonthly)} MXN adicionales mensuales que hoy no están entrando.`

  // Total
  const totalMsg = `Tu costo total de no tener infraestructura de crecimiento activa es de aproximadamente ${fmt(total)} MXN al mes — o ${fmt(total * 12)} MXN al año.`

  return [part1, part2, part3, totalMsg].join('\n\n')
}

// ── HELPERS ────────────────────────────────────────────────────────────────

function getLTVMultiplier(saleType?: string, renewalFrequency?: string | null): number {
  if (!saleType || saleType === 'one_time') return 1
  const renewalMap: Record<string, number> = {
    weekly:     52,
    monthly:    24,   // 2 años promedio de retención
    quarterly:  8,
    semiannual: 4,
    annual:     3,
  }
  return renewalMap[renewalFrequency ?? 'monthly'] ?? 12
}

function parseClientValue(raw: string): number {
  const clean = raw.replace(/[$,\s]/g, '').replace(/MXN|mxn/gi, '')
  if (clean.includes('-') || clean.includes('–')) {
    const parts = clean.split(/[-–]/)
    const nums = parts.map(Number).filter(n => !isNaN(n))
    return nums.length === 2 ? (nums[0] + nums[1]) / 2 : 0
  }
  return Number(clean) || 0
}
```

---

## 8. Integrar el Bloque F al flujo del Wizard

### Actualizar `app/(app)/wizard/step/[step]/page.tsx`

El Bloque F se agrega como **segunda pantalla del Paso 4**. Para no agregar un 6to step
que rompa la barra de progreso, se maneja como una sub-sección dentro del Step 4 con
un estado local `showBlockF`:

```typescript
// En WizardShell.tsx — actualizar el STEP_COMPONENTS:
// El paso 4 ahora tiene dos sub-secciones manejadas internamente
// Step4Process: preguntas de diferenciación (Q10, Q11, etc.)
// Step4Economics: Bloque F
// La transición entre ellas es interna al componente Step4Process
```

### Actualizar `components/wizard/steps/Step4Process.tsx`

```typescript
// Al final de Step4Process, en lugar de llamar goNext() directamente,
// mostrar el sub-componente Step4Economics:

const [showEconomics, setShowEconomics] = useState(false)

// En el handleSubmit de Step4Process:
function onSubmit(data: FormData) {
  updateStep4({ ...data })
  setShowEconomics(true)   // mostrar Bloque F en lugar de ir al siguiente paso
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// En el render:
if (showEconomics) {
  return <Step4Economics />
}
```

---

## 9. Agregar el Cálculo al Generador de ICP

### En `lib/ai/generators.ts` — actualizar `generateICPAndOutputs()`

```typescript
// Después de generar el ICP, calcular el costo de oportunidad si hay Bloque F:

import { calculateOpportunity } from '@/lib/utils/opportunity-calculator'

// Al final de generateICPAndOutputs():
const blockF = wizardAnswers.step4?.blockF
const opportunityCalculation = blockF
  ? calculateOpportunity({
      ...blockF,
      clientValueNumeric: blockF.clientValueNumeric || parseClientValue(blockF.clientValue),
    })
  : null

return {
  ...parsed,
  icpCard: { ...parsed.icpCard, version: 1, icpScore, ... },
  pitchDeckStructure: pitchDeck,
  botPrompt,
  opportunityCalculation,    // ← NUEVO
}
```

---

## 10. Ejemplo del Mensaje Generado

Con las respuestas del ejemplo de la clínica dental:

```
INPUTS:
ownerRole:             owner_operator
weeklyTimeInMarketing: 5_10hrs
leadResponseTime:      30min_2hrs
clientValue:           "$28,500"
monthlyNewClients:     4_10
saleType:              one_time

OUTPUT GENERADO AUTOMÁTICAMENTE:

"Tú personalmente inviertes aproximadamente 30 horas al mes en tareas de marketing,
prospección y seguimiento manual. Como dueño/director, tu tiempo vale alrededor de
$750 MXN la hora — lo que significa que estás invirtiendo $22,500 MXN al mes de tu
propio tiempo en operaciones que un sistema automatizado puede hacer por ti.

Tus prospectos reciben respuesta calificada entre 30 minutos y 2 horas. Los estudios
de comportamiento del consumidor en México muestran que tardando más de 30 minutos
se pierde hasta el 50% de los leads antes de que se enfríen o vayan con la
competencia. Con tu ticket de $28,500 MXN, eso son aproximadamente 7 clientes
potenciales y $199,500 MXN al mes que no cierran por tiempo de respuesta.

Con un sistema de prospección activo, tu negocio tiene potencial de agregar 3
clientes adicionales por mes en los primeros 90 días — lo que representa $85,500 MXN
adicionales mensuales que hoy no están entrando.

Tu costo total de no tener infraestructura de crecimiento activa es de
aproximadamente $307,500 MXN al mes — o $3,690,000 MXN al año."

HIGHLIGHTED STAT: "$307,500 MXN/mes"
```

---

## 11. Actualizar el Wizard Spec — Orden de Implementación para Bloque F

```
1. Agregar los tipos a types/wizard.types.ts (Sección 2 y 3 de este doc)
2. Copiar opportunity-calculator.ts a lib/utils/
3. Copiar Step4Economics.tsx a components/wizard/steps/
4. Actualizar Step4Process.tsx para mostrar Step4Economics al completarse
5. Actualizar generators.ts para incluir opportunityCalculation en el output
6. Actualizar la ICP Card y el WOW Document para incluir la calculadora de oportunidad
7. Probar con datos del ejemplo dental y verificar que el mensaje se genere correctamente
```
