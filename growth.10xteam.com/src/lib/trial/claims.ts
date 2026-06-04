export interface ConservativeClaim {
  id: string;
  metric: string;
  range: string;
  detail: string;
}

export interface ValuePillar {
  id: string;
  title: string;
  description: string;
}

export const PRE_ICP_VALUE_PILLARS: ValuePillar[] = [
  {
    id: "instant-kit",
    title: "De idea a materiales en minutos",
    description:
      "Con pocas lineas sobre tu negocio, el sistema construye un kit publicitario inicial listo para ejecutar.",
  },
  {
    id: "monthly-updates",
    title: "Actualizacion mensual automatica",
    description:
      "Cada mes se generan nuevos materiales ajustados al desempeno comercial de tus canales.",
  },
  {
    id: "sales-focus",
    title: "Estrategia orientada a ventas reales",
    description:
      "La salida prioriza oportunidades de cierre, no solo contenido bonito o teorico.",
  },
];

export const CONSERVATIVE_IMPACT_CLAIMS: ConservativeClaim[] = [
  {
    id: "sales-lift",
    metric: "Mejora en ventas",
    range: "10% a 25%",
    detail: "En negocios comparables que ejecutan materiales con disciplina durante el periodo inicial.",
  },
  {
    id: "new-clients",
    metric: "Incremento de clientes",
    range: "8% a 20%",
    detail: "Cuando existe seguimiento comercial consistente y respuesta rapida al lead.",
  },
  {
    id: "cost-reduction",
    metric: "Reduccion de costo operativo",
    range: "12% a 30%",
    detail: "Por consolidar procesos y disminuir retrabajo entre herramientas dispersas.",
  },
  {
    id: "time-recovery",
    metric: "Horas recuperadas por semana",
    range: "4 a 10 horas",
    detail: "Al automatizar piezas repetitivas de redaccion, seguimiento y activacion por canal.",
  },
];

export const CLAIMS_DISCLAIMER =
  "Los rangos son conservadores y se ajustan por industria, punto de partida y calidad de ejecucion. No representan una garantia universal.";
