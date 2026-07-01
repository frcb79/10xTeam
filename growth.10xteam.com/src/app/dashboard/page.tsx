import Link from "next/link";

const GHL_CALENDAR_URL =
  process.env.NEXT_PUBLIC_GHL_CALENDAR_URL ?? "https://calendar.10xteam.com.mx/activacion";

export default function DashboardPreTrialPage() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-5 py-10 md:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Dashboard · Pre-Trial</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-50 md:text-4xl">Tu plataforma esta lista para activarse al 100%</h1>

        <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-stone-100">
          <p>
            Tu plataforma está lista y tu bot ya está activo.
            Para activar tu trial completo de 14 días, agenda
            tu Llamada de Activación (30 min). En esa llamada
            te explicamos todo lo que preparamos para tu negocio
            y arrancamos juntos.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <StatusCard text="Bot de WhatsApp activo (conecta a tu numero)" ready />
          <StatusCard text="One-pager listo para descargar" ready />
          <StatusCard text="ICP basico visible en el dashboard" ready />
          <StatusCard text="Todo lo demas bloqueado hasta llamada" ready={false} />
        </div>

        <a
          href={GHL_CALENDAR_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-8 block rounded-full bg-cyan-300 px-6 py-3 text-center text-base font-semibold text-stone-950"
        >
          Agendar mi llamada
        </a>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/wizard/complete"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200"
          >
            Volver al resumen
          </Link>
          <Link
            href="/wizard/step/2"
            className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-2.5 text-sm font-semibold text-cyan-100"
          >
            Editar respuestas
          </Link>
        </div>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-stone-100">Diagnóstico Estratégico 10x</h2>
          <p className="text-sm text-stone-300">
            Tu diagnóstico completo se presenta en llamada. Mientras tanto, en activación puedes ver un preview
            limitado para preparar la sesión.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/activacion"
              className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-2.5 text-sm font-semibold text-cyan-100"
            >
              Ver preview de activación
            </Link>
            <a
              href="/diagnostico-estrategico-10x-template.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200"
            >
              Diagnóstico Completo Muestra
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusCard({ text, ready }: { text: string; ready: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        ready
          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
          : "border-amber-300/30 bg-amber-300/10 text-amber-100"
      }`}
    >
      {ready ? "✓" : "✗"} {text}
    </div>
  );
}
