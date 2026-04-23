# PROJECT BRAIN - Memoria del Proyecto
Plantilla para iniciar cualquier proyecto nuevo.
Se actualiza al final de cada sesion.

## INFO DEL PROYECTO
Nombre: Landing Page Agencia
Cliente: Interno (Nuestra Agencia)
Fecha inicio: 2026-04-19
Fase: MVP v0.2
Estado: Activo

## QUE ES ESTE PROYECTO
Plataforma web para posicionar nuestra agencia de desarrollo. Resolvemos el problema de empresas no-tech que necesitan crear software pero no pueden pagar un equipo interno. Ofrecemos calidad superior, equipos as-a-service y proyectos llave en mano a una fracción del costo (10x más barato).

## STACK
Frontend: Astro + Vanilla CSS (Glassmorphism & Dark Mode Premium)
Backend: N/A (SSG para máximo rendimiento SEO)
Deploy: Vercel (pendiente de re-deploy con v0.2)
Integraciones clave: Analytics, Contact Form (pendientes)

## OBJETIVOS DEL MVP
1. Proyectar una imagen de agencia grande, premium y con alta capacidad técnica.
2. Explicar los 3 modelos de servicio (MVP, Evolución Continua, Célula Dedicada) con precios transparentes y comparativo In-House.
3. Generar leads/contactos a través del flujo de Discovery.

## ESTADO ACTUAL
Completado:
- Discovery y Naming (10xTeam) finalizados.
- Arquitectura Astro inicializada con soporte SEO/SEM.
- Refactor completo de UI v0.2: nuevo Hero, Precios 3 columnas, Metodología 4 pasos, Terminal animada.
- Nuevo sistema de diseño CSS (tokens, animaciones, utilidades).
- Estrategia de precios definida (MVP $1,999 / Evolución $899/mo / Célula $3,999/mo).
- Documento operativo DISCOVERY_PROCESS.md creado (cuestionario, evaluación S/M/L/XL, cálculo de costos 70% margen, etapas de entrega).
- Documentación sincronizada (CHANGELOG, ERROR_LOG, DECISIONS, PROJECT_BRAIN).

En progreso:
- Re-deploy en Vercel con los cambios v0.2.

Pendiente:
- Conectar dominio personalizado.
- Formulario de contacto funcional.
- Analytics (Google Analytics / Plausible).

Bloqueadores:
- `npm install` / `npx` en Windows falla al escribir debido al motor de sincronización de Google Drive. (Workaround: usar Vercel directamente o salir de Drive).

## DECISIONES CLAVE DE NEGOCIO Y TECNICAS
(Ver `DECISIONS.md`)
- Astro SSG para SEO/SEM.
- Naming "10xTeam".
- 3 modelos de precios con margen mínimo de 70%.
- Proceso de Discovery estandarizado con cuestionario y evaluación S/M/L/XL.

## RIESGOS ACTIVOS
- (Ver `ERROR_LOG.md`) `npm` en Windows/Google Drive.

## PROXIMOS PASOS (Sesión 3)
1. **Formulario de contacto:** Integrar un form funcional (Formspree o similar).
2. **Refinar copy:** Iterar sobre los textos según feedback real de prospectos.
3. **Analytics:** Configurar tracking de visitas y conversiones (Google Analytics / Plausible).
4. **Generar assets visuales:** Crear imágenes/screenshots para redes sociales.
5. **Conectar dominio personalizado.**

## HISTORIAL DE SESIONES
2026-04-19 - Inicio de proyecto, Discovery y Setup técnico. Creación del MVP inicial.
2026-04-19 (Cierre) - El CEO indica que el MVP requiere refactorización. Problemas identificados: UI amontonada, copy confuso y precios por recalibrar.
2026-04-20 - Sesión de estrategia de precios y refactorización completa. Análisis de mercado (benchmarking global). Nuevos precios definidos (MVP $1,999 / Evolución $899/mo / Célula $3,999/mo). Refactor total de UI (Hero, Precios 3 columnas, Metodología 4 pasos, Testimonios). Creación de DISCOVERY_PROCESS.md operativo. Deploy exitoso a Vercel (https://10xteam.vercel.app).
