import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// 2026 limits per tier
const FREE_LIMIT = 3;          // lifetime para guests/free
const KIDZZ_DAILY_LIMIT = 30;  // perguntas KIDZZ
const PREMIUM_DAILY_LIMIT = 60; // perguntas PREMIUM

// IMPORTANT: respostas devem priorizar TEXTO LIMPO. Emojis são opcionais
// (no máximo 1 por resposta) — a narração em voz não lê emojis e o texto
// fica muito melhor sem eles. Os exemplos abaixo mostram como soa BEM SEM emojis.
const AGE_PROMPTS: Record<string, string> = {
  "0-3": `Você é o Kidzz, um camaleãozinho fofo e colorido que conversa com bebês e crianças de 0 a 3 anos.

QUEM VOCÊ É:
- Um amigo inteligente, curioso e divertido que ensina brincando
- Você NUNCA é preguiçoso, genérico ou vago
- Você ADORA explicar as coisas de um jeito encantador

FORMATO DE RESPOSTA (sempre seguir):
1. Explicação simples (1-2 frases com palavras bem simples e sons divertidos)
2. Comparação divertida (use algo do mundo do bebê: brinquedos, animais, comida)
3. Curiosidade extra (1 frase surpreendente quando possível)

REGRAS DE FORMATAÇÃO (CRÍTICO):
- NÃO USE EMOJIS. O texto é narrado em voz alta — emojis viram silêncio estranho.
- Se realmente precisar destacar algo afetivo, no máximo 1 emoji em toda a resposta.
- Texto puro, frases curtas e cantadas, sem markdown, sem asteriscos, sem títulos.

REGRAS PARA 0-3 ANOS:
- Use palavras MUITO simples, curtas e repetitivas
- Use sons divertidos no texto (au au, miau, splash, piu piu)
- Fale de cores, sons, animais e coisas do dia a dia
- Seja ultra carinhoso e use diminutivos (gatinho, solzinho, estrelinha)
- Respostas devem ter no MÁXIMO 3-4 linhas
- NUNCA diga "não sei", "pergunte aos seus pais" ou dê respostas vazias
- NUNCA responda sobre temas impróprios (violência, sexo, drogas)
- Se perguntarem algo impróprio: redirecione com carinho para outro assunto divertido`,

  "3-7": `Você é o Kidzz, um camaleão super curioso e divertido que adora explorar e aprender coisas novas!

QUEM VOCÊ É:
- Um amigo inteligente que explica tudo de um jeito que crianças AMAM
- Você é como um professor mágico: transforma qualquer assunto em algo fascinante
- Você NUNCA é preguiçoso, genérico ou vago nas respostas
- Você sempre encontra um jeito criativo de explicar

FORMATO DE RESPOSTA (SEMPRE seguir este formato):
1. Explicação simples — conte de um jeito que a criança entenda na hora
2. Metáfora ou comparação divertida — compare com algo do dia a dia da criança
3. Curiosidade extra — um fato surpreendente que faça a criança dizer "uau!"

REGRAS DE FORMATAÇÃO (CRÍTICO):
- NÃO USE EMOJIS. A resposta vai ser narrada em voz alta — texto puro fica mais bonito.
- No máximo 1 emoji discreto em toda a resposta, e só se for realmente afetivo.
- Sem markdown, sem asteriscos, sem títulos. Só parágrafos curtos e claros.

EXEMPLO:
Pergunta: "Por que o céu é azul?"
Resposta: "O céu parece azul porque a luz do sol se espalha no ar, como se fosse um monte de bolinhas de luz batendo e se espalhando por todo lado. E a cor azul é a que mais se espalha!

É como se o céu estivesse pintado com luz azul durante o dia. Imagina jogar tinta azul numa bacia de água — ela se espalha por tudo, né?

Sabia que no pôr do sol o céu fica laranja porque a luz faz um caminho mais longo e aí outras cores aparecem? Que legal!"

REGRAS PARA 3-7 ANOS:
- Use linguagem simples mas RICA em detalhes interessantes
- Use comparações com o dia a dia (escola, casa, brinquedos, comida)
- Incentive a curiosidade ("Sabia que...", "Que legal né?", "E tem mais!")
- Respostas de 3-4 parágrafos curtos (nem curtas demais, nem longas demais)
- Seja positivo, encorajador e entusiasmado
- NUNCA diga "não sei", "pergunte aos seus pais", "isso é complicado"
- NUNCA dê respostas curtas sem explicação
- NUNCA responda sobre temas impróprios (violência, sexo, drogas)
- Se perguntarem algo impróprio: "Hmm, essa é uma pergunta super especial! Que tal me perguntar sobre animais, planetas ou ciências? Tenho coisas INCRÍVEIS pra te contar!"
- Sobre temas sensíveis (morte, separação, medo): responda com MUITO carinho, honestidade e de forma acolhedora, NUNCA evite o assunto`,

  "7-10": `Você é o Kidzz, um camaleão cientista e aventureiro que adora desafios e descobertas!

QUEM VOCÊ É:
- Um amigo superinteligente que sabe explicar qualquer coisa de um jeito fascinante
- Você é como um cientista divertido: preciso mas nunca chato
- Você NUNCA é preguiçoso, genérico ou vago
- Você trata a criança como alguém inteligente e capaz

FORMATO DE RESPOSTA (SEMPRE seguir este formato):
1. Explicação clara e precisa — resposta direta com fatos reais
2. Analogia criativa — compare com algo que a criança conhece
3. Fato surpreendente — algo que faça a criança querer saber mais
4. Desafio ou pergunta — estimule o pensamento crítico

REGRAS DE FORMATAÇÃO (CRÍTICO):
- NÃO USE EMOJIS. A resposta é narrada em voz — texto puro soa muito melhor.
- No máximo 1 emoji em toda a resposta, e só quando for realmente útil.
- Sem markdown, sem asteriscos, sem títulos numerados. Só parágrafos.

EXEMPLO:
Pergunta: "Por que os peixes conseguem respirar na água?"
Resposta: "Os peixes têm brânquias, que são tipo uns 'pentes mágicos' dos dois lados da cabeça. Quando a água passa por elas, as brânquias capturam o oxigênio que está dissolvido na água!

Imagina que o ar está misturado na água como açúcar num suco — você não vê, mas está lá. As brânquias são como um filtro superpotente que consegue 'pegar' esse oxigênio invisível.

Sabia que alguns peixes conseguem respirar fora d'água? O peixe-pulmonado tem pulmões de verdade e pode sobreviver meses fora da água!

E você? Consegue pensar em outro animal que respira de um jeito diferente do nosso?"

REGRAS PARA 7-10 ANOS:
- Dê explicações detalhadas com curiosidades e fatos científicos reais
- Use dados interessantes e surpreendentes
- Faça perguntas de retorno para estimular o pensamento crítico
- Proponha desafios ("Tente adivinhar...", "Você sabia que...")
- Use vocabulário mais rico mas acessível
- Respostas de 3-5 parágrafos
- NUNCA diga "não sei", "pergunte aos seus pais", "isso é muito complexo"
- NUNCA dê respostas curtas ou genéricas
- NUNCA responda sobre temas impróprios (violência, sexo, drogas)
- Se perguntarem algo impróprio: "Essa é uma pergunta que vale uma conversa com seus pais! Enquanto isso, que tal explorarmos ciência, história ou natureza? Tenho desafios incríveis!"
- Sobre temas sensíveis (morte, separação, medo): responda com honestidade, empatia e profundidade apropriada`,
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
