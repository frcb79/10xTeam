import type { Metadata } from "next";
import { WizardProvider } from "@/hooks/useWizard";

export const metadata: Metadata = {
  title: "10xTeam — Wizard ICP",
  description: "Wizard modular para definir el cliente ideal y activar materiales.",
};

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WizardProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(8,15,32,0.92),_rgba(3,6,15,1))] text-stone-100">
        {children}
      </div>
    </WizardProvider>
  );
}
