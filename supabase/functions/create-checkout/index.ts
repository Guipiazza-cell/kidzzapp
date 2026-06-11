import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// New 2026 catalog: 4 active prices (kidzz / premium × monthly / annual)
// Aliases keep backward compatibility with old keys (premium → kidzz, super_premium → premium)
const PRICES: Record<string, string> = {
  // New canonical keys
  kidzz: "price_1TUdKp8nR9x8D1BWZgsv3iAT",                 // R$19,90/mês
  kidzz_annual: "price_1ThDUR8nR9x8D1BWXc4JbuWM",          // R$199,90/ano (2 meses grátis)
  premium: "price_1TUdM98nR9x8D1BWTTxnuNRI",               // R$24,90/mês
  premium_annual: "price_1ThDVE8nR9x8D1BWpQdE3ZyM",        // R$249,90/ano (2 meses grátis)
  // Legacy aliases
  super_premium: "price_1TUdM98nR9x8D1BWTTxnuNRI",
  super_premium_annual: "price_1ThDVE8nR9x8D1BWpQdE3ZyM",
};

const PLAN_AMOUNTS: Record<string, number> = {
  kidzz: 19.90,
  kidzz_annual: 199.90,
  premium: 24.90,
  premium_annual: 249.90,
  super_premium: 24.90,
  super_premium_annual: 249.90,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const body = await req.json().catch(() => ({}));
    const plan = body.plan || "premium";
    const refCode = body.ref || null;
    const priceId = PRICES[plan];
    if (!priceId) throw new Error(`Invalid plan: ${plan}`);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://kidzzapp.lovable.app";

    const metadata: Record<string, string> = { user_id: user.id, plan };
    if (refCode) metadata.ref = refCode;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata,
    });

    if (refCode && session.id) {
      try {
        const { data: affiliate } = await supabaseAdmin
          .from("affiliates")
          .select("id, commission_rate")
          .eq("affiliate_code", refCode)
          .single();

        if (affiliate) {
          const amount = PLAN_AMOUNTS[plan] || 14.90;
          const commission = amount * (affiliate.commission_rate / 100);

          await supabaseAdmin.from("referrals").insert({
            affiliate_id: affiliate.id,
            referred_user_id: user.id,
            plan,
            amount_paid: amount,
            commission_amount: commission,
            status: "pending",
          });
          console.log(`Referral recorded: ${refCode} -> ${user.email}, commission: R$${commission.toFixed(2)}`);
        }
      } catch (e) {
        console.error("Referral tracking error (non-blocking):", e);
      }
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
