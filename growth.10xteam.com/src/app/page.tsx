import { IcpWizard } from "@/components/icp-wizard";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-14 px-5 py-10 md:px-8 md:py-14">
        <section className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div>
            <p className="mb-4 inline-block rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-200">
              growth.10xteam.com
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight text-stone-100 md:text-6xl">
              Prospeccion inteligente para pymes B2B en Latam.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-300">
              Activa tu ICP, genera materiales comerciales y ejecuta seguimiento multicanal en un solo flujo.
              Sin ensamblar 5 herramientas ni depender de procesos manuales.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#wizard"
                className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-cyan-200"
              >
                Probar Wizard ICP
              </a>
              <a
                href="#arquitectura"
                className="rounded-full border border-stone-600 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-stone-200 transition hover:border-stone-500"
              >
                Ver arquitectura
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.16em] text-teal-300">Impacto esperado</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Stat value="72h" label="Primera cita calificada" />
              <Stat value="1" label="Sistema integrado" />
              <Stat value="5x" label="Menos trabajo manual" />
              <Stat value="MRR" label="Modelo recurrente" />
            </div>
            <p className="mt-5 rounded-xl border border-stone-800 bg-stone-900 p-3 text-sm text-stone-300">
              Base: whitelabel + capa propia de IA para ICP, materiales y contenido.
            </p>
          </div>
        </section>

        <section id="arquitectura" className="grid gap-4 md:grid-cols-4">
          <Pillar title="ICP Wizard" text="Define cliente ideal y activa personalizacion de toda la cuenta." />
          <Pillar title="Materiales" text="Genera pitch decks, propuestas y one-pagers por industria." />
          <Pillar title="Outreach" text="Orquesta email, LinkedIn y WhatsApp con seguimiento automatizado." />
          <Pillar title="Seguimiento" text="Scoring y handoff comercial con contexto para cierre." />
        </section>

        <IcpWizard />
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900 p-3">
      <p className="text-2xl font-semibold text-stone-100">{value}</p>
      <p className="text-xs uppercase tracking-[0.12em] text-stone-400">{label}</p>
    </div>
  );
}

function Pillar({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
      <h2 className="text-base font-semibold text-stone-100">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-400">{text}</p>
    </article>
  );
}
