/**
 * Desafio 7 Dias - modal viral premium com hero full-bleed.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Copy, Trophy, MessageCircle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChallenges } from "@/hooks/useChallenges";
import heroImg from "@/assets/desafio-7dias-hero.webp";
import confetti from "canvas-confetti";
import { haptic } from "@/lib/haptics";

interface Props {
  onClose: () => void;
}

const SevenDayChallenge = ({ onClose }: Props) => {
  const { profile } = useAuth();
  const { activeChallenge, createChallenge, joinChallenge } = useChallenges();
  const childName = profile?.child_name || "amigo";
  const [view, setView] = useState<"invite" | "progress" | "complete">("invite");
  const [challengeCode, setChallengeCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeChallenge?.status === "completed") {
      setView("complete");
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#D4A847", "#F0C85A", "#E8A0B4", "#fff"],
      });
    } else if (activeChallenge?.status === "active") {
      setView("progress");
    }
  }, [activeChallenge]);

  const handleCreate = async () => {
    haptic("medium");
    const result = await createChallenge();
    if (result) setChallengeCode(result.challenge_code);
  };

  const handleJoin = async () => {
    haptic("light");
    const { error: err } = await joinChallenge(joinCode);
    if (err) setError(err);
  };

  const shareWhatsApp = () => {
    const text = `Oi! Estou fazendo o Desafio 7 Dias do KIDZZ com meu filho. Você topa com o seu? Os dois ganham 7 dias premium grátis!\n\nhttps://kidzzapp.lovable.app/?challenge=${challengeCode}`;
    if (navigator.share) {
      navigator.share({ text, url: `https://kidzzapp.lovable.app/?challenge=${challengeCode}` });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://kidzzapp.lovable.app/?challenge=${challengeCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const challengerDays = activeChallenge?.challenger_progress?.filter(Boolean).length ?? 0;
  const challengedDays = activeChallenge?.challenged_progress?.filter(Boolean).length ?? 0;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      style={{
        background:
          "radial-gradient(70% 50% at 50% 40%, rgba(90,50,140,0.35), rgba(10,8,20,0.72))",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,.35)",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero full-bleed */}
        <div className="relative flex-none" style={{ height: 220 }}>
          <img
            src={heroImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "50% 28%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,12,40,.25) 0%, rgba(20,12,40,.15) 40%, rgba(20,12,40,.75) 78%, #1A1230 100%)",
            }}
          />

          {/* Top bar over hero */}
          <div
            className="relative z-10 flex items-center justify-between px-4"
            style={{ paddingTop: "max(12px, env(safe-area-inset-top, 0px))" }}
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,.14)",
                border: "0.5px solid rgba(255,255,255,.35)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Trophy size={15} className="text-amber-300" />
              <span className="text-[13px] font-extrabold text-white">Desafio 7 Dias</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
              style={{
                background: "rgba(255,255,255,.16)",
                border: "0.5px solid rgba(255,255,255,.35)",
                backdropFilter: "blur(12px)",
              }}
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Title on hero (invite) */}
          {view === "invite" && !challengeCode && (
            <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-200/90 mb-1">
                Premium grátis
              </p>
              <h3
                className="text-[22px] font-black text-white leading-tight"
                style={{ textShadow: "0 2px 14px rgba(0,0,0,.45)" }}
              >
                Desafie um amigo por 7 dias de conexão
              </h3>
            </div>
          )}
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden px-5 pt-5 pb-6"
          style={{
            background: "linear-gradient(180deg, #1A1230 0%, #24183C 40%, #2A1E48 100%)",
          }}
        >
          {/* Invite view */}
          {view === "invite" && !challengeCode && (
            <div className="space-y-4">
              <p className="text-[14px] font-bold text-white/90 leading-relaxed text-center">
                Que tal desafiar outro pai ou mãe? Vocês e {childName} ganham{" "}
                <span className="text-amber-300">7 dias premium grátis</span>.
              </p>

              <motion.button
                type="button"
                onClick={handleCreate}
                className="w-full py-3.5 rounded-full font-black text-[14px] text-[#3A2408] min-h-[48px]"
                style={{
                  background:
                    "radial-gradient(130% 160% at 30% 18%, #FFE9A8 0%, #F2A62B 55%, #C77E12 100%)",
                  border: "1px solid rgba(255,255,255,.55)",
                  boxShadow:
                    "0 12px 28px rgba(200,120,20,.4), inset 0 1.5px 0 rgba(255,255,255,.65)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                Convidar um amigo
              </motion.button>

              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/15" />
                <span className="text-[10px] text-white/45 font-bold tracking-wider">OU</span>
                <div className="flex-1 h-px bg-white/15" />
              </div>

              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value);
                    setError("");
                  }}
                  placeholder="Código do desafio"
                  className="flex-1 px-4 py-3.5 rounded-2xl text-sm font-bold text-white placeholder:text-white/40 outline-none min-h-[48px]"
                  style={{
                    background: "rgba(255,255,255,.08)",
                    border: "0.5px solid rgba(255,255,255,.2)",
                  }}
                />
                <motion.button
                  type="button"
                  onClick={handleJoin}
                  disabled={!joinCode.trim()}
                  className="px-5 py-3 rounded-2xl text-xs font-black text-white disabled:opacity-35 min-h-[48px]"
                  style={{
                    background: "linear-gradient(135deg, #A78BFA, #7C3AED)",
                    boxShadow: "0 8px 18px rgba(124,58,237,.35)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Entrar
                </motion.button>
              </div>
              {error && (
                <p className="text-xs text-rose-300 font-semibold text-center">{error}</p>
              )}
            </div>
          )}

          {/* Share code view */}
          {view === "invite" && challengeCode && (
            <div className="space-y-4 text-center">
              <p className="text-sm font-bold text-white/85">Seu código de desafio:</p>
              <div
                className="rounded-2xl px-6 py-5"
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "0.5px solid rgba(255,220,140,.35)",
                }}
              >
                <span className="text-2xl font-black text-amber-200 tracking-[0.2em]">
                  {challengeCode}
                </span>
              </div>
              <p className="text-xs text-white/50 font-semibold">
                Compartilhe com um amigo para começar!
              </p>

              <div className="flex gap-3 justify-center">
                <motion.button
                  type="button"
                  onClick={shareWhatsApp}
                  className="flex items-center gap-2 px-5 py-3 rounded-full text-white text-xs font-bold min-h-[44px]"
                  style={{ background: "#22C55E", boxShadow: "0 8px 18px rgba(34,197,94,.35)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle size={16} /> WhatsApp
                </motion.button>
                <motion.button
                  type="button"
                  onClick={copyLink}
                  className="flex items-center gap-2 px-5 py-3 rounded-full text-white text-xs font-bold min-h-[44px]"
                  style={{
                    background: "rgba(255,255,255,.12)",
                    border: "0.5px solid rgba(255,255,255,.25)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                  {copied ? "Copiado!" : "Copiar link"}
                </motion.button>
              </div>
            </div>
          )}

          {/* Progress view */}
          {view === "progress" && activeChallenge && (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "0.5px solid rgba(255,255,255,.15)",
                }}
              >
                <p className="text-xs font-bold text-white/55 mb-2">Seu progresso</p>
                <div className="flex gap-1.5">
                  {(activeChallenge.challenger_progress || []).map((done: boolean, i: number) => (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded-full ${done ? "bg-emerald-400" : "bg-white/15"}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-white/40 mt-1.5 font-semibold">
                  Você: {challengerDays}/7 dias
                </p>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "0.5px solid rgba(255,255,255,.15)",
                }}
              >
                <p className="text-xs font-bold text-white/55 mb-2">Progresso do amigo</p>
                <div className="flex gap-1.5">
                  {(activeChallenge.challenged_progress || []).map((done: boolean, i: number) => (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded-full ${done ? "bg-sky-400" : "bg-white/15"}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-white/40 mt-1.5 font-semibold">
                  Amigo: {challengedDays}/7 dias
                </p>
              </div>

              <p className="text-xs text-white/55 text-center font-semibold">
                Dia {Math.max(challengerDays, 1)}/7 - Continue fazendo perguntas!
              </p>
            </div>
          )}

          {/* Complete view */}
          {view === "complete" && (
            <div className="text-center space-y-4">
              <div
                className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#FFE9A8,#F2A62B)",
                  boxShadow: "0 10px 24px rgba(242,166,43,.4)",
                }}
              >
                <Trophy size={28} className="text-[#4A3300]" />
              </div>
              <h3 className="text-lg font-black text-white">Desafio Concluído!</h3>
              <p className="text-sm text-white/70 font-bold">
                Vocês criaram 7 dias de conexão com seus filhos.
              </p>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: "rgba(255,220,120,.15)",
                  border: "0.5px solid rgba(255,220,120,.35)",
                }}
              >
                <Trophy size={16} className="text-amber-300" />
                <span className="text-xs font-black text-amber-200">Badge: Família Conectada</span>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-full font-bold text-sm text-white min-h-[48px]"
                style={{
                  background: "rgba(255,255,255,.12)",
                  border: "0.5px solid rgba(255,255,255,.25)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                Voltar
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SevenDayChallenge;
