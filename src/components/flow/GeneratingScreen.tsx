import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CAMALEAO } from "@/lib/camaleaoOficial";
import { FONT, SERIF } from "@/lib/premiumUi";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kidzz-chat`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const TIMEOUT_MS = 35_000;

const LOADING_PHRASES = [
  "Pensando na melhor forma de explicar…",
  "Adaptando a linguagem para a idade certa…",
  "Criando uma resposta que conecta vocês…",
  "Quase pronto — isso pode marcar o dia…",
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
  const [progress, setProgress] = useState(4);
  const [phase, setPhase] = useState<"loading" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const runIdRef = useRef(0);

  useEffect(() => {
    if (phase !== "loading") return;
    const iv = setInterval(() => setPhraseIdx((i) => (i + 1) % LOADING_PHRASES.length), 2400);
    return () => clearInterval(iv);
  }, [phase]);

  // Barra “bonita” que sobe sozinha até ~90% enquanto a API responde
  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        if (p < 40) return p + 2.2 + Math.random() * 1.8;
        if (p < 70) return p + 1.1 + Math.random() * 0.9;
        return p + 0.35 + Math.random() * 0.4;
      });
    }, 280);
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
              // avança a barra conforme chega conteúdo
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
      }, 420);
    } catch (e: any) {
      window.clearTimeout(timeout);
      if (runId !== runIdRef.current) return;
      if (e?.name === "AbortError") {
        setErrorMsg("Demorou demais. Tente novamente.");
      } else {
        setErrorMsg(e?.message || "Ops, algo deu errado!");
      }
      setPhase("error");
      setProgress((p) => Math.min(p, 28));
      toast.error(e?.name === "AbortError" ? "Demorou demais. Tente novamente." : e?.message || "Ops, algo deu errado!");
    }
  }, [session?.access_token, incrementQuestions, question, ageRange, childName, onComplete, onError, onLimitReached]);

  useEffect(() => {
    void runGenerate();
    return () => {
      // invalida corrida atual sem forçar erro na UI (Strict Mode / unmount)
      runIdRef.current += 1;
    };
    // só na montagem + troca de pergunta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        fontFamily: FONT,
        background:
          "radial-gradient(ellipse at 50% 18%, #FFE8C8 0%, #F8F0DC 42%, #EFE6C8 100%)",
      }}
    >
      {/* brilhos de fundo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(40% 28% at 78% 22%, rgba(255,200,120,.35), transparent 70%)," +
            "radial-gradient(36% 24% at 18% 70%, rgba(160,220,140,.2), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <motion.div
          className="relative"
          animate={phase === "loading" ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-12%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,200,100,.45), transparent 68%)",
              filter: "blur(8px)",
            }}
          />
          <img
            src={CAMALEAO.heartSoft}
            alt="Gui pensando"
            className="relative w-28 h-28 object-contain drop-shadow-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = CAMALEAO.heart;
            }}
          />
        </motion.div>

        <div className="h-[4.5rem] flex items-center justify-center mt-5 w-full">
          <AnimatePresence mode="wait">
            <motion.h2
              key={phase === "error" ? "err" : phase === "done" ? "done" : phraseIdx}
              className="text-center max-w-xs leading-snug px-2"
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 20,
                color: "#2A3A20",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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

        {/* Barra de progresso premium */}
        <div className="w-full mt-2 px-1">
          <div
            style={{
              height: 14,
              borderRadius: 999,
              background: "rgba(255,255,255,.55)",
              border: "0.5px solid rgba(255,255,255,.9)",
              boxShadow: "inset 0 1px 3px rgba(40,60,20,.12), 0 6px 16px rgba(40,60,20,.08)",
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
                    ? "linear-gradient(90deg, #E88A8A, #D45A5A)"
                    : "linear-gradient(90deg, #F2C55C 0%, #F0A83A 45%, #7DC86A 100%)",
                boxShadow: "0 0 16px rgba(242,180,60,.45)",
                position: "relative",
              }}
              initial={{ width: "4%" }}
              animate={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <motion.div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg, transparent 0%, rgba(255,255,255,.45) 48%, transparent 100%)",
                }}
                animate={{ x: ["-40%", "140%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          <div
            className="flex justify-between mt-2 px-0.5"
            style={{ fontSize: 11, fontWeight: 800, color: "rgba(40,55,30,.55)" }}
          >
            <span>
              {phase === "error" ? "Falhou" : phase === "done" ? "Concluído" : "Formulando resposta"}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Card da pergunta */}
        <motion.div
          className="mt-7 w-full rounded-2xl px-5 py-3.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,.78), rgba(255,255,255,.5))",
            border: "0.5px solid rgba(255,255,255,.95)",
            boxShadow: "0 12px 28px rgba(40,60,20,.1)",
            backdropFilter: "blur(16px)",
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "rgba(50,70,40,.5)", textAlign: "center" }}>
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
              <p style={{ margin: 0, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#8A3A3A" }}>
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
                border: "0.5px solid rgba(40,60,20,.15)",
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 14,
                color: "#3A4A2A",
                cursor: "pointer",
                background: "rgba(255,255,255,.65)",
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
