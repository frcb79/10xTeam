import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign, randomBytes } from "node:crypto";
import { buildPlan, conditionalQuestions } from "../src/lib/onboarding/plan";
import { buildQuickPlan } from "../src/lib/onboarding/quick-plan";
import {
  ownsSession,
  readiness,
  globalGates,
  type OnboardingSession,
} from "../src/lib/onboarding/model";
import {
  requireCompleteAnswers,
  contextSchema,
} from "../src/lib/onboarding/schema";
import {
  execute,
  type ActionDependencies,
} from "../src/lib/onboarding/actions";
import {
  provisionSession,
  provisionPrerequisites,
} from "../src/lib/onboarding/provision";
import { GhlProvisionProvider } from "../src/lib/ghl/provision-provider";
import { verifiedEvent } from "../src/lib/ghl/webhook";
import { assertBoundLocation, validOAuthReturn } from "../src/lib/ghl/oauth-context";
import { seal, unseal } from "../src/lib/onboarding/security";
import { publicIPv4 } from "../src/lib/onboarding/public-website";
import { formDestination } from "../src/lib/onboarding/form-delivery";
import {
  actor,
  answers,
  ba,
  context,
  other,
  owner,
  release,
  session,
} from "./fixtures";

test("commercial inputs drive recommendations, provenance, preservation, KPI and snapshot", () => {
  const business = buildPlan(ba, answers, context, 8);
  assert.equal(business.archetype, "b2b");
  assert.match(business.memory.recommendations[0].action, /linkedin/i);
  assert.match(business.memory.recommendations[0].action, /orgánica/);
  assert.equal(business.customValues["10x_preserve"], context.preserve);
  const keys = new Set(business.memory.facts.map((f) => f.key));
  for (const r of business.memory.recommendations)
    assert.ok(r.evidenceKeys.every((k) => keys.has(k)));
  assert.ok(![...keys].some((k) => k.includes("ownerEmail")));
  assert.equal(business.memory.agentPolicy.crossAccountData, false);
  const clinic = buildPlan(
    other,
    answers,
    {
      ...context,
      goal: "appointments",
      bottleneck: "no_shows",
      monthlyLeads: 8,
      calendarHosts: "Ana, lunes a viernes",
    },
    1,
  );
  assert.equal(clinic.snapshotKey, "core-appointments");
  assert.ok(clinic.modules.find((m) => m.id === "calendar")?.required);
  assert.notDeepEqual(clinic.pipelineStages, business.pipelineStages);
  assert.match(clinic.coreTest, /conflicto/);
  assert.notEqual(
    clinic.memory.businessAccountId,
    business.memory.businessAccountId,
  );
});
test("conditional fields and legacy mixed / solo representations", () => {
  assert.ok(!conditionalQuestions(context).includes("calendarHosts"));
  assert.ok(
    conditionalQuestions({ ...context, goal: "appointments" }).includes(
      "calendarHosts",
    ),
  );
  assert.ok(
    !contextSchema.safeParse({ ...context, goal: "appointments" }).success,
  );
  assert.doesNotThrow(() =>
    requireCompleteAnswers({
      ...answers,
      step2: { ...answers.step2!, icpType: "mixed" },
    }),
  );
  assert.throws(() =>
    requireCompleteAnswers({
      ...answers,
      step2: { ...answers.step2!, icpType: "b2c" },
    }),
  );
});
test("owner, guest and cross-account access are different principals", () => {
  assert.equal(ownsSession(actor, session()), true);
  assert.equal(ownsSession({ ...actor, userId: other }, session()), false);
  assert.equal(
    ownsSession(
      { userId: null, guestHash: "a", operator: false },
      { owner_user_id: null, guest_hash: "b" },
    ),
    false,
  );
  assert.equal(
    ownsSession(
      { userId: null, guestHash: "a", operator: false },
      { owner_user_id: owner, guest_hash: "a" },
    ),
    false,
  );
});
function stateful(initial = session()) {
  let state = structuredClone(initial);
  let creates = 0;
  let configs = 0;
  const deps: ActionDependencies = {
    enabled: true,
    release: () => release,
    provider: () => ({
      async createLocation() {
        creates++;
        return "fixture-location";
      },
      async verifyLocation() { },
      async configure() {
        configs++;
        return { managedValues: {}, assets: { pipelines: ["pipeline"] } };
      },
    }),
    save: async (s, p) => {
      if (s.version !== state.version) throw new Error("version_conflict");
      state = { ...state, ...structuredClone(p), version: state.version + 1 };
      return state;
    },
  };
  return {
    deps,
    get state() {
      return state;
    },
    get creates() {
      return creates;
    },
    get configs() {
      return configs;
    },
  };
}
test("explicit approval + contract before create; same BA remains single on replay and parallel attempts", async () => {
  const h = stateful();
  const s = h.state;
  assert.throws(() => provisionPrerequisites(s, false, release));
  assert.throws(() => provisionPrerequisites(s, true, release));
  await execute(
    s,
    actor,
    { action: "approve_core", id: ba, version: s.version, accepted: true },
    h.deps,
  );
  await execute(
    h.state,
    { ...actor, operator: true },
    {
      action: "evidence",
      id: ba,
      version: h.state.version,
      gate: "contract",
      kind: "real",
      outcome: "pass",
      reference: "fixture:contract",
    },
    h.deps,
  );
  const prev = h.state;
  const cmd = { action: "provision" as const, id: ba, version: prev.version };
  const race = await Promise.allSettled([
    execute(prev, actor, cmd, h.deps),
    execute(prev, actor, cmd, h.deps),
  ]);
  assert.equal(race.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(h.creates, 1);
  assert.equal(h.state.provision.status, "configured");
  await execute(h.state, actor, { ...cmd, version: h.state.version }, h.deps);
  assert.equal(h.creates, 1);
  assert.equal(h.configs, 1);
  assert.equal(readiness(h.state).ready, false);
});
test("unknown create result requires reconciliation and cannot duplicate a location", async () => {
  const h = stateful();
  let attempts = 0;
  const provider = {
    ...h.deps.provider(),
    createLocation: async () => {
      attempts++;
      throw Error("timeout after write");
    },
  };
  const save = (
    s: OnboardingSession,
    p: OnboardingSession["provision"],
    e: string,
  ) => h.deps.save(s, { provision: p }, e, "test");
  await provisionSession(h.state, provider, save, release);
  assert.equal(h.state.provision.status, "manual_review");
  await assert.rejects(provisionSession(h.state, provider, save, release));
  assert.equal(attempts, 1);
});
test("failure after binding retries configuration only", async () => {
  const h = stateful();
  const saved = (
    s: OnboardingSession,
    p: OnboardingSession["provision"],
    e: string,
  ) => h.deps.save(s, { provision: p }, e, "test");
  const p = h.deps.provider();
  await provisionSession(
    h.state,
    {
      ...p,
      configure: async () => {
        throw Error("429");
      },
    },
    saved,
    release,
  );
  assert.equal(h.state.provision.status, "waiting_provider");
  await provisionSession(h.state, p, saved, release);
  assert.equal(h.creates, 1);
  assert.equal(h.state.provision.status, "configured");
});
test("required, optional, simulated, failed, stale and cross-location evidence", async () => {
  const s = session();
  s.provision = { status: "configured", locationId: "fixture-location" };
  for (const m of s.plan!.modules.filter((m) => m.required))
    m.consent = {
      scope: "fixture",
      actorId: owner,
      at: s.created_at,
      planVersion: 1,
    };
  const gates = [
    ...globalGates,
    ...s.plan!.modules.filter((m) => m.required).map((m) => "module:" + m.id),
  ];
  s.evidence = gates.map((gate) => ({
    gate,
    outcome: "pass",
    kind: "simulation",
    actorId: owner,
    reference: "fixture:" + gate,
    recordedAt: s.created_at,
    planVersion: 1,
    locationId: "fixture-location",
  }));
  assert.equal(readiness(s).ready, false);
  s.evidence.forEach((e) => (e.kind = "real"));
  assert.equal(readiness(s).ready, true);
  const h = stateful(s);
  await assert.rejects(
    execute(h.state, actor, { action: "ready", id: ba, version: 1 }, h.deps),
  );
  const ready = await execute(
    h.state,
    { ...actor, operator: true },
    { action: "ready", id: ba, version: 1 },
    h.deps,
  );
  assert.equal(readiness(ready).status, "FUNCTIONAL_READY");
  assert.equal(readiness(ready).trialStarted, false);
  s.evidence[0].locationId = "other";
  assert.equal(readiness(s).ready, false);
  s.evidence[0].locationId = "fixture-location";
  s.evidence[0].planVersion = 0;
  assert.equal(readiness(s).ready, false);
  s.evidence[0].planVersion = 1;
  s.evidence[0].outcome = "fail";
  assert.equal(readiness(s).ready, false);
});
test("provider contract writes namespaced empty fields, reads back, preserves customer changes", async () => {
  const s = session();
  s.provision = { status: "running", locationId: "fixture-location" };
  const map = new Map(
    Object.entries(s.plan!.customValues)
      .filter(([, v]) => v)
      .map(([k]) => [k, ""]),
  );
  let puts = 0;
  const fake: typeof fetch = async (url, init) => {
    const u = new URL(String(url));
    const path = u.pathname;
    const payload =
      path === "/oauth/locationToken"
        ? { access_token: "fixture", locationId: "fixture-location" }
        : path.endsWith("/customValues")
          ? {
            customValues: [...map].map(([name, value]) => ({
              id: name,
              name,
              value,
            })),
          }
          : path.includes("/customValues/")
            ? (puts++,
              map.set(
                path.split("/").at(-1)!,
                JSON.parse(String(init?.body)).value,
              ),
              {})
            : path === "/opportunities/pipelines"
              ? {
                pipelines: [
                  {
                    id: "pipeline",
                    name: "Ventas",
                    stages: s.plan!.pipelineStages.map((name) => ({ name })),
                  },
                ],
              }
              : path === "/forms/"
                ? { forms: [{ name: "Solicitud", id: "form" }] }
                : path === "/workflows/"
                  ? { workflows: [{ name: "Asignación", id: "workflow" }] }
                  : { calendars: [] };
    return Response.json(payload);
  };
  const p = new GhlProvisionProvider("fixture", "fixture-agency", fake);
  await assert.rejects(
    p.configure(s, { ...release, formNames: ["missing"] }),
    /activos/,
  );
  assert.equal(puts, 0);
  const result = await p.configure(s, release);
  assert.equal(result.managedValues?.["10x_offer"], answers.step2!.oneLiner);
  const count = puts;
  await p.configure(s, release);
  assert.equal(puts, count);
  map.set("10x_offer", "Texto editado por el cliente");
  await assert.rejects(p.configure(s, release), /personalización/);
  assert.equal(map.get("10x_offer"), "Texto editado por el cliente");
});
test("OAuth tokens cannot be decrypted for another BA; company and location must match", () => {
  process.env.ONBOARDING_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  const encrypted = seal({ token: "test-only" }, ba);
  assert.deepEqual(unseal(encrypted, ba), { token: "test-only" });
  assert.throws(() => unseal(encrypted, other));
  const s = session();
  s.provision.locationId = "fixture-location";
  const token = {
    companyId: "agency",
    locationId: "fixture-location",
    userType: "Location",
    accessToken: "dummy",
    refreshToken: "dummy",
    scope: "locations.readonly",
    expiresAt: s.created_at,
  };
  assert.doesNotThrow(() => assertBoundLocation(s, token, "agency"));
  for (const scope of [undefined, "contacts.write", "locations.readonly contacts.write"])
    assert.throws(() => assertBoundLocation(s, { ...token, scope }, "agency"));
  assert.throws(() =>
    assertBoundLocation(s, { ...token, locationId: "another" }, "agency"),
  );
});
test("signature verified over exact bytes; replay key stable and client status ignored", () => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const key = publicKey.export({ type: "spki", format: "pem" }).toString();
  const raw = Buffer.from(
    JSON.stringify({
      type: "ContactCreate",
      locationId: "lab",
      webhookId: "123",
      status: "trial_active",
    }),
  );
  const signature = sign(null, raw, privateKey).toString("base64");
  const event = verifiedEvent(raw, signature, key);
  assert.ok(event && !event.ignored);
  assert.ok(!("status" in event));
  assert.deepEqual(verifiedEvent(raw, signature, key), event);
  assert.equal(verifiedEvent(raw, null, key), null);
  assert.equal(
    verifiedEvent(Buffer.concat([raw, Buffer.from(" ")]), signature, key),
    null,
  );
});
test("public URL screening rejects loopback, link-local, internal and reserved ranges", () => {
  for (const ip of [
    "127.0.0.1",
    "169.254.169.254",
    "10.0.0.2",
    "192.168.0.1",
    "100.64.0.1",
    "::1",
    "224.0.0.9",
  ])
    assert.equal(publicIPv4(ip), false);
  assert.equal(publicIPv4("1.1.1.1"), true);
});
test("existing form maps both Dev offers only to its approved location", () => {
  const s = session();
  s.provision = { status: "configured", locationId: "synthetic-dev" };
  s.plan!.modules.find((m) => m.id === "forms")!.consent = {
    actorId: owner,
    at: s.created_at,
    scope: "prepare_forms_no_paid_services",
    planVersion: 1,
  };
  const route = {
    source: "dev_contact",
    session_id: ba,
    location_id: "synthetic-dev",
    service_field_id: "field",
    enabled: true,
  };
  const lead = {
    name: "Prueba",
    email: "QA@example.test",
    source: "dev_contact",
    service_type: "mvp",
  };
  assert.equal(
    formDestination(s, route, lead).customFields[0].field_value,
    "Llave en Mano",
  );
  assert.equal(
    formDestination(s, route, { ...lead, service_type: "celula" })
      .customFields[0].field_value,
    "10x Dev Squad",
  );
  assert.throws(() =>
    formDestination(s, { ...route, location_id: "growth" }, lead),
  );
  assert.throws(() =>
    formDestination(s, route, { ...lead, source: "growth_contact" }),
  );
  process.env.GHL_LAB_LOCATION_IDS = "lab-location";
  const labSession = { ...s, provision: { status: "configured", locationId: "lab-location" } } as typeof s;
  assert.throws(
    () =>
      formDestination(
        labSession,
        { ...route, location_id: "lab-location" },
        { ...lead, email: "qa@example.test" },
      ),
    /Una ruta LAB requiere una lista explícita de correos autorizados/,
  );
  assert.throws(
    () =>
      formDestination(
        labSession,
        { ...route, location_id: "lab-location", authorized_emails: ["qa@example.test"] },
        { ...lead, email: "real-customer@company.com" },
      ),
    /Una location LAB solo puede recibir correos de prueba sintéticos/,
  );
  assert.equal(
    formDestination(
      labSession,
      { ...route, location_id: "lab-location", authorized_emails: ["qa@example.test"] },
      { ...lead, email: "qa@example.test" },
    ).email,
    "qa@example.test",
  );
});

test("connection verification requires current consent, location, scope and a successful read before testing", async () => {
  const s = session();
  s.provision = { status: "configured", locationId: "approved-lab" };
  const h = stateful(s);
  const base = {
    action: "connection" as const,
    id: ba,
    locationId: "approved-lab",
    planVersion: 1,
    service: "forms" as const,
    scopes: ["forms.readonly"],
    reference: "QA-forms-42",
  };
  const run = (
    state: "authorized" | "connected" | "tested" | "revoked",
    user = actor,
    override = {},
  ) =>
    execute(
      h.state,
      user,
      { ...base, state, version: h.state.version, ...override },
      h.deps,
    );
  const operator = { ...actor, operator: true };
  await assert.rejects(run("connected", operator), /autorización/);
  await run("authorized");
  await assert.rejects(
    run("connected", operator, { locationId: "another-lab" }),
    /versión/,
  );
  await assert.rejects(
    run("connected", operator, { scopes: ["contacts.write"] }),
    /alcance/,
  );
  await assert.rejects(run("tested", operator), /Comprueba/);
  await run("connected", operator);
  await run("tested", operator);
  await run("revoked");
  await assert.rejects(run("connected", operator), /autorización/);
  assert.equal(h.state.plan?.connections?.length, 4);
  assert.equal(h.state.functional_ready_at, null);
});

test("the diagnostic keeps unknown figures, escapes customer input and shows actual evidence only", async () => {
  const { strategicRecord, renderStrategy } = await import(
    "../src/lib/onboarding/strategy"
  );
  const { assetPreview } = await import("../src/lib/onboarding/connections");
  const s = session();
  s.draft.answers.step2!.businessName = "<script>alert(1)</script>";
  s.diagnostic = strategicRecord(s.draft);
  assert.equal(s.diagnostic.estimatedOpportunityMonthly, undefined);
  const html = renderStrategy(s);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>|Costo de no actuar/);
  assert.match(html, /Días 31 a 90/);
  assert.ok(
    assetPreview(s).every((row) =>
      ["Propuesto", "Preparado"].includes(row.status),
    ),
  );
});

test("a delayed autosave cannot erase the context or plan after explicit completion", async () => {
  const h = stateful();
  const draft = structuredClone(h.state.draft);
  const stale = { ...draft, context: undefined };
  const planned = await execute(
    h.state,
    actor,
    { action: "plan", id: ba, version: h.state.version, draft },
    h.deps,
  );
  const after = await execute(
    planned,
    actor,
    {
      action: "save",
      id: ba,
      version: planned.version,
      draft: stale,
      autosave: true,
    },
    h.deps,
  );
  assert.deepEqual(after, planned);
  assert.ok(after.draft.context);
  assert.ok(after.plan);
});

test("an expressly assigned reusable LAB verifies the agency and exact location without using a commercial identity", async () => {
  const saved = process.env.GHL_LAB_LOCATION_IDS;
  process.env.GHL_LAB_LOCATION_IDS = "fixture-lab";
  try {
    const h = stateful();
    const operator = { ...actor, operator: true };
    const observed: Array<{ id: string; customer: boolean }> = [];
    const provider = h.deps.provider();
    provider.verifyLocation = async (id, expected) => {
      observed.push({ id, customer: !!expected });
    };
    const labRelease = {
      ...release,
      kind: "existing_lab" as const,
      locationId: "fixture-lab",
      inventoryReference: "fixture-lab-inventory-01",
    };
    const deps = { ...h.deps, release: () => labRelease, provider: () => provider };
    await execute(
      h.state,
      actor,
      {
        action: "approve_core",
        id: ba,
        version: h.state.version,
        accepted: true,
      },
      deps,
    );
    await execute(
      h.state,
      operator,
      {
        action: "evidence",
        id: ba,
        version: h.state.version,
        gate: "contract",
        kind: "real",
        outcome: "pass",
        reference: "QA-pilot-authority",
      },
      deps,
    );
    const bind = (locationId: string) =>
      execute(
        h.state,
        operator,
        {
          action: "bind_lab",
          id: ba,
          version: h.state.version,
          locationId,
          reference: "QA-pilot-authority",
        },
        deps,
      );
    await assert.rejects(bind("another-lab"), /LAB/);
    await bind("fixture-lab");
    assert.equal(h.state.provision.status, "waiting_provider",
      "Binding an existing LAB is not evidence that configuration has finished");
    await execute(
      h.state,
      operator,
      { action: "provision", id: ba, version: h.state.version },
      deps,
    );
    assert.equal(h.state.provision.status, "configured",
      "A separate provider verification/configuration must complete before form routing");
    assert.equal(h.state.provision.assetMode, "existing_lab");
    assert.equal(h.state.provision.snapshotId, undefined,
      "A LAB inventory must not be stored as an importable snapshot ID");
    assert.equal(h.creates, 0);
    assert.deepEqual(observed, [
      { id: "fixture-lab", customer: false },
      { id: "fixture-lab", customer: false },
    ]);
    await assert.rejects(bind("another-lab"));
  } finally {
    if (saved === undefined) delete process.env.GHL_LAB_LOCATION_IDS;
    else process.env.GHL_LAB_LOCATION_IDS = saved;
  }
});

test("existing LAB inventory cannot silently create a new location", async () => {
  const h = stateful();
  const labRelease = {
    ...release,
    kind: "existing_lab" as const,
    locationId: "fixture-lab",
    inventoryReference: "fixture-lab-inventory-01",
  };
  const saved = (s: OnboardingSession, p: OnboardingSession["provision"], e: string) =>
    h.deps.save(s, { provision: p }, e, "test");
  await assert.rejects(
    provisionSession(h.state, h.deps.provider(), saved, labRelease),
    /Vincula primero la LAB/,
  );
  assert.equal(h.creates, 0);
});

test("LAB credential validates agency and location, blocks cross-location and account creation before I/O", async (t) => {
  const { configuredProvider } = await import("../src/lib/ghl/provision-provider");
  const settings = {
    GHL_LAB_ACCESS_TOKEN: "fixture-lab-token",
    GHL_LAB_LOCATION_ID: "fixture-location",
    GHL_LAB_LOCATION_IDS: "fixture-location",
    GHL_COMPANY_ID: "fixture-agency",
    GHL_AGENCY_ACCESS_TOKEN: "unused-agency-fixture",
  };
  const previous = { ...process.env };
  Object.assign(process.env, settings);
  t.after(() => {
    for (const key of Object.keys(settings)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  const calls: string[] = [];
  const provider = configuredProvider(async (url, init) => {
    const path = new URL(String(url)).pathname;
    calls.push(path);
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer fixture-lab-token");
    if (path === "/locations/fixture-location")
      return Response.json({ location: { id: "fixture-location", companyId: "fixture-agency" } });
    assert.equal(path, "/contacts/upsert");
    return Response.json({ contact: { id: "test-contact", locationId: "fixture-location" } });
  });
  const contact = { locationId: "fixture-location", email: "qa@example.test", name: "QA", source: "dev_contact", customFields: [] };
  assert.equal(await provider.upsertFormContact(contact), "test-contact");
  await assert.rejects(provider.upsertFormContact({ ...contact, locationId: "growth" }), /limitada/);
  await assert.rejects(provider.checkCreate(session()), /autorización/);
  await assert.rejects(provider.createLocation(session(), release), /existente/);
  assert.deepEqual(calls, ["/locations/fixture-location", "/contacts/upsert"]);
  delete process.env.GHL_LAB_ACCESS_TOKEN;
  assert.throws(() => configuredProvider(), /credencial/);
});

test("white-label and legacy callbacks require the same origin and exact path", () => {
  const origin = "https://lab.example.test";
  for (const path of ["/api/connections/callback", "/api/ghl/oauth/callback"])
    assert.equal(validOAuthReturn(origin + path, origin + "/api/ghl/oauth/start"), true);
  for (const value of [
    "https://other.example.test/api/connections/callback",
    origin + "/api/connections/callback?next=other",
    origin + "/api/connections/callback/",
    origin + "/other",
  ])
    assert.equal(validOAuthReturn(value, origin + "/api/ghl/oauth/start"), false);
});

test("quickstart stays explicitly provisional, never invents six-step customer answers", () => {
  const result = buildQuickPlan(ba, answers.step2!, "leads", 3);
  assert.equal(result.plan.snapshotKey, "core-b2b");
  assert.equal(result.plan.memory.businessAccountId, ba);
  assert.equal(result.plan.memory.facts.find((f) => f.key === "step2.businessName")?.status, "confirmed");
  assert.equal(result.plan.memory.facts.find((f) => f.key === "context.preserve")?.status, "inferred");
  assert.equal(result.plan.memory.facts.find((f) => f.key === "plan_mode")?.value, "qa_quickstart");
  assert.ok(result.plan.memory.unknowns.length >= 4);
  assert.ok(result.plan.memory.recommendations.every((r) =>
    r.evidenceKeys.every((k) => result.plan.memory.facts.some((f) => f.key === k))
  ));
  assert.ok(result.plan.modules.every((m) => !m.consent));
  assert.deepEqual(result.plan.modules.filter((m) => m.required).map((m) => m.id), ["crm", "forms"]);
  assert.equal(result.plan.memory.agentPolicy.paidAI, "disabled");
  assert.equal(result.context.requiredChannels.length, 0);
  assert.doesNotThrow(() => contextSchema.parse(result.context));
});
test("quickstart requires QA allowlist and authenticated owner; does not provision or create evidence", async () => {
  const s = session();
  s.draft = {
    currentStep: 2,
    answers: { step2: structuredClone(answers.step2), step3_b2b: null, step3_b2c: null, step4: null, step5: null, step6: null },
  };
  s.plan = null;
  s.evidence = [];
  const h = stateful(s);
  const envEnabled = process.env.ONBOARDING_QA_QUICK_PLAN_ENABLED;
  const envId = process.env.ONBOARDING_QA_SESSION_ID;
  const cmd = { action: "quick_plan" as const, id: ba, version: s.version, goal: "leads" as const, acceptedAssumptions: true as const };
  try {
    process.env.ONBOARDING_QA_QUICK_PLAN_ENABLED = "true";
    process.env.ONBOARDING_QA_SESSION_ID = other;
    await assert.rejects(execute(h.state, actor, cmd, h.deps), /QA/);
    process.env.ONBOARDING_QA_SESSION_ID = ba;
    await assert.rejects(execute(h.state, { ...actor, userId: other }, cmd, h.deps), /QA/);
    const result = await execute(h.state, actor, cmd, h.deps);
    assert.equal(result.plan?.version, result.version);
    assert.equal(result.provision.status, "not_started");
    assert.equal(result.diagnostic, null);
    assert.deepEqual(result.evidence, []);
    assert.equal(h.creates, 0);
    assert.equal(h.configs, 0);
    assert.equal(result.draft.answers.step3_b2b, null);
    await assert.rejects(execute(h.state, actor, { ...cmd, version: h.state.version }, h.deps), /plan/);
  } finally {
    if (envEnabled === undefined) delete process.env.ONBOARDING_QA_QUICK_PLAN_ENABLED;
    else process.env.ONBOARDING_QA_QUICK_PLAN_ENABLED = envEnabled;
    if (envId === undefined) delete process.env.ONBOARDING_QA_SESSION_ID;
    else process.env.ONBOARDING_QA_SESSION_ID = envId;
  }
});
