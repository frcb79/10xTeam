# Alta de un negocio en 10xteam Growth OS

## Conexiones y pruebas de entrega

Registrar por negocio, location, versión del plan, servicio y finalidad. El titular documenta su autorización y alcance. El verificador registra el identificador de la evidencia, la fecha y el resultado. La API de alta conserva el historial en el plan de esa versión. Una autorización del Wizard documenta la decisión del cliente. El permiso efectivo se concede en el proveedor. Guardar referencias internas opacas, nunca el enlace secreto, la contraseña de la invitación, un token ni el contenido de mensajes.

| Servicio | Qué solicita el Wizard | Autorización | Automatizable | Titular | Costo que verificar | Prueba funcional controlada | Estado inicial |
|---|---|---|---|---|---|---|---|
| Facebook | Página y finalidad: publicación, inbox o leads | Meta OAuth. Social Connect Invite para publicar | Consultar cuenta y preparar borrador | Administrador de la página | Publicidad y acciones posteriores | Contrastar ID de página y destino. Comprobar borrador privado. Verificar inbox y leads por separado | Pendiente |
| Instagram | Cuenta profesional, función, marca | OAuth por Social Planner o invitación | Verificar activo en la subcuenta | Sí | Funciones adicionales y anuncios | Borrador privado y lectura de la cuenta seleccionada | Pendiente |
| LinkedIn | Perfil o página y responsable | OAuth de LinkedIn en Social Planner | Lectura de cuenta y borrador | Titular o administrador de página | Ads separado | Borrador asociado al ID de perfil o página correcto | Condicional |
| Google Business Profile | Ficha, sucursal, ubicación | OAuth de Google con gestor de ficha | Inventario después de consentimiento | Sí | Confirmar servicios adicionales | Leer la ficha correcta y preparar publicación privada | Condicional |
| Correo | Buzón, responsable y uso individual o masivo | Google/Microsoft OAuth para buzón. DNS específico para dominio de envío | Estado de autorización y validación DNS | Titular de buzón y, para DNS, administrador | Envíos, validación y proveedor | Lectura de estado. Prueba de entrega sólo con buzón controlado y envío autorizado | Pendiente |
| Calendario | Anfitrión, agenda, zona y horario | OAuth Google/Microsoft desde la subcuenta | Leer disponibilidad y conflictos concedidos | Cada anfitrión | Licencia de proveedor si aplica | Reservar, impedir solapamiento, mover y cancelar en calendario LAB con avisos desactivados | Condicional |
| WhatsApp Business | Número, WABA y propietario | Alta oficial con Meta y verificación del titular | Lectura del estado tras aprobación | Administrador de Meta y número | Suscripción y tarifas de mensajería según cuenta/país | Verificar asociación y estado; mensaje sólo tras aprobar destinatario y costo | Pospuesto |
| Telefonía | País, uso, titular y número existente | Consola LC Phone/proveedor, KYC o portabilidad | Verificación de inventario | Titular y operador | Compra, renta, portabilidad y tráfico | Revisar enrutamiento sin llamar. Prueba de llamada sólo con aprobación | Pospuesto |
| Dominio/DNS | Subdominio y proveedor actual | Admin del dominio aplica registro puntual | DNS público, SSL y resolución | Admin DNS | Registro/renovación o servicio DNS | Validar registro, certificado y URL; preservar MX y el sitio | Condicional |
| Formulario o página | URL existente, campos, aviso, producto y destino | Dueño del sitio autoriza backend y mapeo por origen | Recepción, dedupe y lectura en location | Para publicar cambios o enlazar | Hosting existente y acciones disparadas | Repetir envío sintético: un contacto/oportunidad, una tarea, notificación interna de prueba y conteo conciliado | Preparación local |
| Pagos | Pasarela, país, moneda y dueño | OAuth/conexión oficial desde Payments, modo prueba | Estado y evento sandbox | Titular de la cuenta | Comisión, suscripción y disputas | Evento de prueba y conciliación sin cargo real | Pospuesto |

**Social Connect Invite.** En la subcuenta autorizada, abrir Marketing → Social Planner → Settings → Social Accounts → Social Connect Invite. El titular abre la invitación protegida y autoriza directamente en cada red. La invitación dura 30 días y el operador puede revocarla en Manage Links. Separar publicación, conversaciones y captación publicitaria. Para Dev y Growth, inventariar las páginas y los destinos existentes, acordar un solo responsable para cada flujo y registrar los activos antes y después de una reconexión Meta. [Invitación oficial](https://help.gohighlevel.com/support/solutions/articles/155000009068-invite-clients-to-connect-social-accounts-in-social-planner) · [Permisos compartidos Meta](https://help.gohighlevel.com/support/solutions/articles/155000008432-why-you-should-grant-access-to-all-pages-when-connecting-a-social-account) · [LinkedIn](https://help.gohighlevel.com/support/solutions/articles/48001215736-connecting-linkedin-profile-and-business-pages-to-social-planner) · [Google Business Profile](https://help.gohighlevel.com/support/solutions/articles/48001210325)

**OAuth de plataforma.** Verificar plan y agencia en Agency View → Settings → Billing. Inventariar las locations en Sub-Accounts y snapshots en Account Snapshots. En el Marketplace de desarrolladores, seleccionar la aplicación de 10xteam, comprobar tipo de distribución, URI de retorno y versión, autorizar únicamente la LAB y revisar los scopes efectivamente devueltos. La sesión web del operador y la autorización OAuth de la aplicación son requisitos independientes. Usar secretos sólo en el servidor, estado de un solo uso, intercambio por location, refresh rotado y webhook firmado. Las acciones de creación quedan cerradas por defecto. [OAuth 2.0](https://marketplace.gohighlevel.com/docs/Authorization/OAuth2.0/) · [Scopes oficiales](https://marketplace.gohighlevel.com/docs/Authorization/Scopes/) · [Token de location](https://marketplace.gohighlevel.com/docs/ghl/oauth/get-location-access-token/)

| Operación | Alcance mínimo a verificar en el manifiesto |
|---|---|
| Buscar agencia/location y snapshots | `locations.readonly`, `snapshots.readonly` donde aplique |
| Obtener token de una subcuenta autorizada | `oauth.write` de agencia |
| Leer pipeline, formularios, workflows, agendas y valores | `opportunities.readonly`, `forms.readonly`, `workflows.readonly`, `calendars.readonly`, `locations/customValues.readonly` |
| Personalizar y releer valores | `locations/customValues.write` más el permiso de lectura |
| Probar contacto, oportunidad y tareas | `contacts.readonly`, `contacts.write`, `opportunities.readonly`. Añadir `opportunities.write` sólo para escritura directa aprobada; confirmar el endpoint concreto de tareas |
| Crear una subcuenta definitiva después del piloto | `locations.write`; requiere el visto bueno sobre costos, duplicados y versión del snapshot |

El costo depende del contrato de agencia, país, proveedor y uso. Consultar el precio dentro de la cuenta antes de habilitar una operación facturable. [Precios y consumos](https://help.gohighlevel.com/support/solutions/articles/155000001156-highlevel-pricing-guide) · [Sincronización de Outlook](https://help.gohighlevel.com/support/solutions/articles/48001229663-two-way-email-sync-for-outlook)

## Checklist reutilizable del titular

| Cuándo | Información o activo | Descubrimiento permitido | Confirmación y prueba |
|---|---|---|---|
| Obligatorio al diagnóstico | Nombre comercial, sitio si existe, contacto del titular, país e idioma | Sitio público y datos ya declarados | Titular confirma identidad, oferta y forma de contacto |
| Obligatorio al diagnóstico | Modelo, productos, moneda, público y objetivo prioritario | Oferta y textos públicos | Confirmar quién compra, qué problema busca resolver y qué resultado se medirá |
| Obligatorio para configurar | Proceso comercial, responsable, asignación, siguiente paso, activos a conservar | Documentación y procesos proporcionados | Acordar etapas, restricciones y criterio de entrega |
| Obligatorio para activar | Location, titular, zona horaria, accesos, aceptación de piloto o contrato, responsable de incidencias | Metadatos autorizados del proveedor | Identidad única, aislamiento de BA, contacto de soporte y prueba central |
| Obligatorio para medir | KPI, fuente, dueño y frecuencia de revisión | Informes que el cliente autorice | Registrar línea base desconocida cuando corresponda; medir desde el primer caso |
| Condicional | Marca, logo, colores, tipografía, imágenes, copys, frecuencia y referencias | Sitio y materiales entregados | Aprobar archivos con derechos y muestras que conservan la voz del negocio |
| Condicional | Perfil social, identificadores de página, administradores y activos compartidos | Enlaces públicos y activos autorizados | Confirmar quién publica y quién recibe chats y leads por marca |
| Condicional | Buzón, agenda, anfitriones, equipo, permisos y horarios | Inventario OAuth después del consentimiento | Titular de cada cuenta concede el alcance acordado |
| Condicional | Dominio, formularios, campos, aviso de privacidad, CRM y bases a conservar/importar | Página pública y muestra sintética del esquema | Aprobar mapeo, deduplicación, destino y autorización de tratamiento antes de importar |
| Condicional | WhatsApp, telefonía, pagos, anuncios, uso de IA | Proveedores actuales declarados | Propiedad, consentimiento, presupuesto máximo, restricciones legales y comprobación en entorno seguro |
| Opcional | Materiales comerciales, campañas anteriores y variantes de oferta | Muestras elegidas por el titular | Usar para mejorar diagnóstico y contenido tras validar derechos |
| Posterior | Línea base por canal, calidad de leads, motivos de pérdida, conversión y esfuerzo | CRM y métricas reales del período | Revisar a 7/30/90 días con responsable y volumen de muestra |
| Nunca en el Wizard | Contraseñas, códigos de verificación, seed phrases, claves privadas, tokens o datos de tarjeta | Ninguno | Introducir credenciales directamente en el proveedor. Secretos técnicos en el almacén de servidor |

## Catálogo inicial de snapshots

| Configuración | Contenido o criterio | Decisión para Dev |
|---|---|---|
| Marketing Agency Snapshot oficial | HighLevel enumera sitio, formularios, calendarios, workflows, campañas de correo, anuncios y publicaciones. Plantilla pensada para agencias que captan y nutren prospectos | Comparar formulario de captación, agenda y pipeline con Core. Excluir sitio, campañas, ads y publicaciones de una importación a Dev. Auditar el detalle de cada acción antes de aprobar un módulo |
| Core B2B de 10xteam | Etapas de calificación, diagnóstico, propuesta y decisión, valores de marca, tarea interna, formulario y métricas. La selección la determina el Wizard | Seleccionar activos equivalentes ya probados. Construir únicamente lo que falte. Una clave lógica como `core-b2b` no identifica una versión instalada |
| Real Estate Agent, Dentist y Gym | Plantillas por vertical documentadas en el catálogo oficial | Candidatas para futuros perfiles. Validar formularios y agenda en LAB del vertical correspondiente |
| Snapshots de la agencia o Marketplace | Inventariar nombre, ID, versión, fecha, propietario, licencia por location y precio de adquisición/uso | Pendientes de acceso a la agencia. Una descarga disponible no acredita derechos de reventa ni autoriza un cargo |

El manifiesto de la versión debe enumerar IDs, nombres, orden y destino por módulo, variables vacías, referencias a dominios, correos, teléfonos, usuarios, calendarios y recursos existentes. Revisar cada disparador, espera, webhook, mensaje, acción premium y publicación. Guardar evidencia de la inspección con fecha, responsable, versión y resultado de readback en LAB. Antes de cargar en otra location, comparar activos, seleccionar sólo los necesarios y obtener aprobación de cualquier sustitución. No hay versión habilitada para el piloto hasta completar estas comprobaciones. [Marketing Agency Snapshot y guía](https://help.gohighlevel.com/support/solutions/articles/48001079550) · [Protección y distribución de snapshots](https://help.gohighlevel.com/support/solutions/articles/48000982513)
