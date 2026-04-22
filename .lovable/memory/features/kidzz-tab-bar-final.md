---
name: KIDZZ Tab Bar Final (5 abas)
description: Tab bar final com 5 abas — Explorar (chat) | Brincar ⭐ (core inline) | Histórias | Música | Sonhos. Memórias e Conquistas saíram da nav. KidzzChameleon ganhou estado "play" verde vibrante.
type: feature
---
# KIDZZ Tab Bar Final

## Estrutura (5 abas, sem rolagem horizontal)
1. **Explorar** (`chat`) — azul cosmic — Perguntas/Home
2. **Brincar** (`play`) ⭐ — verde vibrante — CORE do app, ícone maior + halo verde permanente, abre `KidzzPlay` inline (não mais overlay)
3. **Histórias** (`explore`) — laranja explorer — StoryFactory
4. **Música** (`music`) — amarelo — MusicForest
5. **Sonhos** (`dreams`) — roxo moon — DreamWorld (fundo escuro próprio)

## Removido da nav
- **Memórias** — agora acessível via botão na Home (`onOpenAchievements` rota → `memories`)
- **Conquistas** — vivem como subaba dentro de Memórias
- **Moments** — acessível via Home

## Estado "play" do KidzzChameleon
- Reusa `explorer.png` com `filter: hue-rotate(50deg) saturate(1.45) brightness(1.05)` → camaleão verde vibrante
- Glow verde `hsl(140 75% 55%)`
- Quando o user pedir asset próprio, criar `src/assets/kidzz/play.png` e remover o filter

## Aba ativa
- Underline colorido (com `layoutId="kidzz-tab-underline"` para morph entre abas)
- Ícone Lucide morpha para imagem KIDZZ correspondente
- Brincar tem halo verde pulsante mesmo inativo (CTA visual)

## Arquivos
- `src/components/flow/BottomNav.tsx` — reescrito do zero
- `src/components/kidzz/KidzzChameleon.tsx` — adicionado estado "play"
- `src/pages/Index.tsx` — `play` rota inline; `onOpenPlay` agora muda aba
