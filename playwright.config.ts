import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT || 8080);
const BASE_URL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;

/**
 * Playwright E2E — Kidzz product suite
 * - webServer sobe o Vite local (sem mock de UI)
 * - mobile-first (iPhone 13) + desktop smoke
 * - guest bootstrap via storageState / fixtures (sem credenciais de produção)
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,
  timeout: 60_000,
  expect: { timeout: 12_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "e2e-report" }],
    ["json", { outputFile: "e2e-report/results.json" }],
  ],
  outputDir: "e2e-results",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    actionTimeout: 12_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "mobile-chrome",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        // Viewport iPhone 13 sem depender do WebKit instalado
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        storageState: "e2e/.auth/guest.json",
      },
      testIgnore: /.*\.setup\.ts/,
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --host 127.0.0.1 --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
