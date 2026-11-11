import type { Metadata } from "next";
import WowSimulator from "./wow-simulator";

export const metadata: Metadata = {
  title: "10xteam Growth OS — Diagnóstico WOW (prototipo)",
  description: "Simulador de oportunidades de automatización y crecimiento; escenarios no garantizados.",
  robots: { index: false, follow: false },
};

export default function WowPage() {
  return <WowSimulator />;
}
