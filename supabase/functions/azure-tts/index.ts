import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Escape XML special chars to keep SSML valid even when text contains &, <, >, etc.
const escapeXml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Allowlist of accepted Azure neural voices (extend as needed).
const VOICE_ALLOWLIST = new Set([
  "pt-BR-FranciscaNeural",
  "pt-BR-AntonioNeural",
  "pt-BR-BrendaNeural",
  "pt-BR-ElzaNeural",
  "pt-BR-FabioNeural",
  "pt-BR-GiovannaNeural",
  "pt-BR-HumbertoNeural",
  "pt-BR-JulioNeural",
  "pt-BR-LeilaNeural",
  "pt-BR-LeticiaNeural",
  "pt-BR-ManuelaNeural",
  "pt-BR-NicolauNeural",
  "pt-BR-ValerioNeural",
  "pt-BR-YaraNeural",
]);

// Numeric or signed-percent values only — blocks SSML injection.
const PROSODY_RE = /^[+-]?\d+(\.\d+)?%?$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require a valid Supabase JWT.
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const rawText = typeof body?.text === "string" ? body.text : "";
    const rawVoice = typeof body?.voice === "string" ? body.voice : "pt-BR-FranciscaNeural";
    const rawRate = typeof body?.rate === "string" ? body.rate : "0.9";
    const rawPitch = typeof body?.pitch === "string" ? body.pitch : "+5%";

    if (!rawText.trim()) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (rawText.length > 5000) {
      return new Response(JSON.stringify({ error: "text exceeds 5000 chars" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const voice = VOICE_ALLOWLIST.has(rawVoice) ? rawVoice : "pt-BR-FranciscaNeural";
    const rate = PROSODY_RE.test(rawRate) ? rawRate : "0.9";
    const pitch = PROSODY_RE.test(rawPitch) ? rawPitch : "+5%";

    const AZURE_KEY = Deno.env.get("AZURE_SPEECH_KEY");
    const AZURE_REGION = Deno.env.get("AZURE_SPEECH_REGION") || "eastus";

    if (!AZURE_KEY) {
      return new Response(JSON.stringify({ error: "AZURE_SPEECH_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeText = escapeXml(rawText);
    const safeVoice = escapeXml(voice);
    const safeRate = escapeXml(rate);
    const safePitch = escapeXml(pitch);
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="${safeVoice}"><prosody rate="${safeRate}" pitch="${safePitch}">${safeText}</prosody></voice></speak>`;

    const response = await fetch(
      `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "kidzzapp",
        },
        body: ssml,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Azure TTS error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: `Azure TTS failed (${response.status})` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);

    return new Response(JSON.stringify({ audioContent: audioBase64 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("azure-tts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
