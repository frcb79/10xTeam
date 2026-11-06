import { generateDiagnosticReport } from "@/lib/diagnostics/report";
import { actor, requireSession, saveSession } from "@/lib/onboarding/store";
import { requireCompleteAnswers } from "@/lib/onboarding/schema";
import { sameOrigin } from "@/lib/onboarding/security";
import { failure, json } from "@/lib/onboarding/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const a = await actor();
    const s = await requireSession(a);
    const record =
      s.diagnostic ??
      (await generateDiagnosticReport(requireCompleteAnswers(s.draft.answers)));
    if (!s.diagnostic)
      await saveSession(
        s,
        { diagnostic: record },
        "diagnostic_generated",
        a.userId ?? "guest:" + s.id,
      );
    return json({
      diagnostic: record,
      diagnosticId: record.id,
      htmlUrl: "/api/diagnostics/" + record.id + "/html",
    });
  } catch (error) {
    return failure(error);
  }
}
