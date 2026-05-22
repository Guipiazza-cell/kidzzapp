import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { getConnection, connectionLabel } from "@/lib/connection";

/**
 * Termômetro de Conexão Familiar — orb vivo com score 0-100.
 * Liga-se ao evento `kidzz:connection-updated` para refletir incrementos em tempo real.
 */
const ConnectionMeter = () => {
  const [state, setState] = useState(() => getConnection());

  useEffect(() => {
    const sync = () => setState(getConnection());
    window.addEventListener("kidzz:connection-updated", sync);
    const iv = setInterval(sync, 60_000); // recalcula decaimento de minuto em minuto
    return () => {
      window.removeEventListener("kidzz:connection-updated", sync);
      clearInterval(iv);
    };
  }, []);

  const { tag, msg, tint } = connectionLabel(state.score);
  const pct = Math.max(0, Math.min(100, state.score));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <motion.div
      className="w-full max-w-sm relative rounded-[24px] overflow-hidden flex items-center gap-4 px-4 py-3.5"
      style={{
        background:
          "linear-gradient(135deg, hsl(0 0% 100% / 0.88) 0%, hsl(85 35% 96% / 0.85) 100%)",
        border: "1px solid hsl(0 0% 100% / 0.75)",
        backdropFilter: "blur(18px)",
        boxShadow: `0 12px 30px -18px ${tint.replace(")", " / 0.4)")}`,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.08 }}
    >
      {/* Living glow tied to tint */}
      <motion.div
        aria-hidden
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${tint.replace(")", " / 0.35)")}, transparent 70%)`, filter: "blur(6px)" }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ring */}
      <div className="relative w-[88px] h-[88px] flex-shrink-0">
        <svg width="88" height="88" viewBox="0 0 88 88" className="rotate-[-90deg]">
          <circle cx="44" cy="44" r={radius} stroke="hsl(0 0% 90%)" strokeWidth="6" fill="none" />
          <motion.circle
            cx="44" cy="44" r={radius}
            stroke={tint}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${tint.replace(")", " / 0.5)")})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-[22px] font-black leading-none"
            style={{ color: "hsl(var(--premium-ink))", fontFamily: "Nunito, system-ui" }}
            key={pct}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {pct}
          </motion.span>
          <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5" style={{ color: tint }}>
            elo
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Sparkles size={11} style={{ color: tint }} />
          <p
            className="text-[10px] font-black uppercase tracking-[0.16em]"
            style={{ color: tint }}
          >
            {tag}
          </p>
        </div>
        <p
          className="text-[14px] font-black leading-snug"
          style={{ color: "hsl(var(--premium-ink))" }}
        >
          {msg}
        </p>
        {state.streakDays > 0 && (
          <div
            className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              background: "hsl(20 80% 95%)",
              color: "hsl(20 80% 40%)",
              border: "1px solid hsl(20 80% 85%)",
            }}
          >
            <Flame size={9} /> {state.streakDays} {state.streakDays === 1 ? "dia" : "dias"} seguidos
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ConnectionMeter;
