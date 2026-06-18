# Plano: Aba "Bora!" do Kidzz

Vou implementar em 6 fases. Confirme antes de eu começar — ou peça pra eu rodar **fase por fase** (recomendado, porque é grande).

## Fase 1 — Navegação (dock)
- Remover **Música** do dock (`src/lib/appTabs.ts` + `BottomNav.tsx`).
- Adicionar **Bora!** na posição central (5ª de 6), com tratamento visual de FAB elevado em laranja `#E8821A`, ícone sparkles.
- **Brincar** continua; Música vira uma seção/botão dentro de `KidzzPlay.tsx`.
- Redirecionar `?tab=musica` → `?tab=play` em `normalizeAppTab`.

Dock final: **Perguntas · Histórias · Brincar · Bora! · Cinema · Momentos** (mantendo padrão de 6, com Bora! central destacado).

## Fase 2 — Design system
- Adicionar Google Fonts `Fredoka` + `Nunito` no `index.html`.
- Tokens novos em `src/index.css` (cream `#FBF7EF`, dark green `#2F5E45`, 7 gradientes de categoria, selo verde sem-tela).
- Classes utilitárias `.bora-card`, `.bora-cat-{ciencia|sensorial|...}`, `.bora-screenfree-badge`.

## Fase 3 — Supabase
- Migração: tabela `activities` (com RLS leitura pública) + tabela `completions` (RLS por user_id) com GRANTs.
- Seed com as 32 atividades do `kidzz_bora_v4.html` via insert tool.

**Preciso do arquivo `kidzz_bora_v4.html`** para extrair o objeto `ACTS`. Pode subir ele? Sem isso, faço seed com ~10 atividades placeholder e você sobe o HTML depois.

## Fase 4 — Edge function `surpresa-ia`
- Criar `supabase/functions/surpresa-ia/index.ts` chamando Groq (`llama-3.3-70b-versatile`, JSON mode).
- **Preciso da `GROQ_API_KEY`** — vou pedir via `add_secret` quando começar a fase.
- Fallback: sorteia de `activities` se a API falhar.

## Fase 5 — Página `/bora` (`src/components/bora/BoraScreen.tsx`)
Seções na ordem:
1. Topo com saudação por hora do dia
2. Faixa de tese "sem-tela"
3. Hero "Pra fazer hoje" (categoria por hora + selo 🧠 + botão "🎲 Outra")
4. Card "✨ Surpresa da IA" (gradiente animado + loading + selo "Criada pela IA agora")
5. Finder: humor (3 cards) + tempo (3 pílulas)
6. Carrossel de 7 coleções
7. Destaque "💬 Pra conversar"
8. Grade "🧺 Tudo pra fazer" com chips de categoria → bottom sheet de detalhe
9. Contador 🌿 "sem tela" (soma `tela_min` de `completions` últimos 7 dias)
10. Fechamento

## Fase 6 — Overlay "sem tela"
- `ScreenFreeOverlay.tsx`: fullscreen verde gradiente + 🌿 + confete + botão "Tô indo! 🚀".
- Dispara ao clicar "Bora fazer! 🌿" e registra `completions`.
- Respeita `prefers-reduced-motion`.

---

## Perguntas antes de começar
1. **Tem o arquivo `kidzz_bora_v4.html`?** Suba ele para eu extrair as 32 atividades exatas. Sem ele, sigo com placeholders.
2. **Já tem a `GROQ_API_KEY`?** Crie em https://console.groq.com/keys (grátis). Vou pedir via `add_secret` na Fase 4.
3. Quer que eu **rode tudo de uma vez** ou **fase por fase** (recomendo fase por fase pra você validar o visual)?

Quando responder, começo pela Fase 1.
