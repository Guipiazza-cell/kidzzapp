import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy, Gift, Users, Trophy, MessageCircle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChallenges } from "@/hooks/useChallenges";
import pixelImg from "@/assets/pixel-chameleon.png";
import confetti from "canvas-confetti";

interface Props {
  onClose: () => void;
}

const SevenDayChallenge = ({ onClose }: Props) => {
  const { profile } = useAuth();
  const { activeChallenge, createChallenge, joinChallenge, shouldShowInvite } = useChallenges();
  const childName = profile?.child_name || "Explorador";
  const [view, setView] = useState<"invite" | "progress" | "complete">("invite");
  const [challengeCode, setChallengeCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeChallenge?.status === "completed") {
      setView("complete");
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ["#D4A847", "#F0C85A", "#E8A0B4", "#fff"] });
    } else if (activeChallenge?.status === "active") {
      setView("progress");
    }
  }, [activeChallenge]);

  const handleCreate = async () => {
    const result = await createChallenge();
    if (result) setChallengeCode(result.challenge_code);
  };

  const handleJoin = async () => {
    const { error: err } = await joinChallenge(joinCode);
    if (err) setError(err);
  };

  const shareWhatsApp = () => {
    const text = `Oi! Estou fazendo o Desafio 7 Dias do KIDZZ com meu filho. Você topa com o seu? Os dois ganham 7 dias premium grátis! 🔥\n\nhttps://kidzzapp.lovable.app/?challenge=${challengeCode}`;
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" /> Desafio 7 Dias
          </h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Invite view */}
        {view === "invite" && !challengeCode && (
          <div className="space-y-4">
            <div className="text-center">
              <motion.img
                src={pixelImg}
                alt="Pixel"
                className="w-20 h-20 mx-auto object-contain mb-3"
                style={{ filter: "brightness(1.15) drop-shadow(0 0 12px rgba(100,160,255,0.5))" }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <p className="text-sm font-bold text-gray-700">
                Você está em chamas! 🔥 Que tal desafiar outro pai para 7 dias de conexão juntos?
              </p>
              <p className="text-xs text-gray-500 mt-1">Os dois ganham 7 dias premium grátis!</p>
            </div>

            <motion.button
              onClick={handleCreate}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-black text-sm shadow-lg"
              whileTap={{ scale: 0.97 }}
            >
              Convidar um amigo →
            </motion.button>

            <div className="relative flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] text-gray-400 font-bold">OU</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value); setError(""); }}
                placeholder="Código do desafio"
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-sm font-bold text-gray-700 placeholder:text-gray-400"
              />
              <motion.button
                onClick={handleJoin}
                disabled={!joinCode.trim()}
                className="px-5 py-3 rounded-xl bg-gray-800 text-white text-xs font-bold disabled:opacity-30"
                whileTap={{ scale: 0.95 }}
              >
                Entrar
              </motion.button>
            </div>
            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
          </div>
        )}

        {/* Share code view */}
        {view === "invite" && challengeCode && (
          <div className="space-y-4 text-center">
            <p className="text-sm font-bold text-gray-700">
              Seu código de desafio:
            </p>
            <div className="bg-gray-100 rounded-2xl px-6 py-4">
              <span className="text-2xl font-black text-gray-800 tracking-widest">{challengeCode}</span>
            </div>
            <p className="text-xs text-gray-500">Compartilhe com um amigo para começar!</p>

            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={shareWhatsApp}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white text-xs font-bold"
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle size={16} /> WhatsApp
              </motion.button>
              <motion.button
                onClick={copyLink}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold"
                whileTap={{ scale: 0.95 }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copiado!" : "Copiar link"}
              </motion.button>
            </div>
          </div>
        )}

        {/* Progress view */}
        {view === "progress" && activeChallenge && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 mb-2">Seu progresso</p>
              <div className="flex gap-1.5">
                {(activeChallenge.challenger_progress || []).map((done: boolean, i: number) => (
                  <div key={i} className={`flex-1 h-3 rounded-full ${done ? "bg-green-400" : "bg-gray-200"}`} />
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Você: {challengerDays}/7 dias</p>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 mb-2">Progresso do amigo</p>
              <div className="flex gap-1.5">
                {(activeChallenge.challenged_progress || []).map((done: boolean, i: number) => (
                  <div key={i} className={`flex-1 h-3 rounded-full ${done ? "bg-blue-400" : "bg-gray-200"}`} />
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Amigo: {challengedDays}/7 dias</p>
            </div>

            <p className="text-xs text-gray-500 text-center font-semibold">
              Dia {Math.max(challengerDays, 1)}/7 — Continue fazendo perguntas! 🔥
            </p>
          </div>
        )}

        {/* Complete view */}
        {view === "complete" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">🏆</div>
            <h3 className="text-lg font-black text-gray-800">Desafio Concluído!</h3>
            <p className="text-sm text-gray-600 font-bold">
              Vocês criaram 7 dias de conexão com seus filhos 💛
            </p>
            <div className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
              <Trophy size={16} className="text-yellow-500" />
              <span className="text-xs font-black text-yellow-700">Badge: Família Conectada</span>
            </div>
            <motion.button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gray-800 text-white font-bold text-sm"
              whileTap={{ scale: 0.97 }}
            >
              Voltar
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SevenDayChallenge;
