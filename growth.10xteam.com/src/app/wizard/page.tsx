import { redirect } from "next/navigation";
import { actor, getSession } from "@/lib/onboarding/store";
export default async function WizardEntry() {
  let destination = "/wizard/step/1";
  try { const session=await getSession(await actor()); if(session) destination=session.plan || session.draft.answers.step6 ? "/wizard/complete" : "/wizard/step/"+session.draft.currentStep; }
  catch { /* Initial questionnaire still opens while persistence is unavailable. */ }
  redirect(destination);
}
