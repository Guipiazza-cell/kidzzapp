// supabase/functions/stripe-webhook/index.ts
// Recebe eventos do Stripe e sincroniza a tabela `subscriptions` no Supabase.
// Esta é a ÚNICA fonte autorizada a escrever em `subscriptions`.
// NUNCA escreve em `profiles` — o trigger sync_profile_from_subscription cuida disso.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

type PlanName = "free" | "kidzz" | "premium";

// Mapa EXPLÍCITO de price → plano. Nunca deduzir plano por valor cobrado.
const PRICE_TO_PLAN: Record<string, Exclude<PlanName, "free">> = {
  price_1TUdKp8nR9x8D1BWZgsv3iAT: "kidzz",    // R$19,90/mês
  price_1ThDUR8nR9x8D1BWXc4JbuWM: "kidzz",    // R$199,90/ano
  price_1TUdM98nR9x8D1BWTTxnuNRI: "premium",  // R$24,90/mês
  price_1ThDVE8nR9x8D1BWpQdE3ZyM: "premium",  // R$249,90/ano
};

// Fallback por produto (assinaturas legadas com prices antigos).
const PRODUCT_TO_PLAN: Record<string, Exclude<PlanName, "free">> = {
  prod_UTaV3ceAAUThlX: "kidzz",
  prod_UTaW2oqm99hFrj: "kidzz",
  prod_UgafeRPgM3wShx: "kidzz",
  prod_UTaXRFmVOR4wia: "premium",
  prod_UTaXJcEbqCrQtO: "premium",
  prod_UgagQHpcdShKz8: "premium",
  prod_UDg1BKoaDApx46: "kidzz",
  prod_UKyyAWU5fNnNai: "kidzz",
  prod_UDg2zSZBKNtI2i: "premium",
  prod_UL7k8ZAZsn97rA: "premium",
  prod_UDfWnSBu8lW6rX: "kidzz",
  prod_UDfZw7XqUeSvb9: "premium",
};

/** Statuses que representam acesso pago (exigem current_period_end no futuro). */
const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

const log = (step: string, details?: unknown) =>
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? " - " + JSON.stringify(details) : ""}`);

/**
 * BUGFIX CRÍTICO (API 2026-02-25.clover):
 * `current_period_end` saiu do topo do objeto subscription e passou a viver
 * em `subscription.items.data[0].current_period_end`.
 */
const rawPeriodEnd = (sub: Stripe.Subscription): number | null => {
  const fromItem = (sub.items?.data?.[0] as any)?.current_period_end;
  const fromTop = (sub as any).current_period_end;
  const raw = fromItem ?? fromTop ?? null;
  const ts = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(ts) && ts > 0 ? ts : null;
};

const toIso = (ts: number | null): string | null =>
  ts ? new Date(ts * 1000).toISOString() : null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("missing secrets");
    return new Response("config", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  if (!signature) return new Response("missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (e) {
    log("invalid signature", { e: String(e) });
    return new Response("invalid signature", { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const ok = (extra: Record<string, unknown> = {}) =>
    new Response(JSON.stringify({ received: true, ...extra }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  /** Resolve user_id: metadata → client_reference_id → subscriptions → auth.users por e-mail. */
  const resolveUserId = async (opts: {
    metaUserId?: string | null;
    clientReferenceId?: string | null;
    customerId?: string | null;
    customerEmail?: string | null;
  }): Promise<string | null> => {
    if (opts.metaUserId) return opts.metaUserId;
    if (opts.clientReferenceId) return opts.clientReferenceId;

    if (opts.customerId) {
      const { data: existing } = await admin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", opts.customerId)
        .maybeSingle();
      if (existing?.user_id) return existing.user_id;
    }

    let email = opts.customerEmail ?? null;
    if (!email && opts.customerId) {
      try {
        const cust = await stripe.customers.retrieve(opts.customerId);
        if (cust && !("deleted" in cust && cust.deleted)) {
          email = (cust as Stripe.Customer).email ?? null;
        }
      } catch (e) {
        log("customer retrieve fail", { e: String(e) });
      }
    }
    if (!email) return null;

    const { data: list } = await admin.auth.admin.listUsers();
    const u = list?.users?.find((x) => x.email?.toLowerCase() === email!.toLowerCase());
    return u?.id ?? null;
  };

  const recordOrphan = async (customerId: string | null) => {
    try {
      await admin.from("stripe_orphan_events").insert({
        event_id: event.id,
        type: event.type,
        stripe_customer_id: customerId,
        payload: event.data.object as unknown as Record<string, unknown>,
      });
    } catch (e) {
      log("orphan insert fail", { e: String(e) });
    }
    log("ORPHAN EVENT — user não resolvido", { id: event.id, type: event.type, customerId });
  };

  const planFromSubscription = (sub: Stripe.Subscription): PlanName => {
    if (!PAID_STATUSES.has(sub.status)) return "free";
    const item = sub.items?.data?.[0];
    const priceId = item?.price?.id;
    if (priceId && PRICE_TO_PLAN[priceId]) return PRICE_TO_PLAN[priceId];
    const product =
      typeof item?.price?.product === "string"
        ? item.price.product
        : (item?.price?.product as Stripe.Product | undefined)?.id;
    if (product && PRODUCT_TO_PLAN[product]) return PRODUCT_TO_PLAN[product];
    log("price/product sem mapeamento — negando plano pago", { priceId, product, subId: sub.id });
    return "free";
  };

  /**
   * Grava SEMPRE o conjunto inteiro a partir da assinatura completa do Stripe.
   * Nunca grava status pago sem current_period_end.
   */
  const syncSubscription = async (userId: string, subInput: Stripe.Subscription | string) => {
    let sub =
      typeof subInput === "string"
        ? await stripe.subscriptions.retrieve(subInput)
        : subInput;

    let periodEndTs = rawPeriodEnd(sub);
    if (!periodEndTs) {
      // Retry: busca de novo na API antes de gravar.
      try {
        sub = await stripe.subscriptions.retrieve(sub.id);
        periodEndTs = rawPeriodEnd(sub);
      } catch (e) {
        log("re-retrieve fail", { e: String(e) });
      }
    }

    let status = sub.status as string;
    let plan = planFromSubscription(sub);

    if (PAID_STATUSES.has(status) && !periodEndTs) {
      console.error(
        `[STRIPE-WEBHOOK] current_period_end ausente para sub ${sub.id} (status ${status}). Gravando incomplete.`
      );
      status = "incomplete";
      plan = "free";
    }

    const row = {
      user_id: userId,
      stripe_customer_id: (sub.customer as string) ?? null,
      stripe_subscription_id: sub.id,
      plan,
      status,
      current_period_end: toIso(periodEndTs),
      trial_end: toIso((sub as any).trial_end ?? null),
      updated_at: new Date().toISOString(),
    };

    const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "user_id" });
    if (error) log("upsert error", { error: String(error.message ?? error) });
    else log("subscription synced", { userId, plan, status, end: row.current_period_end });
  };

  const subIdFromCharge = async (charge: Stripe.Charge): Promise<string | null> => {
    const invoiceId = (charge as any).invoice as string | null;
    if (!invoiceId) return null;
    try {
      const inv = await stripe.invoices.retrieve(invoiceId);
      const direct = (inv as any).subscription as string | null;
      if (direct) return direct;
      const line = (inv as any).lines?.data?.[0];
      return (line?.subscription as string | null) ?? line?.parent?.subscription_item_details?.subscription ?? null;
    } catch (e) {
      log("invoice retrieve fail", { e: String(e) });
      return null;
    }
  };

  /** Refund / disputa: acesso cai NA HORA (o dinheiro voltou). */
  const revokeNow = async (userId: string, subId: string | null, customerId: string | null, label: string) => {
    if (subId) {
      try { await stripe.subscriptions.cancel(subId); }
      catch (e) { log("cancel sub fail (segue)", { e: String(e) }); }
    }
    await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId ?? undefined,
        stripe_subscription_id: subId ?? undefined,
        plan: "free",
        status: "canceled",
        current_period_end: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    log("acesso revogado imediatamente", { userId, label });
  };

  try {
    log("event", { type: event.type, id: event.id });

    // Idempotência
    const { error: dupErr } = await admin
      .from("stripe_processed_events")
      .insert({ event_id: event.id, type: event.type });
    if (dupErr) {
      if ((dupErr as { code?: string }).code === "23505") {
        log("duplicate event ignored", { id: event.id });
        return ok({ duplicate: true });
      }
      log("idempotency insert error (continuing)", { id: event.id, err: String(dupErr) });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = (session.customer as string) ?? null;
        const subId = (session.subscription as string) ?? null;
        const userId = await resolveUserId({
          metaUserId: session.metadata?.user_id ?? null,
          clientReferenceId: session.client_reference_id ?? null,
          customerId,
          customerEmail: session.customer_email ?? session.customer_details?.email ?? null,
        });
        if (!userId) { await recordOrphan(customerId); break; }
        if (!subId) { log("session sem subscription", { id: session.id }); break; }
        await syncSubscription(userId, subId);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = (sub.customer as string) ?? null;
        const userId = await resolveUserId({
          metaUserId: (sub.metadata?.user_id as string) ?? null,
          customerId,
        });
        if (!userId) { await recordOrphan(customerId); break; }
        await syncSubscription(userId, sub);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = (invoice.customer as string) ?? null;
        const line = (invoice as any).lines?.data?.[0];
        const subId =
          ((invoice as any).subscription as string | null) ??
          (line?.subscription as string | null) ??
          (line?.parent?.subscription_item_details?.subscription as string | null) ??
          null;
        const userId = await resolveUserId({
          customerId,
          customerEmail: invoice.customer_email ?? null,
        });
        if (!userId) { await recordOrphan(customerId); break; }
        if (!subId) { log("invoice sem subscription", { id: invoice.id }); break; }
        // Sempre busca a assinatura completa e grava o conjunto inteiro.
        await syncSubscription(userId, subId);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (!charge.refunded) {
          log("refund parcial - mantém acesso", { charge: charge.id });
          break;
        }
        const customerId = (charge.customer as string) ?? null;
        const userId = await resolveUserId({
          customerId,
          customerEmail: charge.billing_details?.email ?? null,
        });
        if (!userId) { await recordOrphan(customerId); break; }
        await revokeNow(userId, await subIdFromCharge(charge), customerId, "refunded");
        break;
      }

      case "charge.dispute.created":
      case "charge.dispute.funds_withdrawn": {
        const dispute = event.data.object as Stripe.Dispute;
        let customerId: string | null = null;
        let subId: string | null = null;
        let email: string | null = null;
        try {
          const charge = await stripe.charges.retrieve(dispute.charge as string);
          customerId = (charge.customer as string) ?? null;
          email = charge.billing_details?.email ?? null;
          subId = await subIdFromCharge(charge);
        } catch (e) {
          log("dispute charge retrieve fail", { e: String(e) });
        }
        const userId = await resolveUserId({ customerId, customerEmail: email });
        if (!userId) { await recordOrphan(customerId); break; }
        await revokeNow(userId, subId, customerId, "disputed");
        break;
      }

      default:
        log("unhandled", { type: event.type });
    }

    return ok();
  } catch (err) {
    log("ERROR", { err: String(err) });
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
