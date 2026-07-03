/**
 * elevenTTS — Fonte ÚNICA da narração premium via ElevenLabs (voz Amanda Kelly).
 *
 * Toda a narração do app passa por aqui: limpa o texto, quebra em pedaços
 * dentro do limite do edge, chama `elevenlabs-tts` e devolve data URIs de áudio.
 *
 * - Cache em memória por trecho → replays não recobram crédito.
 * - Se a ElevenLabs falhar (sem crédito, offline, quota), lança erro para o
 *   chamador cair no fallback Web Speech (voz do navegador).
 */
import { supabase } from "@/integrations/supabase/client";
import { ELEVEN_FEMALE_VOICE_ID } from "@/lib/ttsVoice";

/** Limite do edge é 5000; usamos folga para não estourar. */
const MAX_CHUNK = 4500;

/** text (trecho) -> data URI mp3. Compartilhado por todo o app. */
const audioCache = new Map<string, string>();

/** Remove markdown e emojis para uma narração limpa. */
export const cleanNarrationText = (text: string): string =>
  text
    .replace(/[*_~`#>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[‍️⃣]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

/** Quebra o texto em pedaços <= MAX_CHUNK, respeitando fim de frase. */
export const chunkText = (text: string, max = MAX_CHUNK): string[] => {
  if (text.length <= max) return text ? [text] : [];
  const sentences = text.split(/(?<=[.!?…])\s+/);
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + " " + s).trim().length > max) {
      if (cur) chunks.push(cur.trim());
      // Frase única maior que o limite: corta na força.
      if (s.length > max) {
        for (let i = 0; i < s.length; i += max) chunks.push(s.slice(i, i + max));
        cur = "";
      } else {
        cur = s;
      }
    } else {
      cur = cur ? `${cur} ${s}` : s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
};

/**
 * Gera o áudio de UM trecho via ElevenLabs. Usa cache. Lança em qualquer falha
 * (o chamador decide o fallback).
 */
export const fetchElevenChunk = async (chunk: string): Promise<string> => {
  const cached = audioCache.get(chunk);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
    body: { text: chunk, voiceId: ELEVEN_FEMALE_VOICE_ID },
  });
  if (error) throw error;
  // Edge devolve `fallback:true` quando a ElevenLabs está indisponível.
  if ((data as any)?.fallback) throw new Error("eleven_fallback");
  const audioContent = (data as any)?.audioContent;
  if (!audioContent) throw new Error("no_audio_content");

  const uri = `data:audio/mpeg;base64,${audioContent}`;
  audioCache.set(chunk, uri);
  return uri;
};
