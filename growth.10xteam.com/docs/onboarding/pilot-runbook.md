# Alta inteligente de un negocio

El Wizard conserva el diagnóstico comercial de seis pasos. El negocio define después su objetivo a 90 días, el problema que más le cuesta ventas y los activos que quiere conservar. Obtiene un diagnóstico, hasta tres prioridades con su fundamento, una configuración propuesta y una lista de conexiones con responsables.

## Qué ocurre durante el alta

| Momento | Automático | Acción humana | Resultado que se comprueba |
|---|---|---|---|
| Primer contacto | Guarda en servidor los pasos confirmados con una sesión privada. La web es optativa. | El prospecto confirma oferta, tipo de comprador, canales, proceso y capacidad. Puede responder manualmente. | Recarga y conserva respuestas. Un segundo navegador sin acceso recibe 404. |
| Objetivo | Selecciona preguntas según citas, conversión y uso compartido de redes. Genera memoria y recomendaciones con referencias a las respuestas. | Corregir datos y declarar qué conservar, restricciones y meta. | El plan de citas incluye agenda y conflictos. B2B propone empresas y calificación. Consumo propone captación y referidos. |
| Contratación | Vincula la sesión invitada con un usuario autenticado cuando el titular inicia sesión con su registro. Cada BA tiene su propia identidad. | El equipo entrega acceso a una cuenta de Auth y comprueba el contrato o la autorización del piloto. | La persona retoma sus registros desde /wizard/access y elige el negocio en /wizard/businesses. |
| Configuración | Selecciona una versión de plantilla aprobada. Busca una cuenta candidata, crea sólo si procede, guarda el ID y personaliza campos 10x. Relee activos. | El titular aprueba el alcance. Un operador asignado reconcilia ambigüedades. | Una sola location por BA. Valores, etapas y activos esperados en esa location. |
| Conexiones | Registra conservar, conectar, migrar, crear o posponer. Guarda alcance y versión de autorización. | El titular autoriza OAuth, Meta, correo, DNS o pasarela en el proveedor. Se revisan costos por separado. | La selección de un módulo y su conexión técnica se muestran por separado de su prueba funcional. |
| Entrega | Calcula las verificaciones requeridas para esa BA y objetivo. El registro interno del trial es opcional e idempotente. | El operador proporciona evidencia fechada, identifica el resultado y confirma la entrega. | El negocio accede, completa el caso principal y encuentra el resultado en sus métricas. |

El alta invitada se recupera en el navegador que conserva su cookie. El acceso entre dispositivos requiere vincularla a una identidad autenticada. La pantalla informa un fallo de persistencia. Si la base está fuera de servicio, conservar la pantalla hasta poder guardar antes de cerrar la pestaña.

## Preparar un entorno de pruebas

1. Usar una base separada, una cuenta de Auth de prueba y datos sintéticos. Revisar las migraciones existentes de `docs/project/migrations/` y aplicar la adición de `supabase/migrations/` bajo control de cambios. Verificar privilegios reales de los roles. Los registros históricos conservan su identidad y requieren conciliación antes de atribuirlos a un titular.
2. Configurar en el servidor `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `ONBOARDING_PUBLIC_ORIGIN` con el origen exacto del Wizard. La clave service role se usa únicamente en servidor. La interfaz de equipo requiere `TEAM_ADMIN_PASSCODE`. Usar un valor aleatorio y limitar intentos de acceso en la infraestructura.
3. Asignar el UUID del operador en `ONBOARDING_OPERATOR_USER_IDS` y crear su asignación específica BA/usuario en `onboarding_reviewers`. La revisión está en `/team/onboarding/<UUID-de-la-BA>`. Usar identificadores de evidencia internos y excluir secretos, documentos y datos de prospectos.
4. Mantener apagados `GHL_PROVISIONING_ENABLED`, `GHL_OAUTH_ENABLED`, `ONBOARDING_FORM_SYNC_ENABLED`, `ONBOARDING_TRIAL_ENABLED` y `AI_PAID_EXECUTION_ENABLED` durante el ensayo local. Para cada operación externa se requiere autorización para la cuenta, el entorno y el alcance correspondientes.
5. Ejecutar `npm ci`, `npm test`, `npm run lint` y `npm run build` desde Growth. La prueba `npm run test:browser` usa una instancia **local** de la aplicación con la migración y una base desechable accesible por PostgREST. Configurar `WIZARD_TEST_URL` al origen local. Usar Chromium instalado por Playwright o `WIZARD_CHROMIUM_PATH`. La suite rechaza dominios externos.

## Preparar una plantilla y su conexión

Para vincular una LAB existente, incluir únicamente su ID en `GHL_LAB_LOCATION_IDS` y usar el panel del verificador asignado. Deben coincidir agencia, nombre y correo del titular. Para crear una location distinta se requieren `GHL_LOCATION_CREATION_ENABLED=true` y el ID exacto del registro aprobado en `GHL_APPROVED_CREATION_SESSION_IDS`. Revisar costo, titular y duplicados antes de habilitar estas variables.

El catálogo `GHL_SNAPSHOT_RELEASES` es JSON mantenido por el operador. Cada entrada requiere un ID real de snapshot, una versión inmutable, el nombre del pipeline, nombres de formularios, workflows y calendarios y revisión documentada de que aplica sin envíos ni acciones de pago. Ejemplo estructural con identificadores ficticios:

```json
{
  "core-b2b": {
    "snapshotId": "ID_VERIFICADO_EN_LAB",
    "version": "lab-release-1",
    "reviewReference": "FOLIO_DEL_MANIFIESTO_REVISADO",
    "validated": true,
    "noExternalActions": true,
    "pipelineName": "Ventas consultivas",
    "workflowNames": ["Asignación interna"],
    "formNames": ["Solicitud comercial"],
    "calendarNames": []
  }
}
```

Las claves base son `core-b2b`, `core-consumer` y `core-appointments`. Retención usa `retention-<arquetipo>` y requiere su prueba propia. Crear un catálogo con validaciones reales antes de habilitar escritura. Revisar que el snapshot contenga las etapas declaradas en el plan y estos campos personalizados de tipo **Custom Value**, nombrados exactamente como las claves: `10x_business_name`, `10x_offer`, `10x_ideal_customer`, `10x_primary_goal`, `10x_brand_voice` y `10x_preserve`. Dejar los valores de la plantilla vacíos. Un valor preexistente diferente requiere revisión. Validar en LAB las acciones y las condiciones de cada flujo, las reglas condicionales del formulario y los widgets de medición.

Para la provisión se requiere una agencia elegible, `GHL_COMPANY_ID` y un token OAuth de agencia vigente en `GHL_AGENCY_ACCESS_TOKEN`. La creación y búsqueda requieren acceso a locations. El intercambio de token requiere `oauth.write`. El token de location necesita leer los activos del plan y leer/escribir los Custom Values. Verificar la instalación por location y los scopes exactos en la versión vigente de la app. La sincronización del formulario requiere además escritura de contactos. Administrar la vigencia del token de agencia desde el gestor de secretos del entorno.

La conexión opcional del titular usa `GHL_CLIENT_ID`, `GHL_CLIENT_SECRET`, `GHL_REDIRECT_URI` con el callback exacto y `ONBOARDING_ENCRYPTION_KEY` de 32 bytes en base64. El alcance de ese OAuth es lectura de la location. Las autorizaciones de Meta, correo y demás proveedores se realizan por separado. Conservar la clave en un almacén de secretos y planear rotación con recifrado. Inventariar y revocar los tokens históricos fuera de uso antes de habilitar conexiones multicliente.

## Recuperar un intento

| Estado | Qué hacer |
|---|---|
| Falta plantilla, permiso o contrato | Completar el requisito indicado. Volver a la misma BA. |
| Conflicto de versión | Leer el registro de nuevo. Revisar el cambio de la otra ventana antes de guardar. |
| Resultado desconocido al crear | Revisar el listado de la agencia, el intento y su hora. Comprobar nombre, correo, agencia, titular y el identificador de la cuenta. Registrar la referencia de la reconciliación. Nunca repetir a ciegas el POST de creación. |
| Location guardada y activos pendientes | Revisar que terminó la importación y que coinciden nombres y versión. Reintentar sobre el ID persistido. |
| Autorización vencida o respuesta de refresh incierta | Reautorizar con el titular y verificar la misma location. Un webhook firmado sólo registra el evento. |
| Captura en revisión | Buscar por email en la location asignada. Verificar el ID del contacto, la oportunidad y el estado de la cola. El operador debe conciliar cualquier envío incierto antes de reencolar. |

## Aceptación de la entrega

Registrar contrato o autorización de piloto, acceso del titular, idioma/país/moneda/zona, activos del snapshot, controles de gasto, continuidad, aislamiento, caso de uso principal, URL pública con SSL, observabilidad, ayuda y política de trial. Cada módulo indispensable añade su propia prueba. Los opcionales pospuestos quedan visibles. Para aprobar se necesitan referencias reales del negocio, de la versión del plan y de la location correspondiente. Una prueba fallida, anterior, simulada o perteneciente a otra cuenta deja pendiente la entrega.

Con `ONBOARDING_TRIAL_ENABLED` aprobado, confirmar la entrega registra una sola ventana interna de 14 días por BA. El PSP y los cobros externos requieren integración y reconciliación comercial por separado. Las reglas y precios de los planes se administran fuera de este flujo.

## Preparación específica de 10xTeam Dev

1. Registrar Dev como negocio independiente del de Growth. Capturar Llave en Mano y 10x Dev Squad, comprador objetivo, fuentes actuales, restricciones y su formulario existente. Usar una identidad de titular con acceso sólo a los negocios aprobados.
2. Confirmar una release B2B sin datos de muestra, envíos, WhatsApp, IA facturable ni workflows premium. Registrar en LAB cuál workflow crea la oportunidad y la tarea, qué filtro de origen utiliza y cómo evita reentrada. Un nombre de workflow verificado por la API sólo prueba que está presente.
3. El sitio Dev ya envía a `/api/contact` de Growth. El backend guarda el contacto antes de encolarlo. Los servicios `mvp` y `celula` se mapean a Llave en Mano y 10x Dev Squad. Mantener intacto el formulario. La ruta de ingreso se determina en servidor y requiere una asignación explícita a Dev. No importar contactos anteriores por defecto.
4. Después de autorizar el piloto, el titular elige conectar formularios y autoriza su preparación. El operador registra en `onboarding_form_routes` el origen `dev_contact`, la BA, la location verificada, el campo de servicio y la evidencia de aprobación. Confirmar el criterio de coincidencia por email y revisar proveedores/contactos previos. Habilitar solamente esa ruta y el worker en la prueba autorizada. Usar un secreto de al menos 32 caracteres en `ONBOARDING_FORM_WORKER_SECRET`. Invocar `POST /api/onboarding/forms/sync` con bearer de servidor. Cada invocación procesa hasta una entrada. El programador y el monitoreo del worker se configuran en el entorno que opere el piloto.
5. Probar con dos envíos sintéticos del mismo correo. Esperar un solo contacto en Dev, una oportunidad, la tarea y la métrica correspondiente. Comprobar el otro servicio con otro correo sintético y verificar ausencia de esos registros en Growth. El primer servicio se conserva en el envío CRM deduplicado por email. Las consultas posteriores siguen disponibles en la tabla de capturas. Revisar cómo se atenderán cambios de interés.
6. Para redes corporativas compartidas, inventariar Página, Instagram, titular, permisos y destinos existentes. Decidir **por función** quién publica, qué cuenta recibe DMs y adónde van los formularios de anuncios. HighLevel documenta que reautorizar Meta y omitir páginas ya seleccionadas puede revocar acceso en otra location. La capacidad de conectar varias páginas a una location no acredita una distribución segura del mismo inbox entre dos. Obtener confirmación por función antes de conectar. Para captar por formulario propio, se pueden posponer las redes.
7. Operador y titular completan la prueba de acceso aislado, el flujo público y la conciliación de métricas. Conservar IDs sintéticos, fecha y resultado en el registro privado. La primera revisión de adopción puede usar señales de captación y seguimiento de esa BA con autorización de lectura.

Fuentes técnicas del proveedor: [creación de location con snapshot](https://marketplace.gohighlevel.com/docs/ghl/locations/create-location/index.html), [intercambio de token de location](https://marketplace.gohighlevel.com/docs/ghl/oauth/get-location-access-token/index.html), [actualización de Custom Values](https://marketplace.gohighlevel.com/docs/ghl/locations/update-custom-value/index.html), [deduplicación de contactos](https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/index.html), [firma de webhooks](https://marketplace.gohighlevel.com/docs/webhook/WebhookIntegrationGuide/index.html), [permisos de Meta entre locations](https://help.gohighlevel.com/support/solutions/articles/155000008432-why-you-should-grant-access-to-all-pages-when-connecting-a-social-account).
