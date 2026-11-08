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
