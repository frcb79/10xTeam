# 📖 CEO PROTOCOLO — La Biblia del CEO
> Tu guía operativa maestra. Qué hacer exactamente en cada situación importante: inicio de proyecto, sumar un dev, entrega al cliente, cierre de sesión, actualización de aprendizajes y crisis.

---

## 🚀 PROTOCOLO 1 — INICIO DE PROYECTO NUEVO

### Antes de arrancar
- [ ] Leer `docs/intake/DISCOVERY_PROTOCOL.md` completo
- [ ] Activar al Orquestrador: "Nuevo proyecto: [nombre]. Corre el Discovery Protocol."
- [ ] Definir stack con `docs/intake/TECH_STACK_ADVISOR.md`
- [ ] Crear `docs/project/PROJECT_BRAIN.md` para este proyecto
- [ ] Documentar primera decisión arquitectónica en `docs/project/DECISIONS.md`

### Al arrancar el desarrollo
- [ ] Activar rol 04_ARQUITECTO para diseño técnico inicial
- [ ] Activar rol 02_PRODUCT_MANAGER para definir MVP y roadmap
- [ ] Activar rol 03_UX_DISENADOR si hay interfaz de usuario
- [ ] Crear repositorio en GitHub con la estructura estándar
- [ ] Configurar entorno base: Supabase + Vercel + dominio

### Resultado esperado al final de la semana 1
PROJECT_BRAIN.md con: objetivo del proyecto, stack seleccionado, MVP definido, fase actual, próximos 3 pasos concretos.

---

## 👨‍💻 PROTOCOLO 2 — ONBOARDING DE UN DEV (humano o nueva IA)

### Primer contacto — compartir estos 4 documentos
1. `docs/team/CEO_OS.md` — cómo soy, cómo trabajo, cómo comunicarme
2. `docs/project/PROJECT_BRAIN.md` — contexto completo del proyecto activo
3. `docs/autonomy/AI_PERMISSIONS.md` — qué puede hacer autónomamente vs qué necesita aprobación
4. `docs/team/TEAM_LEARNINGS.md` — errores ya aprendidos, no repetirlos

**Instrucción inicial:** "Lee estos 4 documentos. Pregunta lo que no entiendas antes de tocar código o tomar decisiones."

### Primera semana de trabajo
- [ ] Asignarle una tarea pequeña y bien definida para calibrar su estilo
- [ ] Revisar su primer output antes de que toque algo crítico
- [ ] Darle feedback explícito: qué hizo bien, qué ajustar
- [ ] Documentar cualquier ajuste de estilo en TEAM_LEARNINGS.md

### Red flags que requieren corrección inmediata
- Empieza a hacer supuestos importantes sin preguntar
- Propone cambios de arquitectura sin consultar al Arquitecto (rol 04)
- No actualiza documentación después de hacer cambios
- Ignora las reglas de AI_PERMISSIONS.md

---

## 📦 PROTOCOLO 3 — ENTREGA AL CLIENTE

### 48 horas antes
- [ ] Correr checklist completo de `docs/project/PROMOTE_TO_MASTER.md`
- [ ] QA end-to-end: activar rol 09_QA_TESTING
- [ ] Revisión de seguridad: activar rol 07_SEGURIDAD
- [ ] Confirmar que no hay API keys expuestas en el repositorio
- [ ] Demo funcionando en producción (no en local)
- [ ] Backup de base de datos si hay datos existentes

### Preparación de la presentación
- [ ] Activar rol 10_DATA_ANALYTICS: métricas clave para mostrar
- [ ] Activar rol 03_UX_DISENADOR: flujos que se van a demostrar
- [ ] Preparar respuestas para las 3 objeciones más probables
- [ ] Tener el "Plan B" listo si algo falla en el demo

### Post-entrega
- [ ] Actualizar CHANGELOG.md con lo que se entregó y la versión
- [ ] Documentar feedback del cliente en PROJECT_BRAIN.md
- [ ] Registrar cualquier bug encontrado durante la demo en ERROR_LOG.md
- [ ] Definir próximos pasos con el cliente en DECISIONS.md

---

## 🔒 PROTOCOLO 4 — CIERRE DE SESIÓN DE TRABAJO

> Ejecutar SIEMPRE al terminar una sesión con la IA. Sin excepciones.

**Comando al Orquestrador:** "Cerramos sesión."

El Orquestrador debe verificar y actualizar:
- [ ] PROJECT_BRAIN.md — qué se hizo, estado actual, próximo paso específico
- [ ] CHANGELOG.md — cambios del día
- [ ] ERROR_LOG.md — problemas encontrados (si los hubo)
- [ ] DECISIONS.md — decisiones importantes tomadas (si las hubo)
- [ ] TEAM_LEARNINGS.md — aprendizajes nuevos (si los hubo)

**Plantilla de cierre rápido:**
```
SESIÓN: [fecha]
PROYECTO: [nombre]
✅ COMPLETADO: [qué se hizo]
⏳ PENDIENTE: [qué quedó y por qué]
🎯 PRÓXIMO PASO: [acción específica, no vaga]
📝 NOTAS: [contexto para siguiente sesión]
```

---

## 📚 PROTOCOLO 5 — ACTUALIZACIÓN DE APRENDIZAJES

> Ejecutar cuando algo falla, cuando se descubre algo valioso, o mensualmente.

Formato de entrada en TEAM_LEARNINGS.md:
```
## [Fecha] — [Título del aprendizaje]
**Contexto:** qué estábamos haciendo
**Qué pasó:** el problema o descubrimiento
**Aprendizaje:** qué hacer diferente
**Aplica a:** [roles o situaciones donde aplicar este aprendizaje]
```

Además:
- Si es un error técnico → también documentar en ERROR_LOG.md
- Si cambió una decisión de arquitectura → documentar en DECISIONS.md
- Si el aprendizaje aplica a un rol → actualizar ese archivo de rol

---

## ⚡ PROTOCOLO 6 — CRISIS / ALGO ESTÁ ROTO EN PRODUCCIÓN

> Para cuando algo en producción falla o hay una emergencia real.

**Paso 1:** PARA. No hagas más cambios hasta entender qué pasó.
**Paso 2:** Activa rol 07_SEGURIDAD + 06_DEVOPS simultáneamente.
**Paso 3:** Pregunta: "¿Qué cambió en las últimas 24 horas?" Revisa CHANGELOG.md.
**Paso 4:** Verifica primero las variables de entorno — resuelven el 80% de los crashes post-deploy.
**Paso 5:** Si no se resuelve en 15 minutos → rollback en Vercel.
**Paso 6:** Documenta causa, síntoma y solución en ERROR_LOG.md.
**Paso 7:** Post-mortem: ¿cómo evitamos que pase de nuevo?

---

## 🧭 BRÚJULA DE DECISIONES RÁPIDAS

Cuando no sabes qué hacer primero:
```
1. ¿Algo está roto en producción?          → Arréglalo AHORA (Protocolo 6)
2. ¿Hay un cliente esperando algo?         → Entrégalo (Protocolo 3)
3. ¿Hay un bloqueador en el equipo?        → Activa 18_COO_OPERACIONES
4. ¿Hay deuda técnica crítica acumulada?   → Págala antes del próximo feature
5. ¿Todo lo anterior está OK?              → Construye el siguiente feature
```