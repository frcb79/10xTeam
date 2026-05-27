import { NextResponse } from "next/server";
import { generateIcpMaterials } from "@/lib/icp-materials";
import type { WizardData } from "@/types/icp";

function isValidPayload(payload: Partial<WizardData>): payload is WizardData {
  return Boolean(
    payload.companyName &&
      payload.industry &&
      payload.employeeRange &&
      payload.idealRole &&
      payload.mainPain &&
      payload.expectedOutcome &&
      payload.monthlyLeadGoal &&
      Array.isArray(payload.preferredChannels) &&
      payload.preferredChannels.length > 0
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<WizardData>;

    if (!isValidPayload(payload)) {
      return NextResponse.json(
        { error: "Datos incompletos para generar materiales." },
        { status: 400 }
      );
    }

    const materials = generateIcpMaterials(payload);
    return NextResponse.json(materials);
  } catch {
    return NextResponse.json(
      { error: "No fue posible procesar el wizard en este momento." },
      { status: 500 }
    );
  }
}
