import { test, expect } from "@playwright/test";
import { goHome, openDockTab, expectTabVisible, expectInActiveTab } from "../helpers/nav";

test.describe("Momentos", () => {
  test("S-060 home Momentos carrega", async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "moments");
    await expectTabVisible(page, "momentos");
    await expectInActiveTab(page, /Momento|playlist|Spotify|ouvir|Gui/i);
  });
});

test.describe("Cinema", () => {
  test("S-061 home Cinema carrega", async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "cinema");
    await expectTabVisible(page, "cinema");
    await expectInActiveTab(page, /Cinema|filme|sessão|assist|Gui/i);
  });
});

test.describe("Música", () => {
  test("S-062 home Música carrega (via dock se existir)", async ({ page }) => {
    await goHome(page);
    const musicBtn = page.locator('[data-kidzz-dock] button[data-dock-tab="music"]');
    if ((await musicBtn.count()) === 0) {
      test.info().annotations.push({ type: "note", description: "Música fora do dock" });
      return;
    }
    await openDockTab(page, "music");
    await expectTabVisible(page, "musica");
    await expectInActiveTab(page, /Música|floresta|som|playlist|Gui/i);
  });
});

test.describe("Memórias", () => {
  test("S-063 home Memórias carrega", async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "memories");
    await expectTabVisible(page, "memorias");
    await expectInActiveTab(page, /Memór|conquista|álbum|vazio|guardar|momentos guardados/i);
  });
});
