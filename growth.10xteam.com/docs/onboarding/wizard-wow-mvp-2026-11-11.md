# 10xteam Growth OS — Wizard WOW comercial y onboarding progresivo
Fecha: 2026-11-11. Rama `feat/intelligent-onboarding-pilot`. Prototipo en `/diagnostico-wow`, separado del Wizard de seis pasos y del LAB autenticado.

## Objetivo y distinción de fases

El usuario tarda hoy demasiado en completar el onboarding profundo. Necesitamos primero demostrar valor comercial **antes del registro**, con preguntas de selección y resultado numérico auditable; después pedir sólo la identidad necesaria para crear la BA. La configuración completa debe obtenerse progresivamente desde su cuenta y desde autorizaciones nativas a terceros. El reporte económico es una **simulación explícita**, no una evaluación IA validada ni una garantía de ROI.

**Fase 1: presentación WOW (objetivo de diseño 60–120 s; medir).** Una página con siete preguntas de opción múltiple + moneda: segmento, problema principal, prospectos mensuales, minutos manuales por lead, conversión a cliente, ticket promedio, costo completo de hora administrativa. Cada cifra puede marcarse desconocida: queda como supuesto declarado. La versión futura puede solicitar nombre comercial y sitio como campo opcional, mostrar evidencia pública sólo si hay extracción verificada y consentimiento, y hacer preguntas adaptativas por segmento.

**Fase 2: reporte pre-registro.** Mostrar horas recuperables, valor equivalente del tiempo liberado, escenarios de ventas brutas adicionales al mes/año y tres acciones específicas basadas en segmento y obstáculo. Separar claramente origen de datos (declarado, supuesto y verificado), bandas y limitaciones. No presentar beneficio neto sumando ahorro de tiempo + ventas hipotéticas; no sumar "horas ahorradas" a flujo de caja. No mostrar utilidad sin margen y costo de adquisición. No hacer promesas de ingresos.

**Fase 3: creación de BA.** Sólo cuando el usuario decide avanzar: autenticar, consentimiento de datos, elegir negocio, jurisdicción/idioma/moneda, titular de cuenta y plan. Reutilizar respuestas anteriores en una sesión autenticada y guardar origen del dato. No reutilizar cookies de otra BA ni crear identidades por SQL. El prototipo inicial **no** implementa persistencia ni registro.

**Fase 4: configuración base (P0).** Solicitar autorización de alta de cuenta, validar condiciones y plan elegido, comprobar límites de agencia y duplicados, crear la subcuenta una sola vez mediante API, registrar locationId y estado `waiting_provider`; crear/verificar pipeline y Custom Values con permisos granulares y idempotencia. Formularios propios o GHL manuales sólo cuando el acceso API no permita crearlos; confirmar caso real E2E. No enviar mensajes externos automáticamente ni contratar AI, WhatsApp o números sin consentimiento.

**Fase 5: onboarding progresivo.** Preguntas adicionales por sector, canal, horarios, ICP, preferencias de respuesta y capacidades de operación. Conectar redes, Google/Microsoft, Meta/WhatsApp, calendarios y pasarela mediante OAuth del titular según necesidad. Agente de adopción de solo lectura tras consentimiento: detectar leads sin tareas, respuestas tardías, módulos sin uso y sugerir siguiente mejora; ejecución siempre aprobada.

## Fórmula del prototipo

Variables mensuales: prospectos `L`, minutos administrativos por lead `M`, tasa de cierre `C`, ticket promedio `T`, costo total por hora `H`.

- Trabajo manual mensual `L*M/60` horas.
- Horas potencialmente liberadas: 20%, 40%, 60% del trabajo manual (escenarios elegidos como hipótesis de producto, **no benchmarks**).
- Valor económico del tiempo: horas liberadas `* H`, **no** necesariamente ahorro de nómina/efectivo.
- Venta bruta de referencia `L*C*T`, C expresada como fracción.
- Ventas brutas adicionales posibles: 5%, 10%, 15% **relativo** al nivel base, sujeto a que el seguimiento produzca ese efecto; no puntos porcentuales. No estimamos nuevas fuentes de leads ni consideramos costos, margen, estacionalidad o causalidad. No equivale a utilidad.
- En el caso `L=0` no hay mejora en ingresos por optimizar la conversión sin nueva demanda; presentar plan de prospección antes que cifra inflada.
- Datos desconocidos: conversión 5%; ticket 15,000 MXN o 750 USD; hora 200 MXN o 20 USD. **Supuestos sólo para simular**, no cifras de mercado ni tasas FX. Ninguna fuente se atribuye a HighLevel.

## Preguntas condicionales futuras

Después del reporte (sin bloquear el WOW): ¿de dónde llegan leads?, ¿canales a conectar?, ¿quién responde?, ¿tiempo actual de primera respuesta?, ¿se venden citas o productos?, ¿requiere aprobación interna?, ¿país/moneda?, ¿hay CRM actual?, ¿qué debe conservarse?, ¿WhatsApp y su titular?, ¿hay restricciones regulatorias? Para finanzas y brokers, añadir consentimiento y origen de datos antes de automatizar prospección. No pedir acceso Meta, bancos, impuestos ni credenciales durante el diagnóstico público.

## Automatizaciones P0/P1/P2

| Módulo | Estado real / siguiente prueba |
|---|---|
| Diagnóstico profundo de seis pasos | Implementado; demasiado largo para adquisición |
| Ruta QA y plan preliminar | Implementado, plan Supabase y consentimientos LAB validados |
| Reporte WOW económico | **Prototipo UI+motor**, sin persistencia, sin integración con session/GHL |
| Auth, multi-BA, aislamientos | Código y QA parcial; falta E2E de nuevos clientes |
| Alta de subcuenta GHL | Adaptador con opción `blank`; requiere Agency Pro, permisos y prueba real |
| Pipeline / Custom Values | Existentes en LAB; alta por API en agencia nueva pendiente |
| Formularios y llegada de leads | Hay ruta/worker con guardas, cero rutas; el alta vía API de formularios no está disponible en catálogo actual |
| Workflow interno | Draft LAB; API workflows 403 para esa location; verificación manual pendiente |
| Calendario, correo, Meta, WhatsApp | Propuestas/integraciones; falta OAuth y pruebas por servicio |
| IA y agente de optimización | Política de ejecución aprobada; sin activación ni consumo de IA en onboarding |
| Cobro, trial comercial y soporte | Requieren oferta/precio, consentimientos, pruebas e integración separada |
| Observabilidad, antifraude, entregas | Falta circuito E2E y evidencias funcionales por cliente |

## Nuevo dominio y agencia definitiva

Crear nueva agencia activa de HighLevel con acceso API Agency Pro; utilizar **`app.growth.10xteam.com.mx`** para Whitelabel Domain, dejando intacto **`app.10xteam.com.mx`** de la agencia de pruebas. En DNS de zona `10xteam.com.mx`, crear CNAME de host `app.growth` a `whitelabel.ludicrous.cloud` (DNS-only si Cloudflare) una vez confirmado que ese nombre está libre. No utilizar el mismo host para Vercel: el Wizard y los sitios web tienen otras URLs. Registrar por separado el API Domain de enlaces en caso necesario. Reconfigurar logotipo, términos, privacidad y datos de agencia, sin trasladar secretos ni fichas sintéticas.

No modificar `GHL_*` de la rama actual hasta crear ambiente independiente con `Company ID` y credenciales de agencia nueva. La cuenta antigua permanece utilizable hasta expiración real de sus derechos. Al conectar OAuth de nueva agencia usar credenciales obtenidas directamente del proveedor; no solicitar contraseñas por chat.

Fuentes oficiales:
- https://help.gohighlevel.com/support/solutions/articles/48000982207-how-to-set-up-a-whitelabel-domain-for-the-desktop-web-app
- https://marketplace.gohighlevel.com/docs/ghl/locations/create-location/
- https://marketplace.gohighlevel.com/docs/ghl/opportunities/create-pipeline/
- https://marketplace.gohighlevel.com/docs/ghl/forms/forms/
