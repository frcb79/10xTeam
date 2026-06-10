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
- `growth.10xteam.com.mx` ya sirve el HTML comercial canonico aprobado, manteniendo intactos diseno, tipografias, colores y secciones; la mini seccion de servicios fue restaurada tras una eliminacion no deseada.
- `growth.10xteam.com` quedo con wizard operativo de 6 pasos mas consistente: prewizard en React tipado, rutas por tipo de cliente, fase economica final, pantalla de procesamiento y resumen final redisenados, mas bloque legacy de ICP estabilizado y publicado en `main`.

Pendiente:
- Lanzamiento oficial del piloto con cliente real.
- Medición de KPIs por unidad de negocio separada (dev vs growth).
- Definicion de despliegues independientes para `10xteam.com`, `dev.10xteam.com` y `growth.10xteam.com`.
- Revision comercial final del wizard legacy y de la landing growth para decidir si se conserva, migra o retira el flujo duplicado `IcpWizard`.

Bloqueadores:
- Ninguno tecnico. Riesgo actual: coexistencia de wizard nuevo y wizard legacy puede generar retrabajo comercial si no se define pronto cual queda como flujo canonico.

## HISTORIAL
2026-04-17 — Sesion inicial: creacion de estructura base del sistema.
2026-04-17 — Sesion de expansion: nuevos roles clave y fortalecimiento estrategico de analytics.
2026-04-17 — Definicion de direccion: el sistema se opera como activo estrategico acumulable, no como plantilla estatica.
2026-05-25 — Reorganizacion del repo para operar dos lineas separadas: dev (desarrollo) y growth (prospeccion/plataforma), con carpeta shared para activos comunes.
2026-05-26 — Inicio de hub raiz `10xteam.com` para separar navegacion comercial por unidad de negocio.
2026-05-28 — Correccion de implementacion en growth: restauracion de la seccion de servicios y despliegue del HTML visual canonico en la raiz del subdominio.
2026-06-10 — Rebuild y cierre operativo del wizard de growth: rediseño de pantallas clave, expansion de copy por industria, incorporacion de fase economica, estabilizacion del wizard legacy y limpieza final del repo con build verde y pushes a `main`.