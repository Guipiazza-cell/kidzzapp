import { test, expect } from "@playwright/test";
import { goHome, openDockTab, expectTabVisible, expectInActiveTab, activePanel } from "../helpers/nav";

test.describe("Descobrir", () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "discover");
    await expectTabVisible(page, "descobrir");
  });

  test("S-020 hero Descobrir e temas", async ({ page }) => {
    await expectInActiveTab(page, /Descobrir|explorar o mundo/i);
    await expectInActiveTab(page, /Explore por temas/i);
  });

  test("S-021 abre um tema", async ({ page }) => {
    const panel = activePanel(page);
    // ThemeCard costuma ser o card grande do tema
    const themeCard = panel.getByText("Animais", { exact: true }).first();
    await expect(themeCard).toBeVisible();
    await themeCard.click({ force: true });
    await page.waitForTimeout(500);
    await expect(
      page.getByRole("button", { name: /Voltar/i }).or(panel.getByText(/Mãos à obra|descoberta|atividade/i)).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
