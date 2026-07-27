import { test, expect } from "@playwright/test";

/**
 * Rotas públicas — não dependem de guest storage da home.
 * Usam context limpo.
 */
test.describe("Landing e rotas públicas", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("S-070 landing / carrega", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Splash ou app ou onboarding
    await expect(page.locator("body")).toBeVisible();
  });

  test("S-071 /auth carrega formulário", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByText(/entrar|criar conta|e-mail|email|senha|Kidzz|login/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("S-072 /privacy carrega", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByText(/privacidade|dados|Kidzz/i).first()).toBeVisible({
      timeout: 12_000,
    });
  });

  test("S-073 /lp landing quiz carrega", async ({ page }) => {
    await page.goto("/lp");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("S-074 404 NotFound", async ({ page }) => {
    await page.goto("/rota-que-nao-existe-xyz");
    await expect(
      page.getByText(/não encontr|404|voltar|oops|página/i).first()
    ).toBeVisible({ timeout: 12_000 });
  });
});
