# Kidzz — Redesign premium (handoff de sessão)

Documento para **continuar em outra sessão**. Ler este arquivo primeiro.

---

## Objetivo

Redesenhar as abas do app **parte a parte**, no padrão premium dos mockups, **sem remover lógica/fluxos reais** — só visual, layout e assets.

---

## Regras de ouro (obrigatório)

### 1) Fonte de verdade do design
- Prints em: `public/telas/<nome-da-aba>/`
- Pastas feitas ficam com sufixo **`- ok`** (ex.: `DESCOBRIR - ok`)
- Usar os prints para: layout, cores, bordas, tipografia, glass, hierarquia, CTAs, espaçamento

### 2) Imagens — Hermes + Codex (nunca recortar)
- **Nunca** recortar ícones/ilustrações/estrelas dos prints
- **Sempre** gerar com Hermes:
  - CLI: `hermes` → `/Users/alefsantos/.local/bin/hermes`
  - Preferir venv: `/Users/alefsantos/.hermes/hermes-agent/venv/bin/hermes`
  - Tool: `image_generate`
  - Provider: **`openai-codex`** (Codex OAuth logado — sem `OPENAI_API_KEY`)
  - Config: `~/.hermes/config.yaml` → `image_gen.provider: openai-codex`
  - Modelo de imagem: `gpt-image-2` (default medium)
  - Saída: `~/.hermes/cache/images/` → copiar para `public/exemplos/assets/<aba>-v2/`
- Exemplo oneshot:
  ```bash
  export PATH="/bin:/usr/bin:/usr/local/bin"
  H=/Users/alefsantos/.hermes/hermes-agent/venv/bin/hermes
  $H -z "Use image_generate tool now. Prompt: ... NO text, NO watermark. Reply only full PNG path." --yolo --ignore-rules
  ```
- **PATH do shell**: após hermes, usar `/bin/cp` com path absoluto (às vezes o PATH quebra)

### 3) Personagens: mix pessoas + lagarto (Gui)
- **Não** é só gente nem só camaleão
- Combinar: família/crianças **e** Gui quando fizer sentido
- Ex.: hero com Gui + card com família, ou o contrário

### 4) Escopo de código
- **Só design** — não apagar jogos, hooks, paywall, mic, playlists, rotas, dados reais
- Manter handlers e estados; trocar estilos, assets e hierarquia visual
- Preferir tokens de `src/lib/premiumUi.ts` (glass, blur ≥ 28–40, raios, pills)

### 5) Fluxo por aba
1. Ler prints em `public/telas/<aba>/`
2. Ler componente da aba no código
3. Listar assets necessários
4. Gerar assets com Hermes/Codex
5. Montar UI premium ligada aos dados reais
6. Rodar local → usuário **vê e confirma**
7. Só depois: **commit + push** (só arquivos da aba + assets)
8. Renomear pasta: `public/telas/<aba> - ok`

### 6) Git / identidade
- Repo freela: `Guipiazza-cell/kidzzapp`
- Autor de commit:
  ```
  samuelfajreldines01 <285205407+samuelfajreldines01@users.noreply.github.com>
  ```
- **Nunca** usar `samuelfaj` / `samuelfajreldines@gmail.com`
- Mensagem estilo:
  ```
  feat(<aba>): redesign premium da aba <Nome>

  Assets Hermes/Codex + glass premium; lógica real preservada.
  ```
- Não commitar: `.env`, `design-src/`, zips, `.grok/`, checklists soltos

### 7) Dev local
```bash
bun run dev
# http://localhost:8080/
```
Porta padrão Vite: **8080** (`vite.config.ts`)

---

## Status das abas

### Feitas (commits em `main`)

| Aba | Pasta prints | Assets | Componente principal | Commit (ref) |
|-----|--------------|--------|----------------------|--------------|
| **Bora** | `public/telas/bora - ok` | `public/exemplos/assets/bora-v2/` | `src/components/bora/BoraScreen.tsx` | `feat(bora): redesign premium…` |
| **Sonhos** | `ABA SONHOS - ok` | `sonhos-v2/` | `src/components/dreams/DreamWorld.tsx` + `sleepStories.ts` | `feat(sonhos):…` |
| **Música** | `MUSICA - ok` | `musica-v2/` | `src/components/music/MusicForest.tsx` | `feat(musica):…` |
| **Histórias** | `historia-ok` | `historias-v2/` | `src/components/story/StoriesHome.tsx` | `feat(historias):…` |
| **Brincar** | `brincar - ok` | `brincar-v2/` | `src/components/play/KidzzPlay.tsx` | `feat(brincar):…` |
| **Descobrir** | `DESCOBRIR - ok` | `descobrir-v2/` | `src/components/discover/DiscoverScreen.tsx` + `discoverData.ts` | `feat(descobrir):…` + polish `18a1798` |
| **Perguntas** | `PERGUNTAS - ok` | `perguntas-v2/` (+ `gui-hero-v2`, brand logo) | `src/components/flow/HomeScreen.tsx` | polish `18a1798` (logo, Gui, cards pérola, submit/login) |
| **Memórias** | `memorias - ok` | `memorias-v2/` | `src/components/memories/MemoriesAlbum.tsx` | `feat(memorias):…` |
| **Rotina** | `Rotina/` | — | `RoutineScreen.tsx` | `feat(rotina):…` |
| **Cinema** | `cinema - ok` | — | `FamilyCinema.tsx` | `feat(cinema):…` |
| **Momentos** | `momentos - ok` | — | `MomentsPlaylists.tsx` | `feat(momentos):…` |
| **KALM** | `kalm` | dark v2 Lovable + logo | **`kalm/v2/KalmV2.tsx` + `KalmHome.tsx`** (não KalmPremiumHome) | Lovable `f7d7fc1` + logo/texto `18a1798` |

### Sessão 2026-07-22/23 (polish 3 abas)

Ver handoff completo: **`HANDOFF-SESSAO.md`**.

- Logo: `src/components/common/KidzzLogo.tsx` + `public/exemplos/assets/brand/`
- Push feito: `18a1798` em `main`
- Lovable tinha 18 commits (KALM dark); rebase antes do push

### Ainda sem pasta/print em `public/telas/` (próximas quando o usuário colocar)

Possíveis abas do app ainda fora desta leva / a validar prints:
- Outras tabs do dock se surgirem prints novos

**Como seguir:** usuário coloca prints em `public/telas/<nome>/` e pede a próxima aba. Sempre `git fetch` antes — Lovable pode ter commitado.

### Memórias — dados reais (importante)

Não usar títulos mock da imagem. Fontes:
- **Momentos guardados** → tabela `memories` (o que a família consumiu e salvou)
- **Em andamento** → leitura de história incompleta (`storyProgress`) + missões da semana incompletas (`weeklyActivities`) + progresso de perguntas (`questions_used` + última pergunta salva)
- **Conquistas da família** → `questions_used`, `stories_used`, contagem de missões/memórias, `streak_days`
- **Pontos** → `profile.points`

---

## Tokens e padrões de UI

Arquivo: `src/lib/premiumUi.ts`

- Blur alto: cards ~36–44px, pills ~36, dock ~40–44
- Borda hairline `0.5px`
- Raios: card 28, panel 24, chip 18, btn 999
- Hit target ≥ 44pt
- Fontes: **Nunito** (UI) + **Lora** (títulos) — constantes `FONT` / `SERIF`
- Light glass: telas claras (Música, Descobrir, Brincar)
- Dark glass: telas escuras (Bora, Sonhos, Perguntas)

Padrão visual por tipo de tela:
- **Floresta/dourado:** Perguntas, Brincar, Música
- **Roxo noite:** Sonhos
- **Creme/laranja:** Histórias, Descobrir
- **Dark warm glass:** Bora

---

## Mapa rápido código ↔ aba

| Aba | Entrada no app | Arquivos |
|-----|----------------|----------|
| Perguntas | tab `chat` | `HomeScreen.tsx` |
| Descobrir | tab discover | `DiscoverScreen.tsx`, `discoverData.ts` |
| Bora | tab bora | `components/bora/*` |
| Sonhos | tab dreams | `components/dreams/*` |
| Música | tab music | `components/music/MusicForest.tsx` |
| Histórias | tab stories | `components/story/StoriesHome.tsx` |
| Brincar | tab play | `components/play/KidzzPlay.tsx` |

Tabs: `src/lib/appTabs.ts`, roteamento em `src/pages/Index.tsx`.

---

## Checklist ao iniciar uma aba nova

```
[ ] Prints em public/telas/<aba>/
[ ] Identificar componente(s) e o que NÃO pode quebrar
[ ] Lista de assets (hero, tiles, capas, bg)
[ ] Gerar com Hermes openai-codex → copiar para public/exemplos/assets/<aba>-v2/
[ ] Aplicar UI premium (glass, tipografia, layout do print)
[ ] Smoke: assets 200 no Vite, typecheck sem erros na aba
[ ] Usuário valida local
[ ] Commit + push só da aba
[ ] Renomear pasta public/telas/<aba> - ok
```

---

## O que NÃO fazer

- Recortar mockups para ícones
- Trocar lógica de negócio / remover features
- Commitar `.env` (local vs prod)
- Usar conta git errada
- Redesign de todas as abas de uma vez (sempre **parte a parte**)
- Afirmar deploy/status sem verificar

---

## Comando útil de status

```bash
ls public/telas/
git log --oneline -10
git status -sb
```

---

## Como chamar este doc na próxima sessão

Pedir ao agente:

> Lê `REDESIGN-PREMIUM.md` e continua o redesign pela próxima aba em `public/telas/` que ainda não tenha `- ok`.

Ou:

> Segue o método de `REDESIGN-PREMIUM.md` na aba X.

---

*Última atualização: Memórias commitada e pushada (`c25e1a9`); pasta `memorias - ok`.*
