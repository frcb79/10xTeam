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
- Wizard ICP implementado por pasos (negocio, cliente ideal, oferta, canales, resumen).
- Endpoint interno `/api/icp/materials` para generar materiales por canal desde el output del wizard.
- Generacion inicial de materiales: one-pager, pitch deck, guion comercial y contenido social.

En progreso:
- Definicion de contrato de datos para integrar output del wizard con whitelabel.

Pendiente:
- Persistencia de resultados del wizard y versionado por cuenta.
- Integracion real con APIs externas de whitelabel.
- Configurar dominio growth.10xteam.com.
- Implementar backlog estrategico de ejecucion documentado en `docs/project/BACKLOG.md`.

Bloqueadores:
- Ninguno.

## DECISIONES CLAVE DE NEGOCIO Y TECNICAS
- 2026-05-25: Growth se desarrolla como producto separado de dev para evitar mezcla comercial y tecnica.
- 2026-05-25: Se usa Next.js desde inicio para soportar landing + app wizard sin migracion posterior.

## RIESGOS ACTIVOS
- Alcance excesivo del MVP si se intentan lanzar todos los modulos a la vez.
- Dependencia de integracion whitelabel sin contrato de datos cerrado.
- Riesgo de dispersion operativa si no se prioriza semanalmente el backlog estrategico.

## PROXIMOS 3 PASOS
1. Priorizar backlog estrategico en bloque semanal (Top 3) y asignar owners - Owner: COO + Asistente Operativo.
2. Conectar output del wizard a almacenamiento (tabla/coleccion) - Owner: Backend.
3. Definir mapping de campos del ICP al whitelabel (payload final) - Owner: Arquitectura.

## HISTORIAL DE SESIONES
2026-05-25 - Creacion de proyecto growth. Separacion oficial de unidades dev/growth en el repo.
2026-05-25 - Implementacion base de landing + wizard ICP + endpoint de materiales por canal.
2026-05-26 - Captura de requerimientos estrategicos del CEO en backlog dedicado para pasar a ejecucion continua.
