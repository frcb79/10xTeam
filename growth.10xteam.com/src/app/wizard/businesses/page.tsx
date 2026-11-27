"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
export default function BusinessPicker() {
  const [rows, setRows] = useState<
    Array<{ id: string; businessName: string | null }>
  >([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const key = useRef("");
  useEffect(() => {
    void fetch("/api/onboarding/businesses")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw Error(j.error);
        setRows(j.businesses);
      })
      .catch((e) => setError(e.message));
  }, []);
  async function select(action: string, id: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/onboarding/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      window.location.assign("/wizard");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo seleccionar el negocio.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-xl space-y-4 p-8 text-stone-100">
      <h1 className="text-2xl font-semibold">Mis negocios</h1>
      {rows.map((r) => (
        <button
          key={r.id}
          className="block text-cyan-300 underline"
          disabled={busy}
          onClick={() => void select("select", r.id)}
        >
          {r.businessName || "Registro en curso"}
        </button>
      ))}
      {rows.length > 0 && (
        <button
          className="rounded-full border px-4 py-2"
          disabled={busy}
          onClick={() => {
            key.current ||= crypto.randomUUID();
            void select("create", key.current);
          }}
        >
          Iniciar registro de otro negocio
        </button>
      )}
      {error && (
        <p role="alert">
          {error} <Link href="/wizard/access">Iniciar sesión</Link>
        </p>
      )}
      <button
        className="block text-sm underline"
        onClick={async () => {
          const r = await fetch("/api/onboarding/auth", { method: "DELETE" });
          if (r.ok) window.location.assign("/wizard/access");
          else setError("No se pudo cerrar la sesión.");
        }}
      >
        Cerrar sesión
      </button>
    </main>
  );
}
