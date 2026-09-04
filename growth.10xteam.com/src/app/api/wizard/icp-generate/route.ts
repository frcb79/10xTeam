import { NextResponse } from "next/server";
import { generateICPCard } from "@/lib/diagnostics/icp";
import type { WizardAnswers } from "@/types/wizard.types";

interface IcpGenerateRequestBody {
  businessId?: string;
  answers?: WizardAnswers;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IcpGenerateRequestBody;

    if (!body.answers) {
      return NextResponse.json(
        { error: "Missing wizard answers payload." },
        { status: 400 }
      );
    }

    try {
      const result = await generateICPCard(body.answers, body.businessId);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not generate ICP card." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Could not generate ICP card." },
      { status: 500 }
    );
  }
}
