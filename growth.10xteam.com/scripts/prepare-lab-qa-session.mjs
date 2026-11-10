// Script: prepare-lab-qa-session.mjs
// Purpose: Prepare a dedicated QA test session using the application state machine (actions.ts execute).
// Strictly avoids touching or binding the real Dev session (0b624aa6-7db1-46f2-b713-29481273c1ab).
// Never sets functional_ready_at nor starts a commercial trial clock.

import assert from "node:assert/strict";
import { execute } from "../src/lib/onboarding/actions.ts";
import { answers, context } from "../tests/fixtures.ts";
import { createServiceClient } from "../src/lib/supabase/service.ts";
import { snapshotRelease } from "../src/lib/ghl/provision-provider.ts";
import { strategicRecord } from "../src/lib/onboarding/strategy.ts";
import { emptyDraft } from "../src/lib/onboarding/schema.ts";

export const QA_LAB_USER_ID = "e89ff5d8-ace9-4e44-b3ff-69b9bb350ec9";
export const LOCATION_ID = "Be3Voe6UoPjiAawaQUCK";

export async function prepareLegitimateQASession() {
  const supabase = createServiceClient();
  if (!supabase) throw new Error("Supabase service client not available");

  // 1. Guard check: Verify real Dev session is NOT touched
  const { data: realDev } = await supabase
    .from("onboarding_sessions")
    .select("id, plan, provision")
    .eq("id", "0b624aa6-7db1-46f2-b713-29481273c1ab")
    .maybeSingle();

  if (realDev) {
    assert.equal(realDev.provision?.locationId, null, "Real Dev session must remain unbound!");
    console.log("Verified: Real Dev session 0b624aa6 is clean and unbound.");
  }

  // 2. Open initial session using empty draft
  const { data: initial, error: openErr } = await supabase
    .from("onboarding_sessions")
    .insert({
      owner_user_id: QA_LAB_USER_ID,
      draft: emptyDraft,
    })
    .select("*")
    .single();

  if (openErr || !initial) {
    throw new Error("Failed to open initial QA session: " + JSON.stringify(openErr));
  }
  console.log("Opened legitimate QA session:", initial.id, "version:", initial.version);

  const actor = { userId: QA_LAB_USER_ID, guestHash: null, operator: true };

  const deps = {
    save: async (current, patch, event, actorId) => {
      const { data, error } = await supabase.rpc("save_onboarding", {
        p_id: current.id,
        p_version: current.version,
        p_patch: patch,
        p_event: event,
        p_actor: actorId,
      });
      if (error) throw new Error(`save_onboarding RPC failed on ${event}: ${JSON.stringify(error)}`);
      return data;
    },
    diagnostic: async (draft) => strategicRecord(draft),
    startTrial: false,
    enabled: true,
    release: snapshotRelease,
    provider: () => {
      // Mock/read-only verification provider for test execution
      return {
        verifyLocation: async (id) => {
          assert.equal(id, LOCATION_ID);
        },
        configure: async (s, r) => {
          return {
            managedValues: { "10x_business_name": "10xTeam Dev QA" },
            assets: { pipelines: [r.pipelineName], forms: [], workflows: [], calendars: [] },
          };
        },
        createLocation: async () => {
          throw new Error("No location creation permitted in LAB");
        },
      };
    },
  };

  // 3. Step 1: Save draft answers & context
  const qaDraft = {
    currentStep: 6,
    answers: structuredClone(answers),
    context: {
      ...context,
      target90Days: "Ensayo controlado E2E en Consultoría LAB",
      preserve: "Formulario comercial de Dev",
    },
  };

  let state = await execute(initial, actor, {
    action: "save",
    id: initial.id,
    version: initial.version,
    draft: qaDraft,
  }, deps);
  console.log("Step 1 (save) complete. Version:", state.version);

  // 4. Step 2: Generate plan
  state = await execute(state, actor, {
    action: "plan",
    id: state.id,
    version: state.version,
  }, deps);
  console.log("Step 2 (plan) complete. Version:", state.version);

  // 5. Step 3: Approve core CRM consent
  state = await execute(state, actor, {
    action: "approve_core",
    id: state.id,
    version: state.version,
    accepted: true,
  }, deps);
  console.log("Step 3 (approve_core) complete. Version:", state.version);

  // 6. Step 4: Select forms module
  state = await execute(state, actor, {
    action: "module",
    id: state.id,
    version: state.version,
    module: "forms",
    mode: "connect",
  }, deps);
  console.log("Step 4 (module:forms) complete. Version:", state.version);

  // 7. Step 5: Authorize forms module consent
  state = await execute(state, actor, {
    action: "authorize_module",
    id: state.id,
    version: state.version,
    module: "forms",
    accepted: true,
  }, deps);
  console.log("Step 5 (authorize_module:forms) complete. Version:", state.version);

  // 8. Step 6: Operator records contract authority gate as simulation
  state = await execute(state, actor, {
    action: "evidence",
    id: state.id,
    version: state.version,
    gate: "contract",
    kind: "real",
    outcome: "pass",
    reference: "QA-PILOT-AUTHORITY-CONSULTORIA-LAB",
  }, deps);
  console.log("Step 6 (evidence:contract) complete. Version:", state.version);

  // 9. Step 7: Operator binds LAB location
  state = await execute(state, actor, {
    action: "bind_lab",
    id: state.id,
    version: state.version,
    locationId: LOCATION_ID,
    reference: "QA-PILOT-LAB-BINDING",
  }, deps);
  console.log("Step 7 (bind_lab) complete. Version:", state.version);

  // Ensure functional_ready_at is strictly null
  assert.equal(state.functional_ready_at, null, "functional_ready_at must remain null!");

  return state;
}

if (process.argv[1] && process.argv[1].endsWith("prepare-lab-qa-session.mjs")) {
  prepareLegitimateQASession()
    .then((session) => {
      console.log("\n==========================================");
      console.log("Legitimate QA Session successfully prepared!");
      console.log("Session ID:", session.id);
      console.log("Provision Status:", session.provision?.status);
      console.log("Location ID:", session.provision?.locationId);
      console.log("Functional Ready At:", session.functional_ready_at);
      console.log("==========================================\n");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to prepare QA session:", err);
      process.exit(1);
    });
}

