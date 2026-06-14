import { motion } from "framer-motion";
import { Moon, Sparkles } from "lucide-react";
import ChameleonMascot from "@/components/ChameleonMascot";
import { useAuth } from "@/contexts/AuthContext";
import type { QuotaTipo } from "@/lib/plans";

interface QuotaReachedCardProps {
  tipo: QuotaTipo;
  isFree: boolean;
  onUpgrade?: () => void;
  onAck?: () => void;
}

/**
 * Card carinhoso quando o teto diário é atingido.
 * - FREE → convite suave ao paywall.
 * - PAGO → "Kidzz sonolento", sem mencionar limites/números.
 */
const QuotaReachedCard = ({ tipo, isFree, onUpgrade, onAck }: QuotaReachedCardProps) => {
  const { profile } = useAuth();
  const nome = profile?.child_name?.trim() || "seu pequeno";

  if (isFree) {
    const titulo =
      tipo === "historias"
        ? "Quer mais histórias com o Kidzz? ✨"
        : "Quer perguntar à vontade? ✨";
    const corpo =
      tipo === "historias"
        ? `O ${nome} e o Kidzz já viveram uma aventura hoje. No plano completo, vocês podem viver várias todos os dias.`
        : `O ${nome} é curioso! Com o plano completo, ele pergunta tudo o que quiser, sempre que quiser.`;

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-sm mx-auto p-6 rounded-3xl glass-card text-center space-y-4"
      >
        <ChameleonMascot size="md" className="mx-auto" mood="happy" />
        <h3 className="text-lg font-extrabold text-gray-800">{titulo}</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{corpo}</p>
        <button
          onClick={onUpgrade}
          className="w-full min-h-[56px] rounded-2xl kid-gradient-premium text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Sparkles size={18} />
          Conhecer os planos
        </button>
      </motion.div>
    );
  }

  // PAGO — Kidzz sonolento, totalmente invisível quanto a números
  const titulo =
    tipo === "historias"
      ? "Quantas histórias hoje! 🌙"
      : "Quanta curiosidade hoje! ✨";
  const corpo =
    tipo === "historias"
      ? `O Kidzz já contou muitas aventuras pro ${nome} e está ficando com sono. Que tal guardar um pouquinho de magia pra amanhã? Amanhã tem mais esperando ✨`
      : `O Kidzz respondeu muitas perguntas do ${nome} hoje e está descansando um pouquinho. Amanhã tem mais magia esperando ✨`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative max-w-sm mx-auto p-6 rounded-3xl glass-card text-center space-y-4"
    >
      <div className="relative mx-auto w-fit">
        <ChameleonMascot size="md" mood="thinking" />
        <Moon size={20} className="absolute -top-1 -right-1 text-kid-purple" />
      </div>
      <h3 className="text-lg font-extrabold text-gray-800">{titulo}</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{corpo}</p>
      <button
        onClick={onAck}
        className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-kid-purple to-kid-pink text-white font-extrabold text-base shadow-xl active:scale-[0.98] transition-transform"
      >
        Combinado!
      </button>
    </motion.div>
  );
};

export default QuotaReachedCard;
