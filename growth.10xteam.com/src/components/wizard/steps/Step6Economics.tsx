"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "@/hooks/useWizard";
import type {
  AcquisitionCostBand,
  GrossMarginBand,
  LeadResponseTime,
  ManualMarketingHours,
  MonthlyNewClients,
  OwnerRole,
  RenewalFrequency,
  SaleType,
} from "@/types/wizard.types";

const OWNER_ROLE_OPTIONS: Array<{ value: OwnerRole; label: string }> = [
  { value: "owner_operator", label: "Yo vendo y opero" },
  { value: "has_team", label: "Tengo equipo comercial" },
  { value: "uses_agencies", label: "Me apoyo en agencias/proveedores" },
];

const MANUAL_MARKETING_OPTIONS: Array<{ value: ManualMarketingHours; label: string }> = [
  { value: "less_2hrs", label: "Menos de 2 horas por semana" },
  { value: "2_5hrs", label: "Entre 2 y 5 horas por semana" },
  { value: "5_10hrs", label: "Entre 5 y 10 horas por semana" },
  { value: "more_10hrs", label: "Mas de 10 horas por semana" },
];

const RESPONSE_TIME_OPTIONS: Array<{ value: LeadResponseTime; label: string }> = [
  { value: "under_5min", label: "Menos de 5 minutos" },
  { value: "5_30min", label: "Entre 5 y 30 minutos" },
  { value: "30min_2hrs", label: "Entre 30 minutos y 2 horas" },
  { value: "more_2hrs", label: "Mas de 2 horas" },
];

const SALE_TYPE_OPTIONS: Array<{ value: SaleType; label: string }> = [
  { value: "one_time", label: "Venta unica" },
  { value: "monthly_recurring", label: "Recurrente mensual" },
  { value: "annual_recurring", label: "Recurrente anual" },
  { value: "package_renewal", label: "Paquete con renovacion" },
  { value: "mixed", label: "Modelo mixto" },
];

const RENEWAL_OPTIONS: Array<{ value: RenewalFrequency; label: string }> = [
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "quarterly", label: "Trimestral" },
  { value: "semiannual", label: "Semestral" },
  { value: "annual", label: "Anual" },
];

const MONTHLY_CLIENT_OPTIONS: Array<{ value: MonthlyNewClients; label: string }> = [
  { value: "1_3", label: "1-3 clientes al mes" },
  { value: "4_10", label: "4-10 clientes al mes" },
  { value: "11_20", label: "11-20 clientes al mes" },
  { value: "20_plus", label: "20+ clientes al mes" },
];

const CAC_OPTIONS: Array<{ value: AcquisitionCostBand; label: string }> = [
  { value: "under_500", label: "Menos de $500 MXN" },
  { value: "500_2000", label: "$500 - $2,000 MXN" },
  { value: "2000_8000", label: "$2,000 - $8,000 MXN" },
  { value: "over_8000", label: "Mas de $8,000 MXN" },
  { value: "unknown", label: "No lo se" },
];

const MARGIN_OPTIONS: Array<{ value: GrossMarginBand; label: string }> = [
  { value: "under_20", label: "Menos de 20%" },
  { value: "20_40", label: "20% - 40%" },
  { value: "40_60", label: "40% - 60%" },
  { value: "over_60", label: "Mas de 60%" },
  { value: "prefer_not_say", label: "Prefiero no compartirlo" },
];

export function Step6Economics() {
  const router = useRouter();
  const { state, updateStep6, goPrev, setStatus } = useWizard();
  const current = state.answers.step6;

  const [ownerRole, setOwnerRole] = useState<OwnerRole>(current?.ownerRole ?? "owner_operator");
  const [manualMarketingHours, setManualMarketingHours] = useState<ManualMarketingHours>(
    current?.manualMarketingHours ?? "2_5hrs"
  );
  const [leadResponseTime, setLeadResponseTime] = useState<LeadResponseTime>(
    current?.leadResponseTime ?? "30min_2hrs"
  );
  const [productDescription, setProductDescription] = useState(current?.productDescription ?? "");
  const [clientValue, setClientValue] = useState(current?.clientValue ?? "");
  const [saleType, setSaleType] = useState<SaleType>(current?.saleType ?? "one_time");
  const [renewalFrequency, setRenewalFrequency] = useState<RenewalFrequency | null>(
    current?.renewalFrequency ?? null
  );
  const [monthlyNewClients, setMonthlyNewClients] = useState<MonthlyNewClients>(
    current?.monthlyNewClients ?? "1_3"
  );
  const [activeClients, setActiveClients] = useState(current?.activeClients ?? "");
  const [acquisitionCost, setAcquisitionCost] = useState<AcquisitionCostBand>(
    current?.acquisitionCost ?? "unknown"
  );
  const [grossMargin, setGrossMargin] = useState<GrossMarginBand>(
    current?.grossMargin ?? "prefer_not_say"
  );

  const renewalRequired = saleType !== "one_time";
  const valid = useMemo(() => {
    return (
      productDescription.trim().length >= 8 &&
      clientValue.trim().length >= 1 &&
      (!renewalRequired || renewalFrequency !== null)
    );
  }, [clientValue, productDescription, renewalFrequency, renewalRequired]);

  const handleContinue = () => {
    if (!valid) return;

    updateStep6({
      ownerRole,
      manualMarketingHours,
      leadResponseTime,
      productDescription: productDescription.trim(),
      clientValue: clientValue.trim(),
      saleType,
      renewalFrequency: renewalRequired ? renewalFrequency : null,
      monthlyNewClients,
      activeClients: activeClients.trim(),
      acquisitionCost,
      grossMargin,
    });

    setStatus("processing");
    router.push("/wizard/processing");
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 6 · Economia del negocio</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">Esta fase aterriza tu potencial de crecimiento.</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
        Cerramos con la oportunidad real de tu negocio.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="F1. Que vendes exactamente">
          <textarea
            value={productDescription}
            onChange={(event) => setProductDescription(event.target.value)}
            placeholder="Ej. Implantes dentales de una sola cita"
            className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          />
        </Field>

        <Field label="F2. Ticket promedio (MXN)">
          <input
            value={clientValue}
            onChange={(event) => setClientValue(event.target.value)}
            placeholder="Ej. 8500 o 5000-15000"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          />
        </Field>

        <Field label="Rol de venta hoy">
          <select
            value={ownerRole}
            onChange={(event) => setOwnerRole(event.target.value as OwnerRole)}
            className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          >
            {OWNER_ROLE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Horas semanales en marketing manual">
          <select
            value={manualMarketingHours}
            onChange={(event) => setManualMarketingHours(event.target.value as ManualMarketingHours)}
            className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          >
            {MANUAL_MARKETING_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tiempo de respuesta a leads">
          <select
            value={leadResponseTime}
            onChange={(event) => setLeadResponseTime(event.target.value as LeadResponseTime)}
            className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          >
            {RESPONSE_TIME_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="F3. Tipo de venta">
          <select
            value={saleType}
            onChange={(event) => setSaleType(event.target.value as SaleType)}
            className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          >
            {SALE_TYPE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        {renewalRequired && (
          <Field label="F4. Frecuencia de renovacion">
            <select
              value={renewalFrequency ?? ""}
              onChange={(event) => setRenewalFrequency(event.target.value as RenewalFrequency)}
              className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
            >
              <option value="">Selecciona frecuencia</option>
              {RENEWAL_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="F5. Clientes nuevos por mes">
          <select
            value={monthlyNewClients}
            onChange={(event) => setMonthlyNewClients(event.target.value as MonthlyNewClients)}
            className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          >
            {MONTHLY_CLIENT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="F6. Clientes activos hoy (opcional)">
          <input
            value={activeClients}
            onChange={(event) => setActiveClients(event.target.value)}
            placeholder="Ej. 28"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          />
        </Field>

        <Field label="F7. Costo por cliente hoy (opcional)">
          <select
            value={acquisitionCost}
            onChange={(event) => setAcquisitionCost(event.target.value as AcquisitionCostBand)}
            className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          >
            {CAC_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="F8. Margen bruto (opcional)">
          <select
            value={grossMargin}
            onChange={(event) => setGrossMargin(event.target.value as GrossMarginBand)}
            className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
          >
            {MARGIN_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!valid}
          className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Calcular oportunidad y crear reporte
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-stone-300">
      <span>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
