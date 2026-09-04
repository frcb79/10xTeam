import { NextResponse } from "next/server";
import { renderDiagnosticHtml } from "@/lib/diagnostics/html";
import { findDiagnosticRecordById } from "@/lib/diagnostics/repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const diagnostic = await findDiagnosticRecordById(id);
  if (!diagnostic?.report) return new NextResponse("Diagnostic report not found.", { status: 404 });

  const html = await renderDiagnosticHtml(diagnostic.report);
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" },
  });
}