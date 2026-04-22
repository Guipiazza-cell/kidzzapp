---
name: Daily Mission Loop
description: Daily 3-step mission (music/question/story) with global XP, confetti reward, and parent conversion nudge after 2-3 actions
type: feature
---
**Daily Loop**: localStorage-based system in `src/lib/dailyMission.ts` tracks 3 daily goals (ouvir música, responder pergunta, ver história). Resets at midnight by date key.

**XP**: Global "✨ pontos de sabedoria" shown in HomeScreen header. Values: música +10, pergunta +10, história +15, criar música +25. Floating toast (`XpToast.tsx`) animates the gain.

**Visual reward**: When all 3 daily steps are complete, `DailyMissionCard` triggers canvas-confetti + celebration overlay "Você foi incrível hoje! 💛".

**Conversion nudge**: After 2+ child actions in a session and once per day, `ConversionNudgeCard` floats above the BottomNav: "{childName} está evoluindo com o Kidzz 💛 — Ver plano" → opens contextual paywall.

**Wired into**:
- `src/pages/Index.tsx` (questions)
- `src/components/music/MusicForest.tsx` (music)
- `src/components/story/StoryFactory.tsx` (stories)
- `src/components/flow/HomeScreen.tsx` (mission card + XP chip)

Memory hooks (`useMemories.addMemory`) auto-save question and story moments — no extra wiring needed.
