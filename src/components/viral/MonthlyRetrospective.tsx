import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Copy, Check, Share2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import pixelImg from "@/assets/pixel-chameleon.webp";
import ShareableRetroCard from "./ShareableRetroCard";
import { captureAndShare } from "@/lib/viralShare";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  stats?: {
    questions: number;
    stories: number;
    missions: number;
    achievements: number;
    maxStreak: number;
    topQuestion?: string;
  };
}

const MonthlyRetrospective = ({ onClose, stats }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthName = prevMonth.toLocaleDateString("pt-BR", { month: "long" });
  const year = prevMonth.getFullYear();

  const s = stats || {
    questions: parseInt(localStorage.getItem("kidzz_total_questions") || "0", 10) || (profile?.questions_used ?? 0),
    stories: parseInt(localStorage.getItem("kidzz_total_stories") || "0", 10) || (profile?.stories_used ?? 0),
    missions: 0,
    achievements: 0,
    maxStreak: parseInt(localStorage.getItem("kidzz_max_streak") || "0", 10) || (profile?.streak_days ?? 0),
    topQuestion: "Por que o céu muda de cor?",
  };

  const shareText = `${childName} em ${monthName} de ${year}: ${s.questions} perguntas, ${s.stories} histórias, streak de ${s.maxStreak} dias! 🔥 Nosso mês em família 💛 #KIDZZ`;

  const shareImage = async () => {
    if (!shareCardRef.current || sharing) return;
    setSharing(true);
    try {
      const ok = await captureAndShare(shareCardRef.current, {
        title: `Retrospectiva ${monthName} - ${childName}`,
        text: shareText,
        filename: `kidzz-retrospectiva-${monthName.toLowerCase()}.png`,
      });
      if (ok) toast.success("Retrospectiva compartilhada! ✨");
    } catch {
      toast.error("Não foi possível compartilhar agora");
    } finally {
      setSharing(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Visual card */}
        <div
          className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-6 text-white relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Retrospectiva</p>
                <h2 className="text-lg font-black capitalize">
                  {monthName} {year}
                </h2>
              </div>
              <img
                src={pixelImg}
                alt="Pixel"
                className="w-12 h-12 object-contain"
                style={{ filter: "brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,0.3))" }}
              />
            </div>

            <p className="text-sm font-bold text-white/80 mb-4">
              📊 {childName} em {monthName}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatItem emoji="🔥" value={s.maxStreak} label="Streak máximo" />
              <StatItem emoji="💬" value={s.questions} label="Perguntas" />
              <StatItem emoji="📖" value={s.stories} label="Histórias" />
              <StatItem emoji="🏆" value={s.achievements} label="Conquistas" />
            </div>

            {/* Top question */}
            {s.topQuestion && (
              <div className="bg-white/15 rounded-xl p-3 mb-3">
                <p className="text-[10px] font-bold text-white/60 mb-1">Top pergunta do mês ✨</p>
                <p className="text-xs font-bold text-white leading-relaxed">"{s.topQuestion}"</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-white/40 font-semibold">
                Crie memórias que duram. KIDZZ App 💛
              </p>
              <span className="text-[10px] font-black text-white/50">KIDZZ</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <motion.button
            onClick={shareImage}
            disabled={sharing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm disabled:opacity-60"
            whileTap={{ scale: 0.97 }}
          >
            {sharing ? (
              <><Loader2 size={18} className="animate-spin" /> Gerando imagem...</>
            ) : (
              <><Share2 size={18} /> 📤 Compartilhar imagem</>
            )}
          </motion.button>

          <motion.button
            onClick={copyText}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm"
            whileTap={{ scale: 0.97 }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copiado!" : "Copiar texto"}
          </motion.button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-bold text-gray-400 text-center"
          >
            Fechar
          </button>
        </div>
      </motion.div>

      {/* Off-screen capture target */}
      <div
        style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none" }}
        aria-hidden
      >
        <ShareableRetroCard
          ref={shareCardRef}
          childName={childName}
          monthName={monthName}
          year={year}
          questions={s.questions}
          stories={s.stories}
          maxStreak={s.maxStreak}
        />
      </div>
    </motion.div>
  );
};

const StatItem = ({ emoji, value, label }: { emoji: string; value: number; label: string }) => (
  <div className="bg-white/10 rounded-xl p-2.5 text-center">
    <span className="text-sm">{emoji}</span>
    <p className="text-lg font-black">{value}</p>
    <p className="text-[9px] font-bold text-white/60">{label}</p>
  </div>
);

export default MonthlyRetrospective;
