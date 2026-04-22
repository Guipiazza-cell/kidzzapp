/**
 * Validação manual automatizada — MEU KIDZZ
 *
 * Garante que:
 *  1. A configuração do camaleão é persistida em `localStorage` (chave `mascotConfig`).
 *  2. Ao recarregar / remontar o app, `loadMascotConfig()` restaura exatamente o que foi salvo.
 *  3. Valores ausentes ou corrompidos voltam ao default sem quebrar.
 *
 * Esses testes simulam o que acontece quando o usuário fecha e reabre o app
 * em iOS / Android (PWA standalone): o storage persiste, e o app rehidrata.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { loadMascotConfig, type MascotConfig } from "@/components/lab/KidzzLab";

const KEY = "mascotConfig";

describe("MyKidzz — persistência da personalização", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("retorna config default quando não há nada salvo (primeira sessão)", () => {
    const cfg = loadMascotConfig();
    expect(cfg).toEqual({
      mascot: "ane",
      colorId: "rosa-encantado",
      expression: "happy",
      outfitId: "scientist",
      energy: "calm",
    });
  });

  it("persiste e restaura a config completa após reload (simulado)", () => {
    const userChoice: MascotConfig = {
      mascot: "ane",
      colorId: "azul-oceano",
      expression: "curious",
      outfitId: "explorer",
      energy: "animated",
    };

    // Simula clique em SALVAR
    localStorage.setItem(KEY, JSON.stringify(userChoice));

    // Simula reload do app
    const restored = loadMascotConfig();
    expect(restored).toEqual(userChoice);
  });

  it("preserva mudanças incrementais (cor → roupa → energia)", () => {
    let cfg = loadMascotConfig();

    cfg = { ...cfg, colorId: "dourado-magico" };
    localStorage.setItem(KEY, JSON.stringify(cfg));

    cfg = { ...loadMascotConfig(), outfitId: "superhero" };
    localStorage.setItem(KEY, JSON.stringify(cfg));

    cfg = { ...loadMascotConfig(), energy: "powerful" };
    localStorage.setItem(KEY, JSON.stringify(cfg));

    const final = loadMascotConfig();
    expect(final.colorId).toBe("dourado-magico");
    expect(final.outfitId).toBe("superhero");
    expect(final.energy).toBe("powerful");
  });

  it("não quebra se o JSON em localStorage estiver corrompido (volta ao default)", () => {
    localStorage.setItem(KEY, "{not valid json");
    const cfg = loadMascotConfig();
    expect(cfg.colorId).toBe("rosa-encantado");
    expect(cfg.expression).toBe("happy");
  });

  it("aceita valores válidos para todas as 4 categorias customizáveis", () => {
    const variants: MascotConfig[] = [
      { mascot: "ane", colorId: "verde-floresta", expression: "thinking", outfitId: "scientist", energy: "calm" },
      { mascot: "ane", colorId: "lilas-estrelado", expression: "excited", outfitId: "superhero", energy: "curious" },
      { mascot: "ane", colorId: "rosa-encantado", expression: "happy", outfitId: "explorer", energy: "powerful" },
    ];

    for (const v of variants) {
      localStorage.setItem(KEY, JSON.stringify(v));
      expect(loadMascotConfig()).toEqual(v);
    }
  });
});
