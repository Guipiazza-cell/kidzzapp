import { test, expect } from "@playwright/test";
import { goHome, DOCK_TABS, openDockTab } from "../helpers/nav";

test.describe("Smoke — app shell", () => {
  test("S-001 home carrega com guest e dock visível", async ({ page }) => {
    await goHome(page);
    await expect(page.getByText(/Pergunte|Me pergunte|Desligue a tela/i).first()).toBeVisible();
    await expect(page.locator('[data-kidzz-dock] button[data-dock-tab="chat"]')).toBeVisible();
  });

  test("S-002 todas as abas do dock abrem sem crash", async ({ page }) => {
    await goHome(page);

    for (const tab of DOCK_TABS) {
      await openDockTab(page, tab.id);
      await expect(
        page.locator(`[data-kidzz-dock] button[data-dock-tab="${tab.id}"][aria-current="page"]`)
      ).toBeVisible();
      await expect(page.getByText(/Essa seção tropeçou|Something went wrong/i)).toHaveCount(0);
    }
  });
});
