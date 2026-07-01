# Checklist UI/UX + Mobile-First — Kidzz

> **Auditoria read-only.** Nada no app/dados foi alterado. Rodado 100% local (`.env` → `127.0.0.1:54321`, Supabase isolado; prod intocado).
> Evidência: leitura de código (file:line) + Playwright real (mobile 390px e desktop 1280px) com **medições reais** do DOM.
> Só entram itens com **100% de certeza** (medido ou fato determinístico no código). Itens que dependem de conteúdo real pra confirmar visualmente estão separados na seção D.

---

## Medições-chave (Playwright, DOM real)

| Métrica | Valor medido | Onde |
|---|---|---|
| Largura do dock no desktop | `x=0  w=1280` (= viewport inteira) | `BottomNav` |
| Largura do dock no mobile | `x=0  w=390` (ok) | `BottomNav` |
| **Altura que o dock + barra "Pais/Assinar" cobrem** | **152px** (mobile e desktop) | overlay inferior fixo |
| Menor tap target no dock | **36px** de altura (< 44px) | botões "Pais"/"Assinar" |
| Itens no dock | **11** (scroll horizontal; ~6 visíveis no mobile) | `appTabs.ts` |
| Overflow horizontal no `<body>` | 0px em todas as 20 telas | global `overflow-x:hidden` ✅ |

---

## A. Bugs confirmados 100% (visual medido + código) — PRIORIDADE

- [ ] **A1 — Dock estica de ponta a ponta no desktop/tablet** _(é o erro da imagem de referência)_
  `src/components/flow/BottomNav.tsx:106-108` — `nav` é `fixed left-0 right-0` **sem `max-width`**. Medido: ocupa `w=1280` numa viewport de 1280. Em telas largas vira uma barra gigante com ícones grudados à esquerda e bezel vazio à direita.
  **Fix:** envolver o conteúdo do dock em `max-width: 480px; margin-inline:auto` (ou `inset-x-0 max-w-[480px] mx-auto`).

- [ ] **A2 — Conteúdo central NÃO tem largura máxima consistente no desktop**
  Visual confirmado: abas como **Brincar** (cards roxo/laranja/verde) e **Cinema** (banner "Soul") esticam o conteúdo full-width no desktop, enquanto **KALM/Home** centralizam estreito. Inconsistência entre telas — o app é mobile-first sem container desktop unificado.
  Arquivos: `src/components/play/KidzzPlay.tsx`, `src/components/cinema/FamilyCinema.tsx` (cards/banners sem `max-w` no wrapper).
  **Fix:** um container raiz com `max-width` (ex. `max-w-[520px] mx-auto`) aplicado a todas as views do hub.

- [ ] **A3 — 11 abas num dock de scroll horizontal**
  `src/lib/appTabs.ts:11-23` — todas as 11 com `inDock:true`. No mobile só ~6 aparecem; o resto fica atrás do fade à direita (`BottomNav.tsx:341-367`). Descoberta ruim: muitas seções escondidas atrás de um scroll que a criança pode não perceber.
  **Fix:** reduzir o dock a 5 itens fixos + 1 "Mais" (bottom-sheet com o resto), ou agrupar seções.

- [ ] **A4 — Tap targets abaixo de 44px (app infantil)**
  Medido: menor alvo no dock = **36px**.
  - `src/components/flow/BottomNav.tsx:138,154` — botões "Pais"/"Assinar" `min-h-[36px]`.
  - `src/components/flow/HomeScreen.tsx:474,488,497,506` — botões do header `w-8 h-8` (**32px**).
  **Fix:** mínimo `44x44px` (`min-h-[44px]`, `w-11 h-11`). Crítico pra dedos de criança (público 4–10 anos).

---

## B. Mobile-first / safe-area (fatos determinísticos no código)

- [ ] **B1 — `InstallBanner` fica ATRÁS do dock** _(z-index)_
  `src/components/InstallBanner.tsx:96` usa `z-50`; o dock é `z-[90]` (`BottomNav.tsx:108`). O banner "Instalar app" some atrás do dock no canto inferior.
  **Fix:** subir o banner pra `z-[95]` ou não posicionar fixo embaixo.

- [ ] **B2 — `InstallBanner` sem safe-area inferior**
  `src/components/InstallBanner.tsx:96` — `fixed bottom-4` sem `env(safe-area-inset-bottom)`. No iPhone com home indicator encosta na barra do sistema.
  **Fix:** `bottom: calc(env(safe-area-inset-bottom,0px) + 16px)` (igual ao `AppUpdateBanner`).

- [ ] **B3 — z-index dos banners fixos não é hierárquico**
  `AppUpdateBanner.tsx:22` = `z-[80]` **igual** ao header `HomeScreen.tsx:353` (`z-[80]`); `OfflineIndicator` = `z-[100]`; `InstallBanner` = `z-50`. Ordem de empilhamento indefinida quando aparecem juntos.
  **Fix:** padronizar — Offline `100`, Update `90`, Dock `90`→ Header `80`, Install `85`.

- [ ] **B4 — `padding-bottom` fixo em px sem safe-area**
  `src/components/bora/BoraScreen.tsx:569` — `paddingBottom: 180` (número fixo, ignora `env(safe-area-inset-bottom)`).
  **Fix:** `calc(env(safe-area-inset-bottom,0px) + 120px)`.

- [ ] **B5 — `iframe` do Spotify com altura fixa**
  `src/components/dreams/DreamWorld.tsx:1096-1104` e `src/components/moments/MomentsPlaylists.tsx:62-72` — `height={380}` fixo. Em telas baixas o player toma metade da viewport.
  **Fix:** `height: clamp(250px, 55vh, 380px)`.

- [ ] **B6 — OTP com largura fixa de 44px × 6**
  `src/components/onboarding/AccountSetup.tsx:456` — cada input `width:44`. Em telas estreitas (<300px) os 6 + gaps estouram a linha.
  **Fix:** `flex:1; min-width:0; max-width:44px`.

---

## C. Por rota / aba (status visual no desktop e mobile)

| Rota / Aba | Mobile | Desktop | Observação |
|---|---|---|---|
| `/?tab=chat` (Home) | ✅ ok | ⚠️ A1 (dock) | conteúdo central ok |
| KALM (`wellness`) | ✅ ok | ⚠️ A1 | card centralizado ok |
| Sonhos (`dreams`) | ✅ ok | ⚠️ A1 + B5 iframe | |
| Histórias (`explore`) | ✅ ok | ⚠️ A1 | |
| Brincar (`play`) | ✅ ok | ❌ A2 cards full-width | estica feio no desktop |
| Bora! (`bora`) | ✅ ok | ⚠️ A1 + B4 | |
| Rotina (`routine`) | ✅ ok | ⚠️ A1 | |
| Momentos (`moments`) | ✅ ok | ⚠️ A1 + B5 | |
| Cinema (`cinema`) | ✅ ok | ❌ A2 banner full-width | |
| Música (`music`) | ✅ ok | ⚠️ A1 | |
| Memórias (`memories`) | ✅ ok | ⚠️ A1 | |
| `/auth` | ✅ ok | ✅ ok | form topo, espaço vazio embaixo (cosmético) |
| `/lp` (LandingQuiz) | ✅ ok | ✅ ótimo | landing tem max-width próprio |
| `/landing` | ✅ ok | ✅ ok | |
| `/admin` | — | ⚠️ C1 | ver abaixo |

- [ ] **C1 — Admin: container sem padding lateral + cards de usuário sem controle de overflow de texto**
  `src/pages/Admin.tsx:128` (`max-w-2xl mx-auto` sem `px-*` → texto cola na borda no mobile) e `:186-237` (email/datas longos sem `truncate`).
  **Fix:** `px-4` no container; `truncate` nas células de email/data.

---

## D. Forte indício no código — validar rolando com conteúdo real

> O DB local está **vazio** (telas em estado-vazio curto), então não dá pra confirmar 100% por screenshot que o conteúdo fica escondido. Mas a medição prova que **o dock cobre os últimos 152px** (com barra "Pais/Assinar") / ~104px (sem). Telas com `padding-bottom` menor que isso terão o último item escondido quando houver conteúdo longo:

- [ ] **D1** `src/components/play/MyActivities.tsx:229` — `pb-6` (24px) ≪ 104px.
- [ ] **D2** `src/components/play/MyKidzz.tsx:267` — `pb-32` (128px) ok p/ dock só, mas < 152px se a barra "Pais/Assinar" estiver visível.
- [ ] **D3** `src/components/music/CreateMusic.tsx:193` — content scroll sem `padding-bottom` p/ o dock.
- [ ] **D4** `src/components/wellness/WellnessHub.tsx:542,701` — seções com `pb-10` (40px).
- [ ] **D5** `src/components/flow/HomeScreen.tsx:535` — `padding-bottom:140px` < 152px medido (overlap de ~12px com a barra "Pais/Assinar").
  **Fix geral D1–D5:** padronizar `padding-bottom: calc(env(safe-area-inset-bottom,0px) + 160px)` nas views scrolláveis do hub.

---

## E. Menores / cosméticos (100% no código)

- [ ] **E1** `BottomNav.tsx:329` — label do dock com `whiteSpace:nowrap` sem `text-overflow:ellipsis` (labels longos "Momentos"/"Memórias" podem cortar em telas <320px).
- [ ] **E2** `index.html:5` — viewport tem `viewport-fit=cover` ✅, mas sem `maximum-scale`/`user-scalable` (zoom duplo-tap pode quebrar layout). *Opcional — alguns preferem manter zoom por acessibilidade.*
- [ ] **E3** `capacitor.config.ts` StatusBar `#FF8C00` ≠ web theme-color `#E8821A` — cor da status bar diverge entre web e app nativo.
- [ ] **E4** `src/components/MagicalBackground.tsx:48-56` — imagem de fundo eager-load sem `loading="lazy"` (bloqueia 1º render em 3G).

---

## Prioridade sugerida

1. **A1** (dock full-width desktop — o bug da imagem) → maior impacto visual, fix de 1 linha.
2. **A4 / A2** (tap targets 44px + max-width consistente no desktop).
3. **B1–B3** (z-index / safe-area dos banners).
4. **A3** (repensar 11 abas no dock).
5. **D1–D5** (padding-bottom vs dock de 152px) — validar com conta logada + dados.
6. **B4–B6, C1, E*** (ajustes pontuais).

---

### Pra reverter pro ambiente de produção depois
```bash
cp .env.prod.backup .env && supabase stop
```
Screenshots da auditoria: `/tmp/kidz-audit/hub/` e `/tmp/kidz-audit/shots/`.
