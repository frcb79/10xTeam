export default function WizardTemplatePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-10 md:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Template ideal</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-50 md:text-5xl">Documento ICP ultra WOW</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-300">
          Este formato está pensado para vender la claridad del sistema: se entiende rápido, se ve premium y deja una impresión fuerte en demos o validaciones con clientes.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Block title="Portada" text="Nombre del ICP, frase de impacto y una promesa clara." />
          <Block title="Resumen ejecutivo" text="Quién es, qué vive hoy, qué busca y por qué ahora." />
          <Block title="Perfil ideal" text="Decisor, influenciadores, tamaño y señales de compra." />
          <Block title="Problema central" text="Dolor en palabras del cliente, sin lenguaje técnico." />
          <Block title="Costo de no actuar" text="Dinero, tiempo y oportunidad perdida cada mes." />
          <Block title="Promesa" text="Resultado medible con un plazo específico." />
          <Block title="Mecanismo único" text="Qué hacemos distinto y por qué funciona." />
          <Block title="Objeciones" text="Precio, tiempo, confianza y 'ya lo intentamos'." />
          <Block title="Anti-ICP" text="A quién no ayudaría este sistema y por qué." />
          <Block title="Canales y flujos" text="Dónde opera, cómo avanza y qué etapas requiere." />
          <Block title="Señales de calidad" text="Fit, urgencia, dolor específico y fit económico." />
          <Block title="Cierre WOW" text="Frase final que invita a avanzar a la siguiente conversación." />
        </div>

        <div className="mt-8 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
          <p className="text-sm font-semibold text-emerald-100">Cómo usarlo</p>
          <p className="mt-2 text-sm text-emerald-50/90">
            Úsalo como plantilla de ventas, demo o validación interna. Sirve para mostrar el valor del sistema con una presentación mucho más clara y convincente.
          </p>
        </div>
      </section>
    </main>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-semibold text-stone-50">{title}</p>
      <p className="mt-2 text-sm leading-6 text-stone-400">{text}</p>
    </article>
  );
}
