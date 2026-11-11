import {test} from "node:test";
import assert from "node:assert/strict";
import {buildReport,defaultReportInput} from "../src/lib/onboarding/report-10x";

test("zero leads switches to acquisition scenario instead of all-zero loss claims",()=>{
 const r=buildReport({...defaultReportInput,leads:0,goal:"captacion"});
 assert.equal(r.startsWithoutLeads,true);
 assert.equal(r.scenarios.central.estimatedProspectsMonth,35);
 assert.ok(r.scenarios.central.recoveredHoursMonth>0);
 assert.ok(r.scenarios.central.capacityValueMonth>0);
 assert.ok(r.scenarios.central.grossSalesOpportunityMonth>0);
 assert.match(r.recommendations[0].title,/prospección/i);
});
test("zero leads and zero manual time still presents acquisition scenario, no invented time savings",()=>{
 const r=buildReport({...defaultReportInput,leads:0,manualHoursWeek:0});
 assert.equal(r.scenarios.central.recoveredHoursMonth,0);
 assert.equal(r.scenarios.central.capacityValueMonth,0);
 assert.ok(r.scenarios.central.estimatedProspectsMonth>0);
});
test("existing lead revenue is incremental conversion hypothesis, not existing total sales",()=>{
 const r=buildReport({...defaultReportInput,leads:100,closeRate:10,avgSale:20000,manualHoursWeek:10});
 assert.equal(r.scenarios.central.grossSalesOpportunityMonth,24000);
 assert.equal(r.scenarios.central.estimatedProspectsMonth,100);
 assert.equal(r.scenarios.central.recoveredHoursMonth,17.3);
 assert.equal(r.scenarios.central.capacityValueMonth,11258);
 assert.deepEqual(r.inferred,[]);
});
test("currency has own rate assumptions, not an FX conversion",()=>{
 const r=buildReport({...defaultReportInput,currency:"USD",role:"operaciones",avgSale:null});
 assert.equal(r.assumptions.avgSale,900);
 assert.equal(r.roleHourlyReference,16);
});
test("specific business sectors get different buyer and process recommendations",()=>{
 const a=buildReport({...defaultReportInput,sector:"financiero"});
 const b=buildReport({...defaultReportInput,sector:"citas"});
 assert.notDeepEqual(a.audiences,b.audiences);
 assert.notDeepEqual(a.stages,b.stages);
});
test("invalid inputs rejected to protect financial claims",()=>{
 assert.throws(()=>buildReport({...defaultReportInput,manualHoursWeek:-1}));
 assert.throws(()=>buildReport({...defaultReportInput,leads:NaN}));
 assert.throws(()=>buildReport({...defaultReportInput,closeRate:101}));
});
