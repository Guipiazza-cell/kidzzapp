import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tier mapping by Stripe product id.
// New 2026 catalog: kidzz → "kidzz" (3/day), premium → "premium" (5/day).
// Legacy products are mapped to keep historical subscribers from being downgraded.
const PRODUCT_TIERS: Record<string, string> = {
  // New (2026)
  "prod_UTaV3ceAAUThlX": "kidzz",            // KIDZZ Mensal R$19,90
  "prod_UTaW2oqm99hFrj": "kidzz",            // KIDZZ Anual R$199
  "prod_UgafeRPgM3wShx": "kidzz",            // KIDZZ Anual R$199,90
  "prod_UTaXRFmVOR4wia": "premium",          // KIDZZ Premium Mensal R$24,90
  "prod_UTaXJcEbqCrQtO": "premium",          // KIDZZ Premium Anual R$249
  "prod_UgagQHpcdShKz8": "premium",          // KIDZZ Premium Anual R$249,90
  // Legacy (renamed: old premium → kidzz, old super_premium → premium)
  "prod_UDg1BKoaDApx46": "kidzz",
  "prod_UKyyAWU5fNnNai": "kidzz",
  "prod_UDg2zSZBKNtI2i": "premium",
  "prod_UL7k8ZAZsn97rA": "premium",
  "prod_UDfWnSBu8lW6rX": "kidzz",
  "prod_UDfZw7XqUeSvb9": "premium",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

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

    // STEP 1: Check DB
    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("is_premium, premium_source, plan_end_date")
      .eq("id", user.id)
      .single();

    const dbIsPremium = profileData?.is_premium === true;
    const premiumSource = profileData?.premium_source;
    logStep("DB check", { dbIsPremium, premiumSource });

    // Manual users: trust DB entirely, skip Stripe
    if (dbIsPremium && premiumSource === "manual") {
      // Check expiration
      if (profileData?.plan_end_date) {
        const endDate = new Date(profileData.plan_end_date);
        if (endDate < new Date()) {
          logStep("Manual premium expired, removing");
          await supabaseClient.from("profiles").update({
            is_premium: false,
            premium_source: null,
            plan_end_date: null,
          }).eq("id", user.id);
          return new Response(JSON.stringify({
            subscribed: false, tier: "free", subscription_end: null, source: "expired",
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      logStep("Manual premium active");
      return new Response(JSON.stringify({
        subscribed: true, tier: "premium", subscription_end: profileData?.plan_end_date, source: "manual",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // STEP 2: Stripe validation (only for stripe or unknown source)
    let stripeSubscribed = false;
    let bestTier = "free";
    let subscriptionEnd: string | null = null;

    try {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });

      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        logStep("Found customer", { customerId });

        const [activeSubs, trialingSubs] = await Promise.all([
          stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 }),
          stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 10 }),
        ]);

        const allSubs = [...activeSubs.data, ...trialingSubs.data];

        if (allSubs.length > 0) {
          stripeSubscribed = true;
          bestTier = "kidzz";

          for (const sub of allSubs) {
            const priceObj = sub.items.data[0]?.price;
            const productId = typeof priceObj?.product === "string"
              ? priceObj.product
              : (priceObj?.product as any)?.id ?? "";

            const tier = PRODUCT_TIERS[productId] || "kidzz";
            // premium > kidzz
            if (tier === "premium") bestTier = "premium";

            try {
              const rawEnd = sub.current_period_end;
              if (rawEnd) {
                const timestamp = typeof rawEnd === "number" ? rawEnd : Number(rawEnd);
                if (!isNaN(timestamp) && timestamp > 0) {
                  const end = new Date(timestamp * 1000).toISOString();
                  if (!subscriptionEnd || end > subscriptionEnd) subscriptionEnd = end;
                }
              }
            } catch { /* skip */ }
          }

          // Sync to DB (incl. tier)
          await supabaseClient.from("profiles").update({
            is_premium: true,
            premium_source: "stripe",
            plan_end_date: subscriptionEnd,
            tier: bestTier,
          }).eq("id", user.id);

          // CRITICAL: sync the `subscriptions` table — useEntitlement / get_effective_plan reads from here.
          // Without this row, kidzz/premium users fall back to "free" in the entitlement system.
          await supabaseClient.from("subscriptions").upsert({
            user_id: user.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: allSubs[0]?.id ?? null,
            plan: bestTier,
            status: "active",
            current_period_end: subscriptionEnd,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        }
      } else {
        logStep("No Stripe customer found");
      }
    } catch (stripeError) {
      logStep("Stripe API error, falling back to DB", {
        error: stripeError instanceof Error ? stripeError.message : String(stripeError),
      });
    }

    // STEP 3: DB fallback — never downgrade a paying user
    if (!stripeSubscribed && dbIsPremium) {
      logStep("DB override: user is premium via database flag");
      return new Response(JSON.stringify({
        subscribed: true, tier: "premium", subscription_end: profileData?.plan_end_date, source: "database",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (stripeSubscribed) {
      logStep("Stripe confirmed", { bestTier, subscriptionEnd });
      return new Response(JSON.stringify({
        subscribed: true, tier: bestTier, subscription_end: subscriptionEnd, source: "stripe",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    logStep("User is free tier");
    return new Response(JSON.stringify({
      subscribed: false, tier: "free", subscription_end: null, source: "none",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("check-subscription error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
