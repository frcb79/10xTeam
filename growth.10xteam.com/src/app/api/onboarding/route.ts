import { generateDiagnosticReport } from "@/lib/diagnostics/report";
import { z } from "zod";
import {
  actor,
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
  GhlProvisionProvider,
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
    const id = new URL(request.url).searchParams.get("id");
    if (id) z.string().uuid().parse(id);
    return view(await requireSession(a, id ?? undefined), a);
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const command = commandSchema.parse(await readJson(request));
    const a = await actor();
    if (command.action === "open") return view(await openSession(a), a);
    const s = await requireSession(a, command.id);
    const next = await execute(s, a, command, {
      save: saveSession,
      startTrial: process.env.ONBOARDING_TRIAL_ENABLED === "true",
      diagnostic: (draft) => generateDiagnosticReport(draft.answers),
      enabled: enabled(),
      release: snapshotRelease,
      provider: () =>
        new GhlProvisionProvider(
          process.env.GHL_AGENCY_ACCESS_TOKEN ?? "",
          process.env.GHL_COMPANY_ID ?? "",
        ),
    });
    return view(next, a);
  } catch (error) {
    return failure(error);
  }
}
