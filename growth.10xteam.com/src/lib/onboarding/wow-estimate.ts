// Explorador de escenarios para el diagnóstico comercial. No escribe datos,
// no consume IA, no estima utilidades ni garantiza resultados.
// Los porcentajes son hipótesis de simulación, no benchmarks de HighLevel.
export type WowCurrency = "MXN" | "USD";
export type WowIndustry = "consulting" | "professional" | "finance" | "commerce" | "appointments" | "other";
export type WowBottleneck = "demand" | "response" | "followup" | "manual" | "closing";
export type WowInputs = {
  industry: WowIndustry;
  bottleneck: WowBottleneck;
  currency: WowCurrency;
  monthlyLeads: number;
  minutesPerLead: number;
  conversionPercent: number | null;
  averageTicket: number | null;
  loadedHourlyCost: number | null;
  grossMarginPercent: number | null;
};

export const wowDefaults: WowInputs = {
  industry: "consulting",
  bottleneck: "followup",
  currency: "MXN",
  monthlyLeads: 100,
  minutesPerLead: 15,
  conversionPercent: null,
  averageTicket: null,
  loadedHourlyCost: null,
  grossMarginPercent: null,
};

export const wowScenarioAssumptions = {
  timeShare: { conservative: 0.2, base: 0.4, optimistic: 0.6 },
  conversionRelativeUplift: { conservative: 0.05, base: 0.1, optimistic: 0.15 },
} as const;

export type WowScenario = {
  hoursFreed: number;
  equivalentTimeValue: number;
  incrementalGrossSales: number;
  incrementalGrossProfit: number | null;
  incrementalDeals: number;
};
export type WowEstimate = {
  inputs: WowInputs;
  assumptions: { conversionPercent: number; averageTicket: number; loadedHourlyCost: number };
  inferred: Array<"conversionPercent" | "averageTicket" | "loadedHourlyCost">;
  currentMonthlyManualHours: number;
  baselineGrossSales: number;
  scenarios: Record<"conservative" | "base" | "optimistic", WowScenario>;
  recommendations: string[];
};

const assumedNumbers: Record<WowCurrency, { ticket: number; hourly: number }> = {
  MXN: { ticket: 15000, hourly: 200 },
  USD: { ticket: 750, hourly: 20 },
};
const recommendationByBottleneck: Record<WowBottleneck, string[]> = {
  demand: [
    "Identificar clientes ideales y probar una fuente de prospección con permiso y trazabilidad.",
    "Capturar el origen y distinguir prospectos calificados antes de automatizar mensajes.",
  ],
  response: [
    "Centralizar entradas y asignar un responsable y una tarea de respuesta.",
    "Medir minutos hasta primera respuesta; activar mensajes sólo al autorizar el canal.",
  ],
  followup: [
    "Crear etapas simples y una próxima tarea para cada oportunidad.",
    "Medir oportunidades sin seguimiento y causas de pérdida por etapa.",
  ],
  manual: [
    "Eliminar doble captura de contactos mediante formularios y deduplicación.",
    "Medir minutos manuales por lead antes y después de cada automatización.",
  ],
  closing: [
    "Registrar objeciones y razones de pérdida antes de automatizar propuestas.",
    "Revisar conversión real por etapa y por origen, no sólo volumen bruto.",
  ],
};
const verticalGuidance: Record<WowIndustry, string> = {
  consulting: "B2B consultivo: separar calificación, diagnóstico, propuesta y decisión.",
  professional: "Servicios profesionales: priorizar agenda, antecedentes y seguimiento.",
  finance: "Servicios financieros: validar consentimiento, origen y restricciones regulatorias antes de contactar.",
  commerce: "Comercio: distinguir nuevos compradores, abandonos y recompra.",
  appointments: "Negocios con citas: priorizar disponibilidad, confirmación y ausencias.",
  other: "Adaptar etapas y mensajes a la operación real del negocio.",
};

function assertRange(value: number, minimum: number, maximum: number, name: string) {
  if (!Number.isFinite(value) || value < minimum || value > maximum)
    throw new Error("Valor inválido: " + name);
}
function round1(n: number) { return Math.round(n * 10) / 10; }
function roundMoney(n: number) { return Math.round(n); }

/** Scenarios use relative conversion improvement, not percentage points.
 * Time value is NOT automatic payroll savings; revenue is gross, not profit. */
export function estimateWow(input: WowInputs): WowEstimate {
  assertRange(input.monthlyLeads, 0, 100000, "leads");
  assertRange(input.minutesPerLead, 0, 240, "minutos");
  if (input.conversionPercent !== null) assertRange(input.conversionPercent, 0, 100, "conversión");
  if (input.averageTicket !== null) assertRange(input.averageTicket, 0, 1e9, "ticket");
  if (input.loadedHourlyCost !== null) assertRange(input.loadedHourlyCost, 0, 1e7, "costo por hora");
  if (input.grossMarginPercent !== null) assertRange(input.grossMarginPercent, 0, 100, "margen bruto");
  if (!assumedNumbers[input.currency]) throw new Error("Moneda no soportada");
  if (!recommendationByBottleneck[input.bottleneck] || !verticalGuidance[input.industry])
    throw new Error("Perfil de negocio no soportado");

  const defaults = assumedNumbers[input.currency];
  const inferred: WowEstimate["inferred"] = [];
  if (input.conversionPercent === null) inferred.push("conversionPercent");
  if (input.averageTicket === null) inferred.push("averageTicket");
  if (input.loadedHourlyCost === null) inferred.push("loadedHourlyCost");

  const conversionPercent = input.conversionPercent ?? 5;
  const averageTicket = input.averageTicket ?? defaults.ticket;
  const loadedHourlyCost = input.loadedHourlyCost ?? defaults.hourly;
  const currentMonthlyManualHours = input.monthlyLeads * input.minutesPerLead / 60;
  const baseClosedDeals = input.monthlyLeads * conversionPercent / 100;
  const baselineGrossSales = baseClosedDeals * averageTicket;
  const scenarios = {} as WowEstimate["scenarios"];
  for (const key of ["conservative", "base", "optimistic"] as const) {
    const hoursFreed = currentMonthlyManualHours * wowScenarioAssumptions.timeShare[key];
    const incrementalDeals = baseClosedDeals * wowScenarioAssumptions.conversionRelativeUplift[key];
    scenarios[key] = {
      hoursFreed: round1(hoursFreed),
      equivalentTimeValue: roundMoney(hoursFreed * loadedHourlyCost),
      incrementalGrossSales: roundMoney(incrementalDeals * averageTicket),
      incrementalGrossProfit: input.grossMarginPercent === null
        ? null
        : roundMoney(incrementalDeals * averageTicket * input.grossMarginPercent / 100),
      incrementalDeals: round1(incrementalDeals),
    };
  }
  return {
    inputs: { ...input },
    assumptions: { conversionPercent, averageTicket, loadedHourlyCost },
    inferred,
    currentMonthlyManualHours: round1(currentMonthlyManualHours),
    baselineGrossSales: roundMoney(baselineGrossSales),
    scenarios,
    recommendations: [verticalGuidance[input.industry], ...recommendationByBottleneck[input.bottleneck]],
  };
}
