"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TeamAccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nextPath = useMemo(() => {
    const requested = searchParams.get("next");
    if (!requested || !requested.startsWith("/team")) return "/team/diagnosticos";
    return requested;
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "No fue posible validar acceso interno.");
        setLoading(false);
        return;
      }

      router.replace(nextPath);
    } catch {
      setError("No fue posible validar acceso interno.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-xl px-5 py-12 md:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Acceso interno</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-50">Panel de dueños y equipo</h1>
        <p className="mt-3 text-sm text-stone-300">
          Ingresa el passcode interno para abrir la vista completa de diagnósticos.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-stone-300">
            Passcode interno
            <input
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-100 outline-none focus:border-cyan-300/60"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Validando..." : "Entrar al panel interno"}
          </button>
        </form>
      </div>
    </div>
  );
}
