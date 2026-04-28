---
name: Routine Tab (Daily Habit Loop)
description: New "Rotina" tab replaces "Brincar" in tab bar. 9 daily tasks across 3 periods, auto-complete via integrations, streak, +5/+8/+20 XP
type: feature
---
**Tab Bar order**: Perguntas (chat) | Histórias (explore) | Música (music) | Rotina (routine, highlight) | Sonhos (dreams) | Memórias (memories). "Brincar" (`play`) removed from bar but still routable via Home button.

**Files**:
- `src/lib/routine.ts` — 40-task bank (5 categories × 3 periods), deterministic per-day generation seeded by date, soft variety (excludes last 2 days), idempotent `completeTask`, `completeByIntegration` for music/story/question, streak (consecutive full-day completions), localStorage keys: `kidzz_routine_day`, `kidzz_routine_streak`, `kidzz_routine_best_streak`, `kidzz_routine_last_full`, `kidzz_routine_last_ids`.
- `src/components/routine/RoutineScreen.tsx` — KIDZZ hero (size xl, hue from mascotConfig, state by period: morning=explorer, afternoon=cosmic, night=moon), animated progress bar, streak chip, 3 PeriodSection (Sun/Cloud/Moon, distinct gradients warm/neutral/soft), TaskCard with "Já fiz" pill → animated check + glow + micro confetti.
- `src/lib/dailyMission.ts` — `completeMissionStep` now lazy-imports `routine.completeByIntegration` to bridge integrations and surface XpToast for matching routine tasks.

**XP**: simple task +5, integrated task +8, full-day bonus +20 (all routed through `addXp("activity", override)`).

**Memory**: full-day completion auto-saves a `type:"achievement"` memory titled "Dia completo na Rotina".

**Anti-addiction**: hard cap 9 tasks/day; "Já fez bastante hoje 😊" message after all done; missed-yesterday copy is gentle ("hoje é um novo começo 💛"), no streak punishment beyond reset.
