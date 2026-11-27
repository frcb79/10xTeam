import { cookies } from "next/headers";
import { z } from "zod";
import {
  actor,
  db,
  cookieOptions,
  requireSession,
} from "@/lib/onboarding/store";
import { emptyDraft } from "@/lib/onboarding/schema";
import { HttpError, readJson, sameOrigin } from "@/lib/onboarding/security";
import { json, failure } from "@/lib/onboarding/http";
export async function GET() {
  try {
    const a = await actor();
    if (!a.userId) throw new HttpError(401, "Inicia sesión.");
    const { data, error } = await db()
      .from("onboarding_sessions")
      .select("id,businessName:draft->answers->step2->>businessName,updated_at")
      .eq("owner_user_id", a.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new HttpError(503, "No se pudieron cargar tus negocios.");
    return json({ businesses: data });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const a = await actor();
    if (!a.userId) throw new HttpError(401, "Inicia sesión.");
    const { action, id } = z
      .object({ action: z.enum(["create", "select"]), id: z.string().uuid() })
      .strict()
      .parse(await readJson(request, 1000));
    if (action === "create") {
      const { error } = await db()
        .from("onboarding_sessions")
        .insert({ id, owner_user_id: a.userId, draft: emptyDraft });
      if (error && error.code !== "23505")
        throw new HttpError(503, "No se pudo crear el registro.");
    }
    const s = await requireSession(a, id);
    if (s.owner_user_id !== a.userId)
      throw new HttpError(403, "Acceso denegado.");
    (await cookies()).set("10x_selected_ba", s.id, cookieOptions);
    return json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
