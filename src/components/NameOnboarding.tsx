import { useState } from "react";
import { motion } from "framer-motion";
import ChameleonMascot from "./ChameleonMascot";
import { useAuth } from "@/contexts/AuthContext";
import jungleBg from "@/assets/jungle-bg.jpg";

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
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Fireflies */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full"
          style={{
            width: 3 + Math.random() * 4,
            height: 3 + Math.random() * 4,
            left: `${5 + i * 9}%`,
            top: `${10 + (i % 5) * 18}%`,
            background: i % 2 === 0
              ? "hsl(var(--kid-yellow))"
              : "hsl(var(--kid-green))",
            boxShadow: `0 0 ${6 + i * 2}px ${i % 2 === 0 ? "hsl(var(--kid-yellow) / 0.6)" : "hsl(var(--kid-green) / 0.5)"}`,
          }}
          animate={{
            y: [0, -30, 15, 0],
            x: [0, 10 * (i % 2 === 0 ? 1 : -1), 0],
            opacity: [0.1, 0.9, 0.3, 0.1],
          }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
        >
          <ChameleonMascot size="xl" mood={mascotMood} interactive />
        </motion.div>

        {/* Greeting with character-by-character reveal */}
        <motion.h1
          className="text-3xl font-extrabold text-white text-center mt-4 drop-shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {"Olá, eu sou o Kidzz!".split("").map((c, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.04 }}
              className="inline-block"
              style={c === " " ? { width: "0.25em" } : undefined}
            >
              {c === " " ? "\u00A0" : c}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="text-white/80 text-center text-lg mt-2 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Qual é o seu nome, explorador?
        </motion.p>

        <motion.div
          className="w-full max-w-sm mt-8 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
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
              placeholder="Digite seu nome aqui 🌟"
              className="w-full py-5 px-6 rounded-3xl bg-white/15 backdrop-blur-xl border-2 border-white/30 text-white text-xl font-bold text-center placeholder:text-white/40 focus:outline-none focus:border-kid-yellow focus:ring-4 focus:ring-kid-yellow/30 shadow-2xl transition-all"
              autoFocus
              maxLength={20}
            />
            {/* Glow effect when typing */}
            {name.trim() && (
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  boxShadow: "0 0 25px hsl(var(--kid-yellow) / 0.3), inset 0 0 15px hsl(var(--kid-yellow) / 0.1)",
                }}
              />
            )}
          </div>

          {error && (
            <motion.p
              className="text-kid-yellow text-center text-sm font-bold"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-5 rounded-3xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-xl shadow-2xl hover:shadow-[0_0_40px_hsl(var(--kid-orange)/0.5)] transition-all disabled:opacity-50 active:scale-95 relative overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-3xl"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative z-10">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⏳
                  </motion.span>
                  Entrando...
                </span>
              ) : name.trim() ? (
                `Vamos lá, ${name.trim()}! 🚀`
              ) : (
                "Escreva seu nome 📝"
              )}
            </span>
          </motion.button>
        </motion.div>

        <motion.p
          className="text-white/40 text-xs mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          🔒 Seguro e feito para crianças
        </motion.p>
      </div>
    </div>
  );
};

export default NameOnboarding;
