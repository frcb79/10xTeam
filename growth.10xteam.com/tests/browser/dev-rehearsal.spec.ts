import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

test("Dev starts at the first screen and can reopen its own strategic diagnosis", async ({
  page,
  browser,
  baseURL,
}) => {
  const elapsed: Record<string, number> = {};
  let previous = performance.now();
  const mark = (step: string) => {
    const now = performance.now();
    elapsed[step] = Math.round(now - previous);
    previous = now;
  };
  const next = () =>
    page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.goto("/wizard/step/1");
  await page
    .getByRole("button", { name: /manual/i })
    .first()
    .click();
  await expect(page).toHaveURL(/step\/2$/);
  mark("entrada");
  await page.getByPlaceholder(/Ej. Credito Negocios/).fill("10xTeam Dev");
  await page
    .getByPlaceholder(/Ayudamos a/)
    .fill(
      "Desarrollo B2B. Llave en Mano desde US$1,249 por proyecto y 10x Dev Squad desde US$2,499 mensuales.",
    );
  for (const [i, value] of [
    "tecnologia",
    "servicio",
    "hibrido",
    "unknown",
    "unknown",
    "unknown",
  ].entries())
    await page.locator("select").nth(i).selectOption(value);
  await next();
  await expect(page).toHaveURL(/step\/3$/);
  mark("negocio");
  await page
    .locator("main input")
    .first()
    .fill("Empresa que requiere desarrollo tecnológico. Cargo por confirmar.");
  await page
    .locator("main textarea")
    .nth(0)
    .fill("Necesidad específica del comprador por confirmar en entrevista.");
  await page
    .locator("main textarea")
    .nth(1)
    .fill("Entregar un proyecto tecnológico o sumar un equipo de desarrollo.");
  await next();
  await expect(page).toHaveURL(/step\/4$/);
  mark("cliente");
  await page
    .locator("main textarea")
    .last()
    .fill("Estrategia de negocio, diseño, producto, ingeniería e IA.");
  await next();
  await expect(page).toHaveURL(/step\/5$/);
  mark("proceso");
  await page.getByRole("button", { name: /Continuar a econo/ }).click();
  await expect(page).toHaveURL(/step\/6$/);
  mark("canales");
  await page
    .getByPlaceholder(/Implantes dentales/)
    .fill("Llave en Mano por proyecto y 10x Dev Squad mensual");
  await page.getByPlaceholder("Nombre completo").fill("Titular sintético QA");
  await page
    .getByPlaceholder("nombre@empresa.com")
    .fill("dev-pilot@example.test");
  await page.getByPlaceholder(/5512345678/).fill("2025550110");
  await page
    .locator("select")
    .filter({ has: page.locator('option[value="mixed"]') })
    .selectOption("mixed");
  await page
    .locator("select")
    .filter({ has: page.locator('option[value="quarterly"]') })
    .selectOption("monthly");
  await page.locator("main button").last().click();
  await expect(
    page.getByText("Objetivos y continuidad", { exact: true }),
  ).toBeVisible();
  mark("oferta");
  await page
    .getByLabel(/resultado medible/)
    .fill(
      "Captar prospectos calificados, convertirlos en oportunidades y darles seguimiento.",
    );
  await page.getByLabel(/Dónde se detiene/).selectOption("followup");
  await page
    .getByLabel(/Qué debemos conservar al configurar/)
    .fill("Landing, formulario existente y marca corporativa de 10xTeam.");
  await page.getByLabel(/comparte redes/).check();
  await page.getByLabel("Agenda", { exact: true }).check();
  await page.getByText("Marca, contenido y configuración regional").click();
  await page
    .getByLabel(/Sitio que debemos conservar/)
    .fill("https://dev.10xteam.com.mx");
  mark("objetivos");
  await page
    .getByRole("button", { name: "Guardar y preparar mi configuración" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tu plan de configuración" }),
  ).toBeVisible();
  mark("generar_plan");
  const url = await page
    .getByRole("link", { name: "Abrir diagnóstico completo" })
    .getAttribute("href");
  const response = await page.request.get(url!);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("US$2,499");
  expect(html).toContain("Días 31 a 90");
  expect(html).not.toContain("Costo de no actuar");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Tu plan de configuración" }),
  ).toBeVisible();
  const { session, readiness } = await (
    await page.request.get("/api/onboarding")
  ).json();
  expect(session.draft.answers.step6.clientValue).toBe("");
  expect(session.plan.memory.businessAccountId).toBe(session.id);
  expect(readiness.gates.every((g: { passed: boolean }) => !g.passed)).toBe(
    true,
  );
  const unrelated = await browser.newContext({ baseURL });
  expect((await unrelated.request.get(url!)).status()).toBe(404);
  await unrelated.close();
  const landingHeaders = { Origin: "https://dev.10xteam.com.mx" };
  for (const serviceType of ["mvp", "celula"]) {
    const posted = await page.request.post("/api/contact", {
      headers: landingHeaders,
      data: {
        name: "Prueba de landing",
        email: "dev-form@example.test",
        serviceType,
      },
    });
    expect(posted.ok()).toBe(true);
    expect(posted.headers()["access-control-allow-origin"]).toBe(
      landingHeaders.Origin,
    );
  }
  expect(
    (
      await page.request.post("/api/contact", {
        headers: { Origin: "https://invalid.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  const gates = readiness.gates.length;
  console.log(
    "DEV_REHEARSAL",
    JSON.stringify({
      elapsed,
      gates,
      archetype: session.plan.archetype,
      snapshot: session.plan.snapshotKey,
    }),
  );
  const dir = process.env.WIZARD_QA_EVIDENCE_DIR;
  if (dir) {
    await writeFile(
      join(dir, "dev-session.json"),
      JSON.stringify({
        draft: session.draft,
        plan: session.plan,
        diagnostic: session.diagnostic,
      }),
    );
    await writeFile(join(dir, "dev-report.html"), html);
    await page.screenshot({
      path: join(dir, "dev-preview.png"),
      fullPage: true,
    });
  }
});
