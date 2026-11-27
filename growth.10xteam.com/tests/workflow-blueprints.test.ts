import {test} from "node:test";
import assert from "node:assert/strict";
import {selectWorkflowBlueprints} from "../src/lib/onboarding/workflow-blueprints";
test("selects different draft-only workflows for zero lead capture and appointments",()=>{
 const a=selectWorkflowBlueprints("consultoria","captacion",false);
 const b=selectWorkflowBlueprints("citas","seguimiento",true);
 assert.ok(a.some(v=>v.id==="10x_first_demand"));
 assert.ok(b.some(v=>v.id==="10x_appointment_cycle"));
 assert.ok(b.every(v=>v.state==="proposal_only"));
});
test("workflow blueprints never encode real provider template IDs or approvals",()=>{
 const w=selectWorkflowBlueprints("financiero","conversion",true);
 assert.equal(w.some(x=>x.requiresChannelApproval),true);
 assert.ok(w.every(x=>x.id.startsWith("10x_")));
});
