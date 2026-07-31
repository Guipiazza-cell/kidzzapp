import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CAMALEAO } from "@/lib/camaleaoOficial";
import forestBg from "@/assets/premium-forest-bg.jpg";
import { FONT, SERIF } from "@/lib/premiumUi";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kidzz-chat`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const TIMEOUT_MS = 35_000;

const LOADING_PHRASES = [
  "Pensando na melhor forma de explicar isso para uma criança...",
  "Adaptando a linguagem para a idade certa...",
  "Criando uma resposta que conecta vocês...",
  "Quase pronto! Isso pode marcar a vida do seu filho...",
];

interface Props {
  question: string;
  ageRange: string;
  childName: string;
  onComplete: (answer: string) => void;
  onError: () => void;
  onLimitReached?: () => void;
}

const GeneratingScreen = ({
  question,
  ageRange,
  childName,
  onComplete,
  onError,
  onLimitReached,
}: Props) => {
  const { session, incrementQuestions } = useAuth();
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [progress, setProgress] = useState(5);
  const [phase, setPhase] = useState<"loading" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const runIdRef = useRef(0);

  useEffect(() => {
    if (phase !== "loading") return;
    const iv = setInterval(() => setPhraseIdx((i) => (i + 1) % LOADING_PHRASES.length), 2500);
    return () => clearInterval(iv);
  }, [phase]);

  // Barra sobe sozinha até ~90% enquanto a API responde
  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        if (p < 35) return p + 2.4 + Math.random() * 1.6;
        if (p < 68) return p + 1.0 + Math.random() * 0.8;
        return p + 0.3 + Math.random() * 0.35;
      });
    }, 300);
    return () => clearInterval(t);
  }, [phase]);

  const runGenerate = useCallback(async () => {
    const runId = ++runIdRef.current;
    setPhase("loading");
    setErrorMsg("");
    setProgress(6);
    setPhraseIdx(0);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      if (!session?.access_token) {
        throw new Error("Faça login para continuar.");
      }

      await incrementQuestions();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
      if (ANON_KEY) headers.apikey = ANON_KEY;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
          ageRange,
          childName,
        }),
        signal: controller.signal,
      });

      if (runId !== runIdRef.current) return;

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro" }));
        if (resp.status === 403 && err.error === "LIMIT_REACHED") {
          window.clearTimeout(timeout);
          toast.error(err.message || "Limite do dia atingido.");
          if (onLimitReached) onLimitReached();
          else onError();
          return;
        }
        if (err.error === "QUOTA_ERROR") {
          throw new Error(err.message || "Não foi possível validar seu limite. Tente de novo.");
        }
        if (resp.status === 401) {
          throw new Error("Sessão expirada. Entre de novo e tente outra vez.");
        }
        throw new Error(err.message || err.error || `Erro ${resp.status}`);
      }

      if (!resp.body) throw new Error("Sem resposta do servidor");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (runId !== runIdRef.current) return;
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
            if (content) {
              fullText += content;
              setProgress((p) => Math.min(96, Math.max(p, 55 + fullText.length / 12)));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      window.clearTimeout(timeout);
      if (runId !== runIdRef.current) return;

      if (!fullText.trim()) throw new Error("Resposta vazia. Tente de novo.");

      setProgress(100);
      setPhase("done");
      window.setTimeout(() => {
        if (runId === runIdRef.current) onComplete(fullText);
      }, 450);
    } catch (e: any) {
      window.clearTimeout(timeout);
      if (runId !== runIdRef.current) return;
      const msg =
        e?.name === "AbortError"
          ? "Demorou demais. Tente novamente."
          : e?.message || "Ops, algo deu errado!";
      setErrorMsg(msg);
      setPhase("error");
      setProgress((p) => Math.min(p, 28));
      toast.error(msg);
    }
  }, [
    session?.access_token,
    incrementQuestions,
    question,
    ageRange,
    childName,
    onComplete,
    onError,
    onLimitReached,
  ]);

  useEffect(() => {
    void runGenerate();
    return () => {
      runIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ fontFamily: FONT }}
    >
      {/* Fundo floresta mágica (visual que o usuário conhece) */}
      <img
        src={forestBg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "saturate(1.05) brightness(1.08)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(255,252,245,.55) 0%, rgba(255,248,235,.28) 42%, rgba(240,248,240,.45) 100%)," +
            "linear-gradient(180deg, rgba(255,255,255,.2) 0%, transparent 35%, rgba(255,255,255,.25) 100%)",
        }}
      />

      {/* partículas leves */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 6 + (i % 3) * 3,
            height: 6 + (i % 3) * 3,
            left: `${18 + i * 15}%`,
            top: `${30 + (i % 4) * 12}%`,
            background: "rgba(255,230,160,.55)",
            boxShadow: "0 0 12px rgba(255,210,120,.5)",
          }}
          animate={{ y: [0, -18, 0], opacity: [0.25, 0.85, 0.25] }}
          transition={{ duration: 3.2 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <motion.div
          className="relative"
          animate={phase === "loading" ? { y: [0, -10, 0] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            aria-hidden
            className="absolute rounded-full"
            style={{
              inset: "-28%",
              background: "radial-gradient(circle, rgba(255,220,140,.55), transparent 68%)",
              filter: "blur(10px)",
            }}
          />
          <img
            src={CAMALEAO.cutout}
            alt="Gui pensando"
            className="relative w-[8.5rem] h-[11rem] object-contain"
            style={{
              filter: "drop-shadow(0 14px 24px rgba(40,50,30,.28))",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = CAMALEAO.cutout;
            }}
          />
        </motion.div>

        <div className="h-[4.75rem] flex items-center justify-center mt-7 w-full px-2">
          <AnimatePresence mode="wait">
            <motion.h2
              key={phase === "error" ? "err" : phase === "done" ? "done" : phraseIdx}
              className="text-center max-w-xs leading-snug"
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 19,
                color: "#1F2E18",
                textShadow: "0 1px 0 rgba(255,255,255,.65)",
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {phase === "error"
                ? "Não deu pra formular agora"
                : phase === "done"
                  ? "Pronto!"
                  : LOADING_PHRASES[phraseIdx]}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Barra de progresso (a que “sumiu”) */}
        <div className="w-full mt-1 px-3">
          <div
            style={{
              height: 16,
              borderRadius: 999,
              background: "rgba(255,255,255,.55)",
              border: "0.5px solid rgba(255,255,255,.92)",
              boxShadow:
                "inset 0 1px 4px rgba(40,60,20,.12), 0 8px 20px rgba(40,60,20,.1)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                borderRadius: 999,
                background:
                  phase === "error"
                    ? "linear-gradient(90deg, #E8A0A0, #D06060)"
                    : "linear-gradient(90deg, #FFD27A 0%, #F2A83A 42%, #7ECF6A 100%)",
                boxShadow: "0 0 18px rgba(242,180,60,.5)",
                position: "relative",
              }}
              initial={{ width: "5%" }}
              animate={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg, transparent 0%, rgba(255,255,255,.5) 50%, transparent 100%)",
                }}
                animate={{ x: ["-50%", "160%"] }}
                transition={{ duration: 1.35, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          <div
            className="flex justify-between mt-2 px-0.5"
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "rgba(30,45,25,.58)",
              textShadow: "0 1px 0 rgba(255,255,255,.5)",
            }}
          >
            <span>
              {phase === "error"
                ? "Falhou"
                : phase === "done"
                  ? "Concluído"
                  : "Formulando resposta"}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Dots sutis sob a barra */}
        {phase === "loading" && (
          <motion.div className="flex gap-2 mt-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "#F0A040" }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}

        <motion.div
          className="mt-7 w-full rounded-2xl px-5 py-3.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "rgba(255,255,255,.72)",
            border: "0.5px solid rgba(255,255,255,.95)",
            boxShadow: "0 12px 28px rgba(40,60,20,.1)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 800,
              color: "rgba(50,70,40,.5)",
              textAlign: "center",
            }}
          >
            Pergunta
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 14,
              fontWeight: 700,
              color: "#2A3A20",
              textAlign: "center",
              lineHeight: 1.35,
            }}
          >
            “{question}”
          </p>
        </motion.div>

        {phase === "error" && (
          <div className="mt-6 w-full flex flex-col gap-2.5">
            {errorMsg && (
              <p
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#8A3A3A",
                }}
              >
                {errorMsg}
              </p>
            )}
            <button
              type="button"
              onClick={() => void runGenerate()}
              className="active:scale-[.98]"
              style={{
                width: "100%",
                minHeight: 52,
                borderRadius: 18,
                border: "none",
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 15,
                color: "#fff",
                cursor: "pointer",
                background: "linear-gradient(135deg, #F2C55C, #E89530)",
                boxShadow: "0 10px 24px rgba(200,140,30,.35)",
              }}
            >
              Tentar de novo
            </button>
            <button
              type="button"
              onClick={onError}
              className="active:scale-[.98]"
              style={{
                width: "100%",
                minHeight: 48,
                borderRadius: 18,
                border: "0.5px solid rgba(40,60,20,.12)",
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 14,
                color: "#3A4A2A",
                cursor: "pointer",
                background: "rgba(255,255,255,.7)",
              }}
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GeneratingScreen;
