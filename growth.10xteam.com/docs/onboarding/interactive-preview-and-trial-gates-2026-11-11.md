# 10xteam Growth OS — Experiencia de demostración y activación posterior al Reporte 10xteam

Actualización: 11 de noviembre de 2026. Entorno: Preview `feat/intelligent-onboarding-pilot`. No aplica cambios en GHL ni en producción.

## Decisión de arquitectura

El reporte se genera a partir de selecciones rápidas, se muestran pasos de preparación **local** (sin simular análisis remoto), y el usuario entra a una **vista conceptual navegable** de Growth OS con su reporte en el primer módulo. Esta vista vive en nuestro sitio y no crea una subcuenta GHL. Las demás secciones son previsualizaciones sin datos reales ni ejecución: CRM, motor de prospectos, automatizaciones, marketing/IA, citas, analítica y Mi Inteligencia 10x.

**Justificación:** asignar una subcuenta GHL y recursos de IA antes de registrar tarjeta/contrato genera costos, cuentas abandonadas, abuso y reclamaciones. Sólo después de autorizar la oferta y verificar pago se aprovisionará un tenant real (o un piloto QA explícitamente aislado con datos sintéticos). La cuenta real se abre dentro de `app.growth.10xteam.com.mx` una vez preparada.

## Oferta comercial que debe resolverse antes de habilitar el cobro

La página pública `https://growth.10xteam.com.mx` verificada el 11/nov/2026 muestra dos planes:
- **10x Growth**: promoción $1,990 MXN/mes o US$129/mes; precio regular $2,990 o US$199; 1 subcuenta; setup $3,500 MXN o US$229.
- **10x Scale**: promoción $3,990 MXN/mes o US$349/mes; precio regular $5,990 o US$499; 3 subcuentas; setup $7,500 MXN o US$489.
- La landing anuncia **14 días sin tarjeta** y en varios lugares compromisos de resultados; la nueva propuesta consiste en **14 días SIN tarjeta**, confirmado como dirección comercial para el próximo piloto. El checkout nativo de HighLevel suele exigir tarjeta; la prueba sin tarjeta requiere alta GHL por API, límites, fecha de vencimiento y suspensión propias.
- Los precios sólo se muestran como **referencias públicas actuales**, no como contratos ya aprobados. En la Preview el alta real permanece **deshabilitada**: no existe formulario de pago, almacenamiento bancario ni envío de correos.

## Estados propuestos para el flujo real (no implementados aún)

1. `anonymous_report` — preguntas anónimas y reporte básico, con consentimiento para persistir si se solicita.
2. `interactive_preview` — módulos navegables de concepto; salida libre, formulario de razón opcional. La respuesta de abandono actual sólo es local y no se envía; antes de instrumentarla habrá que publicar aviso y consentimiento.
3. `identity_verified` — crear identidad en Supabase (sign-up real pendiente), vincular perfil de reporte sin perder sesión ni repetir respuestas. No habilitar datos de otros negocios.
4. `offer_accepted` — guardar plan, moneda, versión de términos, precio, setup, fecha exacta de facturación y autorización del usuario.
5. `trial_eligible` — verificar correo, aceptación de términos y permiso de alta; una prueba por negocio validado y sujeto a controles antifraude, cuota/consumo y agencia activa. SIN tarjeta. Sin cobros automáticos. La elegibilidad pura está implementada; el vínculo con Auth/GHL sigue pendiente.
6. `provisioning` — crear una subcuenta GHL **una sola vez**, asociar IDs por agencia y tenant, verificar pipeline, formularios, custom values, roles y estado de workflows en borrador; registrar evidencias reales.
7. `functional_ready` — comprobar una prueba sintética de formulario → contacto → oportunidad → tarea. Activar canales sólo tras consentimiento específico. No presentar como lista una cuenta con activos sin verificar.
8. `trial_active` — iniciar el contador de 14 días al verificar que la cuenta funciona, informar fecha y hora exactas, límites y recordatorios. Sin tarjeta ni renovación automática.
9. `trial_expiring` / `active_paid` / `expired` — recordatorios, conversión, facturación y suspensión programada idempotentes, sin suponer que HighLevel resuelve todo.

## Experiencia de finalización

Tras verificar correo y aceptar las condiciones: mostrar progreso **real** de aprovisionamiento; etapas no fingidas y recuperables ante errores, `create` idempotente. Instruir al cliente a abrir su CRM por `app.growth.10xteam.com.mx`; darle tres tareas iniciales específicas según perfil. Si no activa, permitir abandonar sin crear subcuenta; preguntar motivo opcional con consentimiento y sin manipulación comercial.

## Pendientes técnicos de P0

- Persistir y reclamar respuestas del reporte cuando el usuario cree identidad, con versionado, consentimiento y aislamiento.
- Decidir operación de plan/producto, setup/IVA y facturación; integrar cobro sólo si el cliente decide continuar tras la prueba; webhooks firmados y pruebas en staging.
- Conectar la agencia GHL definitiva mediante OAuth/agency scope; test con una sola cuenta sintética y sin mensajes.
- Reutilizar workflows por selección de perfil pero **sin publicar** hasta validar dependencias, canales y permisos.
- Montar `Mi Inteligencia 10x` como aplicación propia integrada con menú GHL y autenticación segura, **después** de estabilizar el Wizard y las altas.
- Pruebas E2E de la navegación, reportes con cero prospectos y sin tiempo manual, checkout cancelado, webhook duplicado, fallos GHL y pausa del trial.

## Evidencia / alcance

Las páginas `/reporte-10x` y `/diagnostico-wow` son Preview y todavía no generan registros, no consumen tokens ni crean contactos o cuentas. El reporte modelo y sus pruebas están implementados. Las páginas muestran referencias sectoriales y escenarios hipotéticos, **no** resultados obtenidos de fuentes verificadas para ese negocio. El código del flujo de pago no está implementado. La Preview no se publicará como acceso comercial antes de revisión conjunta.

## Dirección comercial revisada

- **Primero el reporte anónimo, luego el correo.** No pedir contraseña de GHL durante el diagnóstico. Tras seleccionar plan: nombre, correo, país, razón de negocio y términos mínimos; verificar correo antes de crear GHL. Auth y GHL deben vincular el reporte y separar tenants.
- **Acceso GHL real, no simulación para clientes.** La Preview ficticia sirve sólo para validar UX. La versión comercial debe crear subcuenta verdadera vía `POST /locations` con OAuth `locations.write` y plan Agency Pro/Founder, y configurar activos base. La API `POST /users` requiere contraseña fuerte; probar un flujo seguro de invitación/activación sin enviar credenciales permanentes por correo. No asumir que los magic links del Client Portal sirven para el CRM principal.
- **Mi Inteligencia 10x dentro de GHL.** Montar nuestra app segura como Custom Menu Link iframe o pestaña, restringido a cada subcuenta y titular. No confiar en `location.id` dentro de una URL como autenticación. El reporte y perfil quedan en Supabase.
- **Prueba sin tarjeta (14 días).** Un negocio validado por titular; cap de consumo IA y canales externos pagados desactivados por defecto. Recordatorios día 3/10/13; al día 14 suspender y ofrecer elección consciente de continuar y pagar. Creación idempotente contra duplicados.
- **Dos planes por capacidad.** Growth y Scale conservan núcleo funcional; Scale diferencia cantidad de negocios y crédito IA. Precios publicados actuales sujetos a revisión; no cerrar pricing desde el prototipo.
- **Personalización progresiva.** Preguntas públicas breves; roles y fuentes en porcentajes; procesos, objeciones, conexiones y métricas se recopilan después. La animación representa 9.5 segundos de preparación local, no análisis remoto inventado.
- **Activación del día 1.** Pipeline, primer formulario, tarea, oportunidad sintética y reportes; después ofrecer conexiones de correo/WhatsApp, agentes e IA con permisos específicos. Canales externos inactivos hasta aprobar.
- **Pendientes técnicos:** API de usuario/activación probada, cobro post-trial, suspensión y reactivación, trazabilidad, cuotas, reporte persistente integrado, GHL nueva agencia, Custom Menu Link y E2E. No hacer merge ni tocar producción sin aprobación.

Fuentes:
- https://marketplace.gohighlevel.com/docs/ghl/locations/create-location/
- https://marketplace.gohighlevel.com/docs/ghl/users/create-user/index.html
- https://help.gohighlevel.com/support/solutions/articles/155000008519-how-to-skip-credit-card-collection-for-0-orders-in-forms-and-surveys
- https://help.gohighlevel.com/support/solutions/articles/48001185767-how-to-add-a-custom-domain
