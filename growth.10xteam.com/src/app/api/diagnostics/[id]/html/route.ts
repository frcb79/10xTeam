import { renderDiagnosticHtml } from "@/lib/diagnostics/html";
import { actor, requireSession } from "@/lib/onboarding/store";
import { failure } from "@/lib/onboarding/http";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { diagnostic } = await requireSession(await actor());
    if (diagnostic?.id !== id || !diagnostic.report)
      return new Response("No encontrado.", { status: 404 });
    return new Response(await renderDiagnosticHtml(diagnostic.report), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Content-Security-Policy":
          "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data: 'self'; base-uri 'none'; form-action 'none'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return failure(error);
  }
}
