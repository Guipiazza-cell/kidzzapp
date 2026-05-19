import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// 2026 limits: Free 1/dia · Kidzz 3/dia · Premium 5/dia
const FREE_STORY_LIMIT = 1;
const KIDZZ_DAILY_STORY_LIMIT = 3;
const PREMIUM_DAILY_STORY_LIMIT = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require a valid Supabase JWT; derive userId from the verified token only.
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
    const userId = userData.user.id;

    const { childName, childAvatar, age, interests, ageRange } = await req.json();

    if (!childName || !age || !interests) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side quota validation (defense in depth)
    {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("stories_used, is_premium, premium_source, last_usage_date, tier")
        .eq("id", userId)
        .single();

      if (profile) {
        const today = new Date().toISOString().slice(0, 10);
        let storiesUsed = profile.stories_used ?? 0;
        const isPremium = !!profile.is_premium;
        const tier = (profile.tier as string) || (isPremium ? "kidzz" : "free");
        const limit =
          tier === "premium" ? PREMIUM_DAILY_STORY_LIMIT
            : tier === "kidzz" ? KIDZZ_DAILY_STORY_LIMIT
            : FREE_STORY_LIMIT;

        if (isPremium && profile.last_usage_date !== today) {
          storiesUsed = 0;
        }

        if (storiesUsed >= limit) {
          return new Response(
            JSON.stringify({
              error: "LIMIT_REACHED",
              message: isPremium
                ? "Limite diário de histórias atingido. Volte amanhã!"
                : "Você já usou sua história gratuita de hoje. Assine para criar mais histórias!",
            }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabaseAdmin
          .from("profiles")
          .update({ stories_used: storiesUsed + 1, last_usage_date: today })
          .eq("id", userId);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ageGuidelines =
      age <= 3
        ? "Frases muito curtas (5-8 palavras), vocabulário básico, repetições rítmicas, sons suaves."
        : age <= 7
        ? "Frases simples (8-12 palavras), vocabulário do dia a dia, diálogos curtos e animados, humor simples."
        : "Frases variadas (12-18 palavras), vocabulário expandido, descrições detalhadas, diálogos com nuances emocionais.";

    const systemPrompt = `Você é um autor best-seller de literatura infantil. Crie histórias que encantam crianças e adultos.

CALIBRAÇÃO PARA ${age} ANOS:
${ageGuidelines}

TÉCNICAS:
- Engajamento com perguntas retóricas
- Imersão sensorial com cores e sons
- Valores universais (amizade, coragem, empatia) de forma orgânica
- Diálogos vivos com personalidade
- Estrutura: Introdução → Desenvolvimento → Clímax → Desfecho`;

    const avatarDesc = childAvatar
      ? `com tom de pele ${childAvatar.skinTone}, cabelo ${childAvatar.hairColor}, olhos ${childAvatar.eyeColor}, vestindo ${childAvatar.clothingStyle}`
      : "";

    const userPrompt = `Crie uma história INESQUECÍVEL para ${childName} (${age} anos, ${avatarDesc}) que adora ${interests}!

O camaleão Kidzz é o amigo mágico da história.

ESTRUTURA - 4 CENAS:
[CENA 1] O ENCONTRO MÁGICO (3 parágrafos)
[CENA 2] O GRANDE DESAFIO (3 parágrafos)
[CENA 3] A SOLUÇÃO CRIATIVA (3 parágrafos)
[CENA 4] A CELEBRAÇÃO (3 parágrafos)

Marque cada cena com [CENA 1], [CENA 2], etc.
Use linguagem adequada para ${age} anos.
Incorpore ${interests} na trama.`;

    // Generate story text
    const storyResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 8192,
      }),
    });

    if (!storyResp.ok) {
      const errText = await storyResp.text();
      console.error("AI story error:", storyResp.status, errText);
      if (storyResp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite excedido. Tente novamente mais tarde." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (storyResp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erro ao gerar história." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storyData = await storyResp.json();
    const story = storyData.choices[0].message.content;

    // Extract scenes for illustration
    const sceneParts = story.split(/\[CENA \d+\]/);
    const sceneSnippets: string[] = [];
    for (let i = 1; i <= 4; i++) {
      if (sceneParts[i]) {
        sceneSnippets.push(sceneParts[i].trim().slice(0, 400));
      }
    }

    // Fallback
    if (sceneSnippets.length < 4) {
      const clean = story.replace(/\[CENA \d+\]/g, "").trim();
      const chunk = Math.ceil(clean.length / 4);
      sceneSnippets.length = 0;
      for (let i = 0; i < 4; i++) {
        sceneSnippets.push(clean.slice(i * chunk, (i + 1) * chunk).trim().slice(0, 400));
      }
    }

    // Generate illustrations IN PARALLEL for speed
    const imagePromises = sceneSnippets.slice(0, 4).map(async (snippet, i) => {
      try {
        const imgPrompt = `Crie uma ilustração infantil estilo cartoon premium (Pixar/DreamWorks) para esta cena de livro infantil:

"${snippet}"

Personagens: ${childName} (${age} anos ${avatarDesc}) e um camaleão verde mágico chamado Kidzz.
Cenário relacionado a: ${interests}.
Estilo: cores vibrantes, iluminação cinematográfica, sem texto na imagem.`;

        const imgResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [{ role: "user", content: imgPrompt }],
            modalities: ["image", "text"],
          }),
        });

        if (imgResp.ok) {
          const imgData = await imgResp.json();
          const url = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (url) {
            console.log(`Image ${i + 1} generated`);
            return url;
          }
        } else {
          console.error(`Image ${i + 1} error:`, await imgResp.text());
        }
      } catch (e) {
        console.error(`Image ${i + 1} exception:`, e);
      }
      return null;
    });

    const imageResults = await Promise.all(imagePromises);
    const images = imageResults.filter((url): url is string => url !== null);

    return new Response(
      JSON.stringify({ story, images }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-story error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
