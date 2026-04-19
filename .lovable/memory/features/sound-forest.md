---
name: Floresta dos Sons
description: Aba musical premium com Web Audio sintetizado, mascote Ane Melodia, onboarding cinematográfico, colecionáveis e modo Cantar Juntos com gravação local
type: feature
---

A "Floresta dos Sons" (tab `forest` no BottomNav, substituiu Conquistas — que continua acessível via Home/Achievements card) é o motor de retenção musical do app.

**Arquitetura** (`src/components/forest/`):
- `ForestAudioEngine.ts` — Web Audio API 100% sintetizado (oscillators + biquad lowpass). Notas, drums, melodias, loops e MediaRecorder local. Sem MP3s, sem rede.
- `AneMelodia.tsx` — mascote SVG inline rosa pastel (consistente com identidade Ane), coroa de 3 folhas, coração luminoso pulsante, notas orbitando. Estados: idle/sing/dance/happy.
- `ForestOnboarding.tsx` — cinematográfico em 5 fases (silêncio → 1ª nota → 5 folhas → melodia completa → CTA). Flag `kidzz_forest_onboarded`. Botão "Reviver intro" no header (✨).
- `forestCollectibles.ts` — 4 colecionáveis: Nota do Sol ☀️ (1 nota), Tambor da Floresta 🥁 (5 toques), Melodia Dourada ✨ (1 melodia), Canção da Lua 🌙 (1 dueto). Persiste em `kidzz_forest_collectibles` + counters em `kidzz_forest_counters`. +25 XP por desbloqueio (`kidzz_xp`).
- `CollectibleAlbum.tsx` — grid 2x2 com glow específico por colecionável, progress bar dourado-rosa.
- `SingTogether.tsx` — Premium-only. Tela dividida pai (azul) / filho (rosa com Ane). MediaRecorder API → blob → dataURL → salvo em `memories` (type=achievement, metadata.kind="duet", metadata.audio).
- `SoundForest.tsx` — hub principal. Stage do mascote, tiles (Nota/Tambor/Pulso loop), 2 melodias mágicas, card Cantar Juntos, álbum, toast de desbloqueio.

**Integração**: `Index.tsx` activeTab "forest" + BottomNav. XP via `evolution.evolve("game")`.
