# Refino Premium Global — Kidzz

Escopo grande que afeta tipografia, sistema de cards/ilhas em todas as abas, e remoção dos camaleões intermediários. Quero alinhar antes de tocar em ~30+ arquivos.

## 1. Tipografia (global, `index.css` + `tailwind.config.ts`)

- Importar Fraunces (display) e Mulish (UI) do Google Fonts.
- Adicionar famílias Tailwind: `font-display` (Fraunces, opsz auto, weight 500, `font-variation-settings: "SOFT" 50`), `font-ui` (Mulish 400/600/700/800).
- Manter Nunito como fallback temporário (não vou caçar todos os `font-kids` — apenas trocar a base do `body` para Mulish e aplicar `font-display` nos títulos hero/seção das telas principais).
- Definir utilitários: `.text-eyebrow` (12px uppercase tracking .13em, Mulish 800, cor = `var(--tab-accent)`).
- Escala via classes utilitárias nas telas-chave (hero 30–34, card 24–26, body 15).

## 2. Sistema "Vidro Vivo" (novo, em `index.css`)

Criar tokens CSS por aba (data-attribute no root da rota) e classes reutilizáveis:

```css
[data-tab="perguntas"]  { --tab-accent: #E8915B; }
[data-tab="kalm"]       { --tab-accent: #6FA86A; }
[data-tab="sonhos"]     { --tab-accent: #B6A6E8; --tab-mode: dark; }
[data-tab="historias"]  { --tab-accent: #D87A93; }
[data-tab="musica"]     { --tab-accent: #6E86D6; }
[data-tab="rotina"]     { --tab-accent: #5E9BC4; }
[data-tab="brincar"]    { --tab-accent: #EE8A6A; }
[data-tab="momentos"]   { --tab-accent: #D9A24E; }
[data-tab="cinema"]     { --tab-accent: #5B7FA8; --tab-mode: dark; }
[data-tab="memorias"]   { --tab-accent: #B07AA0; }
```

Variáveis de vidro com modo claro/escuro (via `[data-tab-mode="dark"]`):
- `--glass`, `--glass-bd`, `--hi`, `--sheen`, `--ink`.

Classes novas:
- `.glass-island` — header/dock/toggle (blur 22px, sheen + cor 10%).
- `.glass-card` (sobrescrever a existente) — blur 20px saturate(180%), sheen + lavagem diagonal de cor (22% → 6%), borda, inset hi, shadow 3D, radius 26px.
- `.glass-card-hero` — lavagem mais forte (variant para "Missão do Dia", "Filme da Semana", etc.).
- `.glass-card::after` — brilho diagonal deslizante 9s linear infinite, baixa opacidade. Respeitar `prefers-reduced-motion`.

Setar `data-tab` no wrapper de cada rota/aba (Index/MainApp já tem switch de tab — adicionar `data-tab` no root container conforme aba ativa).

## 3. Ilhas (header, toggle Pais/Assinar, dock)

- Header das telas: já são "ilhas" depois do trabalho anterior — trocar o inline-style por `className="glass-island"` para padronizar.
- `BottomNav`, `SubscribeBanner`, toggle Pais → `.glass-island`.
- Em abas escuras (Sonhos, Cinema), o `data-tab-mode="dark"` já injeta vidro escuro + texto claro automaticamente.

## 4. Camaleão único na Home (por horário)

- Manter herói grande SÓ na Home (`HomeScreen.tsx`).
- Lógica por hora local: manhã (5–12), tarde (12–18), noite (18–5) → seleciona asset + saudação ("Bom dia, curioso!" / "Boa tarde, explorador!" / "Boa noite, sonhador!").
- Reusar os 3 assets existentes do camaleão se possível. Se forem inconsistentes visualmente, registrar TODO (não gero 3 novos sem aprovação, pra não estourar custo de imagem).
- Remover renderizações do `ChameleonMascot`/`KidzzChameleon` em: `WellnessHub` (KALM), `KidzzPlay` (Brincar), `FamilyCinema`, `StoryFactory`, e qualquer outra aba onde apareça como mascote grande. Manter só ícones pequenos de UI se forem essenciais.
- Banco/storage: a memória só menciona `character_profiles` (avatar do filho — não é o camaleão). Não há tabela "chameleons" para limpar. Vou apenas remover do código.

## 5. Arquivos a editar (estimativa)

- `index.css` — tokens, fontes, `.glass-*`, animações.
- `tailwind.config.ts` — famílias `display`/`ui`.
- `src/MainApp.tsx` ou `src/pages/Index.tsx` — setar `data-tab` no root.
- `BottomNav.tsx`, `SubscribeBanner.tsx` — trocar inline styles por `.glass-island`.
- Headers das telas (`MusicForest`, `StoryFactory`, `FamilyCinema`, `MomentsPlaylists`, `MemoriesAlbum`, `KidzzPlay`, `WellnessHub`, `AchievementsScreen`) — substituir inline glass por classe.
- Cards principais (Missão do Dia, Filme da Semana, Streak, etc.) — aplicar `.glass-card` / `.glass-card-hero`.
- `HomeScreen.tsx` — lógica de horário + saudação.
- Remover camaleões intermediários nas abas listadas acima.

## 6. O que NÃO vou tocar

- Fundo da floresta (intacto).
- Lógica de negócio, paywall, quotas, auth.
- `character_profiles` (avatar do filho, não confundir com camaleão Pixel).
- Não vou caçar todos os ~200 arquivos para trocar `font-kids` → `font-ui`; deixo Mulish como base do `body` e aplico `font-display` cirurgicamente em hero/títulos.

## Pergunta antes de começar

Confirma que posso prosseguir com TODO esse pacote num único turno? É grande — vai mudar visual de praticamente todas as telas de uma vez. Se preferir, divido em 3 entregas:
1. Tipografia + tokens + classes de vidro (base, invisível até aplicar).
2. Aplicar `.glass-island` / `.glass-card` em headers e cards principais.
3. Camaleão único + remoção dos intermediários.
