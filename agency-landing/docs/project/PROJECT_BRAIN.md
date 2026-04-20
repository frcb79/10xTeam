# PROJECT BRAIN - Memoria del Proyecto
Plantilla para iniciar cualquier proyecto nuevo.
Se actualiza al final de cada sesion.

## INFO DEL PROYECTO
Nombre: Landing Page Agencia
Cliente: Interno (Nuestra Agencia)
Fecha inicio: 2026-04-19
Fase: MVP
Estado: Activo

## QUE ES ESTE PROYECTO
Plataforma web para posicionar nuestra agencia de desarrollo. Resolvemos el problema de empresas no-tech que necesitan crear software pero no pueden pagar un equipo interno. Ofrecemos calidad superior, equipos as-a-service y proyectos llave en mano a una fracción del costo (10x más barato).

## STACK
Frontend: Astro + React (Islands) + Vanilla CSS (Glassmorphism & Dark Mode)
Backend: N/A (SSG para máximo rendimiento SEO)
Deploy: Por definir (Vercel/Netlify recomendado)
Integraciones clave: Analytics, Contact Form

## OBJETIVOS DEL MVP
1. Proyectar una imagen de agencia grande, premium y con alta capacidad técnica.
2. Explicar el modelo "10x más barato que In-house" mediante tabla comparativa.
3. Generar leads/contactos a través del flujo de servicios y testimoniales.

## ESTADO ACTUAL
Completado:
- Discovery y Naming (10xTeam) finalizados.
- Arquitectura Astro inicializada con soporte SEO/SEM.
- Desarrollo completo del MVP UI (Hero, Servicios, Tabla 10x, Metodología, Testimonios, CTA).
- Documentación de proyecto (CHANGELOG, ERROR_LOG, DECISIONS, PROJECT_BRAIN) sincronizada.

En progreso:
- Despliegue en Vercel.

Pendiente:
- Conectar dominio personalizado.
- Crear páginas internas a futuro (si aplica).

Bloqueadores:
- Conflictos de `npm install` por Google Drive de forma local. (Resuelto usando Vercel o saliendo de Drive).

## DECISIONES CLAVE DE NEGOCIO Y TECNICAS
(Ver `DECISIONS.md`)
- Se eligió Astro por encima de SPAs tradicionales por su excelencia en métricas de conversión SEO y SEM.
- Naming "10xTeam" para posicionar valor agresivo de "Equipo élite a fracción de costo".

## RIESGOS ACTIVOS
- (Ver `ERROR_LOG.md`) `npm` en Windows falla al escribir debido al motor de sincronización de Google Drive.

## PROXIMOS PASOS (Sesión de Mañana)
1. **Research & Estrategia de Precios:** Investigar tabuladores reales y adecuados para LATAM/México (Modelo "Proyecto Llave en Mano" vs "Célula/Equipo Externo As-a-Service").
2. **Rediseño del Copy:** Reescribir los textos de la página. El mensaje actual no es lo suficientemente claro. Debe separar y explicar perfectamente ambas opciones de servicio.
3. **Refactor UI/UX:** Corregir el CSS para eliminar la saturación visual (elementos amontonados) y el "efecto zoom". Ajustar márgenes, padding y jerarquía visual para que se vea verdaderamente premium.

## HISTORIAL DE SESIONES
2026-04-19 - Inicio de proyecto, Discovery y Setup técnico. Creación del MVP inicial.
2026-04-19 (Cierre) - El CEO indica que el MVP requiere refactorización. Problemas identificados: UI amontonada, copy confuso y precios por recalibrar. Estos puntos quedan como prioridad #1 para la próxima sesión.
