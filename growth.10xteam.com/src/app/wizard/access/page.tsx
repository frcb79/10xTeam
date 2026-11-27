"use client";
import { useState } from "react";
export default function ResumeLogin() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="mx-auto max-w-lg space-y-5 px-6 py-16 text-stone-100">
      <h1 className="text-3xl font-semibold">Retomar mi registro</h1>
      <p>Inicia sesión con el acceso que recibiste de 10xteam.</p>
      <form
        className="grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setBusy(true);
          try {
            const response = await fetch("/api/onboarding/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(Object.fromEntries(form)),
            });
            if (!response.ok) throw new Error((await response.json()).error);
            window.location.assign("/wizard");
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "No se pudo iniciar sesión.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Correo
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="block w-full rounded bg-slate-800 p-3"
          />
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="block w-full rounded bg-slate-800 p-3"
          />
        </label>
        <button
          className="rounded-full bg-cyan-300 px-5 py-3 text-slate-950"
          disabled={busy}
        >
          Continuar
        </button>
        {message && <p role="alert">{message}</p>}
      </form>
    </main>
  );
}
