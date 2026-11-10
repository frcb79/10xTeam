# CHANGELOG - Historial de Cambios

## [Unreleased]
### Added
- **Integración Web3Forms para entrega de leads a `fcb@10xteam.com.mx`:**
  - Formulario Wholesale de Agencias (`#agency-modal`): envía correo inmediato con subject `[LEAD AGENCIA DEV] Solicitud Wholesale: {agencyName} ({country})`, datos de contacto, país detectado y requerimientos.
  - Formulario general de contacto (`#contact-form`): envía correo con subject `[LEAD DEV PROYECTO] Nuevo proyecto de {name} ({country})`.
  - Espejo asíncrono hacia `https://growth.10xteam.com.mx/api/contact` para persistencia en base de datos Supabase.
  - Protección honeypot (`botcheck`) contra spam.
- **Enlace y Modal exclusivo "Agencies" en Footer:** White-label wholesale engineering partner copy y formulario de solicitud.
- **Telemetría silenciosa de país:** Detección de país vía `api.country.is` con fallback de timezone sin alterar precios en pantalla.

### Changed
- **Estructura comercial internacional base:** Precios unificados a tarifas base internacionales:
  - MVP (Llave en Mano): Desde **$3,900 USD** (precio base de arranque por proyecto).
  - 10x Dev Squad: Desde **$4,900 USD/mes** (precio base mensual · célula a la medida).
- **Selector de idioma en Navbar:** Botón de cambio de idioma (`ES` / `EN`) con traducción dinámica por atributos `data-es` y `data-en`.
### Added
- Setup inicial de Astro.
- Estilos globales (`global.css`) con tema Dark Mode y Glassmorphism.
- Componentes principales en `index.astro`: Hero, Servicios, Comparativo 10x, Metodología, Casos de Éxito, CTA y Footer.
- Naming establecido a **10xTeam**.
- Memoria del proyecto (`PROJECT_BRAIN.md`) inicializada y actualizada.

### Changed
- Reorganizacion estructural del proyecto: carpeta movida de `agency-landing` a `dev.10xteam.com`.
- Definicion operativa: la unidad de desarrollo queda separada de growth y mantiene su oferta actual sin rediseño.

## [0.2.0] - 2026-04-20
### Changed
- **Refactor completo de UI/UX:** Nuevo sistema de diseño en `global.css` con más tokens, animaciones (float, fadeInUp, shimmer), y mejor jerarquía visual.
- **Reescritura de copy:** Hero con mensaje "10x más rápido, 10x más barato". Servicios actualizados con 4 cards (Web/SaaS, Móvil, Sistemas, IA).
- **Nueva sección de Precios:** 3 modelos (MVP desde $1,999, Evolución Continua $899/mo, Célula Dedicada $3,999/mo) con comparativo In-House visible.
- **Metodología:** Expandida a 4 pasos (Discovery, Setup, Entregas, Lanzamiento).
- **Testimonios:** Añadido tercer testimonio (FinTech). Stars rating visual.
- **Hero visual:** Terminal animada con "código" de deploy simulado.
- **Responsive:** Nuevo breakpoint system para tablet y móvil.

### Added
- `DISCOVERY_PROCESS.md`: Documento operativo completo con cuestionario de Discovery, modelo de evaluación interna (S/M/L/XL), cálculo de costos (70% margen), etapas de entregables y roadmap de equipo.
