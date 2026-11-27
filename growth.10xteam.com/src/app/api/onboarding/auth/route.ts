import { z } from "zod";
import { cookies } from "next/headers";
import { authClient, cookieOptions } from "@/lib/onboarding/store";
import { HttpError, readJson, sameOrigin } from "@/lib/onboarding/security";
import { failure, json } from "@/lib/onboarding/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { email, password } = z
      .object({
        email: z.string().email().max(254),
        password: z.string().min(1).max(200),
      })
      .strict()
      .parse(await readJson(request, 2000));
    const { error } = await (
      await authClient()
    ).auth.signInWithPassword({ email, password });
    if (error)
      throw new HttpError(
        401,
        "Verifica tu acceso o contacta al equipo de alta.",
      );
    (await cookies()).delete("10x_selected_ba");
    (await cookies()).set("10x_claim_draft", "yes", {
      ...cookieOptions,
      maxAge: 60,
    });
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    await (await authClient()).auth.signOut();
    (await cookies()).delete("10x_onboarding_v1");
    (await cookies()).delete("10x_selected_ba");
    (await cookies()).delete("10x_claim_draft");
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
