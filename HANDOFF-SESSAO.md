# Handoff — sessão 2026-07-23 → 2026-07-27

Documento para **continuar na próxima sessão**. Ler isto primeiro.

---

## Resumo em 30s

| Item | Status |
|------|--------|
| Branch | `main` |
| HEAD | `4dca922` |
| Push GitHub | **Sim** (`origin/main` = `4dca922`) |
| Conta freela (commit + push) | `samuelfajreldines01` |
| Publish Lovable | **Manual** — cliente/dev precisa Publish no Lovable para prod `kidzz.app` |
| Worktree | `/Users/alefsantos/dev/kidzzapp` |

**Tema da sessão:** camaleões originais em todas as telas + polish UI (Perguntas/KALM/Descobrir) + suite E2E Playwright.

---

## Identidade Git (freela Kidzz)

- Autor/commit: `samuelfajreldines01 <285205407+samuelfajreldines01@users.noreply.github.com>`
- Push: conta ativa do `gh` deve ser **`samuelfajreldines01`** (não `alefdssantos` — 403 no repo)
- Nunca usar `samuelfaj` / `samuelfajreldines@gmail.com`

```bash
gh auth switch -u samuelfajreldines01
gh auth setup-git
```

---

## O que o cliente pediu (áudio + feedbacks)

### Áudio WhatsApp `Ptt 2026-07-23 at 17.25.54.ogg` (~1min)

1. **Gui/camaleão** = “alma do negócio” — em todas as abas, chamativo (originais)
2. **Perguntar sem cadastro** — hoje exige login (Index redireciona `/auth`) — **ainda pendente**
3. **Tirar validação “senha vazou na internet”** no cadastro (HIBP) — **ainda pendente**
4. **Reset de senha**: e-mail chega sem link — bug estrutural — **ainda pendente**
5. Pressão de prazo (“consegue hoje?”)

### Feedbacks visuais posteriores

- Logo translúcida (conceito glass / sem cor fixa) — **só discutido, não implementado 100%**
- Cards “Hoje para você” com `?` → capas geradas por categoria
- KALM: header estilo mockup com Gui original; texto não cobrir personagem; sem 💛; scroll + padding do dock
- Perguntas iPhone: hífen em “Conecte-se”, sombra dupla do Gui, header cortado, barra maior
- Descobrir: hero premium

---

## O que foi implementado (esta janela de trabalho)

### 1) Camaleões originais (cliente)

Fonte: `public/camaleao/originais/` + pack soft:

`public/exemplos/assets/camaleao-oficial/`

| Pose | Uso típico |
|------|------------|
| heart | Perguntas, Memórias, KALM |
| arms | Cinema, Rotina, Descobrir, brand |
| headphones | Momentos |
| sleepy | Sonhos |

Lib: `src/lib/camaleaoOficial.ts` → `CAMALEAO.*` + `CAMALEAO_SCENE_MASK`

Webps de mascote em `src/assets/` e `src/assets/kidzz/*` também viraram originais soft.

### 2) Perguntas — `HomeScreen.tsx`

- Hero premium: `src/assets/perguntas-hero.webp` + `public/.../perguntas-v2/hero-oficial.png`
- Capas “Hoje para você”: `src/assets/perguntas-covers/*` (por categoria, sem `?`)
- Header grid + safe-area (logo/Pais sem cortar)
- “Conecte-se.” com `whiteSpace: nowrap` (sem hífen)
- **Sem** overlay fantasma do Gui (só a arte do hero)
- Barra de pergunta 54px
- Submit reforça limite free via parent

### 3) KALM — path ativo: `KalmV2` → `KalmHome.tsx`

**Não** é `KalmPremiumHome` no Index.

- Hero família + Gui: `src/assets/kalm-hero-family.webp` + `kalm-v2/hero-family-oficial.png`
- Texto (“Pequenos gestos…”) **abaixo** do hero (faixa escura)
- Cards opacos (não esbranquiçados)
- Scroll: container `KalmV2` com `overflow-y-auto`
- Padding inferior: `calc(safe-area + 168px)` (home + pilares + SOS)

### 4) Descobrir — `DiscoverScreen.tsx`

- Hero: `src/assets/descobrir-hero.webp` + `descobrir-v2/hero-oficial.png`
- Card arredondado + Gui arms soft
- `data-dock-tab` no BottomNav para E2E

### 5) E2E Playwright — **30/30 green**

```
e2e/
  auth.setup.ts          # guest localStorage
  helpers/guest.ts
  helpers/nav.ts
  specs/00…08-*.spec.ts
  FEATURE-MATRIX.md
  README.md
playwright.config.ts     # standalone Chromium mobile viewport
```

```bash
npx playwright install chromium   # 1x
npm run test:e2e                  # suite
npm run test:e2e:smoke
npm run test:e2e:ui
```

**Guest** sem produção. NÃO cobre: IA real, Stripe, OAuth, e-mail reset (manual/staging).

### Commits recentes (ordem)

```
4dca922 test(e2e): suite Playwright cobrindo todas as features do produto
81562d3 fix(perguntas): polish iPhone — header, hífen, Gui e barra
14c35d4 feat(descobrir): hero premium com floresta + Gui original
5ade49c / 0a43eaf feat(perguntas) hero + sem coração tagline
45ad1f8 / 7f11ae5 / ebfb58a / 396e6e1 / 06064c2 fix(kalm) scroll, contraste, texto, dock
e88071c feat(kalm): hero do mockup com camaleão original
6b42f8b fix(perguntas): capas no bundle Vite
```

---

## Pendências prioritárias (próxima sessão)

### P0 — Bugs cliente (áudio)

1. **Perguntar sem login** — hoje `handleQuestionSubmit` exige `user` + `session` → `/auth`
2. **Remover check HIBP** (“senha vazou na internet”) no signup
3. **Reset senha sem link no e-mail** — template Supabase / redirect URL / edge

### P1 — Produto / design

4. **Logo KIDZZ translúcida** (conceito glass / sem cor fixa) — asset atual ainda é wordmark verde jelly
5. **Publish Lovable** + hard refresh iPhone para validar prod
6. Conferir se prod `kidzz.app` já está no HEAD `4dca922` (antes costumava ficar atrás)

### P2 — Qualidade

7. Expandir E2E com staging (pergunta real, paywall Stripe test mode)
8. Limpar lixo untracked no repo (zips, WhatsApp, `.env.local-backup-temp`) — **não commitar secrets**

---

## Arquitetura útil (não esquecer)

| Aba dock | `AppTab` id | data-tab | Entry |
|----------|-------------|----------|--------|
| Perguntas | `chat` | `perguntas` | `HomeScreen` via `ChatFlow` |
| Descobrir | `discover` | `descobrir` | `DiscoverScreen` |
| KALM | `wellness` | `kalm` | **`KalmV2` → `KalmHome`** |
| Sonhos | `dreams` | `sonhos` | `DreamWorld` |
| Histórias | `explore` | `historias` | Stories |
| Brincar | `play` | `brincar` | KidzzPlay |
| Bora! | `bora` | `bora` | BoraScreen |
| Rotina | `routine` | `rotina` | RoutineScreen |
| Momentos | `moments` | `momentos` | MomentsPlaylists |
| Cinema | `cinema` | `cinema` | FamilyCinema |
| Música | `music` | `musica` | MusicForest (pode redirecionar) |
| Memórias | `memories` | `memorias` | MemoriesAlbum |

Dock: `src/components/flow/BottomNav.tsx` — `data-dock-tab`, `data-kidzz-dock`, `data-dock-scroller`.

Guest bootstrap: `kidzz_guest_profile` + `kidzz_account_step_done` + splash flags (ver `e2e/helpers/guest.ts`).

---

## Working tree sujo (não stagear sem pedido)

```
M  supabase/functions/mcp/index.ts
?? .env.local-backup-temp
?? zips / WhatsApp / design-src / public/TELAS / camaleao WhatsApp zip
```

---

## Como puxar na próxima sessão

1. Abrir worktree `/Users/alefsantos/dev/kidzzapp`
2. `git pull origin main` (conta `samuelfajreldines01`)
3. Ler este `HANDOFF-SESSAO.md`
4. Priorizar P0 do cliente (login free / senha / reset)
5. Validar prod após Publish Lovable

### Comando útil

```bash
gh auth switch -u samuelfajreldines01 && gh auth setup-git
git status -sb && git log -5 --oneline
npm run test:e2e:smoke
```

---

*Gerado em 2026-07-27 para handoff contínuo Kidzz freela.*
