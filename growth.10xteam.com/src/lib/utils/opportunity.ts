import type {
  LeadResponseTime,
  ManualMarketingHours,
  MonthlyNewClients,
  OwnerRole,
  Step6EconomicsAnswers,
} from "@/types/wizard.types";

export interface OpportunityResult {
  ticketValue: number;
  timeCostMonthly: number;
  lostLeadsValueMonthly: number;
  growthValueMonthly: number;
  totalMonthly: number;
  totalAnnual: number;
  leadsLostMonthly: number;
  additionalClientsMonthly: number;
}

const HOURS_PER_MONTH: Record<ManualMarketingHours, number> = {
  less_2hrs: 4,
  "2_5hrs": 14,
  "5_10hrs": 30,
  more_10hrs: 52,
};

const HOURLY_RATE: Record<OwnerRole, number> = {
  owner_operator: 750,
  has_team: 350,
  uses_agencies: 200,
};

const LEAD_LOSS_RATE: Record<LeadResponseTime, number> = {
  under_5min: 0.05,
  "5_30min": 0.15,
  "30min_2hrs": 0.5,
  more_2hrs: 0.7,
};

const BASE_MONTHLY_CLIENTS: Record<MonthlyNewClients, number> = {
  "1_3": 2,
  "4_10": 7,
  "11_20": 15,
  "20_plus": 24,
};

const GROWTH_POTENTIAL: Record<MonthlyNewClients, number> = {
  "1_3": 0.5,
  "4_10": 0.38,
  "11_20": 0.25,
  "20_plus": 0.15,
};

const PRICE_RANGE_MAP: Record<string, number> = {
  "0_500": 250,
  "500_3000": 1750,
  "3000_10000": 6500,
  "10000_50000": 30000,
  "50000_plus": 50000,
};

export function calculateOpportunity(
  economics: Step6EconomicsAnswers | null,
  step2PriceRange?: string | null
): OpportunityResult | null {
  if (!economics) return null;

  const ticketValue = parseTicketValue(economics.clientValue, step2PriceRange);
  if (!ticketValue || ticketValue <= 0) return null;

  const timeCostMonthly =
    HOURS_PER_MONTH[economics.manualMarketingHours] * HOURLY_RATE[economics.ownerRole];

  const baseClients = BASE_MONTHLY_CLIENTS[economics.monthlyNewClients];
  const totalLeadsMonthly = baseClients * 2;
  const leadsLostMonthly = totalLeadsMonthly * LEAD_LOSS_RATE[economics.leadResponseTime];
  const lostLeadsValueMonthly = leadsLostMonthly * ticketValue;

  const additionalClientsMonthly =
    baseClients * GROWTH_POTENTIAL[economics.monthlyNewClients];
  const growthValueMonthly = additionalClientsMonthly * ticketValue;

  const totalMonthly = timeCostMonthly + lostLeadsValueMonthly + growthValueMonthly;
  const totalAnnual = totalMonthly * 12;

  return {
    ticketValue,
    timeCostMonthly,
    lostLeadsValueMonthly,
    growthValueMonthly,
    totalMonthly,
    totalAnnual,
    leadsLostMonthly,
    additionalClientsMonthly,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function parseTicketValue(clientValue: string, step2PriceRange?: string | null): number | null {
  const normalized = clientValue.replace(/,/g, "").trim();
  const numbers = normalized.match(/\d+(?:\.\d+)?/g);

  if (numbers && numbers.length > 0) {
    const parsed = numbers.map((value) => Number(value)).filter((value) => !Number.isNaN(value));

    if (parsed.length === 1) return parsed[0];
    if (parsed.length >= 2) return (parsed[0] + parsed[1]) / 2;
  }

  if (!step2PriceRange) return null;
  return PRICE_RANGE_MAP[step2PriceRange] ?? null;
}
