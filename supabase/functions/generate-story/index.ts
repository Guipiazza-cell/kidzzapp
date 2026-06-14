import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Quotas validadas/incrementadas via RPC `increment_usage` (fonte única).

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
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );
    const { data: userData, error: userErr } = await supabaseUser.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { childName, childAvatar, age, interests, ageRange } = await req.json();

    if (!childName || !age || !interests) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Defesa em profundidade: incrementa via RPC (fonte única).
    {
      const { data: quotaData, error: quotaErr } = await (supabaseUser as any).rpc(
        "increment_usage",
        { _tipo: "historias" }
      );
      if (quotaErr) {
        console.error("[GENERATE-STORY] increment_usage error:", quotaErr.message);
        return new Response(JSON.stringify({ error: "QUOTA_ERROR" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const row = Array.isArray(quotaData) ? quotaData[0] : quotaData;
      if (!row?.allowed) {
        const plan = row?.plan ?? "free";
        return new Response(JSON.stringify({
          error: "LIMIT_REACHED",
          plan,
          message: plan === "free"
            ? "Você já usou sua história gratuita de hoje. Assine para criar mais."
            : "Kidzz está sonolento. Volte amanhã!",
        }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
      age <= 5
        ? "4-5 anos: frases curtas, repetição gostosa (refrões), sons e onomatopeias (toc-toc, splash, zzz), vocabulário concreto, história curta (2-3 min)."
        : age <= 7
        ? "6-7 anos: frases um pouco maiores, humor e surpresa, 1-2 palavras novas no contexto, pequenas reviravoltas (3-4 min)."
        : "8-10 anos: enredo mais rico, sentimentos mais complexos, desafios reais mas seguros, lição sutil (4-6 min).";

    const systemPrompt = `Você é o Kidzz, um camaleão contador de histórias caloroso, mágico e sábio. Você escreve histórias para crianças brasileiras que encantam a criança E tocam o coração de quem lê junto. Toda história deve seguir estes princípios:

1. A CRIANÇA É A HEROÍNA: use o nome (${childName}) como protagonista que age, decide e supera — nunca espectadora. Incorpore o que se sabe dela (${age} anos, gosta de ${interests}) pra parecer feita só pra ela.

2. LINGUAGEM NA MEDIDA DA IDADE — ${ageGuidelines}

3. ARCO COMPLETO SEMPRE: abertura mágica que fisga em 1 frase → um desejo/probleminha com que a criança se identifica → jornada com 2-3 momentos onde ela age e cresce → clímax gentil onde supera usando uma qualidade boa → final reconfortante e feliz.

4. UM VALOR SEM SERMÃO: cada história planta UMA semente (coragem, empatia, amizade, gentileza, perseverança), mostrada pela AÇÃO, JAMAIS explicada como moral no fim.

5. ENCANTAMENTO SENSORIAL: cores, sons, texturas pra criança VER na cabeça; 1-2 elementos mágicos memoráveis; momentos lúdicos e divertidos.

6. TOM ACOLHEDOR E SEGURO: sem violência, medo real, vilões assustadores ou finais tristes. Conflitos leves e sempre resolvidos. A criança termina se sentindo segura, amada, feliz.

7. PRA LER EM VOZ ALTA: ritmo e musicalidade, frases que fluem faladas, ganchos de cumplicidade entre quem lê e a criança.

REGRA DE OURO: antes de entregar, imagine um pai/mãe lendo em voz alta pro filho dormir. Se não for encantadora, calorosa e fluida assim, reescreva.`;

    const avatarDesc = childAvatar
      ? `com tom de pele ${childAvatar.skinTone}, cabelo ${childAvatar.hairColor}, olhos ${childAvatar.eyeColor}, vestindo ${childAvatar.clothingStyle}`
      : "";

    const userPrompt = `Crie uma história INESQUECÍVEL para ${childName} (${age} anos${avatarDesc ? `, ${avatarDesc}` : ""}) que adora ${interests}.

Você (Kidzz, o camaleão amigo mágico) participa da história junto com ${childName}.

ESTRUTURA — divida em 4 cenas, marcadas com [CENA 1], [CENA 2], [CENA 3], [CENA 4]:
[CENA 1] — O ENCONTRO MÁGICO (abertura que fisga em 1 frase + apresentação do desejo/probleminha).
[CENA 2] — A JORNADA COMEÇA (${childName} age, descobre, escolhe).
[CENA 3] — O DESAFIO E A QUALIDADE BOA (${childName} usa coragem/empatia/etc para superar, sem sermão).
[CENA 4] — O FINAL ACONCHEGANTE (celebração quente, sensação de segurança e felicidade).

Varie cenários, personagens e enredos a cada história — não comece toda igual. Nunca explique a moral. Nunca termine de forma abrupta.`;

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
