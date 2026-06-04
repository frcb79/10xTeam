"use client";

import { useMemo, useState } from "react";
import { useWizard } from "@/hooks/useWizard";
import { ICPScoreMeter } from "@/components/wizard/ICPScoreMeter";

const INDUSTRIES = [
  "salud_odontologia",
  "salud_medicina",
  "salud_bienestar",
  "inmobiliaria",
  "educacion",
  "legal",
  "financiero",
  "consultoria",
  "tecnologia",
  "restaurantes",
  "retail",
  "manufactura",
  "marketing_agencia",
  "ecommerce",
  "otro",
];

const ICP_TYPES = ["b2b", "b2c", "mixed", "freelancer"] as const;

const PRODUCT_TYPES = [
  { value: "servicio", label: "Servicio" },
  { value: "producto", label: "Producto" },
  { value: "suscripcion", label: "Suscripcion / SaaS" },
  { value: "hibrido", label: "Hibrido" },
  { value: "consultoria", label: "Consultoria" },
];

const REVENUE_MODELS = [
  { value: "venta_unica", label: "Venta unica" },
  { value: "recurrente_mensual", label: "Recurrente mensual" },
  { value: "recurrente_anual", label: "Recurrente anual" },
  { value: "hibrido", label: "Hibrido" },
  { value: "consumo", label: "Pago por consumo" },
];

const PRICE_RANGES = [
  { value: "0_500", label: "$0 - $500 MXN" },
  { value: "500_3000", label: "$500 - $3,000 MXN" },
  { value: "3000_10000", label: "$3,000 - $10,000 MXN" },
  { value: "10000_50000", label: "$10,000 - $50,000 MXN" },
  { value: "50000_plus", label: "$50,000+ MXN" },
];

const MARGIN_BANDS = [
  { value: "0_20", label: "0% - 20%" },
  { value: "20_40", label: "20% - 40%" },
  { value: "40_60", label: "40% - 60%" },
  { value: "60_plus", label: "60%+" },
];

const PURCHASE_FREQUENCIES = [
  { value: "unica", label: "Unica" },
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
  { value: "variable", label: "Variable" },
];

export function Step2Business() {
  const { state, updateStep2, goPrev, goNext, setICPType } = useWizard();
  const prefill = getPrefill();
  const [businessName, setBusinessName] = useState(state.answers.step2?.businessName ?? prefill.businessName ?? "");
  const [oneLiner, setOneLiner] = useState(state.answers.step2?.oneLiner ?? prefill.oneLiner ?? "");
  const [industry, setIndustry] = useState(state.answers.step2?.industry ?? prefill.industry ?? "");
  const [icpType, setIcpTypeState] = useState(state.answers.step2?.icpType ?? state.icpType ?? "b2b");
  const [productType, setProductType] = useState(state.answers.step2?.productType ?? "");
  const [revenueModel, setRevenueModel] = useState(state.answers.step2?.revenueModel ?? "");
  const [priceRange, setPriceRange] = useState(state.answers.step2?.priceRange ?? "");
  const [marginBand, setMarginBand] = useState(state.answers.step2?.marginBand ?? "");
  const [purchaseFrequency, setPurchaseFrequency] = useState(state.answers.step2?.purchaseFrequency ?? "");

  const valid = useMemo(() => {
    return (
      businessName.trim().length >= 2 &&
      oneLiner.trim().length >= 20 &&
      industry.trim().length > 0 &&
      productType.trim().length > 0 &&
      revenueModel.trim().length > 0 &&
      priceRange.trim().length > 0 &&
      marginBand.trim().length > 0 &&
      purchaseFrequency.trim().length > 0
    );
  }, [businessName, oneLiner, industry, productType, revenueModel, priceRange, marginBand, purchaseFrequency]);

  const handleContinue = () => {
    if (!valid) return;
    updateStep2({
      businessName: businessName.trim(),
      oneLiner: oneLiner.trim(),
      industry,
      industrySubcategory: "",
      icpType,
      productType,
      revenueModel,
      priceRange,
      marginBand,
      purchaseFrequency,
    });
    setICPType(icpType);
    goNext();
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 2 · Negocio</p>
        <h2 className="mt-3 text-3xl font-semibold text-stone-50">Cuéntanos sobre tu negocio</h2>
        <div className="mt-6 grid gap-4">
          <Field label="Nombre del negocio">
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Credito Negocios" />
          </Field>
          <Field label="One-liner">
            <textarea value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ayudamos a..." />
          </Field>
          <Field label="Industria">
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
              <option value="">Selecciona una industria</option>
              {INDUSTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Tipo de cliente ideal">
            <div className="grid gap-3 md:grid-cols-2">
              {ICP_TYPES.map((type) => (
                <button key={type} type="button" onClick={() => setIcpTypeState(type)} className={`rounded-2xl border px-4 py-4 text-left transition ${icpType === type ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/5"}`}>
                  <p className="font-medium text-stone-50">{type.toUpperCase()}</p>
                  <p className="mt-1 text-xs text-stone-400">Selecciona la ruta de preguntas correcta.</p>
                </button>
              ))}
            </div>
          </Field>

          <div className="mt-2 border-t border-white/10 pt-5">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-teal-300">Economia de la oferta</p>
            <div className="grid gap-4">
              <Field label="Que vendes principalmente">
                <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona tipo de oferta</option>
                  {PRODUCT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>

              <Field label="Modelo de ingresos">
                <select value={revenueModel} onChange={(e) => setRevenueModel(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona modelo</option>
                  {REVENUE_MODELS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>

              <Field label="Ticket promedio al mercado">
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona rango de precio</option>
                  {PRICE_RANGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>

              <Field label="Margen estimado de ganancia">
                <select value={marginBand} onChange={(e) => setMarginBand(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona margen</option>
                  {MARGIN_BANDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>

              <Field label="Frecuencia de compra del cliente">
                <select value={purchaseFrequency} onChange={(e) => setPurchaseFrequency(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona frecuencia</option>
                  {PURCHASE_FREQUENCIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Base actual</p>
        <div className="mt-4 space-y-3 text-sm text-stone-300">
          <Badge label="Prellenado" value={state.scrapedContent ? "Sí" : "No"} />
          <Badge label="ICP score" value={state.icpScore ? `${state.icpScore.total}/100` : "Pendiente"} />
          <Badge label="Estado" value={state.status} />
        </div>
        <div className="mt-6">
          <ICPScoreMeter total={state.icpScore?.total ?? null} />
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={goPrev} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200">Atrás</button>
          <button type="button" onClick={handleContinue} disabled={!valid} className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-50">Continuar</button>
        </div>
      </aside>
    </div>
  );
}

function getPrefill(): { businessName?: string; oneLiner?: string; industry?: string } {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem("wizard_prefill");
    if (!raw) return {};

    const parsed = JSON.parse(raw) as {
      oneLiner?: string;
      industry?: string;
      businessName?: string;
    };

    return parsed;
  } catch {
    return {};
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-stone-300">
      <span>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
      <span className="text-stone-400">{label}</span>
      <span className="font-medium text-stone-100">{value}</span>
    </div>
  );
}
