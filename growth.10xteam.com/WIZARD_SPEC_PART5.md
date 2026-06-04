# 10xTeam Wizard — Especificación Técnica
## Parte 5 de 5: Prompts como Código, Regeneración Mensual, Hooks y Deploy

> **Esta es la parte final del spec.**
> Sube las partes anteriores como contexto y usa esta para implementar
> los prompts, los hooks del dashboard y el deploy.
> Prompt sugerido: *"Tengo el spec completo del wizard en 5 partes.
> Esta Parte 5 tiene los prompts como funciones TypeScript, los hooks
> del dashboard y las notas de deploy. Implementa [lo que necesites]."*

---

## 1. Sistema de Prompts como Funciones TypeScript

Cada función recibe los datos del ICP y devuelve el par `{ systemPrompt, userPrompt, task }`
listo para pasar al cliente unificado de IA de la Parte 2.

### `lib/prompts/index.ts` — Re-exports

```typescript
// Re-exporta todos los builders de prompts desde un punto central
export * from './context'
export * from './cold-outreach'
export * from './nurture'
export * from './closing'
export * from './reactivation'
export * from './clients'
export * from './winback'
export * from './social'
export * from './bot'
```

---

### `lib/prompts/context.ts` — Bloque 0 y 1 (Base)

```typescript
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'

/**
 * Construye el bloque de contexto base (Bloque 0 del Prompt Maestro).
 * Se inyecta en todos los prompts del sistema.
 */
export function buildBaseContext(icpCard: ICPCard, answers: WizardAnswers): string {
  const step2 = answers.step2
  const step4 = answers.step4
  const step5 = answers.step5

  return `
═══ CONTEXTO DEL NEGOCIO (Bloque 0) ═══

NEGOCIO: ${step2?.businessName ?? ''}
QUÉ HACE: ${step2?.oneLiner ?? ''}
INDUSTRIA: ${step2?.industry ?? ''}
TIPO DE CLIENTE: ${step2?.icpType?.toUpperCase() ?? 'B2B'}

CLIENTE IDEAL:
- Arquetipo: ${icpCard.archetypeName}
- Decisor: ${icpCard.primaryDecisionMaker}
- Detonador: ${icpCard.trigger}

EL PROBLEMA:
- Dolor principal: ${icpCard.mainPain}
- Costo de no resolverlo: ${icpCard.costOfInaction}
- Lo que probaron antes: ${icpCard.previousSolutionsTried}

LA PROMESA:
- Resultado: ${icpCard.promise}

EL MECANISMO ÚNICO:
${icpCard.uniqueMechanism}

OBJECIÓN TOP: ${step4?.topObjection ?? ''}
RESOLUCIÓN: ${step4?.topObjectionResolution ?? ''}

MIEDOS: ${icpCard.topFear}
CANALES: ${step5?.activeChannels.map(c => c.channel).join(', ') ?? ''}
ANTI-ICP: ${icpCard.antiICP}
`.trim()
}

/**
 * Bloque de voz y guardrails (Bloque 1 del Prompt Maestro).
 * Define el tono y las palabras prohibidas.
 */
export function buildVoiceBlock(industryTone: 'formal' | 'cercano' | 'tecnico' = 'cercano'): string {
  const toneInstructions = {
    formal:  'Formal y profesional. Usted. Sin jerga ni informalidades.',
    cercano: 'Conversacional y cercano pero profesional. Tú. Natural, no corporativo.',
    tecnico: 'Técnico pero accesible. Tú. Preciso sin ser frío.',
  }

  return `
═══ INSTRUCCIONES DE VOZ (Bloque 1) ═══

TONO: ${toneInstructions[industryTone]}
IDIOMA: Español mexicano. Nivel de lectura 6° grado.
Escribe en las palabras del CLIENTE — no en vocabulario técnico de la industria.

SIEMPRE:
- Articular el dolor ANTES de la solución
- Toda promesa incluye resultado medible O tiempo específico
- Cada pieza termina con UNA sola acción clara

NUNCA USAR:
"solución innovadora", "clase mundial", "comprometidos con la excelencia",
"a tu medida", "servicio integral", "líder en el sector",
"de calidad", "personalizado", "expertos en..."
`.trim()
}
```

---

### `lib/prompts/cold-outreach.ts` — Bloque 2: Captación Fría

```typescript
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'
import { buildBaseContext, buildVoiceBlock } from './context'
import type { AITask } from '@/types/ai.types'

interface PromptPair {
  systemPrompt: string
  userPrompt: string
  task: AITask
}

/**
 * Secuencia completa de email frío (5 toques: días 1, 3, 7, 14, 21).
 */
export function buildColdEmailSequencePrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): PromptPair {
  return {
    task: 'email_cold',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Eres experto en email frío B2B para negocios mexicanos.
Genera 5 emails fríos en secuencia para prospectos que nunca han escuchado del negocio.
RESPONDE SOLO CON EL CONTENIDO — sin introducción ni explicación.`,

    userPrompt: `Genera la secuencia completa de 5 emails fríos.

Prospecto objetivo: ${icpCard.archetypeName}
Su dolor: ${icpCard.mainPain}
Lo que ya probaron: ${icpCard.previousSolutionsTried}

ESTRUCTURA OBLIGATORIA para cada email:
EMAIL [N] — DÍA [X]
SUBJECT: [máx 7 palabras, sin "oportunidad", "propuesta" ni "oferta"]
CUERPO:
[El email completo]
---

REGLAS POR EMAIL:
Email 1 (Día 1): SOLO el dolor — sin mencionar el negocio ni el servicio.
Abre con el dolor. Termina con una pregunta cerrada. Máx 120 palabras.

Email 2 (Día 3): El Mecanismo Único. Por qué fallaron las soluciones anteriores.
Revelar el enfoque diferente sin hacer demo. Máx 150 palabras.

Email 3 (Día 7): Caso de éxito. Cliente similar, resultado específico con número.
No usar nombre del cliente — "una empresa del sector en CDMX". Máx 160 palabras.

Email 4 (Día 14): La pregunta directa. Breve. Verificar si el timing es el problema.
Máx 80 palabras totales. Respetar el tiempo del prospecto.

Email 5 (Día 21): Cierre de la secuencia. Último mensaje.
Cerrar con dignidad + una entrega de valor genuina + puerta abierta específica.
Sin drama. Máx 130 palabras.`,
  }
}

/**
 * Mensajes de LinkedIn (solicitud + 3 mensajes de seguimiento).
 */
export function buildLinkedInSequencePrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): PromptPair {
  return {
    task: 'linkedin_messages',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock('formal')}

Eres experto en outreach de LinkedIn B2B para México.
RESPONDE SOLO CON EL CONTENIDO SOLICITADO.`,

    userPrompt: `Genera la secuencia de LinkedIn para ${icpCard.archetypeName}.

MENSAJE 1 — SOLICITUD DE CONEXIÓN (máx 300 caracteres):
Menciona algo específico del perfil del prospecto. Sin presentar el servicio.
La razón de conexión debe ser relevante para su trabajo.

MENSAJE 2 — PRIMER MENSAJE POST-CONEXIÓN (día 2, máx 150 palabras):
Agradecer la conexión sin servilismo. Observación sobre el problema que enfrenta.
Una pregunta abierta sobre cómo lo manejan. Sin revelar que vendemos la solución.

MENSAJE 3 — SEGUIMIENTO SIN RESPUESTA (día 7, máx 100 palabras):
No mencionar que no respondieron. Entregar valor: insight o dato sobre su industria.
Relacionado con: ${icpCard.mainPain}

MENSAJE 4 — SI RESPONDIÓ (máx 180 palabras):
Responder con insight adicional. Proponer conversación de 20 minutos.
Dar razón específica de qué van a obtener en esos 20 minutos.`,
  }
}

/**
 * Mensajes de WhatsApp frío (3 toques).
 */
export function buildWhatsAppColdPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): PromptPair {
  return {
    task: 'whatsapp_messages',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock('cercano')}

WhatsApp tiene reglas estrictas: máx 3 líneas visibles antes del "Ver más".
Sin emojis en exceso. Sin links en el primer mensaje. Tono personal, no de bot.
RESPONDE SOLO CON LOS MENSAJES.`,

    userPrompt: `Genera 3 mensajes de WhatsApp frío para ${icpCard.archetypeName}.

MENSAJE 1 — PRIMER CONTACTO:
Contexto de por qué escribimos en la primera oración.
Referencia al problema: ${icpCard.mainPain}
Terminar con pregunta cerrada fácil de responder. Máx 3 líneas.

MENSAJE 2 — SEGUIMIENTO DÍA 3 (sin respuesta):
No mencionar el mensaje anterior. Entregar algo de valor en 2 líneas.
Terminar con pregunta diferente.

MENSAJE 3 — ÚLTIMO INTENTO DÍA 7:
2 líneas máximo. Cierre limpio y respetuoso. Dejar la puerta abierta.`,
  }
}

/**
 * Copy para anuncios de Meta Ads (awareness + retargeting).
 */
export function buildAdsPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers,
  adType: 'awareness' | 'retargeting' = 'awareness'
): PromptPair {
  const isRetargeting = adType === 'retargeting'

  return {
    task: 'ads_copy',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Eres experto en copy para Meta Ads (Facebook e Instagram) para negocios mexicanos.
${isRetargeting
  ? 'Este anuncio va a personas que ya conocen el negocio — puedes ser más directo.'
  : 'Este anuncio va a audiencia fría — primero valor, luego oferta.'
}
RESPONDE SOLO CON LAS 3 VARIANTES EN EL FORMATO INDICADO.`,

    userPrompt: `Genera 3 variantes de copy para ads de ${adType} en Meta.

Para cada variante usa este formato exacto:
VARIANTE [A/B/C] — ÁNGULO: [nombre del ángulo]
HEADLINE (máx 40 caracteres): [headline]
TEXTO PRINCIPAL (máx 125 palabras): [copy]
CTA: [texto del botón]
---

${isRetargeting ? `
Variante A — El Mecanismo Único: Para quien ya sabe quiénes somos. Mostrar la diferencia específica de proceso.
Variante B — La Garantía: Para quien tiene miedo. La Godfather Offer al frente.
CTA de mayor compromiso que en awareness.
` : `
Variante A — Ángulo del problema: Abre con el dolor de ${icpCard.mainPain}
Sin mencionar el servicio en los primeros 2 párrafos. CTA de bajo compromiso.

Variante B — Ángulo del resultado: Abre con el after — cómo es cuando el problema está resuelto.
Contraste antes/después. CTA de bajo compromiso.

Variante C — Ángulo de la historia: Historia corta de un cliente similar (sin nombre).
La historia lleva naturalmente al a-ha del Mecanismo Único.
`}`,
  }
}
```

---

### `lib/prompts/nurture.ts` — Bloque 3: Consideración y Nurture

```typescript
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'
import { buildBaseContext, buildVoiceBlock } from './context'
import type { AITask } from '@/types/ai.types'

interface PromptPair { systemPrompt: string; userPrompt: string; task: AITask }

/**
 * Secuencia de 4 emails de nurture para leads que entraron
 * pero no han agendado una reunión.
 */
export function buildNurtureEmailPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): PromptPair {
  return {
    task: 'email_nurture',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Eres experto en email marketing para negocios mexicanos. El objetivo del nurture
es construir autoridad y confianza — NO vender directamente.
RESPONDE SOLO CON LOS 4 EMAILS.`,

    userPrompt: `Genera la secuencia de 4 emails de nurture para leads tibios.

EMAIL 1 — EDUCA (semana 1):
Un insight sobre la industria de ${answers.step2?.industry ?? 'su sector'} que no sea obvio.
Conectado con: ${icpCard.mainPain}
Entrega algo accionable que puedan implementar aunque no compren.
CTA suave al final. Máx 250 palabras.

EMAIL 2 — DESAFÍA LA SUPOSICIÓN (semana 2):
Articular la suposición falsa más común sobre cómo resolver el problema.
La suposición que llevan a: "${icpCard.previousSolutionsTried}"
Explicar por qué esa suposición produce resultados inconsistentes.
Presentar el enfoque alternativo sin nombrarlo como servicio. Máx 220 palabras.

EMAIL 3 — CASO DE ÉXITO (semana 3):
Historia corta de un cliente similar — con resultado específico con número.
Perfil del cliente: similar a ${icpCard.archetypeName}
Resultado: ${icpCard.promise}
Terminar con: "¿Este caso se parece a la situación de tu negocio?" Máx 200 palabras.

EMAIL 4 — COSTO DE ESPERAR (semana 4):
Calcular el costo de inacción de forma específica para su industria.
Dato: ${icpCard.costOfInaction}
Reconocer que la decisión no es fácil — no minimizar sus preocupaciones.
CTA: última invitación a conversar. Máx 200 palabras.`,
  }
}
```

---

### `lib/prompts/closing.ts` — Bloque 4: Materiales de Cierre

```typescript
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'
import { buildBaseContext, buildVoiceBlock } from './context'
import type { AITask } from '@/types/ai.types'

interface PromptPair { systemPrompt: string; userPrompt: string; task: AITask }

/**
 * Propuesta comercial completa (6 secciones).
 */
export function buildProposalPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers,
  prospectName: string,
  prospectCompany: string
): PromptPair {
  return {
    task: 'proposal',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Eres experto en propuestas comerciales para negocios mexicanos B2B.
Una buena propuesta puede leerse en 5 minutos y producir la decisión de compra
sin necesitar otra reunión.
RESPONDE SOLO CON LA PROPUESTA — sin introducción.`,

    userPrompt: `Escribe la propuesta comercial completa para ${prospectName} en ${prospectCompany}.

La propuesta tiene 6 SECCIONES. Escribe cada una completa:

SECCIÓN 1 — PARA QUIÉN ES ESTA PROPUESTA (2 párrafos):
Describe el perfil exacto del cliente que más se beneficia.
${prospectName} debe reconocerse en este perfil.
Basado en: ${icpCard.archetypeName} / ${icpCard.profileDescription}

SECCIÓN 2 — EL PROBLEMA QUE RESUELVE (2-3 párrafos):
En segunda persona. Con consecuencias específicas. Sin juzgar al prospecto.
Basado en: ${icpCard.mainPain} / ${icpCard.costOfInaction}

SECCIÓN 3 — POR QUÉ LAS OTRAS OPCIONES NO SON SUFICIENTES (2 párrafos):
Analizar con respeto. No atacar — analizar el método.
Basado en: ${icpCard.previousSolutionsTried} — ${icpCard.uniqueMechanism}

SECCIÓN 4 — CÓMO LO RESOLVEMOS (2-3 párrafos):
El proceso específico que produce el resultado. El Mecanismo Único.
Basado en: ${icpCard.uniqueMechanism}

SECCIÓN 5 — LA INVERSIÓN:
Los planes disponibles con lo que incluye cada uno.
Presentar siempre con el ROI calculado al lado.
Promesa central: ${icpCard.promise}

SECCIÓN 6 — LA GARANTÍA Y EL SIGUIENTE PASO:
La garantía en términos exactos. El siguiente paso con fecha o plazo claro.

REGLAS GLOBALES:
- El nombre de ${prospectName} aparece al menos 3 veces
- Las primeras 2 secciones son solo prosa — sin bullets
- Máx 5 páginas A4 equivalente`,
  }
}

/**
 * One-pager completo.
 */
export function buildOnePagerPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): PromptPair {
  return {
    task: 'one_pager',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Genera un one-pager que se lea en 90 segundos y deje claro si es para el lector o no.
RESPONDE SOLO CON EL ONE-PAGER.`,

    userPrompt: `Escribe el one-pager completo. Estructura obligatoria:

HEADLINE: ${icpCard.promise} — máx 10 palabras, sin gerundios
EL PROBLEMA: ${icpCard.mainPain} — 2 oraciones en palabras del cliente
LA SOLUCIÓN: ${icpCard.uniqueMechanism} — 3 oraciones (qué hacemos y por qué es diferente)
RESULTADOS: 3 bullets con números concretos (basados en ${icpCard.promise})
PARA QUIÉN ES: 1 párrafo — ${icpCard.archetypeName}
LA GARANTÍA: 1 oración precisa
SIGUIENTE PASO: 1 oración + dato de contacto`,
  }
}

/**
 * Script de llamada completo (apertura + diagnóstico + 3 objeciones + cierre).
 */
export function buildCallScriptPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): PromptPair {
  return {
    task: 'call_script',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Un buen script de ventas suena como una conversación, no como una presentación leída.
Genera guías flexibles — no líneas para memorizar.
RESPONDE SOLO CON EL SCRIPT.`,

    userPrompt: `Genera el script completo de llamada de ventas.

PARTE 1 — APERTURA (guía de 30 segundos):
Presentarse, agradecer el tiempo, establecer la agenda, pedir permiso para hacer preguntas.

PARTE 2 — PREGUNTAS DE DIAGNÓSTICO (5 preguntas en orden):
De menor a mayor profundidad. Confirmando: ${icpCard.mainPain}, urgencia, autoridad de decisión.
Basadas en el perfil: ${icpCard.archetypeName}

PARTE 3 — TRANSICIÓN AL PITCH (1 párrafo):
Resumir lo que el prospecto dijo y conectarlo con lo que vamos a mostrar.

PARTE 4 — MANEJO DE OBJECIONES (3 objeciones con 3 movimientos cada una):

OBJECIÓN A: "${answers.step4?.topObjection ?? 'Es muy caro'}"
Movimiento 1 — Validar sin ceder (sin "entiendo", sobreusado)
Movimiento 2 — Reencuadrar con: ${icpCard.costOfInaction}
Movimiento 3 — Confirmar si era realmente precio o algo más

OBJECIÓN B: "Ya lo intentamos y no funcionó"
Movimiento 1 — Validar la experiencia
Movimiento 2 — El Mecanismo Único: ${icpCard.uniqueMechanism}
Movimiento 3 — La garantía como reductor de riesgo

OBJECIÓN C: "Déjame pensarlo / Lo consulto"
Movimiento 1 — Reconocer sin presionar
Movimiento 2 — Descubrir la razón real (pregunta específica)
Movimiento 3 — Definir siguiente paso concreto antes de terminar

PARTE 5 — CIERRE (3 escenarios):
A) Si hay interés claro: proponer siguiente paso específico
B) Si hay dudas: cómo dejar la puerta abierta con dignidad
C) Si definitivamente no es el momento: cerrar bien y definir cuándo retomar`,
  }
}
```

---

### `lib/prompts/reactivation.ts` — Bloque 5: Leads Inactivos

```typescript
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'
import { buildBaseContext, buildVoiceBlock } from './context'
import type { AITask } from '@/types/ai.types'

interface PromptPair { systemPrompt: string; userPrompt: string; task: AITask }

/**
 * Secuencia de reactivación para leads dormidos (30/60/90 días).
 */
export function buildReactivationPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): PromptPair {
  return {
    task: 'email_reactivation',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Los emails de reactivación que funcionan no mencionan que la persona no respondió.
Cada email retoma como si fuera una continuación natural con algo nuevo.
RESPONDE SOLO CON LOS 3 EMAILS.`,

    userPrompt: `Genera los 3 emails de reactivación para leads que llevan 30, 60 y 90 días sin responder.

EMAIL DÍA 30 — EL ÁNGULO NUEVO:
Abrir con algo nuevo: un dato del mercado, un cambio en ${answers.step2?.industry ?? 'su industria'},
o algo relacionado con ${icpCard.mainPain}.
Conectar ese dato con el problema original.
CTA suave: "¿Este tema sigue siendo relevante para ustedes?"
Máx 150 palabras. Sin mencionar que no respondieron.

EMAIL DÍA 60 — EL ÁNGULO DE PRUEBA SOCIAL:
Elegir UNO de estos ángulos (el que no se usó en el día 30):
a) Un resultado de un cliente similar al prospecto (sin nombre)
b) Una mejora o novedad del servicio
Terminar con la misma pregunta: "¿Este tema sigue siendo prioridad?"
Máx 150 palabras.

EMAIL DÍA 90 — EL BREAK-UP EMAIL:
ESTRUCTURA EXACTA:
Párrafo 1: Reconocer directo que escribimos varias veces. Sin drama.
Párrafo 2: Cierre: "Voy a dejar de escribirle a partir de hoy."
Párrafo 3: Una entrega de valor genuina sobre ${answers.step2?.industry ?? 'su industria'}.
Párrafo 4: Puerta abierta específica — qué tendría que cambiar para retomar.
Máx 120 palabras totales.`,
  }
}
```

---

### `lib/prompts/clients.ts` — Bloque 6: Materiales para Clientes Activos

```typescript
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'
import { buildBaseContext, buildVoiceBlock } from './context'
import type { AITask } from '@/types/ai.types'

interface PromptPair { systemPrompt: string; userPrompt: string; task: AITask }

/**
 * Secuencia de onboarding para cliente nuevo (bienvenida + semana 1).
 */
export function buildOnboardingSequencePrompt(
  icpCard: ICPCard,
  answers: WizardAnswers,
  clientName: string
): PromptPair {
  return {
    task: 'email_client',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

El onboarding debe hacer que el cliente nuevo sienta que tomó la decisión correcta
en los primeros 7 días — aunque los resultados principales aún no hayan llegado.
RESPONDE SOLO CON LOS 4 EMAILS.`,

    userPrompt: `Genera la secuencia de onboarding para ${clientName}, cliente nuevo.

EMAIL DE BIENVENIDA (día 0):
Celebrar la decisión sin exagerar. Sin "estamos emocionados de tenerte".
Los próximos 3 pasos específicos con fechas o plazos reales.
El primer resultado que van a ver y cuándo: ${icpCard.promise}
Cómo contactarnos con tiempo de respuesta comprometido. Máx 250 palabras.

EMAIL DÍA 2 — "TU SISTEMA YA TRABAJA":
Reportar la primera actividad concreta (bot activo, CRM listo, campaña enviada).
Tono: entusiasmo genuino, sin exagerar. Máx 80 palabras.

EMAIL DÍA 4 — EL PRIMER INSIGHT:
El primer dato relevante del sistema o un tip para maximizarlo esta semana.
Máx 100 palabras.

EMAIL DÍA 7 — RESUMEN DE SEMANA 1:
Qué pasó, qué funciona, qué se ajusta si algo no está al nivel esperado.
El hito de la semana 2. Máx 150 palabras.`,
  }
}

/**
 * Script de solicitud de referido (3 versiones: WhatsApp, Email, llamada).
 */
export function buildReferralRequestPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): PromptPair {
  return {
    task: 'email_client',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

La mejor solicitud de referido hace que el cliente sienta que le está haciendo
un favor a sus conocidos al presentarlos — no que les está "vendiendo" algo.
RESPONDE SOLO CON LAS 3 VERSIONES.`,

    userPrompt: `Genera el script de solicitud de referido en 3 versiones.

VERSIÓN WHATSAPP (máx 3 líneas):
Reconocer un resultado específico que tuvo el cliente.
Describir exactamente el perfil que más se beneficiaría (basado en ${icpCard.archetypeName}).
Explicar el beneficio de referir en una oración.

VERSIÓN EMAIL (máx 150 palabras):
Celebrar un resultado concreto.
Describir el perfil exacto de a quién podría referir.
El mecanismo del programa de referidos con términos exactos.

VERSIÓN VERBAL (guía de 2 minutos):
Cómo hacer la solicitud de forma natural en una llamada o reunión.
Incluir: cómo manejar el "no tengo a nadie en mente ahora mismo".`,
  }
}
```

---

### `lib/prompts/winback.ts` — Bloque 7: En Riesgo y Win-Back

```typescript
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'
import { buildBaseContext, buildVoiceBlock } from './context'
import type { AITask } from '@/types/ai.types'

interface PromptPair { systemPrompt: string; userPrompt: string; task: AITask }

/**
 * Secuencia de retención para cliente que quiere cancelar.
 */
export function buildRetentionPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers,
  cancellationReason?: string
): PromptPair {
  return {
    task: 'email_client',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

El objetivo no es retener a cualquier costo — es retener con integridad.
Si la razón de cancelación no es resoluble, cerrar bien es la prioridad.
RESPONDE SOLO CON LOS 3 MENSAJES.`,

    userPrompt: `Genera la secuencia de retención para un cliente que quiere cancelar.
${cancellationReason ? `Razón mencionada: "${cancellationReason}"` : 'Razón no especificada.'}

MENSAJE 1 — RESPUESTA INMEDIATA (WhatsApp o email):
Reconocer la solicitud sin defensividad.
Pedir 20 minutos antes de procesar — no para convencer, sino para entender.
Frase exacta del valor de esos 20 minutos.
Máx 100 palabras.

SCRIPT DE LA REUNIÓN DE RETENCIÓN:
a) Cómo escuchar primero — sin defender
b) Las 3 preguntas para identificar la causa raíz
c) Si es resoluble: proponer solución específica con plazo concreto
d) Si no es resoluble: cerrar con dignidad + ofrecer algo de valor para el siguiente paso

MENSAJE DE CIERRE (si confirman la cancelación):
Sin drama ni resentimiento.
Una entrega de valor genuina para su siguiente etapa.
La puerta abierta específica: qué tendría que cambiar para volver.
Máx 120 palabras.`,
  }
}

/**
 * Secuencia win-back para clientes que ya se fueron (30/60/90 días).
 */
export function buildWinbackPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): PromptPair {
  return {
    task: 'email_winback',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Win-back que funciona parte del reconocimiento honesto de que algo no funcionó.
Si el cliente siente que la empresa aprendió, la conversación de regreso es posible.
RESPONDE SOLO CON LOS 3 EMAILS.`,

    userPrompt: `Genera los 3 emails de win-back para clientes que cancelaron hace 30, 60 y 90 días.

EMAIL DÍA 30 — CHECK-IN GENUINO:
Preguntar cómo va su negocio sin agenda comercial visible.
Sin mencionar que se fueron ni el servicio. Solo interés real.
Máx 80 palabras.

EMAIL DÍA 60 — LA MEJORA CONCRETA:
Compartir una mejora real implementada en el servicio desde que se fueron.
Idealmente relacionada con la razón por la que cancelaron.
Sin hacer oferta. Solo informar. Máx 120 palabras.

EMAIL DÍA 90 — LA OFERTA DE REGRESO:
Una oferta específica con beneficio real (setup gratuito, descuento primer mes, etc.)
Vigencia real — no fabricada.
CTA concreto y fácil de tomar.
Máx 130 palabras. Sin sonar desesperado.`,
  }
}
```

---

### `lib/prompts/social.ts` — Bloque 8: Contenido Social

```typescript
import type { ICPCard, WizardAnswers, ChannelType } from '@/types/wizard.types'
import { buildBaseContext, buildVoiceBlock } from './context'
import type { AITask } from '@/types/ai.types'

interface PromptPair { systemPrompt: string; userPrompt: string; task: AITask }

/**
 * Calendario mensual completo de 30 posts.
 */
export function buildMonthlyCalendarPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers,
  month: string,
  previousMonthTopics?: string[]
): PromptPair {
  const channels = answers.step5?.activeChannels.map(c => c.channel) ?? ['instagram']
  const prevTopics = previousMonthTopics?.length
    ? `Temas del mes anterior (NO repetir): ${previousMonthTopics.join(', ')}`
    : ''

  return {
    task: 'posts_monthly',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Eres experto en contenido para redes sociales para negocios en México.
Genera contenido que construye autoridad y atrae al ICP correcto.
${prevTopics}
RESPONDE SOLO CON EL CALENDARIO EN EL FORMATO INDICADO.`,

    userPrompt: `Genera el calendario de 30 posts para ${month}.
Canales activos: ${channels.join(', ')}

DISTRIBUCIÓN OBLIGATORIA:
8 posts de EDUCACIÓN (enseñar algo valioso sobre ${answers.step2?.industry})
6 posts de DOLOR (articular el problema del ICP — crear reconocimiento)
5 posts de PRUEBA SOCIAL (resultados, testimoniales, casos)
5 posts de MECANISMO (explicar el diferenciador sin hacer pitch directo)
4 posts de COMUNIDAD (invitar a interacción, preguntas, debate)
2 posts de OFERTA (solo 2 en todo el mes — máximo)

FORMATO PARA CADA POST:
POST [número] — DÍA [fecha] — [CANAL] — [FORMATO: texto/carrusel/reel/imagen]
ÁNGULO: [educación/dolor/prueba social/mecanismo/comunidad/oferta]
HOOK (primera línea que para el scroll):
COPY COMPLETO:
CTA:
---

REGLAS:
- Los posts de educación y dolor NO mencionan el servicio
- El hook de cada post debe ser diferente — sin repetir fórmulas
- Los posts de carrusel tienen títulos para cada slide
- Los guiones de reel son de máx 80 palabras (30-60 segundos)
- Los posts de oferta tienen CTA directo pero no agresivo`,
  }
}

/**
 * Newsletter mensual completo.
 */
export function buildNewsletterPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers,
  monthTopic: string
): PromptPair {
  return {
    task: 'newsletter',
    systemPrompt: `${buildBaseContext(icpCard, answers)}\n\n${buildVoiceBlock()}

Un buen newsletter tiene lectores que responden con sus propias experiencias.
El objetivo es valor genuino — no vender en cada envío.
RESPONDE SOLO CON EL NEWSLETTER COMPLETO.`,

    userPrompt: `Escribe el newsletter mensual sobre: "${monthTopic}"
Para: ${icpCard.archetypeName}

ESTRUCTURA OBLIGATORIA:

SUBJECT LINE (máx 8 palabras, sin palabras genéricas):

SECCIÓN 1 — EL TEMA DEL MES (1 párrafo de apertura):
Por qué este tema importa para ${icpCard.archetypeName} ahora mismo.

SECCIÓN 2 — EL ANÁLISIS (2-3 párrafos):
Perspectiva propia sobre el tema. Algo que no se encuentra en Google en 5 minutos.
Conectado con: ${icpCard.mainPain} o ${icpCard.uniqueMechanism}

SECCIÓN 3 — LO CONCRETO (1-2 párrafos):
Qué hacer con este insight esta semana. Acciones específicas.

SECCIÓN 4 — EL CASO DEL MES (1 párrafo):
Un resultado de cliente que ilustra el punto del artículo. Sin nombre.

SECCIÓN 5 — EL CIERRE (1 párrafo corto):
Conexión natural con el servicio SOLO si aplica genuinamente.
Si no aplica, omitir esta sección.

Máximo 600 palabras totales.`,
  }
}
```

---

### `lib/prompts/bot.ts` — Bloque 9: El Prompt del Bot

```typescript
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'
import { buildBaseContext } from './context'

/**
 * Genera el prompt completo del bot de WhatsApp para GHL Conversation AI.
 * Este prompt se carga directamente en la configuración del bot en GHL.
 *
 * IMPORTANTE: Este es el prompt MÁS LARGO y MÁS CRÍTICO del sistema.
 * Un bot mal configurado puede arruinar la primera impresión del negocio.
 */
export function buildBotPrompt(
  icpCard: ICPCard,
  answers: WizardAnswers
): string {
  const step2 = answers.step2
  const step4 = answers.step4
  const channels = answers.step5?.activeChannels.map(c => c.channel) ?? []
  const isB2B = answers.step2?.icpType === 'b2b' || answers.step2?.icpType === 'mixed'

  return `
═══════════════════════════════════════════════════
PROMPT DEL ASISTENTE — ${step2?.businessName?.toUpperCase() ?? 'NEGOCIO'}
═══════════════════════════════════════════════════

SECCIÓN 1 — IDENTIDAD

Eres el asistente de atención de ${step2?.businessName ?? 'este negocio'}.
Tu nombre es "Asistente de ${step2?.businessName ?? 'nuestro equipo'}".
Respondes en español mexicano, de forma conversacional y profesional.
Nunca digas que eres una inteligencia artificial a menos que te lo pregunten directamente.
Si te preguntan, responde: "Soy el asistente de ${step2?.businessName}. ¿En qué te puedo ayudar?"
Máximo 3 líneas por mensaje. Una respuesta a la vez — nunca mandes 2 seguidos sin esperar.

═══════════════════════════════════════════════════

SECCIÓN 2 — SOBRE EL NEGOCIO

Ofrecemos: ${step2?.oneLiner ?? ''}

El resultado principal que obtenemos: ${icpCard.promise}

Lo que nos hace diferentes: ${icpCard.uniqueMechanism}

Para quién es mejor nuestro servicio:
${icpCard.profileDescription}

Para quién NO somos la opción correcta:
${icpCard.antiICP}

═══════════════════════════════════════════════════

SECCIÓN 3 — OBJETIVO DE LA CONVERSACIÓN

Tu objetivo en cada conversación, en este orden:

PASO 1: Entender si la persona tiene el perfil de cliente que más se beneficia
PASO 2: Identificar si tiene el problema que resolvemos y con qué urgencia
PASO 3: Si califica → agendar una sesión de diagnóstico de 20-30 minutos
PASO 4: Si no califica → responder sus preguntas con valor y cerrar amablemente

FLUJO DE CALIFICACIÓN — una pregunta a la vez, en este orden:

Primera respuesta a cualquier mensaje inicial:
"¡Hola [nombre si se presentaron]! Con gusto te oriento. Para poder darte la mejor
información, ¿me cuentas brevemente sobre tu negocio?"

Si describe su negocio:
"Gracias por contarme. ¿Cuál es el mayor reto que tienes ahora mismo en [área relevante]?"

Si describe el reto:
"Entiendo. ¿Llevas mucho tiempo con esto o es algo que surgió recientemente?"

${isB2B ? `Si parece calificado:
"¿Eres tú quien toma las decisiones sobre este tipo de inversión en tu negocio?"` : ''}

Si califica → proponer la sesión:
"Basándome en lo que me cuentas, creo que tenemos algo que te puede ayudar mucho.
Tenemos una sesión de diagnóstico de 20 minutos donde te mostramos exactamente cómo
funciona para un negocio como el tuyo. ¿Tienes disponibilidad esta semana?"

SEÑALES DE CALIFICACIÓN POSITIVA:
- Menciona alguno de estos problemas: ${icpCard.mainPain}
- Su negocio encaja con: ${icpCard.archetypeName}
- Tiene urgencia o un plazo específico

SEÑALES DE DESCALIFICACIÓN:
${icpCard.antiICP}
Si detectas estas señales → responder con valor pero no escalar a reunión.

═══════════════════════════════════════════════════

SECCIÓN 4 — MANEJO DE SITUACIONES ESPECÍFICAS

CUANDO PREGUNTAN EL PRECIO:
Nunca dar precio antes de la sesión de diagnóstico.
Responder: "Los planes dependen del tamaño y las necesidades de tu negocio.
Prefiero mostrarte qué incluye cada opción para que puedas comparar el valor,
no solo el precio. ¿Podemos ver eso en 20 minutos?"

CUANDO MENCIONAN ${icpCard.previousSolutionsTried.split(/,|\./)[0] ?? 'una alternativa'}:
Responder: "Es una opción que algunas empresas usan. Lo que nos diferencia es:
${icpCard.uniqueMechanism.substring(0, 150)}...
¿Eso es importante para lo que estás buscando?"

CUANDO DICEN "LO ESTOY PENSANDO" O "DAME MÁS INFORMACIÓN":
"Claro, ¿qué información específica te ayudaría a decidir?
Así te mando exactamente lo que necesitas en lugar de mandarte todo."

CUANDO DICEN "NO ES EL MOMENTO":
"Lo entiendo completamente. ¿Cuándo crees que sería mejor momento?
Así no te interrumpo antes de eso."
Registrar en CRM con la fecha mencionada.

CUANDO HACEN PREGUNTAS TÉCNICAS COMPLEJAS:
"Esa es una muy buena pregunta — para responderte bien necesito conectarte con
alguien de nuestro equipo que tiene todos los detalles. Te contactará en breve."
→ Escalar a agente humano.

CUANDO HAY UNA QUEJA O PROBLEMA:
RESPUESTA INMEDIATA: "Lamento escuchar eso. Quiero que esto se resuelva bien.
Dame un momento y te conecto con [nombre del responsable] de nuestro equipo."
→ Escalar INMEDIATAMENTE. No intentar resolver el conflicto en el bot.

═══════════════════════════════════════════════════

SECCIÓN 5 — CUÁNDO ESCALAR A UN AGENTE HUMANO

Escalar INMEDIATAMENTE cuando:
1. La persona pide hablar con alguien explícitamente
2. Hay una queja, problema o conflicto de cualquier tipo
3. La conversación involucra precios específicos o condiciones de contrato
4. Han pasado más de 4 intercambios sin avanzar hacia el agendamiento
5. El prospecto da señales claras de estar muy cerca de la decisión
6. Preguntas legales, técnicas complejas o de privacidad

Frase de transición al escalar:
"Para darte la atención que mereces, quiero conectarte con [nombre] de nuestro equipo,
quien puede responderte todo con detalle. Te escribe en breve."

═══════════════════════════════════════════════════

SECCIÓN 6 — REGLAS ABSOLUTAS

✗ NUNCA presionar ni crear urgencia falsa
✗ NUNCA prometer resultados que no estén en: ${icpCard.promise}
✗ NUNCA dar precio antes de la sesión de diagnóstico
✗ NUNCA enviar dos mensajes seguidos sin esperar respuesta
✗ NUNCA usar más de 3 líneas por mensaje
✗ NUNCA responder preguntas de competidores con críticas directas

✓ SIEMPRE una pregunta a la vez
✓ SIEMPRE confirmar entendimiento antes de avanzar
✓ SIEMPRE escalar conflictos inmediatamente
✓ SIEMPRE cerrar con respeto cuando no es el perfil correcto

Horario de atención del bot: 6am – 10pm hora de México.
Fuera de horario: "Gracias por escribirnos. Te respondo a primera hora mañana. 🌙"
`.trim()
}
```

---

## 2. Regeneración Mensual Automática

### `app/api/cron/monthly-regeneration/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateWithAI } from '@/lib/ai/client'
import { buildMonthlyCalendarPrompt } from '@/lib/prompts/social'
import type { ICPCard, WizardAnswers } from '@/types/wizard.types'

/**
 * Cron job que se ejecuta el día 1 de cada mes a las 6am México.
 * Regenera el calendario de posts para todos los clientes activos.
 * Configurar en vercel.json (ver Sección 4).
 *
 * Protegido con CRON_SECRET para que solo Vercel pueda llamarlo.
 */
export async function GET(req: NextRequest) {
  // Verificar que viene de Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const service = createServiceClient()
  const month = new Date().toISOString().substring(0, 7)   // "2026-07"
  const results = { processed: 0, errors: 0 }

  try {
    // Obtener todos los negocios con plan activo (no trial)
    const { data: businesses } = await service
      .from('businesses')
      .select('id, name')
      .in('plan', ['solo', 'pyme', 'empresa'])
      .eq('wizard_completed', true)

    if (!businesses?.length) {
      return NextResponse.json({ message: 'No hay negocios activos', results })
    }

    // Procesar de a 5 a la vez para no saturar la API de IA
    const BATCH_SIZE = 5
    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
      const batch = businesses.slice(i, i + BATCH_SIZE)

      await Promise.all(batch.map(async (business) => {
        try {
          await regenerateMonthlyContent(business.id, month, service)
          results.processed++
        } catch (err) {
          results.errors++
          console.error(`Error regenerating content for ${business.id}:`, err)
        }
      }))

      // Pausa entre batches para respetar rate limits
      if (i + BATCH_SIZE < businesses.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return NextResponse.json({
      success: true,
      month,
      results,
    })

  } catch (err) {
    console.error('Monthly regeneration cron error:', err)
    return NextResponse.json({ error: 'Error en cron job' }, { status: 500 })
  }
}

async function regenerateMonthlyContent(
  businessId: string,
  month: string,
  service: ReturnType<typeof createServiceClient>
) {
  // 1. Obtener el ICP activo y los datos del wizard
  const { data: icpProfile } = await service
    .from('icp_profiles')
    .select('icp_card, wizard_answers')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .single()

  if (!icpProfile) return

  const icpCard = icpProfile.icp_card as ICPCard
  const answers = icpProfile.wizard_answers as WizardAnswers

  // 2. Obtener los temas del mes anterior (para no repetir)
  const prevMonth = getPreviousMonth(month)
  const { data: prevPosts } = await service
    .from('materials')
    .select('content')
    .eq('business_id', businessId)
    .eq('type', 'posts_monthly')
    .eq('month', prevMonth)
    .single()

  const previousTopics = extractTopicsFromPosts(prevPosts?.content)

  // 3. Generar el nuevo calendario
  const { systemPrompt, userPrompt, task } = buildMonthlyCalendarPrompt(
    icpCard,
    answers,
    month,
    previousTopics
  )

  const result = await generateWithAI({
    task,
    systemPrompt,
    userPrompt,
    businessId,
    metadata: { type: 'monthly_regeneration', month },
  })

  // 4. Guardar en Supabase
  await service.from('materials').upsert({
    business_id: businessId,
    icp_version: icpCard.version ?? 1,
    type: 'posts_monthly',
    content: { text: result.content },
    month,
    is_approved: false,
  }, {
    onConflict: 'business_id,type,month',
  })

  // 5. Enviar email de notificación al cliente
  await notifyClientMonthlyReady(businessId, month, service)
}

function getPreviousMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  const prev = new Date(year, m - 2, 1)
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
}

function extractTopicsFromPosts(content: unknown): string[] {
  if (!content || typeof content !== 'object') return []
  const text = (content as { text?: string }).text ?? ''
  const matches = text.match(/HOOK[:\s]+([^\n]+)/g) ?? []
  return matches.slice(0, 10).map(m => m.replace(/HOOK[:\s]+/, '').trim())
}

async function notifyClientMonthlyReady(
  businessId: string,
  month: string,
  service: ReturnType<typeof createServiceClient>
) {
  const { data: business } = await service
    .from('businesses')
    .select('name, user_id')
    .eq('id', businessId)
    .single()

  if (!business) return

  const { data: userData } = await service.auth.admin.getUserById(business.user_id)
  if (!userData.user?.email) return

  // Enviar via Resend (el cliente de email transaccional)
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@10xteam.com.mx',
      to: userData.user.email,
      subject: `Tu contenido de ${month} está listo — revisa y aprueba`,
      html: `
        <p>Hola,</p>
        <p>Tu calendario de contenido para <strong>${month}</strong> ya está generado
        y listo para que lo revises.</p>
        <p>Incluye 30 posts distribuidos en los mejores días y horarios para tu audiencia.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/contenido?month=${month}"
           style="background:#2563EB;color:white;padding:12px 24px;border-radius:8px;
                  text-decoration:none;display:inline-block;margin:16px 0">
          Revisar y aprobar contenido →
        </a>
        <p>Si apruebas todo, se programa automáticamente en tus redes sociales.</p>
      `,
    }),
  }).catch(() => {})
}
```

---

## 3. Hooks del Dashboard

### `hooks/useICP.ts`

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ICPCard } from '@/types/wizard.types'
import type { ICPProfile } from '@/types/icp.types'

interface UseICPReturn {
  icpProfile: ICPProfile | null
  icpCard: ICPCard | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useICP(businessId: string): UseICPReturn {
  const [icpProfile, setIcpProfile] = useState<ICPProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchICP = useCallback(async () => {
    if (!businessId) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('icp_profiles')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .single()

      if (fetchError) throw fetchError

      setIcpProfile(data as unknown as ICPProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando el ICP')
    } finally {
      setIsLoading(false)
    }
  }, [businessId]) // eslint-disable-line

  useEffect(() => {
    fetchICP()
  }, [fetchICP])

  return {
    icpProfile,
    icpCard: (icpProfile?.card ?? icpProfile?.icp_card) as ICPCard | null,
    isLoading,
    error,
    refresh: fetchICP,
  }
}
```

---

### `hooks/useAIUsage.ts`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AIUsageSummary {
  totalCostUSD: number
  planAllowanceUSD: number
  percentUsed: number
  isOverage: boolean
  overageCostUSD: number
  byProvider: Record<string, { totalCostUSD: number; calls: number }>
  calls: number
}

interface UseAIUsageReturn {
  usage: AIUsageSummary | null
  isLoading: boolean
  month: string
}

export function useAIUsage(businessId: string, plan: string): UseAIUsageReturn {
  const [usage, setUsage] = useState<AIUsageSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const month = new Date().toISOString().substring(0, 7)
  const supabase = createClient()

  useEffect(() => {
    if (!businessId) return

    async function fetchUsage() {
      setIsLoading(true)

      try {
        // Uso del mes actual
        const { data: usageData } = await supabase
          .from('ai_usage')
          .select('cost_usd, provider, task')
          .eq('business_id', businessId)
          .eq('month', month)

        // Límite del plan
        const { data: allowanceData } = await supabase
          .from('plan_ai_allowances')
          .select('monthly_allowance_usd')
          .eq('plan', plan)
          .single()

        if (!usageData) return

        const totalCost = usageData.reduce((sum, row) => sum + Number(row.cost_usd), 0)
        const planAllowance = Number(allowanceData?.monthly_allowance_usd ?? 3)

        const byProvider = usageData.reduce((acc, row) => {
          if (!acc[row.provider]) acc[row.provider] = { totalCostUSD: 0, calls: 0 }
          acc[row.provider].totalCostUSD += Number(row.cost_usd)
          acc[row.provider].calls += 1
          return acc
        }, {} as Record<string, { totalCostUSD: number; calls: number }>)

        setUsage({
          totalCostUSD: totalCost,
          planAllowanceUSD: planAllowance,
          percentUsed: Math.min(Math.round((totalCost / planAllowance) * 100), 100),
          isOverage: totalCost > planAllowance,
          overageCostUSD: Math.max(0, totalCost - planAllowance),
          byProvider,
          calls: usageData.length,
        })
      } catch (err) {
        console.error('Error fetching AI usage:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsage()
  }, [businessId, month, plan]) // eslint-disable-line

  return { usage, isLoading, month }
}
```

---

### `hooks/useMaterials.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'

interface GenerateMaterialParams {
  type: string
  flow?: string
  businessId: string
  extraContext?: string
}

interface UseMaterialsReturn {
  generate: (params: GenerateMaterialParams) => Promise<string | null>
  isGenerating: boolean
  error: string | null
  lastGenerated: string | null
}

export function useMaterials(): UseMaterialsReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)

  const generate = useCallback(async (params: GenerateMaterialParams) => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.code === 'AI_LIMIT_REACHED'
          ? 'Alcanzaste el límite de IA de tu plan este mes. Actualiza tu plan o espera al próximo mes.'
          : data.error ?? 'Error generando el material'
        setError(errorMessage)
        return null
      }

      setLastGenerated(data.content)
      return data.content as string

    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return { generate, isGenerating, error, lastGenerated }
}
```

---

## 4. Configuración de Deploy en Vercel

### `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-regeneration",
      "schedule": "0 12 1 * *"
    }
  ],
  "functions": {
    "app/api/generate/icp/route.ts": {
      "maxDuration": 120
    },
    "app/api/generate/materials/route.ts": {
      "maxDuration": 60
    },
    "app/api/scrape/route.ts": {
      "maxDuration": 30
    }
  }
}
```

> **Nota sobre `maxDuration`:** La generación del ICP puede tardar hasta 90 segundos
> con Gemini Pro o Claude Sonnet en picos. El límite de 120 segundos da margen suficiente.
> Las funciones serverless de Vercel tienen 10 segundos por defecto — aumentar es obligatorio.

---

### Variables de Entorno en Vercel

```
# En Vercel Dashboard → Project → Settings → Environment Variables

# Agregar TODAS las variables del .env.local
# EXCEPTO: AI_DEV_MODE=true y GHL_MOCK_MODE=true (esas son solo para desarrollo)

# Variables adicionales solo para producción:
CRON_SECRET=                    # Generar con: openssl rand -hex 32
NEXT_PUBLIC_APP_URL=https://app.growth.10xteam.com.mx
```

---

### `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Optimizaciones de producción
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },

  // Redirección de la raíz al dashboard o login
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
```

---

## 5. Resumen Final: El Orden de Implementación Completo

Con las 5 partes del spec, este es el orden de construcción recomendado de inicio a fin:

```
SEMANA 1 — Infraestructura base
────────────────────────────────
□ Crear proyecto Next.js con la estructura de la Parte 1
□ Crear proyecto Supabase "10xteam-dev"
□ Ejecutar migraciones 01–09 en el SQL Editor de Supabase
□ Copiar todos los types (wizard.types.ts, ai.types.ts, ghl.types.ts)
□ Configurar .env.local con Gemini + Supabase + mocks activos
□ Verificar que el proyecto levanta con: npm run dev

SEMANA 2 — El Wizard (UI)
────────────────────────────────
□ Copiar ai.config.ts con resolveTaskConfig y AI_DEV_MODE
□ Copiar wizard.config.ts con las correcciones de bloques B_common
□ Implementar useWizard.tsx con Provider y Reducer
□ Implementar WizardShell + WizardProgress
□ Implementar Step1Entry (sin la llamada a scrape todavía)
□ Implementar Step2Business con el selector de ICP type
□ Implementar Step3ICP_B2B y Step3ICP_B2C
□ Implementar Step3ICP_Mixed con el selector y skip
□ Implementar Step4Process
□ Implementar Step5Channels con flujos y flujos personalizados
□ Implementar ICPScoreMeter con el score en tiempo real

SEMANA 3 — APIs y generación
────────────────────────────────
□ Implementar lib/jina/scraper.ts — probar con curl
□ Implementar app/api/scrape/route.ts — conectar con Step1Entry
□ Implementar lib/prompts/context.ts (buildBaseContext + buildVoiceBlock)
□ Implementar lib/ai/generators.ts — solo generateICPAndOutputs() primero
□ Probar la generación con datos mock via Postman antes de conectar la UI
□ Implementar lib/ghl/endpoints.ts — verificar que el mock funciona
□ Implementar app/api/generate/icp/route.ts
□ Conectar ProcessingScreen con la API real
□ Implementar ResultsScreen con los outputs generados

SEMANA 4 — Dashboard y materiales
────────────────────────────────
□ Implementar los hooks: useICP, useAIUsage, useMaterials
□ Implementar app/api/generate/materials/route.ts
□ Implementar las vistas del dashboard (ICP, Materiales, Bot, Campañas)
□ Implementar app/api/ghl/webhooks/route.ts
□ Probar el flujo completo de inicio a fin

ANTES DEL LANZAMIENTO
────────────────────────────────
□ Cambiar AI_DEV_MODE=false y configurar Claude API key
□ Cambiar GHL_MOCK_MODE=false y configurar GHL SaaS Pro
□ Crear los snapshots de industria en GHL
□ Llenar INDUSTRY_SNAPSHOT_MAP en ghl/endpoints.ts con los IDs reales
□ Configurar vercel.json con los timeouts y el cron job
□ Configurar todas las variables de entorno en Vercel
□ Deploy a producción
□ Probar el flujo completo en producción con un cliente beta
```

---

## 6. Lo que viene después del MVP

Una vez que el wizard y la plataforma están funcionando con los primeros clientes, estas son las mejoras de mayor impacto en orden de prioridad:

**Mejora 1 — Dashboard de métricas en tiempo real**
Conectar los webhooks de GHL con gráficas de leads, citas y conversiones que se actualizan en tiempo real via Supabase Realtime.

**Mejora 2 — Editor de materiales**
Permitir que el cliente edite inline los materiales generados y los regenere con instrucciones adicionales ("hazlo más formal" / "agrega urgencia").

**Mejora 3 — Social Planner automático**
Push de los posts aprobados directamente a GHL Social Planner via API con las fechas y horarios calculados automáticamente.

**Mejora 4 — ICP A/B testing**
Correr dos versiones del ICP simultáneamente y medir cuál genera mejores leads según los datos del CRM.

**Mejora 5 — Multi-negocio (para agencias)**
Permitir que un usuario administre múltiples negocios — el modelo de reventa para agencias que fue diseñado desde el inicio en la arquitectura de Supabase.

---

*10xTeam Wizard — Especificación Técnica Completa*
*5 partes · Arquitectura + Config + UI + APIs + Prompts*
*Versión 1.0 · 2026*
