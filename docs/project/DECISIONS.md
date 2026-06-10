# DECISIONS — Registro de Decisiones
Documenta el POR QUE de cada decision importante.
Consultar antes de cambiar algo que ya se decidio.

## DECISIONES ACTIVAS

Formato: Fecha / Decision / Opciones evaluadas / Decision final / Por que

### 2026-04-17 / El sistema se trata como activo estrategico reutilizable
- Opciones evaluadas:
	- Opcion A: usar este repo solo como plantilla estatica para copiar y pegar.
	- Opcion B: tratar este repo como sistema operativo vivo que acumula aprendizajes de cada proyecto.
- Decision final: Opcion B.
- Por que:
	- Reduce tiempo de arranque en proyectos nuevos.
	- Disminuye riesgo de repetir errores ya resueltos.
	- Estandariza calidad de ejecucion del equipo IA en distintos clientes.
	- Convierte experiencia operativa en ventaja competitiva acumulable.

### 2026-04-17 / Expansion de roles para ciclo completo de ejecucion
- Opciones evaluadas:
	- Opcion A: mantener solo roles actuales y cubrir vacios de forma ad hoc.
	- Opcion B: completar estructura con roles clave de entrega, ventas, IA, finanzas, operaciones, comunidad y contratacion.
- Decision final: Opcion B.
- Por que:
	- Cubre vacios operativos criticos para construir y entregar proyectos profesionales.
	- Mejora coordinacion entre estrategia, ejecucion y resultados de negocio.
	- Aumenta capacidad de respuesta a distintos tipos de proyecto y etapa.

### 2026-05-25 / Separacion de unidades de negocio por subdominio en un solo repo
- Opciones evaluadas:
	- Opcion A: mantener una sola web/oferta mezclando desarrollo y growth.
	- Opcion B: separar en dos proyectos con despliegue y memoria independientes (`dev.10xteam.com` y `growth.10xteam.com`) compartiendo solo activos comunes.
- Decision final: Opcion B.
- Por que:
	- Reduce confusion comercial y mejora claridad de propuesta por linea de negocio.
	- Permite roadmap y velocidad de ejecucion independientes.
	- Disminuye riesgo tecnico al aislar builds, variables y despliegues.
	- Mantiene costos operativos bajos al seguir en un solo repositorio.

### 2026-05-26 / Rol Asistente Operativo y backlog estrategico por unidad
- Opciones evaluadas:
	- Opcion A: capturar ideas/pedidos del CEO de forma dispersa en chats y tareas sueltas.
	- Opcion B: crear rol dedicado para captura operativa y centralizar pendientes estrategicos en memoria del proyecto correspondiente.
- Decision final: Opcion B.
- Por que:
	- Evita perdida de contexto entre sesiones y acelera ejecucion semanal.
	- Reduce riesgo de mezclar aprendizajes generales del sistema con pendientes tacticos de una sola unidad.
	- Facilita seguimiento por prioridad, owner y estado para pasar de idea a entrega.

### 2026-06-10 / En growth, el wizard canonico debe vivir en componentes React tipados y no en injection HTML ad hoc
- Opciones evaluadas:
	- Opcion A: seguir resolviendo pantallas del wizard con HTML incrustado o logica suelta de parcheo visual.
	- Opcion B: consolidar el flujo principal en componentes React/TypeScript con contratos claros de estado y validacion.
- Decision final: Opcion B.
- Por que:
	- Reduce riesgo de romper el flujo comercial al tocar copy, rutas o validaciones.
	- Hace mas barato iterar mensajes, pasos y ejemplos por industria sin reescribir implementaciones fragiles.
	- Mejora trazabilidad tecnica y acelera QA antes de commit/push.
	- Deja una base mas segura para conectar automatizaciones, scoring y materiales en siguientes fases.

## DECISIONES CAMBIADAS
[Si alguna se revirtio, documentar con la razon]