# Auditoría y QA del Wizard

Base revisada: `ecdcb93b8745bef787d846b620055de70e22c1e7`. La comparación distingue el código de la rama principal, el cambio preparado para revisión y la evidencia que aún debe obtenerse en un entorno integrado.

## Diferencias con la especificación

Las cuatro etapas del Registro Maestro siguen siendo útiles: diagnóstico, contratación, onboarding modular y activación. El recuento de las secciones 41–43 es de **101 variables** (17 D, 18 K y 66 O). La activación añade pruebas. El repositorio de partida implementaba un diagnóstico comercial de seis pasos. Las 101 variables eran un diccionario de decisiones, no 101 preguntas ejecutables ni una certificación de que los conectores funcionaban.

| Bloque | Cobertura en el piloto |
|---|---|
| D01–D17 | Se reutilizan negocio, oferta, ICP, objeciones, proceso, canales y economía. La ampliación recoge meta a 90 días, embudo, volumen, restricciones, recursos, herramientas y continuidad. La falta de información se conserva como desconocida. |
| K01–K18 | Titular autenticado, BA separada, país, zona horaria, moneda, idioma y verificación de contrato/piloto. Contratación, identificación fiscal, cobro y cambios de plan siguen siendo procesos externos. |
| O01–O16 | Marca, línea editorial, web existente y formularios se conservan en el perfil. Correo y DNS tienen tareas y autorizaciones específicas. El cambio de DNS y la migración de buzones requieren intervención. |
| O17–O37 | WhatsApp, telefonía, redes, permisos de atención/publicación y gasto están sujetos a elegibilidad y autorización. El MVP muestra las tareas de WhatsApp/redes. Telefonía y campañas avanzadas quedan para una implementación específica. |
| O38–O57 | Ruta de citas y hosts, CRM, valores, pipeline, workflows, medición, pagos e IA. La plantilla instala los activos y el adaptador comprueba presencia. Una reserva real, una métrica reconciliada, PSP y permisos de canal necesitan QA del módulo. |
| O58–O66 | Extras de hosting, listings, SEO, IP, app móvil, premium, marketplace, prospección avanzada y contenido IA quedan diferidos. Incorporarlos únicamente tras validar su caso, costo y permisos. |

Secciones 65–70: se implementaron selección de release, bloqueo por versión, reconciliación, memoria por BA y evidencia para la entrega. Secciones 75–78: las decisiones posteriores separan facturación/identidad por BA y exigen autorización para agrupar negocios. El MVP no deriva pertenencia por marca, email o tarjeta. El checkout y los descuentos siguen fuera de este cambio. La decisión posterior de priorizar prospección y acompañamiento está representada en recomendaciones y KPIs vinculados a respuestas. Los agentes avanzados quedan como evolución.

## Matriz de estado real

| Funcionalidad | Estado | Evidencia | Qué falta | Prioridad | Acción |
|---|---|---|---|---|---|
| Seis pasos, rutas ICP y resumen | Existentes y reutilizados | Step1–Step6, WizardProvider y recorrido Chromium | Medir duración humana en pilotos | P1 | Cronometrar por tipo de negocio |
| Guardado y reanudación | Implementados y probados en local | Sesión privada, CAS en PostgreSQL, recarga en navegador | Alta Auth real y prueba entre dispositivos en entorno autorizado | P0 | Iniciar sesión como titular de LAB |
| Diagnóstico y recomendaciones | Implementados y probados con datos sintéticos | Informe HTML accesible sólo al registro, prioridad con evidencia, prueba B2B/citas | Validar utilidad con usuarios y medir resultados | P0 | Pedir al piloto que confirme el plan |
| Perfil, continuidad y memoria | Implementados | Hechos con origen/estado, restricciones, marca y permisos por BA | Historial de resultados reales de uso | P0/P2 | Añadir señales tras consentimiento |
| Plan → CRM, workflows y KPI | Implementado en el código | Arquetipo, valores, etapas, assets, prueba principal y panel de entrega | Validar contenido del snapshot y lectura de KPI en agencia | P0 | Aprobar release y reconciliar métricas |
| Crear y personalizar location | Adaptador preparado, proveedor simulado | Creación condicionada, lock, read-back de valores y activos | Probar scopes, versión, instalación y tiempos de importación en GHL | P0 | Primero LAB existente; crear Dev sólo tras autorización |
| Duplicados y recuperación | Probados en entorno controlado | Escrituras concurrentes, timeout de creación, reintento sobre location guardada, preservación de cambios | Ensayar error real y reconciliación asistida | P0 | Guardar evidencia de IDs antes/después |
| Aislamiento y autorizaciones | Probado localmente | Segundo navegador, privilegios SQL, cookie opaca, versión y aprobaciones | Verificar roles efectivos y sesiones reales de Auth/GHL | P0 | Prueba negativa contra otra BA con usuario cliente |
| OAuth y webhooks | Implementación y pruebas criptográficas locales | Nonce consumido una vez, cifrado ligado a BA, firma Ed25519 y replay | Callback real, expiración y rotación en LAB | P0 | Registrar app y comprobar token de location |
| FORM → contacto Dev | Ruta y worker preparados | Mapeo de ambas ofertas, cola por BA y deduplicación por correo | Registro de ruta, ejecución autorizada, contacto/oportunidad/tarea/métrica reales | P0 | Seguir checklist Dev |
| Límites de IA | Desactivada por defecto; reserva probada en SQL | Presupuesto ausente, titular incorrecto y competencia por el último saldo se bloquean | Precios de modelo comprobados y conciliación real antes de habilitar IA de pago | P0 | Mantener diagnóstico por reglas durante ensayo |
| FUNCTIONAL_READY y trial | Evaluador y ventana interna probados con fixtures | Un gate faltante/fallido/simulado/ajeno bloquea; repetición no duplica reloj | Evidencia real de BA, costo, rol y caso primario; integración PSP aparte | P0 | Operador asignado registra cada prueba |
| Ayuda y seguimiento | Inicial en interfaz | Explicaciones, tareas por módulo, referencia de soporte, primeros pasos, revisión a 7 días | Medir dudas reales y alimentar la base de ayuda | P1 | Revisar los tres primeros casos |
| Agentes avanzados | Datos y punto de integración preparados | Memoria versionada y separada, recomendaciones con fuentes, eventos por BA | Evaluar prospección multicanal y revisión de cuentas con datos reales | P2 | Empezar con lectura y revisión humana |

## Evidencia reproducible

| Prueba | Entorno y resultado |
|---|---|
| Guardar, recuperar y proteger el diagnóstico | Aplicación Next compilada en loopback, Chromium, PostgREST y PostgreSQL embebido PGlite. Un navegador completa los seis pasos, cambia la rama del objetivo, abre el HTML y recupera el plan tras recarga. Un segundo contexto intenta leer la BA y el informe ajenos. |
| Contratos de negocio, guardado, costos, aislamiento y estado | La suite de Node ejercita la lógica efectiva y ejecuta las migraciones sobre PostgreSQL embebido. Incluye prueba positiva del evaluador con referencias ficticias marcadas como reales por el fixture, y rechazo de evidencia simulada, fallida, desactualizada o de otra location. |
| Integración de proveedor | Transporte simulado. Verifica preservación de valores del cliente, lectura de valores personalizados, rutas y activos esperados, deduplicación y recuperación. La validación de activos por nombre requiere complementarse con la prueba funcional real. |
| Integración remota | Pendiente. Para aprobar la primera alta real faltan entorno activo, credenciales/roles, catálogo de snapshots verificado, caso completo en LAB y ruteo confirmado del formulario. |

El informe de oportunidad y las recomendaciones son estimaciones por validar con ventas y datos del negocio. Los resultados sintéticos sirven para aceptar el código en revisión. La autorización para operar el primer cliente requiere las verificaciones externas del [manual](pilot-runbook.md).

## Matriz P0 vigente · 8 de noviembre de 2026

| Superficie | Prueba y resultado | Alcance |
|---|---|---|
| PostgreSQL aislado | Ida, reversión con las nueve tablas vacías y reaplicación de 053/054. Con una sesión presente se abortó la reversión y se conservaron sesión e índice. Se conservaron el lead preexistente y la denegación de lectura anónima. | Base descartable, datos sintéticos |
| Roles | SELECT, INSERT, UPDATE, DELETE y TRUNCATE denegados según ACL; dos titulares sólo leen su propio negocio y consumo. | Base aislada, 16 tablas |
| Código de proveedor | Scope exacto de lectura en callback y refresh. Credencial LAB rechaza otra location, alta de subcuentas y configuración incompleta incluso si hay bearer de agencia. | Proveedor simulado |
| Navegador | Formulario Astro compilado → Next → PostgREST → cola Dev, ambas ofertas y una repetición; recuperación de diagnóstico y rechazo entre negocios. | Chromium en loopback |
| HighLevel Consultoría | Un contacto QA con DND, dos oportunidades por producto y una tarea comprobados manualmente. El segundo producto fallaba por la preferencia de oportunidades múltiples. Después del ajuste, ambas tarjetas persistieron. | Interfaz real de GHL |
| API de HighLevel y resultado comercial | Sin callback, refresh, webhook real, lectura API de activos, notificación o indicador automático verificados. | Bloqueado por configuración, activos y autorización |


## QA incremental · 9 de noviembre

053 sola, con 054 ausente: migración y reversión en PostgreSQL embebido. El backend service_role inserta leads sin una ruta activa y la cola permanece vacía; el diagnóstico histórico sintético se conserva íntegro. La reversión conserva el lead y las restricciones del P0, restaura el default y permite reaplicar 053. Con una sesión presente, rechaza la reversión sin perderla. No se aplicaron migraciones remotas. Consultar el runbook para el entorno online acordado y la aprobación individual de 053.

Resultado de esta revisión: **28/28 pruebas automatizadas**, lint y TypeScript aprobados. No se repitieron las tres pruebas de Chromium previas, pues no cambió código de aplicación ni el formulario. No se atribuye este ensayo SQL a HighLevel real.


### Base alojada después de la aprobación específica

Aplicado únicamente el SQL 053, registrado por Supabase como **20261109173128 / intelligent_onboarding**. La versión 054 continúa pendiente. Respaldo lógico privado de siete tablas y restauración verificados en PostgreSQL embebido antes de aplicar. La comprobación remota conservó los 20 diagnósticos por digest, las nueve tablas nuevas permanecen vacías con RLS y ACL cerradas y ninguna ruta de envío activa. Archivo de migración renombrado al historial real para prevenir reaplicación. No se revirtió producción.

Pendiente: identidad Auth del titular (cero usuarios existentes), OAuth/refresh/webhook real, snapshot B2B revisado y operación comercial automática. El navegador requiere sesión Vercel para abrir la Preview. El PR queda abierto en borrador y el dictamen para crear Dev sigue siendo NO-GO.


Verificación real desde Vercel Preview cb20235 (READY, despliegue dpl_CN1zVVqDZSR7uBPdfNrofC52xCj7): lectura de onboarding_sessions con service_role HTTP 200; nueve lecturas anónimas de tablas nuevas, dos DELETE anónimos (onboarding_sessions y contact_leads) y un PATCH anónimo denegados con 401/403 y SQLSTATE 42501. Los intentos de mutación también usaron un UUID sintético inexistente. No se crearon ni borraron registros. Las nueve lecturas de HighLevel Consultoría volvieron a pasar con HTTP 200: location, pipelines, formulario, workflows, calendarios, Custom Values, contacto QA, dos oportunidades diferenciadas y tarea. Los registros GHL siguen siendo los de la prueba manual previa, no del flujo automático. Build, 28/28 tests, lint y TypeScript aprobados; sin despliegue de producción.


## Activos preparados en Consultoría y verificador limitado por alta · 9 de noviembre

Preparación manual real en la única LAB autorizada, conservando los registros QA: seis Custom Values vacíos creados con los nombres del plan; pipeline existente FY7sgYVcrc2fY3lmwxE3 con Nuevo prospecto → Calificación → Diagnóstico → Propuesta → Decisión, orden comprobado tras recarga. La nueva Calificación usa probabilidad de prueba 30%; las probabilidades anteriores se conservaron. Campo de contacto 10x_service creado como TEXT, key contact.10x_service, ID wLVPrSyDs6x5ZUfKABYv, carpeta 10x Dev LAB. El backend ya limita el valor a las dos ofertas admitidas. Son activos preparados manualmente, no provisión automática del Wizard ni un snapshot aprobado.

La lectura real del campo por API devolvió 401 con la credencial actual. GET /workflows/step-types devolvió 403 WORKFLOW_API_NOT_ENABLED_FOR_LOCATION, aunque el listado de workflows responde 200. Se verificó con la documentación oficial v3: no asumir que añadir workflows.write habilita esta función. La interfaz autenticada de HighLevel sí permite preparar la LAB. No se ampliaron scopes ni se rotaron tokens. GHL_COMPANY_ID se obtuvo de la lectura real de Consultoría y quedó guardado sólo en Preview para la rama.

Antes de habilitar a un verificador se cerró un hueco en la comprobación por alta: la inclusión global del usuario en la allowlist ya no le permite verificar sus otras altas propias sin asignación. API GET/POST y pantalla de revisión calculan operator con una consulta server-side a onboarding_reviewers para el ID y usuario exactos. Sin asignación, sin rol global, con invitado o con error de consulta se deniega la facultad de verificación; el titular conserva sus acciones normales. No se escribió ninguna asignación ni se concedieron permisos todavía. 29/29 pruebas locales, lint y TypeScript aprobados. La nueva prueba cubre titular allowlisted sin asignar, otra alta, otro usuario, invitado, asignación válida y fallo de consulta.

El alta real sigue siendo la versión 9 del titular, con diagnóstico y plan persistidos, sin location vinculada ni autorización de ejecución. Snapshot aprobado, workflow, OAuth/refresh/webhook y ciclo completo siguen pendientes. La reducción de longitud y UX/UI están diferidas por indicación del titular. Mantener 054 pendiente y no crear Dev ni desplegar producción.


## Evidencia diferenciada al cierre de esta ejecución · 9 de noviembre

| Comprobación | Entorno y resultado | Límite |
|---|---|---|
| Diagnóstico y plan del titular | Preview/Supabase reales, plan 9 persistido | Sin permiso de ejecución ni location vinculada |
| Agencia/location, pipeline y personalización | Preview 429dafd READY, lecturas GHL 200; 5 etapas ordenadas y 6 Custom Values | Los valores siguen vacíos |
| Aislamiento de Data API | Base alojada: 9 lecturas, 2 DELETE y 1 PATCH anónimos denegados | Sin mutación de registros |
| Workflow interno | UI real: borrador 8c72488f-4f86-4cfd-902c-f2c8d50ffcd5 guardado y releído; filtro QA+source, búsqueda previa, oportunidad, tarea y aviso interno | No publicado, no ejecutado, recepción no probada |
| Campo de producto | UI real, contact.10x_service, ID wLVPrSyDs6x5ZUfKABYv | API de lectura 401 con token actual |
| Autoría por API | Real 403 WORKFLOW_API_NOT_ENABLED_FOR_LOCATION | No solicitar scope de escritura como solución supuesta |
| Verificador por alta y SQL propuesto | 30/30 tests locales totales, lint y TypeScript; asignación exacta/idempotente y rechazo de titular/plan/location incorrectos | Ningún permiso concedido en línea |
| Ciclo formulario→CRM→tarea→aviso→indicador | Pendiente real | Registros QA manuales y mocks no acreditan FUNCTIONAL_READY |

Sin cambios en producción, cuentas nuevas, precios, campañas, comunicaciones comerciales, cobros ni UX/UI. PR #1 sigue borrador; snapshot, OAuth/refresh y webhook siguen sin validar.
