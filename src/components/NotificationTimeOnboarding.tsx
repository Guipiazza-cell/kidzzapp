import { useState } from "react";
import { motion } from "framer-motion";
import ChameleonMascot from "./ChameleonMascot";
import MagicalBackground from "./MagicalBackground";
import { setNotificationTime } from "@/lib/habitLoop";

const QUICK_TIMES = [
  { value: "08:00", label: "08h", emoji: "🌅", hint: "Antes da escola" },
  { value: "14:00", label: "14h", emoji: "☀️", hint: "Depois do almoço" },
  { value: "19:00", label: "19h", emoji: "🌙", hint: "Antes de dormir" },
];

interface Props {
  childName: string;
  onComplete: () => void;
}

const NotificationTimeOnboarding = ({ childName, onComplete }: Props) => {
  const [selected, setSelected] = useState<string>("19:00");
  const [custom, setCustom] = useState("");

  const finalTime = custom || selected;

  const handleConfirm = () => {
    setNotificationTime(finalTime);
    try { localStorage.setItem("kidzz_notification_set", "1"); } catch { /* noop */ }
    onComplete();
  };

  const handleSkip = () => {
    try { localStorage.setItem("kidzz_notification_set", "1"); } catch { /* noop */ }
    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)] relative">
      <MagicalBackground />
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
        >
          <ChameleonMascot size="lg" mood="happy" interactive />
        </motion.div>

        <motion.h1
          className="text-2xl font-black text-gray-900 text-center mt-4 leading-tight"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Que horas combinamos<br />a aventura de hoje? ⏰
        </motion.h1>

        <motion.p
          className="text-gray-600 text-center text-sm mt-2 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Vamos lembrar você todo dia — sem app fechado, {childName} esperando 💛
        </motion.p>

        <div className="w-full max-w-sm mt-6 space-y-3 relative z-20">
          {QUICK_TIMES.map((opt) => {
            const isActive = selected === opt.value && !custom;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setSelected(opt.value); setCustom(""); }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.97] border-2 min-h-[60px] ${
                  isActive
                    ? "bg-white/85 border-kid-orange shadow-lg scale-[1.02]"
                    : "bg-white/50 border-transparent"
                }`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="text-base font-black text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-500 font-bold">{opt.hint}</p>
                </div>
                {isActive && <span className="text-kid-orange font-black text-lg">✓</span>}
              </button>
            );
          })}

          {/* Custom time */}
          <div
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all min-h-[60px] ${
              custom ? "bg-white/85 border-kid-orange shadow-lg" : "bg-white/50 border-transparent"
            }`}
          >
            <span className="text-3xl">⚙️</span>
            <div className="flex-1 text-left">
              <p className="text-base font-black text-gray-900">Personalizado</p>
              <p className="text-xs text-gray-500 font-bold">Escolha o melhor horário</p>
            </div>
            <input
              type="time"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="bg-white/70 rounded-xl px-3 py-2 text-sm font-black text-gray-800 border border-gray-200"
            />
          </div>
        </div>

        <motion.button
          onClick={handleConfirm}
          className="w-full max-w-sm mt-8 py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg shadow-xl active:scale-[0.98] transition-transform"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.97 }}
        >
          Combinado às {finalTime} 🚀
        </motion.button>

        <button
          onClick={handleSkip}
          className="mt-3 text-gray-500 text-xs font-bold underline-offset-2 hover:underline"
        >
          Lembrar depois
        </button>
      </div>
    </div>
  );
};

export default NotificationTimeOnboarding;
