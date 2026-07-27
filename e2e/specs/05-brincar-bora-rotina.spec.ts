import { test, expect } from "@playwright/test";
import { goHome, openDockTab, expectTabVisible, expectInActiveTab } from "../helpers/nav";

test.describe("Brincar", () => {
  test("S-050 home Brincar carrega", async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "play");
    await expectTabVisible(page, "brincar");
    await expectInActiveTab(page, /Brincar|jogo|desafio|lab|play|diversão/i);
  });
});

test.describe("Bora!", () => {
  test("S-051 home Bora carrega", async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "bora");
    await expectTabVisible(page, "bora");
    await expectInActiveTab(page, /Bora|energia|atividade|categoria|sem tela/i);
  });
});

test.describe("Rotina", () => {
  test("S-052 home Rotina carrega", async ({ page }) => {
    await goHome(page);
    await openDockTab(page, "routine");
    await expectTabVisible(page, "rotina");
    await expectInActiveTab(page, /Rotina|manhã|tarde|noite|missão|tarefa|hoje/i);
  });
});
