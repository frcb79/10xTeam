import { notFound } from "next/navigation";
import { actor, getSession } from "@/lib/onboarding/store";
import { QuickPlanPanel } from "./quick-plan-panel";

export default async function WizardQaQuickstartPage() {
  if (process.env.ONBOARDING_QA_QUICK_PLAN_ENABLED !== "true")
    notFound();
  const a = await actor();
  const session = await getSession(a);
  if (
    !a.userId ||
    session?.owner_user_id !== a.userId ||
    session?.id !== process.env.ONBOARDING_QA_SESSION_ID
  )
    notFound();
  return <QuickPlanPanel />;
}
