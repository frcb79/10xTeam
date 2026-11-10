import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { setupDb } from "./schema-db";
import { ba, owner, session } from "./fixtures";
import { formDestination } from "../src/lib/onboarding/form-delivery";

test("isolated LAB route requires explicit synthetic authorized_emails, rejects empty/absent/non-synthetic lists, and prevents unsafe rollback", async () => {
  const db = await setupDb();
  const isolateSql = await readFile("docs/onboarding/isolate-test-form-routes.sql", "utf8");
  const revertSql = await readFile("docs/onboarding/revert-isolate-test-form-routes.sql", "utf8");

  try {
    // 1. Apply isolation SQL
    await db.exec(isolateSql);
    await db.query("insert into auth.users (id) values ($1) on conflict do nothing", [owner]);

    // 2. Prepare a configured session in DB
    const s = session();
    s.provision = { status: "configured", locationId: "Be3Voe6UoPjiAawaQUCK" };
    s.plan!.modules.find((m) => m.id === "forms")!.consent = {
      actorId: owner,
      at: s.created_at,
      scope: "prepare_forms_no_paid_services",
      planVersion: 1,
    };
    await db.query(
      "insert into onboarding_sessions(id, owner_user_id, plan, provision) values ($1, $2, $3, $4)",
      [ba, owner, JSON.stringify(s.plan), JSON.stringify(s.provision)],
    );

    // 3. Test SQL constraints on public.onboarding_form_routes:
    // 3a. Rejects empty list {}
    await assert.rejects(
      db.query(
        `insert into onboarding_form_routes (source, session_id, location_id, service_field_id, approval_reference, enabled, authorized_emails)
         values ('dev_contact', $1, 'Be3Voe6UoPjiAawaQUCK', 'wLVPrSyDs6x5ZUfKABYv', 'APPROVAL-LAB-DEV', true, '{}')`,
        [ba],
      ),
      /check_lab_authorized_emails/,
      "Database must reject enabling Consultoria LAB route with empty authorized_emails",
    );

    // 3b. Rejects non-synthetic email in authorized_emails
    await assert.rejects(
      db.query(
        `insert into onboarding_form_routes (source, session_id, location_id, service_field_id, approval_reference, enabled, authorized_emails)
         values ('dev_contact', $1, 'Be3Voe6UoPjiAawaQUCK', 'wLVPrSyDs6x5ZUfKABYv', 'APPROVAL-LAB-DEV', true, array['prospecto-real@gmail.com'])`,
        [ba],
      ),
      /check_lab_authorized_emails/,
      "Database must reject enabling Consultoria LAB route with non-synthetic email in authorized_emails",
    );

    // 4. Insert valid route with exactly authorized synthetic email
    await db.query(
      `insert into onboarding_form_routes (source, session_id, location_id, service_field_id, approval_reference, enabled, authorized_emails)
       values ('dev_contact', $1, 'Be3Voe6UoPjiAawaQUCK', 'wLVPrSyDs6x5ZUfKABYv', 'APPROVAL-LAB-DEV', true, array['qa-dev-20261107@example.test'])`,
      [ba],
    );

    const countQueue = async () =>
      Number(
        (await db.query<{ n: string }>("select count(*) as n from onboarding_form_outbox")).rows[0].n,
      );

    // 5. Commercial real lead arrives -> Outbox = 0
    await db.query(
      `insert into contact_leads (name, email, service_type, source)
       values ('Real Prospect', 'cliente-real@empresa.com', 'mvp', 'dev_contact')`,
    );
    assert.equal(await countQueue(), 0, "Commercial lead was improperly queued to LAB!");

    // 6. Non-authorized synthetic test lead arrives -> Outbox = 0
    await db.query(
      `insert into contact_leads (name, email, service_type, source)
       values ('Non Authorized QA', 'otro-qa@example.test', 'mvp', 'dev_contact')`,
    );
    assert.equal(await countQueue(), 0, "Unauthorized QA email was improperly queued to LAB!");

    // 7. Exactly authorized synthetic QA lead arrives for mvp -> Outbox = 1
    await db.query(
      `insert into contact_leads (name, email, service_type, source)
       values ('QA Tester', 'qa-dev-20261107@example.test', 'mvp', 'dev_contact')`,
    );
    assert.equal(await countQueue(), 1, "Authorized QA lead was not queued!");

    // 8. Exactly authorized synthetic QA lead arrives for celula -> Outbox = 2
    await db.query(
      `insert into contact_leads (name, email, service_type, source)
       values ('QA Tester', 'qa-dev-20261107@example.test', 'celula', 'dev_contact')`,
    );
    assert.equal(await countQueue(), 2);

    const { rows } = await db.query(
      "select identity_email, offer_key, location_id from onboarding_form_outbox order by offer_key",
    );
    assert.deepEqual(rows, [
      { identity_email: "qa-dev-20261107@example.test", offer_key: "celula", location_id: "Be3Voe6UoPjiAawaQUCK" },
      { identity_email: "qa-dev-20261107@example.test", offer_key: "mvp", location_id: "Be3Voe6UoPjiAawaQUCK" },
    ]);

    // 9. Worker validation in formDestination:
    process.env.GHL_LAB_LOCATION_IDS = "Be3Voe6UoPjiAawaQUCK";
    const baseRoute = {
      source: "dev_contact",
      session_id: ba,
      location_id: "Be3Voe6UoPjiAawaQUCK",
      service_field_id: "wLVPrSyDs6x5ZUfKABYv",
      enabled: true,
    };

    // 9a. Rejects when authorized_emails is absent (undefined)
    assert.throws(
      () =>
        formDestination(s, { ...baseRoute }, {
          name: "Test",
          email: "qa-dev-20261107@example.test",
          service_type: "mvp",
          source: "dev_contact",
        }),
      /Una ruta LAB requiere una lista explícita de correos autorizados/,
    );

    // 9b. Rejects when authorized_emails is empty array []
    assert.throws(
      () =>
        formDestination(s, { ...baseRoute, authorized_emails: [] }, {
          name: "Test",
          email: "qa-dev-20261107@example.test",
          service_type: "mvp",
          source: "dev_contact",
        }),
      /Una ruta LAB requiere una lista explícita de correos autorizados/,
    );

    // 9c. Rejects non-synthetic email (.com instead of .test)
    assert.throws(
      () =>
        formDestination(s, { ...baseRoute, authorized_emails: ["qa-dev-20261107@example.test"] }, {
          name: "Test",
          email: "real-customer@company.com",
          service_type: "mvp",
          source: "dev_contact",
        }),
      /Una location LAB solo puede recibir correos de prueba sintéticos/,
    );

    // 9d. Rejects synthetic email not in authorized list
    assert.throws(
      () =>
        formDestination(s, { ...baseRoute, authorized_emails: ["qa-dev-20261107@example.test"] }, {
          name: "Test",
          email: "unauthorized@example.test",
          service_type: "mvp",
          source: "dev_contact",
        }),
      /El correo no figura en la lista de correos autorizados para esta LAB/,
    );

    // 9e. Succeeds with authorized synthetic email
    const target = formDestination(s, { ...baseRoute, authorized_emails: ["qa-dev-20261107@example.test"] }, {
      name: "QA Tester",
      email: "qa-dev-20261107@example.test",
      service_type: "mvp",
      source: "dev_contact",
    });
    assert.equal(target.email, "qa-dev-20261107@example.test");
    assert.equal(target.customFields[0].field_value, "Llave en Mano");

    // 10. Rollback safety:
    // 10a. While outbox has pending jobs, revertSql must ABORT to protect in-flight data!
    await assert.rejects(
      db.exec(revertSql),
      /No se puede revertir el aislamiento: existen \d+ trabajos pendientes/,
      "Rollback must fail if there are pending jobs for the LAB",
    );
    await db.exec("rollback;");
    const stillDisabled = await db.query(
      "select enabled from onboarding_form_routes where location_id = 'Be3Voe6UoPjiAawaQUCK'",
    );
    assert.equal(stillDisabled.rows[0]?.enabled, false,
      "LAB route must remain disabled even when rollback aborts on pending work");
    const isolationStillPresent = await db.query(
      "select column_name from information_schema.columns where table_name = 'onboarding_form_routes' and column_name = 'authorized_emails'",
    );
    assert.equal(isolationStillPresent.rows.length, 1,
      "Isolation must remain installed if rollback phase 2 aborts");

    // 10b. After processing jobs to done, revertSql succeeds, disables LAB route, and drops columns
    await db.query("update onboarding_form_outbox set status = 'done' where location_id = 'Be3Voe6UoPjiAawaQUCK'");
    await db.exec(revertSql);

    const hasCol = await db.query(
      `select column_name from information_schema.columns
       where table_name = 'onboarding_form_routes' and column_name = 'authorized_emails'`,
    );
    assert.equal(hasCol.rows.length, 0, "authorized_emails column was not dropped on revert");

    const labRoute = await db.query(
      "select enabled from onboarding_form_routes where location_id = 'Be3Voe6UoPjiAawaQUCK'",
    );
    assert.equal(labRoute.rows[0]?.enabled, false, "LAB route must be disabled after rollback");
  } finally {
    await db.close();
  }
});
