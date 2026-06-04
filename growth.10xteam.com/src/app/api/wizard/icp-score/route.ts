import { NextResponse } from "next/server";
import { calculateLocalICPScore } from "@/lib/utils/icp-score";
import type { WizardAnswers } from "@/types/wizard.types";

interface ScoreRequestBody {
  answers?: WizardAnswers;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScoreRequestBody;

    if (!body.answers) {
      return NextResponse.json(
        { error: "Missing wizard answers payload." },
        { status: 400 }
      );
    }

    const score = calculateLocalICPScore(body.answers);

    return NextResponse.json({ score });
  } catch {
    return NextResponse.json(
      { error: "Could not calculate ICP score." },
      { status: 500 }
    );
  }
}
