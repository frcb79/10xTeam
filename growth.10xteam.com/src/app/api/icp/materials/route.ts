import { NextResponse } from "next/server";
import { generateIcpMaterials } from "@/lib/icp-materials";
import type { WizardData } from "@/types/icp";
import type { ICPCard } from "@/types/wizard.types";

interface MaterialsRequestBody {
  wizardData?: Partial<WizardData>;
  icpCard?: ICPCard | null;
}

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
    const body = (await request.json()) as MaterialsRequestBody | Partial<WizardData>;
    const payload = "wizardData" in body ? body.wizardData : body;
    const icpCard = "icpCard" in body ? body.icpCard : null;

    if (!isValidPayload(payload)) {
      return NextResponse.json(
        { error: "Datos incompletos para generar materiales." },
        { status: 400 }
      );
    }

    const materials = generateIcpMaterials(payload, icpCard);
    return NextResponse.json(materials);
  } catch {
    return NextResponse.json(
      { error: "No fue posible procesar el wizard en este momento." },
      { status: 500 }
    );
  }
}
