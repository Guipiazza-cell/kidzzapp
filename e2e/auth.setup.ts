import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { buildGuestLocalStorage } from "./helpers/guest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, ".auth");
const GUEST_FILE = path.join(AUTH_DIR, "guest.json");

/**
 * Gera storageState de guest completo (onboarding ok) para todos os specs.
 */
setup("bootstrap guest storage", async ({ page }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  await page.goto("/");
  await page.evaluate((entries) => {
    for (const [k, v] of Object.entries(entries)) {
      window.localStorage.setItem(k, v);
      try {
        window.sessionStorage.setItem(k, v);
      } catch {
        /* private mode */
      }
    }
  }, buildGuestLocalStorage({ childName: "Luna", ageRange: "3-7" }));

  await page.goto("/");
  await page.waitForLoadState("networkidle").catch(() => {});

  // Deve chegar na home (Perguntas) — não ficar no onboarding de nome
  await expect(
    page.getByText(/Pergunte|Me pergunte|Desligue a tela|Hoje para você/i).first()
  ).toBeVisible({ timeout: 25_000 });

  await page.context().storageState({ path: GUEST_FILE });
});
