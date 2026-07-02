/**
 * ttsVoice — Ponto ÚNICO de seleção de voz para toda a narração Web Speech do app.
 *
 * Objetivo: voz FEMININA, mansa e serena, em pt-BR, consistente em todas as telas
 * (Perguntas, Histórias, Música, Sonhos, Viagem, Meditação/KALM…).
 *
 * Use `pickFemaleVoice(voices)` para escolher a voz e as constantes SOFT_* para
 * o tom padrão. Sempre defina também `utterance.lang = "pt-BR"`.
 */

/** Ritmo/tom padrão suave — "tia que conta história". */
export const SOFT_RATE = 0.88;
export const SOFT_PITCH = 1.02;
export const SOFT_VOLUME = 0.95;

/**
 * Voz feminina do ElevenLabs (usada nas narrações via edge `elevenlabs-tts`).
 * "Amanda Kelly" — feminina, mansa e serena. Forçada pelo cliente para não
 * depender do redeploy do edge function.
 */
export const ELEVEN_FEMALE_VOICE_ID = "oi8rgjIfLgJRsQ6rbZh3";

/** Vozes femininas pt-BR/pt mais agradáveis, em ordem de preferência. */
export const FEMALE_PT_VOICE_NAMES = [
  "Luciana",        // iOS / macOS
  "Francisca",      // Microsoft / Edge / Azure
  "Maria",          // Google / Microsoft
  "Camila",         // Microsoft
  "Fernanda",
  "Vitória",
  "Vitoria",
  "Manuela",
  "Helena",         // pt-PT, mas excelente
  "Joana",
  "Ana",
  "Google português do Brasil",
  "Microsoft Maria",
  "Microsoft Francisca",
];

/** Nomes claramente MASCULINOS — nunca usar, mesmo no fallback. */
const MALE_VOICE_MARKERS = [
  "daniel", "antonio", "antónio", "felipe", "fábio", "fabio",
  "ricardo", "joão", "joao", "carlos", "male", "masculino", "homem",
];

const isMaleVoice = (name: string): boolean => {
  const n = name.toLowerCase();
  return MALE_VOICE_MARKERS.some((m) => n.includes(m));
};

/** Carrega vozes — em alguns browsers só ficam prontas após `onvoiceschanged`. */
export const loadVoices = (): Promise<SpeechSynthesisVoice[]> =>
  new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve([]);
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

/**
 * Escolhe a melhor voz FEMININA pt-BR disponível, evitando vozes masculinas
 * mesmo nos fallbacks. Retorna null se não houver nenhuma voz pt.
 */
export const pickFemaleVoice = (
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null => {
  // 1. Nome feminino preferido + qualquer pt
  for (const name of FEMALE_PT_VOICE_NAMES) {
    const v = voices.find(
      (vv) => vv.name.toLowerCase().includes(name.toLowerCase()) && vv.lang.startsWith("pt")
    );
    if (v) return v;
  }
  // 2. Qualquer pt-BR que NÃO seja masculina
  const ptBRFemale = voices.find((v) => v.lang === "pt-BR" && !isMaleVoice(v.name));
  if (ptBRFemale) return ptBRFemale;
  // 3. Qualquer pt que NÃO seja masculina
  const ptFemale = voices.find((v) => v.lang.startsWith("pt") && !isMaleVoice(v.name));
  if (ptFemale) return ptFemale;
  // 4. Último recurso: qualquer pt-BR (mesmo que masculina — melhor que idioma errado)
  const ptBR = voices.find((v) => v.lang === "pt-BR");
  if (ptBR) return ptBR;
  const ptAny = voices.find((v) => v.lang.startsWith("pt"));
  return ptAny ?? null;
};
