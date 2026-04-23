# 10xTeam — Proceso de Discovery & Evaluación de Proyectos

Documento operativo interno. Define cómo evaluar, cotizar y estructurar cada proyecto que llegue a la agencia.

---

## 1. Cuestionario Inicial de Discovery (Para el Cliente)

Este cuestionario se envía o aplica en la primera llamada de 15 min. Objetivo: entender el alcance antes de cotizar.

### Información General
- ¿Cuál es el nombre de tu empresa o proyecto?
- ¿Qué problema resuelve tu producto?
- ¿Quién es tu usuario/cliente final?
- ¿Tienes competidores directos? ¿Cuáles?

### Estado Técnico Actual
- ¿Tienes algo construido ya? (web, app, prototipo, nada)
- ¿Tienes dominio web?
- ¿Tienes branding (logo, colores, tipografía)?
- ¿Tienes diseños o wireframes de referencia?
- ¿Tienes servidor o hosting contratado?

### Alcance del Proyecto
- ¿Qué tipo de producto necesitas? (Web App, App Móvil, Sistema Interno, Landing Page, E-Commerce, Otro)
- Describe las 3 funcionalidades más importantes (Must-Haves).
- ¿Hay funcionalidades que te gustaría pero no son urgentes? (Nice-to-Haves)
- ¿Necesitas integraciones con otros sistemas? (Pagos, WhatsApp, CRM, etc.)
- ¿Cuántos tipos de usuario tendrá? (Admin, Cliente, Vendedor, etc.)

### Tiempos y Presupuesto
- ¿Tienes una fecha límite de lanzamiento?
- ¿Cuál es tu presupuesto estimado o rango?
- ¿Prefieres un proyecto llave en mano o un equipo continuo?

---

## 2. Modelo de Evaluación Interna (Para Nosotros)

Después del Discovery, el equipo 10xTeam evalúa internamente:

### A. Clasificación del Proyecto
| Tamaño | Descripción | Duración Estimada | Rango de Precio |
|:---|:---|:---|:---|
| **S (Small)** | Landing page, sitio informativo, MVP muy básico (1-3 vistas) | 2-3 semanas | $1,999 - $2,999 USD |
| **M (Medium)** | App web con auth, dashboard, CRUD, 1-2 integraciones | 4-6 semanas | $3,000 - $5,999 USD |
| **L (Large)** | Plataforma compleja, múltiples roles, pagos, API, admin panel | 8-12 semanas | $6,000 - $12,000 USD |
| **XL (Enterprise)** | Sistema multi-tenant, arquitectura de microservicios, IA | 12+ semanas | Cotización especial |

### B. Cálculo de Costo Interno
Para decidir si el proyecto es rentable (mínimo 70% de margen bruto):

```
Costo Interno = (Horas Fundador × $CostoHora) + (Horas Freelancer × $CostoHora) + Costo IA/Infra

Precio al Cliente = Costo Interno / (1 - 0.70)
→ Si Costo Interno = $600 → Precio mínimo = $600 / 0.30 = $2,000 USD
```

**Costos de referencia a considerar:**
- Hora del fundador: Definir tarifa interna (ej. $30-50 USD/hr).
- Hora de freelancer/apoyo: $15-30 USD/hr (según seniority).
- Suscripciones IA (APIs, Copilot, etc.): ~$100-300 USD/mes prorrateado.
- Infraestructura (hosting, dominio cliente): Variable, puede cobrarse aparte.

### C. Criterios para Cobrar Más del Precio Base
El proyecto excede el precio base ($1,999) cuando:
- Tiene más de 5 vistas/pantallas únicas.
- Requiere integraciones complejas (pasarelas de pago, APIs externas).
- Necesita roles y permisos múltiples (Admin, User, SuperAdmin).
- Incluye lógica de negocio compleja (workflows, automatizaciones).
- El cliente requiere un timeline agresivo (urgencia = sobrecargo de 20-30%).
- Se requiere diseño UI/UX desde cero (sin branding previo).

---

## 3. Estructura de Entregables por Etapas

Cada proyecto se divide en fases para dar visibilidad al cliente:

### Fase 1: Discovery & Diseño (Semana 1)
- Documento de alcance firmado (Scope).
- Wireframes / Mockups de las vistas principales.
- Definición técnica (stack, arquitectura, integraciones).
- **Entregable:** Documento de propuesta + diseños.

### Fase 2: Desarrollo Core (Semanas 2-4)
- Setup del proyecto y repositorio.
- Desarrollo de las funcionalidades Must-Have.
- **Entregable semanal:** Demo funcional con avance visible.

### Fase 3: Integración & QA (Semana 5)
- Integración de servicios externos (pagos, email, APIs).
- Testing funcional y corrección de bugs.
- **Entregable:** Versión beta testeada.

### Fase 4: Lanzamiento (Semana 6)
- Despliegue a producción.
- Configuración de dominio y SSL.
- Entrega de accesos y documentación básica.
- **Entregable:** Producto live + soporte post-lanzamiento (2 semanas).

---

## 4. Clientes Recurrentes (Retainer / Evolución Continua)

### Precio preferencial para clientes existentes
- Si un cliente de MVP regresa para mejoras: **descuento del 15-25%** sobre el precio de un proyecto nuevo.
- El plan de Evolución Continua ($899/mes) incluye un banco de horas estimado de ~20-30 hrs/mes.
- Si el cliente necesita más horas, se cotizan horas adicionales a tarifa preferencial ($40-60 USD/hr vs $80+ en el mercado).

### Modelo de Account Management
- Cada cuenta activa (Retainer o Célula) necesita un responsable asignado.
- Conforme crezcan las cuentas, se necesitará un **Account Manager** (puede ser un rol fraccionado al inicio) que revise semanalmente:
  - Status de cada cuenta.
  - Horas consumidas vs banco disponible.
  - Priorización de tareas (Must-Have vs Nice-to-Have).
  - Satisfacción del cliente.

---

## 5. Roles Necesarios (Roadmap de Equipo)

| Fase de Crecimiento | Roles |
|:---|:---|
| **Inicio (0-5 clientes)** | Fundador(es) hacen todo: ventas, discovery, dev, soporte |
| **Crecimiento (5-15 clientes)** | + 1 Dev Freelancer, + 1 Diseñador UI Freelancer |
| **Escala (15-30 clientes)** | + Account Manager, + QA part-time, + Dev adicional |
| **Agencia (30+)** | Estructura formal: Sales, PM, Devs, QA, Diseño, Ops |
