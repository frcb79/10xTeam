// Optional read-only acceptance check for the existing Consultoría LAB.
import assert from "node:assert/strict";

const locationId = "Be3Voe6UoPjiAawaQUCK";
assert.equal(process.env.VERCEL_ENV, "preview");
assert.equal(process.env.GHL_LAB_LOCATION_ID, locationId);
assert.equal(process.env.GHL_LAB_LOCATION_IDS, locationId);
assert.ok(process.env.GHL_LAB_ACCESS_TOKEN, "LAB credential missing");

async function read(path, label) {
  const response = await fetch(new URL(path, "https://services.leadconnectorhq.com"), {
    headers: {
      Authorization: "Bearer " + process.env.GHL_LAB_ACCESS_TOKEN,
      Version: "v3",
      Accept: "application/json",
    },
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
  });
  console.log("LAB_QA_HTTP", label, response.status);
  assert.equal(response.status, 200, label);
  return response.json();
}

const result = await read("/locations/" + locationId, "location");
const location = result.location ?? result;
assert.equal(location.id, locationId);
assert.ok(location.companyId, "Missing agency binding");
if (process.env.GHL_COMPANY_ID) assert.equal(location.companyId, process.env.GHL_COMPANY_ID);
console.log("LAB_QA_LOCATION_MATCH", true);

const query = "?locationId=" + locationId;
const collections = [
  ["pipelines", "/opportunities/pipelines" + query],
  ["forms", "/forms/" + query],
  ["workflows", "/workflows/" + query],
  ["calendars", "/calendars/" + query],
  ["customValues", "/locations/" + locationId + "/customValues"],
];
for (const [key, path] of collections) {
  const data = await read(path, key);
  assert.ok(Array.isArray(data[key]), "Invalid response for " + key);
  console.log("LAB_QA_COUNT", key, data[key].length);
}

// This ID belongs exclusively to the synthetic contact from the manual QA.
const { contact } = await read("/contacts/mxgKhfWfeC9p6RcBDjQY", "synthetic-contact");
assert.ok(contact?.locationId === locationId && contact?.email === "qa-dev-20261107@example.test",
  "Synthetic contact mismatch");
console.log("LAB_QA_CONTACT_MATCH", true);
