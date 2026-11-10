// Script: prepare-lab-qa-session.mjs
// Purpose: Create a dedicated, legitimate QA test session in Supabase using the application state machine.
// Strictly avoids touching or binding the real Dev session (0b624aa6-7db1-46f2-b713-29481273c1ab).
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { buildPlan } from "../src/lib/onboarding/plan.ts";
import { answers, context } from "../tests/fixtures.ts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rasnxpsmzmdyradclxtb.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(serviceKey, "SUPABASE_SERVICE_ROLE_KEY is required to run this preparation script.");

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

// Dedicated QA test session UUID
export const QA_LAB_SESSION_ID = "00000000-0000-4000-b2b0-000000000001";
export const QA_LAB_USER_ID = "e89ff5d8-ace9-4e44-b3ff-69b9bb350ec9";
const LOCATION_ID = "Be3Voe6UoPjiAawaQUCK";

export async function prepareLegitimateQASession() {
  console.log("Preparing legitimate QA test session in Supabase:", QA_LAB_SESSION_ID);

  // 1. Verify that real Dev session is NOT touched
  const { data: realDev } = await supabase
    .from("onboarding_sessions")
    .select("id, plan, provision")
    .eq("id", "0b624aa6-7db1-46f2-b713-29481273c1ab")
    .maybeSingle();

  if (realDev) {
    assert.equal(realDev.provision?.locationId, null, "Real Dev session must remain unbound!");
    console.log("Verified: Real Dev session 0b624aa6 is clean and unbound.");
  }

  // 2. Check if QA session already exists
  const { data: existing } = await supabase
    .from("onboarding_sessions")
    .select("*")
    .eq("id", QA_LAB_SESSION_ID)
    .maybeSingle();

  if (existing) {
    console.log("QA test session already exists:", existing.id, "version:", existing.version);
    return existing;
  }

  // 3. Insert initial session with empty draft
  const initialDraft = {
    currentStep: 6,
    answers: structuredClone(answers),
    context: { ...context, target90Days: "Ensayo controlado E2E en Consultoría LAB", preserve: "Formulario de Dev" },
  };

  const { data: created, error: createErr } = await supabase
    .from("onboarding_sessions")
    .insert({
      id: QA_LAB_SESSION_ID,
      owner_user_id: QA_LAB_USER_ID,
      draft: initialDraft,
      version: 1,
    })
    .select()
    .single();

  if (createErr || !created) {
    throw new Error("Failed to insert initial QA session: " + JSON.stringify(createErr));
  }
  console.log("Created initial QA session:", created.id);

  // 4. Build legitimate plan
  const plan = buildPlan(QA_LAB_SESSION_ID, initialDraft.answers, initialDraft.context, 1);
  
  // Consent for CRM (provision_core_no_paid_services)
  const crmModule = plan.modules.find(m => m.id === "crm");
  if (crmModule) {
    crmModule.consent = {
      actorId: QA_LAB_USER_ID,
      at: new Date().toISOString(),
      scope: "provision_core_no_paid_services",
      planVersion: 1,
    };
  }

  // Consent for Forms (prepare_forms_no_paid_services)
  const formsModule = plan.modules.find(m => m.id === "forms");
  if (formsModule) {
    formsModule.mode = "connect";
    formsModule.consent = {
      actorId: QA_LAB_USER_ID,
      at: new Date().toISOString(),
      scope: "prepare_forms_no_paid_services",
      planVersion: 1,
    };
  }

  const evidence = [
    {
      gate: "contract",
      kind: "simulation", // Explicitly test simulation as instructed
      outcome: "pass",
      reference: "QA-PILOT-LAB-SIMULATION-20261110",
      at: new Date().toISOString(),
      actorId: QA_LAB_USER_ID,
      planVersion: 1,
      locationId: "pending",
    },
    {
      gate: "lab_binding",
      kind: "simulation",
      outcome: "pass",
      reference: "QA-PILOT-LAB-BINDING-20261110",
      at: new Date().toISOString(),
      actorId: QA_LAB_USER_ID,
      planVersion: 1,
      locationId: LOCATION_ID,
    },
  ];

  const provision = {
    status: "configured",
    locationId: LOCATION_ID,
    snapshotId: "manifest-consultoria-lab",
    snapshotVersion: "lab-v1",
    runId: randomUUID(),
  };

  // 5. Save through the official save_onboarding RPC
  const { data: updated, error: rpcErr } = await supabase.rpc("save_onboarding", {
    p_id: QA_LAB_SESSION_ID,
    p_version: created.version,
    p_patch: {
      plan,
      evidence,
      provision,
    },
    p_event: "qa_lab_session_configured",
    p_actor: QA_LAB_USER_ID,
  });

  if (rpcErr || !updated) {
    throw new Error("RPC save_onboarding failed: " + JSON.stringify(rpcErr));
  }

  console.log("QA test session configured via save_onboarding RPC. Version:", updated.version);
  return updated;
}
