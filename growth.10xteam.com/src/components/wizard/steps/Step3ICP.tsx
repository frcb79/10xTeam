"use client";

import { useWizard } from "@/hooks/useWizard";
import { Step3ICP_B2B } from "@/components/wizard/steps/Step3ICP_B2B";
import { Step3ICP_B2C } from "@/components/wizard/steps/Step3ICP_B2C";
import { Step3ICP_Mixed } from "@/components/wizard/steps/Step3ICP_Mixed";
import { Step3ICP_Solo } from "@/components/wizard/steps/Step3ICP_Solo";

export function Step3ICP() {
  const { state } = useWizard();

  if (state.icpType === "freelancer") {
    return <Step3ICP_Solo />;
  }

  if (state.icpType === "b2c") {
    return <Step3ICP_B2C />;
  }

  if (state.icpType === "mixed") {
    return <Step3ICP_Mixed />;
  }

  return <Step3ICP_B2B />;
}
