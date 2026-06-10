import type { WizardStep } from "@/types/wizard.types";

const LABELS: Record<WizardStep, string> = {
  1: "Inicio",
  2: "Negocio",
  3: "ICP",
  4: "Proceso",
  5: "Canales",
  6: "Economia",
};

export function WizardProgress({ currentStep, completedSteps }: { currentStep: WizardStep; completedSteps: WizardStep[] }) {
  const steps: WizardStep[] = [1, 2, 3, 4, 5, 6];

  return (
    <div className="grid grid-cols-6 gap-2">
      {steps.map((step) => {
        const isCurrent = step === currentStep;
        const isDone = completedSteps.includes(step);

        return (
          <div key={step} className="flex flex-col gap-2">
            <div
              className={`h-2 rounded-full transition-colors ${
                isDone ? "bg-teal-400" : isCurrent ? "bg-cyan-300" : "bg-white/10"
              }`}
            />
            <div className={`text-center text-[10px] uppercase tracking-[0.18em] ${isCurrent ? "text-cyan-200" : isDone ? "text-teal-200" : "text-stone-500"}`}>
              {LABELS[step]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
