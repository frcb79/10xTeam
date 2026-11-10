# 10xteam Growth OS — Wizard de valor inmediato (propuesta de producto, no implementada)
Fecha: 10-nov-2026 | Origen: observación del titular sobre abandono por preguntas abiertas.

## Decisión propuesta
El Wizard largo sigue siendo útil como **motor de implementación interna**, pero NO como puerta de entrada comercial. Separamos **descubrimiento ligero → muestra de valor → acceso → activación → personalización opcional**. No cambiar pantallas mientras transcurren las traducciones; implementación requiere validación específica.

## Primer contacto (hipótesis objetivo: menos de 90 s, 4 a 6 selecciones)
1. Industria/vertical (catálogo, no texto libre): servicios profesionales, salud, educación, inmobiliario, financiero/intermediación, comercio, automotriz, restaurantes, tecnología/B2B u otro.
2. Actividad/subnicho: opciones condicionales de esa vertical, con «No encuentro mi negocio» como escape.
3. Prioridad: conseguir prospectos, mejorar seguimiento, agendar citas, recuperar clientes, automatizar atención.
4. Volumen y capacidad: solo/tiene equipo, rango de leads o clientes, «No lo sé» permitido.
5. País e idioma preferido. Web URL **opcional**: «Tengo web» / «No tengo o prefiero omitirla».
6. Una sola confirmación para ver el reporte. No exigir correo hasta haber mostrado valor, salvo que el usuario elija guardar su progreso.

## Resultado WOW: reporte sectorial con límites explícitos
- Perfil tipo del sector y mapa comercial: cómo atrae, califica y convierte prospectos un negocio de esa categoría.
- Tres fricciones habituales, expresadas como hipótesis del sector, **no** como diagnóstico individual acreditado.
- Vista conceptual de la máquina: origen → captura → calificación → pipeline → seguimiento → cita → medición. Componentes conectables con HighLevel.
- Tres automatizaciones recomendadas (con propósito, qué se requiere y qué podría medirse), CTA «Activar mi sistema».
- Ejemplo de pipeline, mensajes tipo y tablero con **datos demostrativos claramente identificados**. Nada de estimaciones fabricadas ni resultados garantizados.
- Si facilita una URL, enriquecimiento basado en observaciones comprobadas del sitio; mostrar fuentes, campos inferidos y lo que NO sabemos. Si no, mismo reporte profesional basado en su industria y selecciones.
- La demostración no crea activos ni envía mensajes.

## Alta tras mostrar valor
- Registro ligero y consentimiento para preparar la cuenta. Asignar un arquetipo predefinido verificable por industria/objetivo; crear o vincular BA SOLO si autorización y costo están confirmados. Reutilizar módulos estándar con versión e idempotencia; evitar personalización por intuición.
- Mostrar progreso de activación, distinguir «preconfigurado» de «conectado» y de «probado».
- Dos pasos visibles: (1) **Conectar canales y redes mediante OAuth oficial, Social Connect Invite y permisos del proveedor; NUNCA pedir contraseña de Facebook/Instagram/etc. en 10xteam.** (2) **Mejorar tu configuración** opcional mediante preguntas guiadas de opción múltiple y edición puntual.
- Un negocio sin web debe poder empezar con formularios y procesos comerciales; web propia NO es requisito.
- A la mayoría de usuarios ofrecer opciones y defaults recomendados, no preguntas abiertas: preferencia «Usar recomendación», «Elegir otra» o «Lo haré después».

## Validación de negocio y métricas
Hipótesis (no hechos): inicio→reporte ≥70%, reporte→registro ≥20%, registro→primera acción ≥50%, duración mediana ≤90 s en entrada. Medir por cohortes, industria y presencia de sitio antes de decidir cambios. Test A/B contra el Wizard actual; no inventar resultados.

## Límites de implementación
No rehacer el diagnóstico Dev existente ni alterar su sesión v9. No interferir traducciones. No cambiar sitio DEV ni tráfico Web3Forms. No instalar subcuentas ni snapshots sin autorización. Mantener aparte este trabajo de adquisición del E2E LAB técnico.
