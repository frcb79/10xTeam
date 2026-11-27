import { z } from "zod";
import { actor, requireSession, saveSession } from "@/lib/onboarding/store";
import { json, failure } from "@/lib/onboarding/http";
import { HttpError, readJson, sameOrigin } from "@/lib/onboarding/security";
export async function GET(request: Request) {
  try {
    const s = await requireSession(await actor());
    const id = new URL(request.url).searchParams.get("diagnosticId");
    if (id && id !== s.diagnostic?.id)
      throw new HttpError(404, "Diagnóstico no encontrado.");
    return json({ diagnostic: s.diagnostic });
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const a = await actor();
    const s = await requireSession(a);
    const body = z
      .object({ status: z.literal("call_pending"), diagnosticId: z.string() })
      .strict()
      .parse(await readJson(request));
    if (!s.diagnostic || s.diagnostic.id !== body.diagnosticId)
      throw new HttpError(404, "Diagnóstico no encontrado.");
    const next = await saveSession(
      s,
      { diagnostic: { ...s.diagnostic, status: body.status } },
      "call_requested",
      a.userId ?? "guest:" + s.id,
    );
    return json({ diagnostic: next.diagnostic });
  } catch (error) {
    return failure(error);
  }
}
export async function POST() {
  return json({ error: "Genera el diagnóstico desde tu registro." }, 405);
}
