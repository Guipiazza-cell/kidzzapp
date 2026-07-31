# Handoff — sessão 2026-07-31

Documento para **continuar na próxima sessão**. Ler isto primeiro.

---

## Resumo em 30s

| Item | Status |
|------|--------|
| Branch | `main` |
| HEAD | `6aca4f3` |
| Push GitHub | **Sim** — `origin/main` = `6aca4f3` |
| Repo | `https://github.com/Guipiazza-cell/kidzzapp.git` |
| Conta freela (commit + push) | `samuelfajreldines01 <285205407+samuelfajreldines01@users.noreply.github.com>` |
| Worktree desta sessão | `/Users/alefsantos/dev/kidzzapp` |
| Worktree SSD (dev server antigo) | `/Volumes/SSD/Desktop/_Projetos/kidz/kidzzapp-repo` (pode estar desatualizado) |
| Publish Lovable | **Manual** — sync/pull da `main` + Publish |
| Deploy edge functions | **PENDENTE** — ver bloco abaixo |

**Tema da sessão:** robustez de assinatura Stripe (anti-fraude/stale) + paywall CTA/desktop + remoção trial 7 dias + copy paywall.

---

## Identidade Git (freela Kidzz)

- Autor/commit: `samuelfajreldines01 <285205407+samuelfajreldines01@users.noreply.github.com>`
- **Nunca** usar `samuelfaj` / `samuelfajreldines@gmail.com`
- Repo do cliente: `Guipiazza-cell/kidzzapp`

```bash
cd /Users/alefsantos/dev/kidzzapp
gh auth switch -u samuelfajreldines01   # se precisar push
```

---

## Commits no `main` (esta sessão 2026-07-31)

| Hash | Mensagem |
|------|----------|
| `a922f68` | fix(billing): revoga acesso stale e endurece mapeamento Stripe |
| `069985f` / `cfd037c` | fix(paywall): CTA fixo no rodapé (desktop/tablet) |
| `71a02b1` | Merge origin/main: robustez de assinatura + CTA paywall |
| `140a53e` | fix(paywall): remove “Famílias no movimento Menos Tela” |
| `9f0e183` | chore: reverte mudança acidental do mcp |
| `6aca4f3` | **fix(billing): remove trial de 7 dias grátis** ← HEAD |

Tudo acima já em `origin/main`.

---

## O que foi feito (checklist)

### 1. Robustez de pagamento / anti-fraude
- [x] **Problema:** se assinatura acabava e o webhook falhava, o app **mantinha premium** (DB fallback “never downgrade” + Auth “confia no DB”).
- [x] `check-subscription`: Stripe OK **sem** sub `active`/`trialing` mapeada → **zera** `is_premium`, `tier=free`, `subscriptions.plan=free`.
- [x] Produto Stripe **desconhecido** → **não concede** pago (antes virava `kidzz`).
- [x] `stripe-webhook`: status `canceled` / `unpaid` / `incomplete*` / `paused` → plan **free** (não re-concede em `subscription.updated`).
- [x] `past_due` mantém plano (grace 3 dias no RPC `get_effective_plan`).
- [x] Manual (`premium_source=manual`) + data de validade intactos.
- [x] `AuthContext`: HTTP 200 free = free; **não** reabre premium pelo DB.
- [x] Regras puras + testes: `src/lib/subscriptionAccess.ts` + `src/test/subscriptionAccess.test.ts` (17 testes).

### 2. Paywall UI
- [x] CTA **fixo no rodapé** (layout coluna: scroll + barra sticky) — não some em desktop/tablet.
- [x] Wrappers full-height: `PaywallProvider`, `ContextualPaywallModal`, `Paywall`, `ConversionScreen`.
- [x] Merge com polish da main remota (checkout **após PIN parental**, visual floresta/glass do `5ef87bb`).
- [x] Removido texto **“Famílias no movimento Menos Tela”**.

### 3. Remoção do trial de 7 dias grátis
- [x] `create-checkout`: **sem** `trial_period_days` / `trialEligible`.
- [x] Paywall CTA: **“Assinar agora”** / “Criar conta e assinar”.
- [x] Sub: **“Pagamento seguro · Cancele quando quiser”**.
- [x] Landing + Success: copy sem “7 dias grátis” de trial.
- [x] Mantido: status Stripe `trialing` (assinantes legados); desconto anual “2 meses grátis”; limites free do app.

---

## Deploy PENDENTE (obrigatório para valer em prod)

Edge functions **só mudam após deploy** no Supabase do projeto:

```bash
supabase functions deploy check-subscription
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout
```

| Function | Por quê |
|----------|---------|
| `check-subscription` | Revoga stale; anti-fraude |
| `stripe-webhook` | Status → free; produto mapeado |
| `create-checkout` | **Sem trial de 7 dias** |

Sem deploy: app client pode mudar textos, mas Stripe/edge antigo ainda cria trial e pode não revogar stale.

Lovable: **Sync main + Publish** do site.

---

## Arquivos-chave tocados (sessão 31/07)

```
supabase/functions/check-subscription/index.ts
supabase/functions/stripe-webhook/index.ts
supabase/functions/create-checkout/index.ts
src/contexts/AuthContext.tsx
src/lib/subscriptionAccess.ts
src/test/subscriptionAccess.test.ts
src/components/paywall/PaywallScreen.tsx
src/components/paywall/PaywallProvider.tsx
src/components/ContextualPaywallModal.tsx
src/components/Paywall.tsx
src/components/ConversionScreen.tsx
src/pages/Landing.tsx
src/pages/Success.tsx
```

---

## Como o pagamento funciona (estado atual no código)

```
Paywall → PIN parental → create-checkout (sem trial)
  → Stripe Checkout (price kidzz/premium × mensal/anual)
  → webhook: subscriptions + profiles.is_premium
  → check-subscription: autoridade se Stripe OK
  → useEntitlement / get_effective_plan → áreas
  → Auth profile.is_premium (boolean) em telas legadas
```

**Planos:**
- `kidzz` — base pago
- `premium` — completo
- free — limites diários

**Revogação:**
- Webhook `subscription.deleted` / refund total / dispute → free
- `check-subscription` sem sub ativa mapeada → free (mesmo se DB stale)
- Auth **não** reabre free→premium só porque o DB diz premium

---

## Aberto / riscos

| Item | Notas |
|------|--------|
| Deploy das 3 edge functions | **Fazer** |
| Lovable sync + publish | Manual |
| Teste real cartão / cancelamento | Ainda vale validar em staging |
| Telas com só `is_premium` | Não diferenciam kidzz vs premium (pré-existente) |
| Outage Stripe | Degradação mantém flag DB (UX); RLS impede self-write de `is_premium` |
| Worktree SSD | Pode estar atrás da main; preferir `/Users/alefsantos/dev/kidzzapp` |

---

## Prompt útil se a Lovable precisar reaplicar (trial)

Já aplicado na main. Se o preview Lovable ainda mostrar “7 dias grátis”:

1. Sync da branch `main` do GitHub.
2. Redeploy `create-checkout`.
3. Buscar no repo: `7 dias grátis`, `trial_period`, `Começar 7`, `trialEligible`.
4. CTA: “Assinar agora” / “Criar conta e assinar”; sem trial no Stripe.

---

## Próxima sessão — ordem sugerida

1. Confirmar `origin/main` = `6aca4f3` (ou mais novo).
2. **Deploy** `check-subscription`, `stripe-webhook`, `create-checkout`.
3. Lovable: Sync main + Publish.
4. Teste: assinar (sem trial no Stripe) → cancelar → app vira free.
5. (Opcional) Unificar gates `is_premium` vs `useEntitlement` nas telas legadas.

---

## Não misturar com WIP local

Arquivos untracked / sujos **não** fazem parte deste handoff de entrega:

- `.env.local-backup-temp`, `.grok/`, `CHECKLIST-KIDZZ.txt`, zips em `public/`, `design-src/`, `output/`, etc.

Não commitar isso no freela.

---

*Gerado em 2026-07-31 — sessão billing/paywall robustez + remove trial.*
