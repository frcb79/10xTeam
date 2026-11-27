// Read-only preflight for an independently created, authenticated QA onboarding session.
// Never creates a session, grants roles, records consent, writes contractual evidence,
// binds a location, provisions a provider, or modifies the real Dev onboarding.
//
// First create the QA account/session in the Wizard using a DIFFERENT verified
// Auth identity. The QA owner must give their own consent in the authenticated UI;
// an assigned operator must verify any real contractual/pilot authority separately.
// Then run with ONBOARDING_QA_SESSION_ID=<verified-QA-uuid>. No service writes occur.

import assert from "node:assert/strict";
import { createServiceClient } from "../src/lib/supabase/service.ts";

export const REAL_DEV_SESSION_ID = "0b624aa6-7db1-46f2-b713-29481273c1ab";
export const LOCATION_ID = "Be3Voe6UoPjiAawaQUCK";

export async function prepareLegitimateQASession(qaSessionId = process.env.ONBOARDING_QA_SESSION_ID) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.ok(qaSessionId && uuid.test(qaSessionId), "Set ONBOARDING_QA_SESSION_ID to an existing verified QA session UUID.");
  assert.notEqual(qaSessionId, REAL_DEV_SESSION_ID, "Never inspect or prepare real Dev as a QA session.");

  const supabase = createServiceClient();
  if (!supabase) throw new Error("Supabase service client not available");

  const { data: realDev, error: devError } = await supabase
    .from("onboarding_sessions")
    .select("id, owner_user_id, version, provision")
    .eq("id", REAL_DEV_SESSION_ID)
    .single();
  if (devError || !realDev) throw new Error("Real Dev guard could not be verified; no QA preflight was completed.");
  assert.equal(realDev.version, 9, "Real Dev plan/version changed; review before proceeding.");
  assert.equal(realDev.provision?.locationId ?? null, null, "Real Dev must remain unbound.");

  const { data: qa, error: qaError } = await supabase
    .from("onboarding_sessions")
    .select("id, owner_user_id, version, plan, diagnostic, draft, evidence, provision, functional_ready_at, commercial_trial_started_at")
    .eq("id", qaSessionId)
    .single();
  if (qaError || !qa) throw new Error("Existing authenticated QA session was not found.");
  assert.ok(qa.owner_user_id, "QA session must belong to an authenticated owner.");
  assert.notEqual(qa.owner_user_id, realDev.owner_user_id,
    "QA must use a separate Auth user, not the real Dev owner's identity.");
  assert.equal(qa.functional_ready_at, null, "QA must not already be declared functionally ready.");
  assert.equal(qa.commercial_trial_started_at, null, "QA must not start a commercial trial.");
  assert.ok(!qa.provision?.locationId || qa.provision.locationId === LOCATION_ID,
    "QA session is attached to an unexpected location.");

  // Recorded metadata is not independent proof of a legitimate authorization.
  const plan = qa.plan;
  const moduleConsent = (id, scope) => {
    const consent = plan?.modules?.find((m) => m.id === id)?.consent;
    return Boolean(consent && consent.actorId === qa.owner_user_id &&
      consent.planVersion === plan.version && consent.scope === scope);
  };
  const contractRecorded = Boolean(qa.evidence?.some((e) =>
    e.gate === "contract" && e.kind === "real" && e.outcome === "pass" &&
    e.planVersion === plan?.version));

  return {
    qaSessionId: qa.id,
    qaPlanVersion: plan?.version ?? null,
    diagnosticSaved: Boolean(qa.diagnostic && qa.draft?.context),
    ownerCoreConsentRecorded: moduleConsent("crm", "provision_core_no_paid_services"),
    ownerFormsConsentRecorded: moduleConsent("forms", "prepare_forms_no_paid_services"),
    contractEvidenceRecorded: contractRecorded,
    provisionStatus: qa.provision?.status ?? "not_started",
    boundToLab: qa.provision?.locationId === LOCATION_ID,
    requiresManualAuthorityVerification: true,
    externalWritesPerformed: false,
  };
}

if (process.argv[1]?.endsWith("prepare-lab-qa-session.mjs")) {
  prepareLegitimateQASession()
    .then((preflight) => {
      console.log("Read-only LAB QA preflight (recorded consents are NOT verified authority):");
      console.log(JSON.stringify(preflight, null, 2));
      console.log("Use the authenticated Wizard and assigned operator for each approved action.");
    })
    .catch((err) => {
      console.error("LAB QA preflight blocked:", err.message);
      process.exitCode = 1;
    });
}
