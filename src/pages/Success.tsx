import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";
import MagicalBackground from "@/components/MagicalBackground";
import pixelImg from "@/assets/pixel-chameleon.png";
import aneImg from "@/assets/ane-chameleon.png";

const Success = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />

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
        <div className="flex items-end gap-4">
          <motion.img
            src={aneImg}
            alt="Ane"
            className="w-16 h-16 object-contain drop-shadow-xl"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
            transition={{ type: "spring", stiffness: 200 }}
          />
          <motion.img
            src={pixelImg}
            alt="Pixel"
            className="w-20 h-20 object-contain drop-shadow-xl"
            initial={{ scale: 0, rotate: 20 }}
            animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 space-y-3"
        >
          <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-sm">🎉</h1>
          <h2 className="text-2xl font-extrabold text-gray-800 drop-shadow-sm">
            Agora o Kidzz é seu amigo completo!
          </h2>
          <p className="text-gray-600 text-base max-w-xs mx-auto">
            10 perguntas por dia, voz do Kidzz e personagens desbloqueados!
          </p>
        </motion.div>

        <motion.div
          className="mt-8 space-y-3 w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[
            { emoji: "💬", text: "10 perguntas por dia desbloqueadas" },
            { emoji: "🎤", text: "Voz do Kidzz ativada" },
            { emoji: "🦎", text: "Todos os personagens liberados" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 glass-card rounded-2xl p-4">
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-gray-700 font-bold text-sm">{item.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.button
          onClick={() => navigate("/")}
          className="mt-8 w-full max-w-xs py-5 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-pink text-white font-extrabold text-lg shadow-2xl active:scale-95 flex items-center justify-center gap-2"
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
