# CHANGELOG - Historial de Cambios

## [Unreleased]
### Added
- Setup inicial de Next.js con TypeScript, App Router y Tailwind.
- Estructura de documentacion del proyecto growth (`PROJECT_BRAIN`, `DECISIONS`, `CHANGELOG`, `ERROR_LOG`).
- Integracion del proyecto al modelo de repositorio con separacion dev/growth/shared.
- Landing inicial de growth con propuesta de valor y arquitectura base.
- Wizard ICP multistep con captura estructurada de negocio, cliente ideal, oferta y canales.
- Endpoint `POST /api/icp/materials` para transformar salida ICP en materiales accionables.
- Generador inicial de materiales multicanal: mensajes por canal, one-pager, pitch deck, guion de llamada y contenido social.
- Backlog estrategico dedicado (`docs/project/BACKLOG.md`) para capturar requerimientos del CEO y operarlos por prioridad/owner.
- Modelo inicial de funnel: PDF gratuito de ICP por correo, captura de lead, cita/cierre y login de plataforma privada para clientes contratados.
- Wizard Step 4 reforzado para capturar competidores en lista estructurada (hasta 10) con validacion minima de 5 obligatorios.
- Wizard Step 6 ahora captura contacto obligatorio (nombre, email, telefono/WhatsApp) antes de procesar el diagnostico.
- Diagnostico interno ahora muestra bloque de contacto para preparar handoff comercial y llamada.
- Endpoint `PATCH /api/diagnostics/current` para actualizar estado operativo del diagnostico actual.
- Resumen de wizard y activacion ahora marcan estado `call_pending` cuando el usuario dispara agenda.
- Endpoint base `POST /api/ghl/webhook` para mapear eventos de GHL a estados operativos (`call_booked`, `activated`) con proteccion por secreto opcional.
- Controles en vista interna `/team/diagnosticos` para operacion manual rapida de estado (`Marcar llamada agendada`, `Marcar activado`).
- Migracion `11_create_diagnostic_records.sql` para persistir diagnosticos y estados en Supabase a nivel servidor.
- Repositorio `src/lib/diagnostics/repository.ts` para upsert/lectura/actualizacion de diagnosticos por `diagnosticId`.
- Migracion `12_create_ghl_sessions.sql` para persistir sesiones OAuth de GHL por `company_id`/`location_id` en Supabase.
- Repositorio `src/lib/ghl/repository.ts` para upsert server-side de sesiones GHL.

### Changed
- La raiz de `growth.10xteam.com.mx` ahora sirve el HTML comercial canonico (`growth.10xteam_website.html`) mediante rewrite interno, preservando exactamente diseno, colores, fuentes y secciones del archivo aprobado.
- Se restauro la seccion `Nuestros servicios / Dos servicios, un mismo objetivo: 10x` y su enlace de navegacion en la landing comercial.
- CTAs de `10x_pricing.html` y `10xteam_pre_wizard.html` alineados a ruta canonica `/wizard/step/1` para eliminar enlaces inactivos o inconsistentes.
- Estado inicial del diagnostico al terminar wizard cambia a `wizard_completed` y transiciona a `call_pending` al iniciar agenda.
- Prompt de `POST /api/wizard/icp-generate` enriquecido con contexto explicito de competidores para aterrizar posicionamiento y estrategia.
- `POST/PATCH /api/diagnostics/current` ahora intenta persistencia en Supabase (cuando hay variables activas) y usa cookie como fallback.
- `POST /api/ghl/webhook` ahora prioriza actualizacion por `diagnosticId` en Supabase para permitir transiciones globales (`call_booked`, `activated`) fuera del contexto de navegador.
- `GET /api/ghl/oauth/callback` y `POST /api/ghl/oauth/refresh` ahora intentan persistir la sesion GHL en Supabase ademas de cookie.
- Pricing actualizado: hora suelta de soporte homologada a `$1,990 MXN` y nota visible en modal de 130+ funcionalidades sobre consumo de credito/costos variables.
- `GET /api/ghl/oauth/status` ahora permite lectura por `companyId/locationId` desde Supabase para continuidad cross-device (fallback a cookie).
- `POST /api/ghl/webhook` ahora registra heartbeat de integracion GHL en sesiones por `company/location` para trazabilidad operativa.
