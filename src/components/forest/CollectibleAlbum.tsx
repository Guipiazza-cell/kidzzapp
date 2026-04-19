import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { COLLECTIBLES, getUnlockedCollectibles } from "./forestCollectibles";

interface Props {
  refreshKey?: number;
}

const CollectibleAlbum = ({ refreshKey }: Props) => {
  const unlocked = getUnlockedCollectibles();
  const total = COLLECTIBLES.length;
  const progress = unlocked.length;

  return (
    <div className="rounded-3xl p-4 backdrop-blur-md border border-white/15"
      style={{ background: "linear-gradient(180deg, hsl(280 40% 20% / 0.5), hsl(220 40% 14% / 0.5))" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-extrabold uppercase tracking-wider">Álbum Mágico</h3>
        <span className="text-amber-300 text-xs font-bold">{progress}/{total}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/10 mb-4 overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: "linear-gradient(90deg, hsl(45 95% 60%), hsl(340 85% 60%))" }}
          initial={{ width: 0 }}
          animate={{ width: `${(progress / total) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3" key={refreshKey}>
        {COLLECTIBLES.map((c, i) => {
          const isUnlocked = unlocked.includes(c.id);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative rounded-2xl p-3 overflow-hidden border border-white/15"
              style={{
                background: isUnlocked
                  ? `linear-gradient(135deg, ${c.glow}, hsl(220 40% 14% / 0.7))`
                  : "linear-gradient(135deg, hsl(220 30% 18% / 0.6), hsl(220 35% 10% / 0.7))",
              }}
            >
              {isUnlocked && (
                <motion.div
                  className="absolute inset-0 opacity-40"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${c.glow}, transparent 60%)` }}
                  animate={{ opacity: [0.3, 0.55, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center text-center gap-1">
                <motion.div
                  className="text-3xl"
                  style={{ filter: isUnlocked ? "none" : "grayscale(1) brightness(0.4)" }}
                  animate={isUnlocked ? { rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                >
                  {isUnlocked ? c.emoji : <Lock className="w-7 h-7 text-white/30" />}
                </motion.div>
                <p className={`text-[11px] font-extrabold leading-tight ${isUnlocked ? "text-white" : "text-white/40"}`}>
                  {isUnlocked ? c.name : "???"}
                </p>
                <p className="text-[9px] font-semibold text-white/50 leading-tight">
                  {isUnlocked ? c.description : c.unlockHint}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectibleAlbum;
