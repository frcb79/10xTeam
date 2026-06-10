"use client";

import { useMemo, useState } from "react";
import { useWizard } from "@/hooks/useWizard";
import type { ChannelConfig, ContentFormat, CustomFlow, FunnelFlow } from "@/types/wizard.types";

const CHANNELS: Array<{ value: ChannelConfig["channel"]; label: string; description: string }> = [
  { value: "linkedin", label: "LinkedIn", description: "Prospección y autoridad B2B" },
  { value: "instagram", label: "Instagram", description: "Contenido visual y cercanía" },
  { value: "facebook", label: "Facebook", description: "Comunidad y remarketing" },
  { value: "email", label: "Correo", description: "Seguimiento y nutrición" },
  { value: "whatsapp", label: "WhatsApp", description: "Cierre y acompañamiento" },
  { value: "youtube", label: "YouTube", description: "Prueba y contenido largo" },
  { value: "tiktok", label: "TikTok", description: "Alcance y descubrimiento" },
  { value: "twitter", label: "X / Twitter", description: "Opinión y conversación" },
];

const CONTACT_METHODS: Array<{ value: ChannelConfig["channel"]; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "email", label: "Correo" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "X / Twitter" },
];

const FLOW_OPTIONS: Array<{ value: FunnelFlow; label: string; description: string }> = [
  { value: "cold_prospect", label: "Prospecto frío", description: "Primera toma de contacto" },
  { value: "warm_prospect", label: "Prospecto tibio", description: "Ya conoce la marca" },
  { value: "referral", label: "Referencia", description: "Llegó recomendado" },
  { value: "info_requested_no_response", label: "Pidió info y desapareció", description: "Seguimiento de reactivación" },
  { value: "proposal_seen_disappeared", label: "Vio propuesta y no respondió", description: "Retomar la conversación" },
  { value: "attended_demo", label: "Vio demo", description: "Ya conoce la solución" },
  { value: "has_objections", label: "Tiene objeciones", description: "Precio, tiempo, confianza" },
  { value: "ready_to_close", label: "Listo para cerrar", description: "Momento de decisión" },
  { value: "new_client", label: "Cliente nuevo", description: "Arranque y onboarding" },
  { value: "active_client", label: "Cliente activo", description: "Retención y expansión" },
  { value: "at_risk_client", label: "Cliente en riesgo", description: "Necesita intervención" },
  { value: "wants_to_cancel", label: "Quiere cancelar", description: "Salvar o cerrar bien" },
  { value: "churned_client", label: "Cliente perdido", description: "Win-back" },
  { value: "referral_program", label: "Programa de referidos", description: "Crecimiento por recomendación" },
  { value: "custom", label: "Etapa personalizada", description: "Tu negocio tiene una etapa propia" },
];

export function Step5Channels() {
  const { state, updateStep5, goPrev, goNext } = useWizard();
  const current = state.answers.step5;
  const initialCustomChannels = (current?.activeChannels ?? [])
    .filter((channel) => channel.channel === "custom" && channel.customName)
    .map((channel) => channel.customName as string);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    current?.activeChannels
      ?.filter((channel) => channel.channel !== "custom")
      .map((channel) => channel.channel) ?? ["linkedin", "whatsapp"]
  );
  const [customChannels, setCustomChannels] = useState<string[]>(initialCustomChannels);
  const [customChannelInput, setCustomChannelInput] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<ChannelConfig["channel"]>(
    current?.preferredContactMethod ?? "whatsapp"
  );
  const [selectedFlows, setSelectedFlows] = useState<FunnelFlow[]>(current?.selectedFlows ?? ["cold_prospect"]);
  const [customFlows, setCustomFlows] = useState<CustomFlow[]>(current?.customFlows ?? []);
  const [customFlowName, setCustomFlowName] = useState("");
  const [customFlowDescription, setCustomFlowDescription] = useState("");
  const [customFlowStage, setCustomFlowStage] = useState("");
  const [customFlowGoal, setCustomFlowGoal] = useState("");

  const valid = useMemo(
    () => selectedChannels.length + customChannels.length > 0 && selectedFlows.length > 0,
    [selectedChannels, customChannels, selectedFlows]
  );

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((item) => item !== channel) : [...prev, channel]
    );
  };

  const toggleFlow = (flow: FunnelFlow) => {
    setSelectedFlows((prev) =>
      prev.includes(flow) ? prev.filter((item) => item !== flow) : [...prev, flow]
    );
  };

  const addCustomFlow = () => {
    if (!customFlowName.trim() || !customFlowDescription.trim() || !customFlowStage.trim() || !customFlowGoal.trim()) {
      return;
    }

    setCustomFlows((prev) => [
      ...prev,
      {
        name: customFlowName.trim(),
        description: customFlowDescription.trim(),
        contactStage: customFlowStage.trim(),
        goalWithMaterials: customFlowGoal.trim(),
      },
    ]);

    setCustomFlowName("");
    setCustomFlowDescription("");
    setCustomFlowStage("");
    setCustomFlowGoal("");
    setSelectedFlows((prev) => (prev.includes("custom") ? prev : [...prev, "custom"]));
  };

  const addCustomChannel = () => {
    const value = customChannelInput.trim();
    if (!value) return;
    if (customChannels.some((channel) => channel.toLowerCase() === value.toLowerCase())) return;
    setCustomChannels((prev) => [...prev, value]);
    setCustomChannelInput("");
  };

  const removeCustomChannel = (channelName: string) => {
    setCustomChannels((prev) => prev.filter((item) => item !== channelName));
  };

  const handleContinue = () => {
    if (!valid) return;

    updateStep5({
      activeChannels: [
        ...selectedChannels.map((channel) => ({
          channel: channel as ChannelConfig["channel"],
          activityLevel: "medium" as const,
          useForProspecting: true,
          useForContent: true,
        })),
        ...customChannels.map((channel) => ({
          channel: "custom" as const,
          customName: channel,
          activityLevel: "medium" as const,
          useForProspecting: true,
          useForContent: true,
        })),
      ],
      preferredContactMethod,
      contentFormats: ["text" as ContentFormat],
      selectedFlows,
      customFlows,
    });
    goNext();
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Paso 5 · Canales y flujos</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-50">Define dónde opera el sistema y cómo avanza tu cliente</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
        Aquí elegimos los canales prioritarios, el canal principal de contacto y las etapas reales de tu proceso comercial.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="mb-3 text-sm font-medium text-stone-100">Canales prioritarios</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CHANNELS.map((channel) => {
              const active = selectedChannels.includes(channel.value);
              return (
                <button
                  key={channel.value}
                  type="button"
                  onClick={() => toggleChannel(channel.value)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${active ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/5 text-stone-300"}`}
                >
                  <div className="text-sm font-semibold">{channel.label}</div>
                  <div className="mt-1 text-xs text-stone-400">{channel.description}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">Agregar canal prioritario</p>
            <div className="mt-3 flex gap-2">
              <input
                value={customChannelInput}
                onChange={(event) => setCustomChannelInput(event.target.value)}
                placeholder="Ej. Telegram o Llamada telefónica"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-stone-100 outline-none focus:border-cyan-300/60"
              />
              <button
                type="button"
                onClick={addCustomChannel}
                className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100"
              >
                Agregar
              </button>
            </div>

            {customChannels.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {customChannels.map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => removeCustomChannel(channel)}
                    className="rounded-full border border-teal-300/40 bg-teal-300/10 px-3 py-1 text-xs text-teal-100"
                  >
                    {channel} ×
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="mb-3 text-sm font-medium text-stone-100">Canal preferido de contacto</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CONTACT_METHODS.map((method) => {
              const active = preferredContactMethod === method.value;
              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPreferredContactMethod(method.value)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${active ? "border-teal-300/70 bg-teal-300/10 text-teal-100" : "border-white/10 bg-white/5 text-stone-300"}`}
                >
                  <div className="text-sm font-semibold">{method.label}</div>
                  <div className="mt-1 text-xs text-stone-400">El canal que más facilita la respuesta</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 xl:col-span-2">
          <p className="mb-3 text-sm font-medium text-stone-100">Flujos de ventas y etapas del negocio</p>
          <p className="mb-4 text-xs text-stone-400">
            Selecciona las etapas que ya existen en tu negocio. También puedes agregar una etapa personalizada propia.
          </p>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {FLOW_OPTIONS.map((flow) => {
              const active = selectedFlows.includes(flow.value);
              return (
                <button
                  key={flow.value}
                  type="button"
                  onClick={() => toggleFlow(flow.value)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${active ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/5 text-stone-300"}`}
                >
                  <div className="text-sm font-semibold">{flow.label}</div>
                  <div className="mt-1 text-xs text-stone-400">{flow.description}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-stone-100">Agregar etapa personalizada</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={customFlowName} onChange={(event) => setCustomFlowName(event.target.value)} placeholder="Nombre de la etapa" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" />
              <input value={customFlowStage} onChange={(event) => setCustomFlowStage(event.target.value)} placeholder="Ej. después de demo" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60" />
              <textarea value={customFlowDescription} onChange={(event) => setCustomFlowDescription(event.target.value)} placeholder="Describe qué pasa en esta etapa" className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60 md:col-span-1" />
              <textarea value={customFlowGoal} onChange={(event) => setCustomFlowGoal(event.target.value)} placeholder="Qué debe hacer el documento o material aquí" className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60 md:col-span-1" />
            </div>
            <button type="button" onClick={addCustomFlow} className="mt-4 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
              Agregar etapa
            </button>
          </div>

          {customFlows.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {customFlows.map((flow) => (
                <article key={`${flow.name}-${flow.contactStage}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-stone-50">{flow.name}</p>
                  <p className="mt-1 text-xs text-stone-400">{flow.contactStage}</p>
                  <p className="mt-2 text-sm text-stone-300">{flow.description}</p>
                  <p className="mt-2 text-xs text-teal-200">Sirve para: {flow.goalWithMaterials}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={goPrev} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-stone-200">Atrás</button>
        <button type="button" onClick={handleContinue} disabled={!valid} className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-50">Continuar a economia</button>
      </div>
    </div>
  );
}
