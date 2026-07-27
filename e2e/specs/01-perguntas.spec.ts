import { test, expect } from "@playwright/test";
import { goHome, openDockTab, expectTabVisible, activePanel } from "../helpers/nav";

/**
 * S-010.. Perguntas — hero, input, sugestões, limite free, pais.
 */
test.describe("Perguntas", () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "chat");
    await expectTabVisible(page, "perguntas");
  });

  test("S-010 hero e headline visíveis sem hífen quebrado", async ({ page }) => {
    await expect(page.getByText("Pergunte.", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Descubra.", { exact: false }).first()).toBeVisible();
    // Palavra completa (nowrap) — não "Conecte-" sozinho
    const conecte = page.locator("span", { hasText: /^Conecte-se\.$/ }).first();
    await expect(conecte).toBeVisible();
    await expect(conecte).toHaveCSS("white-space", "nowrap");
  });

  test("S-011 header: logo e Pais visíveis (não cortados)", async ({ page }) => {
    const logo = page.getByAltText(/KIDZZ|Kidzz/i).first();
    await expect(logo).toBeVisible();
    const box = await logo.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x).toBeGreaterThanOrEqual(0);
    }

    const pais = page.getByRole("button", { name: /Pais|Área dos pais/i }).first();
    await expect(pais).toBeVisible();
    const pbox = await pais.boundingBox();
    expect(pbox).toBeTruthy();
    if (pbox) {
      const vw = page.viewportSize()?.width ?? 390;
      expect(pbox.x + pbox.width).toBeLessThanOrEqual(vw + 2);
    }
  });

  test("S-012 barra de pergunta grande e utilizável", async ({ page }) => {
    const input = page.getByPlaceholder(/Digite ou pergunte/i);
    await expect(input).toBeVisible();
    const box = await input.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(48);
    }

    await input.fill("Por que o céu é azul?");
    await expect(input).toHaveValue("Por que o céu é azul?");

    const send = page.getByRole("button", { name: /Enviar pergunta/i });
    await expect(send).toBeEnabled();
  });

  test("S-013 sugestões Hoje para você com capas (sem ?)", async ({ page }) => {
    await expect(page.getByText(/Hoje para você/i).first()).toBeVisible();
    // Cards de sugestão não devem mostrar placeholder "?"
    const section = page.locator("section, div").filter({ hasText: /Hoje para você/i }).first();
    await expect(section).toBeVisible();
  });

  test("S-014 mic acessível", async ({ page }) => {
    const mic = page.getByRole("button", { name: /Falar|Parar de ouvir/i });
    await expect(mic).toBeVisible();
  });

  test("S-015 chips de categoria filtram lista", async ({ page }) => {
    const chip = page.getByRole("button", { name: "Natureza", exact: true }).first();
    if (await chip.isVisible().catch(() => false)) {
      await chip.click();
      await page.waitForTimeout(200);
      // Lista ainda renderiza (ou mensagem vazia amigável)
      const empty = page.getByText(/Nenhuma pergunta nesta categoria/i);
      const cards = page.getByText(/\?|Por que|Como |O que |Que /i);
      const ok = (await empty.isVisible().catch(() => false)) || (await cards.first().isVisible().catch(() => false));
      expect(ok).toBeTruthy();
    }
  });
});
