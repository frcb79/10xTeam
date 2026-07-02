# PROJECT BRAIN - Memoria del Proyecto
Plantilla para iniciar cualquier proyecto nuevo.
Se actualiza al final de cada sesion.

## INFO DEL PROYECTO
Nombre: growth.10xteam.com
Cliente: Interno (10xTeam)
Fecha inicio: 2026-05-25
Fase: MVP v0.1
Estado: Activo

## QUE ES ESTE PROYECTO
Plataforma de prospeccion y crecimiento para pymes sobre infraestructura whitelabel.
Incluye wizard ICP, generacion de materiales comerciales y flujos de seguimiento.
El wizard tambien funciona como gancho comercial: entrega un PDF atractivo del ICP por correo, captura lead y abre la puerta a cita, cierre y login de plataforma privada para clientes activos.

## STACK
Frontend: Next.js 16 + TypeScript + Tailwind
Backend: Definir (integracion con whitelabel + capa IA)
Deploy: Vercel (pendiente)
Integraciones clave: GHL API/Webhooks, proveedor IA, analytics

## OBJETIVOS DEL MVP
1. Publicar landing comercial de growth con propuesta clara y separada de dev.
2. Entregar wizard ICP funcional (version inicial) con captura estructurada de datos.
3. Definir salida util del wizard para activar personalizacion de mensajes/materiales.

## ESTADO ACTUAL
Completado:
- Inicializacion de proyecto Next.js.
- Separacion de estructura en el repo: dev, growth y shared.
- Landing inicial de growth publicada en codigo base.
- Landing visual canonica de growth servida desde `growth.10xteam_website.html` en la raiz del subdominio para conservar exactamente diseno, fuentes, colores y secciones del HTML aprobado.
- Restauracion de la seccion "Nuestros servicios / Dos servicios, un mismo objetivo: 10x" dentro del HTML comercial de growth.
- Wizard ICP implementado por pasos (negocio, cliente ideal, oferta, canales, resumen).
- Endpoint interno `/api/icp/materials` para generar materiales por canal desde el output del wizard.
- Generacion inicial de materiales: one-pager, pitch deck, guion comercial y contenido social.

En progreso:
- Definicion de contrato de datos para integrar output del wizard con whitelabel.
- Capa comercial de conversion del wizard: captura estructurada de competidores, gate de contacto previo a procesamiento y limpieza de CTAs hacia ruta canonica.
- Trazabilidad operativa del funnel de activacion: estado `wizard_completed` al cierre y transicion a `call_pending` al disparar agenda.
- Cierre del loop operativo de estado con base webhook GHL y controles manuales internos para mover a `call_booked` y `activated`.
- Persistencia servidor de diagnosticos por `diagnosticId` en Supabase (con fallback a cookie mientras se activan variables/entorno).
- Persistencia servidor de sesion GHL por `company/location` para reducir dependencia de cookie y mejorar continuidad operativa.
- Lectura de estado GHL cross-device por `company/location` y trazabilidad de eventos webhook sobre sesiones conectadas.

Pendiente:
- Persistencia de resultados del wizard y versionado por cuenta.
- Integracion real con APIs externas de whitelabel.
- Implementar backlog estrategico de ejecucion documentado en `docs/project/BACKLOG.md`.
- Definir plantilla del PDF gratuito del ICP y flujo de captura por correo.
- Definir login/portal de cliente para acceso a contenido, ICP, materiales y seguimiento.
- Backoffice para versionado/mejora de prompts, seleccion configurable de modelos AI por tipo de contenido y workflow de market intelligence.
- Persistencia servidor de sesion/token GHL por company/location y webhook inicial para mover estado operativo (`wizard_completed -> call_pending -> call_booked -> activated`).

Bloqueadores:
- Ninguno.

## DECISIONES CLAVE DE NEGOCIO Y TECNICAS
- 2026-05-25: Growth se desarrolla como producto separado de dev para evitar mezcla comercial y tecnica.
- 2026-05-25: Se usa Next.js desde inicio para soportar landing + app wizard sin migracion posterior.
- 2026-05-28: La raiz de growth sirve el HTML visual canonico mediante rewrite interno para preservar fidelidad visual exacta mientras el proyecto mantiene Next.js para evoluciones de plataforma.

## RIESGOS ACTIVOS
- Alcance excesivo del MVP si se intentan lanzar todos los modulos a la vez.
- Dependencia de integracion whitelabel sin contrato de datos cerrado.
- Riesgo de dispersion operativa si no se prioriza semanalmente el backlog estrategico.
- Riesgo de friccion comercial si el gancho gratuito no luce suficientemente valioso o si el login llega demasiado pronto.

## PROXIMOS 3 PASOS
1. Priorizar backlog estrategico en bloque semanal (Top 3) y asignar owners - Owner: COO + Asistente Operativo.
2. Conectar output del wizard a almacenamiento (tabla/coleccion) - Owner: Backend.
3. Definir mapping de campos del ICP al whitelabel (payload final) - Owner: Arquitectura.

## HISTORIAL DE SESIONES
2026-05-25 - Creacion de proyecto growth. Separacion oficial de unidades dev/growth en el repo.
2026-05-25 - Implementacion base de landing + wizard ICP + endpoint de materiales por canal.
2026-05-26 - Captura de requerimientos estrategicos del CEO en backlog dedicado para pasar a ejecucion continua.
2026-05-28 - Restauracion de la seccion de servicios en el HTML comercial y despliegue de growth.10xteam.com.mx usando ese HTML como experiencia canonica del subdominio.
2026-07-01 - Inicio de implementacion comercial del nuevo plan: Step 4 con minimo 5 competidores estructurados, Step 6 con captura obligatoria de contacto y correccion de CTAs clave hacia `/wizard/step/1`.
2026-07-01 - Se implemento transicion de estado en diagnostico actual (`wizard_completed -> call_pending`) desde resumen y activacion, junto con endpoint PATCH para persistencia en cookie y mejora del prompt ICP con contexto competitivo explicito.
2026-07-01 - Se agrego endpoint base `POST /api/ghl/webhook` para mapear eventos de calendario/instalacion a estados (`call_booked`, `activated`) y controles operativos en `/team/diagnosticos` para mover estado manualmente mientras se completa persistencia servidor por cuenta.
2026-07-01 - Se agrego capa de persistencia en Supabase para `diagnostic_records` (migracion + repositorio server), integrando `POST/PATCH /api/diagnostics/current` y webhook GHL por `diagnosticId` para actualizar estados de forma global fuera del navegador.
2026-07-01 - Ajuste comercial puntual en pricing (hora suelta = `$1,990 MXN`) + nota en modal de funcionalidades sobre consumo de credito. Se avanzo persistencia de sesiones GHL en Supabase (`ghl_sessions`) conectada a callback/refresh OAuth.
2026-07-01 - Se habilito `oauth/status` para leer conexion GHL desde Supabase por `companyId/locationId` (fallback cookie) y el webhook ahora actualiza heartbeat de sesion para observabilidad de integracion.
