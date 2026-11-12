"use client";
import {
  assetPreview,
  currentConnection,
  services,
  type ServiceId,
} from "@/lib/onboarding/connections";
import { ConnectionForm } from "./ConnectionForm";
import Link from "next/link";
import { useState } from "react";
import { useWizard } from "@/hooks/useWizard";
import { BusinessContextForm } from "./BusinessContextForm";
import type { BusinessContext, ModuleMode } from "@/lib/onboarding/schema";

const labels = {
  crm: "CRM y pipeline",
  forms: "Formulario de captación",
  calendar: "Agenda",
  email: "Correo",
  whatsapp: "WhatsApp",
  social: "Redes sociales",
  payments: "Pasarela de pagos",
  ai: "IA",
};
const modes: Record<ModuleMode, string> = {
  keep: "Conservar",
  connect: "Conectar",
  migrate: "Migrar con revisión",
  create: "Crear",
  defer: "Posponer",
};
const statuses = {
  selected: "Seleccionado",
  waiting_customer: "Acción del titular",
  waiting_provider: "Pendiente de verificación",
  manual_review: "Revisión humana",
  deferred: "Pospuesto",
  tested: "Verificado",
};
const button =
  "rounded-full bg-cyan-300 px-5 py-2.5 font-semibold text-slate-950 disabled:opacity-50";
const panel = "rounded-2xl border border-white/15 bg-slate-950/70 p-5";
export function CompleteScreen() {
  const { state, remote } = useWizard();
  const view = remote.view;
  const s = view?.session;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);
  const task = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo completar la acción.",
      );
    } finally {
      setBusy(false);
    }
  };
  const prepare = async (context: BusinessContext) => {
    setBusy(true);
    try {
      await remote.command("plan", {
        draft: {
          currentStep: 6,
          answers: state.answers,
          websiteUrl: state.websiteUrl,
          context,
        },
      });
      setEdit(false);
    } finally {
      setBusy(false);
    }
  };
  const plan = s?.plan;
  const quickLabPlan = plan?.memory.facts.some(
    (fact) => fact.key === "plan_mode" && fact.value === "qa_quickstart",
  ) ?? false;
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-10 text-stone-100">
      <header>
        {view?.authenticated && (
          <Link
            className="float-right text-cyan-300 underline"
            href="/wizard/businesses"
          >
            Mis negocios
          </Link>
        )}
        <p className="text-sm text-cyan-300">
          {state.answers.step2?.businessName || "10xteam"} · Alta de negocio
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {plan && !edit
            ? "Tu plan de configuración"
            : "Objetivos y continuidad"}
        </h1>
      </header>
      {error && (
        <p role="alert" className="text-amber-200">
          {error}
        </p>
      )}
      {plan?.memory.facts.some((fact) => fact.key === "plan_mode" && fact.value === "qa_quickstart") && (
        <section className={panel} role="note">
          <h2 className="font-semibold">Plan preliminar basado en tu industria</h2>
          <p className="mt-2 text-sm text-stone-300">
            Se utilizaron tus respuestas iniciales y recomendaciones estándar.
            Perfil del comprador, canales, volumen y métricas siguen por confirmar.
            Ninguna configuración, envío ni servicio de pago se activa por mostrar este plan.
          </p>
        </section>
      )}
      {!state.answers.step6 && !plan ? (
        <section className={panel}>
          <p>Completa el diagnóstico para obtener tu plan.</p>
          <Link
            className="text-cyan-300"
            href={"/wizard/step/" + state.currentStep}
          >
            Continuar mi diagnóstico
          </Link>
        </section>
      ) : !view || !plan || edit ? (
        <section className={panel}>
          <BusinessContextForm
            initial={s?.draft.context}
            websiteUrl={state.websiteUrl}
            busy={busy}
            onSubmit={prepare}
          />
        </section>
      ) : (
        <>
          <section className={panel}>
            <h2 className="text-xl font-semibold">Tus prioridades</h2>
            {plan.memory.recommendations.map((r, i) => (
              <article
                key={r.id}
                className="mt-4 border-t border-white/10 pt-3"
              >
                <h3 className="font-semibold">
                  {i + 1}. {r.title}
                </h3>
                <p>{r.rationale}</p>
                <p className="mt-1 text-cyan-100">{r.action}</p>
                <small>Indicador · {r.metric}</small>
              </article>
            ))}
            {s.diagnostic && (
              <a
                className="mt-4 inline-block text-cyan-300 underline"
                href={"/api/diagnostics/" + s.diagnostic.id + "/html"}
                target="_blank"
                rel="noreferrer"
              >
                Abrir diagnóstico completo
              </a>
            )}
          </section>
          <section className={panel}>
            <h2 className="text-xl font-semibold">Cómo trabajará tu negocio</h2>
            <dl className="mt-3 space-y-3">
              {assetPreview(s).map((row) => (
                <div key={row.name}>
                  <dt className="font-semibold">
                    {row.name} · {row.status}
                  </dt>
                  <dd>{row.detail}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4">
              Verificaciones de activación ·{" "}
              {view.readiness.gates.filter((g) => g.passed).length} de{" "}
              {view.readiness.gates.length} aplicables.
            </p>
            <p className="mt-2">Conservaremos {s.draft.context?.preserve}.</p>
            <p className="mt-2">Prueba de entrega · {plan.coreTest}</p>
          </section>
          <section className={panel}>
            <h2 className="text-xl font-semibold">Conexiones y permisos</h2>
            <p className="mt-1 text-sm text-stone-300">
              Elige qué incorporar. Los accesos de terceros se autorizan
              directamente con el proveedor.
            </p>
            <details className="mt-3">
              <summary>Autorización y prueba por servicio</summary>
              <ul className="mt-2 space-y-2">
                {(Object.keys(services) as ServiceId[]).map((id) => {
                  const e = currentConnection(s, id);
                  return (
                    <li key={id}>
                      {services[id][0]} ·{" "}
                      {e
                        ? {
                            authorized: "Autorizado",
                            connected: "Conectado",
                            tested: "Probado",
                            failed: "Revisar",
                            revoked: "Revocado",
                          }[e.state] +
                          " · " +
                          e.at.slice(0, 10) +
                          " · " +
                          e.scopes.join(", ")
                        : "Sin autorización registrada"}{" "}
                      · {services[id][1]}
                    </li>
                  );
                })}
              </ul>
            </details>
            {view.authenticated && s.provision.locationId && (
              <ConnectionForm
                busy={busy}
                verify={false}
                submit={(fields) =>
                  void task(() =>
                    remote.command("connection", {
                      ...fields,
                      locationId: s.provision.locationId,
                      planVersion: plan.version,
                    }),
                  )
                }
              />
            )}
            {plan.modules.map((m) => (
              <div key={m.id} className="mt-4 border-t border-white/10 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    {labels[m.id]}
                    {m.required ? " · indispensable" : ""}
                  </h3>
                  <select
                    aria-label={"Decisión para " + labels[m.id]}
                    className="rounded bg-slate-800 p-2"
                    value={m.mode}
                    disabled={busy || s.provision.createAttempted}
                    onChange={(e) =>
                      void task(() =>
                        remote.command("module", {
                          module: m.id,
                          mode: e.target.value,
                        }),
                      )
                    }
                  >
                    {Object.entries(modes)
                      .filter(([key]) => !m.required || key !== "defer")
                      .map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="text-sm text-stone-300">{m.nextAction}</p>
                <p className="mt-1 text-sm text-cyan-200">
                  {statuses[m.status]}
                  {m.consent ? " · Autorización registrada" : ""}
                </p>
                {view.authenticated &&
                  m.mode !== "defer" &&
                  m.id !== "crm" &&
                  !m.consent && (
                    <button
                      disabled={busy}
                      className="text-sm text-cyan-300 underline"
                      onClick={() =>
                        void task(() =>
                          remote.command("authorize_module", {
                            module: m.id,
                            accepted: true,
                          }),
                        )
                      }
                    >
                      Autorizar preparación sin cargos
                    </button>
                  )}
              </div>
            ))}
          </section>
          {!view.authenticated && (
            <section className={panel}>
              <h2 className="font-semibold">Vincula el registro a tu cuenta</h2>
              <p className="text-sm">
                Usa el acceso que recibiste al contratar. Podrás retomar el alta
                en otro dispositivo.
              </p>
              <form
                className="mt-3 flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  void task(async () => {
                    const res = await fetch("/api/onboarding/auth", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: form.get("email"),
                        password: form.get("password"),
                      }),
                    });
                    if (!res.ok) throw new Error((await res.json()).error);
                    window.location.reload();
                  });
                }}
              >
                <input
                  className="rounded bg-slate-800 p-2"
                  name="email"
                  aria-label="Correo de acceso"
                  placeholder="Correo de acceso"
                  type="email"
                  autoComplete="username"
                  required
                />
                <input
                  className="rounded bg-slate-800 p-2"
                  name="password"
                  aria-label="Contraseña"
                  placeholder="Contraseña"
                  type="password"
                  autoComplete="current-password"
                  required
                />
                <button className={button} disabled={busy}>
                  Iniciar sesión
                </button>
              </form>
            </section>
          )}
          <section className={panel}>
            <h2 className="text-xl font-semibold">Estado del alta</h2>
            <p>
              {s.functional_ready_at && view.readiness.ready
                ? "Negocio listo para operar"
                : s.provision.status === "configured"
                  ? "Configuración aplicada. Falta completar o registrar las pruebas de entrega."
                  : "Configuración pendiente"}
            </p>
            <p className="text-sm">
              {view.readiness.gates.filter((g) => g.passed).length} de{" "}
              {view.readiness.gates.length} verificaciones superadas.
            </p>
            {s.provision.lastError && <p>{s.provision.lastError}</p>}
            {view.authenticated &&
              !plan.modules.find((m) => m.id === "crm")?.consent && (
                <button
                  disabled={busy}
                  className={button}
                  onClick={() =>
                    void task(() =>
                      remote.command("approve_core", { accepted: true }),
                    )
                  }
                >
                  {quickLabPlan
                    ? "Autorizar preparación del CRM en Consultoría LAB, sin crear otra cuenta ni contratar servicios"
                    : "Autorizar alta de cuenta y plantilla sin servicios de pago"}
                </button>
              )}
            {view.authenticated &&
              view.executionEnabled &&
              plan.modules.find((m) => m.id === "crm")?.consent &&
              s.provision.status !== "configured" && (
                <button
                  className={button}
                  disabled={busy}
                  onClick={() => void task(() => remote.command("provision"))}
                >
                  Aplicar y verificar mi configuración
                </button>
              )}
            {s.provision.locationId && view.authenticated && (
              <button
                className="ml-3 text-cyan-300 underline"
                disabled={busy}
                onClick={() =>
                  void task(async () => {
                    const r = await fetch("/api/ghl/oauth/start", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: s.id }),
                    });
                    const v = await r.json();
                    if (!r.ok) throw new Error(v.error);
                    window.location.assign(v.url);
                  })
                }
              >
                Autorizar acceso a mi cuenta configurada
              </button>
            )}
          </section>
          <section className={panel}>
            <h2 className="font-semibold">Primeros pasos y ayuda</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Revisa las prioridades y los activos que quieres conservar.
              </li>
              <li>
                Completa las autorizaciones indispensables y la prueba de
                entrega con tu responsable de alta.
              </li>
              <li>
                Revisa {plan.kpis[0]?.toLowerCase()} tras la primera semana y
                registra el resultado.
              </li>
            </ol>
            <details className="mt-3">
              <summary>¿Por qué un canal sigue pendiente?</summary>Una
              autorización permite preparar la conexión. El titular concede
              permisos en el proveedor y el equipo comprueba el resultado antes
              de marcarlo verificado. Si necesitas ayuda, comparte con tu
              responsable esta referencia: {s.id}.
            </details>
            {!s.provision.createAttempted && state.answers.step6 && (
              <button
                className="mt-3 text-cyan-300 underline"
                onClick={() => setEdit(true)}
              >
                Corregir objetivos y regenerar plan
              </button>
            )}
          </section>
        </>
      )}
    </main>
  );
}
