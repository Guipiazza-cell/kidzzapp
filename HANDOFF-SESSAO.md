# Handoff — sessão 2026-07-22 / 2026-07-23

Documento para **continuar em outra sessão**. Ler isto + `REDESIGN-PREMIUM.md`.

---

## Resumo em 30s

Cliente (WhatsApp) pediu ajustes nas **3 primeiras abas**: Perguntas, Descobrir, KALM.

| Item | Status |
|------|--------|
| Código + assets | Feito |
| Commit | `18a1798` em `main` |
| Push GitHub | **Sim** (`origin/main` = `18a1798`) |
| Prod (`kidzz.app`) | Conferir se deploy automático/Lovable já pegou o push (antes do push **não** estava) |

---

## Feedback do cliente (fonte)

WhatsApp `+55 11 97571-1600` · 22/07/2026:

### ABA PERGUNTAS
- Sem imagem boa no hero → usar a melhor (Gui / mascote)
- Logo oficial em todo o site (enviou wordmark glass “KIDZZ”)
- Ao fazer perguntas, nada acontecia → todas as funções precisam funcionar
- Cards iniciais: menos contraste com o fundo → mais esbranquiçado / “mother of pearl”

### ABA DESCOBRIR
- Tirar camaleão **quadradinho** (não faz parte do modelo)
- Arrumar formatação de imagem + texto no início

### ABA KALM
- Formatação do texto inicial
- Logo padrão

### Escopo
- “As 3 primeiras” abas

Imagens de referência da sessão (assets salvos em sessão Grok + copiados para o repo):
- Logo KIDZZ glass floresta → `public/exemplos/assets/brand/`
- Gui mascote com coração → cutout em `brand/` + hero Perguntas

---

## O que foi implementado

### 1) Logo oficial (site)
- Componente: `src/components/common/KidzzLogo.tsx`
- Asset principal: `public/exemplos/assets/brand/kidzz-wordmark-alpha.png`
- Usado em:
  - `KidzzHeader.tsx` (headers que usam o header padrão)
  - `HomeScreen.tsx` (Perguntas)
  - `DiscoverScreen.tsx`
  - `KalmHome.tsx` (**KALM ativo v2** — ver abaixo)
  - `KalmPremiumHome.tsx` (legado; ver nota Lovable)

### 2) Perguntas — `src/components/flow/HomeScreen.tsx`
- Hero Gui: `public/exemplos/assets/perguntas-v2/gui-hero-v2.png` (fallback `gui-hero.png`)
- Cards “Hoje para você”: fundo pérola esbranquiçado + mini-covers suaves
- Submit não trava se o fluxo não muda de tela

### 3) Fluxo de perguntas — `src/pages/Index.tsx`
- Sem `user` / `session.access_token` → toast + `navigate("/auth")` (antes o GeneratingScreen falhava e parecia “nada acontece”)
- Limite free → paywall contextual (como antes)

### 4) Descobrir — `src/components/discover/DiscoverScreen.tsx`
- Removido camaleão quadrado do hero e da dica
- Logo no topo + hero família com máscara/tipografia realinhados
- Dica virou ícone folha (sem thumb do Gui)

### 5) KALM
- **Importante (Lovable):** em `main` a aba KALM **não** usa mais `WellnessHub` / `KalmPremiumHome`.
- Entrada ativa: `KalmV2` → `src/components/kalm/v2/KalmHome.tsx` (tema escuro florestal)
- Ajustes de logo + texto inicial aplicados em **`KalmHome.tsx`** (caminho real)
- `KalmPremiumHome.tsx` ainda tem logo/texto polidos, mas fica **fora do path** enquanto Index apontar para KalmV2

---

## Conflito Lovable (crítico para a próxima sessão)

Antes do push, o remoto estava **18 commits à frente** (bot `gpt-engineer-app[bot]` = Lovable).

Principais commits remotos (base `ba239cd` → `f7d7fc1`):
- Redesenhou aba KALM visual
- Tema escuro na KalmHome
- Redesigneou subtelas dark Kalm
- Conectou áudio e feedback share
- Vários “Changes”

Arquivos que a Lovable mexeu (relativo ao nosso base):
- `src/pages/Index.tsx` → `loadKalmV2` / `<KalmV2 …>` (no lugar de WellnessHub)
- `src/components/kalm/v2/KalmHome.tsx`, `Pillars.tsx`, `SubScreens.tsx`
- `src/components/wellness/WellnessHub.tsx`, `WellnessGrowth.tsx`
- `bun.lock`, mcp bits

**O que fizemos:** `git fetch` → **rebase** do nosso fix em cima de `origin/main` → amend com logo no `KalmHome` v2 → **push**.

Não fazer force-push. Se a Lovable subir de novo, **sempre fetch + rebase/merge** antes de commitar.

---

## Git / identidade

- Repo: `Guipiazza-cell/kidzzapp` (freela)
- Autor de commit:
  ```
  samuelfajreldines01 <285205407+samuelfajreldines01@users.noreply.github.com>
  ```
- Nunca: `samuelfaj` / `samuelfajreldines@gmail.com`
- Commit desta sessão (após rebase):
  ```
  18a1798 fix(perguntas/descobrir/kalm): logo oficial, hero Gui, cards pérola e fluxo de perguntas
  ```
- Branch: `main` = `origin/main` (sincronizado no momento do handoff)

---

## Arquivos tocados (sessão)

```
public/exemplos/assets/brand/*          # logo + gui cutouts
public/exemplos/assets/perguntas-v2/gui-hero-v2.png
src/components/common/KidzzLogo.tsx     # novo
src/components/common/KidzzHeader.tsx
src/components/flow/HomeScreen.tsx
src/components/discover/DiscoverScreen.tsx
src/components/wellness/KalmPremiumHome.tsx  # legado path
src/components/kalm/v2/KalmHome.tsx     # KALM ativo
src/pages/Index.tsx                     # login em perguntas + (Lovable) KalmV2
```

---

## Como validar

```bash
bun run dev
# http://localhost:8080/
```

1. **Perguntas:** logo imagem, Gui no hero, cards claros, digitar pergunta (logado) deve ir para generating; deslogado → auth.
2. **Descobrir:** sem Gui em thumbnail quadrado; hero família + texto ok.
3. **KALM:** tela dark da Lovable + logo KIDZZ no header + texto inicial legível.

Prod:
```bash
# assets novos
curl -sI https://kidzz.app/exemplos/assets/brand/kidzz-wordmark-alpha.png
curl -sI https://kidzz.app/exemplos/assets/perguntas-v2/gui-hero-v2.png
# version
curl -s https://kidzz.app/version.json
```
Antes do push: assets **404**, version `builtAt: 2026-07-22T03:47:12Z`. Depois do deploy, devem ser **200**.

---

## Pendências / próximos passos

1. **Confirmar deploy em prod** (Lovable/Vercel) — push já foi; deploy pode ser auto ou manual.
2. Se o cliente reenviar **logo/imagem melhor**, trocar só:
   - `public/exemplos/assets/brand/kidzz-wordmark-alpha.png`
   - `public/exemplos/assets/perguntas-v2/gui-hero-v2.png` (e/ou brand gui-cutout)
3. **Logo em “todo o site”:** ainda há wordmarks em texto em abas que não usam `KidzzHeader`. Expandir `KidzzLogo` se o cliente reclamar.
4. **KALM dual-path:** não reativar `KalmPremiumHome` sem checar se a Lovable/cliente quer o dark v2.
5. Feedback futuro das outras abas (Sonhos, Histórias, Brincar, etc.) — ver `REDESIGN-PREMIUM.md`.
6. Pasta prints: `public/TELAS/` (local, untracked) — não commitar zips/prints a menos que o cliente peça.

---

## Comandos úteis

```bash
git fetch origin
git status -sb
git log -5 --oneline

# se Lovable avançar de novo:
git pull --rebase origin main
# resolver conflitos (cuidado especial Index.tsx + kalm/v2/*)
git push origin main
```

Dev: porta **8080** (`vite.config.ts`).

---

## Premissas honestas da sessão

- Logo “oficial” = wordmark glass extraído da imagem enviada (alpha via processamento local).
- “Perguntas não funcionam” para guest sem sessão: tratado com redirect de login (API exige token).
- Cards pérola = teste visual pedido pelo cliente; se não gostar, reverter só estilos em `DISC_VARIANTS` + `discCardStyle` no `HomeScreen`.
- Não commitamos: `.env`, `design-src/`, zips, `.grok/`, `public/TELAS/`, checklists soltos (exceto este handoff se for versionado).

---

---

## Sessão 2026-07-23 — PDFs de auditoria (Rodada 2 + 3 final)

**Fonte:** `public/TELAS/relatorio-design-kidzz-rodada3-final.pdf` (padrão único).

### Aplicado nesta leva

**Parte 1 — bugs (Música)**
- Removido `Slot: som_*` da UI → descrição humana
- Troféu da Música usa `profile.points` (global), não XP musical local
- Play duplicado nos cards de atividade → 1 play dourado
- CTA “Explorar música” dourado (sem arco-íris)
- Selo PREMIUM unificado + seções sem emoji no título
- Fallback de capa de categoria se asset falhar

**Cinema**
- Capas expandidas (`cinema-v2/cover-*` + `cin-*`) — fim do emoji-pôster nos principais
- Fallback com ícone claquete (não emoji)
- Fundo sem hero desfocado; scrim no texto do hero
- Nota 5.0 → selo “Escolha Kidzz”
- Descrição com 2 linhas (sem cortar no meio da palavra)

**Momentos**
- Fundo sem imagem desfocada do hero
- Scrim no texto do hero (legibilidade)

**Global**
- Removidos chips flutuantes Pais/Assinar do `BottomNav` (cobriam conteúdo)

**Memórias**
- Removido emoji do título “Em andamento”

### Ainda pendente (PDF / Parte 6 depois do 9)
- Padronizar header em TODAS as abas (Sonhos sem Pais, etc.)
- Padronizar card de categoria 3D em Momentos vs Música
- Histórias e Rotina no padrão escuro (item 12 do relatório)
- Capas originais de cinema (direitos) — hoje usamos arte existente/alias
- Compartilhar em Karaokê/Histórias Cantadas (Parte 5)
- Lista de botões sem handler (checklist item 11)

### Como publicar
1. Commit + push no `main` (GitHub)
2. **Publish** na Lovable (push sozinho não publica o site ao vivo)

---

## Sessão 2026-07-23 tarde — Rodada 2 + 3 (Hermes + lote 1/2)

### Hermes (openai-codex gpt-image-2)
Ícones em `public/exemplos/assets/icons-3d/`:
- **Gerados Hermes:** `rain.png`, `heart.png`, `moon.png`, `star.png`
- **Semeados de packs premium** (mesma família visual): forest, ocean, shield, sun, book, family, imagination, values, memories, music, sleep, sparkle, calm

### Aplicado (Lote 1 + parte Lote 2/3)
- Dock: padding 168px nas abas críticas; Pais/Assinar flutuante já removido
- `PremiumSeal` + `Icon3D` + `kidzzIcons.ts` (padrão único de premium e ícones)
- Sonhos: header com voltar + título + modo soninho (ícone **lua**, não sol); sons/categorias/momentos sem emoji; locks → PremiumSeal
- Histórias: **base escura + dourado**; benefícios com ícones 3D; selo PREMIUM
- Rotina: botão **Já fiz** sólido (sem degradê bugado); padding dock
- sleepStories: `icon` fields nos sons, categorias e momentos

### Ainda pendente
- Resto dos ícones 100% Hermes (continuar gerando no mesmo estilo)
- Capas de cinema dedicadas (direitos)
- Micro-interações (Parte UAU 6)
- Kizz estado por aba
- Compartilhar em Sonhos
- Polimento visual de cards em Histórias (vários ainda usam glass claro)

*Última atualização: 2026-07-23 tarde · lote design r2+r3*
