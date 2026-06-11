import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OnboardingShell from "./OnboardingShell";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kidzz-chat`;
const TIMEOUT_MS = 30_000;

const SUGGESTIONS_BY_INTEREST: Record<string, string[]> = {
  animais: [
    "Por que os gatos ronronam?",
    "Como os cachorros entendem a gente?",
    "Por que os elefantes têm tromba?",
  ],
  espaco: [
    "Por que as estrelas brilham?",
    "O que tem dentro de um buraco negro?",
    "Como os astronautas dormem no espaço?",
  ],
  arte: [
    "Por que existem tantas cores?",
    "Como pintores famosos criavam quadros?",
    "Como o arco-íris aparece no céu?",
  ],
  natureza: [
    "Por que as folhas mudam de cor?",
    "Como nascem as borboletas?",
    "Por que chove?",
  ],
  aventura: [
    "Como os piratas encontravam tesouros?",
    "Por que os castelos têm torres?",
    "Como funciona uma bússola?",
  ],
  musica: [
    "Por que a música mexe com a gente?",
    "Como os pássaros aprendem a cantar?",
    "De que é feito o som?",
  ],
  ciencia: [
    "Por que o céu é azul?",
    "Como funciona a eletricidade?",
    "Por que sentimos cócegas?",
  ],
  oceano: [
    "Por que o mar é salgado?",
    "Como as baleias respiram?",
    "O que tem no fundo do oceano?",
  ],
};

interface Props {
  onComplete: () => void;
}

type Phase = "ask" | "loading" | "answer";

const FirstMagicMoment = ({ onComplete }: Props) => {
  const { profile, session, incrementQuestions } = useAuth();
  const childName = profile?.child_name || "amigo";
  const ageRange = profile?.age_range || "5-7";
  const interests = ((profile as any)?.child_interests as string[]) || [];

  const [phase, setPhase] = useState<Phase>("ask");
  const [question, setQuestion] = useState("");
  const [custom, setCustom] = useState("");
  const [answer, setAnswer] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const suggestions = useMemo(() => {
    const pool: string[] = [];
    for (const i of interests) {
      const arr = SUGGESTIONS_BY_INTEREST[i];
      if (arr) pool.push(...arr);
    }
    if (pool.length === 0) {
      pool.push(...SUGGESTIONS_BY_INTEREST.ciencia, ...SUGGESTIONS_BY_INTEREST.natureza);
    }
    // Pick 3 distinct
    const out: string[] = [];
    const used = new Set<number>();
    while (out.length < 3 && used.size < pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      if (used.has(idx)) continue;
      used.add(idx);
      out.push(pool[idx]);
    }
    return out;
  }, [interests.join(",")]);

  const playVoice = useCallback(async (text: string) => {
    try {
      setAudioLoading(true);
      const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
        body: { text },
      });
      if (error) throw error;
      const audioContent = (data as any)?.audioContent;
      if (!audioContent) throw new Error("no audio");
      const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn("[first-magic] voice failed:", e);
    } finally {
      setAudioLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const generate = useCallback(async (q: string) => {
    if (!q.trim()) return;
    if (!session?.access_token) {
      toast.error("Faça login para continuar.");
      return;
    }
    sfx("reward");
    haptic("success");
    setQuestion(q);
    setPhase("loading");

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      toast.error("Demorou demais. Tente novamente.");
      setPhase("ask");
    }, TIMEOUT_MS);

    try {
      await incrementQuestions();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          ageRange,
          childName,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro" }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }
      if (!resp.body) throw new Error("Sem resposta");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullText += content;
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      clearTimeout(timeout);
      if (!fullText.trim()) throw new Error("Resposta vazia");
      setAnswer(fullText);
      setPhase("answer");
      // Fire-and-forget voice playback
      void playVoice(fullText);
    } catch (e: any) {
      clearTimeout(timeout);
      if (e.name !== "AbortError") {
        toast.error(e.message || "Ops, algo deu errado!");
        setPhase("ask");
      }
    }
  }, [session?.access_token, ageRange, childName, incrementQuestions, playVoice]);

  const handleContinue = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    try {
      window.dispatchEvent(new CustomEvent("kidzz:open-paywall", {
        detail: {
          context: "first_magic_moment",
          meta: { childName, message: `${childName} adorou! Quer continuar descobrindo o mundo juntos?` },
        },
      }));
    } catch {}
    onComplete();
  }, [childName, onComplete]);

  return (
    <OnboardingShell tone="violet">
      <div className="flex-1 flex flex-col items-center px-6 pt-[max(env(safe-area-inset-top,16px),24px)] pb-8 overflow-y-auto">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
        >
          <KidzzChameleon
            state="music"
            mood={phase === "loading" ? "curious" : "happy"}
            size="lg"
            interactive
            showParticles
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "ask" && (
            <motion.div
              key="ask"
              className="w-full max-w-sm flex flex-col items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-[24px] font-black text-gray-900 text-center mt-4 leading-tight">
                Vamos fazer sua primeira pergunta mágica? ✨
              </h1>
              <p className="text-base font-bold text-gray-700 text-center mt-2">
                {childName}, você sabia que...
              </p>

              <div className="w-full mt-5 flex flex-col gap-3">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={s}
                    type="button"
                    onClick={() => generate(s)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full text-left p-4 rounded-2xl min-h-[60px] text-base font-bold text-gray-900"
                    style={{
                      background: "rgba(255,255,255,0.82)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1.5px solid rgba(255,255,255,0.7)",
                      boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
                    }}
                  >
                    💫 {s}
                  </motion.button>
                ))}
              </div>

              <div className="w-full mt-5">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Ou digite uma pergunta sua:
                </label>
                <textarea
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder={`O que ${childName} quer descobrir?`}
                  rows={2}
                  className="w-full p-3 rounded-2xl text-base font-bold text-gray-900 placeholder:text-gray-500 placeholder:font-medium resize-none focus:outline-none focus:ring-2 focus:ring-kid-orange"
                  style={{
                    background: "rgba(255,255,255,0.82)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1.5px solid rgba(255,255,255,0.7)",
                  }}
                />
              </div>

              <motion.button
                onClick={() => generate(custom)}
                disabled={!custom.trim()}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-5 py-5 rounded-2xl text-white font-extrabold text-lg min-h-[56px] disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(35 95% 58%), hsl(28 95% 62%) 60%, hsl(280 70% 65%))",
                  boxShadow:
                    "0 0 30px hsl(35 95% 58% / 0.55), 0 10px 24px rgba(0,0,0,0.15)",
                }}
              >
                Descobrir com o Kidzz! ✨
              </motion.button>

              <button
                type="button"
                onClick={onComplete}
                className="mt-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                PULAR E IR PARA A HOME
              </button>
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              className="w-full max-w-sm flex flex-col items-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-lg font-black text-gray-800 text-center">
                O Kidzz está pensando na resposta perfeita para {childName}…
              </h2>
              <div className="flex gap-2 mt-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-kid-orange"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <div className="mt-6 glass-card px-5 py-3 rounded-2xl max-w-xs">
                <p className="text-gray-500 text-xs font-bold text-center">Pergunta:</p>
                <p className="text-gray-700 text-sm font-bold text-center mt-1">"{question}"</p>
              </div>
            </motion.div>
          )}

          {phase === "answer" && (
            <motion.div
              key="answer"
              className="w-full max-w-sm flex flex-col items-center mt-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-lg font-black text-gray-900 text-center">
                Olha o que o Kidzz descobriu! 🌟
              </h2>
              <p className="text-sm font-bold text-gray-600 text-center mt-1">"{question}"</p>

              <div
                className="w-full mt-4 p-5 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1.5px solid rgba(255,255,255,0.7)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
              >
                <p className="text-base font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </p>
                {audioLoading && (
                  <p className="mt-3 text-xs font-bold text-kid-orange text-center">
                    🔊 Preparando a voz do Kidzz…
                  </p>
                )}
              </div>

              <motion.button
                onClick={handleContinue}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-6 py-5 rounded-2xl text-white font-extrabold text-lg min-h-[56px]"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(280 70% 65%), hsl(320 75% 65%) 60%, hsl(35 95% 58%))",
                  boxShadow:
                    "0 0 30px hsl(280 70% 65% / 0.55), 0 10px 24px rgba(0,0,0,0.15)",
                }}
              >
                Continuar a jornada do {childName} 💫
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingShell>
  );
};

export default FirstMagicMoment;
