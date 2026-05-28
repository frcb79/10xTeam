# DECISIONS - Registro de Decisiones

| Fecha | Decision | Por que se tomo |
| :--- | :--- | :--- |
| 2026-05-25 | **Proyecto separado para growth:** Crear `growth.10xteam.com` independiente de dev. | Evitar mezclar oferta comercial y reducir riesgo tecnico entre unidades. |
| 2026-05-25 | **Stack inicial:** Next.js + TypeScript para growth. | Soporta landing y evolucion a wizard/plataforma sin migracion temprana. |
| 2026-05-25 | **Estructura compartida:** Crear carpeta `shared` para activos reutilizables. | Reutilizar sin duplicar y mantener gobernanza clara entre proyectos. |
| 2026-05-25 | **Wizard + endpoint interno:** usar `POST /api/icp/materials` como primer motor de salida. | Permite desacoplar UI del wizard de la logica de generacion y facilita integraciones futuras. |
| 2026-05-25 | **Cobertura de canales en MVP:** LinkedIn, Instagram, Facebook, Email, WhatsApp y Ads. | Alinear el MVP con objetivo comercial de materiales multicanal desde una sola captura ICP. |
| 2026-05-27 | **Gancho comercial del wizard:** entregar un PDF atractivo del ICP por correo y usarlo como puente a cita o cierre. | Convertir el wizard en lead magnet de alto valor para capturar demanda con menos friccion comercial. |
| 2026-05-27 | **Plataforma privada para clientes:** habilitar login solo despues de contratacion para acceder a ICP, materiales y seguimiento. | Separar el valor gratuito del valor recurrente y facilitar retencion/upsell sin meter friccion al inicio. |
| 2026-05-28 | **HTML visual como fuente canonica del subdominio:** servir `growth.10xteam_website.html` en `/` mediante rewrite interno. | El CEO pidio mantener exactamente el diseno, colores, fuentes y secciones del HTML aprobado; esta ruta conserva fidelidad visual sin abandonar Next.js para la evolucion futura de la plataforma. |
