# ERROR LOG — Registro de Errores
Documentar TODOS los errores y como se resolvieron.
Consultar SIEMPRE al inicio de sesion.

## ERRORES ACTIVOS
- 2026-09-03 / Google suspendió el proyecto asociado a la clave de Gemini configurada / Las llamadas a Gemini Flash devuelven 403; OpenAI `gpt-4o-mini` quedó configurado y validado como proveedor de desarrollo para ICP, Buyer Persona, Belief Map y voz, por lo que el wizard no queda bloqueado / Reactivar el proyecto de Google o reemplazar la clave por una activa si se quiere volver a usar Gemini.

## ERRORES RESUELTOS
- 2026-09-04 / La calculadora del diagnóstico mostraba conteos como MXN y reutilizaba el total mensual para el costo de tiempo / En `src/lib/diagnostics/html.ts`, cada fila usa su propiedad específica de `OpportunityResult`; los conteos muestran `prospectos/mes` o `clientes/mes`, los montos usan `formatCurrency()`, y `replaceSection()` usa un callback para preservar importes que inician con `$` / Nunca interpolar contenido monetario en una cadena de reemplazo con grupos regex (`$1`, `$2`), porque valores como `$15,000` se interpretan como referencias de captura y corrompen el HTML.
- 2026-08-28 / Wizard ICP perdia todas las respuestas al recargar la pagina (estado solo en React Context, en memoria) / Se agrego persistencia del `WizardState` en `sessionStorage` con hidratacion post-mount en `WizardProvider` (accion nueva `HYDRATE`, sanitizando estados transitorios `processing`/`scraping`/`complete`/`error` a `in_progress`) / Los pasos guardan su estado global al presionar "Continuar"; una recarga conserva pasos confirmados y el paso actual. Verificado E2E en produccion con recarga intencional en paso 5 y registro real en `diagnostic_records`.
- 2026-05-27 / Asignacion de dominios Vercel antes de DNS validado / Se configuraron registros DNS (`@`, `www`, `dev`, `growth`), se actualizo Vercel CLI, se reasignaron aliases al deployment correcto por proyecto y se verifico respuesta HTTP 200 en los cuatro hosts / Primero DNS, despues enlace de dominio por proyecto y validacion final.
- 2026-06-10 / Drift de tipos entre el wizard legacy, el nuevo contrato `WizardAnswers` y la API de materiales / Se alinearon los guards del request, el tipo `PrefillConfidence` y el campo obligatorio `step6`, dejando `npm run build` nuevamente en verde / Cuando conviven un flujo legacy y uno nuevo, cada cambio de contrato debe propagarse al segundo antes de cerrar la sesion o el build se rompe al final.

Formato: Fecha / Titulo / Solucion / Aprendizaje