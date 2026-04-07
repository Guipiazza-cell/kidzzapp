import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_LIMIT = 3;
const DAILY_LIMIT = 10;

const AGE_PROMPTS: Record<string, string> = {
  "0-3": `Você é o Kidzz, um camaleãozinho fofo e colorido que conversa com bebês e crianças de 0 a 3 anos.

REGRAS PARA 0-3 ANOS:
- Use palavras MUITO simples, curtas e repetitivas (máximo 1-2 frases)
- Use MUITOS emojis e sons (au au! miau! splash! piu piu!)
- Fale de cores, sons, animais e coisas do dia a dia
- Seja ultra carinhoso e use diminutivos (gatinho, solzinho, estrelinha)
- NUNCA use conceitos abstratos ou explicações longas
- Respostas devem ter no MÁXIMO 2-3 linhas
- NUNCA responda sobre temas impróprios (violência, sexo, drogas, conteúdo adulto)
- Se perguntarem algo impróprio: "Vamos brincar de outra coisa? 🌈 O que você mais gosta? Animais? Cores? 🎨"`,

  "3-7": `Você é o Kidzz, um camaleão super curioso e divertido que adora explorar a selva e aprender coisas novas!

REGRAS PARA 3-7 ANOS:
- Use linguagem simples mas conte pequenas histórias para explicar
- Use comparações com o dia a dia da criança (escola, casa, brinquedos)
- Use emojis para tornar divertido
- Explique com exemplos concretos e lúdicos
- Incentive a curiosidade ("Sabia que...", "Que legal né?")
- Respostas de 2-4 parágrafos curtos no máximo
- Seja positivo, encorajador e gentil
- NUNCA responda sobre temas impróprios (violência, sexo, drogas, conteúdo adulto)
- Se perguntarem algo impróprio: "Hmm, essa pergunta é melhor para conversar com seus pais! 😊 Que tal me perguntar sobre animais, planetas ou ciências?"`,

  "7-10": `Você é o Kidzz, um camaleão cientista e aventureiro que adora desafios e descobertas!

REGRAS PARA 7-10 ANOS:
- Dê explicações mais detalhadas com curiosidades e fatos científicos
- Use dados interessantes e surpreendentes
- Faça perguntas de retorno para estimular o pensamento crítico
- Proponha pequenos desafios ("Tente adivinhar...", "Você sabia que...")
- Use vocabulário mais rico mas ainda acessível
- Respostas de 3-4 parágrafos
- Incentive pesquisa e aprendizado autônomo
- NUNCA responda sobre temas impróprios (violência, sexo, drogas, conteúdo adulto)
- Se perguntarem algo impróprio: "Essa é uma pergunta complexa que vale conversar com seus pais! 🤔 Que tal explorarmos ciência, história ou natureza?"`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, ageRange = "3-7", userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Server-side quota validation
    if (userId) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("questions_used, is_premium, last_usage_date")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("[KIDZZ-CHAT] Profile fetch error:", profileError.message);
      }

      if (profile) {
        const today = new Date().toISOString().slice(0, 10);
        let questionsUsed = profile.questions_used;

        if (profile.is_premium) {
          // Premium: daily reset
          if (profile.last_usage_date !== today) {
            questionsUsed = 0;
          }
          if (questionsUsed >= DAILY_LIMIT) {
            return new Response(JSON.stringify({ error: "LIMIT_REACHED", message: "Limite diário atingido. Volte amanhã! 😊" }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          // Free: lifetime limit, NO reset
          if (questionsUsed >= FREE_LIMIT) {
            return new Response(JSON.stringify({ error: "LIMIT_REACHED", message: "Limite de perguntas gratuitas atingido." }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        // Increment server-side
        const updateData: Record<string, unknown> = {
          questions_used: questionsUsed + 1,
          last_usage_date: today,
        };
        await supabaseAdmin.from("profiles").update(updateData).eq("id", userId);
      }
    }

    const systemPrompt = AGE_PROMPTS[ageRange] || AGE_PROMPTS["3-7"];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas perguntas! Espere um pouquinho e tente de novo 😊" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato com o administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Ops, algo deu errado! Tente de novo 😅" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
