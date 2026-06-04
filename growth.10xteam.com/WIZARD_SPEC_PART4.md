# 10xTeam Wizard — Especificación Técnica
## Parte 4 de 5: APIs de Generación, GHL y Scraping

> **Cómo usar esta parte:**
> Sube las Partes 1, 2 y 3 como contexto, luego agrega esta.
> Prompt sugerido: *"Tengo el spec del wizard en 4 partes. Esta Parte 4 tiene las APIs
> de generación, la integración con GHL y el scraper. Quiero implementar
> [endpoint/función específica]."*

---

## 1. Scraper con Jina AI

### `lib/jina/scraper.ts`

```typescript
/**
 * Scraper usando Jina AI Reader.
 * URL: https://r.jina.ai/{url}
 * Sin API key para uso básico. Gratis hasta volumen alto.
 */

export interface ScrapeResult {
  success: boolean
  content: string
  wordCount: number
  error?: string
}

const JINA_BASE = 'https://r.jina.ai/'
const MAX_CHARS = 6000       // Límite para no desperdiciar tokens
const TIMEOUT_MS = 15_000    // 15 segundos máximo de espera

/**
 * Scrapeea una URL y devuelve el contenido limpio en markdown.
 * Si falla, devuelve éxito: false y el error — no lanza excepción.
 */
export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  // Validar la URL antes de llamar a Jina
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { success: false, content: '', wordCount: 0, error: 'URL inválida — debe comenzar con http:// o https://' }
    }
  } catch {
    return { success: false, content: '', wordCount: 0, error: 'URL inválida' }
  }

  const jinaUrl = `${JINA_BASE}${parsedUrl.toString()}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'markdown',
        'X-Remove-Selector': 'header,footer,nav,.cookie-banner,.popup',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: false,
        content: '',
        wordCount: 0,
        error: `El sitio devolvió un error (${response.status}). Intenta llenar el wizard manualmente.`,
      }
    }

    const rawContent = await response.text()

    if (!rawContent || rawContent.length < 50) {
      return {
        success: false,
        content: '',
        wordCount: 0,
        error: 'El sitio no tiene suficiente contenido para analizar.',
      }
    }

    // Limpiar y limitar el contenido
    const cleanContent = parseScrapedContent(rawContent)

    return {
      success: true,
      content: cleanContent,
      wordCount: cleanContent.split(/\s+/).filter(Boolean).length,
    }

  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        content: '',
        wordCount: 0,
        error: 'El sitio tardó demasiado en responder. Intenta llenar el wizard manualmente.',
      }
    }
    return {
      success: false,
      content: '',
      wordCount: 0,
      error: 'No pudimos leer el sitio. Verifica la URL o llena el wizard manualmente.',
    }
  }
}

/**
 * Limpia el contenido scrapeado:
 * - Elimina secciones irrelevantes (menús, footers, código)
 * - Colapsa espacios en blanco excesivos
 * - Limita a MAX_CHARS caracteres
 */
function parseScrapedContent(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, '')          // Eliminar bloques de código
    .replace(/\[.*?\]\(.*?\)/g, '$1')         // Simplificar links markdown
    .replace(/#{1,6}\s/g, '\n')               // Convertir headers a saltos de línea
    .replace(/\n{3,}/g, '\n\n')              // Colapsar múltiples saltos
    .replace(/\t/g, ' ')                      // Tabs a espacios
    .replace(/ {3,}/g, ' ')                   // Múltiples espacios
    .trim()
    .substring(0, MAX_CHARS)
}
```

---

## 2. Generadores de Contenido con IA

### `lib/ai/generators.ts`

```typescript
import { generateWithAI } from './client'
import type {
  WizardAnswers,
  ICPCard,
  GeneratedOutputs,
  ElevatorPitchSet,
  PitchDeckStructure,
  PostIdea,
  ObjectionResponse,
  ICPQualityScore,
} from '@/types/wizard.types'

// ── HELPERS DE CONTEXTO ────────────────────────────────────────────────────

/**
 * Construye el bloque de contexto base (Bloque 0 del Prompt Maestro).
 * Se inyecta en TODOS los prompts de generación.
 */
function buildContextBlock(answers: WizardAnswers): string {
  const step2 = answers.step2
  const step3 = answers.step3_b2b ?? answers.step3_b2c
  const step4 = answers.step4
  const step5 = answers.step5

  return `
CONTEXTO DEL NEGOCIO — leer antes de generar cualquier material:

NEGOCIO: ${step2?.businessName ?? 'No especificado'}
QUÉ HACE: ${step2?.oneLiner ?? ''}
INDUSTRIA: ${step2?.industry ?? ''}
TIPO DE CLIENTE: ${step2?.icpType ?? 'b2b'}

DOLOR PRINCIPAL DEL CLIENTE:
${step3?.mainPain ?? ''}

COSTO DE NO RESOLVER EL PROBLEMA:
${(step3 as { costOfInaction?: string })?.costOfInaction ?? ''}

RESULTADO CONCRETO QUE OBTIENE EL CLIENTE:
${step3?.mainOutcome ?? ''} — en ${(step3 as { outcomeTimeline?: string })?.outcomeTimeline ?? ''}

POR QUÉ FALLAN LAS ALTERNATIVAS:
${step4?.whyCompetitorsFail ?? ''}

EL DIFERENCIADOR:
${step4?.uniqueDifferentiator ?? ''}

OBJECIÓN MÁS COMÚN: ${step4?.topObjection ?? ''}
CÓMO SE RESUELVE: ${step4?.topObjectionResolution ?? ''}

CANALES ACTIVOS: ${step5?.activeChannels.map(c => c.channel).join(', ') ?? ''}

ANTI-ICP (excluir): ${step4?.antiICP ?? ''}
`.trim()
}

/**
 * Bloque de voz y guardrails (Bloque 1 del Prompt Maestro).
 */
const VOICE_BLOCK = `
INSTRUCCIONES DE VOZ — aplicar en todo el material:
- Español mexicano claro. Nivel de lectura de 6° grado.
- Escribir en las palabras que usa el CLIENTE, no vocabulario técnico.
- Articular el dolor ANTES de presentar la solución.
- Cada promesa incluye resultado medible O tiempo específico.
- NUNCA usar: "solución innovadora", "clase mundial", "comprometidos con la excelencia",
  "a tu medida", "servicio integral", "líder en el sector".
- Cada pieza termina con UNA sola acción clara — nunca dos CTAs.
`.trim()

// ── GENERADOR PRINCIPAL: ICP CARD COMPLETA ────────────────────────────────

/**
 * Genera el ICP Card completo + todos los outputs del wizard en una sola llamada.
 * Este es el paso más importante del sistema — usa Claude Sonnet (o Gemini Pro en dev).
 */
export async function generateICPAndOutputs(
  answers: WizardAnswers,
  scrapedContent: string | null,
  businessId: string
): Promise<GeneratedOutputs> {
  const contextBlock = buildContextBlock(answers)
  const step3 = answers.step3_b2b ?? answers.step3_b2c
  const step4 = answers.step4

  const systemPrompt = `Eres un experto en estrategia de ventas y marketing para negocios
en México. Tu tarea es generar el perfil de cliente ideal (ICP) y los materiales de ventas
para un negocio basándote en las respuestas de su wizard de onboarding.

${contextBlock}

${VOICE_BLOCK}

INFORMACIÓN ADICIONAL DEL SITIO WEB (si está disponible):
${scrapedContent ? scrapedContent.substring(0, 2000) : 'No disponible'}

RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO.
Sin texto adicional. Sin backticks. Sin markdown. Solo el JSON.`

  const userPrompt = `Genera el ICP Card completo y todos los outputs del wizard.

Usa EXACTAMENTE esta estructura JSON (completa todos los campos):

{
  "icpCard": {
    "archetypeName": "Nombre del arquetipo (ej: Laura — Directora de Clínica Dental Privada)",
    "profileDescription": "2-3 oraciones describiendo el perfil",
    "primaryDecisionMaker": "Cargo del decisor principal",
    "secondaryInfluencers": [],
    "trigger": "El evento o situación que activa la búsqueda de una solución",
    "mainPain": "El dolor principal en palabras del cliente",
    "costOfInaction": "Qué pierde concretamente cada mes sin resolver el problema",
    "topFear": "El miedo principal que lo frena de actuar",
    "previousSolutionsTried": "Qué han intentado antes y por qué no funcionó",
    "uniqueMechanism": "A diferencia de [X que falló por Y], nosotros [proceso específico] lo que produce [resultado medible]",
    "channels": ["whatsapp"],
    "promise": "El resultado concreto y medible que obtiene — con tiempo específico",
    "antiICP": "Perfiles de clientes que no quiere",
    "highRiskICP": "Perfiles que parecen buenos pero son problemáticos",
    "economicProfile": {
      "investmentRange": "Rango de inversión típico",
      "budgetType": "personal/business/both",
      "decisionAuthority": "alone/needs_approval/committee"
    }
  },
  "elevatorPitch": {
    "whatsapp": "Pitch de 2-3 oraciones para WhatsApp — muy conversacional",
    "linkedin": "Pitch de 3-4 oraciones para LinkedIn — más formal",
    "inPerson": "Pitch de 4-5 oraciones para presentación presencial"
  },
  "emailSubjectLines": [
    "Subject line 1 — máximo 7 palabras, sin palabras genéricas",
    "Subject line 2",
    "Subject line 3",
    "Subject line 4",
    "Subject line 5"
  ],
  "monthlyPostIdeas": [
    {
      "weekNumber": 1,
      "topic": "Tema del post",
      "angle": "education",
      "format": "text",
      "hook": "Primera línea que para el scroll",
      "cta": "La acción que pides al final"
    }
  ],
  "objectionResponses": [
    {
      "objection": "${step4?.topObjection ?? 'Es muy caro'}",
      "response": "Respuesta de 2-3 oraciones que reencuadra la objeción",
      "followUpQuestion": "Pregunta de seguimiento para descubrir la razón real"
    },
    {
      "objection": "Ya lo intentamos antes y no funcionó",
      "response": "Respuesta usando el Mecanismo Único",
      "followUpQuestion": "Pregunta de diagnóstico"
    },
    {
      "objection": "Déjame pensarlo",
      "response": "Respuesta que descubre la razón real sin presión",
      "followUpQuestion": "Pregunta para definir siguiente paso concreto"
    }
  ]
}

Genera exactamente 12 ideas de posts para el mes con esta distribución:
8 de educación, 6 de dolor, 5 de prueba social, 5 de mecanismo, 4 de comunidad, 2 de oferta.
(Total 30 — ajusta el array para tener exactamente 30 items)`

  const response = await generateWithAI({
    task: 'icp_generation',
    systemPrompt,
    userPrompt,
    businessId,
    metadata: { wizardStep: 'icp_generation' },
  })

  // Parsear el JSON generado por la IA
  let parsed: Omit<GeneratedOutputs, 'pitchDeckStructure' | 'botPrompt'>
  try {
    const clean = response.content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()
    parsed = JSON.parse(clean)
  } catch {
    throw new Error('La IA generó una respuesta inválida. Intenta de nuevo.')
  }

  // Calcular el ICP Score
  const icpScore = calculateServerICPScore(answers)

  // Generar el pitch deck y el bot prompt en paralelo (llamadas separadas)
  const [pitchDeck, botPrompt] = await Promise.all([
    generatePitchDeck(answers, parsed.icpCard, businessId),
    generateBotPrompt(answers, parsed.icpCard, businessId),
  ])

  return {
    ...parsed,
    icpCard: {
      ...parsed.icpCard,
      version: 1,
      icpScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    pitchDeckStructure: pitchDeck,
    botPrompt,
  }
}

// ── GENERADOR: PITCH DECK ──────────────────────────────────────────────────

export async function generatePitchDeck(
  answers: WizardAnswers,
  icpCard: ICPCard,
  businessId: string
): Promise<PitchDeckStructure> {
  const contextBlock = buildContextBlock(answers)

  const systemPrompt = `${contextBlock}\n\n${VOICE_BLOCK}

Eres experto en crear pitch decks de ventas de alto impacto para negocios mexicanos.
RESPONDE SOLO CON JSON VÁLIDO.`

  const userPrompt = `Genera el contenido completo de un pitch deck de 10 slides.

Arquetipo del cliente: ${icpCard.archetypeName}
Promesa: ${icpCard.promise}
Mecanismo único: ${icpCard.uniqueMechanism}
Dolor principal: ${icpCard.mainPain}

Devuelve este JSON exacto:
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "Portada",
      "visibleText": "El headline principal del negocio — máximo 10 palabras",
      "presenterNotes": "Qué decir en voz alta en este slide — 60-80 palabras"
    },
    {
      "slideNumber": 2,
      "title": "El Problema",
      "visibleText": "El dolor del cliente en sus palabras — máximo 40 palabras en pantalla",
      "presenterNotes": "Cómo presentar el problema y verificar que resuena — 60-80 palabras"
    },
    {
      "slideNumber": 3,
      "title": "Por qué no funciona lo que ya probaron",
      "visibleText": "Las 2-3 razones por las que las soluciones anteriores fallan",
      "presenterNotes": "Presentar sin atacar a la competencia — analizar el método"
    },
    {
      "slideNumber": 4,
      "title": "La causa raíz",
      "visibleText": "El diagnóstico real de por qué el problema persiste",
      "presenterNotes": "El momento más importante — debe generar 'nunca lo había visto así'"
    },
    {
      "slideNumber": 5,
      "title": "Cómo lo resolvemos",
      "visibleText": "El mecanismo en 3 pasos o elementos concretos",
      "presenterNotes": "No listar características — explicar el proceso"
    },
    {
      "slideNumber": 6,
      "title": "La prueba",
      "visibleText": "Un resultado específico con número y tiempo",
      "presenterNotes": "Presentar el caso de éxito — perfil similar al prospecto"
    },
    {
      "slideNumber": 7,
      "title": "Para quién es (y para quién no)",
      "visibleText": "El perfil exacto + el anti-ICP",
      "presenterNotes": "Decir explícitamente para quién no somos — genera credibilidad"
    },
    {
      "slideNumber": 8,
      "title": "La inversión",
      "visibleText": "Los planes disponibles con elementos principales",
      "presenterNotes": "Presentar siempre con el ROI calculado al lado"
    },
    {
      "slideNumber": 9,
      "title": "La garantía",
      "visibleText": "La garantía específica que elimina el riesgo del prospecto",
      "presenterNotes": "El riesgo es nuestro, no del cliente"
    },
    {
      "slideNumber": 10,
      "title": "El siguiente paso",
      "visibleText": "Una sola acción con tiempo específico",
      "presenterNotes": "No preguntar '¿qué les pareció?' — proponer la siguiente acción directamente"
    }
  ]
}`

  const response = await generateWithAI({
    task: 'pitch_deck',
    systemPrompt,
    userPrompt,
    businessId,
    metadata: { type: 'pitch_deck' },
  })

  try {
    const clean = response.content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    return JSON.parse(clean)
  } catch {
    // Fallback: estructura básica si falla el parse
    return { slides: [] }
  }
}

// ── GENERADOR: PROMPT DEL BOT DE WHATSAPP ─────────────────────────────────

export async function generateBotPrompt(
  answers: WizardAnswers,
  icpCard: ICPCard,
  businessId: string
): Promise<string> {
  const contextBlock = buildContextBlock(answers)
  const step2 = answers.step2
  const step4 = answers.step4

  const systemPrompt = `${contextBlock}\n\n${VOICE_BLOCK}

Eres experto en configurar bots de WhatsApp para negocios mexicanos.
El prompt que generes se cargará directamente en GHL Conversation AI.
RESPONDE SOLO CON EL TEXTO DEL PROMPT — sin JSON, sin markdown, sin explicaciones.`

  const userPrompt = `Genera el prompt completo del bot de WhatsApp para ${step2?.businessName ?? 'este negocio'}.

El prompt debe incluir estas 6 secciones claramente delimitadas:

SECCIÓN 1 — IDENTIDAD: Nombre del asistente, qué representa, instrucción de no revelar que es IA a menos que pregunten directamente, tono y idioma.

SECCIÓN 2 — SOBRE EL NEGOCIO: Qué ofrecen (${step2?.oneLiner}), resultado principal (${icpCard.promise}), diferenciador (${icpCard.uniqueMechanism}).

SECCIÓN 3 — OBJETIVO DE LA CONVERSACIÓN: Los 3 pasos de calificación en orden.
Flujo de calificación para ICP: ${icpCard.archetypeName}
Señales de calificación positiva, señales de descalificación.

SECCIÓN 4 — MANEJO DE SITUACIONES ESPECÍFICAS:
- Cuando preguntan el precio: no dar precio antes de la reunión
- Cuando mencionan alternativas o competidores
- Cuando dicen "lo estoy pensando": descubrir razón real
- Cuando dicen "no es el momento": registrar y definir cuándo retomar
- Cuando hay una queja: escalar inmediatamente

SECCIÓN 5 — ESCALACIÓN A HUMANO:
Escalar cuando: pide hablar con persona, hay conflicto, precio avanzado,
más de 4 intercambios sin avanzar, prospecto cerca de decisión.

SECCIÓN 6 — REGLAS ABSOLUTAS:
Sin presión ni urgencia falsa. Sin precios antes de la sesión.
Sin más de un mensaje seguido sin esperar respuesta. Máximo 3 líneas por mensaje.

Usa este contexto:
- Arquetipo del cliente: ${icpCard.archetypeName}
- Dolor: ${icpCard.mainPain}
- Objeción top: ${step4?.topObjection ?? ''} — resolución: ${step4?.topObjectionResolution ?? ''}
- Anti-ICP: ${icpCard.antiICP}`

  const response = await generateWithAI({
    task: 'bot_prompt',
    systemPrompt,
    userPrompt,
    businessId,
    metadata: { type: 'bot_prompt' },
  })

  return response.content
}

// ── GENERADOR: MATERIALES INDIVIDUALES (on-demand desde el dashboard) ──────

export async function generateMaterial(params: {
  type: string
  flow?: string
  icpCard: ICPCard
  answers: WizardAnswers
  businessId: string
  extraContext?: string
}): Promise<string> {
  const { type, flow, icpCard, answers, businessId, extraContext } = params
  const contextBlock = buildContextBlock(answers)

  const systemPrompt = `${contextBlock}\n\n${VOICE_BLOCK}\n\n
ICP Card activa:
- Arquetipo: ${icpCard.archetypeName}
- Dolor: ${icpCard.mainPain}
- Promesa: ${icpCard.promise}
- Mecanismo Único: ${icpCard.uniqueMechanism}
- Objeción top: ${answers.step4?.topObjection} → ${answers.step4?.topObjectionResolution}
${extraContext ?? ''}

RESPONDE CON EL MATERIAL SOLICITADO. Sin introducción ni explicación adicional.`

  const MATERIAL_PROMPTS: Record<string, string> = {
    email_cold: `Genera la secuencia completa de 5 emails fríos.
Flujo: ${flow ?? 'cold_prospect'}
Formato: EMAIL 1 — DÍA 1: [subject] / [cuerpo] ... EMAIL 5 — DÍA 21: [subject] / [cuerpo]
Máximo 150 palabras por email. Sin bullets en los primeros 2 emails.`,

    email_nurture: `Genera la secuencia de 4 emails de nurture para leads que entraron pero no han avanzado.
Flujo: ${flow ?? 'warm_prospect'}
Email 1: Educa sobre el problema. Email 2: Desafía la suposición falsa.
Email 3: Caso de éxito. Email 4: El costo de seguir esperando.`,

    email_reactivation: `Genera los 3 emails de reactivación para leads inactivos (días 30, 60, 90).
Email día 30: Retoma sin mencionar que no respondieron.
Email día 60: Ángulo nuevo — algo que mejoró o cambió.
Email día 90: El break-up email — último intento con valor real.`,

    email_winback: `Genera los 3 emails de win-back para clientes que cancelaron (días 30, 60, 90).
Email 30: Check-in genuino sin agenda comercial.
Email 60: Mejora concreta implementada desde que se fueron.
Email 90: Oferta específica de regreso con vigencia real.`,

    linkedin_messages: `Genera la secuencia de 4 mensajes de LinkedIn:
1. Solicitud de conexión (máx 300 caracteres)
2. Primer mensaje post-conexión (máx 150 palabras)
3. Seguimiento si no respondió (máx 100 palabras — entrega valor)
4. Mensaje si respondió — avanzar hacia reunión (máx 180 palabras)`,

    whatsapp_outbound: `Genera 3 mensajes de WhatsApp outbound:
1. Primer contacto (máx 3 líneas, termina con pregunta cerrada)
2. Seguimiento día 3 sin respuesta (máx 2 líneas — entrega valor)
3. Seguimiento día 7 — último intento (máx 2 líneas — cierre limpio)`,

    one_pager: `Genera el one-pager completo con esta estructura:
HEADLINE (máx 10 palabras) / EL PROBLEMA (2 oraciones) /
LA SOLUCIÓN (3 oraciones) / RESULTADOS (3 bullets con números) /
PARA QUIÉN ES (1 párrafo) / LA GARANTÍA (1 oración) / SIGUIENTE PASO`,

    posts_monthly: `Genera 30 posts para el mes con esta distribución:
8 educación, 6 dolor, 5 prueba social, 5 mecanismo, 4 comunidad, 2 oferta.
Para cada post: número, canal (linkedin/instagram/facebook), formato,
el copy completo listo para publicar, CTA específico.`,

    ads_awareness: `Genera 3 variantes de copy para ads de awareness en Meta:
Variante A: ángulo del problema. Variante B: ángulo del resultado.
Variante C: ángulo de la historia.
Cada variante: headline (máx 40 caracteres) + texto principal (máx 125 palabras) + CTA.`,

    newsletter: `Genera el newsletter mensual completo:
1. Tema del mes (párrafo de apertura)
2. El análisis (2-3 párrafos con perspectiva propia)
3. Lo concreto: qué hacer con esto (1-2 párrafos accionables)
4. El caso del mes (1 párrafo)
5. El cierre (1 párrafo corto, conexión natural con el servicio)
Máximo 600 palabras.`,

    call_script: `Genera el script completo de llamada de ventas:
1. La apertura (30 segundos)
2. Las 5 preguntas de diagnóstico (de menor a mayor profundidad)
3. La transición al pitch
4. El manejo de las 3 objeciones principales
5. El cierre con 3 escenarios: con interés / con dudas / no es el momento`,
  }

  const materialPrompt = MATERIAL_PROMPTS[type]
  if (!materialPrompt) {
    throw new Error(`Tipo de material no soportado: ${type}`)
  }

  const taskMap: Record<string, string> = {
    email_cold: 'email_cold',
    email_nurture: 'email_nurture',
    email_reactivation: 'email_reactivation',
    email_winback: 'email_winback',
    linkedin_messages: 'linkedin_messages',
    whatsapp_outbound: 'whatsapp_messages',
    one_pager: 'one_pager',
    posts_monthly: 'posts_monthly',
    ads_awareness: 'ads_copy',
    newsletter: 'newsletter',
    call_script: 'call_script',
  }

  const response = await generateWithAI({
    task: (taskMap[type] ?? 'email_cold') as import('@/types/ai.types').AITask,
    systemPrompt,
    userPrompt: materialPrompt,
    businessId,
    metadata: { type, flow },
  })

  return response.content
}

// ── ICP QUALITY SCORE (versión servidor — más precisa que la local) ────────

function calculateServerICPScore(answers: WizardAnswers): ICPQualityScore {
  // Importar la función del cliente y ejecutarla en servidor
  // La lógica es idéntica — ver lib/utils/icp-score.ts
  const { calculateLocalICPScore } = require('@/lib/utils/icp-score')
  return calculateLocalICPScore(answers)
}
```

---

## 3. Integración con GHL

### `lib/ghl/endpoints.ts`

```typescript
/**
 * Todas las llamadas a la GHL API v2.
 *
 * GHL_MOCK_MODE=true  →  Respuestas simuladas, sin llamadas reales.
 * GHL_MOCK_MODE=false →  Llamadas reales a GHL (requiere cuenta SaaS Pro activa).
 */

import type { GHLSubAccount, GHLActivationResult, GHLConversationAISettings } from '@/types/ghl.types'
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const IS_MOCK = process.env.GHL_MOCK_MODE === 'true'
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_AGENCY_ID = process.env.GHL_AGENCY_ID

// ── CLIENTE BASE ───────────────────────────────────────────────────────────

async function ghlFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data: unknown; status: number }> {
  if (!GHL_API_KEY) {
    throw new Error('GHL_API_KEY no configurado. Activa GHL_MOCK_MODE=true para desarrollo.')
  }

  const url = `${GHL_BASE}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
      ...(options.headers ?? {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  return { ok: response.ok, data, status: response.status }
}

// ── SNAPSHOTS POR INDUSTRIA ────────────────────────────────────────────────
// IDs de snapshots preconfigurados en la cuenta SaaS Pro de 10xTeam.
// Llenar estos IDs cuando se creen los snapshots en GHL.
const INDUSTRY_SNAPSHOT_MAP: Record<string, string> = {
  salud_odontologia:     'snapshot_dental',
  salud_medicina:        'snapshot_medicina',
  salud_bienestar:       'snapshot_bienestar',
  inmobiliaria:          'snapshot_inmobiliaria',
  educacion:             'snapshot_educacion',
  legal:                 'snapshot_legal',
  financiero:            'snapshot_financiero',
  consultoria:           'snapshot_consultoria',
  tecnologia:            'snapshot_tecnologia',
  restaurantes:          'snapshot_restaurantes',
  retail:                'snapshot_retail',
  manufactura:           'snapshot_manufactura',
  marketing_agencia:     'snapshot_agencia',
  ecommerce:             'snapshot_ecommerce',
  otro:                  'snapshot_general',
}

// ── SECUENCIA DE ACTIVACIÓN COMPLETA ──────────────────────────────────────

/**
 * Activa la cuenta del cliente en GHL.
 * Ejecuta todos los pasos en secuencia.
 * En modo mock devuelve éxito simulado.
 */
export async function activateClientInGHL(params: {
  businessName: string
  userEmail: string
  userPhone: string
  industry: string
  icpCard: ICPCard
  botPrompt: string
  answers: WizardAnswers
}): Promise<GHLActivationResult> {
  const { businessName, userEmail, userPhone, industry, icpCard, botPrompt } = params

  if (IS_MOCK) {
    return mockActivationResult(businessName)
  }

  const result: GHLActivationResult = {
    success: false,
    locationId: null,
    snapshotApplied: false,
    customFieldsSet: false,
    botActivated: false,
    campaignsActivated: false,
    errors: [],
  }

  try {
    // PASO 1: Crear la sub-cuenta
    const locationId = await createSubAccount({
      name: businessName,
      email: userEmail,
      phone: userPhone,
    })
    result.locationId = locationId

    // PASO 2: Aplicar snapshot de la industria
    const snapshotId = INDUSTRY_SNAPSHOT_MAP[industry] ?? INDUSTRY_SNAPSHOT_MAP['otro']
    if (snapshotId) {
      await applySnapshot(locationId, snapshotId)
      result.snapshotApplied = true
    }

    // PASO 3: Guardar datos del ICP en custom fields de GHL
    await setICPCustomFields(locationId, icpCard)
    result.customFieldsSet = true

    // PASO 4: Activar el bot de WhatsApp con el prompt generado
    await activateConversationAI(locationId, botPrompt, businessName)
    result.botActivated = true

    // PASO 5: Activar las campañas del snapshot
    await activateCampaigns(locationId)
    result.campaignsActivated = true

    result.success = true
    return result

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido en GHL'
    result.errors.push(message)
    console.error('GHL activation error:', err)
    return result
  }
}

// ── PASO 1: CREAR SUB-CUENTA ───────────────────────────────────────────────

async function createSubAccount(params: {
  name: string
  email: string
  phone: string
}): Promise<string> {
  const { ok, data, status } = await ghlFetch('/locations/', {
    method: 'POST',
    body: JSON.stringify({
      companyId: GHL_AGENCY_ID,
      name: params.name,
      email: params.email,
      phone: params.phone,
      address: '',
      city: 'Ciudad de México',
      country: 'MX',
      timezone: 'America/Mexico_City',
    }),
  })

  if (!ok) {
    throw new Error(`GHL createSubAccount falló (${status}): ${JSON.stringify(data)}`)
  }

  const locationId = (data as { location?: { id?: string } }).location?.id
  if (!locationId) throw new Error('GHL no devolvió locationId')

  return locationId
}

// ── PASO 2: APLICAR SNAPSHOT ───────────────────────────────────────────────

async function applySnapshot(locationId: string, snapshotId: string): Promise<void> {
  const { ok, status, data } = await ghlFetch(
    `/locations/${locationId}/snapshots/apply`,
    {
      method: 'POST',
      body: JSON.stringify({
        snapshotId,
        override: true,
      }),
    }
  )

  if (!ok) {
    // No lanzar error — si el snapshot falla, continuar con el resto
    console.warn(`Snapshot apply falló (${status}):`, data)
  }
}

// ── PASO 3: GUARDAR CAMPOS CUSTOM DEL ICP ─────────────────────────────────

async function setICPCustomFields(
  locationId: string,
  icpCard: ICPCard
): Promise<void> {
  // Los IDs de los custom fields se crean en GHL al hacer el snapshot
  // Aquí se actualiza su valor con los datos del ICP del cliente
  const fieldsToSet = [
    { key: 'icp_archetype_name',    value: icpCard.archetypeName },
    { key: 'icp_main_pain',         value: icpCard.mainPain },
    { key: 'icp_promise',           value: icpCard.promise },
    { key: 'icp_unique_mechanism',  value: icpCard.uniqueMechanism },
    { key: 'icp_top_fear',          value: icpCard.topFear },
    { key: 'icp_anti_icp',          value: icpCard.antiICP },
  ]

  // GHL acepta actualización de múltiples campos en una sola llamada
  const { ok, status, data } = await ghlFetch(
    `/locations/${locationId}/customFields`,
    {
      method: 'PUT',
      body: JSON.stringify({ customFields: fieldsToSet }),
    }
  )

  if (!ok) {
    console.warn(`Custom fields update falló (${status}):`, data)
  }
}

// ── PASO 4: ACTIVAR EL BOT DE WHATSAPP ────────────────────────────────────

async function activateConversationAI(
  locationId: string,
  botPrompt: string,
  botName: string
): Promise<void> {
  const settings: Partial<GHLConversationAISettings> = {
    enabled: true,
    mode: 'autopilot',
    botName: `Asistente de ${botName}`,
    prompt: botPrompt,
    channels: ['whatsapp'],
  }

  const { ok, status, data } = await ghlFetch(
    `/locations/${locationId}/conversations/ai/settings`,
    {
      method: 'POST',
      body: JSON.stringify(settings),
    }
  )

  if (!ok) {
    throw new Error(`Bot activation falló (${status}): ${JSON.stringify(data)}`)
  }
}

// ── PASO 5: ACTIVAR CAMPAÑAS ───────────────────────────────────────────────

async function activateCampaigns(locationId: string): Promise<void> {
  // Obtener las campañas del snapshot y activarlas
  const { ok, data } = await ghlFetch(`/locations/${locationId}/campaigns`)

  if (!ok || !Array.isArray((data as { campaigns?: unknown[] }).campaigns)) return

  // Activar las primeras campañas del snapshot (las del onboarding)
  const campaigns = (data as { campaigns: { id: string }[] }).campaigns
  for (const campaign of campaigns.slice(0, 3)) {
    await ghlFetch(`/campaigns/${campaign.id}/start`, {
      method: 'POST',
      body: JSON.stringify({ locationId }),
    }).catch(() => {}) // No bloquear si una falla
  }
}

// ── WEBHOOKS: PROCESAR EVENTOS DE GHL ─────────────────────────────────────

/**
 * Procesa un webhook entrante de GHL y lo convierte en un evento
 * de analytics en Supabase.
 */
export function parseGHLWebhook(payload: Record<string, unknown>): {
  eventType: string
  locationId: string
  contactId?: string
  source?: string
  data: Record<string, unknown>
} {
  return {
    eventType: String(payload.type ?? payload.event ?? 'unknown'),
    locationId: String(payload.locationId ?? ''),
    contactId: String(payload.contactId ?? payload.contact?.id ?? ''),
    source: String(payload.source ?? 'unknown'),
    data: payload,
  }
}

// ── MOCK: RESPUESTA SIMULADA PARA DESARROLLO ──────────────────────────────

function mockActivationResult(businessName: string): GHLActivationResult {
  const mockLocationId = `mock_loc_${Date.now()}`

  console.log(`[GHL MOCK] Activación simulada para: ${businessName}`)
  console.log(`[GHL MOCK] LocationId simulado: ${mockLocationId}`)
  console.log('[GHL MOCK] Todos los pasos: ✓ (simulados)')

  return {
    success: true,
    locationId: mockLocationId,
    snapshotApplied: true,
    customFieldsSet: true,
    botActivated: true,
    campaignsActivated: true,
    errors: [],
  }
}
```

---

## 4. API Route: Generar ICP

### `app/api/generate/icp/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateICPAndOutputs } from '@/lib/ai/generators'
import { activateClientInGHL } from '@/lib/ghl/endpoints'
import type { WizardAnswers } from '@/types/wizard.types'

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticar
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Validar el body
    const { wizardAnswers, scrapedContent } = await req.json() as {
      wizardAnswers: WizardAnswers
      scrapedContent: string | null
    }

    if (!wizardAnswers?.step2) {
      return NextResponse.json(
        { error: 'Respuestas del wizard incompletas' },
        { status: 400 }
      )
    }

    // 3. Obtener el negocio del usuario
    const service = createServiceClient()
    const { data: business, error: bizError } = await service
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (bizError || !business) {
      return NextResponse.json(
        { error: 'No se encontró el negocio del usuario' },
        { status: 404 }
      )
    }

    // 4. Actualizar el negocio con los datos del Step 2
    await service
      .from('businesses')
      .update({
        name: wizardAnswers.step2.businessName,
        industry: wizardAnswers.step2.industry,
        icp_type: wizardAnswers.step2.icpType,
        wizard_step_current: 5,
      })
      .eq('id', business.id)

    // 5. Generar el ICP y todos los outputs con IA
    // (puede tardar 30-60 segundos — la pantalla de procesamiento tiene la animación)
    const outputs = await generateICPAndOutputs(
      wizardAnswers,
      scrapedContent,
      business.id
    )

    // 6. Activar en GHL (real o mock según GHL_MOCK_MODE)
    const ghlResult = await activateClientInGHL({
      businessName: wizardAnswers.step2.businessName,
      userEmail: user.email ?? '',
      userPhone: '',
      industry: wizardAnswers.step2.industry,
      icpCard: outputs.icpCard,
      botPrompt: outputs.botPrompt,
      answers: wizardAnswers,
    })

    // 7. Guardar el ICP en Supabase
    const { data: icpProfile, error: icpError } = await service
      .from('icp_profiles')
      .insert({
        business_id: business.id,
        version: 1,
        is_active: true,
        wizard_answers: wizardAnswers,
        icp_card: outputs.icpCard,
        icp_score: outputs.icpCard.icpScore,
        active_flows: wizardAnswers.step5?.selectedFlows ?? [],
        custom_flows: wizardAnswers.step5?.customFlows ?? [],
        bot_prompt: outputs.botPrompt,
        ghl_custom_fields_id: ghlResult.locationId,
      })
      .select()
      .single()

    if (icpError) {
      console.error('Error saving ICP profile:', icpError)
      // No lanzar error — el ICP se generó aunque no se guardara
    }

    // 8. Guardar los materiales iniciales en Supabase
    if (icpProfile) {
      const materialsToSave = [
        {
          business_id: business.id,
          icp_version: 1,
          type: 'pitch_deck' as const,
          content: outputs.pitchDeckStructure,
          month: new Date().toISOString().substring(0, 7),
        },
      ]

      await service.from('materials').insert(materialsToSave).catch(console.error)
    }

    // 9. Marcar el wizard como completado
    await service
      .from('businesses')
      .update({
        wizard_completed: true,
        wizard_completed_at: new Date().toISOString(),
        ghl_location_id: ghlResult.locationId,
      })
      .eq('id', business.id)

    // 10. Responder con todos los outputs
    return NextResponse.json({
      success: true,
      outputs,
      ghlActivation: ghlResult,
      icpProfileId: icpProfile?.id,
    })

  } catch (err) {
    console.error('ICP generation error:', err)

    const message = err instanceof Error ? err.message : 'Error interno'

    // Distinguir entre error de límite de AI y otros errores
    if (message.includes('AI usage limit')) {
      return NextResponse.json(
        { error: message, code: 'AI_LIMIT_REACHED' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Error generando el ICP. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }
}
```

---

## 5. API Route: Generar Materiales On-Demand

### `app/api/generate/materials/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateMaterial } from '@/lib/ai/generators'
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticar
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Validar el body
    const { type, flow, businessId, extraContext } = await req.json() as {
      type: string
      flow?: string
      businessId: string
      extraContext?: string
    }

    if (!type || !businessId) {
      return NextResponse.json(
        { error: 'type y businessId son requeridos' },
        { status: 400 }
      )
    }

    // 3. Verificar que el negocio pertenece al usuario
    const service = createServiceClient()
    const { data: business } = await service
      .from('businesses')
      .select('id, name')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // 4. Obtener el ICP activo
    const { data: icpProfile } = await service
      .from('icp_profiles')
      .select('icp_card, wizard_answers')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (!icpProfile) {
      return NextResponse.json(
        { error: 'No hay ICP activo. Completa el wizard primero.' },
        { status: 404 }
      )
    }

    // 5. Generar el material
    const content = await generateMaterial({
      type,
      flow,
      icpCard: icpProfile.icp_card as ICPCard,
      answers: icpProfile.wizard_answers as WizardAnswers,
      businessId,
      extraContext,
    })

    // 6. Guardar en Supabase
    const { data: material } = await service
      .from('materials')
      .insert({
        business_id: businessId,
        icp_version: (icpProfile.icp_card as ICPCard).version ?? 1,
        type,
        flow: flow ?? null,
        content: { text: content },
        month: new Date().toISOString().substring(0, 7),
      })
      .select('id')
      .single()

    return NextResponse.json({
      success: true,
      content,
      materialId: material?.id,
    })

  } catch (err) {
    console.error('Material generation error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'

    if (message.includes('AI usage limit')) {
      return NextResponse.json(
        { error: message, code: 'AI_LIMIT_REACHED' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Error generando el material. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
```

---

## 6. API Route: Webhooks de GHL

### `app/api/ghl/webhooks/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { parseGHLWebhook } from '@/lib/ghl/endpoints'
import { createHmac } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar firma del webhook (seguridad)
    const signature = req.headers.get('x-ghl-signature')
    const body = await req.text()

    if (process.env.GHL_WEBHOOK_SECRET && signature) {
      const expectedSig = createHmac('sha256', process.env.GHL_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')

      if (signature !== expectedSig) {
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
      }
    }

    // 2. Parsear el evento
    const payload = JSON.parse(body)
    const event = parseGHLWebhook(payload)

    // 3. Encontrar el negocio correspondiente por locationId
    const service = createServiceClient()
    const { data: business } = await service
      .from('businesses')
      .select('id')
      .eq('ghl_location_id', event.locationId)
      .single()

    if (!business) {
      // Ignorar eventos de cuentas no registradas
      return NextResponse.json({ received: true })
    }

    // 4. Guardar el evento en analytics_events
    await service.from('analytics_events').insert({
      business_id: business.id,
      event_type: event.eventType,
      ghl_contact_id: event.contactId ?? null,
      ghl_location_id: event.locationId,
      source: event.source ?? null,
      payload: event.data,
    })

    // 5. Acciones específicas por tipo de evento
    switch (event.eventType) {
      case 'appointment.created':
        // Actualizar contador de citas en el dashboard
        // Enviar notificación al cliente si es la primera cita (garantía cumplida)
        await handleAppointmentCreated(business.id, event.data, service)
        break

      case 'opportunity.status_changed':
        // Actualizar el pipeline visual
        break

      case 'contact.created':
        // Nuevo lead — actualizar contador
        break
    }

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error('Webhook error:', err)
    // Siempre responder 200 a GHL para que no reintente
    return NextResponse.json({ received: true })
  }
}

async function handleAppointmentCreated(
  businessId: string,
  data: Record<string, unknown>,
  service: ReturnType<typeof createServiceClient>
) {
  // Verificar si es la primera cita (garantía de 72 horas)
  const { count } = await service
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('event_type', 'appointment.created')

  if (count === 1) {
    // Primera cita — marcar garantía como cumplida
    await service
      .from('businesses')
      .update({ first_appointment_at: new Date().toISOString() })
      .eq('id', businessId)
      .catch(() => {})

    console.log(`[GARANTÍA] Primera cita cumplida para businessId: ${businessId}`)
  }
}
```

---

## 7. Patrones de Manejo de Errores

### `lib/ai/retry.ts`

```typescript
/**
 * Retry con backoff exponencial para llamadas a IA.
 * Las APIs de IA fallan ocasionalmente — reintentar automáticamente.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 2,
    baseDelayMs = 1000,
    maxDelayMs = 8000,
    onRetry,
  } = options

  let lastError: Error = new Error('Unknown error')

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      // No reintentar errores de límite (billing) o autenticación
      if (
        lastError.message.includes('AI_LIMIT_REACHED') ||
        lastError.message.includes('401') ||
        lastError.message.includes('403')
      ) {
        throw lastError
      }

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)
        onRetry?.(attempt + 1, lastError)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Timeout wrapper para llamadas que pueden quedarse colgadas.
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'La operación tardó demasiado. Intenta de nuevo.'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  })

  return Promise.race([fn(), timeoutPromise])
}
```

---

## 8. Checklist de Variables de Entorno para Desarrollo

Antes de levantar el servidor por primera vez, verificar que `.env.local` tenga:

```bash
# ── MÍNIMO PARA LEVANTAR EL SERVIDOR ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=              # Desde tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=         # Desde tu proyecto Supabase
SUPABASE_SERVICE_ROLE_KEY=             # Desde tu proyecto Supabase (Settings > API)

# ── IA: SOLO GEMINI PARA DESARROLLO ───────────────────────────────────────
GOOGLE_AI_API_KEY=                     # Tu API key de Google AI Studio
AI_DEV_MODE=true                       # Redirige todo a Gemini
AI_DEV_PROVIDER=google
AI_DEV_MODEL=gemini-1.5-flash

# ── GHL: MODO MOCK PARA DESARROLLO ────────────────────────────────────────
GHL_MOCK_MODE=true                     # Simula la activación de GHL
GHL_API_KEY=                           # Dejar vacío en desarrollo
GHL_AGENCY_ID=                         # Dejar vacío en desarrollo
GHL_WEBHOOK_SECRET=                    # Dejar vacío en desarrollo

# ── APP ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── COMPLETAR CUANDO ESTÉS LISTO PARA PRODUCCIÓN ──────────────────────────
ANTHROPIC_API_KEY=                     # Claude — para producción
OPENAI_API_KEY=                        # GPT-4o mini — para producción
DEEPSEEK_API_KEY=                      # DeepSeek — para producción
STRIPE_SECRET_KEY=                     # Pagos USD
MERCADOPAGO_ACCESS_TOKEN=              # Pagos MXN
RESEND_API_KEY=                        # Emails transaccionales
```

---

## 9. Orden de Implementación Recomendado para esta Parte

Con las Partes 1–3 ya en VSCode, el orden para implementar la Parte 4:

```
1. lib/jina/scraper.ts
   → Probar con: curl https://r.jina.ai/https://tusitio.com
   → Verificar que devuelve contenido limpio

2. lib/ai/generators.ts
   → Empezar solo con generateICPAndOutputs()
   → Probar con datos mock de wizard answers
   → Verificar que Gemini devuelve JSON válido

3. lib/ghl/endpoints.ts
   → Con GHL_MOCK_MODE=true
   → Verificar que mockActivationResult() se llama correctamente

4. app/api/generate/icp/route.ts
   → Probar con Postman o Thunder Client
   → Verificar que guarda en Supabase correctamente

5. app/api/ghl/webhooks/route.ts
   → Probar con un payload de ejemplo

6. app/api/generate/materials/route.ts
   → Probar generando un email_cold con el ICP guardado
```

---

## Qué sigue — Parte 5

La **Parte 5** (última) cubre:
- Todos los prompts del Prompt Maestro como funciones TypeScript
- Los prompts de captación, nurture, cierre, reactivación, clientes y social
- El prompt completo del bot de WhatsApp como template function
- La lógica de regeneración mensual automática (cron job)
- El hook `useICP` para el dashboard
- El hook `useAIUsage` para mostrar el consumo al cliente
- Las notas finales de deploy en Vercel

**Cómo usar la Parte 4 en VSCode:**
Sube todas las partes anteriores y esta con el prompt:
*"Tengo el spec del wizard en 4 partes. La Parte 4 tiene los generadores de IA,
los endpoints de GHL y las API routes. Quiero implementar [archivo específico].
El AI client unificado está en la Parte 2."*
