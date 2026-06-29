# Stripe Webhook Sandbox Checklist

Use o Stripe CLI em modo sandbox e a URL da edge function `stripe-webhook`.

## Preparacao

- Configure `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` no ambiente da edge function.
- Confirme que `public.stripe_processed_events` existe no banco.
- Tenha um usuario de teste com linha em `public.subscriptions` ou metadata `user_id` no Checkout Session.

## Eventos

Rode um evento por vez:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
stripe trigger invoice.payment_succeeded
```

Estados esperados em `public.subscriptions`:

- `checkout.session.completed`: cria/atualiza `stripe_customer_id`, `stripe_subscription_id`, `plan`, `status` e `current_period_end`.
- `customer.subscription.updated`: preserva o status vindo do Stripe e atualiza plano/periodo.
- `customer.subscription.deleted`: muda `plan` para `free` e `status` para `canceled`.
- `invoice.payment_failed`: muda `status` para `past_due`.
- `invoice.payment_succeeded`: muda `status` para `active` e renova `current_period_end`.

## Idempotencia

- Reenvie o mesmo evento pelo dashboard/CLI do Stripe, ou use `stripe events resend <event_id>`.
- A primeira entrega deve inserir `event_id` em `public.stripe_processed_events`.
- A segunda entrega deve responder HTTP 200 com `duplicate: true`.
- `public.subscriptions.updated_at` nao deve mudar na segunda entrega do mesmo `event_id`.

## Consultas uteis

```sql
select * from public.stripe_processed_events order by created_at desc limit 20;
select user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at
from public.subscriptions
order by updated_at desc
limit 20;
```
