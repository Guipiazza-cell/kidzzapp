---
name: Viral Share System (html2canvas)
description: Image-based viral share for stories, achievements, and monthly retrospectives via Web Share API + download fallback
type: feature
---
## Architecture
- `src/lib/viralShare.ts` — `captureAndShare(node, data)` uses html2canvas (scale 2) → Blob → File → `navigator.share({files})`. Falls back to PNG download + clipboard text.
- Shareable cards rendered off-screen at `position: fixed; left: -9999px` to avoid UI flicker.

## Cards (with forwardRef + inline styles)
- `ShareableStoryCard` — 400x500, dark purple gradient, used in `StoryDisplay`
- `ShareableAchievementCard` — 400x400 square, indigo→amber gradient, with optional streak badge
- `ShareableRetroCard` — 400x500 forest green gradient, 3-stat grid

## Entry points
- `StoryDisplay.tsx` — "📤 Compartilhar esta história" button
- `AchievementsScreen.tsx` — share button on every unlocked badge → `AchievementShareModal`
- `MonthlyRetrospective.tsx` — image share button (replaces text-only WhatsApp)

## Auto monthly retrospective (Index.tsx)
- Triggers on day 1 of month if `kidzz_total_questions > 0` and `kidzz_last_retro !== "YYYY-M"`
- Marks `kidzz_last_retro` after showing
- Reads stats from localStorage with fallback to profile

## Required keys
- `kidzz_child_name`, `kidzz_streak`, `kidzz_total_questions`, `kidzz_total_stories`, `kidzz_max_streak`, `kidzz_last_retro`
