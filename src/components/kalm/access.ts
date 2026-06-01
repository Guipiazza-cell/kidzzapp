/**
 * Controle freemium do KALM.
 * Free pode usar:
 *  - preview de qualquer experiência
 *  - 1 experiência curta por dia (timer/breathing/ritual)
 *  - 1 soundscape por dia
 *  - 1 parent reset por dia
 * Premium: tudo liberado.
 */
import type { KalmExperience } from "./experiences";

const DAY_KEY = () => `kidzz_kalm_usage_${new Date().toISOString().slice(0, 10)}`;

type DailyUsage = {
  short?: string;     // id usada hoje
  soundscape?: string;
  parentReset?: string;
};

const readUsage = (): DailyUsage => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(DAY_KEY()) || "{}"); } catch { return {}; }
};
const writeUsage = (u: DailyUsage) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(DAY_KEY(), JSON.stringify(u)); } catch {}
};

const isParentReset = (exp: KalmExperience) =>
  ["parent-pause", "too-much", "recover-energy", "breathe-before-react"].includes(exp.id);

const isSoundscape = (exp: KalmExperience) => exp.kind === "soundscape";

const isShort = (exp: KalmExperience) =>
  exp.kind === "timer" || exp.kind === "breathing" || exp.kind === "ritual";

export type KalmAccess =
  | { allowed: true }
  | { allowed: false; reason: "premium" | "daily_limit"; bucket: "short" | "soundscape" | "parentReset" | "journey" };

export const checkKalmAccess = (exp: KalmExperience, isPremium: boolean): KalmAccess => {
  if (isPremium) return { allowed: true };

  // jornadas são integralmente premium
  if (exp.kind === "journey") return { allowed: false, reason: "premium", bucket: "journey" };

  // experiências marcadas premium ainda recebem uma chance / dia se forem nos buckets free permitidos
  const usage = readUsage();

  if (isParentReset(exp)) {
    if (usage.parentReset && usage.parentReset !== exp.id) return { allowed: false, reason: "daily_limit", bucket: "parentReset" };
    return { allowed: true };
  }

  if (isSoundscape(exp)) {
    if (exp.tier === "free") return { allowed: true };
    if (usage.soundscape && usage.soundscape !== exp.id) return { allowed: false, reason: "daily_limit", bucket: "soundscape" };
    return { allowed: true };
  }

  if (isShort(exp)) {
    if (exp.tier === "free") return { allowed: true };
    if (usage.short && usage.short !== exp.id) return { allowed: false, reason: "daily_limit", bucket: "short" };
    return { allowed: true };
  }

  return { allowed: false, reason: "premium", bucket: "short" };
};

export const recordKalmUsage = (exp: KalmExperience, isPremium: boolean) => {
  if (isPremium) return;
  const usage = readUsage();
  if (isParentReset(exp)) usage.parentReset = exp.id;
  else if (isSoundscape(exp)) usage.soundscape = exp.id;
  else if (isShort(exp)) usage.short = exp.id;
  writeUsage(usage);
};
