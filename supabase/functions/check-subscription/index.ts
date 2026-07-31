import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tier mapping by Stripe product id.
// Produto NÃO mapeado → não concede acesso (anti-fraude).
const PRODUCT_TIERS: Record<string, "kidzz" | "premium"> = {
  // New (2026)
  "prod_UTaV3ceAAUThlX": "kidzz",            // KIDZZ Mensal R$19,90
  "prod_UTaW2oqm99hFrj": "kidzz",            // KIDZZ Anual R$199
  "prod_UgafeRPgM3wShx": "kidzz",            // KIDZZ Anual R$199,90
  "prod_UTaXRFmVOR4wia": "premium",          // KIDZZ Premium Mensal R$24,90
  "prod_UTaXJcEbqCrQtO": "premium",          // KIDZZ Premium Anual R$249
  "prod_UgagQHpcdShKz8": "premium",          // KIDZZ Premium Anual R$249,90
  // Legacy
  "prod_UDg1BKoaDApx46": "kidzz",
  "prod_UKyyAWU5fNnNai": "kidzz",
  "prod_UDg2zSZBKNtI2i": "premium",
  "prod_UL7k8ZAZsn97rA": "premium",
  "prod_UDfWnSBu8lW6rX": "kidzz",
  "prod_UDfZw7XqUeSvb9": "premium",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id, email: user.email });

    // STEP 1: DB
    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("is_premium, premium_source, plan_end_date, tier")
      .eq("id", user.id)
      .single();

    const dbIsPremium = profileData?.is_premium === true;
    const premiumSource = profileData?.premium_source as string | null;
    logStep("DB check", { dbIsPremium, premiumSource });

    // Manual: confia no DB + validade; nunca consulta Stripe para não rebaixar por engano
    if (dbIsPremium && premiumSource === "manual") {
      if (profileData?.plan_end_date) {
        const endDate = new Date(profileData.plan_end_date);
        if (endDate < new Date()) {
          logStep("Manual premium expired, removing");
          await supabaseClient.from("profiles").update({
            is_premium: false,
            premium_source: null,
            plan_end_date: null,
            tier: "free",
          }).eq("id", user.id);
          await supabaseClient.from("subscriptions").upsert({
            user_id: user.id,
            plan: "free",
            status: "expired",
            current_period_end: null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
          return json({
            subscribed: false, tier: "free", subscription_end: null, source: "expired",
          });
        }
      }
      logStep("Manual premium active");
      return json({
        subscribed: true, tier: "premium", subscription_end: profileData?.plan_end_date, source: "manual",
      });
    }

    // STEP 2: Stripe — autoridade para fonte stripe/unknown
    let stripeLookupOk = false;
    let bestTier: "kidzz" | "premium" | null = null;
    let subscriptionEnd: string | null = null;
    let customerId: string | null = null;
    let activeSubId: string | null = null;

    try {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      stripeLookupOk = true;

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found customer", { customerId });

        const [activeSubs, trialingSubs] = await Promise.all([
          stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 }),
          stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 10 }),
        ]);

        const allSubs = [...activeSubs.data, ...trialingSubs.data];

        for (const sub of allSubs) {
          const priceObj = sub.items.data[0]?.price;
          const productId = typeof priceObj?.product === "string"
            ? priceObj.product
            : (priceObj?.product as { id?: string } | undefined)?.id ?? "";

          const tier = PRODUCT_TIERS[productId];
          // Produto desconhecido: ignora (não concede acesso)
          if (!tier) {
            logStep("Unmapped product ignored", { productId, subId: sub.id });
            continue;
          }

          if (!bestTier || (tier === "premium" && bestTier === "kidzz")) {
            bestTier = tier;
          }
          if (!activeSubId) activeSubId = sub.id;

          try {
            const rawEnd = (sub as { current_period_end?: number }).current_period_end;
            if (rawEnd) {
              const timestamp = typeof rawEnd === "number" ? rawEnd : Number(rawEnd);
              if (!isNaN(timestamp) && timestamp > 0) {
                const end = new Date(timestamp * 1000).toISOString();
                if (!subscriptionEnd || end > subscriptionEnd) subscriptionEnd = end;
              }
            }
          } catch { /* skip */ }
        }
      } else {
        logStep("No Stripe customer found");
      }
    } catch (stripeError) {
      logStep("Stripe API error", {
        error: stripeError instanceof Error ? stripeError.message : String(stripeError),
      });
      stripeLookupOk = false;
    }

    // Stripe ativo com produto mapeado → concede e sincroniza DB
    if (stripeLookupOk && bestTier) {
      await supabaseClient.from("profiles").update({
        is_premium: true,
        premium_source: "stripe",
        plan_end_date: subscriptionEnd,
        tier: bestTier,
      }).eq("id", user.id);

      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: activeSubId,
        plan: bestTier,
        status: "active",
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      logStep("Stripe confirmed", { bestTier, subscriptionEnd });
      return json({
        subscribed: true, tier: bestTier, subscription_end: subscriptionEnd, source: "stripe",
      });
    }

    // Stripe consultado com sucesso e SEM sub active/trialing mapeada → REVOGAR
    // (corrige stale is_premium quando webhook falhou / cancelamento)
    if (stripeLookupOk) {
      if (dbIsPremium || premiumSource === "stripe") {
        logStep("Revoking stale premium — Stripe has no active mapped subscription", {
          dbIsPremium, premiumSource,
        });
        await supabaseClient.from("profiles").update({
          is_premium: false,
          premium_source: null,
          plan_end_date: null,
          tier: "free",
        }).eq("id", user.id);

        await supabaseClient.from("subscriptions").upsert({
          user_id: user.id,
          stripe_customer_id: customerId ?? undefined,
          plan: "free",
          status: "inactive",
          current_period_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }

      return json({
        subscribed: false, tier: "free", subscription_end: null, source: "none",
      });
    }

    // Stripe API falhou: degradação — não inventa acesso; mantém só o que o DB já tem
    // (anti-flash free em outage; anti-fraude de self-write está no RLS de profiles)
    if (dbIsPremium) {
      logStep("Degraded: Stripe down, keeping DB premium flag");
      const tier =
        profileData?.tier === "kidzz" || profileData?.tier === "premium"
          ? profileData.tier
          : "premium";
      return json({
        subscribed: true,
        tier,
        subscription_end: profileData?.plan_end_date ?? null,
        source: "degraded",
      });
    }

    logStep("User is free tier");
    return json({
      subscribed: false, tier: "free", subscription_end: null, source: "none",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("check-subscription error:", msg);
    return json({ error: msg }, 500);
  }
});
