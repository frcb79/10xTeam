"use client";

import Link from "next/link";
import { useWizard } from "@/hooks/useWizard";
import { calculateOpportunity, formatCurrency } from "@/lib/utils/opportunity";

const GHL_CALENDAR_URL =
  process.env.NEXT_PUBLIC_GHL_CALENDAR_URL ?? "https://calendar.10xteam.com.mx/activacion";

export function CompleteScreen() {
  const { state, reset } = useWizard();
  const step2 = state.answers.step2;
  const step3 = state.answers.step3_b2b ?? state.answers.step3_b2c;
  const step4 = state.answers.step4;
  const step5 = state.answers.step5;
  const step6 = state.answers.step6;
  const opportunity = calculateOpportunity(step6, step2?.priceRange);
  const clientIdeal =
    state.answers.step3_b2b?.primaryDecisionMaker ?? state.answers.step3_b2c?.ageRange ?? "Pendiente";

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-5 py-10 md:px-8">
      <div className="rounded-[2rem] border border-emerald-400/20 bg-slate-950/85 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Completado</p>
        <h2 className="mt-3 text-3xl font-semibold text-stone-50 md:text-4xl">
          Tu Diagnóstico Estratégico 10x está listo para convertir en resultados.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-300">
          Ya tienes base estratégica, oportunidad económica y estructura de activación. Revisa, ajusta lo
          necesario y agenda tu llamada para activar el trial completo de 14 días con todo funcionando.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card title="ICP Score" value={state.icpScore ? `${state.icpScore.total}/100` : "Pendiente"} />
          <Card
            title="Canales elegidos"
            value={step5?.activeChannels?.length ? `${step5.activeChannels.length}` : "Pendiente"}
          />
          <Card
            title="Oportunidad mensual"
            value={opportunity ? formatCurrency(opportunity.totalMonthly) : "Pendiente"}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-stone-100">Resumen estratégico por secciones</p>
              <div className="flex flex-wrap gap-2">
                <EditLink step={2} label="Editar negocio" />
                <EditLink step={3} label="Editar cliente" />
                <EditLink step={4} label="Editar mecanismo" />
                <EditLink step={5} label="Editar canales" />
                <EditLink step={6} label="Editar economía" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <SectionCard
                title="Negocio"
                items={[
                  ["Empresa", step2?.businessName ?? "Pendiente"],
                  ["Industria", step2?.industry ?? "Pendiente"],
                  ["Oferta", step2?.productType ?? "Pendiente"],
                  ["Modelo", step2?.revenueModel ?? "Pendiente"],
                ]}
              />
              <SectionCard
                title="Cliente Ideal"
                items={[
                  ["Perfil", clientIdeal],
                  ["Dolor", step3?.mainPain ?? "Pendiente"],
                  ["Resultado", step3?.mainOutcome ?? "Pendiente"],
                  ["Frecuencia compra", step2?.purchaseFrequency ?? "Pendiente"],
                ]}
              />
              <SectionCard
                title="Mecanismo comercial"
                items={[
                  ["Objecion", step4?.topObjection ?? "Pendiente"],
                  ["Resolucion", step4?.topObjectionResolution ?? "Pendiente"],
                  ["Alternativas fallan", step4?.whyCompetitorsFail ?? "Pendiente"],
                  ["Diferenciador", step4?.uniqueDifferentiator ?? "Pendiente"],
                ]}
              />
              <SectionCard
                title="Operación y economía"
                items={[
                  ["Canales", step5?.activeChannels?.map((channel) => channel.channel === "custom" ? channel.customName ?? "Canal personalizado" : channel.channel).join(", ") ?? "Pendiente"],
                  ["Etapas", step5?.selectedFlows?.join(", ") ?? "Pendiente"],
                  ["Ticket declarado", step6?.clientValue ?? "Pendiente"],
                  ["Respuesta a leads", step6?.leadResponseTime ?? "Pendiente"],
                ]}
              />
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-stone-100">Acceso Pre-Trial</p>
            <p className="mt-2 text-sm text-stone-300">
              Tu plataforma está lista y tu bot ya está activo. Para activar tu trial completo de 14 días,
              agenda tu Llamada de Activación (30 min).
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-emerald-100">✓ Bot de WhatsApp activo</li>
              <li className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-emerald-100">✓ One-pager listo para descargar</li>
              <li className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-emerald-100">✓ ICP básico visible en dashboard</li>
              <li className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-amber-100">✗ Demás módulos bloqueados hasta llamada</li>
            </ul>

            {opportunity && (
              <div className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-rose-100">Costo de no activar</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(opportunity.totalMonthly)} / mes</p>
                <p className="mt-2 text-xs text-rose-100/90">
                  Tiempo: {formatCurrency(opportunity.timeCostMonthly)} · Leads perdidos: {formatCurrency(opportunity.lostLeadsValueMonthly)} · Potencial: {formatCurrency(opportunity.growthValueMonthly)}
                </p>
              </div>
            )}

            <a
              href={GHL_CALENDAR_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 block rounded-full bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-stone-950"
            >
              Agendar mi llamada
            </a>

            <Link
              href="/dashboard"
              className="mt-3 block rounded-full border border-white/15 px-5 py-2.5 text-center text-sm font-semibold text-stone-200"
            >
              Ver mi dashboard pre-trial
            </Link>
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Acciones de sesión</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/wizard/step/1"
                  className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-2.5 text-sm font-semibold text-cyan-100"
                >
                  Revisar desde paso 1
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200"
                >
                  Limpiar borrador
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{title}</p>
      <p className="mt-2 text-lg font-semibold text-stone-50">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string]>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm font-semibold text-stone-50">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map(([label, value]) => (
          <div key={`${title}-${label}`} className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-stone-400">{label}</p>
            <p className="mt-1 text-sm text-stone-100">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditLink({ step, label }: { step: 2 | 3 | 4 | 5 | 6; label: string }) {
  return (
    <Link
      href={`/wizard/step/${step}`}
      className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100"
    >
      {label}
    </Link>
  );
}
