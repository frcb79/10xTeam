"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OnboardingSession, readiness } from "@/lib/onboarding/model";
import type { OnboardingDraft } from "@/lib/onboarding/schema";

export type SessionView = {
  session: Omit<OnboardingSession, "guest_hash">;
  readiness: ReturnType<typeof readiness>;
  authenticated: boolean;
  operator: boolean;
  executionEnabled: boolean;
};
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v).sort(([a], [b]) => a.localeCompare(b)),
        )
      : v,
  );
}
export async function sendCommand(body: object): Promise<SessionView> {
  const response = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      [
        result.error,
        ...(result.fields ?? [])
          .slice(0, 4)
          .map(
            (f: { field: string; message: string }) =>
              f.field + " · " + f.message,
          ),
      ]
        .filter(Boolean)
        .join(" "),
    );
  return result;
}
export function useOnboardingSession(
  onRestore: (draft: OnboardingDraft) => void,
) {
  const [view, setView] = useState<SessionView | null>(null);
  const [message, setMessage] = useState("");
  const current = useRef<SessionView | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const opened = useRef<Promise<SessionView> | null>(null);
  const apply = useCallback((result: SessionView) => {
    current.current = result;
    setView(result);
    setMessage("");
    return result;
  }, []);
  const open = useCallback(async () => {
    opened.current ??= sendCommand({ action: "open" }).catch((error) => {
      opened.current = null;
      throw error;
    });
    return apply(await opened.current);
  }, [apply]);
  useEffect(() => {
    let active = true;
    void open()
      .then((result) => {
        if (active) onRestore(result.session.draft);
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      });
    return () => {
      active = false;
    };
  }, [open, onRestore]);
  const command = useCallback(
    (action: string, fields: Record<string, unknown> = {}) => {
      const run = async () => {
        const previous = current.current ?? (await open());
        const result = await sendCommand({
          action,
          id: previous.session.id,
          version: previous.session.version,
          ...fields,
        });
        return apply(result);
      };
      const work = queue.current.then(run);
      queue.current = work.catch((error) => {
        setMessage(error.message);
      });
      return work;
    },
    [open, apply],
  );
  const saveDraft = useCallback(
    async (draft: OnboardingDraft) => {
      const previous = current.current;
      if (
        previous?.session.provision.createAttempted ||
        canonical(previous?.session.draft) === canonical(draft)
      )
        return previous;
      return command("save", { draft, autosave: true });
    },
    [command],
  );
  const retry = async (wasHydrated: boolean) => {
    try {
      await queue.current;
      const previous = current.current;
      const fresh = await sendCommand({ action: "open" });
      if (
        previous &&
        (fresh.session.id !== previous.session.id ||
          fresh.session.version !== previous.session.version)
      ) {
        setMessage(
          "El registro cambió en otra sesión. Copia tus cambios pendientes antes de recargar.",
        );
        return;
      }
      apply(fresh);
      if (!wasHydrated) onRestore(fresh.session.draft);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "No se pudo recuperar el registro.",
      );
    }
  };
  return { view, message, command, saveDraft, open, retry };
}
