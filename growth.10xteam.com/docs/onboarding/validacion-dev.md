# Dictamen del piloto de 10xTeam Dev

**Fecha de validación:** 6 de noviembre de 2026. **Decisión:** apto para demostración local. La incorporación comercial sigue bloqueada hasta verificar una LAB en HighLevel y la persistencia del backend en un entorno alojado autorizado.

## Resultado del recorrido

La prueba abre el Wizard desde la primera pantalla, declara las dos ofertas públicas, el modelo B2B, el objetivo de captación, la necesidad de seguimiento y agenda, y la continuidad de la landing y de las redes corporativas. Utiliza un titular ficticio con correo reservado `example.test` y permite que los indicadores desconocidos queden pendientes. El motor selecciona `core-b2b` y prepara las etapas Nuevo prospecto → Calificación → Diagnóstico → Propuesta → Decisión. La clave representa una propuesta de configuración. El reporte incluye hipótesis, indicadores y acciones a 30 y 90 días. El usuario puede reabrirlo desde su sesión. Otro navegador recibe 404.

La activación inicial de este caso tiene **15 requisitos aplicables**, 12 generales y 3 módulos indispensables (CRM, formulario y agenda). Ninguno tiene evidencia real de proveedor en el ensayo. El panel permite registrar por separado una conexión, una verificación y una revocación.

| Tramo | Evidencia y clasificación | Resultado |
|---|---|---|
| Descubrimiento | Cliente aporta y confirma datos, por cuenta propia o en llamada sobre el mismo formulario | HUMAN-ASSISTED para datos/confirmaciones; objetivo 10–15 min pendiente de observar con una persona |
| Diagnóstico, plan y recuperación | Recorrido de Chromium sobre Next, PostgREST y una base local. El servidor aplica reglas y persiste el resultado | ZERO-TOUCH después de aportar contexto. Sin solicitud de IA de pago |
| Recepción del formulario | El backend acepta el origen Dev para ambas ofertas en ensayo local. SQL prueba que Growth tiene destino separado y que la cola deduplica | ZERO-TOUCH para captura local. La vinculación a una location real requiere aprobación y lectura de retorno |
| Configuración GHL | Adaptador probado con respuestas sintéticas, snapshot versionado, comprobación de conflictos antes de escribir y bloqueo de creación ambigua | EXCEPTION-ONLY previsto para conflictos, 429, cambios previos y resultados inciertos. Frecuencia real pendiente |
| Autorización externa | Por titular, scope y location; folio y fecha preservados. Envíos y gastos requieren decisión separada | HUMAN-ASSISTED. Ninguna red, agenda o pasarela real autorizada en el ensayo |
| Primera operación y entrega | Pendientes contacto único, oportunidad por oferta, tarea, notificación interna controlada, dashboard e inspección cruzada en GHL | Sin tiempo a primer valor, tasa real de autoservicio ni costo unitario comercial medidos |

La generación automática del reporte y del plan se mide con relojes del navegador en `DEV_REHEARSAL`. Los tiempos de tecleo automatizado describen la ejecución de QA; medir el tiempo humano con cliente y asesor reales por separado. Para el piloto en LAB registrar inicio, intervención y final de cada paso; obtener uso/costos del proveedor antes y después. Calcular el porcentaje de tareas automáticas con el denominador de pasos aplicables efectivamente observados. Mantener pendientes los pasos que requieren OAuth, revisión de identidad o cobro.

## Mediciones de dos ejecuciones locales

Las 22 pruebas de lógica y base de datos pasaron. Las dos pruebas de navegador pasaron en dos ejecuciones consecutivas, además del análisis estático y la compilación. El ensayo de captura pública hizo dos POST al backend local con el origen Dev y comprobó el rechazo de un origen ajeno.

| Tramo automatizado | Primera ejecución | Repetición |
|---|---:|---:|
| Primera pantalla | 585 ms | 629 ms |
| Negocio y ofertas | 409 ms | 683 ms |
| Perfil de cliente | 388 ms | 116 ms |
| Proceso de venta | 317 ms | 292 ms |
| Canales | 539 ms | 502 ms |
| Economía y contacto | 314 ms | 247 ms |
| Objetivos y continuidad | 577 ms | 682 ms |
| Generar y mostrar plan | 334 ms | 330 ms |
| Total hasta el plan | 3463 ms | 3481 ms |

La espera hasta configuración real, primer valor, duración humana y costo total por cliente siguen pendientes. Los 15 controles aplicables están pendientes en las dos ejecuciones.

## Criterios antes del siguiente cliente

1. Aprobar la migración de la LAB privada de Supabase, ejecutar el guardado del diagnóstico y confirmar la lectura en otra petición bajo el rol de servidor. El renderizador crea tablas vacías en un esquema nuevo sin copiar filas. La prueba local verifica el esquema y la atomicidad de la escritura.
2. Verificar en la agencia actual plan, compañía, permisos y ausencia de cargos adicionales. Registrar un folio de revisión para la versión exacta del snapshot, seleccionar la LAB existente y comprobar su identidad. La creación de una location definitiva exige además la lista explícita de registros autorizados.
3. Instalar o verificar la autorización OAuth en la LAB, confirmar los scopes devueltos, probar refresh y webhook real, inspeccionar comandos y costos; mantener desactivados mensajes, campañas y cobros.
4. Repetir el envío sintético con ambos productos. Releer IDs de contacto, oportunidad, tarea y ubicación, indicador de dashboard y destinatario interno de prueba. Confirmar segundo envío sin duplicado y aislamiento de Growth. Ensayar 429 o timeout en un mecanismo autorizado y documentar reconciliación.
5. Sólo después, habilitar el piloto en una location propia de Dev, verificar la ruta del formulario existente y medir esfuerzo humano y operación real. El PR continúa en borrador hasta revisar estas evidencias.

## Reproducción y referencias

Ejecutar `npm test`, `npm run lint`, `npm run build` y `npm run test:browser` con Next y PostgREST de prueba en loopback. Las pruebas de navegador rechazan destinos externos. Para obtener el HTML y una captura privados se puede definir `WIZARD_QA_EVIDENCE_DIR` con una carpeta local preexistente. La ruta de ejecución completa del entorno está descrita en la [auditoría](audit-and-qa.md). La [matriz de conexiones, checklist y catálogo](conexiones-y-activos.md) detalla las decisiones por cliente y la [guía de piloto](pilot-runbook.md) documenta las salvaguardas operativas.

## Cierre P0 del 7 de noviembre

**Dictamen de creación de Dev · NO-GO.** Se comprobó en un entorno aislado la recepción desde el formulario compilado, la persistencia y la asignación a la cola correspondiente. El proveedor sigue pendiente de autorización de LAB.

**Cambio para aprobación de producción.** Aplicar únicamente [el P0 independiente](../../supabase/migrations/20261105120000_secure_existing_api.sql) en una transacción. Primero guardar la salida de [captura de reversión](capture-p0-rollback.sql). Retira los privilegios directos de clientes sobre siete tablas, incluido TRUNCATE. Permite a authenticated leer su negocio y su consumo de IA mediante las políticas de propietario. El servidor puede insertar y consultar contactos. Los diagnósticos, borradores y tokens históricos quedan bajo el propietario de base de datos. Las funciones de trigger pierden ejecución directa por clientes. La migración carece de instrucciones de modificación de filas.

**Impacto operativo.** Las rutas antiguas que leen o actualizan esos tres archivos históricos con service_role perderán acceso, y el endpoint anterior de waitlist dejará de actualizar inscripciones existentes. Coordinar la ventana con el titular. Para recibir un nuevo diagnóstico persistente mediante el Wizard del PR se necesitan también sus tablas y el despliegue del backend seguro. La segunda migración añade nueve tablas y elimina el valor por defecto de trial para negocios futuros. La tercera añade unicidad por correo normalizado sólo a la lista de espera. Una colisión histórica interrumpe esa migración; revisar primero la existencia de duplicados. Cada etapa tiene aprobación independiente.

**Reversión.** Ante un error antes del commit, abortar la transacción. Para revertir el P0 ya confirmado, ejecutar bajo el propietario el SQL de reversión capturado inmediatamente antes del cambio, con autorización del titular. La reversión recupera los permisos anteriores, incluidos los abiertos. Mantener suspendida la captación comercial y repetir las pruebas si se usa. El script no revierte migraciones posteriores.

| Requisito de Dev | Estado | Responsable y evidencia para cerrar |
|---|---|---|
| Descubrimiento, diagnóstico, estrategia, plan y recuperación | Probado localmente | El titular introduce datos. El Wizard genera el plan y preserva el acceso por negocio |
| Contrato o consentimiento de piloto | Pendiente de autorización | Titular y operador registran alcance de LAB y negocios autorizados |
| Acceso del titular y control de costos | Pendiente de autorización | Titular confirma agencia, plan, LAB y límites. Revisar acciones premium y destinos antes de habilitar |
| Localización y continuidad de marca/sitio | Probado localmente | El Wizard conserva configuración y sitio. El titular confirma zona, moneda y marca en LAB |
| Snapshot y activos de CRM, pipeline y workflows | Bloqueado | Marketing Agency Snapshot es candidato oficial. Falta inventario de agencia, versión revisada y lectura real de IDs y etapas |
| Formulario, clasificación, dedupe de solicitudes y aislamiento | Probado localmente | Chromium envió Llave en Mano, Dev Squad y una repetición desde el HTML compilado. El backend guardó dos solicitudes de sincronización en Dev; ninguna en la cola Growth. La creación y dedupe de contactos en GHL siguen bloqueadas |
| Agenda | Pendiente de autorización | Anfitrión concede OAuth en la subcuenta correcta; después comprobar disponibilidad, reserva y conflicto |
| OAuth, refresh, webhook y observabilidad | Implementado | Endpoint, firma y persistencia tienen QA local. Falta ida y vuelta real de la aplicación y registro del evento |
| Caso principal, indicador y aislamiento en CRM | Bloqueado | Operador relee contacto, oportunidades por oferta, tarea, notificación interna al destinatario de prueba y dashboard; busca el contacto sintético en la otra LAB |
| SSL de la entrega, entrega al titular y política de trial | Bloqueado | Probar URL/SSL, acceso con el titular y el flujo comercial completo antes de activar |
| Correo y redes corporativas compartidas | Pendiente de autorización | Titular decide buzón/calendario y qué cuenta recibe leads y mensajes. Autorizar cada función en el proveedor. La invitación de Social Planner cubre publicación |
| Creación definitiva de Dev | Pendiente de autorización | Aprobar LAB, duplicados, snapshot, costos y consentimiento para la location propia |

**Acceso mínimo para la LAB existente.** En Agency View → Sub-Accounts, seleccionar la LAB de Consultoría registrada previamente y comprobar que pertenece a la agencia. En Agency View → Account Snapshots inspeccionar el candidato y su versión. En Developer Marketplace → My Apps → aplicación privada de 10xteam → Auth, registrar el retorno HTTPS del entorno LAB con ruta `/api/ghl/oauth/callback`. El webhook de prueba utiliza `/api/ghl/webhook`. El usuario final autoriza `locations.readonly`. El adaptador de agencia consume por separado un bearer OAuth de agencia con `locations.readonly` y `oauth.write` para el intercambio por location. Revisar `snapshots.readonly` para el inventario, `locations/customValues.readonly`, `locations/customValues.write`, `opportunities.readonly`, `forms.readonly`, `workflows.readonly`, `calendars.readonly`, `contacts.readonly` y `contacts.write` para la prueba. Las oportunidades y tareas pueden producirse mediante el workflow interno del snapshot. La creación de subcuentas y el envío comercial quedan fuera de este ensayo.

En el almacén de secretos del servidor LAB (por ejemplo, Vercel → proyecto Growth → Settings → Environment Variables → Preview, restringido a la rama LAB), guardar `GHL_AGENCY_ACCESS_TOKEN`, `GHL_CLIENT_SECRET`, `ONBOARDING_ENCRYPTION_KEY` y el secreto de worker. Configurar `GHL_COMPANY_ID`, `GHL_CLIENT_ID`, `GHL_REDIRECT_URI`, la lista `GHL_LAB_LOCATION_IDS` y el manifiesto `GHL_SNAPSHOT_RELEASES`. Usar una base de prueba y activar sólo las funciones autorizadas en ese entorno. Un token privado de una subcuenta permite ciertas lecturas directas pero el adaptador del PR espera el intercambio OAuth de agencia. Su bearer de agencia debe estar vigente durante el ensayo. Probar su renovación operativa antes del piloto.

**QA reproducible.** `npm test` incluye la prueba de permisos y reversión con datos históricos sintéticos, anónimo y dos titulares. Para el navegador, construir la landing en `../dev.10xteam.com` con `npm ci && npm run build`. En una base descartable con PostgREST ya migrada, cargar `tests/browser/dev-form-fixture.sql` como administrador. Arrancar el backend de prueba. Exportar `WIZARD_TEST_URL` y `WIZARD_TEST_POSTGREST_URL` a loopback y `WIZARD_TEST_SERVICE_KEY` al token local desechable. Ejecutar `npm run test:browser`. El navegador intercepta el endpoint comercial y envía los datos únicamente al backend de pruebas.
