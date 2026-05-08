---
name: Premium Polish System
description: Central tokens (timing/glow/shine), WebAudio sfx system, haptics integration, PageTransition wrapper for unified premium UX
type: design
---

# Premium polish system (added in refinement phase)

## Tailwind tokens
- `shadow-premium`, `shadow-premium-lg`, `shadow-soft`
- `ease-premium` (cubic-bezier 0.22, 1, 0.36, 1), `ease-spring-soft`
- `animate-premium-glow` (purple/pink box-shadow pulse, 2.4s)
- `animate-shine-sweep` (110° highlight sweep, 2.6s)
- `animate-premium-pop` (spring scale-in, 0.42s)

## CSS utilities
- `.glass-premium` — heavier blur (28px) + purple shadow + inset highlight
- `.shine-overlay` — wrap inside any rounded element + `<span className="shine-overlay" aria-hidden />`
- `.tap-press` — subtle 0.97 scale on :active

## Sound system (`@/lib/sfx`)
- `sfx(name)` plays generated WebAudio tones (no assets, zero bundle)
- Names: `click`, `unlock`, `reward`, `streak`, `complete`, `error`
- `setSfxMuted(boolean)`, `isSfxMuted()`, `toggleSfxMuted()`
- Persisted in localStorage `kidzz_sfx_muted`
- Component: `<SoundToggle />` in HomeScreen header

## Haptics (`@/lib/haptics`)
- Pair every meaningful interaction with `haptic("light"|"medium"|"success"|"error")`
- Already integrated: BottomNav, Paywall, Home submit, LockedFeature, Success page

## Transitions
- `<PageTransition offsetX={0|-16|16}>` — unified 0.34s premium ease-out
- Fallback `<Suspense>` uses centered spinner (kid-purple) instead of null

## Integration rules
- Premium CTAs MUST use: `bg-gradient-to-r from-kid-purple via-pink-500 to-kid-pink shadow-premium-lg animate-premium-glow` + `<span className="shine-overlay" />`
- Tab switches/buttons opening paywall MUST trigger `haptic("medium")` + `sfx("click")` or `sfx("unlock")`
- Premium activation (Success page) plays `sfx("reward")` + `haptic("success")`
