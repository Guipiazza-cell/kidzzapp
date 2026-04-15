import { useState } from "react";
import { motion } from "framer-motion";
import ChameleonMascot from "./ChameleonMascot";
import { useAuth } from "@/contexts/AuthContext";
import MagicalBackground from "./MagicalBackground";

const NameOnboarding = () => {
  const { updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Digite um nome para continuar 😊");
      return;
    }
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      await updateProfile({ child_name: trimmed });
      setTimeout(() => setSaving(false), 3000);
    } catch (e) {
      console.error("NameOnboarding: updateProfile error", e);
      setError("Algo deu errado. Tente novamente!");
      setSaving(false);
    }
  };

  const mascotMood = saving ? "happy" : name.trim() ? "curious" : "idle";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)] relative">
      <MagicalBackground />
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
        >
          <ChameleonMascot size="xl" mood={mascotMood} interactive />
        </motion.div>

        <motion.h1
          className="text-2xl font-black text-gray-900 text-center mt-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Olá, eu sou o Kidzz! 🦎
        </motion.h1>

        <motion.p
          className="text-gray-600 text-center text-base mt-2 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Qual é o nome do explorador?
        </motion.p>

        <motion.div
          className="w-full max-w-sm mt-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Digite o nome aqui ✨"
              className="w-full py-4 px-6 rounded-2xl glass-card text-gray-900 text-lg font-bold text-center placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-kid-orange/40 transition-all"
              autoFocus
              maxLength={20}
            />
            {name.trim() && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  boxShadow: "0 0 20px hsl(var(--kid-yellow) / 0.15), inset 0 0 10px hsl(var(--kid-yellow) / 0.05)",
                }}
              />
            )}
          </div>

          {error && (
            <motion.p
              className="text-kid-orange text-center text-sm font-bold"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg shadow-xl disabled:opacity-50 active:scale-[0.98] transition-transform relative overflow-hidden"
            whileTap={{ scale: 0.97 }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-2xl"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative z-10">
              {saving ? "Entrando... ⏳" : name.trim() ? `Vamos lá, ${name.trim()}! 🚀` : "Escreva o nome 📝"}
            </span>
          </motion.button>
        </motion.div>

        <motion.p
          className="text-gray-500 text-[10px] mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          🔒 Seguro e feito para crianças • Sem anúncios
        </motion.p>
      </div>
    </div>
  );
};

export default NameOnboarding;
