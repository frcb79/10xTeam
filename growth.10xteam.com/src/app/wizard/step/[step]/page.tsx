import { redirect } from "next/navigation";
import { WizardShell } from "@/components/wizard/WizardShell";

export default async function WizardStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const stepNum = Number(step);

  if (!Number.isInteger(stepNum) || stepNum < 1 || stepNum > 5) {
    redirect("/wizard/step/1");
  }

  return <WizardShell initialStep={stepNum as 1 | 2 | 3 | 4 | 5} />;
}
