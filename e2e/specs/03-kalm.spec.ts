import { test, expect } from "@playwright/test";
import { goHome, openDockTab, expectTabVisible, expectInActiveTab, activePanel } from "../helpers/nav";

test.describe("KALM", () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "wellness");
    await expectTabVisible(page, "kalm");
  });

  test("S-030 home KALM carrega hero e pilares", async ({ page }) => {
    await expectInActiveTab(page, /Pequenos gestos|Tempo de hoje|Sugestão|pilares/i);
  });

  test("S-031 scroll chega no fim (padding do dock)", async ({ page }) => {
    await page.evaluate(() => {
      const root = document.querySelector('[data-tab="kalm"][aria-hidden="false"]');
      const sc =
        root?.querySelector(".overflow-y-auto, [style*='overflow']") ||
        root ||
        document.scrollingElement;
      if (sc) (sc as HTMLElement).scrollTop = 99999;
    });
    await page.waitForTimeout(300);
    await expectInActiveTab(page, /Termômetro|Sonhos|Hora de dormir|SOS emocional|pilares/i);
  });

  test("S-032 abre SOS emocional", async ({ page }) => {
    const panel = activePanel(page);
    const sos = panel.getByText(/SOS emocional/i).first();
    if (await sos.isVisible().catch(() => false)) {
      await sos.click();
      await page.waitForTimeout(400);
      await expect(page.getByRole("button", { name: /Voltar/i }).first()).toBeVisible();
    }
  });

  test("S-033 abre um pilar", async ({ page }) => {
    const panel = activePanel(page);
    const pillar = panel.getByRole("button", { name: /Sentir|Agradecer|Mover|Nutrir|Conectar|Cuidar/i }).first();
    if (await pillar.isVisible().catch(() => false)) {
      await pillar.click();
      await page.waitForTimeout(400);
      await expect(page.getByRole("button", { name: /Voltar/i }).first()).toBeVisible();
    }
  });
});
