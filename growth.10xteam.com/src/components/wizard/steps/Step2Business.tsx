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

const INDUSTRY_EXAMPLES: Record<string, { oneLiner: string[] }> = {
  salud_odontologia: {
    oneLiner: [
      "Ayudamos a clínicas dentales a llenar su agenda con pacientes de alto valor usando seguimiento automatizado por WhatsApp.",
      "Ayudamos a consultorios dentales a convertir más valoraciones en tratamientos pagados con un proceso comercial claro.",
    ],
  },
  salud_medicina: {
    oneLiner: [
      "Ayudamos a clínicas y consultorios médicos a convertir más prospectos en citas confirmadas con seguimiento automatizado.",
      "Ayudamos a médicos especialistas a llenar agenda con pacientes mejor calificados y menos fuga entre contacto y consulta.",
    ],
  },
  salud_bienestar: {
    oneLiner: [
      "Ayudamos a negocios de bienestar a convertir más interesados en clientes activos con seguimiento claro y constante.",
      "Ayudamos a marcas de salud y bienestar a vender con más consistencia sin depender solo de contenido orgánico.",
    ],
  },
  inmobiliaria: {
    oneLiner: [
      "Ayudamos a desarrollos inmobiliarios a convertir más leads en citas y cierres con seguimiento automatizado.",
      "Ayudamos a asesores inmobiliarios a recuperar prospectos fríos y acelerar cierres sin perseguir manualmente cada contacto.",
    ],
  },
  educacion: {
    oneLiner: [
      "Ayudamos a instituciones y programas educativos a convertir interesados en inscritos con seguimiento por etapa.",
      "Ayudamos a cursos y certificaciones a llenar grupos con un sistema comercial más consistente.",
    ],
  },
  legal: {
    oneLiner: [
      "Ayudamos a despachos legales a convertir más consultas en clientes pagados con seguimiento profesional y oportuno.",
      "Ayudamos a firmas legales a ordenar su proceso comercial para que las oportunidades no se enfríen después de la primera llamada.",
    ],
  },
  financiero: {
    oneLiner: [
      "Ayudamos a negocios financieros a mover más prospectos calificados a cita, análisis y cierre con seguimiento por etapa.",
      "Ayudamos a asesores y brokers financieros a recuperar oportunidades frías y cerrar con más consistencia.",
    ],
  },
  consultoria: {
    oneLiner: [
      "Ayudamos a firmas de consultoría a cerrar más clientes con un proceso de seguimiento que no depende del fundador.",
      "Ayudamos a despachos profesionales a convertir conversaciones en propuestas y propuestas en cierres.",
    ],
  },
  marketing_agencia: {
    oneLiner: [
      "Ayudamos a agencias a convertir más prospectos en clientes con automatización, seguimiento y mejor manejo de objeciones.",
      "Ayudamos a agencias de servicios a ordenar su pipeline y cerrar con más consistencia sin saturar al equipo.",
    ],
  },
  tecnologia: {
    oneLiner: [
      "Ayudamos a empresas de software a mover más demos hacia oportunidades reales con seguimiento comercial por comportamiento.",
      "Ayudamos a soluciones SaaS a reducir fuga entre lead, demo y cierre con un sistema comercial más claro.",
    ],
  },
  restaurantes: {
    oneLiner: [
      "Ayudamos a restaurantes a activar más reservas, eventos y clientes recurrentes con seguimiento automatizado.",
      "Ayudamos a grupos restauranteros a convertir interés en visitas repetidas sin depender solo de promociones sueltas.",
    ],
  },
  retail: {
    oneLiner: [
      "Ayudamos a marcas retail a convertir más tráfico e interés en ventas recurrentes con mejor seguimiento comercial.",
      "Ayudamos a negocios retail a recuperar clientes y aumentar recompra con automatización por comportamiento.",
    ],
  },
  manufactura: {
    oneLiner: [
      "Ayudamos a empresas manufactureras a convertir más prospectos en oportunidades reales con un proceso comercial más claro.",
      "Ayudamos a negocios industriales a acelerar seguimiento y cierre de cuentas con mejor control del pipeline.",
    ],
  },
  ecommerce: {
    oneLiner: [
      "Ayudamos a ecommerce a aumentar recompra y conversión con automatización de seguimiento y recuperación.",
      "Ayudamos a marcas digitales a convertir mejor tráfico e intención de compra con un sistema comercial más ordenado.",
    ],
  },
  otro: {
    oneLiner: [
      "Ayudamos a [tipo de cliente] a lograr [resultado medible] con un sistema más claro de seguimiento y conversión.",
      "Ayudamos a [mercado] a resolver [problema urgente] con un proceso comercial que sí se sostiene.",
    ],
  },
};

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
  const oneLinerExamples = INDUSTRY_EXAMPLES[industry] ?? INDUSTRY_EXAMPLES.otro;

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
    <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 2 · Negocio</p>
        <h2 className="mt-3 text-3xl font-semibold text-stone-50">Define la base de tu negocio y de tu oferta</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
          Aquí definimos dos bloques: identidad del negocio y economía de la oferta. Esta estructura evita respuestas genéricas y mejora tu diagnóstico final.
        </p>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Bloque A · Identidad</p>
            <div className="mt-4 grid gap-4">
              <Field label="Nombre del negocio">
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ej. Credito Negocios" />
              </Field>

              <Field label="One-liner comercial">
                <textarea value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" placeholder="Ayudamos a [quién] a [resultado] mediante [cómo]." />
                <p className="mt-2 text-xs leading-5 text-stone-400">
                  Ejemplos: {oneLinerExamples.oneLiner.join(" · ")}
                </p>
              </Field>

              <Field label="Industria principal">
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona una industria</option>
                  {INDUSTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>

              <Field label="A quien le vendes principalmente">
                <div className="grid gap-3 sm:grid-cols-2">
                  {ICP_TYPES.map((type) => (
                    <button key={type} type="button" onClick={() => setIcpTypeState(type)} className={`rounded-2xl border px-4 py-4 text-left transition ${icpType === type ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/5"}`}>
                      <p className="font-medium text-stone-50">{type.toUpperCase()}</p>
                      <p className="mt-1 text-xs text-stone-400">La Fase 3 se ajustará a esta ruta.</p>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-teal-300">Bloque B · Economía de la oferta</p>
            <div className="mt-4 grid gap-4">
              <Field label="Que vendes principalmente">
                <select value={productType} onChange={(e) => setProductType(e.target.value)} className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona tipo de oferta</option>
                  {PRODUCT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>

              <Field label="Modelo de ingresos">
                <select value={revenueModel} onChange={(e) => setRevenueModel(e.target.value)} className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona modelo</option>
                  {REVENUE_MODELS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>

              <Field label="Ticket promedio al mercado">
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona rango de precio</option>
                  {PRICE_RANGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>

              <Field label="Margen estimado de ganancia">
                <select value={marginBand} onChange={(e) => setMarginBand(e.target.value)} className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona margen</option>
                  {MARGIN_BANDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>

              <Field label="Frecuencia de compra del cliente">
                <select value={purchaseFrequency} onChange={(e) => setPurchaseFrequency(e.target.value)} className="wizard-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60">
                  <option value="">Selecciona frecuencia</option>
                  {PURCHASE_FREQUENCIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Lo que vamos a construir contigo</p>
        <div className="mt-4 space-y-3 text-sm text-stone-300">
          <Badge label="Prellenado" value={state.scrapedContent ? "Sí" : "No"} />
          <Badge label="ICP score" value={state.icpScore ? `${state.icpScore.total}/100` : "Pendiente"} />
          <Badge label="Estado" value={state.status} />
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-stone-300">
          En la siguiente fase vamos a aterrizar tu Buyer Persona con el enfoque correcto.
          <br />
          - Empresa: perfil de la persona compradora y contexto del negocio.
          <br />
          - Negocio: etapa del negocio y realidad operativa.
          <br />
          - Consumidor: perfil de compra y motivación personal.
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
