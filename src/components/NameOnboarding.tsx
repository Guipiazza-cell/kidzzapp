import { useState } from "react";
import { motion } from "framer-motion";
import ChameleonMascot from "./ChameleonMascot";
import { useAuth } from "@/contexts/AuthContext";
import jungleBg from "@/assets/jungle-bg.jpg";

const NameOnboarding = () => {
  const { updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await updateProfile({ child_name: name.trim() });
    } catch (e) {
      console.error("NameOnboarding: updateProfile error", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {[...Array(8)].map((_, i) =>
      <motion.div
        key={i}
        className="fixed rounded-full bg-kid-yellow/60"
        style={{ width: 5, height: 5, left: `${10 + i * 11}%`, top: `${15 + i % 4 * 20}%` }}
        animate={{ y: [0, -25, 10, 0], opacity: [0.2, 0.9, 0.3, 0.2] }}
        transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }} />

      )}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}>
          
          <ChameleonMascot size="xl" />
        </motion.div>

        <motion.h1
          className="text-3xl font-extrabold text-white text-center mt-4 drop-shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}>Olá, eu sou o Kidzz! 


        </motion.h1>

        <motion.p
          className="text-white/80 text-center text-lg mt-2 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}>Qual é o seu nome, explorador? 


        </motion.p>

        <motion.div
          className="w-full max-w-sm mt-8 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}>
          
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Digite seu nome aqui 🌟"
            className="w-full py-5 px-6 rounded-3xl bg-white/15 backdrop-blur-xl border-2 border-white/30 text-white text-xl font-bold text-center placeholder:text-white/40 focus:outline-none focus:border-kid-yellow focus:ring-4 focus:ring-kid-yellow/30 shadow-2xl transition-all"
            autoFocus
            maxLength={20} />
          

          <motion.button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="w-full py-5 rounded-3xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-xl shadow-2xl hover:shadow-[0_0_40px_hsl(var(--kid-orange)/0.5)] transition-all disabled:opacity-30 active:scale-95"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            
            {name.trim() ? `Vamos lá, ${name.trim()}! 🚀` : "Escreva seu nome 📝"}
          </motion.button>
        </motion.div>

        <motion.p
          className="text-white/40 text-xs mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}>
          
          🔒 Seguro e feito para crianças
        </motion.p>
      </div>
    </div>);

};

export default NameOnboarding;