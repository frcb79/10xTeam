# 10xTeam Wizard — Especificación Técnica
## Parte 3 de 5: Pantallas, Componentes y Lógica de UI

> **Cómo usar esta parte:**
> Sube Partes 1 y 2 primero como contexto, luego agrega esta.
> Prompt sugerido: *"Tengo el spec completo en 3 partes. Esta Parte 3 tiene todas las
> pantallas del wizard. Quiero implementar [componente específico]. Usa las Partes 1 y 2
> como referencia de tipos, config y state management."*

---

## Correcciones aplicadas de la sesión anterior

Antes de implementar cualquier componente, confirmar que estos cambios están aplicados:

```
✓ useWizard.ts  →  renombrado a useWizard.tsx
✓ Step4Answers  →  campo uniqueMechanism eliminado
✓ wizard.config →  main_pain / cost_of_inaction / main_outcome tienen block: 'B_common'
✓ .env.local    →  AI_DEV_MODE=true, GHL_MOCK_MODE=true, GOOGLE_AI_API_KEY=tu_key
```

---

## 1. Layout del Wizard

### `app/(app)/wizard/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { WizardProvider } from '@/hooks/useWizard'

export const metadata: Metadata = {
  title: '10xTeam — Configurando tu sistema',
  description: 'Define tu cliente ideal y activa tu sistema de ventas automatizado.',
}

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WizardProvider>
      {/* Sin sidebar — el wizard es pantalla completa */}
      <div className="min-h-screen bg-[#060810]">
        {children}
      </div>
    </WizardProvider>
  )
}
```

---

### `app/(app)/wizard/step/[step]/page.tsx`

```tsx
import { redirect } from 'next/navigation'
import { WizardShell } from '@/components/wizard/WizardShell'

interface Props {
  params: Promise<{ step: string }>
}

export default async function WizardStepPage({ params }: Props) {
  const { step } = await params
  const stepNum = parseInt(step)

  // Validar que el step sea válido
  if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
    redirect('/wizard/step/1')
  }

  return <WizardShell initialStep={stepNum as 1 | 2 | 3 | 4 | 5} />
}
```

---

## 2. WizardShell — El Contenedor Principal

### `components/wizard/WizardShell.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWizard } from '@/hooks/useWizard'
import { WizardProgress } from './WizardProgress'
import { Step1Entry } from './steps/Step1Entry'
import { Step2Business } from './steps/Step2Business'
import { Step3ICP } from './steps/Step3ICP'
import { Step4Process } from './steps/Step4Process'
import { Step5Channels } from './steps/Step5Channels'
import type { WizardStep } from '@/types/wizard.types'

interface WizardShellProps {
  initialStep: WizardStep
}

const STEP_COMPONENTS: Record<WizardStep, React.ComponentType> = {
  1: Step1Entry,
  2: Step2Business,
  3: Step3ICP,
  4: Step4Process,
  5: Step5Channels,
}

export function WizardShell({ initialStep }: WizardShellProps) {
  const router = useRouter()
  const { state, goToStep } = useWizard()

  // Sincronizar el step de la URL con el estado del wizard
  useEffect(() => {
    if (state.currentStep !== initialStep) {
      goToStep(initialStep)
    }
  }, [initialStep]) // eslint-disable-line

  // Actualizar la URL cuando cambia el step
  useEffect(() => {
    router.push(`/wizard/step/${state.currentStep}`, { scroll: false })
  }, [state.currentStep]) // eslint-disable-line

  // Redirigir a processing cuando se completa el paso 5
  useEffect(() => {
    if (state.status === 'processing') {
      router.push('/wizard/processing')
    }
    if (state.status === 'complete') {
      router.push('/wizard/complete')
    }
  }, [state.status]) // eslint-disable-line

  const CurrentStep = STEP_COMPONENTS[state.currentStep]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header con progreso */}
      <header className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl
                         border-b border-[#1E2840]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-['Fraunces'] text-lg font-bold text-white">
              10x<span className="text-[#3B82F6]">Team</span>
            </span>
            <span className="font-mono text-xs text-[#64748B]">
              Paso {state.currentStep} de 5
            </span>
          </div>
          <WizardProgress currentStep={state.currentStep} completedSteps={state.completedSteps} />
        </div>
      </header>

      {/* Contenido del step actual */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        {state.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-800/40
                         text-red-300 text-sm flex items-start gap-3">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="font-semibold mb-1">Algo salió mal</p>
              <p className="text-red-400/80">{state.error}</p>
            </div>
          </div>
        )}
        <CurrentStep />
      </main>
    </div>
  )
}
```

---

## 3. WizardProgress

### `components/wizard/WizardProgress.tsx`

```tsx
import type { WizardStep } from '@/types/wizard.types'

const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Inicio',
  2: 'Tu negocio',
  3: 'Tu cliente',
  4: 'Tu proceso',
  5: 'Canales',
}

interface WizardProgressProps {
  currentStep: WizardStep
  completedSteps: WizardStep[]
}

export function WizardProgress({ currentStep, completedSteps }: WizardProgressProps) {
  const steps: WizardStep[] = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step)
        const isCurrent = step === currentStep
        const isUpcoming = !isCompleted && !isCurrent

        return (
          <div key={step} className="flex items-center flex-1">
            {/* Círculo del step */}
            <div className="flex flex-col items-center gap-1">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center
                text-xs font-bold transition-all duration-300
                ${isCompleted
                  ? 'bg-[#0EA5A0] text-white'
                  : isCurrent
                  ? 'bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20'
                  : 'bg-[#1E2840] text-[#64748B]'
                }
              `}>
                {isCompleted ? '✓' : step}
              </div>
              <span className={`
                text-[10px] font-mono hidden sm:block whitespace-nowrap
                ${isCurrent ? 'text-[#3B82F6]' : isCompleted ? 'text-[#0EA5A0]' : 'text-[#64748B]'}
              `}>
                {STEP_LABELS[step]}
              </span>
            </div>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div className={`
                h-[2px] flex-1 mx-2 transition-all duration-500
                ${isCompleted ? 'bg-[#0EA5A0]' : 'bg-[#1E2840]'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

---

## 4. Step 1 — Entrada (URL o Manual)

### `app/api/scrape/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateWithAI } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { url, businessId } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
    }

    // Autenticar al usuario
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 1. Scraping con Jina AI Reader (gratis, sin API key)
    const jinaUrl = `https://r.jina.ai/${url}`
    const jinaResponse = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'markdown',
      },
      signal: AbortSignal.timeout(15000), // 15 segundos max
    })

    if (!jinaResponse.ok) {
      return NextResponse.json({
        error: 'No pudimos leer el sitio. ¿La URL es correcta? Puedes llenar el wizard manualmente.',
        canFallback: true,
      }, { status: 422 })
    }

    const scrapedContent = await jinaResponse.text()

    // Limitar a los primeros 6000 caracteres para no desperdiciar tokens
    const trimmedContent = scrapedContent.substring(0, 6000)

    // 2. Analizar con Claude/Gemini y extraer campos del wizard
    const analysisResult = await generateWithAI({
      task: 'scrape_analysis',
      businessId,
      systemPrompt: `Eres un experto en análisis de negocios. Tu tarea es extraer información
estructurada de contenido web para pre-llenar un formulario de perfil de cliente ideal (ICP).
Devuelve SOLO un objeto JSON válido, sin texto adicional ni markdown.`,
      userPrompt: `Analiza este contenido de sitio web y extrae la información para el ICP.

CONTENIDO DEL SITIO:
${trimmedContent}

Devuelve este JSON exactamente (sin markdown, sin backticks):
{
  "oneLiner": "descripción del negocio en una oración (quién, qué resultado, cómo)",
  "industry": "industria específica",
  "mainPain": "el problema principal que resuelven, en palabras del cliente",
  "mainOutcome": "el resultado concreto que ofrecen",
  "differentiator": "su ventaja diferencial principal",
  "confidence": {
    "oneLiner": 0.0,
    "industry": 0.0,
    "mainPain": 0.0,
    "mainOutcome": 0.0,
    "differentiator": 0.0
  }
}

Para cada campo "confidence": 0.0 si no encontraste info, 0.5 si es parcial, 1.0 si es claro.
Si no encuentras información para un campo, usa "" (string vacío).`,
      metadata: { url, userId: user.id },
    })

    // Parsear la respuesta JSON de la IA
    let prefillData: Record<string, unknown>
    try {
      prefillData = JSON.parse(analysisResult.content)
    } catch {
      // Si no se puede parsear, devolver vacío
      prefillData = {
        oneLiner: '', industry: '', mainPain: '', mainOutcome: '', differentiator: '',
        confidence: { oneLiner: 0, industry: 0, mainPain: 0, mainOutcome: 0, differentiator: 0 },
      }
    }

    return NextResponse.json({
      success: true,
      prefill: prefillData,
      scrapedContent: trimmedContent,
      usage: analysisResult.usage,
    })

  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({
      error: 'Error al analizar el sitio. Puedes llenar el wizard manualmente.',
      canFallback: true,
    }, { status: 500 })
  }
}
```

---

### `components/wizard/steps/Step1Entry.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useWizard } from '@/hooks/useWizard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Step1Entry() {
  const { state, goNext, setWebsiteUrl, setScrapedContent, setError } = useWizard()
  const [url, setUrl] = useState(state.websiteUrl ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [scrapePhase, setScrapePhase] = useState<
    'idle' | 'reading' | 'analyzing' | 'done' | 'error'
  >('idle')

  // Obtener el businessId desde Supabase (simplificado — usar hook de auth)
  const businessId = 'temp-id' // TODO: reemplazar con el ID real del negocio

  async function handleScrape() {
    if (!url.trim()) return

    setIsLoading(true)
    setScrapePhase('reading')
    setError('')

    try {
      setScrapePhase('analyzing')

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), businessId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setScrapePhase('error')
        // Permitir continuar manualmente aunque falle el scraping
        return
      }

      setScrapePhase('done')
      setWebsiteUrl(url.trim())
      setScrapedContent(data.scrapedContent, data.prefill?.confidence ?? null)

      // Guardar el prefill en sessionStorage para que Step2 lo lea
      sessionStorage.setItem('wizard_prefill', JSON.stringify(data.prefill))

      // Avanzar al siguiente paso después de 800ms para que el usuario vea el éxito
      setTimeout(() => {
        goNext()
      }, 800)

    } catch {
      setScrapePhase('error')
    } finally {
      setIsLoading(false)
    }
  }

  function handleManual() {
    goNext()
  }

  const PHASE_MESSAGES = {
    idle: '',
    reading: 'Leyendo tu sitio web...',
    analyzing: 'Analizando el contenido con IA...',
    done: '¡Listo! Pre-llenando el formulario...',
    error: 'No pudimos leer el sitio.',
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Headline */}
      <div className="mb-8">
        <p className="text-xs font-mono text-[#3B82F6] tracking-widest uppercase mb-3">
          Paso 1 — Punto de partida
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-bold text-white leading-tight mb-3">
          Empecemos con<br />
          <span className="italic text-[#3B82F6]">tu negocio</span>
        </h1>
        <p className="text-[#64748B] text-base leading-relaxed">
          Si tienes un sitio web, la IA lo analiza y pre-llena automáticamente
          el 70% del formulario. Tú solo revisas y corriges.
        </p>
      </div>

      {/* Opción A: URL */}
      <div className="bg-[#111527] border border-[#1E2840] rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌐</span>
          <h2 className="text-white font-semibold">Analizar mi sitio web</h2>
          <span className="ml-auto text-xs font-mono bg-[#0EA5A0]/15 text-[#0EA5A0]
                          border border-[#0EA5A0]/30 px-2 py-0.5 rounded-full">
            Recomendado
          </span>
        </div>

        <div className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://tunegocio.com"
            className="flex-1 bg-[#18203A] border-[#2A3655] text-white
                      placeholder:text-[#64748B] focus:border-[#3B82F6]"
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleScrape()}
            disabled={isLoading}
          />
          <Button
            onClick={handleScrape}
            disabled={isLoading || !url.trim()}
            className="bg-[#2563EB] hover:bg-[#3B82F6] text-white px-6
                      shadow-lg shadow-blue-500/20"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Analizando
              </span>
            ) : (
              'Analizar →'
            )}
          </Button>
        </div>

        {/* Estado del scraping */}
        {scrapePhase !== 'idle' && (
          <div className={`
            mt-4 p-3 rounded-xl text-sm flex items-center gap-3
            ${scrapePhase === 'done'
              ? 'bg-[#0EA5A0]/10 border border-[#0EA5A0]/25 text-[#5EEAD4]'
              : scrapePhase === 'error'
              ? 'bg-red-950/30 border border-red-800/40 text-red-300'
              : 'bg-[#1E2840] border border-[#2A3655] text-[#C8D0E0]'
            }
          `}>
            {(scrapePhase === 'reading' || scrapePhase === 'analyzing') && (
              <Spinner size="sm" />
            )}
            {scrapePhase === 'done' && <span>✓</span>}
            {scrapePhase === 'error' && <span>⚠️</span>}
            <span>{PHASE_MESSAGES[scrapePhase]}</span>
          </div>
        )}

        {/* Opción de PDF */}
        <p className="mt-3 text-xs text-[#64748B]">
          ¿No tienes sitio web?{' '}
          <span className="text-[#3B82F6] cursor-pointer hover:underline">
            Sube un documento PDF
          </span>{' '}
          con información de tu negocio.
        </p>
      </div>

      {/* Separador */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#1E2840]" />
        <span className="text-xs text-[#64748B] font-mono">o</span>
        <div className="flex-1 h-px bg-[#1E2840]" />
      </div>

      {/* Opción B: Manual */}
      <button
        onClick={handleManual}
        className="w-full bg-transparent border border-[#1E2840] rounded-2xl p-5
                  text-left hover:border-[#2A3655] transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">✏️</span>
          <div>
            <p className="text-white font-medium group-hover:text-[#3B82F6] transition-colors">
              Llenar manualmente
            </p>
            <p className="text-[#64748B] text-sm">
              Completo el formulario yo mismo — tardará unos minutos más
            </p>
          </div>
          <span className="ml-auto text-[#2A3655] group-hover:text-[#3B82F6]
                          transition-colors text-lg">
            →
          </span>
        </div>
      </button>
    </div>
  )
}

function Spinner({ size = 'default' }: { size?: 'sm' | 'default' }) {
  return (
    <div className={`
      border-2 border-t-transparent rounded-full animate-spin
      ${size === 'sm' ? 'w-3 h-3 border-current' : 'w-4 h-4 border-white'}
    `} />
  )
}
```

---

## 5. Step 2 — El Negocio

### `components/wizard/steps/Step2Business.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWizard } from '@/hooks/useWizard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { WIZARD_QUESTIONS, GENERIC_WORDS } from '@/config/wizard.config'
import type { Step2Answers, ICPType } from '@/types/wizard.types'

// Las opciones de industria y de tipo de ICP se definen aquí para no
// mezclar UI con config (wizard.config solo tiene la metadata de las preguntas)
const INDUSTRY_OPTIONS = [
  { value: 'salud_odontologia', label: '🦷 Salud — Odontología' },
  { value: 'salud_medicina', label: '🏥 Salud — Medicina General / Especialidades' },
  { value: 'salud_bienestar', label: '💪 Salud — Bienestar, Nutrición, Fitness' },
  { value: 'inmobiliaria', label: '🏠 Inmobiliaria y Construcción' },
  { value: 'educacion', label: '📚 Educación y Capacitación' },
  { value: 'legal', label: '⚖️ Legal — Despachos Jurídicos' },
  { value: 'financiero', label: '💰 Financiero — Seguros, Inversiones, Crédito' },
  { value: 'consultoria', label: '📊 Consultoría y Servicios Profesionales' },
  { value: 'tecnologia', label: '💻 Tecnología y Software' },
  { value: 'restaurantes', label: '🍽️ Restaurantes y Alimentos' },
  { value: 'retail', label: '🛍️ Retail y Comercio' },
  { value: 'manufactura', label: '🏭 Manufactura e Industria' },
  { value: 'marketing_agencia', label: '📱 Marketing y Agencias Digitales' },
  { value: 'ecommerce', label: '🛒 E-commerce y Ventas en Línea' },
  { value: 'otro', label: '⚙️ Otro' },
]

const ICP_TYPE_OPTIONS: {
  value: ICPType
  label: string
  description: string
  icon: string
}[] = [
  { value: 'b2b', label: 'Empresas (B2B)', description: 'Vendes a negocios o equipos', icon: '🏢' },
  { value: 'b2c', label: 'Personas (B2C)', description: 'Vendes a consumidores individuales', icon: '👤' },
  { value: 'mixed', label: 'Ambos', description: 'Empresas y personas', icon: '🔀' },
  { value: 'freelancer', label: 'Profesional / Solopreneur', description: 'Tu cliente es un independiente', icon: '🧑‍💼' },
]

const schema = z.object({
  businessName: z.string().min(2, 'Ingresa el nombre de tu negocio'),
  oneLiner: z.string()
    .min(20, 'Necesitamos al menos 20 caracteres para una descripción útil')
    .refine((val) => {
      const lower = val.toLowerCase()
      return !GENERIC_WORDS.some(w => lower.includes(w))
    }, 'Evita palabras genéricas como "calidad", "excelencia" o "solución integral". Sé más específico.'),
  industry: z.string().min(1, 'Selecciona tu industria'),
  icpType: z.enum(['b2b', 'b2c', 'mixed', 'freelancer'] as const, {
    required_error: 'Selecciona a quién le vendes',
  }),
})

type FormData = z.infer<typeof schema>

export function Step2Business() {
  const { state, updateStep2, goNext, goPrev } = useWizard()
  const [wordCount, setWordCount] = useState(0)

  // Leer prefill del sessionStorage (viene del scraping del Step 1)
  const prefill = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('wizard_prefill') ?? '{}')
    : {}

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: state.answers.step2?.businessName ?? '',
      oneLiner: state.answers.step2?.oneLiner ?? prefill.oneLiner ?? '',
      industry: state.answers.step2?.industry ?? prefill.industry ?? '',
      icpType: state.answers.step2?.icpType ?? undefined,
    },
  })

  const oneLinerValue = watch('oneLiner')
  const icpTypeValue = watch('icpType')

  useEffect(() => {
    setWordCount(oneLinerValue?.split(/\s+/).filter(Boolean).length ?? 0)
  }, [oneLinerValue])

  function onSubmit(data: FormData) {
    updateStep2({
      businessName: data.businessName,
      oneLiner: data.oneLiner,
      industry: data.industry,
      industrySubcategory: '',
      icpType: data.icpType,
    })
    goNext()
  }

  // Indicador de prefill (campo fue auto-llenado por scraping)
  const wasPrefilled = (key: keyof typeof prefill) =>
    prefill[key] && (prefill.confidence?.[key] ?? 0) > 0.3

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in duration-300">
      <div className="mb-8">
        <p className="text-xs font-mono text-[#3B82F6] tracking-widest uppercase mb-3">
          Paso 2 — Tu negocio
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-bold text-white leading-tight mb-3">
          Cuéntanos sobre<br />
          <span className="italic text-[#3B82F6]">tu negocio</span>
        </h1>
        {state.scrapedContent && (
          <div className="flex items-center gap-2 text-sm text-[#5EEAD4]
                         bg-[#0EA5A0]/10 border border-[#0EA5A0]/25
                         rounded-xl px-4 py-2 w-fit">
            <span>✓</span>
            <span>Analizamos tu sitio y pre-llenamos lo que pudimos. Revisa y corrige.</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Nombre del negocio */}
        <div>
          <FieldLabel required>Nombre de tu negocio</FieldLabel>
          <input
            {...register('businessName')}
            placeholder="Ej: Clínica Dental Sonrisa Plus"
            className="w-full bg-[#18203A] border border-[#2A3655] rounded-xl px-4 py-3
                      text-white placeholder:text-[#64748B] focus:outline-none
                      focus:border-[#3B82F6] transition-colors"
          />
          {errors.businessName && <FieldError>{errors.businessName.message}</FieldError>}
        </div>

        {/* One-liner */}
        <div>
          <FieldLabel required info="Incluye: ¿A quién ayudas? ¿Con qué resultado? ¿Cómo?">
            ¿Qué hace tu negocio en una oración?
            {wasPrefilled('oneLiner') && <PrefillBadge />}
          </FieldLabel>
          <Textarea
            {...register('oneLiner')}
            rows={3}
            placeholder="Ej: Ayudamos a clínicas dentales en CDMX a llenar su agenda con pacientes calificados usando un sistema automatizado de seguimiento por WhatsApp."
            className="bg-[#18203A] border-[#2A3655] text-white placeholder:text-[#64748B]
                      focus:border-[#3B82F6] resize-none"
          />
          <div className="flex justify-between mt-1">
            {errors.oneLiner
              ? <FieldError>{errors.oneLiner.message}</FieldError>
              : <span className="text-xs text-[#64748B]">
                  Incluye: quién, qué resultado y cómo lo logras
                </span>
            }
            <span className={`text-xs font-mono ${
              wordCount < 10 ? 'text-[#64748B]' : wordCount < 20 ? 'text-[#F59E0B]' : 'text-[#0EA5A0]'
            }`}>
              {wordCount} palabras
            </span>
          </div>
        </div>

        {/* Industria */}
        <div>
          <FieldLabel required>
            Industria o sector
            {wasPrefilled('industry') && <PrefillBadge />}
          </FieldLabel>
          <Select
            defaultValue={state.answers.step2?.industry ?? prefill.industry}
            onValueChange={(val) => setValue('industry', val)}
          >
            <SelectTrigger className="bg-[#18203A] border-[#2A3655] text-white
                                     focus:ring-[#3B82F6] focus:border-[#3B82F6]">
              <SelectValue placeholder="Selecciona tu industria" />
            </SelectTrigger>
            <SelectContent className="bg-[#18203A] border-[#2A3655]">
              {INDUSTRY_OPTIONS.map(opt => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-[#C8D0E0] focus:bg-[#2A3655] focus:text-white"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <FieldError>{errors.industry.message}</FieldError>}
        </div>

        {/* Tipo de ICP */}
        <div>
          <FieldLabel required>¿A quién le vendes principalmente?</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            {ICP_TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('icpType', opt.value)}
                className={`
                  p-4 rounded-xl border text-left transition-all
                  ${icpTypeValue === opt.value
                    ? 'border-[#2563EB] bg-[#2563EB]/10'
                    : 'border-[#1E2840] bg-[#111527] hover:border-[#2A3655]'
                  }
                `}
              >
                <div className="text-2xl mb-2">{opt.icon}</div>
                <div className={`text-sm font-semibold mb-1 ${
                  icpTypeValue === opt.value ? 'text-white' : 'text-[#C8D0E0]'
                }`}>
                  {opt.label}
                </div>
                <div className="text-xs text-[#64748B]">{opt.description}</div>
              </button>
            ))}
          </div>
          {errors.icpType && <FieldError>{errors.icpType.message}</FieldError>}
        </div>
      </div>

      <NavigationButtons onBack={goPrev} backLabel="Atrás" showBack={false} />
    </form>
  )
}
```

---

## 6. Step 3 — El Cliente Ideal (Router)

### `components/wizard/steps/Step3ICP.tsx`

```tsx
'use client'

import { useWizard } from '@/hooks/useWizard'
import { Step3ICP_B2B } from './Step3ICP_B2B'
import { Step3ICP_B2C } from './Step3ICP_B2C'
import { Step3ICP_Mixed } from './Step3ICP_Mixed'

export function Step3ICP() {
  const { state } = useWizard()

  switch (state.icpType) {
    case 'b2c':
    case 'freelancer':
      return <Step3ICP_B2C />
    case 'mixed':
      return <Step3ICP_Mixed />
    default: // b2b y null
      return <Step3ICP_B2B />
  }
}
```

---

### `components/wizard/steps/Step3ICP_B2B.tsx`

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWizard } from '@/hooks/useWizard'
import { Textarea } from '@/components/ui/textarea'
import { ICPScoreMeter } from '../ICPScoreMeter'
import { calculateLocalICPScore } from '@/lib/utils/icp-score'
import { GENERIC_WORDS } from '@/config/wizard.config'
import type { Step3B2BAnswers } from '@/types/wizard.types'

const schema = z.object({
  primaryDecisionMaker: z.string().min(3, 'Especifica el cargo del decisor principal'),
  companySizeRange: z.enum(['1-5','6-20','21-50','51-200','201-500','500+'] as const),
  targetIndustry: z.string().optional(),
  geographyPriority: z.string().min(2, 'Indica la zona geográfica prioritaria'),
  mainPain: z.string()
    .min(30, 'Describe con más detalle — incluye las consecuencias específicas')
    .refine(val => !GENERIC_WORDS.some(w => val.toLowerCase().includes(w)),
      'El dolor está muy genérico. Descríbelo como tu cliente lo diría en voz alta.'),
  mainPainConsequences: z.string().min(10, 'Describe qué pierde concretamente'),
  costOfInaction: z.string().min(15, 'Describe las consecuencias de no resolver esto'),
  costOfInactionAmount: z.string().optional(),
  mainOutcome: z.string()
    .min(20, 'La promesa necesita ser más específica — incluye un resultado medible'),
  outcomeTimeline: z.string().min(2, 'Indica en cuánto tiempo se obtiene el resultado'),
  typicalInvestmentRange: z.string().min(5, 'Indica el rango de inversión típico'),
  budgetType: z.enum(['personal','business','both'] as const),
  decisionAuthority: z.enum(['alone','needs_approval','committee'] as const),
})

type FormData = z.infer<typeof schema>

const COMPANY_SIZES = [
  { value: '1-5', label: '1–5 empleados' },
  { value: '6-20', label: '6–20 empleados' },
  { value: '21-50', label: '21–50 empleados' },
  { value: '51-200', label: '51–200 empleados' },
  { value: '201-500', label: '201–500 empleados' },
  { value: '500+', label: '500+ empleados' },
]

export function Step3ICP_B2B() {
  const { state, updateStep3B2B, goNext, goPrev } = useWizard()
  const prefill = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('wizard_prefill') ?? '{}')
    : {}

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      primaryDecisionMaker: state.answers.step3_b2b?.primaryDecisionMaker ?? '',
      companySizeRange: state.answers.step3_b2b?.companySizeRange ?? '6-20',
      geographyPriority: state.answers.step3_b2b?.geographyPriority ?? '',
      mainPain: state.answers.step3_b2b?.mainPain ?? prefill.mainPain ?? '',
      mainPainConsequences: state.answers.step3_b2b?.mainPainConsequences ?? '',
      costOfInaction: state.answers.step3_b2b?.costOfInaction ?? '',
      costOfInactionAmount: state.answers.step3_b2b?.costOfInactionAmount ?? '',
      mainOutcome: state.answers.step3_b2b?.mainOutcome ?? prefill.mainOutcome ?? '',
      outcomeTimeline: state.answers.step3_b2b?.outcomeTimeline ?? '',
      typicalInvestmentRange: state.answers.step3_b2b?.typicalInvestmentRange ?? '',
      budgetType: state.answers.step3_b2b?.budgetType ?? 'business',
      decisionAuthority: state.answers.step3_b2b?.decisionAuthority ?? 'alone',
    },
  })

  // ICP Score en tiempo real (debounced visualmente)
  const formValues = watch()
  const liveScore = calculateLocalICPScore({
    ...state.answers,
    step3_b2b: formValues as Step3B2BAnswers,
  })

  function onSubmit(data: FormData) {
    updateStep3B2B({
      ...data,
      secondaryInfluencers: state.answers.step3_b2b?.secondaryInfluencers ?? [],
    } as Step3B2BAnswers)
    goNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in duration-300">
      <div className="mb-6">
        <p className="text-xs font-mono text-[#3B82F6] tracking-widest uppercase mb-3">
          Paso 3 — Tu cliente ideal (B2B)
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-bold text-white leading-tight mb-2">
          ¿Quién es tu<br />
          <span className="italic text-[#3B82F6]">cliente ideal?</span>
        </h1>
        <p className="text-[#64748B] text-sm">
          Cuanto más específico seas, mejores serán todos tus materiales.
        </p>
      </div>

      {/* ICP Score en tiempo real */}
      <ICPScoreMeter score={liveScore} />

      <div className="space-y-6 mt-6">

        {/* Decisor principal */}
        <div>
          <FieldLabel required info="El cargo de la persona que firma o autoriza el pago">
            ¿Quién toma la decisión de comprarte?
          </FieldLabel>
          <input
            {...register('primaryDecisionMaker')}
            placeholder="Ej: Director Comercial, Dueño del negocio"
            className={inputClass}
          />
          {errors.primaryDecisionMaker && <FieldError>{errors.primaryDecisionMaker.message}</FieldError>}
        </div>

        {/* Tamaño de empresa + Geografía */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Tamaño de empresa</FieldLabel>
            <select
              {...register('companySizeRange')}
              className={inputClass}
            >
              {COMPANY_SIZES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel required>Zona geográfica</FieldLabel>
            <input
              {...register('geographyPriority')}
              placeholder="Ej: CDMX, MTY, GDL"
              className={inputClass}
            />
          </div>
        </div>

        <Divider label="El dolor y la urgencia" />

        {/* Dolor principal ← IMPACTA EL ICP SCORE */}
        <div>
          <FieldLabel required score={25}>
            ¿Cuál es el problema más urgente que tiene tu cliente?
          </FieldLabel>
          <p className="text-xs text-[#64748B] mb-2">
            ⚡ Escríbelo como tu cliente lo diría — con sus palabras, no con vocabulario técnico
          </p>
          <Textarea
            {...register('mainPain')}
            rows={4}
            placeholder="Ej: Su agenda tiene huecos constantes, los pacientes que agendan no siempre llegan, y no tienen ningún proceso para recordarles o recuperar a los que se fueron hace meses."
            className={textareaClass}
          />
          {errors.mainPain
            ? <FieldError>{errors.mainPain.message}</FieldError>
            : <FieldHint probe="¿Cómo lo describiría cuando habla del problema con un amigo o colega?" />
          }
        </div>

        {/* Costo de inacción */}
        <div>
          <FieldLabel required>¿Qué pierde si no resuelve esto en 6 meses?</FieldLabel>
          <Textarea
            {...register('costOfInaction')}
            rows={2}
            placeholder="Ej: Sigue pagando renta y nómina con agenda al 60%. Cada mes sin sistema pierde entre $30K y $80K MXN en ingresos que ya debería tener."
            className={textareaClass}
          />
          {errors.costOfInaction && <FieldError>{errors.costOfInaction.message}</FieldError>}
        </div>

        <Divider label="La promesa" />

        {/* Resultado principal ← IMPACTA EL ICP SCORE */}
        <div>
          <FieldLabel required score={25}>
            ¿Qué resultado concreto y medible obtiene contigo?
          </FieldLabel>
          <Textarea
            {...register('mainOutcome')}
            rows={3}
            placeholder="Ej: En las primeras 4 semanas la agenda llega al 85%+ con pacientes calificados. El costo por paciente nuevo baja de $800 a menos de $200 MXN."
            className={textareaClass}
          />
          {errors.mainOutcome
            ? <FieldError>{errors.mainOutcome.message}</FieldError>
            : <FieldHint probe="Incluye un número específico y el tiempo en que se obtiene." />
          }
        </div>

        {/* Timeline */}
        <div>
          <FieldLabel required>¿En cuánto tiempo obtiene ese resultado?</FieldLabel>
          <input
            {...register('outcomeTimeline')}
            placeholder="Ej: Las primeras 4 semanas"
            className={inputClass}
          />
          {errors.outcomeTimeline && <FieldError>{errors.outcomeTimeline.message}</FieldError>}
        </div>

        <Divider label="Perfil económico" />

        {/* Inversión típica */}
        <div>
          <FieldLabel required>
            ¿Cuánto está acostumbrado a invertir en soluciones como la tuya?
          </FieldLabel>
          <input
            {...register('typicalInvestmentRange')}
            placeholder="Ej: $5,000 a $15,000 MXN/mes en servicios externos"
            className={inputClass}
          />
          {errors.typicalInvestmentRange && <FieldError>{errors.typicalInvestmentRange.message}</FieldError>}
        </div>

        {/* Tipo de presupuesto + Autoridad */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>El dinero sale de...</FieldLabel>
            <select {...register('budgetType')} className={inputClass}>
              <option value="personal">Su bolsillo personal</option>
              <option value="business">Presupuesto empresarial</option>
              <option value="both">Ambos</option>
            </select>
          </div>
          <div>
            <FieldLabel required>¿Decide solo?</FieldLabel>
            <select {...register('decisionAuthority')} className={inputClass}>
              <option value="alone">Sí, decide solo</option>
              <option value="needs_approval">Necesita aprobación</option>
              <option value="committee">Decide en comité</option>
            </select>
          </div>
        </div>

      </div>

      <NavigationButtons onBack={goPrev} />
    </form>
  )
}
```

---

### `components/wizard/steps/Step3ICP_Mixed.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useWizard } from '@/hooks/useWizard'
import { Step3ICP_B2B } from './Step3ICP_B2B'
import { Step3ICP_B2C } from './Step3ICP_B2C'
import { Button } from '@/components/ui/button'

type ActiveProfile = 'b2b' | 'b2c'

export function Step3ICP_Mixed() {
  const { state, goNext, goPrev } = useWizard()
  const [activeProfile, setActiveProfile] = useState<ActiveProfile>('b2b')
  const [b2bCompleted, setB2BCompleted] = useState(!!state.answers.step3_b2b)
  const [b2cCompleted, setB2CCompleted] = useState(!!state.answers.step3_b2c)

  function handleSkipB2C() {
    // El cliente puede completar el perfil B2C después desde el dashboard
    goNext()
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-mono text-[#3B82F6] tracking-widest uppercase mb-3">
          Paso 3 — Tu cliente ideal (Mixto)
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-bold text-white leading-tight mb-2">
          Tienes dos tipos<br />
          <span className="italic text-[#3B82F6]">de cliente ideal</span>
        </h1>
        <p className="text-[#64748B] text-sm">
          Completa el perfil primario ahora. El secundario lo puedes llenar en el dashboard
          cuando tengas más tiempo.
        </p>
      </div>

      {/* Selector de perfil */}
      <div className="flex gap-2 p-1 bg-[#111527] border border-[#1E2840]
                     rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setActiveProfile('b2b')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                     rounded-lg text-sm font-semibold transition-all ${
            activeProfile === 'b2b'
              ? 'bg-[#2563EB] text-white'
              : 'text-[#64748B] hover:text-white'
          }`}
        >
          🏢 Empresas (B2B)
          {b2bCompleted && <span className="text-xs">✓</span>}
        </button>
        <button
          type="button"
          onClick={() => setActiveProfile('b2c')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                     rounded-lg text-sm font-semibold transition-all ${
            activeProfile === 'b2c'
              ? 'bg-[#2563EB] text-white'
              : 'text-[#64748B] hover:text-white'
          }`}
        >
          👤 Personas (B2C)
          {b2cCompleted
            ? <span className="text-xs">✓</span>
            : <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded-full">
                Opcional
              </span>
          }
        </button>
      </div>

      {/* Componente activo */}
      {activeProfile === 'b2b'
        ? <Step3ICP_B2B />
        : (
          <div>
            <Step3ICP_B2C />
            {/* Opción de completar después */}
            <div className="mt-4 p-4 bg-[#111527] border border-[#1E2840] rounded-xl">
              <p className="text-sm text-[#64748B] mb-3">
                ¿No tienes tiempo ahora para el perfil B2C?
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-[#2A3655] text-[#C8D0E0] hover:text-white
                          hover:border-[#3B82F6] text-sm"
                onClick={handleSkipB2C}
              >
                Completar perfil B2C después →
              </Button>
            </div>
          </div>
        )
      }
    </div>
  )
}
```

---

## 7. ICPScoreMeter — Componente del Score en Tiempo Real

### `components/wizard/ICPScoreMeter.tsx`

```tsx
import type { ICPQualityScore } from '@/types/wizard.types'

interface ICPScoreMeterProps {
  score: ICPQualityScore
}

export function ICPScoreMeter({ score }: ICPScoreMeterProps) {
  const { total, breakdown, suggestions } = score

  const getScoreColor = (s: number) => {
    if (s >= 70) return '#0EA5A0'   // teal — bueno
    if (s >= 40) return '#F59E0B'   // amber — mejorable
    return '#64748B'                 // gris — insuficiente
  }

  const getScoreLabel = (s: number) => {
    if (s >= 85) return 'Excelente — generará materiales de alta conversión'
    if (s >= 70) return 'Bueno — generará materiales sólidos'
    if (s >= 40) return 'Mejorable — los materiales serán genéricos'
    return 'Insuficiente — agrega más detalle para continuar'
  }

  const color = getScoreColor(total)

  const CRITERIA_LABELS = {
    painInClientWords: 'Dolor en palabras del cliente',
    measurablePromise: 'Promesa medible con tiempo',
    exclusiveDifferentiator: 'Diferenciador exclusivo',
    actionableTrigger: 'Detonador accionable',
  }

  return (
    <div className="bg-[#111527] border border-[#1E2840] rounded-2xl p-5">
      {/* Score principal */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle
              cx="18" cy="18" r="15.9"
              fill="none" stroke="#1E2840" strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${total} ${100 - total}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold font-mono" style={{ color }}>
              {total}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-mono text-[#64748B] uppercase tracking-widest mb-1">
            ICP Quality Score
          </p>
          <p className="text-sm font-medium" style={{ color }}>
            {getScoreLabel(total)}
          </p>
        </div>
      </div>

      {/* Breakdown de los 4 criterios */}
      <div className="space-y-2">
        {(Object.entries(breakdown) as [keyof typeof CRITERIA_LABELS, number][]).map(([key, val]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-[#64748B] w-48 flex-shrink-0 text-right">
              {CRITERIA_LABELS[key]}
            </span>
            <div className="flex-1 h-1.5 bg-[#1E2840] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(val / 25) * 100}%`,
                  backgroundColor: getScoreColor(val * 4), // normalizar a 100
                }}
              />
            </div>
            <span className="text-xs font-mono w-8" style={{ color: getScoreColor(val * 4) }}>
              {val}/25
            </span>
          </div>
        ))}
      </div>

      {/* Sugerencias si hay */}
      {suggestions.length > 0 && total < 70 && (
        <div className="mt-4 pt-4 border-t border-[#1E2840] space-y-2">
          {suggestions.slice(0, 2).map((s, i) => (
            <p key={i} className="text-xs text-[#64748B] flex items-start gap-2">
              <span className="text-[#F59E0B] flex-shrink-0 mt-0.5">→</span>
              {s}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 8. Step 4 — Proceso y Diferenciación

### `components/wizard/steps/Step4Process.tsx`

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWizard } from '@/hooks/useWizard'
import { Textarea } from '@/components/ui/textarea'
import { ICPScoreMeter } from '../ICPScoreMeter'
import { calculateLocalICPScore } from '@/lib/utils/icp-score'
import { GENERIC_WORDS } from '@/config/wizard.config'
import type { Step4Answers, SalesCycleDuration } from '@/types/wizard.types'

const schema = z.object({
  salesCycleDuration: z.enum(['same_day','1-7_days','1-4_weeks','1-3_months','3+_months'] as const),
  salesCycleNotes: z.string().optional(),
  topObjection: z.string().min(5, 'Describe la objeción más común'),
  topObjectionResolution: z.string().min(20, 'Describe cómo la resuelves'),
  antiICP: z.string().min(20, 'Describe el perfil de cliente que no quieres'),
  highRiskICP: z.string().optional(),
  mainCompetitors: z.string().min(10, 'Describe con quién te comparan'),
  whyChoseUs: z.string().min(10, 'Explica por qué te eligen a ti'),
  whyCompetitorsFail: z.string().min(15, 'Explica por qué fallan las alternativas'),
  uniqueDifferentiator: z.string()
    .min(20, 'Necesitamos más detalle sobre tu diferenciador')
    .refine(val => !GENERIC_WORDS.some(w => val.toLowerCase().includes(w)),
      'El diferenciador está muy genérico. Describe el proceso específico, no adjetivos.'),
  economicProfile: z.string().min(10, 'Indica el rango de inversión típico'),
  budgetType: z.enum(['personal','business','both'] as const),
  decisionAuthority: z.enum(['alone','needs_approval','committee'] as const),
})

type FormData = z.infer<typeof schema>

const SALES_CYCLES = [
  { value: 'same_day', label: 'El mismo día' },
  { value: '1-7_days', label: '1–7 días' },
  { value: '1-4_weeks', label: '1–4 semanas' },
  { value: '1-3_months', label: '1–3 meses' },
  { value: '3+_months', label: 'Más de 3 meses' },
]

export function Step4Process() {
  const { state, updateStep4, goNext, goPrev } = useWizard()
  const prefill = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('wizard_prefill') ?? '{}')
    : {}

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      salesCycleDuration: state.answers.step4?.salesCycleDuration ?? '1-4_weeks',
      salesCycleNotes: state.answers.step4?.salesCycleNotes ?? '',
      topObjection: state.answers.step4?.topObjection ?? '',
      topObjectionResolution: state.answers.step4?.topObjectionResolution ?? '',
      antiICP: state.answers.step4?.antiICP ?? '',
      highRiskICP: state.answers.step4?.highRiskICP ?? '',
      mainCompetitors: state.answers.step4?.mainCompetitors ?? '',
      whyChoseUs: state.answers.step4?.whyChoseUs ?? '',
      whyCompetitorsFail: state.answers.step4?.whyCompetitorsFail ?? '',
      uniqueDifferentiator: state.answers.step4?.uniqueDifferentiator ?? prefill.differentiator ?? '',
      economicProfile: '',
      budgetType: 'business',
      decisionAuthority: 'alone',
    },
  })

  const formValues = watch()
  const liveScore = calculateLocalICPScore({
    ...state.answers,
    step4: formValues as Step4Answers,
  })

  function onSubmit(data: FormData) {
    updateStep4({
      salesCycleDuration: data.salesCycleDuration as SalesCycleDuration,
      salesCycleNotes: data.salesCycleNotes ?? '',
      topObjection: data.topObjection,
      topObjectionResolution: data.topObjectionResolution,
      antiICP: data.antiICP,
      highRiskICP: data.highRiskICP ?? '',
      mainCompetitors: data.mainCompetitors,
      whyChoseUs: data.whyChoseUs,
      whyCompetitorsFail: data.whyCompetitorsFail,
      uniqueDifferentiator: data.uniqueDifferentiator,
      // uniqueMechanism es generado por Claude — no se llena aquí
    })
    goNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in duration-300">
      <div className="mb-6">
        <p className="text-xs font-mono text-[#3B82F6] tracking-widest uppercase mb-3">
          Paso 4 — Tu proceso
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-bold text-white leading-tight mb-2">
          Cómo vendes y<br />
          <span className="italic text-[#3B82F6]">por qué te eligen</span>
        </h1>
      </div>

      <ICPScoreMeter score={liveScore} />

      <div className="space-y-6 mt-6">

        {/* Ciclo de venta */}
        <div>
          <FieldLabel required>
            ¿Cuánto tarda normalmente desde el primer contacto hasta que alguien compra?
          </FieldLabel>
          <div className="grid grid-cols-5 gap-2">
            {SALES_CYCLES.map(opt => {
              const isSelected = watch('salesCycleDuration') === opt.value
              return (
                <label
                  key={opt.value}
                  className={`
                    cursor-pointer p-3 rounded-xl border text-center text-xs font-medium
                    transition-all
                    ${isSelected
                      ? 'border-[#2563EB] bg-[#2563EB]/10 text-white'
                      : 'border-[#1E2840] text-[#64748B] hover:border-[#2A3655] hover:text-white'
                    }
                  `}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('salesCycleDuration')}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              )
            })}
          </div>
        </div>

        <Divider label="Objeciones" />

        {/* Objeción principal */}
        <div>
          <FieldLabel required>¿Cuál es la objeción más común antes de que alguien compre?</FieldLabel>
          <input {...register('topObjection')} placeholder='Ej: "Es muy caro"' className={inputClass} />
          {errors.topObjection && <FieldError>{errors.topObjection.message}</FieldError>}
        </div>

        {/* Resolución */}
        <div>
          <FieldLabel required>¿Cómo la resuelves cuando funciona?</FieldLabel>
          <Textarea
            {...register('topObjectionResolution')}
            rows={3}
            placeholder="Ej: Mostramos el costo de la silla vacía — 8 huecos × $2,500 = $80,000 al mes. Frente a eso, nuestro costo es obvio."
            className={textareaClass}
          />
          {errors.topObjectionResolution && <FieldError>{errors.topObjectionResolution.message}</FieldError>}
        </div>

        <Divider label="A quién no quieres" />

        {/* Anti-ICP */}
        <div>
          <FieldLabel required>¿Qué perfil de cliente definitivamente NO quieres?</FieldLabel>
          <Textarea
            {...register('antiICP')}
            rows={2}
            placeholder="Ej: Clínicas que solo quieren el precio más bajo, doctores que no quieren delegar nada, clínicas de gobierno."
            className={textareaClass}
          />
          {errors.antiICP && <FieldError>{errors.antiICP.message}</FieldError>}
        </div>

        {/* ICP de alto riesgo (opcional) */}
        <div>
          <FieldLabel info="Perfil que parece bueno pero tiende a ser problemático">
            ¿Hay algún perfil que parece buen cliente pero resulta difícil?{' '}
            <span className="text-[#64748B] font-normal">(opcional)</span>
          </FieldLabel>
          <input
            {...register('highRiskICP')}
            placeholder="Ej: Clínicas que crecieron muy rápido, dueños muy tecnófobos"
            className={inputClass}
          />
        </div>

        <Divider label="Tu diferenciador" />

        {/* Competidores y razón de elección */}
        <div>
          <FieldLabel required>¿Con quién te comparan y por qué te eligen a ti?</FieldLabel>
          <Textarea
            {...register('mainCompetitors')}
            rows={2}
            placeholder="Ej: Nos comparan con agencias genéricas de redes sociales. Nos eligen porque somos los únicos especializados en salud dental."
            className={textareaClass}
          />
          {errors.mainCompetitors && <FieldError>{errors.mainCompetitors.message}</FieldError>}
        </div>

        {/* Por qué fallan las alternativas */}
        <div>
          <FieldLabel required>¿Por qué fallan las soluciones que probaron antes?</FieldLabel>
          <Textarea
            {...register('whyCompetitorsFail')}
            rows={2}
            placeholder="Ej: Las agencias genéricas no entienden el sector salud y producen contenido que no conecta con pacientes."
            className={textareaClass}
          />
          {errors.whyCompetitorsFail && <FieldError>{errors.whyCompetitorsFail.message}</FieldError>}
        </div>

        {/* Diferenciador único ← IMPACTA EL ICP SCORE */}
        <div>
          <FieldLabel required score={25}>
            ¿Qué haces diferente en el proceso que produce resultados consistentes?
          </FieldLabel>
          <p className="text-xs text-[#F59E0B] mb-2">
            ⚡ Describe el mecanismo — no adjetivos. "Tenemos un proceso de 3 pasos..." no "Somos más personalizados".
          </p>
          <Textarea
            {...register('uniqueDifferentiator')}
            rows={3}
            placeholder="Ej: Somos los únicos en la zona con protocolo de implante en una sola cita con tecnología de guía quirúrgica digital. El paciente entra sin diente y sale con corona ese mismo día."
            className={textareaClass}
          />
          {errors.uniqueDifferentiator
            ? <FieldError>{errors.uniqueDifferentiator.message}</FieldError>
            : <FieldHint probe="¿Qué puedes hacer tú que si el cliente se va a la competencia no puede obtener de forma idéntica?" />
          }
        </div>

      </div>

      <NavigationButtons onBack={goPrev} />
    </form>
  )
}
```

---

## 9. Step 5 — Canales y Flujos

### `components/wizard/steps/Step5Channels.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useWizard } from '@/hooks/useWizard'
import { Button } from '@/components/ui/button'
import type { ChannelType, FunnelFlow, Step5Answers, CustomFlow } from '@/types/wizard.types'

const CHANNELS: { value: ChannelType; label: string; icon: string; description: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', icon: '📱', description: 'Canal #1 en México — 98% apertura' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', description: 'Ideal para B2B y profesionales' },
  { value: 'instagram', label: 'Instagram', icon: '📸', description: 'Visual, B2C y lifestyle' },
  { value: 'facebook', label: 'Facebook', icon: '📘', description: 'Grupos locales y audiencias mayores' },
  { value: 'email', label: 'Email', icon: '📧', description: 'Nutrición y seguimiento' },
  { value: 'tiktok', label: 'TikTok', icon: '🎬', description: 'Video corto, audiencia joven' },
  { value: 'youtube', label: 'YouTube', icon: '▶️', description: 'Video largo, educación' },
]

const FUNNEL_FLOWS: { value: FunnelFlow; label: string; description: string; group: string }[] = [
  { value: 'cold_prospect', label: 'Prospecto frío', description: 'Nunca ha escuchado de ti', group: 'Atracción' },
  { value: 'warm_prospect', label: 'Prospecto tibio', description: 'Te conoce pero no ha actuado', group: 'Atracción' },
  { value: 'referral', label: 'Referido', description: 'Viene recomendado por alguien', group: 'Atracción' },
  { value: 'info_requested_no_response', label: 'Pidió info y no responde', description: 'Mostró interés y desapareció', group: 'Consideración' },
  { value: 'proposal_seen_disappeared', label: 'Vio propuesta y no respondió', description: 'Tenía la información y se fue', group: 'Consideración' },
  { value: 'attended_demo', label: 'Asistió a demo', description: 'Vio el producto en acción', group: 'Consideración' },
  { value: 'has_objections', label: 'Tiene objeciones', description: 'Está interesado pero con dudas', group: 'Cierre' },
  { value: 'ready_to_close', label: 'Listo para cerrar', description: 'Necesita el empujón final', group: 'Cierre' },
  { value: 'new_client', label: 'Cliente nuevo', description: 'Acaba de comprar', group: 'Clientes' },
  { value: 'active_client', label: 'Cliente activo', description: 'Retención y upsell', group: 'Clientes' },
  { value: 'at_risk_client', label: 'Cliente en riesgo', description: 'Señales de abandono', group: 'Clientes' },
  { value: 'wants_to_cancel', label: 'Quiere cancelar', description: 'Expresó intención de salir', group: 'Clientes' },
  { value: 'churned_client', label: 'Cliente que se fue', description: 'Ya canceló — win-back', group: 'Reactivación' },
  { value: 'referral_program', label: 'Programa de referidos', description: 'Clientes que pueden referir', group: 'Crecimiento' },
]

const FLOW_GROUPS = ['Atracción', 'Consideración', 'Cierre', 'Clientes', 'Reactivación', 'Crecimiento']

export function Step5Channels() {
  const { state, updateStep5, goNext, goPrev, setStatus } = useWizard()

  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(
    state.answers.step5?.activeChannels.map(c => c.channel) ?? ['whatsapp']
  )
  const [selectedFlows, setSelectedFlows] = useState<FunnelFlow[]>(
    state.answers.step5?.selectedFlows ?? ['cold_prospect', 'warm_prospect', 'new_client', 'active_client']
  )
  const [customFlows, setCustomFlows] = useState<CustomFlow[]>(
    state.answers.step5?.customFlows ?? []
  )
  const [showAddFlow, setShowAddFlow] = useState(false)
  const [newFlow, setNewFlow] = useState({ name: '', description: '', contactStage: '', goalWithMaterials: '' })

  function toggleChannel(channel: ChannelType) {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    )
  }

  function toggleFlow(flow: FunnelFlow) {
    setSelectedFlows(prev =>
      prev.includes(flow) ? prev.filter(f => f !== flow) : [...prev, flow]
    )
  }

  function addCustomFlow() {
    if (!newFlow.name.trim() || !newFlow.description.trim()) return
    setCustomFlows(prev => [...prev, { ...newFlow }])
    setNewFlow({ name: '', description: '', contactStage: '', goalWithMaterials: '' })
    setShowAddFlow(false)
  }

  function handleSubmit() {
    if (selectedChannels.length === 0) return
    if (selectedFlows.length === 0 && customFlows.length === 0) return

    updateStep5({
      activeChannels: selectedChannels.map(ch => ({
        channel: ch,
        activityLevel: 'high' as const,
        useForProspecting: true,
        useForContent: true,
      })),
      preferredContactMethod: selectedChannels.includes('whatsapp') ? 'whatsapp' : selectedChannels[0],
      contentFormats: ['text', 'images'],
      selectedFlows,
      customFlows,
    } as Step5Answers)

    // Iniciar el procesamiento
    setStatus('processing')
  }

  const canProceed = selectedChannels.length > 0 &&
    (selectedFlows.length > 0 || customFlows.length > 0)

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <p className="text-xs font-mono text-[#3B82F6] tracking-widest uppercase mb-3">
          Paso 5 — Canales y flujos
        </p>
        <h1 className="font-['Fraunces'] text-3xl font-bold text-white leading-tight mb-2">
          ¿Dónde está tu<br />
          <span className="italic text-[#3B82F6]">cliente ideal?</span>
        </h1>
        <p className="text-[#64748B] text-sm">
          Selecciona los canales y los flujos de contacto de tu negocio.
          Los materiales se generarán específicamente para cada uno.
        </p>
      </div>

      {/* CANALES */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-3">Canales activos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CHANNELS.map(ch => {
            const isSelected = selectedChannels.includes(ch.value)
            return (
              <button
                key={ch.value}
                type="button"
                onClick={() => toggleChannel(ch.value)}
                className={`
                  p-3 rounded-xl border text-left transition-all
                  ${isSelected
                    ? 'border-[#2563EB] bg-[#2563EB]/10'
                    : 'border-[#1E2840] bg-[#111527] hover:border-[#2A3655]'
                  }
                `}
              >
                <div className="text-xl mb-1">{ch.icon}</div>
                <div className={`text-xs font-semibold mb-0.5 ${isSelected ? 'text-white' : 'text-[#C8D0E0]'}`}>
                  {ch.label}
                </div>
                <div className="text-[10px] text-[#64748B] leading-tight">{ch.description}</div>
              </button>
            )
          })}
        </div>
        {selectedChannels.length === 0 && (
          <p className="mt-2 text-xs text-red-400">Selecciona al menos un canal</p>
        )}
      </div>

      {/* FLUJOS */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">
          Flujos de contacto en tu negocio
        </h2>
        <p className="text-xs text-[#64748B] mb-4">
          Selecciona todos los que apliquen — se generarán materiales específicos para cada uno
        </p>

        {FLOW_GROUPS.map(group => {
          const groupFlows = FUNNEL_FLOWS.filter(f => f.group === group)
          return (
            <div key={group} className="mb-4">
              <p className="text-xs font-mono text-[#64748B] uppercase tracking-widest mb-2">
                {group}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groupFlows.map(flow => {
                  const isSelected = selectedFlows.includes(flow.value)
                  return (
                    <button
                      key={flow.value}
                      type="button"
                      onClick={() => toggleFlow(flow.value)}
                      className={`
                        p-3 rounded-xl border text-left text-sm transition-all flex items-center gap-3
                        ${isSelected
                          ? 'border-[#2563EB]/60 bg-[#2563EB]/08'
                          : 'border-[#1E2840] hover:border-[#2A3655]'
                        }
                      `}
                    >
                      <div className={`
                        w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center
                        ${isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#2A3655]'}
                      `}>
                        {isSelected && <span className="text-white text-[8px]">✓</span>}
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-[#C8D0E0]'}`}>
                          {flow.label}
                        </p>
                        <p className="text-[10px] text-[#64748B]">{flow.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Flujos personalizados existentes */}
        {customFlows.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-mono text-[#0EA5A0] uppercase tracking-widest mb-2">
              Mis flujos personalizados
            </p>
            <div className="space-y-2">
              {customFlows.map((flow, i) => (
                <div key={i} className="p-3 rounded-xl border border-[#0EA5A0]/30 bg-[#0EA5A0]/05 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-white">{flow.name}</p>
                    <p className="text-[10px] text-[#64748B]">{flow.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomFlows(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-[#64748B] hover:text-red-400 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agregar flujo personalizado */}
        {!showAddFlow ? (
          <button
            type="button"
            onClick={() => setShowAddFlow(true)}
            className="w-full p-3 rounded-xl border border-dashed border-[#2A3655]
                      text-[#64748B] text-sm hover:border-[#3B82F6] hover:text-[#3B82F6]
                      transition-all flex items-center justify-center gap-2"
          >
            <span>+</span> Agregar mi propio flujo
          </button>
        ) : (
          <div className="p-4 rounded-xl border border-[#2A3655] bg-[#111527] space-y-3">
            <p className="text-sm font-semibold text-white">Nuevo flujo personalizado</p>
            <input
              value={newFlow.name}
              onChange={e => setNewFlow(p => ({ ...p, name: e.target.value }))}
              placeholder="Nombre del flujo (ej: Lead de evento presencial)"
              className={inputClass}
            />
            <input
              value={newFlow.description}
              onChange={e => setNewFlow(p => ({ ...p, description: e.target.value }))}
              placeholder="¿En qué momento del proceso está este contacto?"
              className={inputClass}
            />
            <input
              value={newFlow.goalWithMaterials}
              onChange={e => setNewFlow(p => ({ ...p, goalWithMaterials: e.target.value }))}
              placeholder="¿Qué quieres lograr con los materiales de este flujo?"
              className={inputClass}
            />
            <div className="flex gap-2">
              <Button type="button" onClick={addCustomFlow} className="bg-[#2563EB] hover:bg-[#3B82F6] text-sm">
                Agregar
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddFlow(false)}
                className="border-[#2A3655] text-[#C8D0E0] text-sm">
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex gap-3 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          className="border-[#2A3655] text-[#C8D0E0] hover:text-white"
        >
          ← Atrás
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canProceed}
          className="flex-1 bg-[#0EA5A0] hover:bg-[#0D9490] text-white
                    disabled:opacity-40 disabled:cursor-not-allowed text-base py-6
                    shadow-lg shadow-teal-500/20"
        >
          🚀 Generar mi sistema
        </Button>
      </div>
      {!canProceed && (
        <p className="text-xs text-red-400 text-center mt-2">
          Selecciona al menos un canal y un flujo para continuar
        </p>
      )}
    </div>
  )
}
```

---

## 10. Pantalla de Procesamiento

### `app/(app)/wizard/processing/page.tsx`

```tsx
import { ProcessingScreen } from '@/components/wizard/ProcessingScreen'

export default function ProcessingPage() {
  return <ProcessingScreen />
}
```

### `components/wizard/ProcessingScreen.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWizard } from '@/hooks/useWizard'

interface ProcessingStep {
  id: string
  label: string
  duration: number // ms simulados (en producción es la duración real)
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'icp', label: 'Construyendo tu perfil de cliente ideal', duration: 2500 },
  { id: 'mechanism', label: 'Generando tu Mecanismo Único', duration: 1500 },
  { id: 'pitch', label: 'Creando tu pitch deck de 10 slides', duration: 2000 },
  { id: 'proposal', label: 'Redactando tu propuesta comercial', duration: 2000 },
  { id: 'bot', label: 'Configurando tu bot de WhatsApp', duration: 1500 },
  { id: 'sequences', label: 'Generando secuencias de email', duration: 1500 },
  { id: 'posts', label: 'Creando tu calendario de contenido', duration: 2000 },
  { id: 'ghl', label: 'Activando tu CRM y pipeline', duration: 2000 },
  { id: 'campaigns', label: 'Configurando campañas de seguimiento', duration: 1000 },
  { id: 'complete', label: '¡Todo listo!', duration: 500 },
]

export function ProcessingScreen() {
  const router = useRouter()
  const { state, setGeneratedOutputs, setError } = useWizard()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true)
      startProcessing()
    }
  }, []) // eslint-disable-line

  async function startProcessing() {
    try {
      // Llamar a la API de generación en paralelo con la animación
      const generationPromise = generateAllOutputs()

      // Avanzar los pasos de la animación con timing
      for (let i = 0; i < PROCESSING_STEPS.length - 1; i++) {
        await delay(PROCESSING_STEPS[i].duration)
        setCompletedSteps(prev => [...prev, PROCESSING_STEPS[i].id])
        setCurrentStepIndex(i + 1)
      }

      // Esperar a que termine la generación real
      const outputs = await generationPromise

      setGeneratedOutputs(outputs)
      setCompletedSteps(prev => [...prev, 'complete'])

      // Redirigir al dashboard
      await delay(800)
      router.push('/wizard/complete')

    } catch (err) {
      setError('Hubo un error generando tus materiales. Intenta de nuevo.')
      router.push('/wizard/step/5')
    }
  }

  async function generateAllOutputs() {
    const response = await fetch('/api/generate/icp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wizardAnswers: state.answers,
        scrapedContent: state.scrapedContent,
      }),
    })

    if (!response.ok) {
      throw new Error('Generation failed')
    }

    return response.json()
  }

  const currentStep = PROCESSING_STEPS[currentStepIndex]
  const progress = Math.round((completedSteps.length / (PROCESSING_STEPS.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Ícono animado */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#2563EB]/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-[#2563EB]/40 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-[#0B0F1C] border border-[#2563EB]/30
                         flex items-center justify-center text-3xl">
            ⚡
          </div>
        </div>

        <h1 className="font-['Fraunces'] text-3xl font-bold text-white mb-2">
          Construyendo tu sistema
        </h1>
        <p className="text-[#64748B] text-sm mb-8">
          Esto toma menos de 90 segundos. No cierres esta ventana.
        </p>

        {/* Barra de progreso */}
        <div className="h-1.5 bg-[#1E2840] rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#0EA5A0] rounded-full
                       transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left">
          {PROCESSING_STEPS.slice(0, -1).map((step, index) => {
            const isDone = completedSteps.includes(step.id)
            const isCurrent = index === currentStepIndex && !isDone

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isDone ? 'opacity-100' :
                  isCurrent ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className={`
                  w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs
                  ${isDone
                    ? 'bg-[#0EA5A0] text-white'
                    : isCurrent
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#1E2840] text-[#64748B]'
                  }
                `}>
                  {isDone ? '✓' : isCurrent ? <SpinnerSmall /> : '○'}
                </div>
                <span className={`text-sm ${
                  isDone ? 'text-[#5EEAD4]' :
                  isCurrent ? 'text-white' : 'text-[#64748B]'
                }`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SpinnerSmall() {
  return (
    <div className="w-3 h-3 border border-t-transparent border-white rounded-full animate-spin" />
  )
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

---

## 11. Pantalla de Resultados Inicial

### `app/(app)/wizard/complete/page.tsx`

```tsx
import { ResultsScreen } from '@/components/wizard/ResultsScreen'

export default function CompletePage() {
  return <ResultsScreen />
}
```

### `components/wizard/ResultsScreen.tsx`

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useWizard } from '@/hooks/useWizard'
import { Button } from '@/components/ui/button'

export function ResultsScreen() {
  const router = useRouter()
  const { state } = useWizard()

  const outputs = state.generatedOutputs
  const icpCard = outputs?.icpCard

  return (
    <div className="min-h-screen bg-[#060810]">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Celebración */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="font-['Fraunces'] text-4xl font-bold text-white mb-3">
            ¡Tu sistema está listo!
          </h1>
          <p className="text-[#64748B]">
            Todo fue configurado en menos de 90 segundos.
            Tu bot de WhatsApp ya está activo.
          </p>
        </div>

        {/* ICP Card */}
        {icpCard && (
          <div className="bg-[#0B0F1C] border border-[#2563EB]/30 rounded-2xl
                         overflow-hidden mb-6">
            <div className="bg-[#111527] px-6 py-4 border-b border-[#1E2840]
                           flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#3B82F6] tracking-widest
                              uppercase mb-1">
                  Tu ICP Card — v1
                </p>
                <h2 className="text-white font-bold text-lg">{icpCard.archetypeName}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-[#64748B]">ICP Score</p>
                <p className="text-2xl font-bold" style={{
                  color: icpCard.icpScore.total >= 70 ? '#0EA5A0' :
                         icpCard.icpScore.total >= 40 ? '#F59E0B' : '#64748B'
                }}>
                  {icpCard.icpScore.total}/100
                </p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <ICPField label="Dolor principal" value={icpCard.mainPain} />
              <ICPField label="Promesa" value={icpCard.promise} />
              <ICPField label="Miedo principal" value={icpCard.topFear} />
              <ICPField label="Mecanismo único" value={icpCard.uniqueMechanism} />
            </div>
          </div>
        )}

        {/* Materiales generados */}
        <div className="space-y-3 mb-8">
          <h2 className="text-sm font-mono text-[#64748B] uppercase tracking-widest mb-4">
            Materiales listos para usar
          </h2>

          {[
            { icon: '📊', label: 'Pitch deck — 10 slides', badge: 'Descargar PDF' },
            { icon: '📄', label: 'Propuesta comercial', badge: 'Descargar PDF' },
            { icon: '📱', label: 'Bot de WhatsApp', badge: 'Activo ✓' },
            { icon: '📧', label: 'Secuencia de email frío (5 emails)', badge: 'En GHL ✓' },
            { icon: '📅', label: '12 ideas de posts para el mes', badge: 'Ver calendario' },
            { icon: '💬', label: 'Scripts de manejo de objeciones', badge: 'Descargar' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-[#111527]
                                   border border-[#1E2840] rounded-xl
                                   hover:border-[#2A3655] transition-all">
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 text-[#C8D0E0] text-sm font-medium">{item.label}</span>
              <span className="text-xs font-mono text-[#3B82F6] bg-[#2563EB]/10
                              border border-[#2563EB]/25 px-3 py-1 rounded-full">
                {item.badge}
              </span>
            </div>
          ))}
        </div>

        {/* Llamada a Findings */}
        <div className="bg-[#0A1810] border border-[#0EA5A0]/25 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-2">
            ¿Quieres revisar todo con nosotros?
          </h3>
          <p className="text-[#64748B] text-sm mb-4">
            En 30 minutos revisamos tu ICP generado, afinamos el tono del bot y
            aprobamos tu primera campaña juntos.
          </p>
          <Button className="w-full bg-[#0EA5A0] hover:bg-[#0D9490] text-white">
            Agendar llamada de Findings →
          </Button>
        </div>

        {/* CTA al dashboard */}
        <Button
          variant="outline"
          className="w-full border-[#2A3655] text-[#C8D0E0] hover:text-white
                    hover:border-[#3B82F6] text-base py-6"
          onClick={() => router.push('/dashboard')}
        >
          Ir al dashboard completo →
        </Button>

      </div>
    </div>
  )
}

function ICPField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-mono text-[#64748B] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm text-[#C8D0E0] leading-relaxed">{value}</p>
    </div>
  )
}
```

---

## 12. Componentes de Utilidad Compartidos

Estos helpers se usan en múltiples componentes de los steps. Crear en un archivo separado.

### `components/wizard/WizardUtils.tsx`

```tsx
// Helpers compartidos por todos los step components

export const inputClass = `
  w-full bg-[#18203A] border border-[#2A3655] rounded-xl px-4 py-3
  text-white placeholder:text-[#64748B] focus:outline-none
  focus:border-[#3B82F6] transition-colors text-sm
`

export const textareaClass = `
  w-full bg-[#18203A] border-[#2A3655] text-white
  placeholder:text-[#64748B] focus:border-[#3B82F6] resize-none text-sm
`

export function FieldLabel({
  children,
  required,
  info,
  score,
}: {
  children: React.ReactNode
  required?: boolean
  info?: string
  score?: number
}) {
  return (
    <label className="block text-sm font-medium text-[#C8D0E0] mb-2">
      {children}
      {required && <span className="text-[#E24B4A] ml-1">*</span>}
      {score && (
        <span className="ml-2 text-xs font-mono bg-[#2563EB]/15 text-[#93C5FD]
                         border border-[#2563EB]/25 px-1.5 py-0.5 rounded">
          +{score}pts ICP
        </span>
      )}
      {info && (
        <span className="ml-2 text-xs text-[#64748B] font-normal">{info}</span>
      )}
    </label>
  )
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
      <span>⚠</span> {children}
    </p>
  )
}

export function FieldHint({ probe }: { probe: string }) {
  return (
    <p className="mt-1.5 text-xs text-[#64748B] italic flex items-start gap-1">
      <span className="text-[#F59E0B] not-italic flex-shrink-0">→</span>
      {probe}
    </p>
  )
}

export function PrefillBadge() {
  return (
    <span className="ml-2 text-[9px] font-mono bg-[#0EA5A0]/15 text-[#5EEAD4]
                     border border-[#0EA5A0]/25 px-1.5 py-0.5 rounded-full">
      Auto-llenado
    </span>
  )
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1 h-px bg-[#1E2840]" />
      <span className="text-xs font-mono text-[#64748B] uppercase tracking-widest">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#1E2840]" />
    </div>
  )
}

export function NavigationButtons({
  onBack,
  backLabel = '← Atrás',
  showBack = true,
}: {
  onBack?: () => void
  backLabel?: string
  showBack?: boolean
}) {
  return (
    <div className="flex gap-3 mt-8">
      {showBack && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-[#2A3655] text-[#C8D0E0]
                    hover:text-white hover:border-[#3B82F6] transition-all text-sm font-medium"
        >
          {backLabel}
        </button>
      )}
      <button
        type="submit"
        className="flex-1 py-3 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white
                  font-semibold transition-all text-sm shadow-lg shadow-blue-500/20"
      >
        Continuar →
      </button>
    </div>
  )
}
```

> **Nota de importación:** Todos los step components importan desde este archivo:
> ```typescript
> import {
>   FieldLabel, FieldError, FieldHint, PrefillBadge,
>   Divider, NavigationButtons, inputClass, textareaClass,
> } from '../WizardUtils'
> ```

---

## Qué sigue — Parte 4

La **Parte 4** cubre:
- `app/api/generate/icp/route.ts` — El endpoint principal que llama a Claude/Gemini y genera el ICP Card completo más todos los outputs del wizard
- `app/api/generate/materials/route.ts` — Generación on-demand de materiales individuales desde el dashboard
- `lib/claude/generators.ts` — Las funciones de generación usando el Prompt Maestro
- `lib/ghl/endpoints.ts` — Todas las llamadas a GHL API con modo mock integrado
- `lib/jina/scraper.ts` — La función de scraping con fallback a manual
- El manejo de errores y los timeouts de las llamadas a IA

**Cómo usar esta Parte 3:**
Sube las 3 partes juntas con el prompt:
*"Tengo el spec del wizard en 3 partes. La Parte 3 tiene todas las pantallas.
Quiero implementar [WizardShell / Step2Business / ProcessingScreen / etc.].
Los tipos están en la Parte 1, el config y state en la Parte 2."*
