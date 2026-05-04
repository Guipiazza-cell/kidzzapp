import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLevelInfo, type LevelInfo } from "@/lib/levelSystem";

const tierColor: Record<LevelInfo["tier"], string> = {
  spark: "from-amber-400 to-orange-500",
  glow: "from-pink-400 to-purple-500",
  aura: "from-sky-400 to-indigo-500",
  energy: "from-emerald-400 to-cyan-400",
};

interface Props {
  compact?: boolean;
}

export default function LevelProgressBar({ compact }: Props) {
  const [info, setInfo] = useState<LevelInfo>(() => getLevelInfo());

  useEffect(() => {
    const refresh = () => setInfo(getLevelInfo());
    window.addEventListener("kidzz:xp-gained", refresh);
    window.addEventListener("kidzz:level-up", refresh);
    const iv = setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("kidzz:xp-gained", refresh);
      window.removeEventListener("kidzz:level-up", refresh);
      clearInterval(iv);
    };
  }, []);

  const open = () => {
    try {
      window.dispatchEvent(new CustomEvent("kidzz:open-journey"));
    } catch {
      /* noop */
    }
  };

  return (
    <motion.button
      type="button"
      onClick={open}
      whileTap={{ scale: 0.97 }}
      className={`w-full max-w-sm rounded-2xl glass-card px-3 py-2 text-left ${
        compact ? "" : "mb-2"
      }`}
      aria-label={`Ver sua jornada — nível ${info.level}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-black text-gray-800">
          Nível {info.level} <span className="text-gray-500">— {info.title}</span>
        </span>
        <span className="text-[10px] font-extrabold text-gray-600">
          {info.xpInLevel}/{info.xpForNext} XP →
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-gray-200/70 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${tierColor[info.tier]}`}
          initial={false}
          animate={{ width: `${info.progress * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
        <motion.div
          className="absolute inset-0 bg-white/30"
          animate={{ x: ["-100%", "120%"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.button>
  );
}
