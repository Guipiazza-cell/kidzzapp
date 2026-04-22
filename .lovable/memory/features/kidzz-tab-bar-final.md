---
name: KIDZZ Tab Bar 6 abas + Meu KIDZZ funcional
description: Tab bar final com 6 abas (Explorar | Brincar | Histórias | Música | Sonhos | Memórias). Meu KIDZZ refatorado para componente próprio MyKidzz que personaliza o KidzzChameleon único em tempo real.
type: feature
---
# KIDZZ Tab Bar Final (6 abas) + Meu KIDZZ funcional

## Tab bar (6 abas, sem scroll horizontal)
1. **Explorar** (`chat`) — azul cosmic — Home/Perguntas
2. **Brincar** (`play`) ⭐ — verde vibrante (CORE) — KidzzPlay hub inline
3. **Histórias** (`explore`) — laranja — StoryFactory
4. **Música** (`music`) — amarelo — MusicForest
5. **Sonhos** (`dreams`) — roxo — DreamWorld (fundo escuro próprio)
6. **Memórias** (`memories`) — pink — MemoriesAlbum + Conquistas (subaba)

Ícones reduzidos (size 18 / 22 destaque) para caber 6 sem scroll.
Underline com `layoutId="kidzz-tab-underline"` morpha entre abas.
Brincar tem halo verde pulsante permanente.

## Meu KIDZZ (`src/components/play/MyKidzz.tsx`)
Substitui KidzzLab dentro do hub Brincar. Componente leve e FUNCIONAL:
- Personaliza o **KidzzChameleon único** (não Ane/Pixel separados)
- Cor (hue-rotate aplicado no wrapper), Expressão (emoji overlay + mood), Traje (emoji overlay), Energia (mood do KidzzChameleon)
- Mudança IMEDIATA visual ao clicar + bounce do hero + feedback flutuante
- **Salvar**: localStorage `mascotConfig` (mesma chave do KidzzLab → compatível com HomeScreen que já lê via `loadMascotConfig`)
- **Compartilhar**: html2canvas → web share API ou download PNG
- Premium gates: 3 trajes finais e 2 expressões (loving/challenging) com `Lock`

## Modo Viagem restaurado
- Removido grupo de quick-buttons pequenos (Lab/Play/Viagem) da Home
- Adicionado **card grande gradiente cosmic** "🌍 Modo Viagem" como destaque na Home (Explorar)
- Lab continua acessível como pílula compacta

## Memórias
- Já existente em `MemoriesAlbum.tsx` com subaba "Conquistas" (toggle Conteúdos / Conquistas)
- Acessível agora via tab bar dedicada (não só pela Home)
- Aba `achievements` redireciona para Memórias mantendo backward compat

## Arquivos
- `src/components/flow/BottomNav.tsx` — 6 abas, ícones menores
- `src/components/play/MyKidzz.tsx` — NOVO (substitui uso de KidzzLab no hub)
- `src/components/play/KidzzPlay.tsx` — usa MyKidzz no view "kidzz"
- `src/components/flow/HomeScreen.tsx` — card grande Modo Viagem
- `src/pages/Index.tsx` — tab `achievements` agora renderiza MemoriesAlbum
