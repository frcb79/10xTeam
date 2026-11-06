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
