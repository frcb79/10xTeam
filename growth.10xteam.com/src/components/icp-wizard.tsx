"use client";

import { useMemo, useState } from "react";
import type { GeneratedMaterials, WizardData } from "@/types/icp";

const initialData: WizardData = {
  companyName: "",
  industry: "",
  employeeRange: "",
  idealRole: "",
  mainPain: "",
  expectedOutcome: "",
  preferredChannels: [],
  monthlyLeadGoal: "",
};

const steps = [
  "Negocio",
  "Cliente ideal",
  "Oferta",
  "Canales",
  "Resumen",
];

const channels = ["LinkedIn", "Instagram", "Facebook", "Email", "WhatsApp", "Ads"];

export function IcpWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<GeneratedMaterials | null>(null);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const canAdvance = useMemo(() => {
    if (step === 0) {
      return data.companyName.trim() && data.industry.trim() && data.employeeRange;
    }
    if (step === 1) {
      return data.idealRole.trim() && data.mainPain.trim();
    }
    if (step === 2) {
      return data.expectedOutcome.trim();
    }
    if (step === 3) {
      return data.preferredChannels.length > 0 && data.monthlyLeadGoal;
    }
    return true;
  }, [data, step]);

  const generateMaterials = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/icp/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const apiError = (await response.json()) as { error?: string };
        throw new Error(apiError.error ?? "Error generando materiales.");
      }

      const payload = (await response.json()) as GeneratedMaterials;
      setMaterials(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar materiales."
      );
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (step < steps.length - 1 && canAdvance) {
      setStep((value) => value + 1);
    }
  };

  const back = () => {
    if (step > 0) {
      setStep((value) => value - 1);
    }
  };

  const toggleChannel = (channel: string) => {
    setData((prev) => {
      const exists = prev.preferredChannels.includes(channel);
      return {
        ...prev,
        preferredChannels: exists
          ? prev.preferredChannels.filter((item) => item !== channel)
          : [...prev.preferredChannels, channel],
      };
    });
  };

  return (
    <section id="wizard" className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Wizard ICP</p>
          <h3 className="text-2xl font-semibold text-stone-100">Define tu cliente ideal en minutos</h3>
        </div>
        <span className="rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-300">
          Paso {step + 1}/{steps.length}
        </span>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-stone-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-7 text-sm text-stone-400">{steps[step]}</div>

      {step === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Nombre de empresa
            <input
              className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.companyName}
              onChange={(event) => setData({ ...data, companyName: event.target.value })}
              placeholder="Ej. Credito Negocios"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Industria
            <input
              className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.industry}
              onChange={(event) => setData({ ...data, industry: event.target.value })}
              placeholder="Ej. Servicios financieros"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-300 md:col-span-2">
            Tamano de empresa
            <select
              className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.employeeRange}
              onChange={(event) => setData({ ...data, employeeRange: event.target.value })}
            >
              <option value="">Selecciona una opcion</option>
              <option value="1-10">1 a 10 personas</option>
              <option value="11-50">11 a 50 personas</option>
              <option value="51-200">51 a 200 personas</option>
              <option value="200+">Mas de 200 personas</option>
            </select>
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Rol del comprador ideal
            <input
              className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.idealRole}
              onChange={(event) => setData({ ...data, idealRole: event.target.value })}
              placeholder="Ej. Director comercial"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Dolor principal
            <textarea
              className="min-h-28 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.mainPain}
              onChange={(event) => setData({ ...data, mainPain: event.target.value })}
              placeholder="Ej. Generan leads, pero no convierten por falta de seguimiento"
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Resultado esperado
            <textarea
              className="min-h-28 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.expectedOutcome}
              onChange={(event) => setData({ ...data, expectedOutcome: event.target.value })}
              placeholder="Ej. Multiplicar citas calificadas en 90 dias"
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-sm text-stone-300">Canales prioritarios</p>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => {
                const selected = data.preferredChannels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      selected
                        ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                        : "border-stone-700 bg-stone-900 text-stone-300"
                    }`}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            Meta mensual de leads calificados
            <select
              className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-cyan-300 focus:ring-2"
              value={data.monthlyLeadGoal}
              onChange={(event) => setData({ ...data, monthlyLeadGoal: event.target.value })}
            >
              <option value="">Selecciona una meta</option>
              <option value="10-20">10-20 leads</option>
              <option value="21-50">21-50 leads</option>
              <option value="51-100">51-100 leads</option>
              <option value="100+">100+ leads</option>
            </select>
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
              <p className="mb-2 text-sm font-semibold text-stone-100">Resumen ICP</p>
              <ul className="space-y-2 text-sm text-stone-300">
                <li><strong>Empresa:</strong> {data.companyName}</li>
                <li><strong>Industria:</strong> {data.industry}</li>
                <li><strong>Tamano:</strong> {data.employeeRange}</li>
                <li><strong>Rol:</strong> {data.idealRole}</li>
                <li><strong>Canales:</strong> {data.preferredChannels.join(", ")}</li>
                <li><strong>Meta:</strong> {data.monthlyLeadGoal}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
              <p className="mb-2 text-sm font-semibold text-stone-100">Output de activacion</p>
              <p className="mb-3 text-sm text-stone-400">
                Este output alimenta: mensajes de prospeccion, one-pager comercial y secuencias de seguimiento.
              </p>
              <pre className="overflow-auto rounded-xl bg-stone-950 p-3 text-xs text-teal-200">
{JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-100">Materiales por canal</p>
              <button
                type="button"
                onClick={generateMaterials}
                disabled={loading}
                className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-stone-950 disabled:opacity-50"
              >
                {loading ? "Generando..." : "Generar materiales"}
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-xl border border-rose-700 bg-rose-900/20 p-3 text-sm text-rose-300">
                {error}
              </p>
            )}

            {materials && (
              <div className="mt-4 grid gap-4">
                <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 text-sm text-stone-300">
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-teal-300">Resumen generado</p>
                  {materials.icpSummary}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(materials.channels).map(([channel, item]) => (
                    <article key={channel} className="rounded-xl border border-stone-800 bg-stone-950 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">{channel}</p>
                      <h4 className="mt-2 text-sm font-semibold text-stone-100">{item.headline}</h4>
                      <p className="mt-2 text-sm text-stone-300">{item.message}</p>
                      <p className="mt-2 text-xs text-teal-300">CTA: {item.cta}</p>
                    </article>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <ListCard title="One-pager" items={materials.onePagerOutline} />
                  <ListCard title="Pitch deck" items={materials.pitchDeckOutline} />
                  <ListCard title="Guion de llamada" items={materials.callScript} />
                </div>

                <div className="rounded-xl border border-stone-800 bg-stone-950 p-3">
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-teal-300">Contenido social</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {materials.socialPosts.map((post) => (
                      <article key={`${post.channel}-${post.title}`} className="rounded-lg border border-stone-800 bg-stone-900 p-3">
                        <p className="text-xs text-cyan-300">{post.channel}</p>
                        <p className="mt-1 text-sm font-semibold text-stone-100">{post.title}</p>
                        <p className="mt-2 text-sm text-stone-300">{post.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance || step === steps.length - 1}
          className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-950 p-3">
      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-cyan-300">{title}</p>
      <ul className="space-y-2 text-sm text-stone-300">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
