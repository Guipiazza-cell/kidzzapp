import { motion } from "framer-motion";
import { Sparkles, MessageCircle, Volume2, Crown } from "lucide-react";
import ChameleonMascot from "./ChameleonMascot";

interface ConversionScreenProps {
  childName: string;
  onSubscribe: () => void;
  loading?: boolean;
}

const ConversionScreen = ({ childName, onSubscribe, loading }: ConversionScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 space-y-5"
    >
      <div className="text-center">
        <ChameleonMascot size="md" className="mx-auto" />
        <motion.h2
          className="text-2xl font-extrabold text-white mt-3 drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {childName} adorou conversar com o Kidzz 💛
        </motion.h2>
        <motion.p
          className="text-white/70 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Desbloqueie tudo e continue aprendendo sem limites
        </motion.p>
      </div>

      <motion.div
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 space-y-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-2 justify-center">
          <Crown className="text-kid-yellow" size={22} />
          <h3 className="text-lg font-extrabold text-white">Plano Premium</h3>
        </div>

        <div className="space-y-3">
          {[
            { icon: MessageCircle, text: "Perguntas ilimitadas", highlight: true },
            { icon: Volume2, text: "Voz do Kidzz (fala como um amigo)" },
            { icon: Crown, text: "Todos os personagens desbloqueados" },
            { icon: Sparkles, text: "Experiência completa" },
          ].map(({ icon: Icon, text, highlight }, i) => (
            <motion.div
              key={text}
              className={`flex items-center gap-3 p-3 rounded-2xl ${
                highlight ? "bg-kid-orange/20 border border-kid-orange/30" : "bg-white/5"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              <Icon size={20} className={highlight ? "text-kid-orange" : "text-white/70"} />
              <span className={`font-bold text-sm ${highlight ? "text-white" : "text-white/80"}`}>
                {text}
              </span>
              {highlight && (
                <span className="ml-auto text-[10px] font-extrabold bg-kid-orange text-white px-2 py-0.5 rounded-full">
                  PRINCIPAL
                </span>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gradient-to-r from-kid-orange to-kid-yellow rounded-2xl p-5 text-center shadow-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <p className="text-4xl font-extrabold text-white drop-shadow-lg">
            R$ 14,90<span className="text-base font-bold opacity-80">/mês</span>
          </p>
          <p className="text-white/90 text-xs mt-1 font-bold">7 dias grátis para testar! 🎉</p>
        </motion.div>

        <motion.button
          onClick={onSubscribe}
          disabled={loading}
          className="w-full py-5 rounded-2xl kid-gradient-premium text-white font-extrabold text-lg shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Sparkles size={22} />
          {loading ? "Abrindo..." : "Quero liberar tudo agora 🚀"}
        </motion.button>

        <p className="text-white/40 text-[10px] text-center">
          Cancele quando quiser. Sem compromisso.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ConversionScreen;
