# CHANGELOG — Historial de Cambios
Actualizar cada vez que se completa una feature.

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