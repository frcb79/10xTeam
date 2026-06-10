# ERROR LOG — Registro de Errores
Documentar TODOS los errores y como se resolvieron.
Consultar SIEMPRE al inicio de sesion.

## ERRORES ACTIVOS
[Ninguno al inicio del proyecto]

## ERRORES RESUELTOS
- 2026-05-27 / Asignacion de dominios Vercel antes de DNS validado / Se configuraron registros DNS (`@`, `www`, `dev`, `growth`), se actualizo Vercel CLI, se reasignaron aliases al deployment correcto por proyecto y se verifico respuesta HTTP 200 en los cuatro hosts / Primero DNS, despues enlace de dominio por proyecto y validacion final.
- 2026-06-10 / Drift de tipos entre el wizard legacy, el nuevo contrato `WizardAnswers` y la API de materiales / Se alinearon los guards del request, el tipo `PrefillConfidence` y el campo obligatorio `step6`, dejando `npm run build` nuevamente en verde / Cuando conviven un flujo legacy y uno nuevo, cada cambio de contrato debe propagarse al segundo antes de cerrar la sesion o el build se rompe al final.

Formato: Fecha / Titulo / Solucion / Aprendizaje