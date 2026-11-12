# Alta inteligente de un negocio

El Wizard conserva el diagnóstico comercial de seis pasos. El negocio define después su objetivo a 90 días, el problema que más le cuesta ventas y los activos que quiere conservar. Obtiene un diagnóstico, hasta tres prioridades con su fundamento, una configuración propuesta y una lista de conexiones con responsables.

## Qué ocurre durante el alta

| Momento | Automático | Acción humana | Resultado que se comprueba |
|---|---|---|---|
| Primer contacto | Guarda en servidor los pasos confirmados con una sesión privada. La web es optativa. | El prospecto confirma oferta, tipo de comprador, canales, proceso y capacidad. Puede responder manualmente. | Recarga y conserva respuestas. Un segundo navegador sin acceso recibe 404. |
| Objetivo | Selecciona preguntas según citas, conversión y uso compartido de redes. Genera memoria y recomendaciones con referencias a las respuestas. | Corregir datos y declarar qué conservar, restricciones y meta. | El plan de citas incluye agenda y conflictos. B2B propone empresas y calificación. Consumo propone captación y referidos. |
| Contratación | Vincula la sesión invitada con un usuario autenticado cuando el titular inicia sesión con su registro. Cada BA tiene su propia identidad. | El equipo entrega acceso a una cuenta de Auth y comprueba el contrato o la autorización del piloto. | La persona retoma sus registros desde /wizard/access y elige el negocio en /wizard/businesses. |
| Configuración | Selecciona una versión de plantilla aprobada. Busca una cuenta candidata, crea sólo si procede, guarda el ID y personaliza campos 10x. Relee activos. | El titular aprueba el alcance. Un operador asignado reconcilia ambigüedades. | Una sola location por BA. Valores, etapas y activos esperados en esa location. |
| Conexiones | Registra conservar, conectar, migrar, crear o posponer. Guarda alcance y versión de autorización. | El titular autoriza OAuth, Meta, correo, DNS o pasarela en el proveedor. Se revisan costos por separado. | La selección de un módulo y su conexión técnica se muestran por separado de su prueba funcional. |
| Entrega | Calcula las verificaciones requeridas para esa BA y objetivo. El registro interno del trial es opcional e idempotente. | El operador proporciona evidencia fechada, identifica el resultado y confirma la entrega. | El negocio accede, completa el caso principal y encuentra el resultado en sus métricas. |

El alta invitada se recupera en el navegador que conserva su cookie. El acceso entre dispositivos requiere vincularla a una identidad autenticada. La pantalla informa un fallo de persistencia. Si la base está fuera de servicio, conservar la pantalla hasta poder guardar antes de cerrar la pestaña.

## Preparar un entorno de pruebas

1. Para el ensayo acordado el 9 de noviembre, usar el Supabase existente `10xteam` (`rasnxpsmzmdyradclxtb`), Vercel Preview de la rama del piloto y exclusivamente Consultoría LAB. No es una base aislada de los sitios públicos: las escrituras requieren autorización y sólo se usarán datos sintéticos. La elección del staging permanente queda para después del piloto. No crear branches ni contratar recursos de pago. Preparar una cuenta de Auth de prueba. Revisar las migraciones existentes de `docs/project/migrations/` y aplicar la adición de `supabase/migrations/` bajo control de cambios. Verificar privilegios reales de los roles. Los registros históricos conservan su identidad y requieren conciliación antes de atribuirlos a un titular.
2. Configurar en el servidor `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `ONBOARDING_PUBLIC_ORIGIN` con el origen exacto del Wizard. La clave service role se usa únicamente en servidor. La interfaz de equipo requiere `TEAM_ADMIN_PASSCODE`. Usar un valor aleatorio y limitar intentos de acceso en la infraestructura.
3. Asignar el UUID del operador en `ONBOARDING_OPERATOR_USER_IDS` y crear su asignación específica BA/usuario en `onboarding_reviewers`. La revisión está en `/team/onboarding/<UUID-de-la-BA>`. Usar identificadores de evidencia internos y excluir secretos, documentos y datos de prospectos.
4. Mantener apagados `GHL_PROVISIONING_ENABLED`, `GHL_OAUTH_ENABLED`, `ONBOARDING_FORM_SYNC_ENABLED`, `ONBOARDING_TRIAL_ENABLED` y `AI_PAID_EXECUTION_ENABLED` durante el ensayo local. Para cada operación externa se requiere autorización para la cuenta, el entorno y el alcance correspondientes.
5. Ejecutar `npm ci`, `npm test`, `npm run lint` y `npm run build` desde Growth. La prueba `npm run test:browser` usa una instancia **local** de la aplicación con la migración y una base desechable accesible por PostgREST. Configurar `WIZARD_TEST_URL` al origen local. Usar Chromium instalado por Playwright o `WIZARD_CHROMIUM_PATH`. La suite rechaza dominios externos.

### Sesión QA legítima (sin suplantación)

La sesión real de Dev (plan 9) es **de solo lectura** para este ensayo. Para probar LAB, crear otra sesión con una cuenta Auth QA independiente mediante el Wizard. El titular QA debe confirmar por sí mismo los consentimientos en la interfaz autenticada. La autorización contractual o de piloto debe ser comprobada por un verificador asignado; nunca registrar una simulación como evidencia `real`.

`scripts/prepare-lab-qa-session.mjs` es ahora **únicamente un preflight de lectura**. Requiere `ONBOARDING_QA_SESSION_ID` de una sesión creada previamente y se niega a utilizar la sesión Dev o su mismo titular. Comprueba campos y evidencia registrada sin crear usuarios, sesiones, consents ni vínculos. Sus indicadores `*Recorded` no prueban por sí solos que exista autorización legítima: eso exige revisión del titular/verificador. Sólo después de esa verificación se permite invocar, por separado, `bind_lab` (que termina en `waiting_provider`) y `provision` (que debe verificarse en `configured`). Ningún script debe usar una credencial de servicio para simular la identidad de un titular.

La reversión del aislamiento LAB también tiene **dos transacciones**: primero desactiva y confirma la ruta; sólo después evalúa si existen trabajos pendientes y, cuando no los hay, elimina la columna y restaura el trigger anterior. Si la segunda fase se aborta, la ruta permanece desactivada. No ejecutar estos SQL en el Supabase compartido sin autorización separada.

## Preparar una plantilla y su conexión

Para vincular una LAB existente, incluir únicamente su ID en `GHL_LAB_LOCATION_IDS` y usar el panel del verificador asignado. Verificar el identificador exacto de la LAB y su agencia. El operador asignado documenta el vínculo con ese negocio. Para una location comercial también deben coincidir nombre y correo del titular. Para crear una location distinta se requieren `GHL_LOCATION_CREATION_ENABLED=true` y el ID exacto del registro aprobado en `GHL_APPROVED_CREATION_SESSION_IDS`. Revisar costo, titular y duplicados antes de habilitar estas variables.

El catálogo `GHL_SNAPSHOT_RELEASES` es JSON mantenido por el operador. Hay dos tipos de release **distintos**: `kind: "snapshot"` con un `snapshotId` REAL e importable para futuras altas, y `kind: "existing_lab"` con `locationId` e `inventoryReference` para comprobar activos que **ya existen** en una subcuenta autorizada. El segundo no importa snapshots, no crea locations y debe vincularse antes de configurar. Ambos exigen versión inmutable, pipeline, formularios, workflows, calendarios y revisión documentada sin envíos ni cargos. Ejemplo estructural para una release de snapshot con ID ficticio:

```json
{
  "core-b2b": {
    "snapshotId": "ID_VERIFICADO_EN_LAB",
    "version": "lab-release-1",
    "reviewReference": "FOLIO_DEL_MANIFIESTO_REVISADO",
    "validated": true,
    "noExternalActions": true,
    "pipelineName": "Ventas consultivas",
    "workflowNames": ["Asignación interna"],
    "formNames": ["Solicitud comercial"],
    "calendarNames": []
  }
}
```

Para una LAB existente, la entrada `core-b2b` usaría `kind: "existing_lab"`, `locationId: "Be3Voe6UoPjiAawaQUCK"`, `inventoryReference` como folio de inventario revisado, y los nombres de activos existentes (pipeline `10x LAB — Ventas Consultoría`, workflow interno en borrador y formulario `Form 0`). **No incluir `snapshotId`**. No marcar `validated: true` hasta revisar el flujo interno, las cinco etapas, el alcance de la credencial y ausencia de acciones externas. En LAB, `bind_lab` deja `waiting_provider`; `provision` debe verificar activos y confirmar `configured` antes de habilitar una ruta. La operación de personalizar Custom Values escribe en GHL y necesita aprobación específica.

Las claves base son `core-b2b`, `core-consumer` y `core-appointments`. Retención usa `retention-<arquetipo>` y requiere su prueba propia. Crear un catálogo con validaciones reales antes de habilitar escritura. Revisar que el snapshot contenga las etapas declaradas en el plan y estos campos personalizados de tipo **Custom Value**, nombrados exactamente como las claves: `10x_business_name`, `10x_offer`, `10x_ideal_customer`, `10x_primary_goal`, `10x_brand_voice` y `10x_preserve`. Dejar los valores de la plantilla vacíos. Un valor preexistente diferente requiere revisión. Validar en LAB las acciones y las condiciones de cada flujo, las reglas condicionales del formulario y los widgets de medición.

Para el modo de agencia se requiere una agencia elegible, `GHL_COMPANY_ID` y un token OAuth de agencia vigente en `GHL_AGENCY_ACCESS_TOKEN`. La creación y búsqueda requieren acceso a locations. El intercambio de token requiere `oauth.write`. El token de location necesita leer los activos del plan y leer/escribir los Custom Values. Verificar la instalación por location y los scopes exactos en la versión vigente de la app. La sincronización del formulario requiere además escritura de contactos. Administrar la vigencia del token de agencia desde el gestor de secretos del entorno.

La conexión opcional del titular usa `GHL_CLIENT_ID`, `GHL_CLIENT_SECRET`, `GHL_REDIRECT_URI` con el callback exacto y `ONBOARDING_ENCRYPTION_KEY` de 32 bytes en base64. El alcance de ese OAuth es lectura de la location. Las autorizaciones de Meta, correo y demás proveedores se realizan por separado. Conservar la clave en un almacén de secretos y planear rotación con recifrado. Inventariar y revocar los tokens históricos fuera de uso antes de habilitar conexiones multicliente.

## Recuperar un intento

| Estado | Qué hacer |
|---|---|
| Falta plantilla, permiso o contrato | Completar el requisito indicado. Volver a la misma BA. |
| Conflicto de versión | Leer el registro de nuevo. Revisar el cambio de la otra ventana antes de guardar. |
| Resultado desconocido al crear | Revisar el listado de la agencia, el intento y su hora. Comprobar nombre, correo, agencia, titular y el identificador de la cuenta. Registrar la referencia de la reconciliación. Nunca repetir a ciegas el POST de creación. |
| Location guardada y activos pendientes | Revisar que terminó la importación y que coinciden nombres y versión. Reintentar sobre el ID persistido. |
| Autorización vencida o respuesta de refresh incierta | Reautorizar con el titular y verificar la misma location. Un webhook firmado sólo registra el evento. |
| Captura en revisión | Buscar por email en la location asignada. Verificar el ID del contacto, la oportunidad y el estado de la cola. El operador debe conciliar cualquier envío incierto antes de reencolar. |

## Aceptación de la entrega

Registrar contrato o autorización de piloto, acceso del titular, idioma/país/moneda/zona, activos del snapshot, controles de gasto, continuidad, aislamiento, caso de uso principal, URL pública con SSL, observabilidad, ayuda y política de trial. Cada módulo indispensable añade su propia prueba. Los opcionales pospuestos quedan visibles. Para aprobar se necesitan referencias reales del negocio, de la versión del plan y de la location correspondiente. Una prueba fallida, anterior, simulada o perteneciente a otra cuenta deja pendiente la entrega.

Con `ONBOARDING_TRIAL_ENABLED` aprobado, confirmar la entrega registra una sola ventana interna de 14 días por BA. El PSP y los cobros externos requieren integración y reconciliación comercial por separado. Las reglas y precios de los planes se administran fuera de este flujo.

## Preparación específica de 10xTeam Dev

1. Registrar Dev como negocio independiente del de Growth. Capturar Llave en Mano y 10x Dev Squad, comprador objetivo, fuentes actuales, restricciones y su formulario existente. Usar una identidad de titular con acceso sólo a los negocios aprobados.
2. Confirmar una release B2B sin datos de muestra, envíos, WhatsApp, IA facturable ni workflows premium. Registrar en LAB cuál workflow crea la oportunidad y la tarea, qué filtro de origen utiliza y cómo evita reentrada. Un nombre de workflow verificado por la API sólo prueba que está presente.
3. El sitio Dev ya envía a `/api/contact` de Growth. El backend guarda el contacto antes de encolarlo. Los servicios `mvp` y `celula` se mapean a Llave en Mano y 10x Dev Squad. Mantener intacto el formulario. La ruta de ingreso se determina en servidor y requiere una asignación explícita a Dev. No importar contactos anteriores por defecto.
4. Después de autorizar el piloto, el titular elige conectar formularios y autoriza su preparación. El operador registra en `onboarding_form_routes` el origen `dev_contact`, la BA, la location verificada, el campo de servicio y la evidencia de aprobación. Confirmar el criterio de coincidencia por email y revisar proveedores/contactos previos. Habilitar solamente esa ruta y el worker en la prueba autorizada. Usar un secreto de al menos 32 caracteres en `ONBOARDING_FORM_WORKER_SECRET`. Invocar `POST /api/onboarding/forms/sync` con bearer de servidor. Cada invocación procesa hasta una entrada. El programador y el monitoreo del worker se configuran en el entorno que opere el piloto.
5. Probar con dos envíos sintéticos del mismo correo. Esperar un solo contacto en Dev, una oportunidad, la tarea y la métrica correspondiente. Comprobar el otro servicio con otro correo sintético y verificar ausencia de esos registros en Growth. El primer servicio se conserva en el envío CRM deduplicado por email. Las consultas posteriores siguen disponibles en la tabla de capturas. Revisar cómo se atenderán cambios de interés.
6. Para redes corporativas compartidas, inventariar Página, Instagram, titular, permisos y destinos existentes. Decidir **por función** quién publica, qué cuenta recibe DMs y adónde van los formularios de anuncios. HighLevel documenta que reautorizar Meta y omitir páginas ya seleccionadas puede revocar acceso en otra location. La capacidad de conectar varias páginas a una location no acredita una distribución segura del mismo inbox entre dos. Obtener confirmación por función antes de conectar. Para captar por formulario propio, se pueden posponer las redes.
7. Operador y titular completan la prueba de acceso aislado, el flujo público y la conciliación de métricas. Conservar IDs sintéticos, fecha y resultado en el registro privado. La primera revisión de adopción puede usar señales de captación y seguimiento de esa BA con autorización de lectura.

Fuentes técnicas del proveedor: [creación de location con snapshot](https://marketplace.gohighlevel.com/docs/ghl/locations/create-location/index.html), [intercambio de token de location](https://marketplace.gohighlevel.com/docs/ghl/oauth/get-location-access-token/index.html), [actualización de Custom Values](https://marketplace.gohighlevel.com/docs/ghl/locations/update-custom-value/index.html), [deduplicación de contactos](https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/index.html), [firma de webhooks](https://marketplace.gohighlevel.com/docs/webhook/WebhookIntegrationGuide/index.html), [permisos de Meta entre locations](https://help.gohighlevel.com/support/solutions/articles/155000008432-why-you-should-grant-access-to-all-pages-when-connecting-a-social-account).

## Ensayo en Consultoría y aprobación de base

1. **Titular, OAuth.** En Developer Marketplace → My Apps, verificar el borrador privado de 10xteam o crear la app privada si falta. Autorizar instalación sólo en Consultoría (Be3Voe6UoPjiAawaQUCK) con `locations.readonly`. Registrar el origen HTTPS estable del backend LAB seguido de `/api/connections/callback`. Para probar webhooks, registrar `/api/ghl/webhook` y un evento de instalación admitido. El callback debe admitir la sesión del titular y el webhook debe ser accesible por GHL. El titular confirma el companyId en el proveedor.
2. **Titular, acceso operativo limitado.** En esa misma subcuenta → Configuración → Integraciones privadas, otorgar lectura de location, pipelines/oportunidades, formularios, workflows, calendarios y Custom Values; escritura de Custom Values y contactos. Scopes del adaptador: `locations.readonly`, `opportunities.readonly`, `forms.readonly`, `workflows.readonly`, `calendars.readonly`, `locations/customValues.readonly`, `locations/customValues.write`, `contacts.write`. Para releer el contacto desde la API añadir `contacts.readonly`. Guardar la credencial directamente como `GHL_LAB_ACCESS_TOKEN` en los secretos del servidor Preview restringidos a esta rama. Fijar `GHL_LAB_LOCATION_ID` y la lista `GHL_LAB_LOCATION_IDS` sólo a Consultoría. Este modo prescinde del bearer de agencia y bloquea la creación de locations. La credencial operativa y el OAuth del titular se prueban por separado.
3. **Operador, entorno.** En la misma Preview usar el Supabase existente acordado para el piloto, una vez autorizada y verificada 053, y configurar los parámetros de OAuth del titular, la clave de cifrado y el secreto del worker. El titular introduce los valores sensibles directamente en el gestor de secretos. Mantener apagados el alta definitiva, trial, pagos, canales externos e IA. Para el snapshot registrar sólo un manifiesto aprobado con activos internos y las etapas acordadas. La preferencia de múltiples oportunidades está habilitada sólo en Consultoría; mantener la deduplicación del contacto por email.
4. **Operador y titular, aceptación.** Designar el usuario interno de QA. Ejecutar OAuth, refresh y webhook firmado; archivar sólo referencias sin secretos. Enviar ambas ofertas y repetir la primera. Comprobar un contacto, una oportunidad por oferta, tareas, notificación interna controlada, indicador e inexistencia de registros cruzados. Un trabajo de formularios en estado done sólo confirma el contacto. En sending o review reconciliar primero por ID en la misma LAB. El operador registra evidencia de la empresa y versión correctas antes de declarar FUNCTIONAL_READY.
5. **Aprobación pendiente del titular en Supabase.** En el proyecto rasnxpsmzmdyradclxtb aprobar separadamente [20261107134053](../../supabase/migrations/20261109173128_intelligent_onboarding.sql) (nueve tablas, tres funciones, trigger sobre contact_leads y eliminación del valor por defecto del trial para futuras altas) y [20261107134054](../../supabase/migrations/20261107134054_limit_legacy_mutations.sql) (prevención de correos duplicados sólo en la lista de espera Growth). Ejecutar por versión y en transacciones independientes; detener escritores durante la ventana, comprobar respaldo, repetir preflight de nombres y duplicados, verificar grants, historial y conteos. El índice puede bloquear escrituras durante su creación. El P0 052 ya está aplicado.
6. **Reversión.** Si 054 falla, su transacción se aborta y 053 conserva su estado. Para retirar sólo 054, pausar la waitlist y ejecutar bajo aprobación `DROP INDEX public.contact_waitlist_email_idx` en una transacción; los REVOKE redundantes de 054 ya pertenecen al P0. Para retirar 053 y 054 juntas usar el [SQL probado](revert-pending-onboarding.sql) con ambas aplicadas, sin escritores y comparando el default capturado antes del cambio. Si sólo está instalada 053, omitir la sentencia DROP INDEX de 054 tras verificar el historial. Si hay datos, detener rutas y workers, conservar las tablas y preparar una corrección hacia adelante. Tras cualquier reversión de DDL reconciliar el historial con el mecanismo de migraciones de Supabase antes de reintentar.
7. **Alta definitiva posterior.** Tras el GO, el titular autoriza por separado la creación de Dev, confirma nombre, dominio y propietario, selecciona redes compartidas y permisos por marca, conecta el calendario del anfitrión y el buzón de Dev y aprueba canales/costos. El Wizard prepara el plan y verifica los activos; el operador y el titular verifican agenda, acceso, aislamiento y entrega comercial antes del trial.


### Guardado de Auth en Marketplace

La app privada white-label 10xTeam Wizard LAB exige al menos una Redirect URL para guardar scopes.
Usar el alias estable de Preview con la ruta /api/connections/callback. El inicio OAuth admite
también la ruta histórica y comprueba coincidencia exacta del origen y la ruta. El retorno comparte
el mismo control de nonce, titular, scopes y location. Un GET sin state devuelve 403.
El registro del callback y del permiso locations.readonly sólo prepara el borrador.
El ensayo OAuth sigue requiriendo 053 aplicada en la base acordada, secretos de servidor y sesión autenticada del titular.


## Decisión vigente · 9 de noviembre de 2026

El titular acepta continuar el piloto con el Supabase actual y posponer la infraestructura de staging. Esto no autoriza por sí solo las dos migraciones pendientes: la aprobación específica por versión sigue vigente.

- **Solicitar sólo 20261107134053 para desbloquear el Wizard.** SQL sin modificaciones respecto al commit 3736941: nueve tablas con RLS y sin acceso directo anónimo/autenticado, tres funciones y un trigger sobre contact_leads. No modifica filas existentes. Quita el default del trial sólo para futuras altas de businesses; los trials existentes conservan sus fechas. Ninguna ruta de formulario ni presupuesto de IA queda habilitado automáticamente.
- **Diferir 20261107134054.** El índice de deduplicación de la waitlist Growth no es requisito para el ciclo Wizard → Consultoría. No aplicarlo junto con 053.
- **Preflight real:** 052 registrada, 053/054 ausentes; siete tablas existentes con RLS. 20 diagnósticos, cero leads, negocios, sesiones GHL o tablas onboarding; cero conflictos de objetos. Cero usuarios en Auth: el titular deberá crear/iniciar una identidad de prueba antes del ensayo OAuth. No se inspeccionaron contraseñas ni tokens.
- **Respaldo:** no hay respaldo administrado verificado. Antes de ejecutar, capturar un respaldo privado y comprobar su restauración; guardar también ACL, políticas, conteos y el default actual `(now() + '14 days'::interval)`. No usar la captura de reversión del P0 052 para revertir 053.
- **Ejecución solicitada:** sólo la versión 053, en transacción única con timeout de bloqueo de cinco segundos y escritores detenidos durante la ventana. Si el preflight o el respaldo no se verifican, detener sin DDL. Tras COMMIT verificar versión registrada, nueve tablas con RLS/ACL, trigger, ausencia de rutas habilitadas, filas históricas y acceso denegado a anon. No activar worker/OAuth por aplicar el SQL.
- **Reversión de 053 sola:** usar [revert-onboarding-053.sql](revert-onboarding-053.sql), probado sin 054. Requiere las nueve tablas nuevas vacías; con una sesión existente se aborta y conserva los datos. Con datos de piloto, deshabilitar workers/rutas y corregir hacia adelante. Mantiene el cierre de permisos de 052 y no toca el ledger de migraciones; reconciliarlo mediante el mecanismo aprobado de Supabase.

El formulario comercial de Dev conserva su endpoint `https://growth.10xteam.com.mx/api/contact` y su diseño. La prueba de la Preview no acredita que el código esté desplegado en ese endpoint. El trigger de 053 deja entrar leads por el backend con service_role cuando no existen rutas habilitadas, sin producir trabajos ni enviar nada. Las pruebas aisladas comprueban esta compatibilidad y la conservación de diagnósticos. El ensayo de navegador conserva la interceptación hacia el backend autorizado de prueba, sin alterar la página comercial.


## Ejecución autorizada · 9 de noviembre, 11:31 CDMX

La aprobación del titular permite sólo el SQL identificado como 053. Se aplicó mediante el ejecutor de migraciones de Supabase; éste asignó **20261109173128 / intelligent_onboarding**. El archivo se renombra a esa versión para coincidir con el historial remoto, sin modificar su SQL. No volver a ejecutar la antigua 20261107134053. La 20261107134054 de waitlist sigue pendiente y no fue ejecutada. Su SQL no depende de las tablas nuevas; no usar db push indiscriminado mientras siga sin aprobación.

Antes de aplicar se guardó un respaldo lógico privado de las siete tablas public con sus filas, catálogos/ACL/RLS/políticas, índices, constraints, triggers e historial. Se restauraron las 20 filas de diagnóstico y las cuatro de allowances en PostgreSQL embebido; las otras cinco tablas estaban vacías. Sobre esa restauración pasaron aplicación y reversión de 053. Es un respaldo del alcance public, no un backup físico de todo Supabase ni de Storage/Auth.

Ejecución con lock_timeout de cinco segundos y bloqueo transaccional de businesses/contact_leads, sin transacciones previas abiertas. Verificación posterior: 16 tablas con RLS, nueve nuevas sin SELECT/INSERT/UPDATE/DELETE para anon ni SELECT para authenticated; sin DELETE para service_role; tres funciones y un trigger; cero rutas habilitadas y cero sesiones. Los 20 diagnósticos conservan el mismo digest que la restauración. El default trial_ends_at es NULL. Security advisor sólo informa RLS sin políticas en las nueve tablas privadas: es el cierre intencional de acceso directo, no un permiso por corregir abriendo políticas públicas.

La Preview responde HTTP 200 a lectura autenticada mediante la cuenta Vercel conectada. El navegador interactivo presenta Login de Vercel. Además, Auth de Supabase contiene cero usuarios. Para seguir con OAuth, el titular necesita su cuenta de acceso al Wizard: en Supabase 10xteam → Authentication → Users → Add user → Create new user, crear fcb@10xteam.com.mx con contraseña privada definida por el titular. Este usuario es independiente del Developer Marketplace y de la sesión Vercel. El titular entra después en /wizard/access en la Preview. No enviar contraseña ni tokens al chat. La contraseña debe introducirla y guardarla el titular, no el agente. Registrar el UUID real del operador y su asignación al alta sólo después de confirmar esa identidad.

Se crearon ONBOARDING_ENCRYPTION_KEY (Secret) y ONBOARDING_PUBLIC_ORIGIN sólo para Preview y la rama del piloto, sin revelar ni modificar las credenciales existentes. Siguen pendientes GHL_COMPANY_ID, flag OAuth del ensayo y sesión de titular. Mantener GHL_PROVISIONING_ENABLED, ONBOARDING_FORM_SYNC_ENABLED, trial e IA de pago desactivados hasta completar la configuración y revisar los activos internos. No atribuir el respaldo o la prueba SQL a OAuth/GHL real.


Verificación real desde Vercel Preview cb20235 (READY, despliegue dpl_CN1zVVqDZSR7uBPdfNrofC52xCj7): lectura de onboarding_sessions con service_role HTTP 200; nueve lecturas anónimas de tablas nuevas, dos DELETE anónimos (onboarding_sessions y contact_leads) y un PATCH anónimo denegados con 401/403 y SQLSTATE 42501. Los intentos de mutación también usaron un UUID sintético inexistente. No se crearon ni borraron registros. Las nueve lecturas de HighLevel Consultoría volvieron a pasar con HTTP 200: location, pipelines, formulario, workflows, calendarios, Custom Values, contacto QA, dos oportunidades diferenciadas y tarea. Los registros GHL siguen siendo los de la prueba manual previa, no del flujo automático. Build, 28/28 tests, lint y TypeScript aprobados; sin despliegue de producción.


## Diagnóstico real recibido · 9 de noviembre, 13:12 CDMX

El titular completó los seis pasos y preparó el diagnóstico en la Preview. Supabase confirmó la sesión propia `0b624aa6-7db1-46f2-b713-29481273c1ab`, versión de plan 9, negocio 10xTeam Dev, diagnóstico persistido y arquetipo core-b2b. CRM y forms son requeridos; agenda, correo, WhatsApp, redes, pagos e IA están pospuestos. Sin location vinculada, consentimientos de ejecución ni evidencia funcional registrada. No copiar respuestas privadas, teléfono ni economía del titular al repositorio. No volver a pedir que complete el cuestionario.

El titular solicita cerrar primero el piloto y diferir la reducción de longitud del Wizard y UX/UI. No hay cambios de interfaz en esta revisión.

Configuración concreta a validar en Consultoría antes de activar:
- Pipeline existente 10x LAB — Ventas Consultoría. Etapas esperadas, en orden: Nuevo prospecto, Calificación, Diagnóstico, Propuesta, Decisión. Conservar las oportunidades QA existentes.
- Formulario existente Form 0: verificar su ID; conservar el HTML comercial y ejecutar el ensayo mediante el backend de Preview autorizado.
- Seis Custom Values de plantilla vacíos antes de personalizar: 10x_business_name, 10x_offer, 10x_ideal_customer, 10x_primary_goal, 10x_brand_voice y 10x_preserve. Los valores salen del plan 9 del titular, no de fixtures.
- Un Custom Field de contacto 10x_service con opciones Llave en Mano y 10x Dev Squad; capturar ID real para la ruta. Custom Fields y Custom Values son superficies distintas.
- Workflow interno Asignación y tarea interna para nuevo prospecto. Debe procesar ambas ofertas para un mismo contacto y conservar dos oportunidades diferenciadas, sin duplicar oportunidad ni tarea al repetir. Probar recepción inicial y cambio de oferta, restricciones a source dev_contact y correo sintético. No usar sólo Contact Created para ambas ofertas.
- Una tarea de seguimiento por oferta y una notificación de prueba sólo al destinatario ya autorizado soporte@10xteam.com.mx. Valor de oportunidades de QA: cero. DND en todos los canales para los contactos de prueba; no teléfono de prospecto.
- Releer contacto, oportunidades, tareas, resultado de notificación e indicador; reconciliar errores inciertos antes de reintentar. No asignar FUNCTIONAL_READY con inventario o registros manuales como sustitutos del recorrido automático.

Pendiente de aprobación específica por la regla del titular sobre permisos: añadir fcb@10xteam.com.mx a ONBOARDING_OPERATOR_USER_IDS sólo en la Preview de esta rama y asignarlo en onboarding_reviewers sólo a su propia sesión. No dar acceso a otras altas ni a otras locations. La API de aplicación seguirá validando titular, asignación y versión. Registrar autorización de piloto y consentimientos por el flujo existente después de aprobar el alcance; no fabricarlos mediante SQL.

El manifiesto de snapshot permanece sin aprobar y no se configura GHL_SNAPSHOT_RELEASES como validated hasta comprobar ID real, contenido, activos y ausencia de acciones externas. Marketing Agency no se importa automáticamente. Los endpoints v3 de creación/validación de workflows tienen disponibilidad limitada; comprobar GET step-types con el token actual antes de pedir un permiso de escritura que podría ser insuficiente.


## Activos preparados en Consultoría y verificador limitado por alta · 9 de noviembre

Preparación manual real en la única LAB autorizada, conservando los registros QA: seis Custom Values vacíos creados con los nombres del plan; pipeline existente FY7sgYVcrc2fY3lmwxE3 con Nuevo prospecto → Calificación → Diagnóstico → Propuesta → Decisión, orden comprobado tras recarga. La nueva Calificación usa probabilidad de prueba 30%; las probabilidades anteriores se conservaron. Campo de contacto 10x_service creado como TEXT, key contact.10x_service, ID wLVPrSyDs6x5ZUfKABYv, carpeta 10x Dev LAB. El backend ya limita el valor a las dos ofertas admitidas. Son activos preparados manualmente, no provisión automática del Wizard ni un snapshot aprobado.

La lectura real del campo por API devolvió 401 con la credencial actual. GET /workflows/step-types devolvió 403 WORKFLOW_API_NOT_ENABLED_FOR_LOCATION, aunque el listado de workflows responde 200. Se verificó con la documentación oficial v3: no asumir que añadir workflows.write habilita esta función. La interfaz autenticada de HighLevel sí permite preparar la LAB. No se ampliaron scopes ni se rotaron tokens. GHL_COMPANY_ID se obtuvo de la lectura real de Consultoría y quedó guardado sólo en Preview para la rama.

Antes de habilitar a un verificador se cerró un hueco en la comprobación por alta: la inclusión global del usuario en la allowlist ya no le permite verificar sus otras altas propias sin asignación. API GET/POST y pantalla de revisión calculan operator con una consulta server-side a onboarding_reviewers para el ID y usuario exactos. Sin asignación, sin rol global, con invitado o con error de consulta se deniega la facultad de verificación; el titular conserva sus acciones normales. No se escribió ninguna asignación ni se concedieron permisos todavía. 29/29 pruebas locales, lint y TypeScript aprobados. La nueva prueba cubre titular allowlisted sin asignar, otra alta, otro usuario, invitado, asignación válida y fallo de consulta.

El alta real sigue siendo la versión 9 del titular, con diagnóstico y plan persistidos, sin location vinculada ni autorización de ejecución. Snapshot aprobado, workflow, OAuth/refresh/webhook y ciclo completo siguen pendientes. La reducción de longitud y UX/UI están diferidas por indicación del titular. Mantener 054 pendiente y no crear Dev ni desplegar producción.


## Borrador interno y siguiente autorización concreta · 9 de noviembre

Workflow real guardado y releído después de recarga: `8c72488f-4f86-4cfd-902c-f2c8d50ffcd5`, Asignación y tarea interna para nuevo prospecto, exclusivamente Consultoría LAB. Dos activadores: contacto creado filtrado por el correo QA exacto y cambio de `10x_service`. La barrera común exige correo `qa-dev-20261107@example.test` Y Source `dev_contact`; otra rama termina sin acciones. Busca nombre `QA Dev · {{contact.10x_service}} · Wizard LAB` y pipeline autorizado; si existe termina, si falta prepara oportunidad en Nuevo prospecto, tarea interna a un día y aviso a correo personalizado soporte@10xteam.com.mx. Seguidores, CC y BCC sin destinatarios adicionales. No se publicaron ni ejecutaron acciones, no se envió correo y no se usó IA. La tarea está sin asignar; comprobarlo antes de operación comercial. No confundir este borrador manual con evidencia de ejecución del Wizard.

Permitir reentrada está activado: HighLevel omite un segundo ingreso si el contacto sigue activo. La prueba real debe enviar las dos ofertas secuencialmente y comprobar también concurrencia antes de declarar fiabilidad; buscar oportunidad existente no demuestra por sí solo recuperación de una tarea o aviso fallido. Verificar logs y reanudar el paso fallido, sin volver a crear la oportunidad. El valor monetario QA debe comprobarse en lectura posterior; no equivale a cobro.

Siguiente aprobación solicitada: habilitar a `fcb@10xteam.com.mx` como verificador sólo de su alta Dev. El SQL exacto preparado en [grant-dev-lab-reviewer.sql](./grant-dev-lab-reviewer.sql) agrega una única pareja sesión/usuario; valida titular, nombre, plan 9 y ausencia de vinculación. Incluye reversión limitada a esa pareja. No ejecutado en Supabase. Añadir el UUID Auth verificado a `ONBOARDING_OPERATOR_USER_IDS` únicamente en Preview y esta rama, después de aprobación; quitarlo y redeploy Preview para revocar. No modificar permisos SQL, RLS, Production ni otras locations.

La asignación y su repetición idempotente se probaron en PostgreSQL aislado con las migraciones reales hasta 053. Plan anterior, titular distinto o alta ya vinculada se rechazan. Total 30/30 tests locales, lint y TypeScript aprobados. Preview de aplicación 429dafd READY: 9 lecturas GHL 200, pipeline de cinco etapas y seis Custom Values verificados; bloqueos 401 Custom Fields y 403 autoría documentados. Este permiso no sustituye el consentimiento del titular, revisión del snapshot ni autenticación OAuth.
