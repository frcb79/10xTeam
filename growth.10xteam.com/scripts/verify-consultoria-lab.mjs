// Optional read-only acceptance check for the existing Consultoría LAB.
import assert from "node:assert/strict";

const locationId = "Be3Voe6UoPjiAawaQUCK";
assert.equal(process.env.VERCEL_ENV, "preview");
assert.equal(process.env.GHL_LAB_LOCATION_ID, locationId);
assert.equal(process.env.GHL_LAB_LOCATION_IDS, locationId);
assert.ok(process.env.GHL_LAB_ACCESS_TOKEN, "LAB credential missing");

async function read(path, label, inspectAvailability = false) {
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
  if (inspectAvailability && [401, 403, 404].includes(response.status)) {
    const body = await response.json().catch(() => ({}));
    const code = body.code ?? body.error?.code;
    console.log("LAB_QA_BLOCKED", label, response.status,
      typeof code === "string" && /^[A-Z0-9_]{1,100}$/.test(code) ? code : "availability_or_scope");
    return null;
  }
  assert.equal(response.status, 200, label);
  return response.json();
}

const result = await read("/locations/" + locationId, "location");
const location = result.location ?? result;
assert.equal(location.id, locationId);
assert.ok(location.companyId, "Missing agency binding");
if (process.env.GHL_COMPANY_ID) assert.equal(location.companyId, process.env.GHL_COMPANY_ID);
console.log("LAB_QA_LOCATION_MATCH", true);
// Agency identifier is configuration metadata, never a token or client secret.
console.log("LAB_QA_COMPANY_ID", location.companyId);

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
  if (key === "pipelines") {
    const matching = data[key].filter(item => item.name === "10x LAB — Ventas Consultoría");
    assert.equal(matching.length, 1);
    assert.deepEqual(matching[0].stages?.map(stage => stage.name),
      ["Nuevo prospecto", "Calificación", "Diagnóstico", "Propuesta", "Decisión"]);
    console.log("LAB_QA_PIPELINE_STAGES", "5 exact stages, ordered");
  }
  if (key === "customValues") {
    const expected = ["10x_business_name", "10x_offer", "10x_ideal_customer", "10x_primary_goal", "10x_brand_voice", "10x_preserve"];
    for (const name of expected) assert.equal(data[key].filter(item => item.name === name).length, 1);
    console.log("LAB_QA_CUSTOM_VALUES", expected.length);
  }
}

// This ID belongs exclusively to the synthetic contact from the manual QA.
const { contact } = await read("/contacts/mxgKhfWfeC9p6RcBDjQY", "synthetic-contact");
assert.ok(contact?.locationId === locationId && contact?.email === "qa-dev-20261107@example.test",
  "Synthetic contact mismatch");
console.log("LAB_QA_CONTACT_MATCH", true);

const filters = new URLSearchParams({ locationId, contactId: contact.id, limit: "100" });
const { opportunities } = await read("/opportunities/search?" + filters, "qa-opportunities");
assert.ok(Array.isArray(opportunities), "Missing opportunity list");
const expectedOffers = ["QA Dev · Llave en Mano · 20261107", "QA Dev · Dev Squad · 20261107"];
for (const name of expectedOffers) {
  const matches = opportunities.filter(item => item.name === name &&
    (item.contactId ?? item.contact?.id) === contact.id && item.locationId === locationId);
  assert.equal(matches.length, 1, "Missing or duplicated QA opportunity");
}
console.log("LAB_QA_DISTINCT_OFFERS", expectedOffers.length);

const { tasks } = await read("/contacts/" + contact.id + "/tasks", "qa-tasks");
assert.ok(Array.isArray(tasks), "Missing task list");
const followUp = tasks.filter(task => task.title === "QA Dev · Revisar solicitud · 20261107" &&
  (!task.contactId || task.contactId === contact.id));
assert.equal(followUp.length, 1, "Missing or duplicated QA follow-up");
console.log("LAB_QA_FOLLOW_UP", followUp.length);

// Additional read-only preflight for the product field and workflow authoring.
// A denial is reported as a blocker; it never counts as a passed integration.
const fields = await read("/locations/" + locationId + "/customFields?model=contact", "product-fields", true);
if (fields) {
  assert.ok(Array.isArray(fields.customFields), "Invalid custom field response");
  console.log("LAB_QA_PRODUCT_FIELDS", JSON.stringify(fields.customFields
    .filter(field => field.name === "10x_service" || field.fieldKey === "contact.10x_service")
    .map(field => ({ id: field.id, name: field.name, dataType: field.dataType }))));
}
const catalog = await read("/workflows/step-types" + query +
  "&types=opportunity,task,internal,contact_created,field&limit=20", "workflow-authoring", true);
if (catalog) {
  assert.equal(catalog.locationId, locationId, "Workflow catalog location mismatch");
  assert.ok(Array.isArray(catalog.stepTypes), "Invalid workflow catalog");
  console.log("LAB_QA_WORKFLOW_TYPES", JSON.stringify(catalog.stepTypes
    .map(step => ({ type: step.type, kind: step.kind,
      fields: step.fields?.map(field => ({ field: field.field, required: field.required })) }))));
}
