-- Idempotência de webhooks do Stripe.
-- Guarda o id de cada evento já processado para evitar processar 2x (o Stripe
-- reenvia eventos em caso de timeout/erro). Escrita apenas pelo service_role
-- (a função stripe-webhook); o cliente não lê nem escreve.

create table if not exists public.stripe_processed_events (
  event_id   text primary key,
  type       text,
  created_at timestamptz not null default now()
);

alter table public.stripe_processed_events enable row level security;

-- Sem policies para authenticated/anon: apenas service_role (que ignora RLS)
-- pode ler/escrever. Isso impede qualquer acesso pelo cliente.
