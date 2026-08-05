import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabaseClient.rpc("get_effective_plan", { _user_id: user.id });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    const tier = row?.plan === "kidzz" || row?.plan === "premium" ? row.plan : "free";
    logStep("Effective plan read", { userId: user.id, tier, status: row?.status });
    return json({
      subscribed: tier !== "free",
      tier,
      status: row?.status ?? "inactive",
      in_grace: !!row?.in_grace,
      subscription_end: row?.current_period_end ?? null,
      source: "subscriptions",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("check-subscription error:", msg);
    return json({ error: msg }, 500);
  }
});
