import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();

    if (!callerProfile?.is_admin) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "metrics") {
      // Get total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      // Get premium users
      const { count: premiumUsers } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_premium", true);

      // Get total questions asked (sum of questions_used)
      const { data: questionStats } = await supabase
        .from("profiles")
        .select("questions_used, stories_used");

      let totalQuestions = 0;
      let totalStories = 0;
      (questionStats || []).forEach((p: any) => {
        totalQuestions += p.questions_used || 0;
        totalStories += p.stories_used || 0;
      });

      // Get users active today
      const today = new Date().toISOString().slice(0, 10);
      const { count: activeToday } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("last_usage_date", today);

      // Get recent signups (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: recentSignups } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      return new Response(JSON.stringify({
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        totalQuestions,
        totalStories,
        activeToday: activeToday || 0,
        recentSignups: recentSignups || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search") {
      const { email } = body;
      if (!email) throw new Error("Email required");

      const { data: authUsers, error: listErr } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 20,
      });
      if (listErr) throw listErr;

      const matchingUsers = (authUsers?.users || []).filter(
        (u: any) => u.email?.toLowerCase().includes(email.toLowerCase())
      );

      const userIds = matchingUsers.map((u: any) => u.id);
      if (userIds.length === 0) {
        return new Response(JSON.stringify({ users: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, child_name, is_premium, premium_source, plan_end_date, created_at, points, streak_days, level, questions_used")
        .in("id", userIds);

      const users = (profiles || []).map((p: any) => {
        const authUser = matchingUsers.find((u: any) => u.id === p.id);
        return { ...p, email: authUser?.email };
      });

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "activate") {
      const { userId, planEndDate } = body;
      await supabase.from("profiles").update({
        is_premium: true,
        premium_source: "manual",
        plan_end_date: planEndDate || null,
      }).eq("id", userId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "deactivate") {
      const { userId } = body;
      await supabase.from("profiles").update({
        is_premium: false,
        premium_source: null,
        plan_end_date: null,
      }).eq("id", userId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "extend") {
      const { userId, planEndDate } = body;
      if (!planEndDate) throw new Error("planEndDate required");
      await supabase.from("profiles").update({
        plan_end_date: planEndDate,
      }).eq("id", userId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
