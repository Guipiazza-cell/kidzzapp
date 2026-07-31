/**
 * LockedFeature - paywall padrão premium (liquid glass)
 * Usado em Brincar / Jogos e outros recursos bloqueados.
 */
import { motion } from "framer-motion";
import { Lock, Sparkles, Crown, Check, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

export type LockedFeatureType =
  | "game"
  | "games"
  | "music"
  | "stories"
  | "dreams"
  | "moments"
  | "generic";

interface LockedFeatureProps {
  type?: LockedFeatureType;
  title?: string;
  description?: string;
  requiredTier?: "kidzz" | "premium";
  onUpgrade?: () => void;
  compact?: boolean;
  className?: string;
}

const PRESETS: Record<
  LockedFeatureType,
  { title: string; description: string; tier: "kidzz" | "premium"; benefits: string[] }
> = {
  game: {
    title: "Jogos KIDZZ Play",
    description: "Desbloqueie todos os jogos e desafie a família com diversão saudável.",
    tier: "kidzz",
    benefits: [
      "Todos os jogos liberados",
      "Desafios novos toda semana",
      "Progresso e pontos da sessão",
    ],
  },
  games: {
    title: "Jogos KIDZZ Play",
    description: "Desbloqueie todos os jogos e desafie a família com diversão saudável.",
    tier: "kidzz",
    benefits: [
      "Todos os jogos liberados",
      "Desafios novos toda semana",
      "Progresso e pontos da sessão",
    ],
  },
  music: {
    title: "Floresta Musical",
    description: "Karaokê, dança e histórias cantadas para a família.",
    tier: "premium",
    benefits: ["Músicas e trilhas exclusivas", "Modo dança e karaokê", "Atualizações semanais"],
  },
  stories: {
    title: "Fábrica de Histórias",
    description: "Crie histórias mágicas personalizadas com o nome do seu filho.",
    tier: "kidzz",
    benefits: ["Histórias sob medida", "Narração suave", "Mais criações por dia"],
  },
  dreams: {
    title: "Mundo dos Sonhos",
    description: "Sons e histórias calmas para uma noite tranquila.",
    tier: "premium",
    benefits: ["Histórias para dormir", "Sons ambiente", "Rotina de sono leve"],
  },
  moments: {
    title: "Momentos Especiais",
    description: "Missões de conexão exclusivas para a sua família.",
    tier: "premium",
    benefits: ["Missões em família", "Ideias prontas", "Memórias que ficam"],
  },
  generic: {
    title: "Recurso Premium",
    description: "Faça upgrade para desbloquear este conteúdo.",
    tier: "kidzz",
    benefits: ["Conteúdo completo", "Sem anúncios", "Cancele quando quiser"],
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
  const preset = PRESETS[type] ?? PRESETS.generic;
  const finalTitle = title ?? preset.title;
  const finalDesc = description ?? preset.description;
  const finalTier = requiredTier ?? preset.tier;
  const benefits = preset.benefits;

  const handleUpgrade = () => {
    haptic("medium");
    sfx("unlock");
    if (onUpgrade) onUpgrade();
    else {
      window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
      if (window.location.pathname !== "/") navigate("/?paywall=1");
    }
  };

  const isPremiumTier = finalTier === "premium";
  const tierLabel = isPremiumTier ? "Premium" : "KIDZZ";
  const ctaGradient = isPremiumTier
    ? "linear-gradient(135deg, #F5C14A 0%, #E8821A 55%, #D06A10 100%)"
    : "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 48%, #EC4899 100%)";
  const glow = isPremiumTier
    ? "rgba(232,130,26,0.35)"
    : "rgba(139,92,246,0.35)";

  if (compact) {
    return (
      <motion.button
        type="button"
        onClick={handleUpgrade}
        whileTap={{ scale: 0.97 }}
        className={`w-full flex items-center gap-3 rounded-2xl p-3.5 text-white ${className}`}
        style={{
          background: ctaGradient,
          boxShadow: `0 10px 28px ${glow}`,
          border: "1px solid rgba(255,255,255,0.35)",
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-none"
          style={{ background: "rgba(255,255,255,0.2)" }}
        >
          <Lock size={18} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-extrabold truncate">{finalTitle}</p>
          <p className="text-[11px] font-bold text-white/85 truncate">
            Desbloqueie com {tierLabel}
          </p>
        </div>
        <Crown size={18} className="opacity-95 flex-shrink-0" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={`relative overflow-hidden rounded-[28px] text-center ${className}`}
      style={{
        background:
          "linear-gradient(165deg, rgba(255,255,255,0.92) 0%, rgba(252,248,255,0.88) 45%, rgba(245,240,255,0.9) 100%)",
        border: "0.5px solid rgba(255,255,255,0.95)",
        boxShadow:
          "0 24px 48px rgba(40,20,80,0.22), 0 8px 20px rgba(40,20,80,0.1), inset 0 1.5px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        padding: "28px 22px 22px",
      }}
    >
      {/* véu de cor suave */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: isPremiumTier
            ? "radial-gradient(70% 50% at 50% 0%, rgba(255,200,120,0.28), transparent 70%)"
            : "radial-gradient(70% 50% at 50% 0%, rgba(180,140,255,0.28), transparent 70%)",
        }}
      />

      {/* ícone central */}
      <div className="relative mx-auto mb-4" style={{ width: 88, height: 88 }}>
        <div
          aria-hidden
          className="absolute inset-[-10px] rounded-full"
          style={{
            background: isPremiumTier
              ? "radial-gradient(circle, rgba(245,193,74,0.45), transparent 70%)"
              : "radial-gradient(circle, rgba(167,139,250,0.5), transparent 70%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="relative w-full h-full rounded-[26px] flex items-center justify-center"
          style={{
            background: ctaGradient,
            boxShadow: `0 14px 28px ${glow}, inset 0 1.5px 0 rgba(255,255,255,0.55)`,
            border: "1px solid rgba(255,255,255,0.45)",
          }}
        >
          <Lock size={32} color="#fff" strokeWidth={2.2} />
        </div>
        <div
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "#fff",
            boxShadow: "0 4px 12px rgba(40,20,60,0.16)",
            border: "1px solid rgba(40,20,60,0.06)",
          }}
        >
          <Crown size={14} className="text-amber-500" />
        </div>
      </div>

      <div
        className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
        style={{
          background: "rgba(255,255,255,0.75)",
          border: "0.5px solid rgba(180,140,255,0.25)",
          boxShadow: "0 2px 8px rgba(80,50,140,0.06)",
        }}
      >
        <Crown size={12} className="text-amber-500" />
        <span
          className="text-[10px] font-black uppercase tracking-[0.14em]"
          style={{ color: isPremiumTier ? "#9A5A10" : "#5B3FA0" }}
        >
          Plano {tierLabel}
        </span>
      </div>

      <h3
        className="relative text-[20px] font-black leading-tight"
        style={{ color: "#1F1830", fontFamily: "'Nunito', system-ui, sans-serif" }}
      >
        {finalTitle}
      </h3>
      <p
        className="relative text-[13.5px] font-semibold mt-2 max-w-[280px] mx-auto leading-relaxed"
        style={{ color: "rgba(45,40,70,0.72)" }}
      >
        {finalDesc}
      </p>

      <ul className="relative mt-4 text-left max-w-[280px] mx-auto space-y-2">
        {benefits.map((b) => (
          <li key={b} className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center flex-none"
              style={{
                background: isPremiumTier
                  ? "rgba(232,130,26,0.14)"
                  : "rgba(139,92,246,0.14)",
              }}
            >
              <Check
                size={12}
                strokeWidth={3}
                style={{ color: isPremiumTier ? "#E8821A" : "#7C3AED" }}
              />
            </span>
            <span className="text-[12.5px] font-bold" style={{ color: "#2A2540" }}>
              {b}
            </span>
          </li>
        ))}
      </ul>

      <motion.button
        type="button"
        onClick={handleUpgrade}
        whileTap={{ scale: 0.97 }}
        className="relative mt-5 w-full max-w-[280px] mx-auto py-3.5 rounded-full font-extrabold text-[14px] text-white flex items-center justify-center gap-2"
        style={{
          background: ctaGradient,
          boxShadow: `0 12px 28px ${glow}, inset 0 1px 0 rgba(255,255,255,0.4)`,
          border: "1px solid rgba(255,255,255,0.4)",
        }}
      >
        <Sparkles size={16} />
        Fazer upgrade agora
      </motion.button>

      <p
        className="relative mt-3 text-[11px] font-bold flex items-center justify-center gap-1.5"
        style={{ color: "rgba(60,50,80,0.5)" }}
      >
        <Shield size={12} />
        Pagamento seguro · Cancele quando quiser
      </p>
    </motion.div>
  );
};

export default LockedFeature;
