import { notFound } from "next/navigation";
import { actor, requireSession, publicSession } from "@/lib/onboarding/store";
import { readiness } from "@/lib/onboarding/model";
import { ReviewPanel } from "./review-panel";

export default async function OnboardingReview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const a = await actor();
  if (!a.operator) notFound();
  const { id } = await params;
  const session = await requireSession(a, id);
  return (
    <ReviewPanel
      initial={{
        session: publicSession(session),
        readiness: readiness(session),
        authenticated: true,
        operator: true,
        executionEnabled: process.env.GHL_PROVISIONING_ENABLED === "true",
      }}
    />
  );
}
