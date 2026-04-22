import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Moon, Music2, Mic } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LivingForest from "./LivingForest";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import MorningKaraoke from "./MorningKaraoke";
import DanceWithAne from "./DanceWithAne";
import SungStories from "./SungStories";
import CreateMusic from "./CreateMusic";
import { getMusicXp, getMusicStreak, type MusicAchievement } from "@/lib/musicXp";
import { completeMissionStep, addXp, bumpSessionActions } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";

interface Props {
  onBack: () => void;
  onNavigateToDreams: () => void;
  onXpEarned?: () => void;
}

type Pillar = "morning" | "dance" | "stories" | "create";

const MusicForest = ({ onBack, onNavigateToDreams, onXpEarned }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";
  const [activePillar, setActivePillar] = useState<Pillar | null>(null);
  const [xp, setXp] = useState(getMusicXp());
  const [streak, setStreak] = useState(getMusicStreak());
  const [rareEffect, setRareEffect] = useState<"stars" | "butterflies" | "choir" | null>(null);
  const [achievementToast, setAchievementToast] = useState<MusicAchievement | null>(null);

  // Refresh XP/streak after pillar visits + mark daily mission step + global XP
  useEffect(() => {
    if (activePillar === null) {
      setXp(getMusicXp());
      setStreak(getMusicStreak());
    } else {
      // Entering an activity counts as a music interaction for the daily loop
      const { newlyMarked } = completeMissionStep("music");
      if (newlyMarked) {
        const { gained } = addXp("music");
        showXpGained(gained, "música");
        bumpSessionActions();
      }
    }
  }, [activePillar]);

  // 5% rare effect on open
  useEffect(() => {
    if (Math.random() < 0.05) {
      const effects: Array<"stars" | "butterflies" | "choir"> = ["stars", "butterflies", "choir"];
      setRareEffect(effects[Math.floor(Math.random() * 3)]);
      setTimeout(() => setRareEffect(null), 5000);
    }
  }, []);

  const isNight = new Date().getHours() >= 19;

  const handleAchievement = (a: MusicAchievement) => {
    setAchievementToast(a);
    setTimeout(() => setAchievementToast(null), 4000);
  };

  // Pillar screens
  if (activePillar === "morning") {
    return (
      <MorningKaraoke
        onBack={() => { setActivePillar(null); onXpEarned?.(); }}
        childName={childName}
        onAchievement={handleAchievement}
      />
    );
  }
  if (activePillar === "dance") {
    return (
      <DanceWithAne
        onBack={() => { setActivePillar(null); onXpEarned?.(); }}
        childName={childName}
        onAchievement={handleAchievement}
      />
    );
  }
  if (activePillar === "stories") {
    return (
      <SungStories
        onBack={() => { setActivePillar(null); onXpEarned?.(); }}
        childName={childName}
        onAchievement={handleAchievement}
      />
    );
  }
  if (activePillar === "create") {
    return (
      <CreateMusic
        onBack={() => { setActivePillar(null); onXpEarned?.(); }}
        childName={childName}
        onAchievement={handleAchievement}
      />
    );
  }

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden relative"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <LivingForest variant="light">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-3 border-b border-white/30 bg-white/30 backdrop-blur-md"
          style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
          <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/60 backdrop-blur flex items-center justify-center shadow" aria-label="Voltar">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-gray-800 text-lg font-extrabold leading-tight flex items-center gap-2 drop-shadow-sm">
              <Music2 size={18} className="text-amber-600" /> Floresta Musical
            </h1>
            <p className="text-gray-700 text-xs font-semibold">Onde a música nasce 🌿</p>
          </div>
          {/* XP & streak chips */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 bg-amber-400/80 backdrop-blur rounded-full px-2.5 py-1 border border-amber-500/40 shadow">
              <span className="text-amber-900 text-[10px] font-extrabold">✨ {xp}</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-pink-400/80 backdrop-blur rounded-full px-2.5 py-1 border border-pink-500/40 shadow">
                <span className="text-pink-900 text-[10px] font-extrabold">🎵 {streak}d</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* KIDZZ HERO — amarelo dominante (Music Soul), interface orbita */}
          <div className="flex flex-col items-center justify-center pt-2">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
            >
              <KidzzChameleon state="music" mood="happy" size="hero" interactive showParticles />
            </motion.div>
            <motion.p
              className="text-center text-amber-900 text-sm font-extrabold mt-2 drop-shadow-sm bg-amber-100/80 backdrop-blur rounded-full px-4 py-1.5 border border-amber-300/60 shadow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {childName}, vamos cantar juntos? 🎵
            </motion.p>
          </div>

          {/* CTA Principal: Cantar junto */}
          <motion.button
            onClick={() => setActivePillar("morning")}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full rounded-3xl py-5 px-6 flex items-center justify-center gap-3 shadow-2xl border-2 border-amber-300/40 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(45 95% 55%), hsl(35 95% 50%))",
              boxShadow: "0 10px 40px hsl(45 95% 55% / 0.5)",
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
            <Mic size={24} className="text-white drop-shadow relative z-10" />
            <span className="text-white text-lg font-black drop-shadow relative z-10">
              🎤 Cantar junto
            </span>
          </motion.button>

          {/* Streak hint */}
          {streak >= 1 && (
            <motion.div
              className="rounded-2xl px-4 py-3 backdrop-blur border border-pink-400/40 text-center bg-white/70 shadow"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-pink-700 text-sm font-extrabold">🎵 {streak} {streak === 1 ? "dia" : "dias"} cantando juntos!</p>
            </motion.div>
          )}

          <p className="text-center text-gray-700 text-[11px] font-bold uppercase tracking-widest pt-2 drop-shadow-sm">
            Mais maneiras de brincar com música
          </p>

          {/* 4 Pilares */}
          <div className="grid grid-cols-2 gap-3">
            <PillarCard
              emoji="☀️"
              title="Karaokê do Dia"
              subtitle="Cante com o Kidzz"
              gradient="from-amber-400 to-orange-500"
              onClick={() => setActivePillar("morning")}
              available
            />
            <PillarCard
              emoji="💃"
              title="Dance com Kidzz"
              subtitle="Mini-game de palmas"
              gradient="from-pink-400 to-rose-500"
              onClick={() => setActivePillar("dance")}
              available
            />
            <PillarCard
              emoji="📖"
              title="Histórias Cantadas"
              subtitle="4 livros mágicos"
              gradient="from-purple-400 to-indigo-500"
              onClick={() => setActivePillar("stories")}
              available
            />
            <PillarCard
              emoji="🎼"
              title="Crie Sua Música"
              subtitle="Laboratório sonoro"
              gradient="from-emerald-400 to-teal-500"
              onClick={() => setActivePillar("create")}
              available
            />
          </div>

          {/* Night card — only after 19h */}
          {isNight && (
            <motion.button
              onClick={onNavigateToDreams}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-3xl p-4 text-left border border-indigo-300/30"
              style={{ background: "linear-gradient(135deg, hsl(240 50% 25%), hsl(260 50% 20%))" }}
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Moon className="text-indigo-200" size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-base font-extrabold">Hora de descansar? 🌙</p>
                  <p className="text-indigo-200/80 text-xs font-semibold">Ir para Sonhos →</p>
                </div>
              </div>
            </motion.button>
          )}

          <p className="text-center text-gray-700/80 text-[10px] font-semibold pb-4 drop-shadow-sm">
            🍃 Mais maravilhas em breve
          </p>
        </div>

        {/* Rare effects */}
        <AnimatePresence>
          {rareEffect === "stars" && (
            <motion.div className="fixed inset-0 pointer-events-none z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div key={i} className="absolute text-xl"
                  style={{ left: `${Math.random() * 100}%`, top: `-20px` }}
                  animate={{ y: window.innerHeight + 40, rotate: 360, opacity: [0, 1, 0] }}
                  transition={{ duration: 4 + Math.random() * 2, delay: Math.random() * 2 }}
                >✨</motion.div>
              ))}
            </motion.div>
          )}
          {rareEffect === "butterflies" && (
            <motion.div className="fixed inset-0 pointer-events-none z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i} className="absolute text-3xl"
                  style={{ left: `-40px`, top: `${20 + Math.random() * 60}%` }}
                  animate={{ x: window.innerWidth + 60, y: [0, -30, 20, -10, 0], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 6, delay: i * 0.4, ease: "easeInOut" }}
                >🦋</motion.div>
              ))}
            </motion.div>
          )}
          {rareEffect === "choir" && (
            <motion.div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="text-7xl" animate={{ scale: [0, 1.4, 1, 1.2, 0], rotate: [0, 20, -10, 0] }} transition={{ duration: 4 }}>
                🎵🎶🎵
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievement toast */}
        <AnimatePresence>
          {achievementToast && (
            <motion.div
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] px-4"
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="rounded-2xl px-5 py-3 backdrop-blur-xl border border-amber-300/40 flex items-center gap-3 shadow-2xl"
                style={{ background: "linear-gradient(135deg, hsl(50 80% 40% / 0.85), hsl(220 40% 14% / 0.85))" }}>
                <motion.div className="text-3xl" animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }} transition={{ duration: 0.8 }}>
                  {achievementToast.emoji}
                </motion.div>
                <div>
                  <p className="text-amber-200 text-[10px] font-bold uppercase tracking-wider">Conquista!</p>
                  <p className="text-white text-sm font-extrabold">{achievementToast.name}</p>
                  <p className="text-white/70 text-[10px] font-semibold">{achievementToast.desc}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LivingForest>
    </motion.div>
  );
};

const PillarCard = ({
  emoji, title, subtitle, gradient, onClick, available,
}: { emoji: string; title: string; subtitle: string; gradient: string; onClick: () => void; available?: boolean }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: available ? 0.97 : 1 }}
    className={`relative rounded-3xl p-4 text-left border ${available ? "border-amber-400/50" : "border-white/20 opacity-60"} bg-white/75 backdrop-blur-md shadow-lg`}
    style={{
      boxShadow: available ? "0 6px 20px hsl(45 80% 50% / 0.15)" : "none",
    }}
  >
    {available && (
      <motion.div
        className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-900 shadow"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >NOVO</motion.div>
    )}
    <div className={`text-4xl mb-2 bg-gradient-to-br ${gradient} bg-clip-text drop-shadow`}>{emoji}</div>
    <p className="text-gray-800 text-sm font-extrabold leading-tight">{title}</p>
    <p className="text-gray-600 text-[11px] font-semibold leading-tight mt-0.5">{subtitle}</p>
  </motion.button>
);

export default MusicForest;
