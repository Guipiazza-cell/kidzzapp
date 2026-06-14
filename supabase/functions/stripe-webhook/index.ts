// supabase/functions/stripe-webhook/index.ts
// Recebe eventos do Stripe e sincroniza a tabela `subscriptions` no Supabase.
// Esta é a ÚNICA fonte autorizada a escrever em `subscriptions`.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Mapeamento de PRODUTO Stripe → plano interno.
// Premium (R$24,90/249) e Kidzz (R$19,90/199).
const PRODUCT_TO_PLAN: Record<string, "kidzz" | "premium"> = {
  prod_UTaV3ceAAUThlX: "kidzz",
  prod_UTaW2oqm99hFrj: "kidzz",
  prod_UTaXRFmVOR4wia: "premium",
  prod_UTaXJcEbqCrQtO: "premium",
  prod_UDg1BKoaDApx46: "kidzz",
  prod_UKyyAWU5fNnNai: "kidzz",
  prod_UDg2zSZBKNtI2i: "premium",
  prod_UL7k8ZAZsn97rA: "premium",
  prod_UDfWnSBu8lW6rX: "kidzz",
  prod_UDfZw7XqUeSvb9: "premium",
};

const log = (step: string, details?: unknown) =>
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? " - " + JSON.stringify(details) : ""}`);

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

  // 1) Validar assinatura
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  if (!signature) return new Response("missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    log("signature verification failed", { err: String(err) });
    return new Response("invalid signature", { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Helper: resolve user_id pelo customer (via session metadata ou customer email)
  const resolveUserId = async (
    customerId: string | null,
    metaUserId?: string | null,
    customerEmail?: string | null
  ): Promise<string | null> => {
    if (metaUserId) return metaUserId;
    if (!customerId) return null;

    // Tenta achar pela linha existente
    const { data: existing } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (existing?.user_id) return existing.user_id;

    // Fallback: buscar email do customer e procurar usuário
    let email: string | null = customerEmail ?? null;
    if (!email) {
      try {
        const cust = await stripe.customers.retrieve(customerId);
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

  const planFromSubscription = (sub: Stripe.Subscription): "kidzz" | "premium" => {
    const item = sub.items.data[0];
    const product =
      typeof item?.price?.product === "string"
        ? item.price.product
        : (item?.price?.product as Stripe.Product | undefined)?.id;
    if (product && PRODUCT_TO_PLAN[product]) return PRODUCT_TO_PLAN[product];
    return "kidzz";
  };

  const periodEnd = (sub: Stripe.Subscription): string | null => {
    const raw = (sub as any).current_period_end;
    if (!raw) return null;
    const ts = typeof raw === "number" ? raw : Number(raw);
    if (!ts) return null;
    return new Date(ts * 1000).toISOString();
  };

  const upsertSub = async (
    userId: string,
    fields: Partial<{
      stripe_customer_id: string;
      stripe_subscription_id: string;
      plan: "free" | "kidzz" | "premium";
      status: string;
      current_period_end: string | null;
    }>
  ) => {
    await admin
      .from("subscriptions")
      .upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    // Espelho legado em profiles (não dependemos disso, mas mantemos coerente)
    if (fields.plan !== undefined) {
      const isPremium = fields.plan !== "free";
      await admin
        .from("profiles")
        .update({
          is_premium: isPremium,
          premium_source: isPremium ? "stripe" : null,
          tier: fields.plan,
          plan_end_date: fields.current_period_end ?? null,
        })
        .eq("id", userId);
    }
  };

  try {
    log("event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = (session.customer as string) ?? null;
        const subId = (session.subscription as string) ?? null;
        const metaUser = (session.metadata?.user_id as string) ?? null;
        const userId = await resolveUserId(customerId, metaUser, session.customer_email);
        if (!userId || !subId) { log("missing userId/subId", { userId, subId }); break; }

        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertSub(userId, {
          stripe_customer_id: customerId ?? undefined,
          stripe_subscription_id: subId,
          plan: planFromSubscription(sub),
          status: sub.status,
          current_period_end: periodEnd(sub),
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const userId = await resolveUserId(customerId);
        if (!userId) { log("no user for customer", { customerId }); break; }
        await upsertSub(userId, {
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          plan: planFromSubscription(sub),
          status: sub.status,
          current_period_end: periodEnd(sub),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const userId = await resolveUserId(customerId);
        if (!userId) break;
        await upsertSub(userId, {
          plan: "free",
          status: "canceled",
          current_period_end: periodEnd(sub),
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string | null;
        const customerId = invoice.customer as string;
        if (!subId) break;
        const userId = await resolveUserId(customerId);
        if (!userId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertSub(userId, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          plan: planFromSubscription(sub),
          status: "active",
          current_period_end: periodEnd(sub),
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string | null;
        const customerId = invoice.customer as string;
        const userId = await resolveUserId(customerId);
        if (!userId) break;
        await upsertSub(userId, {
          status: "past_due",
          stripe_subscription_id: subId ?? undefined,
        });
        break;
      }

      default:
        log("unhandled", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    log("ERROR", { err: String(err) });
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
