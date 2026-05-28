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

### Changed
- La raiz de `growth.10xteam.com.mx` ahora sirve el HTML comercial canonico (`growth.10xteam_website.html`) mediante rewrite interno, preservando exactamente diseno, colores, fuentes y secciones del archivo aprobado.
- Se restauro la seccion `Nuestros servicios / Dos servicios, un mismo objetivo: 10x` y su enlace de navegacion en la landing comercial.
