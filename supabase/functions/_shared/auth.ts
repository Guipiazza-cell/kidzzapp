// Shared auth helper for edge functions.
// Validates the Supabase JWT in the Authorization header and returns the user.
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

export interface AuthResult {
  userId: string;
  email?: string;
}

export async function requireUser(req: Request): Promise<AuthResult | { error: Response }> {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false } }
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { userId: data.user.id, email: data.user.email ?? undefined };
}
