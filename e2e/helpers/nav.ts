import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

/** Labels do dock (BottomNav) — espelha APP_TABS_ALL */
export const DOCK_TABS = [
  { id: "chat", label: "Perguntas", dataTab: "perguntas" },
  { id: "discover", label: "Descobrir", dataTab: "descobrir" },
  { id: "wellness", label: "KALM", dataTab: "kalm" },
  { id: "dreams", label: "Sonhos", dataTab: "sonhos" },
  { id: "explore", label: "Histórias", dataTab: "historias" },
  { id: "play", label: "Brincar", dataTab: "brincar" },
  { id: "bora", label: "Bora!", dataTab: "bora" },
  { id: "routine", label: "Rotina", dataTab: "rotina" },
  { id: "moments", label: "Momentos", dataTab: "momentos" },
  { id: "cinema", label: "Cinema", dataTab: "cinema" },
  { id: "music", label: "Música", dataTab: "musica" },
  { id: "memories", label: "Memórias", dataTab: "memorias" },
] as const;

export type DockTabId = (typeof DOCK_TABS)[number]["id"];

export async function dismissOverlays(page: Page) {
  // surpresa semanal, toasts, install banners
  for (const name of [/fechar/i, /agora não/i, /depois/i, /não quero/i, /×/]) {
    const b = page.getByRole("button", { name }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ force: true }).catch(() => {});
    }
  }
  // Escape
  await page.keyboard.press("Escape").catch(() => {});
}

export async function goHome(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("body")).toBeVisible();
  await page.waitForTimeout(400);
  await dismissOverlays(page);
}

/** Painel da aba ativa (keep-alive: só aria-hidden=false fica interativo). */
export function activePanel(page: Page): Locator {
  return page.locator('[data-tab][aria-hidden="false"]').first();
}

/** Abre a aba pelo id do dock (rola horizontal se precisar). */
export async function openDockTab(page: Page, idOrLabel: string) {
  const tab = DOCK_TABS.find((t) => t.id === idOrLabel || t.label === idOrLabel);
  const id = tab?.id ?? idOrLabel;
  const btn = page.locator(`[data-kidzz-dock] button[data-dock-tab="${id}"]`).first();

  for (let i = 0; i < 16; i++) {
    const visible = await btn.isVisible().catch(() => false);
    if (visible) break;
    await page.evaluate(() => {
      const el = document.querySelector("[data-dock-scroller]") as HTMLElement | null;
      if (el) el.scrollBy({ left: 120 });
    });
    await page.waitForTimeout(100);
  }

  // se ainda não, tenta scroll até o fim
  if (!(await btn.isVisible().catch(() => false))) {
    await page.evaluate(() => {
      const el = document.querySelector("[data-dock-scroller]") as HTMLElement | null;
      if (el) el.scrollLeft = el.scrollWidth;
    });
    await page.waitForTimeout(150);
  }

  await dismissOverlays(page);
  await btn.scrollIntoViewIfNeeded().catch(() => {});

  // Clique nativo no DOM (mais confiável que force em overlays)
  await page.evaluate((dockId) => {
    const b = document.querySelector(
      `[data-kidzz-dock] button[data-dock-tab="${dockId}"]`
    ) as HTMLButtonElement | null;
    b?.click();
  }, id);

  await page.waitForTimeout(250);

  if ((await btn.getAttribute("aria-current")) !== "page") {
    await dismissOverlays(page);
    await btn.click({ force: true }).catch(() => {});
    await page.evaluate((dockId) => {
      const b = document.querySelector(
        `[data-kidzz-dock] button[data-dock-tab="${dockId}"]`
      ) as HTMLButtonElement | null;
      b?.click();
    }, id);
  }

  // Sucesso: botão ativo OU painel keep-alive montado
  const tabMeta = DOCK_TABS.find((t) => t.id === id);
  await expect
    .poll(
      async () => {
        const cur = await btn.getAttribute("aria-current");
        if (cur === "page") return true;
        if (tabMeta) {
          const n = await page.locator(`[data-tab="${tabMeta.dataTab}"]`).count();
          if (n > 0) return true;
        }
        return false;
      },
      { timeout: 12_000 }
    )
    .toBeTruthy();

  await page.waitForTimeout(350);
}

/** Espera o painel da aba (data-tab) ficar visível e ativo. */
export async function expectTabVisible(page: Page, dataTab: string) {
  const panel = page.locator(`[data-tab="${dataTab}"][aria-hidden="false"]`).first();
  await expect(panel).toBeVisible({ timeout: 15_000 });
}

/** Texto visível apenas no painel ativo (evita match em abas display:none). */
export async function expectInActiveTab(page: Page, pattern: string | RegExp) {
  const panel = activePanel(page);
  await expect(panel).toBeVisible({ timeout: 10_000 });
  const loc =
    typeof pattern === "string"
      ? panel.getByText(pattern, { exact: false }).first()
      : panel.getByText(pattern).first();
  await expect(loc).toBeVisible({ timeout: 12_000 });
  return loc;
}

export async function clickInActiveTab(page: Page, pattern: string | RegExp) {
  const loc = await expectInActiveTab(page, pattern);
  await loc.click({ force: true });
  await page.waitForTimeout(350);
}
