import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import ChameleonMascot from "@/components/ChameleonMascot";
import { useAuth } from "@/contexts/AuthContext";
import { planLabel, type Area } from "@/lib/plans";
import { useEntitlement } from "@/hooks/useEntitlement";

interface LockedCardProps {
  area: Area;
  onUpgrade: () => void;
  className?: string;
}

/**
 * Card de cadeado padrão exibido quando uma área está travada para o plano atual.
 * Tom convidativo, nunca punitivo.
 */
const LockedCard = ({ area, onUpgrade, className = "" }: LockedCardProps) => {
  const { profile } = useAuth();
  const { gateInfo } = useEntitlement();
  const { minPlan } = gateInfo(area);
  const nome = profile?.child_name?.trim() || "seu pequeno";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative max-w-sm mx-auto p-6 rounded-3xl glass-card text-center space-y-4 ${className}`}
    >
      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-kid-purple/90 flex items-center justify-center shadow-lg">
        <Lock size={18} className="text-white" />
      </div>

      <ChameleonMascot size="md" className="mx-auto" mood="happy" />

      <div className="space-y-2">
        <h3 className="text-lg font-extrabold text-gray-800 leading-snug">
          Essa parte é do plano {planLabel(minPlan)}
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Que tal dar ao <span className="font-bold">{nome}</span> a experiência completa? ✨
        </p>
      </div>

      <button
        onClick={onUpgrade}
        className="w-full min-h-[56px] rounded-2xl kid-gradient-premium text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Sparkles size={18} />
        Ver planos
      </button>
    </motion.div>
  );
};

export default LockedCard;
