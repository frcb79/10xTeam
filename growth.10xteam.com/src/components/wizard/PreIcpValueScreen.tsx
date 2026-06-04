import Link from "next/link";
import {
  CLAIMS_DISCLAIMER,
  CONSERVATIVE_IMPACT_CLAIMS,
  PRE_ICP_VALUE_PILLARS,
} from "@/lib/trial/claims";

export function PreIcpValueScreen() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 md:px-8 md:py-12">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Antes de construir tu ICP</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-stone-50 md:text-5xl">
          Tendras una herramienta que entiende tu negocio y te entrega materiales listos para crecer ventas.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-300 md:text-base">
          Escribe unas lineas sobre tu negocio y obten un kit publicitario accionable. Luego, cada mes,
          el sistema actualiza materiales segun tu desempeno comercial para mantener traccion.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PRE_ICP_VALUE_PILLARS.map((pillar) => (
            <article key={pillar.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-base font-semibold text-stone-50">{pillar.title}</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">{pillar.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Impacto estimado en negocios similares</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {CONSERVATIVE_IMPACT_CLAIMS.map((claim) => (
              <div key={claim.id} className="rounded-2xl border border-emerald-300/20 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">{claim.metric}</p>
                <p className="mt-2 text-2xl font-semibold text-stone-50">{claim.range}</p>
                <p className="mt-1 text-sm leading-6 text-stone-300">{claim.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-emerald-100/85">{CLAIMS_DISCLAIMER}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/wizard/step/1"
            className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-cyan-200"
          >
            Iniciar diagnostico ICP
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-stone-200 transition hover:border-white/25"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </div>
  );
}
