import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childName, childAvatar, age, interests, ageRange } = await req.json();

    if (!childName || !age || !interests) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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

    // Generate illustrations
    const images: string[] = [];
    for (let i = 0; i < Math.min(4, sceneSnippets.length); i++) {
      try {
        const imgPrompt = `Crie uma ilustração infantil estilo cartoon premium (Pixar/DreamWorks) para esta cena de livro infantil:

"${sceneSnippets[i]}"

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
            model: "google/gemini-3-pro-image-preview",
            messages: [{ role: "user", content: imgPrompt }],
            modalities: ["image", "text"],
          }),
        });

        if (imgResp.ok) {
          const imgData = await imgResp.json();
          const url = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (url) {
            images.push(url);
            console.log(`Image ${i + 1} generated`);
          }
        } else {
          console.error(`Image ${i + 1} error:`, await imgResp.text());
        }
      } catch (e) {
        console.error(`Image ${i + 1} exception:`, e);
      }
    }

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
