
# Sistema de Monetização Kidzz — Plano de Implementação

Este é um projeto grande. Vou implementá-lo em 7 blocos, na ordem em que cada peça desbloqueia a próxima. Cada bloco entrega valor sozinho, mas o conjunto só fica consistente no fim.

## Bloco 1 — Configuração central de planos

Criar **um único arquivo** `src/lib/plans.ts` com:
- Tipos `Plan = 'free' | 'kidzz' | 'premium'` e `Area = 'perguntas' | 'historias' | 'musica' | 'sonhos' | 'rotina' | 'kalm' | 'brincar' | 'cinema' | 'momentos' | 'memorias' | 'sos'`.
- Mapa `PLAN_ACCESS[plan][area]` → `'full' | 'sample' | 'locked'`.
- Mapa `DAILY_LIMITS[plan]` → `{ perguntas, historias }` (free=2/1, kidzz=10/5, premium=10/5). **Não exibidos na UI** dos pagos.
- Função `minPlanFor(area)` para o cadeado dizer "essa parte é do plano X".

Esse arquivo é a ÚNICA fonte de regras. Qualquer tela que decida acesso por conta própria será refatorada para consultá-lo.

## Bloco 2 — Backend: tabelas + webhook + ciclo de pagamento

Migração Supabase:
- `subscriptions` (user_id PK, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, updated_at). RLS: SELECT próprio; INSERT/UPDATE só service_role.
- `usage` (user_id, date, perguntas_count, historias_count, PK user_id+date). RLS: SELECT próprio; INSERT/UPDATE via RPC `increment_usage(tipo)` security definer.
- Função `get_effective_plan(user_id)` que devolve `'free'|'kidzz'|'premium'` aplicando regra de ciclo:
  - `active`/`trialing` + `current_period_end > now()` → plano contratado.
  - `past_due` + dentro de 3 dias após `current_period_end` → plano contratado com flag de aviso.
  - caso contrário → `free`.

Edge functions:
- `create-checkout` (já existe — vou adaptar para usar os Price IDs do `PRICES`/env e marcar metadata `user_id`/`plan`).
- `stripe-webhook` (novo): valida assinatura com `STRIPE_WEBHOOK_SECRET`, idempotente, trata `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`. Resolve usuário por `stripe_customer_id`. Usa service role.
- `customer-portal` (já existe — verificar e expor botão).
- `check-subscription` (já existe — vou simplificar para apenas sincronizar a tabela `subscriptions` a partir do Stripe, como fallback ao webhook).

Vou precisar do segredo **`STRIPE_WEBHOOK_SECRET`** — peço ao usuário depois que a função estiver criada, junto com a URL do webhook para colar no painel Stripe.

## Bloco 3 — Hook `useEntitlement`

`src/hooks/useEntitlement.ts` — única fonte de verdade no frontend.
- Lê `subscriptions` + `usage` via Supabase.
- Reavalia: on mount, on auth change, on focus, e quando uma área paga é acessada.
- Expõe: `plan`, `isFree`, `isKidzz`, `isPremium`, `inGracePeriod`, `canUse(area)`, `accessLevel(area)` (`'full'|'sample'|'locked'`), `limiteAtingido(tipo)`, `gateInfo(area)` (plano mínimo + mensagem), `refresh()`.
- Usuário grátis sem login: retorna plano `free` lendo `usage` do localStorage como fallback (mas perguntas/historias do logado vão pelo servidor).

## Bloco 4 — Paywall único + cadeado

- `src/components/paywall/PaywallScreen.tsx`: a tela "Assinatura Kidzz" com 3 cards (Grátis / Kidzz / Premium), toggle Mensal/Anual ("2 meses grátis"), comparativo por transformação (sem números nos pagos), microcopy de segurança, botão "Criar conta e assinar" que chama `create-checkout`.
- `src/components/paywall/LockedCard.tsx`: card com mascote Kidzz, texto convidativo e CTA "Ver planos".
- `src/components/paywall/QuotaReachedCard.tsx`: card carinhoso "Kidzz sonolento" para tetos atingidos (free → CTA paywall; pago → apenas "Combinado!").
- Substituir/remover `Paywall.tsx`, `ConversionScreen.tsx`, `ContextualPaywallModal.tsx` antigos, redirecionando seus pontos de uso para `PaywallScreen`.

## Bloco 5 — Travas em TODAS as abas

Em cada tela de aba, no topo, consultar `useEntitlement().accessLevel(area)`:
- `'full'` → conteúdo normal.
- `'sample'` (só free) → mostra 1 item liberado + `LockedCard` no resto.
- `'locked'` → `LockedCard` ocupando a tela.

Telas a tocar:
`MusicForest`, `DreamWorld`, `RoutineScreen`, `KalmSections`/wellness, `KidzzPlay`, `FamilyCinema`, `MomentsPlaylists`, `MemoriesAlbum`, `SOSModal`/`SOSCard`, `StoryFactory`, fluxo de Perguntas (`ChatFlow`/`AnswerScreen`).

## Bloco 6 — Limites invisíveis (perguntas/histórias)

- Antes de gerar pergunta/história: chamar RPC `increment_usage('perguntas'|'historias')` que devolve `{ allowed, count }` baseado no `DAILY_LIMITS` do plano efetivo.
- Se bloqueado e plano = free → `QuotaReachedCard` modo "convite paywall".
- Se bloqueado e plano pago → `QuotaReachedCard` modo "Kidzz sonolento".
- Reler histórias/respostas existentes nunca conta.
- Edge functions `kidzz-chat` e `generate-story` também checam (defesa em profundidade — server é a fonte de verdade).

## Bloco 7 — Histórias de qualidade + "Kiko" → "Kidzz" + painel dos pais

- Atualizar `supabase/functions/generate-story/index.ts` com o system prompt completo do Bloco 6 do briefing (princípios 1–7, modos DORMIR/DIA/TEMÁTICA, regra de variedade, regra de ouro). Idade do filho e nome injetados.
- `rg -i "kiko"` no projeto e substituir todas as ocorrências de "Kiko" por "Kidzz" (texto e identificadores de UI; preservar nomes de assets já renomeados).
- `ParentDashboard.tsx`: adicionar bloco "Acompanhe o [NOME]" com status da assinatura, próxima cobrança, botão "Gerenciar assinatura" (chama `customer-portal`) e sinais de uso positivos (perguntas exploradas na semana, histórias vividas, temas favoritos) lidos de `kidzz_questions_log`/`memories`.

## Detalhes técnicos

- Stack atual: React + Vite + Tailwind + Supabase + Stripe já configurado (chaves Stripe live presentes nos edge functions atuais; vou preservar os Price IDs já em `create-checkout`).
- Webhook: vou criar `supabase/functions/stripe-webhook/index.ts` com `verify_jwt = false` no `config.toml` e usar `stripe.webhooks.constructEventAsync` para validar assinatura.
- `usage` reseta por data (UTC-3 / Brasília) — chave composta `(user_id, date)` calculada com `to_char(now() at time zone 'America/Sao_Paulo','YYYY-MM-DD')`.
- Segredos: Stripe key já existe; vou pedir `STRIPE_WEBHOOK_SECRET` após criar a função (e dar ao usuário a URL para colar no Stripe Dashboard → Developers → Webhooks).

## Ordem de execução

1. Migração (subscriptions + usage + RPCs).
2. Edge functions (webhook + ajustes em create-checkout/check-subscription).
3. `plans.ts` + `useEntitlement`.
4. Paywall único + cadeado + quota card.
5. Aplicar travas nas 11 telas.
6. Limites invisíveis no fluxo de perguntas/histórias.
7. Prompt de histórias + substituir "Kiko" + painel dos pais.

## Pontos que preciso confirmar antes de começar

1. **Price IDs**: os 4 atuais em `create-checkout/index.ts` (kidzz mensal/anual, premium mensal/anual) são os corretos para usar? Confirmo que sim e sigo?
2. **Webhook**: posso criar a função e te passar a URL para colar no Stripe Dashboard e gerar o `STRIPE_WEBHOOK_SECRET`?
3. **Migração destrutiva?** A tabela `profiles` hoje tem `is_premium`/`premium_source`/`tier`. Posso manter essas colunas como legado (read-only) e usar `subscriptions` como a nova fonte? Ou prefere migrar/limpar?

Aprova o plano? Posso começar pelo Bloco 1+2 (config + backend) assim que confirmar — o resto flui em sequência.
