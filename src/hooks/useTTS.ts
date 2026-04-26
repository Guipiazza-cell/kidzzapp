import { useCallback, useRef } from "react";

/**
 * useTTS — Narração via Web Speech API nativa (pt-BR).
 *
 * Por que Web Speech?
 *  - Gratuita, sem chave, sem latência de rede, sem dependência de edge function
 *  - Funciona offline e em todos os navegadores modernos
 *  - Voz feminina pt-BR priorizada quando disponível (Luciana, Francisca, Maria, Helena…)
 *
 * `stop()` cancela a fala em qualquer ponto.
 */

const cleanText = (text: string): string =>
  text
    // remove markdown comum
    .replace(/[*_~`#>]/g, "")
    // remove links markdown [texto](url) → texto
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // remove TODOS os emojis e símbolos pictográficos (Unicode "Extended Pictographic")
    // — voz lê texto puro, mais limpo e amigo, sem "rosto sorridente" etc.
    .replace(/\p{Extended_Pictographic}/gu, "")
    // remove variation selectors / zero-width joiners deixados pelos emojis
    .replace(/[\u200D\uFE0F\u20E3]/g, "")
    // colapsa espaços extras gerados pela remoção
    .replace(/\s{2,}/g, " ")
    .trim();

/** Quebra em frases para pausa natural entre orações. */
const splitSentences = (text: string): string[] => {
  const clean = cleanText(text);
  const sentences = clean.split(/(?<=[.!?…])\s+/).filter((s) => s.trim().length > 0);
  return sentences.length > 0 ? sentences : [clean];
};

/** Lista priorizada de vozes femininas pt-BR mais agradáveis. */
const PREFERRED_VOICE_NAMES = [
  "Luciana",        // iOS / macOS
  "Francisca",      // Microsoft / Edge
  "Maria",          // Google
  "Camila",         // Microsoft
  "Helena",         // pt-PT mas excelente
  "Joana",
  "Google português do Brasil",
  "Microsoft Maria",
  "Microsoft Francisca",
  "Microsoft Daniel",
];

/** Carrega vozes — em alguns browsers só ficam prontas após `onvoiceschanged`. */
const loadVoices = (): Promise<SpeechSynthesisVoice[]> =>
  new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve([]);
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) return resolve(existing);
    const handler = () => {
      const v = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = null;
      resolve(v);
    };
    window.speechSynthesis.onvoiceschanged = handler;
    // Fallback: alguns navegadores (Safari) nunca disparam o evento
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 800);
  });

/** Escolhe a melhor voz pt-BR disponível. */
const pickVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  // 1. Por nome preferido + qualquer pt
  for (const name of PREFERRED_VOICE_NAMES) {
    const v = voices.find(
      (vv) => vv.name.toLowerCase().includes(name.toLowerCase()) && vv.lang.startsWith("pt")
    );
    if (v) return v;
  }
  // 2. Qualquer pt-BR
  const ptBR = voices.find((v) => v.lang === "pt-BR");
  if (ptBR) return ptBR;
  // 3. Qualquer pt
  const ptAny = voices.find((v) => v.lang.startsWith("pt"));
  if (ptAny) return ptAny;
  return null;
};

export const useTTS = () => {
  const cancelledRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* noop */
      }
    }
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!("speechSynthesis" in window)) {
      console.warn("[useTTS] Web Speech API indisponível neste navegador");
      return;
    }

    cancelledRef.current = false;
    window.speechSynthesis.cancel();

    // Carrega/reusa voz
    if (!voiceRef.current) {
      const voices = await loadVoices();
      voiceRef.current = pickVoice(voices);
    }

    const sentences = splitSentences(text);

    for (let i = 0; i < sentences.length; i++) {
      if (cancelledRef.current) break;
      await new Promise<void>((resolve) => {
        const utt = new SpeechSynthesisUtterance(sentences[i]);
        utt.lang = "pt-BR";
        utt.rate = 0.95;   // ligeiramente mais rápido = soa mais natural
        utt.pitch = 1.05;  // pitch suave para soar acolhedor
        utt.volume = 1.0;
        if (voiceRef.current) utt.voice = voiceRef.current;

        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        utt.onend = done;
        utt.onerror = done;

        try {
          window.speechSynthesis.speak(utt);
        } catch {
          done();
        }

        // Fail-safe: alguns navegadores travam o `onend` em frases longas
        const safeMs = Math.min(15000, sentences[i].length * 90);
        setTimeout(done, safeMs);
      });
      if (i < sentences.length - 1 && !cancelledRef.current) {
        await new Promise((r) => setTimeout(r, 120));
      }
    }
  }, []);

  return { speak, stop };
};
