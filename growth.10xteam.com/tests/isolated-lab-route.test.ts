import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { setupDb } from "./schema-db";
import { ba, owner, session } from "./fixtures";
import { formDestination } from "../src/lib/onboarding/form-delivery";

test("isolated LAB route requires explicit authorized_emails, rejects empty lists, and blocks commercial leads", async () => {
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

    // 3. Test constraint: Consultoria LAB cannot be enabled with empty authorized_emails
    await assert.rejects(
      db.query(
        `insert into onboarding_form_routes (source, session_id, location_id, service_field_id, approval_reference, enabled, authorized_emails)
         values ('dev_contact', $1, 'Be3Voe6UoPjiAawaQUCK', 'wLVPrSyDs6x5ZUfKABYv', 'APPROVAL-LAB-DEV', true, '{}')`,
        [ba],
      ),
      /check_lab_authorized_emails/,
      "Database must reject enabling Consultoria LAB route without explicit authorized_emails",
    );

    // 4. Insert valid route with explicit authorized_emails = array['qa-dev-20261107@example.test']
    await db.query(
      `insert into onboarding_form_routes (source, session_id, location_id, service_field_id, approval_reference, enabled, authorized_emails)
       values ('dev_contact', $1, 'Be3Voe6UoPjiAawaQUCK', 'wLVPrSyDs6x5ZUfKABYv', 'APPROVAL-LAB-DEV', true, array['qa-dev-20261107@example.test'])`,
      [ba],
    );

    const countQueue = async () =>
      Number(
        (await db.query<{ n: string }>("select count(*) as n from onboarding_form_outbox")).rows[0].n,
      );

    // 5. Commercial real lead arrives (e.g. from real dev.10xteam.com form)
    await db.query(
      `insert into contact_leads (name, email, service_type, source)
       values ('Real Prospect', 'cliente-real@empresa.com', 'mvp', 'dev_contact')`,
    );
    assert.equal(await countQueue(), 0, "Commercial lead was improperly queued to LAB!");

    // 6. Non-authorized synthetic test lead arrives
    await db.query(
      `insert into contact_leads (name, email, service_type, source)
       values ('Non Authorized QA', 'otro-qa@example.test', 'mvp', 'dev_contact')`,
    );
    assert.equal(await countQueue(), 0, "Unauthorized QA email was improperly queued to LAB!");

    // 7. Exactly authorized synthetic QA lead arrives for mvp
    await db.query(
      `insert into contact_leads (name, email, service_type, source)
       values ('QA Tester', 'qa-dev-20261107@example.test', 'mvp', 'dev_contact')`,
    );
    assert.equal(await countQueue(), 1, "Authorized QA lead was not queued!");

    // 8. Exactly authorized synthetic QA lead arrives for celula
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

    // 9. Worker validation in formDestination
    process.env.GHL_LAB_LOCATION_IDS = "Be3Voe6UoPjiAawaQUCK";
    const routeData = {
      source: "dev_contact",
      session_id: ba,
      location_id: "Be3Voe6UoPjiAawaQUCK",
      service_field_id: "wLVPrSyDs6x5ZUfKABYv",
      enabled: true,
      authorized_emails: ["qa-dev-20261107@example.test"],
    };

    // Fails on non-synthetic
    assert.throws(
      () =>
        formDestination(s, routeData, {
          name: "Test",
          email: "real@company.com",
          service_type: "mvp",
          source: "dev_contact",
        }),
      /Una location LAB solo puede recibir correos de prueba sintéticos/,
    );

    // Fails on non-authorized synthetic
    assert.throws(
      () =>
        formDestination(s, routeData, {
          name: "Test",
          email: "unauthorized@example.test",
          service_type: "mvp",
          source: "dev_contact",
        }),
      /El correo no figura en la lista de correos autorizados para esta LAB/,
    );

    // Passes on authorized QA lead
    const target = formDestination(s, routeData, {
      name: "QA Tester",
      email: "qa-dev-20261107@example.test",
      service_type: "mvp",
      source: "dev_contact",
    });
    assert.equal(target.email, "qa-dev-20261107@example.test");
    assert.equal(target.customFields[0].field_value, "Llave en Mano");

    // 10. Revert SQL execution
    await db.exec(revertSql);
    const hasCol = await db.query(
      `select column_name from information_schema.columns
       where table_name = 'onboarding_form_routes' and column_name = 'authorized_emails'`,
    );
    assert.equal(hasCol.rows.length, 0, "authorized_emails column was not dropped on revert");
  } finally {
    await db.close();
  }
});
