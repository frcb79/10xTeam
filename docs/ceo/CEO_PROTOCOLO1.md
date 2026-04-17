# 📖 BIBLIA DEL SISTEMA — AI Team OS
> Este documento explica el sistema completo: por qué existe, cómo funciona,
> cómo mejorarlo, y la filosofía detrás de cada decisión.
> Es el documento al que regresas cuando quieres entender, ajustar o evolucionar el sistema.
> Versión: 1.0 | Fecha de creación: 2026-04-16 | Autor: frcb79

---

## POR QUÉ EXISTE ESTE SISTEMA

### El problema que resuelve

Cuando trabajas con IA en proyectos de desarrollo, el mayor desperdicio
no es el tiempo de código — es el tiempo perdido explicando contexto.

Sin este sistema:
- Cada sesión empieza de cero explicando quién eres y qué quieres
- La IA comete los mismos errores una y otra vez
- Cada proyecto nuevo ignora todo lo aprendido en proyectos anteriores
- El CEO (que no es técnico) tiene que actuar como técnico para coordinar
- Nadie le avisa al CEO de los riesgos hasta que ya pasaron

Con este sistema:
- La IA sabe exactamente cómo trabajas desde el primer mensaje
- Los errores se documentan y no se repiten
- Cada proyecto nuevo empieza con la sabiduría acumulada de todos los anteriores
- El CEO dirige el negocio — la IA maneja los detalles técnicos
- Los riesgos se identifican proactivamente, no reactivamente

### La filosofía central

> **No estamos construyendo una herramienta. Estamos construyendo una firma.**

Una herramienta hace lo que le dices.
Una firma aprende, mejora, y eventualmente anticipa lo que necesitas.

McKinsey no empieza de cero en cada cliente.
Llevan décadas de metodología, frameworks y aprendizajes institucionalizados.
Eso es exactamente lo que este sistema construye — pero con IA.

---

## ARQUITECTURA DEL SISTEMA

### Los 3 niveles

```
NIVEL 1 — EL MASTER (frcb79/ai-team-os)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La firma. El conocimiento permanente.
Lo que el equipo sabe independientemente del proyecto.

Contiene:
• Cómo trabaja el CEO (CEO_OS.md)
• Los roles del equipo y cómo piensan
• Los protocolos probados
• La sabiduría acumulada de todos los proyectos

Evoluciona: con cada sync aprobado por el CEO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NIVEL 2 — EL PROYECTO (frcb79/nombre-proyecto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El cliente. El conocimiento del encargo específico.
Lo que el equipo sabe sobre este proyecto en particular.

Contiene:
• Estado actual (PROJECT_BRAIN)
• Errores y soluciones de este proyecto (ERROR_LOG)
• Decisiones tomadas para este cliente (DECISIONS)
• Aprendizajes listos para el master (PROMOTE_TO_MASTER)
• El código del producto

Evoluciona: con cada sesión de trabajo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NIVEL 3 — EL ECOSISTEMA (múltiples proyectos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La red. Cómo los proyectos se retroalimentan entre sí
a través del master.

Flujo:
Master → Proyecto (hereda conocimiento)
Proyecto → Master (aporta aprendizajes)
Master → Siguiente Proyecto (hereda todo lo anterior)

Resultado: sistema que mejora con el tiempo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Los 2 tipos de archivos

```
TIPO A — "De la Firma"              TIPO B — "Del Cliente"
─────────────────────────────────   ─────────────────────────────────
Viven en el MASTER                  Viven en el proyecto
Se copian al iniciar proyecto       Se crean durante el proyecto
Se actualizan via sync              No suben al master (salvo excepciones)
─────────────────────────────────   ─────────────────────────────────
CEO_OS.md                           PROJECT_BRAIN.md
TEAM_LEARNINGS.md                   ERROR_LOG.md
Todos los roles (00-12)             DECISIONS.md
DISCOVERY_PROTOCOL.md               CHANGELOG.md
TECH_STACK_ADVISOR.md               PROMOTE_TO_MASTER.md
AI_PERMISSIONS.md                   El código
SESSION_CLOSE_PROTOCOL.md           Todo lo específico del cliente
```

### Los 3 niveles de memoria

```
MEMORIA INMEDIATA (sesión actual)
→ Lo que el Orquestrador lee al inicio de cada sesión
→ PROJECT_BRAIN + CEO_OS + TEAM_LEARNINGS

MEMORIA DEL PROYECTO (duración del proyecto)
→ ERROR_LOG, DECISIONS, CHANGELOG del proyecto
→ Queda archivada para consultas futuras del mismo cliente

MEMORIA PERMANENTE (toda la vida de la firma)
→ CEO_OS, TEAM_LEARNINGS, roles mejorados en el MASTER
→ Nunca se pierde, solo crece
```

---

## LOS ROLES DEL EQUIPO

### Filosofía de los roles

Cada rol no es una "personalidad diferente de la IA" —
es una **perspectiva especializada** que se activa para analizar
un problema desde ese ángulo.

El Orquestrador coordina todos los roles y decide cuáles activar
según la naturaleza de la tarea.

### Los roles actuales (v1.0)

| # | Rol | Perspectiva |
|---|-----|-------------|
| 00 | Orquestrador | Coordinación y comunicación con el CEO |
| 01 | CEO Protocolo | Manual de operación del CEO (cómo trabaja) |
| 02 | Estratega de Negocio | Viabilidad, modelo, competencia, ROI |
| 03 | Product Manager | Qué construir, en qué orden, métricas |
| 04 | UX / Diseñador | Flujos, componentes, experiencia |
| 05 | Arquitecto | Stack, base de datos, estructura, escala |
| 06 | Dev Full-Stack | Código, implementación, debugging |
| 07 | DevOps | Deploy, CI/CD, infraestructura |
| 08 | Seguridad | Autenticación, datos, vulnerabilidades |
| 09 | Legal / Compliance | LFPDPPP, términos, contratos |
| 10 | QA / Testing | Pruebas, calidad, bugs |
| 11 | Data / Analytics | Métricas, dashboards, KPIs |
| 12 | Growth / Marketing | Adquisición, conversión, retención |
| 99 | Template | Para agregar nuevos roles |

### Cuándo agregar un nuevo rol

Un rol nuevo se necesita cuando:
1. Una tarea requiere expertise que ningún rol actual cubre bien
2. El proyecto entra en un territorio nuevo (fintech, salud, hardware, etc.)
3. El CEO lo solicita

El Orquestrador lo propone. El CEO aprueba. Se crea con el template 99.

---

## EL SISTEMA DE APRENDIZAJE

### Cómo aprende el sistema

```
SESIÓN DE TRABAJO
      ↓
¿Pasó algo notable?
      ↓
     SÍ
      ↓
¿Aplica solo a este proyecto    ¿Aplica a cualquier proyecto?
o a este cliente específico?
      ↓                                    ↓
[PROYECTO]                            [UNIVERSAL]
Se queda en el proyecto               Va a PROMOTE_TO_MASTER.md
                                           ↓
                                   CEO aprueba en sync
                                           ↓
                                   MASTER se actualiza
                                           ↓
                                   Próximo proyecto lo hereda
```

### Los 3 tipos de aprendizaje más valiosos

**1. Aprendizajes sobre el CEO** (los más valiosos)
- Cómo comunica, cómo decide, qué le genera fricción
- Van a CEO_OS.md en el MASTER de inmediato
- Aplican a todos los proyectos presentes y futuros

**2. Aprendizajes de proceso**
- Mejoras al discovery, al cierre, a los protocolos
- Van a los archivos de protocolo correspondientes en el MASTER
- Hacen al equipo más eficiente en cada proyecto

**3. Aprendizajes técnicos**
- Tecnologías probadas, patrones que funcionan, errores comunes
- Van a TECH_STACK_ADVISOR.md o al skill correspondiente
- Evitan que el equipo reinvente la rueda en proyectos futuros

---

## EL PROTOCOLO DE SYNC — CÓMO FUNCIONA

### El ciclo completo

```
TRIGGER DE SYNC:
• 14 días desde último sync, O
• 5+ aprendizajes pendientes, O
• Cierre de proyecto, O
• CEO lo pide manualmente

     ↓

PREPARACIÓN (Orquestrador):
Lee PROMOTE_TO_MASTER.md del/los proyectos activos
Clasifica por destino en el master
Presenta lista al CEO

     ↓

APROBACIÓN (CEO):
"aprueba todo" / selecciona cuáles / modifica texto

     ↓

EJECUCIÓN (Orquestrador):
Actualiza archivos en frcb79/ai-team-os
Bump de versión en MASTER_CHANGELOG.md
Marca como sincronizado en el proyecto

     ↓

NOTIFICACIÓN:
"✅ Master actualizado a v[X.X]. 
 [N] aprendizajes incorporados.
 Todos los proyectos activos los tendrán en su próxima sesión."
```

---

## CÓMO MEJORAR ESTE SISTEMA

### Cuándo revisar la Biblia del Sistema

- Al completar los primeros 3 proyectos con el sistema
- Cuando el CEO siente que algo no está funcionando bien
- Cuando aparece un tipo de proyecto muy diferente a los anteriores
- Una vez al año como revisión general

### Cómo proponer mejoras

Cualquier rol puede proponer mejoras al sistema diciendo:
> "🔧 MEJORA AL SISTEMA: [descripción de la mejora]
>  Impacto estimado: [qué mejoraría]
>  Archivos a modificar: [cuáles]
>  ¿Lo incluimos en el próximo sync?"

### Qué NO cambiar sin pensarlo mucho

Estos elementos son el núcleo — cambiarlos tiene impacto en todos los proyectos:
- La estructura de CEO_OS.md (el formato en que se describe al CEO)
- El protocolo de discovery (preguntas fundamentales)
- Los niveles de autonomía (especialmente el Nivel 4)
- La distinción TIPO A / TIPO B de archivos

### Historial de evoluciones del sistema

Ver `MASTER_CHANGELOG.md` para el registro completo de versiones y qué cambió.

---

## GLOSARIO

| Término | Significado |
|---------|-------------|
| **MASTER** | El repo `frcb79/ai-team-os` — la firma y su conocimiento |
| **Proyecto** | Repo de un cliente o producto específico |
| **Sync** | Proceso de promover aprendizajes del proyecto al master |
| **TIPO A** | Archivos de la firma — se copian a cada proyecto |
| **TIPO B** | Archivos del cliente — únicos del proyecto |
| **[UNIVERSAL]** | Etiqueta de aprendizaje que aplica a todos los proyectos |
| **[PROYECTO]** | Etiqueta de aprendizaje específico de ese cliente |
| **Orquestrador** | El rol principal de la IA — coordina el equipo y habla con el CEO |
| **Discovery** | Primera sesión de un proyecto — hacer las preguntas correctas |
| **CEO_OS** | Manual de operación del CEO — cómo trabaja, piensa y comunica |
| **PROJECT_BRAIN** | Estado vivo del proyecto — se actualiza cada sesión |
| **PROMOTE_TO_MASTER** | Lista de aprendizajes del proyecto listos para subir al master |

---

## MÉTRICAS DE SALUD DEL SISTEMA

El sistema está funcionando bien cuando:

| Indicador | Señal positiva |
|-----------|---------------|
| Tiempo de onboarding a nuevo proyecto | < 10 minutos |
| Preguntas repetidas al CEO | Disminuyen con el tiempo |
| Errores que se repiten entre proyectos | Cercano a cero |
| Syncs realizados vs recomendados | > 80% |
| Roles activados por el Orquestrador sin que el CEO los pida | Aumenta con el tiempo |
| CEO tiene que explicar algo que ya explicó antes | Debe ser raro |

---

## CRÉDITOS Y CONTEXTO

**Creado por:** frcb79 + GitHub Copilot
**Fecha de creación:** 2026-04-16
**Inspiración:** Metodología de firmas de consultoría élite aplicada a equipos de IA
**Principio rector:** La IA no es una herramienta — es un equipo que aprende
**Mercado:** México (LATAM como expansión futura)

---

*Este documento es un organismo vivo. Cuando el sistema evolucione, este documento evoluciona con él.*
