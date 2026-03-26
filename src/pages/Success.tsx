import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChameleonMascot from "@/components/ChameleonMascot";
import { useAuth } from "@/contexts/AuthContext";
import jungleBg from "@/assets/jungle-bg.jpg";
import { Sparkles } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full bg-kid-yellow/70"
          style={{ width: 6, height: 6, left: `${5 + i * 8}%`, top: `${10 + (i % 4) * 20}%` }}
          animate={{ y: [0, -40, 10, 0], opacity: [0.3, 1, 0.4, 0.3], scale: [1, 1.5, 1] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <ChameleonMascot size="xl" isTalking />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 space-y-3"
        >
          <h1 className="text-4xl font-extrabold text-white drop-shadow-xl">🎉</h1>
          <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">
            Agora o Kidzz é seu amigo completo!
          </h2>
           <p className="text-white/80 text-base max-w-xs mx-auto">
             10 perguntas por dia, voz do Kidzz e personagens desbloqueados!
           </p>
        </motion.div>

        <motion.div
          className="mt-8 space-y-3 w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-4">
            <span className="text-2xl">♾️</span>
            <span className="text-white font-bold text-sm">Perguntas ilimitadas desbloqueadas</span>
          </div>
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-4">
            <span className="text-2xl">🎤</span>
            <span className="text-white font-bold text-sm">Voz do Kidzz ativada</span>
          </div>
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-4">
            <span className="text-2xl">🦎</span>
            <span className="text-white font-bold text-sm">Todos os personagens liberados</span>
          </div>
        </motion.div>

        <motion.button
          onClick={() => navigate("/")}
          className="mt-8 w-full max-w-xs py-5 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg shadow-2xl active:scale-95 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles size={22} />
          Começar a explorar! 🚀
        </motion.button>
      </div>
    </div>
  );
};

export default Success;
