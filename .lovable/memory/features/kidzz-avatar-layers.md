---
name: KIDZZ Avatar Layer System
description: Sistema de avatar real com camadas (base PNG + olhos SVG + boca SVG + acessório SVG) substituindo emojis. Expressões e trajes anatômicos, persistidos em localStorage 'kidzz_avatar', com share via html2canvas.
type: feature
---

# KIDZZ Avatar — Layer System

## Conceito
Avatar dinâmico em camadas reais (não emojis). Componente único `src/components/kidzz/KidzzAvatar.tsx` renderiza:
1. **base** — PNG do mascote (`ane-chameleon.png` ou `pixel-chameleon.png`) com `hue-rotate` para cor
2. **olhos** — SVG inline anatômico (6 expressões: feliz, triste, surpreso, bravo, curioso, dormindo) com auto-blink (~5s)
3. **boca** — SVG inline (sorriso, triste, "O" surpreso, linha brava, neutra curiosa)
4. **acessório/traje** — SVG inline anatômico (astronauta/capacete, música/headphones, explorador/chapéu safari, festa/chapéu cônico, cientista/jaleco+óculos, super-heroi/máscara+capa)

## Persistência
- localStorage key: `kidzz_avatar` (formato `KidzzAvatarConfig`)
- Helpers: `loadAvatar()` / `saveAvatar()`
- Legacy `mascotConfig` mantido em paralelo para retrocompat (HomeScreen, KidzzPlay, MyKidzz)

## Animações
- Idle breathing (scale 1↔1.025 a cada 3.6s)
- Auto-blink dos olhos (scaleY 0.08 em ~96% do ciclo)
- Tap bounce (scale 0.92→1.08→1)
- Glow ambiente dourado suave atrás

## Lab (KidzzLab.tsx)
3 abas: **Cor** | **Rosto** | **Traje**. Cada item exibe um `KidzzAvatar` size="sm" como preview real (sem emojis nos botões). Botão Share renderiza um card 540x540 off-screen via html2canvas com texto "Esse é meu KIDZZ!".

## Premium-locked items
- Cores: `laranja`
- Expressões: `bravo`
- Trajes: `super-heroi`, `festa`

## Não fazer
- Não adicionar emojis nos botões de personalização
- Não substituir os PNGs base (preserva identidade Ane/Pixel)
- Não criar novos PNGs por traje — usar SVG inline anatômico (zero requests, escalável)
