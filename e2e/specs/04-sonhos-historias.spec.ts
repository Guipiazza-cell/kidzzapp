import { test, expect } from "@playwright/test";
import { goHome, openDockTab, expectTabVisible, expectInActiveTab } from "../helpers/nav";

test.describe("Sonhos", () => {
  test("S-040 home Sonhos carrega", async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "dreams");
    await expectTabVisible(page, "sonhos");
    await expectInActiveTab(page, /Sonhos|dormir|história|som|noite|tranquil|Gui/i);
  });
});

test.describe("Histórias", () => {
  test("S-041 home Histórias carrega", async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "explore");
    await expectTabVisible(page, "historias");
    await expectInActiveTab(page, /Histór|aventura|coleção|ler|história/i);
  });
});
