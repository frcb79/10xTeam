# Consultoría LAB — Evidencia y próximos bloqueos (10-nov-2026)
Proyecto: 10xteam Growth OS · PR #1 `feat/intelligent-onboarding-pilot`.
No es un E2E ejecutado desde Wizard.

## Validado mediante MCP / SQL
- Location exclusiva LAB `Be3Voe6UoPjiAawaQUCK`; pipeline `FY7sgYVcrc2fY3lmwxE3` con 5 etapas, 6 Custom Values vacíos, Custom Field `wLVPrSyDs6x5ZUfKABYv`, formulario `MuTtwELJ3O54P7lKVPcg`.
- Workflow interno `8c72488f-4f86-4cfd-902c-f2c8d50ffcd5` sigue en `draft`. Definición avanzada no disponible: 403 `WORKFLOW_API_NOT_ENABLED_FOR_LOCATION`; revisar manualmente sus pasos, no ampliar scopes a ciegas.
- Supabase: migración `20261110202912_lab_synthetic_form_route_isolation` aplicada. Verificado `authorized_emails`, trigger de validación y filtro de outbox. Insertos negativos para ruta LAB habilitada con lista vacía o correo no .test rechazados; no quedan rutas ni jobs.
- Sesión real de Dev `0b624aa6-7db1-46f2-b713-29481273c1ab` sigue intacta, v9, `not_started`, sin location. No utilizarla como QA.
- Alta MCP sintética autorizada y confirmada por segunda lectura: contacto QA `GzlhciAxWefIdFbY5PbV`, correo `qa-mcp-lab-20261110@example.test` (DND=true), oportunidades `a1exVcha2QA7SScYhWkl` (Llave en Mano) y `lQRHd3pf9ywc2KsTQYYQ` (Dev Squad), tarea `EyzMPpfIyYyNV6ZkBne2`. **Son escrituras manuales MCP, no una prueba de formulario ni automatización.**

## Pendientes / NO-GO
1. Cuenta Auth QA distinta del titular Dev, sesión QA real creada por interfaz autenticada, consentimientos del titular genuinos, evidencia verificada por operador autorizado. No existe aún sesión QA sintética en BD; no suplantar `owner_user_id`.
2. Revisar workflow LAB en la UI y conservarlo en draft mientras no haya autorización específica para publicar. Sin publicación no habrá automatización de oportunidad/tarea/notificación por trigger.
3. Preparar manifiesto `kind:existing_lab` validado tras inspección y alinear configuración de Preview (faltan metadatos de `GHL_SNAPSHOT_RELEASES`, `GHL_PROVISIONING_ENABLED`, `ONBOARDING_FORM_SYNC_ENABLED`, `ONBOARDING_FORM_WORKER_SECRET`; verificar sin exponer secretos). Aplicar sólo a Preview de la rama, no a producción.
4. Validar OAuth/refresh propios del Wizard y webhook firmado en LAB; OAuth de MCP ChatGPT NO sustituye los de la app.
5. Con sesión `configured` y consentimiento `forms`, activar ruta sólo para correo(s) .test explícitos, probar origen `dev_contact` en Preview sin tocar Web3Forms, procesar cola, leer retorno y conciliar indicadores, duplicados e idempotencia. Ejecutar reversión en dos fases después de detener worker y vaciar jobs.
6. 054 waitlist, creación Dev definitiva, merge, envíos externos, cargos y publicación workflow siguen fuera de alcance.

**Separación de evidencia:** build READY ≠ pruebas locales ≠ integración ≠ E2E ≠ producción.
