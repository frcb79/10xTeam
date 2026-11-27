"use client";

import { useMemo, useState } from "react";
import {
  estimateWow,
  wowDefaults,
  type WowBottleneck,
  type WowCurrency,
  type WowIndustry,
  type WowInputs,
} from "@/lib/onboarding/wow-estimate";

const controls = {
  industries: [
    ["consulting", "Consultoría y servicios B2B"],
    ["professional", "Abogados, contadores y profesionales"],
    ["finance", "Créditos, seguros y servicios financieros"],
    ["commerce", "Comercio y productos"],
    ["appointments", "Servicios que venden por citas"],
    ["other", "Otro tipo de negocio"],
  ],
  bottlenecks: [
    ["demand", "Conseguir nuevos prospectos"],
    ["response", "Responder más rápido"],
    ["followup", "Dar seguimiento y cerrar"],
    ["manual", "Quitar trabajo repetitivo"],
    ["closing", "Mejorar la conversión"],
  ],
};
const field = "w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-3 text-slate-50 outline-none focus:border-cyan-300";
const money = (value: number, currency: WowCurrency) =>
  new Intl.NumberFormat(currency === "MXN" ? "es-MX" : "en-US", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(value);
function Choice({
  title, description, children,
}: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-slate-50">{title}</span>
      {description && <span className="block text-xs text-slate-400">{description}</span>}
      {children}
    </label>
  );
}
function SummaryMetric({ title, amount, subtitle }: { title: string; amount: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-5">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{amount}</p>
      <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

export default function WowSimulator() {
  const [values, setValues] = useState<WowInputs>(wowDefaults);
  const [showResults, setShowResults] = useState(false);
  const result = useMemo(() => estimateWow(values), [values]);
  const set = <K extends keyof WowInputs>(key: K, value: WowInputs[K]) =>
    setValues((previous) => ({ ...previous, [key]: value }));
  const ticketChoices = values.currency === "MXN"
    ? [1500, 5000, 15000, 50000, 150000]
    : [100, 300, 750, 2500, 10000];
  const hourlyChoices = values.currency === "MXN"
    ? [100, 200, 350, 500]
    : [10, 20, 35, 50];
  const base = result.scenarios.base;
  const low = result.scenarios.conservative;
  const high = result.scenarios.optimistic;

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#0b2742_0%,_#080f1d_46%,_#040711_100%)] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold tracking-[0.22em] text-cyan-300">10xteam · GROWTH OS</p>
          <span className="rounded-full border border-cyan-400/25 px-3 py-1 text-xs text-cyan-100">Prototipo de Preview · sin registro ni envíos</span>
        </header>
        <div className="mt-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Diagnóstico WOW / Concepto comercial</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Descubre dónde podrías recuperar tiempo y aumentar ventas.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Responde unas preguntas de opción múltiple. Te mostramos escenarios
            transparentes, un mapa de prioridades y cómo personalizaríamos tu Growth OS.
          </p>
        </div>
        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
          <section className="rounded-3xl border border-white/15 bg-slate-950/50 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Tu negocio, en 8 respuestas</h2>
              <select
                className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm"
                aria-label="Moneda"
                value={values.currency}
                onChange={(event) => {
                  const currency = event.target.value as WowCurrency;
                  setValues((previous) => ({
                    ...previous, currency, averageTicket: null, loadedHourlyCost: null,
                  }));
                }}
              >
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="grid gap-5">
              <Choice title="1. ¿Qué tipo de negocio tienes?">
                <select className={field} value={values.industry} onChange={(e) => set("industry", e.target.value as WowIndustry)}>
                  {controls.industries.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Choice>
              <Choice title="2. ¿Qué necesitas resolver primero?">
                <select className={field} value={values.bottleneck} onChange={(e) => set("bottleneck", e.target.value as WowBottleneck)}>
                  {controls.bottlenecks.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Choice>
              <Choice title="3. ¿Cuántos prospectos recibes al mes?">
                <select className={field} value={values.monthlyLeads} onChange={(e) => set("monthlyLeads", Number(e.target.value))}>
                  {[0, 25, 50, 100, 200, 500].map(v => <option key={v} value={v}>{v === 0 ? "Aún no consigo prospectos" : v + " aproximadamente"}</option>)}
                </select>
              </Choice>
              <Choice title="4. ¿Cuánto trabajo manual requiere cada prospecto?" description="Captura, clasificación, asignación, seguimiento administrativo.">
                <select className={field} value={values.minutesPerLead} onChange={(e) => set("minutesPerLead", Number(e.target.value))}>
                  {[5, 10, 15, 30, 60].map(v => <option key={v} value={v}>{v} minutos</option>)}
                </select>
              </Choice>
              <Choice title="5. ¿Qué porcentaje de prospectos se convierte en cliente?">
                <select className={field} value={values.conversionPercent ?? "unknown"} onChange={(e) => set("conversionPercent", e.target.value === "unknown" ? null : Number(e.target.value))}>
                  <option value="unknown">No lo sé (simular con 5%)</option>
                  {[1, 2, 5, 10, 20, 35].map(v => <option key={v} value={v}>{v}%</option>)}
                </select>
              </Choice>
              <Choice title="6. ¿Cuánto vale una venta promedio?" description={"Ventas, no utilidad. Moneda: " + values.currency}>
                <select className={field} value={values.averageTicket ?? "unknown"} onChange={(e) => set("averageTicket", e.target.value === "unknown" ? null : Number(e.target.value))}>
                  <option value="unknown">No lo sé (usar hipótesis visible)</option>
                  {ticketChoices.map(v => <option key={v} value={v}>{money(v, values.currency)}</option>)}
                </select>
              </Choice>
              <Choice title="7. ¿Cuánto cuesta una hora de trabajo administrativo?" description="Costo completo aproximado por hora; no equivale necesariamente a ahorro de nómina.">
                <select className={field} value={values.loadedHourlyCost ?? "unknown"} onChange={(e) => set("loadedHourlyCost", e.target.value === "unknown" ? null : Number(e.target.value))}>
                  <option value="unknown">No lo sé (usar hipótesis visible)</option>
                  {hourlyChoices.map(v => <option key={v} value={v}>{money(v, values.currency)} / hora</option>)}
                </select>
              </Choice>
            </div>
            <button onClick={() => setShowResults(true)}
              className="mt-7 w-full rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-200">
              {showResults ? "Actualizar mi análisis" : "Ver mi reporte WOW"}
            </button>
            <p className="mt-3 text-xs text-slate-400">
              7 preguntas más la moneda. Prototipo aislado: tus elecciones no se guardan
              ni se conectan con HighLevel o una cuenta real.
            </p>
          </section>

          <section className="space-y-5">
            {!showResults ? (
              <div className="rounded-3xl border border-white/15 bg-slate-900/60 p-8">
                <div className="mb-6 text-5xl">✦</div>
                <h2 className="text-2xl font-semibold">Tu reporte aparece aquí.</h2>
                <p className="mt-3 leading-7 text-slate-300">
                  Verás tres escenarios: tiempo que podrías liberar, valor equivalente
                  de ese tiempo y ventas brutas adicionales si mejora tu conversión.
                </p>
                <p className="mt-5 text-sm text-cyan-200">
                  El diagnóstico viene antes del alta. Las integraciones y datos sensibles se piden después.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-3xl border border-cyan-300/25 bg-cyan-300/10 p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Tu oportunidad estimada · escenario base</p>
                  <h2 className="mt-3 text-3xl font-semibold">Más foco comercial, menos operación manual.</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Trabajo manual calculado: <strong>{result.currentMonthlyManualHours} h/mes</strong>.
                    Simulamos automatizar una parte y mejorar relativamente la conversión,
                    sin suponer más prospectos.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SummaryMetric title="Horas liberadas al mes" amount={base.hoursFreed + " h"}
                    subtitle={low.hoursFreed + "–" + high.hoursFreed + " h/mes según escenario"} />
                  <SummaryMetric title="Valor del tiempo liberado / mes" amount={money(base.equivalentTimeValue, values.currency)}
                    subtitle={money(low.equivalentTimeValue, values.currency) + "–" + money(high.equivalentTimeValue, values.currency)} />
                  <SummaryMetric title="Ventas brutas adicionales / mes" amount={money(base.incrementalGrossSales, values.currency)}
                    subtitle={money(low.incrementalGrossSales, values.currency) + "–" + money(high.incrementalGrossSales, values.currency)} />
                  <SummaryMetric title="Potencial anual, si se mantiene el escenario base" amount={money(base.incrementalGrossSales * 12, values.currency)}
                    subtitle="Ventas brutas; no son utilidad ni pronóstico garantizado" />
                </div>
                <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-6">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold">¿Conoces tu margen bruto? (Opcional)</span>
                    <span className="block text-xs text-slate-400">Sólo para estimar contribución bruta adicional, no utilidad neta.</span>
                    <select className={field} value={values.grossMarginPercent ?? "unknown"}
                      onChange={e => set("grossMarginPercent", e.target.value === "unknown" ? null : Number(e.target.value))}>
                      <option value="unknown">No lo sé — no calcular ganancias</option>
                      {[10, 20, 30, 40, 50, 60, 70, 80].map(v => <option key={v} value={v}>{v}% de margen bruto</option>)}
                    </select>
                  </label>
                  {base.incrementalGrossProfit !== null && <div className="mt-5">
                    <p className="text-sm text-slate-300">Contribución bruta adicional aproximada / mes</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{money(base.incrementalGrossProfit, values.currency)}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {money(low.incrementalGrossProfit ?? 0, values.currency)}–{money(high.incrementalGrossProfit ?? 0, values.currency)};
                      antes de costos fijos, marketing, licencias, IA e impuestos. No es utilidad neta.
                    </p>
                  </div>}
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
                  <h3 className="text-lg font-semibold">Lo primero que configuraría Growth OS</h3>
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                    {result.recommendations.map((x, i) => <li key={i} className="flex gap-3">
                      <span className="font-semibold text-cyan-300">{i + 1}.</span>
                      <span>{x}</span>
                    </li>)}
                  </ol>
                </div>
                <div className="rounded-2xl border border-white/10 p-6 text-sm leading-6 text-slate-300">
                  <h3 className="font-semibold text-white">De dónde salen las cifras</h3>
                  <p className="mt-2">
                    Tiempo mensual actual = {values.monthlyLeads} prospectos × {values.minutesPerLead} minutos ÷ 60.
                    Horas liberadas = 20%, 40% o 60% de ese tiempo.
                    Valor del tiempo = horas × {money(result.assumptions.loadedHourlyCost, values.currency)}.
                  </p>
                  <p className="mt-2">
                    Ventas brutas actuales hipotéticas = prospectos × {result.assumptions.conversionPercent}%
                    de conversión × {money(result.assumptions.averageTicket, values.currency)} de ticket.
                    Ventas adicionales = 5%, 10% o 15% de mejora <strong>relativa</strong> sobre esas ventas,
                    no 5–15 puntos porcentuales de conversión.
                  </p>
                  <p className="mt-2 text-amber-100">
                    {result.inferred.length
                      ? "Campos calculados con supuestos, no con datos tuyos: " + result.inferred.map(k =>
                        k === "conversionPercent" ? "conversión" :
                        k === "averageTicket" ? "ticket" : "costo por hora").join(", ") + "."
                      : "Los tres datos económicos provienen de tus selecciones; los porcentajes de mejora siguen siendo hipótesis."}
                  </p>
                  <p className="mt-2">
                    Estos son escenarios exploratorios, no benchmarks verificados ni promesas de resultado.
                    El tiempo liberado no es ahorro de efectivo salvo que realmente reduzca un costo;
                    las ventas brutas no son utilidad; la contribución bruta opcional no descuenta gastos fijos ni adquisición.
                    No se deben sumar indicadores heterogéneos como beneficio neto.
                    Antes de contratar hay que validar tus métricas y los costos de herramientas, IA y canales.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
        <footer className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-400">
          10xteam Growth OS · Demo funcional en Preview · No usa datos personales y no activa sistemas externos.
        </footer>
      </div>
    </main>
  );
}
