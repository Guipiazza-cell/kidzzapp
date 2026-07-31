import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Quotas são validadas e incrementadas via RPC `increment_usage` (fonte única).

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
    // Require a valid Supabase JWT; derive userId from the verified token only.
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // User-scoped client (auth.uid() funciona dentro do RPC)
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

    const body = await req.json().catch(() => ({}));
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    const ageRange = typeof body?.ageRange === "string" ? body.ageRange : "3-7";
    const childName = typeof body?.childName === "string" ? body.childName : "";
    let criancaId =
      typeof body?.criancaId === "string" && body.criancaId.length > 10
        ? body.criancaId
        : null;

    // SECURITY: only accept user/assistant messages from client; cap count and content length.
    const safeMessages = rawMessages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20)
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Resolve criança se o cliente não mandou (schema com usage.crianca_id)
    if (!criancaId) {
      const { data: childRow } = await supabaseUser
        .from("criancas")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      criancaId = (childRow as any)?.id ?? null;
    }

    // Defesa em profundidade: incrementa via RPC (fonte única).
    // Compat: schema novo (tipo + crianca_id) e antigo (só tipo).
    {
      const attempts: Record<string, unknown>[] = [];
      if (criancaId) attempts.push({ _tipo: "perguntas", _crianca_id: criancaId });
      attempts.push({ _tipo: "perguntas", _crianca_id: null });
      attempts.push({ _tipo: "perguntas" });

      let quotaData: any = null;
      let lastErr: string | null = null;
      for (const args of attempts) {
        const r = await (supabaseUser as any).rpc("increment_usage", args);
        if (!r.error) {
          quotaData = r.data;
          lastErr = null;
          break;
        }
        lastErr = r.error?.message ?? "rpc error";
      }

      if (lastErr) {
        console.error("[KIDZZ-CHAT] increment_usage error:", lastErr);
        return new Response(JSON.stringify({
          error: "QUOTA_ERROR",
          message: "Não foi possível validar seu limite agora. Tente de novo em instantes.",
          detail: lastErr,
        }), {
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
            ? "Você atingiu o limite gratuito. Assine para continuar."
            : "Kidzz está sonolento. Volte amanhã!",
        }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const agePrompt = AGE_PROMPTS[ageRange] || AGE_PROMPTS["3-7"];
    const name = childName && childName.trim() ? childName.trim() : "amigo";
    const ageLabel = ageRange === "0-3" ? "0 a 3" : ageRange === "3-7" ? "3 a 7" : ageRange === "7-10" ? "7 a 10" : "3 a 7";
    const praisePrefix = `Eu sou o Kidzz, um companheiro mágico de crianças brasileiras.

TOM (marca do Kidzz, sempre):
- Extremamente gentil, acolhedor e encorajador. Nunca seco, nunca genérico.
- SEMPRE comece elogiando a pergunta de forma calorosa e personalizada usando o nome ${name}, variando o elogio a cada resposta. Exemplos: "Nossa, ${name}, que pergunta incrível, você é muito curioso!", "Uau, ${name}, só mentes brilhantes perguntam isso!", "Que pergunta fantástica, ${name}!"
- Termine sempre valorizando a criança e convidando a continuar explorando ou a contar a descoberta para alguém que ela ama.

CONTEÚDO:
- Responda de forma lúdica, imaginativa e MUITO completa, com informação correta e profunda, adaptada para uma criança de ${ageLabel} anos.
- Explique o "porquê" por trás da resposta, use uma metáfora do dia a dia da criança e traga pelo menos uma curiosidade surpreendente de verdade.
- Termine com um pequeno desafio ou convite para observar algo no mundo real.
- Entre 180 e 280 palavras (para 0 a 3 anos, entre 60 e 100 palavras, com frases bem curtas).

FORMATAÇÃO (CRÍTICO):
- NÃO use emojis em hipótese alguma. O texto é narrado em voz alta.
- Não use markdown, asteriscos, títulos, listas com marcadores nem travessões. Apenas parágrafos curtos em texto puro.

`;

    const systemPrompt = praisePrefix + agePrompt;

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
          ...safeMessages,
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
