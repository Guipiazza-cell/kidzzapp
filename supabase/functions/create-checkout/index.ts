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

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CREATE-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const htmlEscape = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const redirectHtml = (url: string) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${htmlEscape(url)}"><title>Abrindo checkout</title><script>window.location.replace(${JSON.stringify(url)});</script></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;background:#fffcf8;color:#2a2a2a"><p style="font-size:16px;font-weight:700">Abrindo checkout seguro…</p></body></html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started", { method: req.method });
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key loaded", { prefix: stripeKey.slice(0, 7), accountHint: stripeKey.includes("live") ? "live" : "unknown" });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const contentType = req.headers.get("content-type") || "";
    const isFormRedirect = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");
    const body = isFormRedirect
      ? Object.fromEntries((await req.formData()).entries())
      : await req.json().catch(() => ({}));
    const authHeader = req.headers.get("Authorization") || "";
    const bodyToken = typeof body.access_token === "string" ? body.access_token : "";
    const token = (authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : bodyToken).trim();
    if (!token) throw new Error("Missing user token");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const plan = typeof body.plan === "string" ? body.plan : "premium";
    const refCode = typeof body.ref === "string" ? body.ref : null;
    const priceId = PRICES[plan];
    if (!priceId) throw new Error(`Invalid plan: ${plan}`);
    logStep("Request validated", { userId: user.id, email: user.email, plan, priceId, transport: isFormRedirect ? "form_redirect" : "json" });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // SECURITY: never trust the Origin header — validate against an allowlist to prevent open-redirect phishing.
    const ALLOWED_ORIGINS = new Set([
      "https://kidzzapp.lovable.app",
      "https://kidzz.app",
      "https://www.kidzz.app",
      "https://id-preview--19b9dd0d-e5a7-41d9-b197-d4ca9f5cdb0c.lovable.app",
      "https://19b9dd0d-e5a7-41d9-b197-d4ca9f5cdb0c.lovableproject.com",
      "http://localhost:8080",
      "http://localhost:5173",
    ]);
    const rawOrigin = req.headers.get("origin") || "";
    const requestedReturnOrigin = typeof body.return_origin === "string" ? body.return_origin : "";
    const origin = ALLOWED_ORIGINS.has(requestedReturnOrigin)
      ? requestedReturnOrigin
      : ALLOWED_ORIGINS.has(rawOrigin) ? rawOrigin : "https://kidzzapp.lovable.app";

    const metadata: Record<string, string> = { user_id: user.id, plan };
    if (refCode) metadata.ref = refCode;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?paywall=1`,
      metadata,
    });
    logStep("Stripe checkout session created", { sessionId: session.id, hasUrl: Boolean(session.url), customerId: customerId || "new", origin });

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

    if (!session.url) throw new Error("Stripe returned checkout session without URL");

    if (isFormRedirect) {
      logStep("Returning HTML same-tab redirect", { sessionId: session.id });
      return new Response(redirectHtml(session.url), {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
        status: 200,
      });
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
