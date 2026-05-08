import { motion } from "framer-motion";
import { Lock, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type LockedFeatureType = "games" | "music" | "stories" | "dreams" | "moments" | "generic";

interface LockedFeatureProps {
  type?: LockedFeatureType;
  title?: string;
  description?: string;
  requiredTier?: "kidzz" | "premium";
  onUpgrade?: () => void;
  compact?: boolean;
  className?: string;
}

const PRESETS: Record<LockedFeatureType, { icon: string; title: string; description: string; tier: "kidzz" | "premium" }> = {
  games: {
    icon: "🎮",
    title: "Jogos KIDZZ Play",
    description: "Desbloqueie todos os jogos para evoluir o avatar do seu filho.",
    tier: "kidzz",
  },
  music: {
    icon: "🎵",
    title: "Floresta Musical",
    description: "Karaokê, dança e histórias cantadas — desbloqueie agora.",
    tier: "premium",
  },
  stories: {
    icon: "📖",
    title: "Fábrica de Histórias",
    description: "Crie histórias mágicas personalizadas todos os dias.",
    tier: "kidzz",
  },
  dreams: {
    icon: "🌙",
    title: "Mundo dos Sonhos",
    description: "Narrações mágicas para uma noite tranquila.",
    tier: "premium",
  },
  moments: {
    icon: "🌟",
    title: "Momentos Especiais",
    description: "Missões de conexão exclusivas para sua família.",
    tier: "premium",
  },
  generic: {
    icon: "✨",
    title: "Recurso Premium",
    description: "Faça upgrade para desbloquear este conteúdo.",
    tier: "kidzz",
  },
};

const LockedFeature = ({
  type = "generic",
  title,
  description,
  requiredTier,
  onUpgrade,
  compact = false,
  className = "",
}: LockedFeatureProps) => {
  const navigate = useNavigate();
  const preset = PRESETS[type];
  const finalTitle = title ?? preset.title;
  const finalDesc = description ?? preset.description;
  const finalTier = requiredTier ?? preset.tier;

  const handleUpgrade = () => {
    if (onUpgrade) onUpgrade();
    else navigate("/?paywall=1");
  };

  const tierLabel = finalTier === "premium" ? "Premium" : "KIDZZ";
  const tierGradient =
    finalTier === "premium"
      ? "from-amber-400 via-orange-400 to-pink-500"
      : "from-kid-purple to-kid-pink";

  if (compact) {
    return (
      <motion.button
        onClick={handleUpgrade}
        whileTap={{ scale: 0.97 }}
        className={`w-full flex items-center gap-3 rounded-2xl p-3 bg-gradient-to-r ${tierGradient} text-white shadow-lg ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
          {preset.icon}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-extrabold truncate">{finalTitle}</p>
          <p className="text-[11px] font-bold text-white/85 truncate">
            Desbloqueie com {tierLabel}
          </p>
        </div>
        <Lock size={18} className="opacity-90 flex-shrink-0" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl glass-card p-6 text-center ${className}`}
    >
      {/* Soft gradient veil */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${tierGradient} opacity-10 pointer-events-none`}
      />

      {/* Lock icon with halo */}
      <motion.div
        className="relative mx-auto w-20 h-20 mb-4"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className={`absolute inset-0 rounded-full blur-2xl bg-gradient-to-br ${tierGradient} opacity-40`}
        />
        <div
          className={`relative w-full h-full rounded-full bg-gradient-to-br ${tierGradient} flex items-center justify-center shadow-xl`}
        >
          <span className="text-3xl">{preset.icon}</span>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
            <Lock size={14} className="text-gray-700" />
          </div>
        </div>
      </motion.div>

      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm mb-2">
        <Crown size={12} className="text-amber-500" />
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-700">
          Plano {tierLabel}
        </span>
      </div>

      <h3 className="text-lg font-black text-gray-800 leading-tight">{finalTitle}</h3>
      <p className="text-sm text-gray-600 font-semibold mt-2 max-w-xs mx-auto leading-relaxed">
        {finalDesc}
      </p>

      <motion.button
        onClick={handleUpgrade}
        whileTap={{ scale: 0.97 }}
        className={`mt-5 w-full max-w-xs mx-auto py-3.5 rounded-2xl bg-gradient-to-r ${tierGradient} text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2`}
      >
        <Sparkles size={16} />
        Fazer upgrade agora
      </motion.button>

      <p className="text-[10px] text-gray-500 font-bold mt-3">
        🛡️ 7 dias de garantia · Cancele quando quiser
      </p>
    </motion.div>
  );
};

export default LockedFeature;
