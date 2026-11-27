# Consultoría LAB — control de avance del piloto QA (2026-11-10)

## Propósito y límites

Comprobaciones de la subcuenta de pruebas **10x LAB — Consultoría**. Este registro documenta verificaciones de lectura y asignaciones específicas; no acredita la ejecución completa del Wizard ni autoriza cambios comerciales, producción, publicaciones, mensajes externos, cobros o uso de datos reales. La ruta QA se mantiene separada de la futura alta de 10xteam Dev.

## Estado confirmado en Supabase

- Sesión QA exclusiva: `0e8b0b88-8e71-4bc1-86e8-e8b3d273187a`.
- Plan preliminar: **v8**, `core-b2b`, marcado como `qa_quickstart`. Información inicial del negocio conservada; otros datos expresamente inferidos o pendientes.
- Sesión QA: **v10** tras autorizar **preparación CRM** (`provision_core_no_paid_services`) y **preparación de formularios** (`prepare_forms_no_paid_services`). Ambos consentimientos del titular se refieren al plan v8.
- Asignación exacta en `onboarding_reviewers`: operador `e89ff5d8-ace9-4e44-b3ff-69b9bb350ec9` sobre la sesión QA anterior; inserción idempotente y verificación posterior. Allowlist de operador ya vigente sólo en la rama Preview.
- Sin evidencia contractual; `provision.status=not_started`, sin `locationId`; no se ha configurado la cuenta desde el Wizard.
- Sesión Dev separada: `0b624aa6-7db1-46f2-b713-29481273c1ab`, plan y sesión v9, sin aprovisionar ni modificar.
- Última comprobación previa: cero rutas de formularios y cero entradas en la cola. Estas cifras son puntuales y deben releerse antes de cualquier ensayo de envío.

## Inventario GHL de solo lectura (MCP oficial)

Subcuenta **10x LAB — Consultoría**, ID `Be3Voe6UoPjiAawaQUCK`.

| Activo | Verificación |
|---|---|
| Pipeline | `FY7sgYVcrc2fY3lmwxE3` · 10x LAB — Ventas Consultoría |
| Etapas en orden | Nuevo prospecto → Calificación → Diagnóstico → Propuesta → Decisión |
| Formulario | `MuTtwELJ3O54P7lKVPcg` · Form 0 |
| Custom Values | Existen los seis nombres previstos y están sin valor: `10x_business_name`, `10x_offer`, `10x_ideal_customer`, `10x_primary_goal`, `10x_brand_voice`, `10x_preserve` |
| Calendarios | Ninguno; no son requisito del objetivo `leads` |
| Workflow | La búsqueda/API devuelve HTTP 403 `WORKFLOW_API_NOT_ENABLED_FOR_LOCATION`. El borrador previamente preparado por UI **no** se considera probado o publicado. Revisión manual requerida |

**No hay snapshot comercial importable aprobado.** Si se habilita LAB, usar `kind: existing_lab` con su inventario real; nunca inventar `snapshotId`. No marcar `validated:true` hasta revisar la definición, estado, destinatarios y comportamiento de los flujos.

## Bloqueos y siguiente ejecución controlada

1. **Evidencia de workflow:** verificar por UI las barreras de correo sintético y origen, ausencia de mensajes externos y comportamiento esperado; el error 403 es una restricción del proveedor, no un fallo de credenciales.
2. **Permiso separado de ejecución:** registrar autorización real de piloto para la sesión QA y alcance exacto de la LAB. No usar la autorización del verificador como consentimiento de ejecución o contrato.
3. **Catálogo de activos:** registrar release `existing_lab` sólo después de aprobar el inventario. Mantener **apagado** `GHL_PROVISIONING_ENABLED` hasta la prueba autorizada; falta `GHL_SNAPSHOT_RELEASES` en Preview.
4. **Vinculación:** en la Preview de esta rama, tras cumplir precondiciones, ejecutar `bind_lab` por verificador asignado y luego `provision` con el titular y la versión autorizados. Comprobar lectura/escritura de valores no vacíos exclusivamente si se aprueba, conciliación e idempotencia.
5. **Prueba E2E:** con datos `.test` en la LAB, verificar formulario → contacto deduplicado → oportunidad → tarea → indicador. El MCP manual anterior no demuestra que este flujo haya sido ejecutado desde el Wizard. Mantener inactivas las rutas externas y el worker hasta aprobación de ese ensayo.
6. **Sin promoción:** no merge a `main`, no deploy a producción, no creación de Dev, no pagos, canales externos, trial comercial ni automatizaciones publicadas.

## Riesgo de continuidad del proveedor

La prueba de Agency Pro/Founder puede terminar el **12 de noviembre de 2026**, sujeto a confirmación del panel Billing. La conservación de datos durante 90 días tras cancelación no garantiza acceso a UI ni APIs; la opción Pause de US$27/mes preserva datos pero tampoco permite operar. Completar las verificaciones que exigen acceso real antes del vencimiento o confirmar formalmente un plan activo; ninguna acción de facturación fue realizada.

## Reversión puntual, si se solicita

- Revocar **sólo** la pareja exacta de `onboarding_reviewers` de este QA y operador.
- No borrar la sesión QA ni sus respuestas, ni modificar Dev.
- No cambiar la allowlist global ni desconectar la LAB por retirar esta asignación.
