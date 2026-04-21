---
name: KIDZZ Chameleon System
description: Sistema unificado do mascote KIDZZ — 1 personagem com 4 estados visuais que metamorfoseiam (cosmic/moon/explorer/music) usando crossfade morph e memória contextual via localStorage
type: feature
---

# KIDZZ Chameleon System

## Conceito Central
**É UM PERSONAGEM SÓ.** Os 4 visuais (cosmic, moon, explorer, music) são estados/cores do mesmo camaleão. Nunca trocar imagem bruscamente — sempre **morph crossfade 600-700ms**.

## Assets
- `src/assets/kidzz/cosmic.png` — Azul estrelado, curioso (Perguntas)
- `src/assets/kidzz/moon.png` — Roxo lunar, calmo (Sonhos)
- `src/assets/kidzz/explorer.png` — Verde-dourado apontando, guia (Histórias/Viagem)
- `src/assets/kidzz/music.png` — Dourado headphones (futura aba Música, hoje teaser Premium)

Gerados via Nano Banana Pro a partir da grade 2x2 enviada pelo usuário, com fundo branco removido via PIL alpha matting.

## Componentes
- `src/components/kidzz/KidzzChameleon.tsx` — Componente core: 4 estados, mood (idle/curious/calm/guide/happy/talking/thinking), morph crossfade, eye-follow touch, tap ripple+bounce, particle trails coloridos por estado, heart pulse glow, breathing idle
- `src/components/kidzz/KidzzHero.tsx` — Wrapper para Home com greeting contextual
- `src/components/kidzz/kidzzMemory.ts` — Engine de memória: bumpVisit, recordQuestion, markMet, getContextualGreeting

## Memória Contextual (kidzz_memory_v1)
- Detecta horário (manhã/tarde/noite) → muda saudação e mood
- Streak ≥5 → "X dias juntos! Você está incrível!"
- Streak ≥3 + noite → "Hora das estrelas…"
- Última pergunta foi ontem → "Ontem sua pergunta foi incrível… vamos continuar?"

## Tab Bar Viva (BottomNav)
Quando uma aba fica ativa, o ícone Lucide morfa para o KIDZZ mini correspondente (cosmic/explorer/music/moon). Memórias mantém ícone Lucide. Inclui pulse ripple no toque e leve floating bob.

## Regras
- NUNCA usar emoji 🦎 ou cartoon genérico para representar KIDZZ
- NUNCA trocar visual sem AnimatePresence morph
- Heart glow é parte da identidade — mantido em todos os estados
- music.png está integrado mas NÃO ativa aba Música ainda — usar apenas como teaser Premium "🌿 Floresta Musical em breve"
