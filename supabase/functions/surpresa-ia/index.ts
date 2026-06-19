// supabase/functions/surpresa-ia/index.ts
// Gera uma atividade personalizada com IA (Gemini via Lovable AI Gateway).
// - Lê o primeiro filho cadastrado em `criancas` (nome, idade, interesses, materiais_em_casa)
// - Pede ao modelo um JSON estruturado compatível com a tabela `activities`
// - Salva em `activities` com origem='ia' e retorna o registro
// - Modo `?mode=batch&count=N` (apenas admin) pré-gera N atividades temáticas pro banco
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CATEGORIAS = ["ciencia", "sensorial", "natureza", "arte", "movimento", "conversa", "cozinha"];
const ENERGIAS = ["agitada", "cansada", "curiosa"];

type Crianca = {
  nome: string;
  idade: number | null;
  interesses: string[] | null;
  materiais_em_casa: string[] | null;
};

function buildPrompt(c: Crianca | null, hint?: { categoria?: string; energia?: string }) {
  const nome = c?.nome?.trim() || "uma criança";
  const idade = c?.idade ? `${c.idade} anos` : "idade variada";
  const interesses = (c?.interesses ?? []).filter(Boolean);
  const materiais = (c?.materiais_em_casa ?? []).filter(Boolean);
  const interessesTxt = interesses.length ? `que ama ${interesses.join(", ")}` : "";
  const materiaisTxt = materiais.length ? `usando o que tem em casa (${materiais.join(", ")})` : "usando materiais simples e comuns em qualquer casa";

  const catHint = hint?.categoria ? `Categoria obrigatória: ${hint.categoria}.` : `Escolha UMA categoria entre: ${CATEGORIAS.join(", ")}.`;
  const energiaHint = hint?.energia ? `Energia obrigatória: ${hint.energia}.` : `Escolha UMA energia entre: ${ENERGIAS.join(", ")}.`;

  return `Crie UMA atividade de brincadeira sem tela, pra ${nome}, ${idade}, ${interessesTxt}, ${materiaisTxt}.

Regras:
- Linguagem afetiva, simples, brasileira, sem travessões (—), sem reticências longas.
- Materiais comuns em casa, nada caro ou difícil de achar.
- Passos curtos (4 a 6 itens), claros, em ordem.
- A "curiosidade" é uma frase curtinha que explica o "porquê" de forma encantadora.
- ${catHint}
- ${energiaHint}
- "duracao_min" entre 5 e 30. "tela_min" entre 15 e 45 (minutos longe da tela que a brincadeira rende).
- "tempo" é um rótulo amigável tipo "15 min".
- "contexto" é "Em casa", "Ao ar livre", "Antes de dormir" ou "Em qualquer lugar".
- Não use o nome da criança no título nem nos passos.

Responda APENAS com o JSON pedido, sem comentários ou texto fora dele.`;
}

const ACTIVITY_TOOL = {
  type: "function" as const,
  function: {
    name: "save_activity",
    description: "Salva uma atividade Kidzz Bora.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        emoji: { type: "string", description: "Um único emoji que representa a brincadeira." },
        titulo: { type: "string" },
        gancho: { type: "string", description: "Uma frase curta e encantadora." },
        categoria: { type: "string", enum: CATEGORIAS },
        energia: { type: "string", enum: ENERGIAS },
        tempo: { type: "string", description: "Rótulo amigável tipo 15 min." },
        duracao_min: { type: "integer", minimum: 5, maximum: 60 },
        contexto: { type: "string" },
        tela_min: { type: "integer", minimum: 10, maximum: 60 },
        materiais: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
        passos: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
        curiosidade: { type: "string" },
      },
      required: ["emoji", "titulo", "gancho", "categoria", "energia", "tempo", "duracao_min", "contexto", "tela_min", "materiais", "passos", "curiosidade"],
    },
  },
};

async function callGemini(prompt: string) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "Você é uma especialista em educação infantil e criatividade. Sempre responde chamando a tool save_activity, em português do Brasil." },
        { role: "user", content: prompt },
      ],
      tools: [ACTIVITY_TOOL],
      tool_choice: { type: "function", function: { name: "save_activity" } },
    }),
  });

  if (resp.status === 429) throw new Error("RATE_LIMIT");
  if (resp.status === 402) throw new Error("PAYMENT_REQUIRED");
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`gateway ${resp.status}: ${txt.slice(0, 200)}`);
  }
  const data = await resp.json();
  const call = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) throw new Error("resposta sem tool_call");
  return JSON.parse(call.function.arguments);
}

function sanitize(a: any) {
  const strip = (s: string) => String(s ?? "").replaceAll("—", ".").replaceAll(" - ", ". ").trim();
  return {
    emoji: String(a.emoji ?? "✨").slice(0, 4),
    titulo: strip(a.titulo).slice(0, 80),
    gancho: strip(a.gancho).slice(0, 180),
    categoria: CATEGORIAS.includes(a.categoria) ? a.categoria : "arte",
    energia: ENERGIAS.includes(a.energia) ? a.energia : "curiosa",
    tempo: strip(a.tempo).slice(0, 30) || "15 min",
    duracao_min: Math.min(60, Math.max(5, Number(a.duracao_min) || 15)),
    contexto: strip(a.contexto).slice(0, 40) || "Em casa",
    tela_min: Math.min(60, Math.max(10, Number(a.tela_min) || 25)),
    materiais: Array.isArray(a.materiais) ? a.materiais.map((s: any) => strip(s)).filter(Boolean).slice(0, 8) : [],
    passos: Array.isArray(a.passos) ? a.passos.map((s: any) => strip(s)).filter(Boolean).slice(0, 6) : [],
    curiosidade: strip(a.curiosidade).slice(0, 220),
    origem: "ia",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    const supabaseUser = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: userData } = await supabaseUser.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let body: any = {};
    try { body = await req.json(); } catch (_) {}

    const mode = url.searchParams.get("mode") || body.mode || "single";

    // ----- BATCH MODE (admin only) -----
    if (mode === "batch") {
      const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", { _user_id: user.id });
      if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const count = Math.min(20, Math.max(1, Number(body.count) || 7));
      const out: any[] = [];
      for (let i = 0; i < count; i++) {
        const categoria = CATEGORIAS[i % CATEGORIAS.length];
        const energia = ENERGIAS[i % ENERGIAS.length];
        const prompt = buildPrompt(null, { categoria, energia });
        const raw = await callGemini(prompt);
        const clean = sanitize({ ...raw, categoria, energia });
        const { data: inserted } = await supabaseAdmin.from("activities").insert(clean).select().single();
        if (inserted) out.push(inserted);
        await new Promise((r) => setTimeout(r, 400));
      }
      return new Response(JSON.stringify({ ok: true, inserted: out.length, activities: out }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ----- SINGLE MODE (default: "Surpresa") -----
    const { data: criancas } = await supabaseUser
      .from("criancas")
      .select("nome,idade,interesses,materiais_em_casa")
      .order("created_at", { ascending: true })
      .limit(1);

    const crianca = (criancas?.[0] as Crianca) || null;
    const prompt = buildPrompt(crianca, {
      categoria: body.categoria,
      energia: body.energia,
    });

    const raw = await callGemini(prompt);
    const clean = sanitize(raw);

    // salva no banco (origem='ia') pra reaproveitar
    const { data: saved, error: insertErr } = await supabaseAdmin
      .from("activities")
      .insert(clean)
      .select()
      .single();

    if (insertErr) {
      // Falha ao salvar não deve quebrar a UX — devolve a atividade gerada mesmo assim
      return new Response(JSON.stringify({ ok: true, activity: clean, saved: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, activity: saved, saved: true, personalized_for: crianca?.nome ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    const msg = String(err?.message || err);
    let status = 500;
    let body: Record<string, unknown> = { error: msg };
    if (msg === "RATE_LIMIT") { status = 429; body = { error: "Muitas surpresas seguidas. Respira e tenta de novo em alguns segundos." }; }
    else if (msg === "PAYMENT_REQUIRED") { status = 402; body = { error: "Créditos esgotados pra surpresa de IA. Adicione créditos pra continuar." }; }
    return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
