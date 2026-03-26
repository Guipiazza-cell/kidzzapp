import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCT_TIERS: Record<string, string> = {
  "prod_UDg1BKoaDApx46": "premium",
  "prod_UDg2zSZBKNtI2i": "super_premium",
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Fetch active and trialing subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    const trialingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 10,
    });

    const allSubs = [...subscriptions.data, ...trialingSubs.data];

    if (allSubs.length === 0) {
      logStep("No active/trialing subscriptions");
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find highest tier
    let bestTier = "premium";
    let subscriptionEnd: string | null = null;

    for (const sub of allSubs) {
      // Get product ID from the subscription item
      const priceObj = sub.items.data[0]?.price;
      const productId = typeof priceObj?.product === "string"
        ? priceObj.product
        : (priceObj?.product as any)?.id ?? "";
      
      logStep("Checking subscription", { 
        subId: sub.id, 
        productId, 
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
        currentPeriodEndType: typeof sub.current_period_end,
      });

      const tier = PRODUCT_TIERS[productId] || "premium";
      if (tier === "super_premium") bestTier = "super_premium";

      // Parse subscription end date
      try {
        const rawEnd = sub.current_period_end;
        if (rawEnd) {
          const timestamp = typeof rawEnd === "number" ? rawEnd : Number(rawEnd);
          if (!isNaN(timestamp) && timestamp > 0) {
            const end = new Date(timestamp * 1000).toISOString();
            if (!subscriptionEnd || end > subscriptionEnd) subscriptionEnd = end;
          }
        }
      } catch (e) {
        logStep("Date conversion error, skipping", { current_period_end: sub.current_period_end });
      }
    }

    logStep("Subscription found", { bestTier, subscriptionEnd });

    // Sync premium status and reset questions_used to 0 for premium users
    await supabaseClient
      .from("profiles")
      .update({ is_premium: true, questions_used: 0 })
      .eq("id", user.id);

    return new Response(JSON.stringify({
      subscribed: true,
      tier: bestTier,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("check-subscription error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
