import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/service";
import { emptyDraft } from "./schema";
import { ownsSession, type Actor, type OnboardingSession } from "./model";
import { hash, HttpError } from "./security";
import { scopeReviewer } from "./reviewer";

const COOKIE = "10x_onboarding_v1";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
export function db() {
  const client = createServiceClient();
  if (!client)
    throw new HttpError(
      503,
      "El guardado seguro no está disponible. Tus respuestas locales se conservan; intenta más tarde.",
    );
  return client;
}
export async function authClient() {
  const jar = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new HttpError(
      503,
      "El acceso requiere configurar el servicio de cuentas.",
    );
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value, options }) =>
          jar.set(name, value, options),
        );
      },
    },
  });
}
export async function actor(): Promise<Actor> {
  let userId: string | null = null;
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const client = await authClient();
    const { data } = await client.auth.getUser();
    userId = data.user?.id ?? null;
  }
  const raw = (await cookies()).get(COOKIE)?.value;
  return {
    userId,
    guestHash: raw ? hash(raw) : null,
    operator: Boolean(
      userId &&
        (process.env.ONBOARDING_OPERATOR_USER_IDS ?? "")
          .split(",")
          .map((v) => v.trim())
          .includes(userId),
    ),
  };
}
export async function getSession(
  a: Actor,
  id?: string,
): Promise<OnboardingSession | null> {
  const selectedId =
    id ??
    (a.userId ? (await cookies()).get("10x_selected_ba")?.value : undefined);
  if (!a.userId && !a.guestHash) return null;
  let query = db().from("onboarding_sessions").select("*");
  if (selectedId) query = query.eq("id", selectedId);
  if (a.userId) query = query.eq("owner_user_id", a.userId);
  else query = query.eq("guest_hash", a.guestHash!).is("owner_user_id", null);
  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new HttpError(503, "No se pudo consultar tu registro.");
  if (data && ownsSession(a, data)) return data as OnboardingSession;
  if (id && a.operator && a.userId) {
    const reviewer = await db()
      .from("onboarding_reviewers")
      .select("session_id")
      .eq("session_id", id)
      .eq("user_id", a.userId)
      .maybeSingle();
    if (reviewer.data) {
      const assigned = await db()
        .from("onboarding_sessions")
        .select("*")
        .eq("id", id)
        .single();
      if (assigned.error)
        throw new HttpError(503, "No se pudo consultar el registro asignado.");
      return assigned.data as OnboardingSession;
    }
  }
  return null;
}
export async function actorForSession(a: Actor, sessionId: string) {
  return scopeReviewer(a, sessionId, async (id, userId) => {
    const { data, error } = await db()
      .from("onboarding_reviewers")
      .select("session_id,user_id")
      .eq("session_id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new HttpError(503, "No se pudo verificar la asignación del operador.");
    return data;
  });
}
export async function requireSession(a: Actor, id?: string) {
  const s = await getSession(a, id);
  if (!s) throw new HttpError(404, "No encontramos un registro accesible.");
  return s;
}
export async function openSession(a: Actor) {
  // Claim a guest only during an explicit login (proof of possession + authenticated identity).
  if (
    a.userId &&
    a.guestHash &&
    (await cookies()).get("10x_claim_draft")?.value === "yes"
  ) {
    const guest = await getSession({
      userId: null,
      guestHash: a.guestHash,
      operator: false,
    });
    if (guest && guest.draft.answers.step2) {
      const claimed = await saveSession(
        guest,
        { owner_user_id: a.userId, guest_hash: null },
        "claimed",
        a.userId,
      );
      const jar = await cookies();
      jar.delete(COOKIE);
      jar.delete("10x_claim_draft");
      jar.set("10x_selected_ba", claimed.id, cookieOptions);
      return claimed;
    }
  }
  const existing = await getSession(a);
  if (existing) return existing;
  const raw = randomBytes(32).toString("base64url");
  const { data, error } = await db()
    .from("onboarding_sessions")
    .insert({
      owner_user_id: a.userId,
      guest_hash: a.userId ? null : hash(raw),
      draft: emptyDraft,
    })
    .select("*")
    .single();
  if (error || !data)
    throw new HttpError(503, "No se pudo abrir un registro seguro.");
  if (!a.userId) (await cookies()).set(COOKIE, raw, cookieOptions);
  else (await cookies()).set("10x_selected_ba", data.id, cookieOptions);
  return data as OnboardingSession;
}
export async function saveSession(
  s: OnboardingSession,
  patch: Partial<
    Pick<
      OnboardingSession,
      | "draft"
      | "plan"
      | "diagnostic"
      | "provision"
      | "evidence"
      | "functional_ready_at"
      | "owner_user_id"
      | "guest_hash"
    >
  >,
  event: string,
  actorId: string,
) {
  const { data, error } = await db().rpc("save_onboarding", {
    p_id: s.id,
    p_version: s.version,
    p_patch: patch,
    p_event: event,
    p_actor: actorId,
  });
  if (error?.message.includes("version_conflict"))
    throw new HttpError(
      409,
      "El registro cambió en otra ventana. Recarga para continuar sin sobrescribirlo.",
    );
  if (error || !data)
    throw new HttpError(
      503,
      "No se pudo guardar. Conserva esta pantalla y vuelve a intentar.",
    );
  return data as OnboardingSession;
}
export function publicSession(s: OnboardingSession) {
  const { guest_hash: _secret, ...safe } = s;
  void _secret;
  return safe;
}
