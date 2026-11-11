import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateWow, wowDefaults } from "../src/lib/onboarding/wow-estimate";

test("WOW uses transparent base assumptions and does not call them customer facts", () => {
  const result = estimateWow(wowDefaults);
  assert.deepEqual(result.inferred, ["conversionPercent", "averageTicket", "loadedHourlyCost"]);
  assert.equal(result.currentMonthlyManualHours, 25);
  assert.equal(result.assumptions.conversionPercent, 5);
  assert.equal(result.assumptions.averageTicket, 15000);
  assert.equal(result.assumptions.loadedHourlyCost, 200);
  assert.equal(result.scenarios.base.hoursFreed, 10);
  assert.equal(result.scenarios.base.equivalentTimeValue, 2000);
  assert.equal(result.scenarios.base.incrementalGrossSales, 7500);
});
test("WOW numbers scale with real lead volume but do not invent new leads", () => {
  const a=estimateWow({ ...wowDefaults, monthlyLeads: 100, conversionPercent: 10, averageTicket: 1000, loadedHourlyCost: 100 });
  const b=estimateWow({ ...wowDefaults, monthlyLeads: 200, conversionPercent: 10, averageTicket: 1000, loadedHourlyCost: 100 });
  assert.deepEqual(a.inferred, []);
  assert.equal(b.currentMonthlyManualHours, a.currentMonthlyManualHours*2);
  assert.equal(b.scenarios.base.incrementalGrossSales, a.scenarios.base.incrementalGrossSales*2);
  assert.equal(a.scenarios.base.incrementalGrossSales, 1000);
  assert.equal(a.scenarios.base.incrementalDeals, 1);
});
test("WOW zero leads or zero conversion generates zero revenue, not an invented uplift", () => {
  assert.equal(estimateWow({ ...wowDefaults, monthlyLeads: 0 }).scenarios.optimistic.incrementalGrossSales, 0);
  assert.equal(estimateWow({ ...wowDefaults, conversionPercent: 0 }).scenarios.optimistic.incrementalGrossSales, 0);
});
test("WOW USD values are denomination-specific assumptions, not a made-up FX conversion", () => {
  const result=estimateWow({ ...wowDefaults, currency: "USD" });
  assert.equal(result.assumptions.averageTicket, 750);
  assert.equal(result.assumptions.loadedHourlyCost, 20);
  assert.equal(result.scenarios.base.equivalentTimeValue, 200);
});
test("WOW rejects implausible negative or non-finite input", () => {
  assert.throws(()=>estimateWow({ ...wowDefaults, monthlyLeads: -1 }));
  assert.throws(()=>estimateWow({ ...wowDefaults, conversionPercent: 101 }));
  assert.throws(()=>estimateWow({ ...wowDefaults, averageTicket: Number.NaN }));
});
