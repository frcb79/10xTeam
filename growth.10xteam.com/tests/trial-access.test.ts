import {test} from "node:test";
import assert from "node:assert/strict";
import {trialEligibility,trialWindow,isTrialExpired} from "../src/lib/onboarding/trial-access";

const valid={
  plan:"growth" as const,verifiedEmail:true,acceptedTerms:true,
  hasUsedTrial:false,rateLimitExceeded:false,agencyReady:true,
  businessNameValid:true,prospectCountry:"MX" as const,permissionsAccepted:true,
};
test("real GHL trial eligibility requires verification, terms and agency but no card",()=>{
 const r=trialEligibility(valid);
 assert.equal(r.eligible,true);
 assert.equal(r.requiresCard,false);
 assert.equal(r.trialDays,14);
 assert.equal(r.onSuccess,"start_provisioning");
});
test("no unverified, duplicate or unapproved trial provisioning",()=>{
 const r=trialEligibility({...valid,verifiedEmail:false,hasUsedTrial:true,permissionsAccepted:false,rateLimitExceeded:true});
 assert.deepEqual(r.blockers,["EMAIL_NOT_VERIFIED","PROVISIONING_NOT_AUTHORIZED","TRIAL_ALREADY_USED","RATE_LIMIT"]);
 assert.equal(r.eligible,false);
});
test("trial begins at functional-ready time with exact day boundaries",()=>{
 const r=trialWindow("2026-11-11T18:00:00.000Z");
 assert.equal(r.endsAt,"2026-11-25T18:00:00.000Z");
 assert.equal(isTrialExpired("2026-11-25T17:59:59Z",r.endsAt),false);
 assert.equal(isTrialExpired("2026-11-25T18:00:00Z",r.endsAt),true);
 assert.throws(()=>trialWindow("not-a-date"));
});
