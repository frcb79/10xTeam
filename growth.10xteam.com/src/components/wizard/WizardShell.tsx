"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "@/hooks/useWizard";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step1Entry } from "@/components/wizard/steps/Step1Entry";
import { Step2Business } from "@/components/wizard/steps/Step2Business";
import { Step3ICP } from "@/components/wizard/steps/Step3ICP";
import { Step4Process } from "@/components/wizard/steps/Step4Process";
import { Step5Channels } from "@/components/wizard/steps/Step5Channels";
import { Step6Economics } from "@/components/wizard/steps/Step6Economics";

const STEP_COMPONENTS = {
  1: Step1Entry,
  2: Step2Business,
  3: Step3ICP,
  4: Step4Process,
  5: Step5Channels,
  6: Step6Economics,
} as const;

export function WizardShell({ initialStep }: { initialStep: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const router = useRouter();
  const { state, goToStep } = useWizard();

  useEffect(() => {
    if (state.currentStep !== initialStep) {
      goToStep(initialStep);
    }
    // Solo sincronizar cuando cambia la URL inicial para evitar "rebotes" de step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStep, goToStep]);

  useEffect(() => {
    router.replace(`/wizard/step/${state.currentStep}`, { scroll: false });
  }, [router, state.currentStep]);

  useEffect(() => {
    if (state.status === "processing") {
      router.replace("/wizard/processing");
    }
    if (state.status === "complete") {
      router.replace("/wizard/complete");
    }
  }, [router, state.status]);

  const CurrentStep = STEP_COMPONENTS[state.currentStep];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 md:px-8 md:py-8">
      <header className="sticky top-0 z-20 mb-8 rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-4 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Wizard ICP</p>
            <h1 className="text-xl font-semibold text-stone-50 md:text-2xl">Construye tu cliente ideal</h1>
          </div>
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
            Paso {state.currentStep} de 6
          </span>
        </div>
        <WizardProgress currentStep={state.currentStep} completedSteps={state.completedSteps} />
      </header>

      {state.error && (
        <div className="mb-6 rounded-2xl border border-rose-700/40 bg-rose-950/25 px-4 py-3 text-sm text-rose-200">
          {state.error}
        </div>
      )}

      <main className="flex-1">
        <CurrentStep />
      </main>
    </div>
  );
}
