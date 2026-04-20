# ERROR LOG - Historial de Errores

| Fecha | Error | Contexto | Solución / Mitigación |
| :--- | :--- | :--- | :--- |
| 2026-04-19 | `npm error EBADF: bad file descriptor, write` | Falla al ejecutar `npm install` debido al escaneo/sincronización de Google Drive en `G:\Mi unidad`. | **Mitigación:** Ejecutar Vercel Deployment vía GitHub o Local CLI, lo cual resuelve dependencias en la nube (Linux) evitando la escritura local conflictiva. Alternativamente, salir completamente del cliente de Google Drive antes de ejecutar `npm`. |
