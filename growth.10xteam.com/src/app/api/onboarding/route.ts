import { strategicRecord } from "@/lib/onboarding/strategy";
import { z } from "zod";
import {
  actor,
  actorForSession,
  openSession,
  requireSession,
  saveSession,
  publicSession,
} from "@/lib/onboarding/store";
import { commandSchema } from "@/lib/onboarding/commands";
import { execute } from "@/lib/onboarding/actions";
import {
  readiness,
  type Actor,
  type OnboardingSession,
} from "@/lib/onboarding/model";
import { readJson, sameOrigin } from "@/lib/onboarding/security";
import { failure, json } from "@/lib/onboarding/http";
import {
  configuredProvider,
  snapshotRelease,
} from "@/lib/ghl/provision-provider";

export const maxDuration = 60;
const enabled = () => process.env.GHL_PROVISIONING_ENABLED === "true";
function view(s: OnboardingSession, a: Actor) {
  return json({
    session: publicSession(s),
    readiness: readiness(s),
    operator: a.operator,
    authenticated: Boolean(a.userId),
    executionEnabled: enabled(),
  });
}
export async function GET(request: Request) {
  try {
    const a = await actor();
    const params = new URL(request.url).searchParams;
    if (params.has("businessId")) return json({ error: "Usa el identificador del registro de alta." }, 400);
    const id = params.get("id");
    if (id) z.string().uuid().parse(id);
    const s = await requireSession(a, id ?? undefined);
    return view(s, await actorForSession(a, s.id));
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const command = commandSchema.parse(await readJson(request));
    const a = await actor();
    if (command.action === "open") {
      const s = await openSession(a);
      return view(s, await actorForSession(a, s.id));
    }
    const s = await requireSession(a, command.id);
    const scoped = await actorForSession(a, s.id);
    const next = await execute(s, scoped, command, {
      save: saveSession,
      startTrial: process.env.ONBOARDING_TRIAL_ENABLED === "true",
      diagnostic: async (draft) => strategicRecord(draft),
      enabled: enabled(),
      release: snapshotRelease,
      provider: configuredProvider,
    });
    return view(next, scoped);
  } catch (error) {
    return failure(error);
  }
}
