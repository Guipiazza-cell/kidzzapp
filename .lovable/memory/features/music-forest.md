---
name: Floresta Musical
description: Aba ATIVA de música (canta, dança, cria) com floresta viva pseudo-3D, mascotes Pixel/Ane reativos, 4 pilares e XP musical separado. NÃO confundir com Mundo dos Sonhos (passivo).
type: feature
---

A "Floresta Musical" (tab `music` no BottomNav, ícone Music2 verde) é o motor ATIVO de música. Mundo dos Sonhos é PASSIVO — nunca misturar.

**Tab bar nova ordem**: Perguntas → Histórias → **Música 🌿** → Sonhos → **Memórias 🖼** (substituiu Conquistas, que migra para dentro de Memórias).

**Arquitetura** (`src/components/music/`):
- `MusicEngine.ts` — Web Audio API 100% sintetizado. `playSong()` toca uma `Song` (steps com note/dur/syllable) e dispara callback `onStep` para sincronizar karaokê. Inclui `getTodaysSong()` que rotaciona 7 músicas em `MORNING_SONGS` deterministicamente por dia.
- `LivingForest.tsx` — Pseudo-3D com 3 camadas (back/mid/front) com parallax baseado em mouse/touch (springs). Eventos ambientes aleatórios a cada 8-15s: folha caindo 🍂, pássaro cruzando 🐦, burst de vagalumes. Sempre 14 vagalumes pulsando.
- `PixelMusical.tsx` — Pixel SVG inline (camaleão escuro, glow azul). Estados: idle/sing/happy. Notas ♪♫♩ orbitam quando canta.
- `AneMusical.tsx` — Ane SVG inline (camaleoa rosa, coroa de 3 folhas verdes, coração luminoso pulsando no peito). Estados: idle/dance/sing/happy.
- `MorningKaraoke.tsx` — **Pilar 1**: Karaokê com Pixel. Letras com sílaba dourada highlighted no tempo real (sincronizada via callback do MusicEngine). +12 XP, salva em Memórias (type=achievement, kind=karaoke).
- `MusicForest.tsx` — Hub principal. 4 pilares (só Pilar 1 implementado nesta fase, outros 3 marcados "Em breve"). Card noturno aparece SÓ após 19h ("Hora de descansar? 🌙 Ir para Sonhos →"). Efeitos raros 5% (chuva de estrelas, borboletas, coral).

**XP Musical** (`src/lib/musicXp.ts`): Sistema separado em localStorage:
- `kidzz_music_xp`, `kidzz_music_streak`, `kidzz_music_last_date`, `kidzz_music_counters`, `kidzz_music_achievements`.
- Valores: listen=10, karaoke=12, dance=10, story=15, create=25, share=20.
- 6 conquistas musicais: Primeira Canção, Estrela do Karaokê, Compositor, Semana Musical, Dançarino da Floresta, Contador de Histórias.

**Status fases**: Fase 1 ✅ (parallax, mascotes, Pilar 1 Karaokê, tab bar, XP, card noturno, efeitos raros). Fase 2 pendente: Dance com Ane, Histórias Cantadas, Crie Sua Música. Fase 3 pendente: Pré-Sono em Sonhos, Conquistas musicais visíveis em Memórias.
