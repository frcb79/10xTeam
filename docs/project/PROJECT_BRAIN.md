# PROJECT BRAIN — Memoria del Proyecto
Base de este proyecto master.
Para nuevos proyectos de cliente usar `docs/project/PROJECT_BRAIN_TEMPLATE.md`.
Se actualiza AL FINAL de cada sesion.

## INFO DEL PROYECTO
Nombre: ai-team-os
Cliente: Operacion interna (Sistema del equipo)
Fecha inicio: 2026-04-17
Fase: Desarrollo
Estado: Activo

## QUE ES ESTE PROYECTO
Sistema operativo de trabajo para equipos de IA orientados a construir y entregar proyectos profesionales.
Sirve para que cada nuevo proyecto arranque con roles, protocolos, decisiones y memoria acumulada.
Resuelve el problema de empezar de cero en cada cliente y reduce errores repetidos.

## STACK
Frontend: N/A (repositorio de conocimiento y operacion)
Backend: N/A (documentacion y sistema de trabajo)
Deploy: GitHub (versionado del sistema)

## ESTADO ACTUAL
Completado:
- Estructura base del sistema (roles, protocolos, docs de proyecto, autonomia).
- Consolidación de la Landing Page 10xTeam con Astro en el repositorio maestro.
- Integración de Marketing Estratégico: "Diagnóstico Estratégico" y flujo de Intake.
- Sincronización y limpieza de archivos para evitar redundancias ("Clean State").
- Implementación de templates legales y comerciales profesionales.
- Separacion estructural de productos en el mismo repo: `dev.10xteam.com`, `growth.10xteam.com` y `shared`.

En progreso:
- Construccion de la linea growth (wizard + plataforma) en proyecto independiente.
- Automatización de la extracción de aprendizajes hacia TEAM_LEARNINGS.
- Implementacion del hub raiz `10xteam.com` para direccionar trafico entre dev y growth.

Actualizacion reciente:
- El Diagnóstico Estratégico Growth ya genera ICP y narrativas visibles (Resumen Ejecutivo, Buyer Persona, Belief Map y Voz) con Anthropic `claude-opus-5`, con salida JSON estructurada para proteger el contrato del reporte. Haiku/Sonnet quedan para clasificación, scoring, extracción y futuras tareas mecánicas como provisionar/mapear datos hacia GHL; no se usa Opus para ese flujo. Validado con `Consultoria Comercial QA` y build verde.
- Próxima iteración de calidad, no implementada: patrón Generator-Critic para el Diagnóstico. Opus 5 generará el borrador y una segunda llamada del mismo modelo, actuando como editor crítico, revisará y reescribirá contra las cinco reglas: cero repetición literal, anclaje a industria/dolor/consecuencia/anti-ICP, voz humana, Buyer Persona narrativo y referencia de calidad Clínica Sonrisa Plus. La segunda pasada ocurrirá antes de persistir el reporte final.
- Ajustados los prompts de ICP y narrativas de diagnóstico Growth para evitar repetición literal, anclar creencias a industria/dolor/consecuencia/anti-ICP y exigir voz humana con escenas operativas. Build verde; validación OpenAI confirma que para igualar el estándar editorial de Clínica Sonrisa Plus con respuestas de wizard muy breves será necesario evaluar un control de calidad adicional o un modelo más capaz en una decisión posterior.
- Corregida la calculadora de oportunidad del diagnóstico Growth: conteos separados de moneda, costo de tiempo mapeado a su cálculo propio y preservación de importes con `$` durante el render HTML. Validado con el registro real `Consultoria Gemini QA` y build verde.
- Logo aumentado 40% en todas las páginas de los 3 sitios (growth, dev, 10xteam.com) incluyendo nav, footer, pantallas legales, activation screen y diagnóstico template.
- Logo transparente desplegado en todos los `public/` — reemplazó versión antigua con fondo negro.
- Confirmado: los 3 proyectos Vercel NO auto-despliegan desde git push; requieren `vercel --prod --yes` con VERCEL_PROJECT_ID explícito desde repo root. IDs documentados en memoria de repo.
- `growth.10xteam.com` incorporó bloque base de conexion con GoHighLevel (OAuth callback/refresh/status) para arrancar integraciones reales por cuenta.
- `growth.10xteam.com` ya integra pricing canonico sin `iframe` en la landing principal, cargado de forma nativa desde fuente unica (`10x_pricing.html`) para acelerar cambios comerciales sin romper el resto del sitio.
- `10xteam.com` mejoro la experiencia visual del intro con transicion cinematica en dos fases (crossfade progresivo + encogimiento con mascara), incluyendo comportamiento responsive mas estable en mobile para eliminar efectos de corte y artefactos visuales.
- `growth.10xteam.com.mx` ya sirve el HTML comercial canonico aprobado, manteniendo intactos diseno, tipografias, colores y secciones; la mini seccion de servicios fue restaurada tras una eliminacion no deseada.
- `growth.10xteam.com` quedo con wizard operativo de 6 pasos mas consistente: prewizard en React tipado, rutas por tipo de cliente, fase economica final, pantalla de procesamiento y resumen final redisenados, mas bloque legacy de ICP estabilizado y publicado en `main`.
- `growth.10xteam.com` ahora enruta CTAs principales de la landing al wizard (`/wizard/step/1`) tanto en el HTML canonico como en el parche runtime de la ruta `growth-site`; adicionalmente, el dashboard pre-trial incluye vista previa temporal de `diagnostico-estrategico-10x-template.html` para operacion comercial inmediata.
- Proyecto Supabase real conectado (`.env.local` con URL/anon/service key reales) y Gemini API key cargada; `AI_DEV_MODE` se mantiene activo hasta tener tambien claves de Anthropic/OpenAI (evita romper tasks ruteados a esos proveedores).
- Corregido el parche de CTAs de `growth-site/route.ts`, que apuntaba a markup obsoleto y dejaba todos los botones de la landing ("Empieza gratis", "Quiero mi lugar Early Adopter", etc.) sin funcionar; ahora los 11 CTAs reales enrutan a `/wizard`.
- Eliminadas todas las menciones visibles de GoHighLevel/Calendly en superficie de usuario (dashboard, activation screen, pricing) para mantener white-label.

Pendiente:
- Lanzamiento oficial del piloto con cliente real.
- Medición de KPIs por unidad de negocio separada (dev vs growth).
- Definicion de despliegues independientes para `10xteam.com`, `dev.10xteam.com` y `growth.10xteam.com`.
- Credenciales reales pendientes de que el CEO las provea (bloqueante externo, no tecnico): proyecto Supabase real + migraciones 10-13 aplicadas, app OAuth de GHL (`GHL_CLIENT_ID`/`GHL_CLIENT_SECRET`), API key real de IA, URL real de calendario GHL. Sin esto, `/api/contact` y el boton "Conectar GHL" quedan implementados pero inactivos en produccion.
- Siguiente paso inmediato: una vez con credenciales reales, probar flujo E2E (wizard → agendar llamada → webhook actualiza status) y activar boton "Conectar GHL" con cuenta real.
- Pagos: por decision del CEO, se gestionan directo desde GHL (su sistema de cobro integrado); no se construye checkout propio (Stripe/Conekta) en este proyecto.

Bloqueadores:
- Ninguno tecnico. Pendiente de accion externa del CEO: ejecutar migraciones 10-13 en el proyecto Supabase real y cargar las variables en Vercel; alta de app GHL Marketplace (`GHL_CLIENT_ID`/`SECRET`); URL real de calendario de activacion.

## HISTORIAL
2026-04-17 — Sesion inicial: creacion de estructura base del sistema.
2026-04-17 — Sesion de expansion: nuevos roles clave y fortalecimiento estrategico de analytics.
2026-04-17 — Definicion de direccion: el sistema se opera como activo estrategico acumulable, no como plantilla estatica.
2026-05-25 — Reorganizacion del repo para operar dos lineas separadas: dev (desarrollo) y growth (prospeccion/plataforma), con carpeta shared para activos comunes.
2026-05-26 — Inicio de hub raiz `10xteam.com` para separar navegacion comercial por unidad de negocio.
2026-05-28 — Correccion de implementacion en growth: restauracion de la seccion de servicios y despliegue del HTML visual canonico en la raiz del subdominio.
2026-06-10 — Rebuild y cierre operativo del wizard de growth: rediseño de pantallas clave, expansion de copy por industria, incorporacion de fase economica, estabilizacion del wizard legacy y limpieza final del repo con build verde y pushes a `main`.
2026-06-10 — Mejora del hub `10xteam.com`: intro de video con salida cinematicamente suave (crossfade + mask shrink) y ajustes responsive en mobile para reducir efectos visuales extranos.
2026-06-10 — Growth comercial: CTAs de landing alineados a `/wizard/step/1`, preview temporal de Diagnostico Estrategico en dashboard pre-trial y push a `main` para continuidad de activacion.
2026-06-30 — Growth: correccion de build en Next 16 (proxy/middleware), cierre de base OAuth GHL y pricing canonico integrado en landing sin iframe, con build verde y rama sincronizada.
2026-07-02 — Growth: landing comercial completamente rediseñada (`growth.10xteam.nueva.website.html`) publicada en produccion reemplazando la anterior; incluye nav, footer, selector de moneda mejorado, pestañas visuales en add-ons, barras de progreso con contorno visible y arreglos de alineacion de tarjetas. Fix de build en `Step4Process.tsx`.
2026-07-15 — Growth: logo oficial `Logo_10xteam.png` integrado en nav y footer (optimizado de 4.5 MB a 47.7 KB, 320x213 px); contador Early Adopter actualizado de 1,000 a 2,000 lugares con calculo diario duplicado. Commits `b845fb5` en `main`, desplegado y verificado en produccion.
2026-08-11 — Ejecucion de plan de lanzamiento (dev + growth en paralelo): eliminado wizard legado `IcpWizard` (codigo muerto confirmado via `src/proxy.ts`), creado endpoint `POST /api/contact` con tabla nueva `contact_leads` en Supabase para capturar leads del formulario de dev.10xteam.com (antes se perdian, `action="#"`), agregado boton "Conectar con GoHighLevel" en dashboard de growth con helper de autorizacion OAuth, y corregidas variables de entorno GHL mal nombradas en `.env.local`. Build verde en ambos proyectos. Decision del CEO: pagos se gestionan directo desde GHL, no se construye checkout propio.