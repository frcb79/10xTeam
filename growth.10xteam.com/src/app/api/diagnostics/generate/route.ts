import { NextResponse } from "next/server";
import { generateDiagnosticReport } from "@/lib/diagnostics/report";
import type { GeneratedOutputs, WizardAnswers } from "@/types/wizard.types";

interface GenerateDiagnosticBody {
  answers?: WizardAnswers;
  businessId?: string;
  generatedOutputs?: GeneratedOutputs | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateDiagnosticBody;
    if (!body.answers) return NextResponse.json({ error: "Wizard answers are required." }, { status: 400 });

    const diagnostic = await generateDiagnosticReport(body.answers, body.businessId, body.generatedOutputs);
    return NextResponse.json({ diagnostic, diagnosticId: diagnostic.id, htmlUrl: `/api/diagnostics/${diagnostic.id}/html` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate diagnostic report." },
      { status: 500 },
    );
  }
}