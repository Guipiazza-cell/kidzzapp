import { test, expect } from "@playwright/test";
import { goHome, openDockTab } from "../helpers/nav";

/**
 * Gates free — prova que CTAs de assinar / liberar existem.
 * Não compra de verdade (sem Stripe prod).
 */
test.describe("Paywall e CTAs free", () => {
  test("S-080 pill Liberar tudo / Assinar na home", async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "chat");

    const cta = page.getByRole("button", { name: /Liberar tudo|Assinar|Premium/i }).first();
    await expect(cta).toBeVisible({ timeout: 12_000 });
    await cta.click();
    await page.waitForTimeout(500);

    // Modal de planos / paywall ou navegação
    const modal = page.getByText(/plano|premium|assinar|continuar|Stripe|família|ilimitad/i).first();
    await expect(modal).toBeVisible({ timeout: 10_000 });
  });
});
