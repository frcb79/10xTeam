# 10xteam Growth OS — Agencia definitiva y alta sin Snapshot (preparación)

**Estado:** arquitectura y código del piloto; sin autorización de creación real, sin merge a producción.

## Decisión de alcance

- Conservar Supabase existente y su modelo de usuarios/diagnósticos. No eliminar el proyecto: aunque no hay prospectos reales ni empresas comerciales, tiene usuarios Auth, tres sesiones del Wizard, planes Dev y QA, trazabilidad y roles.
- No transferir subcuentas vacías ni datos sintéticos desde la agencia temporal.
- Crear en la agencia definitiva cuentas separadas para Growth OS, 10xteam Dev, Crédito Negocios y LAB, con accesos y datos aislados. La existencia de otro negocio no constituye consentimiento para conectarlo.
- En el primer piloto, priorizar crear **subcuenta vacía por API** y después configurar/verificar activos. El parámetro `snapshotId` es opcional en HighLevel. Un Snapshot mínimo se considerará sólo cuando la operación API no sea suficiente y exista una configuración reutilizable validada.
- La API oficial de creación `POST /locations` está reservada al plan **Agency Pro US$497**. No asumir que Unlimited US$297 permite pruebas reales de alta automática.
- El API de formularios disponible aquí es principalmente de lectura; configurar manualmente el primer formulario o estudiar la alternativa de formularios propios + sincronización. No prometer alta completamente automática hasta probarlo.
- Los permisos OAuth, los tokens y `companyId` de la agencia antigua no son transferibles. Guardar el nuevo identificador y autorizar por el proveedor cuando esté lista la nueva agencia.

## Protección implementada en el piloto

El catálogo acepta `kind:"blank"` además de Snapshot y LAB existente. Se requiere release validado y referencia de revisión, permiso explícito del titular, autorización verificada del piloto, `GHL_PROVISIONING_ENABLED=true`, `GHL_LOCATION_CREATION_ENABLED=true` y la sesión exacta en `GHL_APPROVED_CREATION_SESSION_IDS`. No se configura nada por activarlo en el catálogo.

El proveedor requiere nombre del negocio, correo del titular y contexto antes de cualquier consulta o escritura de creación. Bloquea coincidencias de nombre/correo/dominio preexistentes por agencia. Usa bloqueo durable antes de POST. `kind:"blank"` **omite** `snapshotId`.

Tras crear la subcuenta vacía se registra `locationId` y el estado `waiting_provider`: **no** se marca configurada ni lista para operar. El reintento usa el ID guardado; no crea otra. Sólo se podrá marcar `configured` cuando existan y se verifiquen los activos reales del plan.

## Próximos ensayos autorizados

1. En un entorno de prueba con nueva agencia activa, configurar companyId y OAuth de agencia sin reutilizar credenciales antiguas.
2. Validar por lectura la agencia y el inventario; pedir autorización específica para crear **una** cuenta sintética y constatar que no hay duplicados.
3. Crear por API una cuenta vacía, verificar ID, propietario, agencia y estado pendiente. No vincular redes, pagos ni IA.
4. Preparar pipeline de cinco etapas vía API si el scope `pipelines.create` está disponible; verificar orden e idempotencia. Revisar Custom Values. Dejar formulario y workflows bajo control de habilitación y pruebas.
5. Probar un segundo tenant distinto, accesos independientes, manejo de reintentos y reconciliación.
6. Repetir E2E con datos `.test` y sólo después crear planes/snapshots reutilizables o usar el flujo con un cliente real.

Fuentes oficiales:
- https://marketplace.gohighlevel.com/docs/ghl/locations/create-location/
- https://marketplace.gohighlevel.com/docs/ghl/opportunities/create-pipeline/
- https://marketplace.gohighlevel.com/docs/ghl/locations/create-custom-value/
- https://marketplace.gohighlevel.com/docs/ghl/forms/forms/

## Credenciales y rutas al cambiar de agencia

- El modo **LAB** del adaptador se activa cuando existe `GHL_LAB_ACCESS_TOKEN` o `GHL_LAB_LOCATION_ID`. Para dar de alta cuentas en la **agencia definitiva**, crear un entorno Preview de agencia controlado donde **ambos estén ausentes** y utilizar un token OAuth **de agencia**; no reutilizar el token de LAB. Nunca mezclar tokens o IDs de agencia vieja y nueva.
- `GHL_COMPANY_ID` debe corresponder exactamente al token de agencia. La obtención del token de location usa la ruta oficial **v3** `POST /oauth/location-token` (con guion), no la ruta histórica `/oauth/locationToken`.
- Los planes sin derecho a `locations.write` no podrán ejecutar creación de subcuentas por API. HighLevel documenta esa API como **Agency Pro US$497**.
- Mantener `GHL_PROVISIONING_ENABLED` y `GHL_LOCATION_CREATION_ENABLED` ausentes/desactivados hasta consentimiento expreso por sesión, verificación del inventario y validación de costo.
- No replicar secretos sin scope por rama: en Vercel, `GHL_CLIENT_ID` y `GHL_CLIENT_SECRET` tienen dos entradas Preview (una general y otra de la rama del piloto). Conservar la rama y retirar las generales por la interfaz, después de revisar que no se utilizan en otras ramas. Sin tocar Production.
