/**
 * Global Level System — derives Level (1-100) from total XP.
 *
 * Curve: progressive cost per level.
 *   xpForLevel(n) = base xp required to GO FROM (n-1) TO n
 *   Total cumulative grows quadratically so early levels feel fast,
 *   later levels keep the player engaged longer.
 *
 *   xpForLevel(n) = 25 + (n-1) * 20      // 25, 45, 65, 85, ...
 *   Level 100 cumulative ≈ 100*25 + 20*(0+1+...+99) = 2500 + 99000 = 101_500
 */

import { getTotalXp, addXp as addMissionXp, type MissionAction } from "./dailyMission";
import { showXpGained } from "@/components/flow/XpToast";

export const MAX_LEVEL = 100;

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 25 + (level - 1) * 20;
}

/** Cumulative XP needed to REACH this level. */
export function cumulativeXpToReach(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 2; i <= level; i++) total += xpForLevel(i);
  return total;
}

export interface LevelInfo {
  level: number;            // 1..100
  xp: number;               // current total xp
  xpInLevel: number;        // xp earned within current level
  xpForNext: number;        // xp needed to fill current level
  progress: number;         // 0..1
  title: string;            // explorer title
  tier: "spark" | "glow" | "aura" | "energy"; // visual tier
}

export function getLevelTitle(level: number): string {
  if (level >= 90) return "Lenda KIDZZ";
  if (level >= 75) return "Mestre KIDZZ";
  if (level >= 60) return "Sábio Explorador";
  if (level >= 45) return "Guardião da Floresta";
  if (level >= 30) return "Aventureiro";
  if (level >= 20) return "Curioso Veterano";
  if (level >= 10) return "Explorador";
  return "Iniciante";
}

export function getTier(level: number): LevelInfo["tier"] {
  if (level >= 60) return "energy";
  if (level >= 30) return "aura";
  if (level >= 10) return "glow";
  return "spark";
}

export function getLevelInfo(xpOverride?: number): LevelInfo {
  const xp = typeof xpOverride === "number" ? xpOverride : getTotalXp();
  let level = 1;
  let cum = 0;
  while (level < MAX_LEVEL) {
    const need = xpForLevel(level + 1);
    if (cum + need > xp) break;
    cum += need;
    level++;
  }
  const xpInLevel = xp - cum;
  const xpForNext = level >= MAX_LEVEL ? xpInLevel : xpForLevel(level + 1);
  const progress = level >= MAX_LEVEL ? 1 : Math.min(1, xpInLevel / xpForNext);
  return {
    level,
    xp,
    xpInLevel,
    xpForNext,
    progress,
    title: getLevelTitle(level),
    tier: getTier(level),
  };
}

/**
 * Centralized XP grant. Triggers `kidzz:xp-gained` and (if level up)
 * `kidzz:level-up` events. Returns updated level info.
 *
 * Use this everywhere instead of dailyMission.addXp directly when you
 * want the global UI (toast + level-up overlay) to react.
 */
export function grantXp(action: MissionAction, override?: number, label?: string): {
  before: LevelInfo;
  after: LevelInfo;
  leveledUp: boolean;
  gained: number;
} {
  const before = getLevelInfo();
  const { gained } = addMissionXp(action, override);
  const after = getLevelInfo();
  const leveledUp = after.level > before.level;

  // Floating XP toast (visual feedback bloco 1)
  showXpGained(gained, label);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kidzz:xp-gained", { detail: { gained, after } }));
    if (leveledUp) {
      window.dispatchEvent(
        new CustomEvent("kidzz:level-up", { detail: { from: before.level, to: after.level, after } })
      );
    }
  }
  return { before, after, leveledUp, gained };
}
