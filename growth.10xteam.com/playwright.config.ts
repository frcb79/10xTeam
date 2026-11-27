import { defineConfig } from "@playwright/test";
const baseURL = process.env.WIZARD_TEST_URL ?? "http://127.0.0.1:3305";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname))
  throw new Error("Run synthetic wizard tests only on loopback.");
export default defineConfig({
  testDir: "tests/browser",
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL,
    headless: true,
    launchOptions: {
      executablePath: process.env.WIZARD_CHROMIUM_PATH || undefined,
      args: process.env.WIZARD_CHROMIUM_PATH
        ? [
            "--no-sandbox",
            "--no-zygote",
            "--disable-gpu",
            "--disable-software-rasterizer",
          ]
        : [],
    },
  },
});
