// Generate 10 personalized weekly activities using Lovable AI Gateway.
// Called once per week per user from the Brincar > Atividades screen.
// Falls back to client-side curated pool if this function errors.

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

interface RequestBody {
  childName?: string;
  ageRange?: string;
  interests?: string[];
}

interface AIActivity {
  id: string;
  title: string;
  emoji: string;
  category: "movimento" | "criatividade" | "familia" | "desafio";
  description: string;
  xp: number;
}

const SYSTEM_PROMPT = `Você cria atividades curtas, lúdicas e seguras para crianças no app KIDZZ.
Sempre devolva exatamente 10 atividades, em português do Brasil, divididas igualmente entre as 4 categorias:
- movimento (correr, dançar, polichinelos)
- criatividade (desenhar, construir, inventar)
- familia (interagir com pais/irmãos)
- desafio (pequenas missões saudáveis)

Regras:
- títulos curtos (até 5 palavras)
- descrições curtas e diretas (1 frase, máx 90 caracteres)
- emoji único e relevante para cada uma
- xp entre 10 e 25
- 100% seguras e adequadas à idade fornecida
- evitar telas, internet ou tarefas perigosas
- linguagem alegre e simples`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require a valid Supabase JWT.
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false } }
  );
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const childName = (body.childName || "amigo").slice(0, 40);
    const ageRange = body.ageRange || "3-7";
    const interests = Array.isArray(body.interests) ? body.interests.slice(0, 6).join(", ") : "";

    const userPrompt = `Gere 10 atividades para uma criança chamada ${childName}, faixa etária ${ageRange}.
Interesses: ${interests || "variados"}.
Personalize quando fizer sentido.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_weekly_activities",
              description: "Devolve as 10 atividades semanais",
              parameters: {
                type: "object",
                properties: {
                  activities: {
                    type: "array",
                    minItems: 10,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string", maxLength: 40 },
                        emoji: { type: "string", maxLength: 4 },
                        category: {
                          type: "string",
                          enum: ["movimento", "criatividade", "familia", "desafio"],
                        },
                        description: { type: "string", maxLength: 100 },
                        xp: { type: "integer", minimum: 10, maximum: 25 },
                      },
                      required: ["id", "title", "emoji", "category", "description", "xp"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["activities"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_weekly_activities" } },
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "credits_exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await aiRes.text();
      console.error("AI gateway error:", status, text);
      return new Response(JSON.stringify({ error: "ai_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "no_tool_call" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments) as { activities: AIActivity[] };
    const activities = (parsed.activities || []).slice(0, 10).map((a, i) => ({
      ...a,
      id: a.id || `ai-${i}`,
    }));

    return new Response(JSON.stringify({ activities }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-activities error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
