import Link from "next/link";

const PROOF_ITEMS = [
  { value: "+35%", label: "ventas promedio en primeros 90 dias" },
  { value: "-65%", label: "costo vs herramientas separadas" },
  { value: "8hrs", label: "semanales recuperadas por el equipo" },
  { value: "$41K", label: "MXN/mes en nomina reemplazada promedio" },
];

const BUILT_CARDS = [
  {
    icon: "🎯",
    title: "Tu Perfil de Cliente Ideal",
    border: "border-amber-300/45",
    text: "El analisis mas completo de quien te compra, por que lo hace y que necesita escuchar para decir si.",
    bullets: [
      "ICP Card con las 5 capas estrategicas",
      "Buyer Persona del humano detras de la decision",
      "ICP Quality Score con recomendaciones",
      "Calculadora de oportunidad con tus datos",
    ],
  },
  {
    icon: "🤖",
    title: "Tu Bot de WhatsApp",
    border: "border-teal-300/45",
    text: "Configurado con tu ICP, tu tono y tus flujos de calificacion. Activo desde el primer minuto.",
    bullets: [
      "Prompt personalizado con lenguaje de tu cliente",
      "Calificacion automatica 24/7",
      "Agendamiento de citas sin friccion",
      "Escalacion inteligente a humano",
    ],
  },
  {
    icon: "🧩",
    title: "Tu Plataforma 10xteam",
    border: "border-cyan-300/45",
    text: "CRM, pipeline, automatizaciones y social planner listos con los datos reales de tu negocio.",
    bullets: [
      "Cuenta activa en Plataforma 10xteam",
      "Snapshot por industria aplicado",
      "Pipelines y flujos configurados",
      "Campos de ICP ya cargados",
    ],
  },
  {
    icon: "📦",
    title: "Tu Trial Pack",
    border: "border-fuchsia-300/40",
    text: "Materiales estrategicos listos para activar resultados en tus primeros 14 dias.",
    bullets: [
      "Secuencia de 3 emails personalizados",
      "Posts para redes listos para publicar",
      "One-pager para compartir por WhatsApp",
      "Script de objeciones y guion de reel",
    ],
  },
];

const PLATFORM_FEATURES = [
  ["📱", "Bot de WhatsApp", "Calificacion y agendamiento automatico"],
  ["🗂️", "CRM completo", "Pipeline, contactos, seguimiento"],
  ["📧", "Email marketing", "Secuencias y campanas activadas"],
  ["📅", "Social Planner", "Posts programados"],
  ["📞", "Llamadas y tracking", "Historial y grabacion integrados"],
  ["⭐", "Reputacion online", "Solicitud de resenas automatizada"],
  ["📊", "Reportes", "Fuentes, conversion y ROI"],
  ["🔄", "Automatizaciones", "Workflows de seguimiento activos"],
];

export function PreIcpValueScreen() {
  return (
    <div className="min-h-screen bg-[#070709] text-[#E8E4DC]">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <p className="font-serif text-lg text-[#F5F2EC]">
            10x<span className="italic text-[#E8B84B]">Team</span>
          </p>
          <Link
            href="/wizard/step/1"
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3B82F6]"
          >
            Empezar el wizard
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden px-5 pb-16 pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,149,42,0.14),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#C9952A]/35 bg-[#C9952A]/10 px-4 py-1 text-[10px] uppercase tracking-[0.18em] text-[#C9952A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
            Sistema listo en minutos
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[0.98] text-[#F5F2EC] md:text-7xl">
            En 15 minutos tu sistema de ventas
            <span className="block italic text-[#E8B84B]">esta construido.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#8892A4] md:text-base">
            Responde el wizard y activamos tu perfil, tu plataforma, tu bot y tus materiales iniciales.
            <span className="text-[#E8E4DC]"> Todo listo antes de terminar tu cafe.</span>
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <TimeChip amount="15" label="minutos" text="el wizard" color="text-[#E8B84B]" />
            <Arrow />
            <TimeChip amount="30" label="minutos" text="llamada de activacion" color="text-[#60A5FA]" />
            <Arrow />
            <TimeChip amount="14" label="dias" text="trial completo" color="text-[#2DD4BF]" />
          </div>

          <Link
            href="/wizard/step/1"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-8 py-4 text-base font-semibold text-white shadow-[0_12px_36px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 hover:bg-[#3B82F6]"
          >
            Empezar el wizard ahora
            <span>→</span>
          </Link>
          <p className="mt-3 text-xs text-[#5A6278]">Sin tarjeta de credito · 100% gratis durante 14 dias</p>
        </div>
      </section>

      <section className="border-y border-white/10 px-5 py-8">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF_ITEMS.map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-serif text-4xl text-[#F5F2EC]">{item.value}</p>
              <p className="mt-1 text-xs text-[#5A6278]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#C9952A]">Lo que se construye para ti</p>
          <h2 className="mt-3 font-serif text-4xl text-[#F5F2EC] md:text-5xl">
            Al terminar el wizard, todo <span className="italic text-[#E8B84B]">ya esta listo.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8892A4]">
            No hay nada que instalar o esperar. Tu informacion se convierte en una base comercial accionable.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {BUILT_CARDS.map((card) => (
              <article key={card.title} className={`rounded-2xl border bg-[#0E1017] p-5 ${card.border}`}>
                <p className="text-2xl">{card.icon}</p>
                <h3 className="mt-3 font-serif text-2xl text-[#F5F2EC]">{card.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#8892A4]">{card.text}</p>
                <ul className="mt-3 space-y-1 text-xs text-[#A8B0C2]">
                  {card.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="text-[#C9952A]">→</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl border-t border-white/10 pt-16">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#C9952A]">Lo que incluye la plataforma</p>
          <h2 className="mt-3 font-serif text-4xl text-[#F5F2EC] md:text-5xl">
            Una plataforma completa. <span className="italic text-[#E8B84B]">No cinco herramientas.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8892A4]">
            Todo en un solo lugar, con configuracion lista para operar desde tu primer acceso.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_FEATURES.map(([icon, title, description]) => (
              <article key={title} className="rounded-xl border border-white/10 bg-[#0E1017] p-4 text-center">
                <p className="text-2xl">{icon}</p>
                <p className="mt-2 text-sm font-semibold text-[#F5F2EC]">{title}</p>
                <p className="mt-1 text-xs text-[#5A6278]">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-[#2563EB]/35 bg-[#2563EB]/10 px-4 py-3 text-sm text-[#AFC8FF]">
            Todo esto queda configurado con tus datos reales: no recibes una plataforma vacia.
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 px-5 pb-24 pt-20 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.18),transparent_65%)]" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl text-[#F5F2EC] md:text-6xl">
            Tu sistema de ventas empieza <span className="italic text-[#E8B84B]">en 15 minutos.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#8892A4]">
            Sin tarjeta de credito. Sin compromiso. Solo responde el wizard y activa tu siguiente etapa.
          </p>
          <Link
            href="/wizard/step/1"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-9 py-4 text-base font-semibold text-white shadow-[0_12px_40px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 hover:bg-[#3B82F6]"
          >
            Empezar el wizard ahora
            <span>→</span>
          </Link>
          <p className="mt-4 text-[11px] uppercase tracking-[0.08em] text-[#5A6278]">
            El wizard toma 15-20 minutos · Sin instalaciones · Sin configuraciones
          </p>
        </div>
      </section>
    </div>
  );
}

function TimeChip({
  amount,
  label,
  text,
  color,
}: {
  amount: string;
  label: string;
  text: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0E1017] px-4 py-2">
      <span className={`font-serif text-3xl ${color}`}>{amount}</span>
      <span className="text-left text-[11px] leading-4 text-[#5A6278]">
        <strong className="block text-xs text-[#E8E4DC]">{label}</strong>
        {text}
      </span>
    </div>
  );
}

function Arrow() {
  return <span className="text-lg text-[#252942]">→</span>;
}
