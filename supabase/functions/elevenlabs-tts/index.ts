import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_TEXT_LEN = 5000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Accept any Bearer token (anon key for guests OR user JWT).
    // SOS voice must work even when the user isn't logged in.
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const text = typeof body?.text === "string" ? body.text : "";
    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (text.length > MAX_TEXT_LEN) {
      return new Response(JSON.stringify({ error: `text exceeds ${MAX_TEXT_LEN} chars` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    /** Fallback premium: narração via Lovable AI (voz feminina suave, pt-BR). */
    const speakWithLovableAI = async (): Promise<Response> => {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "TTS_UNAVAILABLE", fallback: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini-tts",
          input: text,
          voice: "shimmer",
          response_format: "mp3",
          stream_format: "audio",
          instructions:
            "Fale em português do Brasil, com voz feminina calma, mansa e acolhedora, ritmo lento, como quem conta história para uma criança dormir.",
        }),
      });
      if (!aiRes.ok) {
        const errText = await aiRes.text().catch(() => "");
        console.error("Lovable AI TTS error:", aiRes.status, errText);
        return new Response(
          JSON.stringify({ error: "TTS_UNAVAILABLE", fallback: true, status: aiRes.status }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const buf = await aiRes.arrayBuffer();
      return new Response(JSON.stringify({ audioContent: base64Encode(buf), provider: "lovable-ai" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    };

    if (!ELEVENLABS_API_KEY) {
      return await speakWithLovableAI();
    }


    // Voz: aceita override via body.voiceId. Default = "Amanda Kelly"
    // (feminina, mansa e serena).
    const voiceId =
      typeof body?.voiceId === "string" && body.voiceId.trim()
        ? body.voiceId.trim()
        : "oi8rgjIfLgJRsQ6rbZh3";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          // Força a pronúncia em português do Brasil. Sem isso o modelo
          // multilíngue podia narrar com sotaque/idioma errado (inglês).
          language_code: "pt",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs error:", response.status, errText);
      // Return 200 with fallback flag so client gracefully degrades to Web Speech API
      // (avoids 500s spamming the console when free tier is disabled / quota exceeded)
      return new Response(
        JSON.stringify({ error: "TTS_UNAVAILABLE", fallback: true, status: response.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);

    return new Response(JSON.stringify({ audioContent: audioBase64 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("TTS error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
