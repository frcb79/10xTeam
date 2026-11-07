import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("the compiled Dev form captures both offers once per destination and waitlist replays preserve the first signup", async ({
  page,
  request,
  baseURL,
}) => {
  const rest = process.env.WIZARD_TEST_POSTGREST_URL;
  const key = process.env.WIZARD_TEST_SERVICE_KEY;
  test.skip(
    !rest || !key,
    "Requires disposable PostgREST with dev-form-fixture.sql",
  );
  expect(new URL(rest!).hostname).toBe("127.0.0.1");
  expect(new URL(baseURL!).hostname).toBe("127.0.0.1");
  const dbHeaders = { apikey: key!, Authorization: "Bearer " + key! };
  const mailbox = "dev-replay@example.test";
  const liveOrigin = "https://dev.10xteam.com.mx";
  const html = await readFile("../dev.10xteam.com/dist/index.html", "utf8");
  const capture = new URL("/api/contact", baseURL).href;
  // All document subrequests are intercepted. The original script posts only to the local backend.
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url === liveOrigin + "/")
      return route.fulfill({ contentType: "text/html", body: html });
    if (url !== "https://growth.10xteam.com.mx/api/contact")
      return route.abort();
    const cors = {
      "Access-Control-Allow-Origin": liveOrigin,
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    };
    if (route.request().method() === "OPTIONS")
      return route.fulfill({ status: 204, headers: cors });
    const response = await request.post(capture, {
      headers: { Origin: liveOrigin },
      data: route.request().postDataJSON(),
    });
    expect(response.status()).toBe(201);
    return route.fulfill({ response });
  });
  await page.goto(liveOrigin + "/");
  const form = page.locator("#contact-form");
  for (const offer of ["mvp", "celula", "mvp"]) {
    await form.locator('[name="name"]').fill("QA Dev");
    await form.locator('[name="email"]').fill(mailbox);
    await form.locator('[name="serviceType"]').selectOption(offer);
    await form
      .locator('[name="message"]')
      .fill("Prueba interna de clasificación.");
    const sent = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/contact") && r.request().method() === "POST",
    );
    await form.getByRole("button", { name: /Enviar Proyecto/ }).click();
    await sent;
    await expect(form.locator('[name="email"]')).toHaveValue("");
  }
  const rows = await request.get(rest! + "/onboarding_form_outbox", {
    headers: dbHeaders,
    params: {
      identity_email: "eq." + mailbox,
      select: "offer_key,location_id,status",
      order: "offer_key",
    },
  });
  expect(rows.ok()).toBe(true);
  expect(await rows.json()).toEqual(
    ["celula", "mvp"].map((offer_key) => ({
      offer_key,
      location_id: "synthetic-dev-form",
      status: "pending",
    })),
  );
  const waitlist = (name: string) =>
    request.post("/api/waitlist", {
      data: { email: "waitlist-only@example.test", name, company: "Fixture" },
    });
  const first = await waitlist("Titular original");
  expect(first.status()).toBe(200);
  const duplicate = await waitlist("Cambio sin autorización");
  expect(duplicate.status()).toBe(200);
  expect((await duplicate.json()).id).toBeUndefined();
  const saved = await request.get(rest! + "/contact_leads", {
    headers: dbHeaders,
    params: { email: "eq.waitlist-only@example.test", select: "name" },
  });
  expect(await saved.json()).toEqual([{ name: "Titular original" }]);
});
