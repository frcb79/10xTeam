# 10xteam Growth OS — Experiencia de demostración y activación posterior al Reporte 10xteam

Actualización: 11 de noviembre de 2026. Entorno: Preview `feat/intelligent-onboarding-pilot`. No aplica cambios en GHL ni en producción.

## Decisión de arquitectura

El reporte se genera a partir de selecciones rápidas, se muestran pasos de preparación **local** (sin simular análisis remoto), y el usuario entra a una **vista conceptual navegable** de Growth OS con su reporte en el primer módulo. Esta vista vive en nuestro sitio y no crea una subcuenta GHL. Las demás secciones son previsualizaciones sin datos reales ni ejecución: CRM, motor de prospectos, automatizaciones, marketing/IA, citas, analítica y Mi Inteligencia 10x.

**Justificación:** asignar una subcuenta GHL y recursos de IA antes de registrar tarjeta/contrato genera costos, cuentas abandonadas, abuso y reclamaciones. Sólo después de autorizar la oferta y verificar pago se aprovisionará un tenant real (o un piloto QA explícitamente aislado con datos sintéticos). La cuenta real se abre dentro de `app.growth.10xteam.com.mx` una vez preparada.

## Oferta comercial que debe resolverse antes de habilitar el cobro

La página pública `https://growth.10xteam.com.mx` verificada el 11/nov/2026 muestra dos planes:
- **10x Growth**: promoción $1,990 MXN/mes o US$129/mes; precio regular $2,990 o US$199; 1 subcuenta; setup $3,500 MXN o US$229.
- **10x Scale**: promoción $3,990 MXN/mes o US$349/mes; precio regular $5,990 o US$499; 3 subcuentas; setup $7,500 MXN o US$489.
- La landing anuncia **14 días sin tarjeta** y en varios lugares compromisos de resultados; la nueva propuesta consiste en **14 días con tarjeta al activar**. Están en conflicto. No publicar checkout hasta unificar landing, FAQ, términos, setup, fecha y monto del primer cobro y política de cancelación.
- Los precios sólo se muestran como **referencias públicas actuales**, no como contratos ya aprobados. En la Preview el CTA de tarjeta está **deshabilitado**, no existe formulario de pago ni almacenamiento bancario.

## Estados propuestos para el flujo real (no implementados aún)

1. `anonymous_report` — preguntas anónimas y reporte básico, con consentimiento para persistir si se solicita.
2. `interactive_preview` — módulos navegables de concepto; salida libre, formulario de razón opcional. La respuesta de abandono actual sólo es local y no se envía; antes de instrumentarla habrá que publicar aviso y consentimiento.
3. `identity_verified` — crear identidad en Supabase (sign-up real pendiente), vincular perfil de reporte sin perder sesión ni repetir respuestas. No habilitar datos de otros negocios.
4. `offer_accepted` — guardar plan, moneda, versión de términos, precio, setup, fecha exacta de facturación y autorización del usuario.
5. `checkout_authorized` — recibir webhook firmado desde un proveedor de pagos y validar importe, plan, cliente, trial, idempotencia y tarjeta. No confiar sólo en retorno del navegador. No guardar PAN/CVV.
6. `provisioning` — crear una subcuenta GHL **una sola vez**, asociar IDs por agencia y tenant, verificar pipeline, formularios, custom values, roles y estado de workflows en borrador; registrar evidencias reales.
7. `functional_ready` — comprobar una prueba sintética de formulario → contacto → oportunidad → tarea. Activar canales sólo tras consentimiento específico. No presentar como lista una cuenta con activos sin verificar.
8. `trial_active` — iniciar el contador de prueba de acuerdo con el contrato y capacidades reales de SaaS/Stripe, idealmente alineado con `functional_ready`; si el proveedor inicia al checkout, definir buffer explícito y mensajes de transparencia.
9. `trial_expiring` / `active_paid` / `expired` — recordatorios, conversión, facturación y suspensión programada idempotentes, sin suponer que HighLevel resuelve todo.

## Experiencia de finalización

Tras confirmar tarjeta/condiciones: mostrar progreso **real** de aprovisionamiento; etapas no fingidas y recuperables ante errores, `create` idempotente. Instruir al cliente a abrir su CRM por `app.growth.10xteam.com.mx`; darle tres tareas iniciales específicas según perfil. Si no activa, permitir abandonar sin crear subcuenta; preguntar motivo opcional con consentimiento y sin manipulación comercial.

## Pendientes técnicos de P0

- Persistir y reclamar respuestas del reporte cuando el usuario cree identidad, con versionado, consentimiento y aislamiento.
- Decidir operación de plan/producto, setup/IVA y facturación; integrar proveedor y webhooks verificados en staging.
- Conectar la agencia GHL definitiva mediante OAuth/agency scope; test con una sola cuenta sintética y sin mensajes.
- Reutilizar workflows por selección de perfil pero **sin publicar** hasta validar dependencias, canales y permisos.
- Montar `Mi Inteligencia 10x` como aplicación propia integrada con menú GHL y autenticación segura, **después** de estabilizar el Wizard y las altas.
- Pruebas E2E de la navegación, reportes con cero prospectos y sin tiempo manual, checkout cancelado, webhook duplicado, fallos GHL y pausa del trial.

## Evidencia / alcance

Las páginas `/reporte-10x` y `/diagnostico-wow` son Preview y todavía no generan registros, no consumen tokens ni crean contactos o cuentas. El reporte modelo y sus pruebas están implementados. Las páginas muestran referencias sectoriales y escenarios hipotéticos, **no** resultados obtenidos de fuentes verificadas para ese negocio. El código del flujo de pago no está implementado. La Preview no se publicará como acceso comercial antes de revisión conjunta.
