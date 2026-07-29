# Handoff — sessão 2026-07-29

Documento para **continuar amanhã**. Ler isto primeiro.

---

## Resumo em 30s

| Item | Status |
|------|--------|
| Branch | `main` |
| HEAD | `c617cc3` |
| Push GitHub | **Sim** — `origin/main` = `c617cc3` |
| Repo | `https://github.com/Guipiazza-cell/kidzzapp.git` |
| Conta freela (commit + push) | `samuelfajreldines01 <285205407+samuelfajreldines01@users.noreply.github.com>` |
| Worktree desta sessão | `/Volumes/SSD/Desktop/_Projetos/kidz/kidzzapp-repo` |
| Publish Lovable | **Manual** — sync/publish no Lovable para ir pro ar |
| SQL cota no banco | **PENDENTE no Supabase** (migration pronta no repo) |
| Redeploy edge functions | **PENDENTE** (`kidzz-chat`, `generate-story`) |

**Tema da sessão:** polish live page-by-page (onboarding → Home/Descobrir → SOS → KALM) + fix cota peixes/chuva + push pra Lovable.

---

## Identidade Git (freela Kidzz)

- Autor/commit: `samuelfajreldines01 <285205407+samuelfajreldines01@users.noreply.github.com>`
- **Nunca** usar `samuelfaj` / `samuelfajreldines@gmail.com`
- Repo do cliente: `Guipiazza-cell/kidzzapp`

```bash
cd /Volumes/SSD/Desktop/_Projetos/kidz/kidzzapp-repo
gh auth switch -u samuelfajreldines01   # se precisar push
```

---

## Commits no `main` (esta janela)

| Hash | Mensagem |
|------|----------|
| `c8d7ba4` | feat(onboarding): telas de nome e idade com arte full-bleed |
| `445e0c9` | feat(onboarding): tela de interesses full-bleed com cards temáticos |
| `c617cc3` | feat(kalm): polish UI diurna, fix scroll/dock e cota resiliente |

Tudo já em `origin/main`.

---

## O que foi feito (checklist)

### Onboarding
- [x] Nome: hero full-bleed, frame unificado (`heroFrame` / objectPosition)
- [x] Idade: arte full-bleed
- [x] Interesses: cards temáticos com imagens (`interest-cards/*.webp`), sem emoji-clutter
- [x] Commits de onboarding no main

### Home / Perguntas
- [x] Hero cover, input full-width no card “perguntar”
- [x] Logo removido onde pedido; **Pais** restaurado no header
- [x] Ajustes de copy/layout

### Descobrir
- [x] Um camaleão (removeu duplicado)
- [x] Polish visual leve

### SOS
- [x] Modal redesenhado (picker SVG animado — `SOSPickerIcons.tsx`)
- [x] Crisis flow sem emojis
- [x] Sem camaleão “gui” solto no card onde pediram

### KALM (foco principal da 2ª metade)
- [x] Home: sem logo duplicado, sem 2º camaleão, weather icons SVG (`WeatherIcons.tsx`)
- [x] Card do jarro → agradecer (`jarro-gratidao.webp`)
- [x] Hero família **regenerado 4:3** nítido (`kalm-hero-family.webp`) — Gui inteiro
- [x] **Pillars** redesenhados: `ActivityCard` com ícone Lucide + card opaco (sem caixa de imagem vazia)
- [x] TopBars sem emoji
- [x] Scroll ao abrir pilar **sempre no topo** (`KalmV2` + ref)
- [x] Fundo opaco `#0B1310` (não vaza MagicalBackground claro)
- [x] Cards com `touchAction: "pan-y"` (scroll iOS em cima dos botões)
- [x] Dock **escuro/opaco** na aba `wellness` (`BottomNav` DARK_SCREENS + estilo florestal)
- [x] Padding dock unificado: `KALM_DOCK_CLEARANCE` em `src/components/kalm/v2/layout.ts`

### Cota (peixes/chuva / QUOTA_ERROR infinito)
- [x] Front: `useEntitlement.consumeQuota`, GeneratingScreen/ChatScreen erros
- [x] Edge: `kidzz-chat` + `generate-story` tentam RPC com/sem `_crianca_id`
- [x] Migration: `supabase/migrations/20260729000001_fix_increment_usage_resilient.sql`
- [ ] **Aplicar SQL no Supabase (SQL Editor)** ← amanhã / cliente
- [ ] **Redeploy** functions `kidzz-chat` e `generate-story`

Limites na migration:

| Plano | Perguntas | Histórias |
|-------|-----------|-----------|
| free | 3 | 1 |
| kidzz | 30 | 3 |
| premium | 60 | 5 |

Timezone da cota: `America/Sao_Paulo`.

---

## Arquivos-chave tocados

```
src/components/kalm/v2/KalmHome.tsx
src/components/kalm/v2/KalmV2.tsx
src/components/kalm/v2/Pillars.tsx
src/components/kalm/v2/SubScreens.tsx
src/components/kalm/v2/WeatherIcons.tsx   (novo)
src/components/kalm/v2/layout.ts          (novo)
src/components/flow/BottomNav.tsx
src/components/flow/HomeScreen.tsx
src/components/discover/DiscoverScreen.tsx
src/components/sos/SOSModal.tsx
src/components/sos/SOSPickerIcons.tsx     (novo)
src/components/sos/SOSCrisisFlow.tsx
src/hooks/useEntitlement.ts
src/lib/plans.ts
src/contexts/AuthContext.tsx
src/pages/Index.tsx
src/assets/kalm-hero-family.webp
src/assets/kidzz/jarro-gratidao.webp
supabase/functions/kidzz-chat/index.ts
supabase/functions/generate-story/index.ts
supabase/migrations/20260729000001_fix_increment_usage_resilient.sql
```

---

## NÃO commitado (lixo local — ignorar)

- `output/` (transcrições whatsapp)
- `supabase/.temp/`
- `src/assets/kalm-hero-family.prev.webp` (backup)
- JPGs soltos de onboarding não referenciados (`age-onboarding-hero.jpg`, `name-onboarding-hero*.jpg`, etc.)
- `jarro-gratidao-14.webp` (variante não usada; o app usa `jarro-gratidao.webp`)

---

## Como publicar no Lovable

1. Repo já está no GitHub `main` (`c617cc3`).
2. No Lovable: **Sync / Rebuild / Publish** do projeto ligado a esse repo.
3. **Antes ou logo após publish**, no Supabase do projeto:
   - SQL Editor → colar e rodar  
     `supabase/migrations/20260729000001_fix_increment_usage_resilient.sql`
   - Redeploy: `kidzz-chat`, `generate-story`
4. Smoke test prod/staging:
   - Onboarding (nome → idade → interesses)
   - 1 pergunta + 1 história (não pode ficar infinito em “gerando”)
   - KALM → cada pilar → scroll, cards, dock escuro, sem fundo branco
   - SOS modal

---

## Bugs que já corrigimos (não reabrir sem evidência)

| Sintoma | Causa | Fix |
|---------|--------|-----|
| Cards do pilar “vazios / sem imagem / lavados” | Slot de imagem vazio + card quase transparente + texto claro em fundo claro | ActivityCard opaco + ícone Lucide |
| Abria no final da tela | Scroll do KalmV2 preservado ao trocar view | `scrollTop = 0` no change de `view` |
| Não scrollava nos cards (iOS) | `button { touch-action: manipulation }` | `touchAction: "pan-y"` nos cards |
| Névoa branca embaixo dos cards | MagicalBackground claro + dock branco + blur | Fundo `#0B1310` + dock dark opaco em `wellness` |
| Gui cortado/borrado no hero KALM | Crop 16:9 + scale + asset fraco | Arte 4:3 regenerada + objectPosition |
| QUOTA_ERROR infinito (peixes/chuva) | RPC `increment_usage` sem `_crianca_id` / assinatura | Migration + edges multi-attempt |

---

## Pendências / próximos passos (amanhã)

### Obrigatório operacional
1. **Confirmar** se Lovable publicou o `c617cc3`
2. **Rodar SQL** da cota no Supabase (se ainda não rodou)
3. **Redeploy** `kidzz-chat` + `generate-story`
4. Smoke test real no ambiente publicado

### Produto (ainda abertos de sessões anteriores)
- Perguntar sem cadastro
- Remover validação HIBP “senha vazou”
- Reset de senha sem link no e-mail
- Logo glass 100% (conceito)
- Batch de polish em abas ainda não revistas (Sonhos, Histórias, Brincar, etc.) se o cliente pedir

### UI KALM (se o cliente reclamar de novo)
- Conferir scroll/dock em iPhone físico após publish (HMR local ≠ prod)
- Se quiser **imagens reais** por atividade (hoje é ícone + gradiente; `imgSlot` no data ainda é placeholder sem asset map)

---

## Dev local

```bash
cd /Volumes/SSD/Desktop/_Projetos/kidz/kidzzapp-repo
npm run dev -- --host 127.0.0.1 --port 5174
```

Env: `.env` local já existe (não commitar secrets).

---

## Tom com o cliente

- Freela: polish visual + cota + onboarding arte.
- Entrega no GitHub pronta; **ar no Lovable** depende de Publish + SQL + redeploy functions.
- Não escrever em produção SQL/dados sem OK explícito (só a migration de função `increment_usage` que o cliente/dev aplica no SQL Editor).

---

*Atualizado em 2026-07-29 — sessão polish KALM + push `c617cc3`.*
