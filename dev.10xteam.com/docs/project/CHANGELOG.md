# CHANGELOG - Historial de Cambios

## [Unreleased]
### Changed
- **Estructura comercial simplificada:** Precios actualizados a 2 planes principales: MVP ($1,890 USD pago único) y Squad ($2,790 USD/mes), eliminando el plan intermedio y centrando el grid de precios.
- **Geolocalización y adaptación por país:** Implementado script con detección vía `api.country.is` y fallback por zona horaria. Los precios se desacoplan del idioma y se rigen estrictamente por país (`data-price-mx` vs `data-price-intl`).
- **Selector de idioma en Navbar:** Agregado botón de cambio de idioma (`ES` / `EN`) que traduce dinámicamente elementos `[data-es][data-en]` sin alterar los precios asignados por región.
- Formulario de contacto y modal de salarios alineados a los 2 planes (MVP y Squad).
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
