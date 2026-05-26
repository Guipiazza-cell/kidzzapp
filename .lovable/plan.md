# Redesign Visual Cinematográfico v2.0 — KIDZZ

Este plano aplica a especificação enviada (paleta exata, background em camadas, camaleão central, Home reestruturada, animações premium) sem quebrar fluxos existentes (onboarding, chat, paywall, rotas). O foco é **camada visual e Home** — lógica de negócio fica intocada.

## Escopo

### 1. Design tokens (base de tudo)
- `src/index.css`: atualizar variáveis HSL para refletir a paleta exata:
  - `--background` → #F7F6F2, `--card`/`bgSecondary` → #FDFCF8
  - `--primary` (greenSage) → #8FBF7F, `--accent` (greenDeep) → #355B45, hover → #D1E8CA
  - `--kidzz-gold` → #D8B36A, `--sos-from/to` mantém #FF7A7A / #D94B4B
  - texts: #2E2E2E / #7A7A7A / #B0B0B0
  - shadows + glows (green/red/gold) como utilitários
- `tailwind.config.ts`: expor `kidzz-sage`, `kidzz-deep`, `kidzz-gold`, `kidzz-coral` + sombras `shadow-cinema-sm/md/lg` + easings `ease-snappy`, `ease-bounce` + durations.
- Raios: `rounded-cinema` (28px) e `rounded-cinema-xl` (32px).

### 2. Background global cinematográfico
- Novo componente `src/components/CinemaBackground.tsx` — 3 camadas fixed:
  1. gradient base 135° (#F7F6F2 → #FDFCF8 → #EFF1EC)
  2. blur atmosférico com `breatheBackground` keyframe (8s)
  3. glow radial verde sutil (8% opacity) em 30% 50%
- Montado uma vez em `src/MainApp.tsx` (atrás de tudo, `z-[-10]`).
- Respeita `prefers-reduced-motion` (já globalizado no index.css).

### 3. Camaleão como elemento central
- Reaproveitar `src/components/kidzz/KidzzChameleon.tsx` (já existe).
- Novo wrapper `ChameleonHero` com:
  - posição `absolute right-[-8%] top-[3%]`, 320×340
  - filtro drop-shadow triplo (volumétrico + glow verde + sombra inferior)
  - `glowBreath` 6s + `eyesBlink` 4s controlados por prop `mood`
- Usado na Home, no topo direito do hero.

### 4. Home Screen reestruturada
Arquivo: `src/components/flow/HomeScreen.tsx` (refator visual, mesma lógica).
Nova hierarquia:
1. **Header premium**: sino/configs à direita, badge "Premium" com sound toggle à esquerda, logo "KIDZZ" centralizado.
2. **Greeting emocional**: "Olá, {nome} ✨" + subtítulo + pill "KIDZZ Ativo · N perguntas".
3. **Hero Input IA** (card surface-premium + glow breathing): título "Me pergunte qualquer coisa!", input com botão mic verde metálico embutido + CTA "Perguntar ✨".
4. **SOS Card**: gradiente coral (#FF7A7A → #D94B4B), ícone pulsante, CTA "SOS Kidzz ✨".
5. **Carrossel "Explore Juntos"**: 3 cards (Histórias, Viagem, Wellness) com ícones e descrições.
6. **"Hoje para Você"**: grid 2 col com perguntas sugeridas + tag de categoria.
7. **Dock menu inferior** (`BottomNav` já existe — apenas refinar estilo: blur 24px, raio 32, sombra cinema, ícones com `popIn` 0.3s no ativo).

### 5. Animações premium
- Tokens em tailwind:
  - `ease-snappy: cubic-bezier(0.22,1,0.36,1)`
  - `ease-bounce: cubic-bezier(0.34,1.56,0.64,1)`
- `pageEnter`: já coberto por `PageTransition.tsx` (ajustar duration 0.6s).
- `cardHover`: utilitário `.card-cinema` (y-translate -4px + shadow-cinema-lg em 0.3s).
- `glowBreath`: keyframe novo no index.css aplicado ao Hero Input e ao camaleão.
- Botão CTA: scale 1 → 1.02 hover, 0.98 active.

### 6. Estados interativos
- Input: 3 estados (default / focus / typing) via classes utilitárias.
- Botões verdes: sombra `0 4px 12px glowGreen` default, eleva no hover.
- Cards Explore/Today: hover translateY -2px + scale 1.02.

## Detalhes técnicos

- **Sem mudanças** em: rotas, AuthContext, quotas, paywall, edge functions, schema.
- **Tokens HSL** mantidos (regra do projeto) — hex do brief convertidos para HSL no `:root`.
- **Mobile-first** (viewport atual 430px): hero input full-width, camaleão escala para 240×260 em <430px para não cobrir o saudação.
- **Performance**: backdrop-filter já capado em 10px no mobile (regra existente). `will-change: transform` apenas no camaleão.
- **Acessibilidade**: contraste textDark/bgPrimary OK (>10:1); botões mantêm 44×44.

## Arquivos tocados

Edits:
- `src/index.css` (tokens + keyframes glow/breath)
- `tailwind.config.ts` (cores, sombras, easings, durations)
- `src/MainApp.tsx` (montar CinemaBackground)
- `src/components/flow/HomeScreen.tsx` (refator visual completo)
- `src/components/flow/BottomNav.tsx` (estilo dock cinema)
- `src/components/PageTransition.tsx` (duration 0.6s, ease snappy)

Novos:
- `src/components/CinemaBackground.tsx`
- `src/components/kidzz/ChameleonHero.tsx`

## Fora de escopo (próximas iterações)
- Telas internas (Chat, Stories, Dreams) recebem só o background global agora; refator visual completo dessas telas em fase 2.
- Editar imagem do camaleão (SVG/PNG) — usaremos o asset atual.

## Resultado esperado
Home com sensação Apple/Pixar: fundo respirando, camaleão volumétrico no topo, hero input com glow verde, SOS coral pulsante, carrossel + grid de sugestões, dock flutuante. Zero flicker, transições 300–600ms, paleta consistente em todo o app.
