import { NextResponse } from "next/server";
import { generateIcpMaterials } from "@/lib/icp-materials";
import type { WizardData } from "@/types/icp";
import type { ICPCard } from "@/types/wizard.types";

interface MaterialsRequestBody {
  wizardData?: Partial<WizardData>;
  icpCard?: ICPCard | null;
}

function isMaterialsRequestBody(value: unknown): value is MaterialsRequestBody {
  return typeof value === "object" && value !== null && ("wizardData" in value || "icpCard" in value);
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
    const body = (await request.json()) as unknown;
    const payload = isMaterialsRequestBody(body) ? body.wizardData : (body as Partial<WizardData>);
    const icpCard = isMaterialsRequestBody(body) ? body.icpCard : null;

    if (!payload || !isValidPayload(payload)) {
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
