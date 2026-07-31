# Handoff — sessão 2026-07-30

Documento para **continuar na próxima sessão**. Ler isto primeiro.

---

## Resumo em 30s

| Item | Status |
|------|--------|
| Branch | `main` |
| HEAD | `cb5618a` |
| Push GitHub | **Sim** — `origin/main` = `cb5618a` |
| Repo | `https://github.com/Guipiazza-cell/kidzzapp.git` |
| Conta freela (commit + push) | `samuelfajreldines01 <285205407+samuelfajreldines01@users.noreply.github.com>` |
| Worktree desta sessão | `/Volumes/SSD/Desktop/_Projetos/kidz/kidzzapp-repo` |
| Publish Lovable | **Manual** — sync/publish no Lovable (kidzz.app) |
| Redeploy edge `generate-story` | **PENDENTE** (soft-fail de cota no repo, não deployado na edge) |
| SQL cota `increment_usage` | **Confirmar** se migration `20260729000001_…` já rodou no Supabase |

**Tema da sessão:** polish freela page-by-page (Cinema, Memórias, Música, Perguntas, KALM jarro, Histórias, Bora) + handoff de pagamento/cadastro/PIN (só diagnóstico).

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

## Commits no `main` (esta janela 2026-07-30)

| Hash | Mensagem |
|------|----------|
| `aa9e53b` | fix(cinema): remove Gui sobreposto no hero, só fundo |
| `95c81da` | fix(cinema): remove chips Sessões e sobe Gui no hero |
| `f35a5ff` | feat(memorias): histórico de uso de todas as abas *(antes)* |
| `909d904` | feat(musica): karaokê matinal mais longo e natural |
| `7d2337a` … `37f405e` | memorias hero experiments → card + cutout |
| `3e057bd` / `67ba03f` | fix(cinema): sobe Gui do fundo (agressivo) |
| `aa2a733` / `de784d1` | fix(memorias): Gui cutout sem fundo (corpo completo) |
| `2fa96f5` | feat(memorias): fundo rosa e ícones 3D dos atalhos |
| `5fdfce6` | fix(memorias): remove subtítulo do card do hero |
| `ccb96ec` / `5d90197` | fix(perguntas): loading + barra + floresta |
| `75c9b6a` | fix(kalm): restaura imagem do jarro da gratidão (PNG bundle) |
| `a8f01ec` | fix(historias): UI personalização e QUOTA_ERROR |
| `31dce7a` | fix(bora): remove rodapé “Menos tela, mais memórias” |
| `dcf5c5c` | fix(bora): X no modal “Quem vai brincar?” volta da aba |
| `0a48376` | fix(cinema): remove contagem “N filmes” das seções |
| `cb5618a` | fix(musica): hero com pessoas em foco e texto em card |

Tudo acima já em `origin/main`.

---

## O que foi feito (checklist por aba)

### Cinema
- [x] Remove camaleão **sobreposto** (`hero-gui`); só fundo `hero-bg`
- [x] Gui do fundo **mais alto** (objectPosition + scale + translateY)
- [x] Remove bloco **Sessões / chips** (“Qual o clima de hoje?”)
- [x] Remove texto **“N filmes”** de todas as fileiras

### Memórias
- [x] Hero em **card glass** com Gui cutout (sem full-bleed gerado ruim)
- [x] Cutout **corpo completo** (sem recorte agressivo)
- [x] Fundo da aba na família do **rosa** do card “Nova Pergunta”
- [x] Ícones 3D novos: pergunta / história / missão
- [x] Remove subtítulo “Cada momento juntos…”

### Música
- [x] Karaokê “Raio de Sol” e rotação: letras mais longas e naturais
- [x] Hero: foto **mais pessoas / menos céu**; texto em **card abaixo do hero**

### Perguntas
- [x] Tela de “formulando” com **floresta + barra de progresso** dourada
- [x] Erro com “Tentar de novo” (não some sozinho pra home)
- [x] Guest: toast + Entrar (não joga pra `/auth` e some)
- [x] Hero: texto mais baixo; Gui mais alto no cover

### KALM
- [x] Imagem do **jarro da gratidão** restaurada (`src/assets/kalm/jar-gratitude.png` + fallback)

### Histórias
- [x] Remove **boneco** do passo avatar
- [x] Cards “presente de hoje” com **ícones Lucide** (sem emoji feio)
- [x] Cards de personalização com **glass** semi-transparente
- [x] Toast não mostra `QUOTA_ERROR` cru; mensagem amigável
- [x] `generate-story`: soft-fail se `increment_usage` quebrar por erro técnico (**precisa redeploy da function**)

### Bora
- [x] Remove rodapé “Menos tela, mais memórias · …”
- [x] **X** no modal “Quem vai brincar?” → fecha e `onBack` (sai da aba)

### Pagamento / cadastro / PIN (só diagnóstico — sem commit de fix)
- [x] Mapeado: Stripe `create-checkout` → webhook → `get_effective_plan` / `AreaGate`
- [x] PIN pais: localStorage SHA-256, default `1234` em install limpo
- [x] Cadastro: `/auth` + `AccountSetup` onboarding
- [ ] **Teste real** de pagamento (cartão teste / staging) — ainda aberto
- [ ] Allowlist checkout: falta `localhost:5174` / `127.0.0.1:5174` se dev nessa porta

---

## Arquivos-chave tocados (sessão 30/07)

```
src/components/cinema/FamilyCinema.tsx
src/components/memories/MemoriesAlbum.tsx
src/assets/memorias/gui-cutout.png
src/assets/memorias/icon-*.png
src/components/music/MusicEngine.ts
src/components/music/MorningKaraoke.tsx
src/components/music/MusicForest.tsx
src/components/flow/GeneratingScreen.tsx
src/components/flow/HomeScreen.tsx
src/components/flow/ChatFlow.tsx
src/pages/Index.tsx
src/components/kalm/v2/KalmHome.tsx
src/components/kalm/v2/Pillars.tsx
src/assets/kalm/jar-gratitude.png
src/assets/kalm/jarro-gratidao.png
src/components/story/AvatarCustomization.tsx
src/components/story/PersonalizationPanel.tsx
src/components/story/StoryFactory.tsx
src/components/bora/BoraScreen.tsx
src/components/bora/CriancaOnboarding.tsx
supabase/functions/generate-story/index.ts
```

---

## NÃO commitado (lixo local — ignorar)

- `output/`
- `supabase/.temp/`
- `src/assets/kalm-hero-family.prev.webp`
- JPGs soltos de onboarding (`age-onboarding-hero.jpg`, `name-onboarding-hero*.jpg`, etc.)
- `src/assets/kidzz/jarro-gratidao-14.webp` (polaroids; **não** é o jarro — app usa `src/assets/kalm/jar-gratitude.png`)

---

## Bugs desta sessão (sintoma → fix)

| Sintoma | Fix |
|---------|-----|
| Cinema com 2 camaleões / overlay feio | Só `hero-bg` + crop alto |
| Memórias cutout “comido” | Cutout full body + card |
| Loading perguntas sem barra / some pra home | GeneratingScreen floresta + barra + retry |
| KALM jarro sumiu | PNG bundle `jar-gratitude.png` |
| Histórias toast `QUOTA_ERROR` | Soft-fail edge + msg amigável (redeploy pendente) |
| Bora preso no “Quem vai brincar?” | Botão X + onBack |
| Música hero só céu / texto solto | objectPosition pessoas + card texto |

---

## Pendências / próximos passos

### Obrigatório operacional
1. **Lovable:** Sync + Publish do `cb5618a` → smoke no kidzz.app  
2. **Supabase:** redeploy `generate-story` (e idealmente `kidzz-chat` se ainda soft-fail antigo)  
   ```bash
   supabase functions deploy generate-story
   supabase functions deploy kidzz-chat   # se ainda não
   ```
3. Confirmar SQL `20260729000001_fix_increment_usage_resilient.sql` no projeto  
4. Smoke: 1 pergunta + 1 história + jarro KALM + Bora X + Cinema fileiras + Música hero

### Produto ainda aberto
- Teste ponta a ponta **pagamento Stripe** (checkout → webhook → premium unlock)
- Teste **cadastro** e **PIN pais** (`1234` limpo → definir PIN)
- Allowlist `create-checkout` para `http://127.0.0.1:5174` se dev local nessa porta
- Deploy edge `generate-story` após soft-fail (se ainda der QUOTA_ERROR em prod)

### Não reabrir sem evidência
- Capas de cinema genéricas (já substituídas em commits anteriores `02a87a6` etc.)
- Overlay cinema Gui card (removido)

---

## Dev local

```bash
cd /Volumes/SSD/Desktop/_Projetos/kidz/kidzzapp-repo
npm run dev -- --host 127.0.0.1 --port 5174
# http://127.0.0.1:5174/
```

Env: `.env` local (não commitar secrets).  
Porta padrão do `vite.config` é 8080; na sessão usamos **5174**.

---

## Como publicar

1. GitHub `main` já em `cb5618a`  
2. Lovable: Sync / Rebuild / Publish  
3. Supabase: SQL cota (se pendente) + deploy functions  
4. Hard refresh no kidzz.app e validar checklist operacional  

---

*Atualizado: 2026-07-30 — sessão polish Cinema/Memórias/Música/Perguntas/KALM/Histórias/Bora.*
