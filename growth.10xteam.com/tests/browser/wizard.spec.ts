import { test, expect } from "@playwright/test";
test("new business completes the six steps, preserves its site, changes objectives and resumes its private plan", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto("/wizard/step/1");
  await page
    .getByRole("button", { name: /manual/i })
    .first()
    .click();
  await expect(page).toHaveURL(/step\/2$/);
  await page.getByPlaceholder(/Ej. Credito Negocios/).fill("Taller Nube QA");
  await page
    .getByPlaceholder(/Ayudamos a/)
    .fill(
      "Diseñamos sistemas de inventario para empresas distribuidoras en México.",
    );
  for (const [index, value] of [
    "tecnologia",
    "servicio",
    "venta_unica",
    "10000_50000",
    "40_60",
    "anual",
  ].entries()) {
    await page.locator("select").nth(index).selectOption(value);
  }
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page).toHaveURL(/step\/3$/);
  await page.locator("main input").first().fill("Director de operaciones");
  await page
    .locator("main textarea")
    .nth(0)
    .fill("No conoce el inventario antes de prometer una entrega.");
  await page
    .locator("main textarea")
    .nth(1)
    .fill("Confirmar inventario y entregar a tiempo.");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page).toHaveURL(/step\/4$/);
  for (const t of await page.locator("main textarea").all())
    await t.fill("Revisar las existencias antes de confirmar cada pedido.");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page).toHaveURL(/step\/5$/);
  await page.getByRole("button", { name: /Continuar a econo/ }).click();
  await expect(page).toHaveURL(/step\/6$/);
  await page
    .getByPlaceholder(/Implantes dentales/)
    .fill("Sistema de inventario para distribución");
  await page.getByPlaceholder(/8500/).fill("25000");
  await page.getByPlaceholder("Nombre completo").fill("Persona de prueba");
  await page.getByPlaceholder("nombre@empresa.com").fill("prueba@example.test");
  await page.getByPlaceholder(/5512345678/).fill("2025550100");
  await page.locator("main button").last().click();
  await expect(
    page.getByText("Objetivos y continuidad", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel(/Qué resultado quieres conseguir primero/)
    .selectOption("appointments");
  await expect(page.getByLabel(/Quién atiende las citas/)).toBeVisible();
  await page
    .getByLabel(/Qué resultado quieres conseguir primero/)
    .selectOption("leads");
  await expect(page.getByLabel(/Quién atiende las citas/)).toHaveCount(0);
  await page
    .getByLabel(/resultado medible/)
    .fill("Conseguir cinco solicitudes calificadas al mes");
  await page
    .getByLabel(/Qué debemos conservar al configurar/)
    .fill("El formulario y el tono de marca actuales");
  await page
    .getByRole("button", { name: "Guardar y preparar mi configuración" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tu plan de configuración" }),
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.getByRole("heading", { name: "Tus prioridades" }),
  ).toBeVisible();
  const report = await page
    .getByRole("link", { name: "Abrir diagnóstico completo" })
    .getAttribute("href");
  expect((await page.request.get(report!)).status()).toBe(200);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Tu plan de configuración" }),
  ).toBeVisible();
  const own = await (await page.request.get("/api/onboarding")).json();
  expect(own.session.draft.answers.step2.businessName).toBe("Taller Nube QA");
  expect(own.session.guest_hash).toBeUndefined();
  expect(own.readiness.ready).toBe(false);
  const second = await browser.newContext({ baseURL });
  const another = await second.newPage();
  await another.goto("/wizard/step/1");
  await another
    .getByRole("button", { name: /manual/i })
    .first()
    .waitFor();
  expect(
    (
      await another.request.get("/api/onboarding?id=" + own.session.id)
    ).status(),
  ).toBe(404);
  expect((await another.request.get(report!)).status()).toBe(404);
  await second.close();
});
