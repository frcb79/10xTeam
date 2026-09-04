# CHANGELOG — Historial de Cambios
Actualizar cada vez que se completa una feature.

## 2026-09-04 — Diagnóstico Growth: Claude Opus 5 y respuesta estructurada
- Se creó la tarea `diagnostic_narratives` y se configuró junto con `icp_generation` para usar Anthropic `claude-opus-5`, sin permitir que `AI_DEV_MODE` las redirija a otro proveedor.
- El cliente Anthropic ya maneja el formato de Opus 5: omite `temperature`, extrae el bloque `text` posterior al razonamiento adaptativo y usa `output_config.format` con JSON Schema para las narrativas.
- Las tareas estructuradas existentes del wizard conservan Haiku/Sonnet. Se documentó que el futuro provisioning/mapeo de datos hacia GHL usará también Haiku/Sonnet.
- Prueba real guardada: `diag_6d7c200c12cb`, generada con el mismo contexto rico de Consultoria Comercial QA. Sus cuatro secciones llegaron completas y con JSON válido. Build de producción verde.

## 2026-09-04 — Diagnóstico Growth: prompts de narrativa anclados al negocio
- Reescritos los prompts de ICP y narrativas en `src/lib/diagnostics/icp.ts` y `src/lib/diagnostics/report.ts` sin cambiar contratos, cálculos ni HTML.
- Se prohibió repetir oraciones entre secciones; el Belief Map debe cubrir dolor, consecuencia, alternativas, fricción operativa, costo de no actuar, mecanismo, precio y anti-ICP con activos y señales observables.
- Buyer Persona ahora requiere una escena de 3 a 5 oraciones, detalles operativos observables y un nombre ficticio. Voz exige piezas conversacionales, sin hashtags, emojis de venta ni fórmulas publicitarias genéricas.
- Se incorporó un few-shot breve de la referencia Clínica Sonrisa Plus únicamente como estándar de profundidad y tono. Validación con OpenAI `gpt-4o-mini` y build verde. Riesgo registrado: con inputs muy escuetos, este modelo aún puede generar prosa genérica; no se cambió proveedor ni se agregó lógica de reintento por mantener el alcance exclusivo de prompts.

## 2026-09-04 — Calculadora de oportunidad: importes y unidades corregidos
- Corregido el mapeo de la sección 08 del diagnóstico: `Costo de tiempo mensual` ahora usa `timeCostMonthly`, en lugar de reutilizar la oportunidad total mensual.
- Prospectos y clientes se renderizan como conteos con `prospectos/mes` y `clientes/mes`; los valores económicos usan el formatter compartido `formatCurrency()` y la unidad `MXN`.
- Corregida la sustitución de secciones HTML para no interpretar importes como `$15,000` o `$10,500` como referencias regex, preservando los montos completos.
- Validado contra el diagnóstico persistido `Consultoria Gemini QA`: ticket `$15,000`, costo de tiempo `$10,500`, valor de prospectos perdidos `$30,000`, crecimiento `$15,000`, oportunidad total `$55,500`; build de Growth en verde.

## 2026-08-28 — Wizard ICP: persistencia de borrador + prueba E2E completa en produccion
- Fix critico: el wizard guardaba su estado solo en memoria (React Context); cualquier recarga borraba todas las respuestas y el diagnostico salia con todo "Pendiente". Ahora `WizardProvider` persiste `WizardState` en `sessionStorage` y lo hidrata al cargar (`src/hooks/useWizard.tsx`, accion `HYDRATE` en `src/types/wizard.types.ts`).
- Estados transitorios (`processing`, `scraping`, `complete`, `error`) se sanitizan a `in_progress` al hidratar para no dejar al usuario atascado en la pantalla de procesamiento tras una recarga.
- Prueba E2E real en https://growth.10xteam.com.mx: landing -> wizard 6 pasos (con recarga intencional en paso 5, datos sobrevivieron) -> procesamiento -> /wizard/complete con resumen completo -> /activacion con preview estrategico poblado -> registro `diag_9taqykah` creado en Supabase `diagnostic_records` con status `call_pending`, source `wizard`, datos de contacto reales.
- Build verde, deploy a produccion, commit `25c7281` en `main`.
- Pendiente conocido (no bloquea): contenido AI del ICP sale como mock mientras `AI_DEV_MODE=true` y las tareas core apuntan a Anthropic sin key; URL de calendario sigue siendo placeholder (`calendar.10xteam.com.mx` no resuelve) hasta tener el link real.

## 2026-08-11 (2) — Credenciales Supabase/Gemini reales + fix de CTAs rotos y white-label en growth
- Cargadas credenciales reales de Supabase (URL, anon key, service role key) y Gemini API key en `growth.10xteam.com/.env.local`.
- Corregida la causa raiz de "ningun boton funciona" en la landing: `src/app/growth-site/route.ts` aplicaba parches de HTML contra markup viejo que ya no existe (`#demo`, `nav-logo`, `footer-link`, etc.). Reescrito `applyGrowthPatches()` para apuntar los 11 CTAs reales (`#trial`, `#prueba`, `#` sueltos) a `/wizard`.
- Eliminadas 3 menciones visibles de GoHighLevel/Calendly (white-label): boton "Conectar con GoHighLevel" -> "Conectar mi cuenta" en `/dashboard` (y su mensaje de fallback ya no expone nombres de variables de entorno); alert() en `10xteam_activation_screen.html`; bullet de `10x_pricing.html` (editado directo porque `pricing-canon/route.ts` sirve el HTML sin parches).
- Build verde verificado en growth.10xteam.com tras todos los cambios.
- Pendiente (accion externa, no tecnica): ejecutar migraciones 10-13 contra el proyecto Supabase real y cargar las mismas variables en Vercel; alta de app GHL Marketplace; URL real de calendario.

## 2026-08-11 — Ejecucion plan de lanzamiento: limpieza wizard legado + captura de leads dev
- Eliminado wizard legado (`src/components/icp-wizard.tsx`) y su uso en `src/app/page.tsx` (confirmado codigo muerto: `src/proxy.ts` siempre reescribe "/" a "/growth-site").
- Nuevo endpoint `POST /api/contact` en growth.10xteam.com con CORS restringido por origen (`CONTACT_ALLOWED_ORIGINS`), validacion de campos y persistencia en nueva tabla Supabase `contact_leads` (migracion `docs/project/migrations/13_create_contact_leads.sql`).
- Formulario de contacto en `dev.10xteam.com/src/pages/index.astro` conectado via fetch a `https://growth.10xteam.com.mx/api/contact` (antes `action="#"`, no enviaba datos a ningun lado).
- Agregado boton "Conectar con GoHighLevel" en `/dashboard` de growth, usando nuevo helper `src/lib/ghl/authorize.ts` que arma la URL de autorizacion OAuth desde `GHL_CLIENT_ID`/`GHL_REDIRECT_URI`; se corrigieron nombres de variables en `.env.local` (antes `GHL_API_KEY`/`GHL_AGENCY_ID`, no usadas por el codigo real de OAuth).
- Build verde verificado en growth.10xteam.com (`npm run build`) y dev.10xteam.com (`npm run build`).
- Pendiente (fuera del alcance de este cambio, requiere accion externa del CEO): credenciales reales de Supabase y de la app GHL (`GHL_CLIENT_ID`/`GHL_CLIENT_SECRET`), sin las cuales /api/contact y /dashboard "Conectar GHL" quedan funcionales en codigo pero inactivos en produccion.

## 2026-07-25 — Logo +40% en todas las páginas + logo transparente en producción
- Logo aumentado 40% (nav: 40px→56px, footer: 42px→59px, pantallas legales: 38px→53px) en los 6 archivos HTML/Astro de los 3 sitios.
- Logo transparente (`Logo_10xteam.png` raíz de growth) reemplazó versión antigua con fondo negro en todos los `public/` (growth, dev, 10xteam.com).
- Deploy forzado manualmente en los 3 proyectos Vercel — confirmado que NO auto-despliegan desde git push.
- IDs de proyectos Vercel documentados en memoria de repo para uso futuro.
- Archivos modificados: `growth.10xteam_website.html`, `10xteam_activation_screen.html`, `public/diagnostico-estrategico-10x-template.html`, `10xteam.com/index.html`, `10xteam.com/styles.css`, `dev.10xteam.com/src/pages/index.astro`, `privacidad.astro`, `terminos.astro`.

## 2026-07-15 — Growth: logo oficial + contador Early Adopter a 2,000
- Logo `Logo_10xteam.png` procesado y optimizado (2528x1684 → 320x213 px, 4.5 MB → 47.7 KB) con interpolación bicúbica de alta calidad.
- Logo integrado en nav (32 px alto, `loading="eager"`) y footer (36 px alto, `loading="lazy"`) reemplazando el texto plano anterior.
- Contador Early Adopter actualizado: capacidad 1,000 → **2,000**, base 127 → 254, incremento diario duplicado; textos en popup, barra FOMO y CTA final actualizados.
- Build verde, desplegado a `https://growth.10xteam.com.mx` y verificado con HTTP 200 en logo y página.
- Commits: `b845fb5` en `main`.

## 2026-07-02 — Growth: nueva landing comercial en produccion
- Landing completamente rediseñada (`growth.10xteam.nueva.website.html`) sustituye la anterior como fuente canónica.
- Incluye: nav sticky, footer adaptado, selector MXN/USD mejorado con banderas, pestañas visuales en add-ons y packs de soporte, barras de progreso con contorno, tarjetas de testimonios alineadas, párrafos de 3 líneas controladas, icon de métrica actualizado, popup limpiado.
- Fix de TypeScript en `Step4Process.tsx` para `mainCompetitors` evitando split sobre tipo `never`.
- Commits: `8b9c7e4` en `main`.

## 2026-06-30 — Growth: estabilidad Next 16 + pricing canonico nativo
- Se corrigio fallo de build en `growth.10xteam.com` por conflicto `middleware.ts` + `proxy.ts` (Next 16): se consolido la logica en `src/proxy.ts` y se elimino `src/middleware.ts`.
- Se ajusto `src/app/team/access/page.tsx` para cumplir prerender de Next 16 envolviendo `useSearchParams` con `Suspense`.
- Build final verificado en verde con rutas activas, incluyendo `pricing-canon` y rutas internas de team protegidas.
- Commits de estabilidad publicados en rama `feat/growth-wizard-ghl-mvp`:
	- `d8b3978` fix(growth): restore Next16 compatibility by consolidating proxy and team access suspense.
	- `b45643a` feat(growth): embed canonical pricing natively in landing without iframe.

## 2026-06-30 — Growth: base de conexion GoHighLevel (OAuth)
- Se creo bloque inicial de integracion OAuth para GHL con:
	- `src/app/api/ghl/oauth/callback/route.ts`
	- `src/app/api/ghl/oauth/refresh/route.ts`
	- `src/app/api/ghl/oauth/status/route.ts`
	- `src/lib/ghl/client.ts`
	- `src/lib/ghl/session.ts`
	- `src/types/ghl.types.ts`
- Objetivo del bloque: habilitar intercambio de codigo, refresh y verificacion de estado de conexion para avanzar a webhooks/eventos en siguiente iteracion.
- Commit publicado: `66b2a63`.

## 2026-06-10 — Growth: CTAs al wizard + preview de diagnostico en dashboard
- En `growth.10xteam_website.html`, se actualizaron CTAs comerciales clave para dirigir al wizard (`/wizard/step/1`) en lugar de `#demo` o enlaces inactivos.
- En `src/app/growth-site/route.ts`, se alineo el parche runtime para que nave, hero, tabs, pricing y footer dirijan a `/wizard/step/1`.
- En `src/app/dashboard/page.tsx`, se agrego seccion temporal "Diagnostico Estrategico 10x (Preview)" con boton de apertura y `iframe` al HTML publico.
- Se publico `public/diagnostico-estrategico-10x-template.html` para consumo directo desde el dashboard pre-trial.
- Commit/push de cierre: `bd74d5e` en `main`.
- Nota operativa para siguiente sesion: activar flujo post-agendamiento automatizado (estado + webhook + desbloqueo + notificacion interna).

## 2026-06-10 — Hub 10xteam.com mejora de intro cinematico (opciones 1 y 2)
- Implementacion de transicion de salida en dos fases para el video inicial del hub: estado intermedio `intro-near-end` (crossfade progresivo) y salida final `intro-complete`.
- Nueva animacion cinematica de mascara/encogimiento del contenedor de video (`clip-path` + `transform`) para revelar contenido sin corte brusco.
- Ajustes de mobile para evitar salto visual: el video ya no se desactiva por completo en <=880px, ahora usa framing y transicion mas corta/limpia.
- Refactor de logica JS del intro para sincronizar estados con la duracion real del video (con fallback maximo de 7s y disparo temprano cerca del final).

## 2026-06-10 — Wizard de growth estabilizado y publicado
- Rebuild del prewizard a componente React/TypeScript mantenible, reemplazando el enfoque fragil de HTML runtime injection dentro del flujo del wizard.
- Rediseño de flujo principal en `growth.10xteam.com`: Fase 2 mas clara, Fase 3 por tipo de cliente, Fase 4 con copy metodologico mas comercial, Fase 6 economica, pantalla de procesamiento simplificada y resumen final horizontal.
- Expansion de ejemplos y prompts por industria en salud, legal, financiero, restaurantes, retail, manufactura y ecommerce, con lenguaje orientado a Buyer Persona.
- Nuevo dashboard pre-trial y utilidades de oportunidad economica para aterrizar valor potencial del negocio.
- Estabilizacion del wizard legacy (`IcpWizard`) con prefill, scoring, generacion de ICP/materiales y correccion de contratos TypeScript para volver a build verde.
- Publicacion en `main` de todos los bloques funcionales y limpieza del arbol de trabajo al cierre de sesion.

## 2026-05-27 — Activacion de dominios .com.mx en produccion
- Actualizacion de Vercel CLI y autenticacion de sesion para operacion de dominios.
- Asignacion de dominio raiz y subdominios por deployment/proyecto:
	- `10xteam.com.mx` y `www.10xteam.com.mx` al hub.
	- `dev.10xteam.com.mx` a dev.
	- `growth.10xteam.com.mx` a growth.
- Validacion tecnica completa: DNS resuelto y respuesta HTTP 200 en los cuatro hosts.

## 2026-05-28 — Growth queda alineado al HTML visual aprobado
- Restauracion de la mini seccion `Nuestros servicios / Dos servicios, un mismo objetivo: 10x` en el HTML comercial de growth.
- Implementacion de rewrite interno para que la raiz de `growth.10xteam.com.mx` sirva `growth.10xteam_website.html` con el mismo diseno, colores, fuentes y secciones aprobadas.
- Nuevo deploy y reasignacion del alias del subdominio a la version corregida, con validacion del texto restaurado en produccion.

## 2026-05-26 — Gobernanza de ejecucion: rol operativo y pendientes estrategicos
- Alta del rol `Asistente Operativo` para captura de ideas, recordatorios y pendientes accionables.
- Actualizacion de tabla de equipo en `.github/copilot-instructions.md` para activacion explicita del rol.
- Definicion de criterio operativo: los pendientes estrategicos de growth se documentan en memoria de `growth.10xteam.com` y no en el master.
- Inicio de implementacion del hub raiz `10xteam.com` con landing de enrutamiento a `dev.10xteam.com` y `growth.10xteam.com`.
- Configuracion de produccion para el hub: `vercel.json` (redirects `/dev` y `/growth`, headers), `robots.txt`, `sitemap.xml` y metadatos OG/canonical.

## 2026-05-25 — Split dev/growth en mismo repositorio
- Reorganizacion estructural de frontend en carpetas separadas:
	- `dev.10xteam.com` para la linea de desarrollo (sitio actual).
	- `growth.10xteam.com` para la nueva linea de prospeccion/plataforma.
	- `shared` para activos reutilizables entre ambas lineas.
- Inicializacion de `growth.10xteam.com` con Next.js + TypeScript + App Router.
- Definicion de gobernanza: aprendizajes especificos se quedan en proyecto; solo patrones validados y reutilizables suben al master.

## 2026-05-02 — Consolidación de 10xTeam y Landing Agency
- Integración de activos de marketing estratégico y protocolos de "Strategy Intake".
- Implementación de sección "Auditoría Técnica Gratuita" y refinamiento de UI/UX.
- Actualización de precios a $2,249 y sistema de "Diagnóstico Estratégico".
- Sincronización total del repositorio maestro para evitar duplicados.
- Creación de templates legales (Privacidad y Términos).

## [FECHA] — Setup inicial
- Creacion del repositorio
- Estructura inicial del proyecto

## 2026-04-17 — Expansion estrategica del sistema de roles
- Creacion de nuevos roles en `docs/team`:
	- `14_SCRUM_MASTER.md`
	- `15_SALES_BIZDEV.md`
	- `17_AI_ENGINEER.md`
	- `18_CFO_FINANCIERO.md`
	- `19_COO_OPERACIONES.md`
	- `20_COMMUNITY_MANAGER.md`
	- `21_HIRING_ADVISOR.md`
- Actualizacion de `10_DATA_ANALYTICS.md` para enfoque estrategico empresarial:
	- Dashboards por audiencia (CEO, directivos, equipos).
	- Sistema de alertas proactivas.
	- Recomendaciones accionables por KPI.
	- Soporte de datos para reportes, presentaciones y contenido.

## 2026-04-17 — Formalizacion de memoria institucional del sistema
- Se documenta como decision activa que este repo es un activo estrategico vivo.
- Se establece como principio operativo: aprender en cada proyecto, guardar aprendizajes y reutilizarlos en los siguientes.