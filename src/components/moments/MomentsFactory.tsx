import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Sparkles, Clock, Users, Star, ChevronRight, Heart, Zap } from "lucide-react";
import MagicalBackground from "../MagicalBackground";
import ChameleonMascot from "../ChameleonMascot";
import { useAuth } from "@/contexts/AuthContext";
import { MISSIONS, type Mission } from "./MissionsData";
import MissionDetail from "./MissionDetail";

interface Props {
  onBack: () => void;
}

const FREE_MISSIONS = 1; // First mission is free

const MomentsFactory = ({ onBack }: Props) => {
  const { profile, tier, handleCheckout } = useAuth();
  const isPremium = profile?.is_premium ?? false;
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showLockedMessage, setShowLockedMessage] = useState(false);

  const newCount = MISSIONS.filter(m => m.isNew).length;

  const isMissionUnlocked = (index: number) => isPremium || index < FREE_MISSIONS;

  if (selectedMission) {
    return <MissionDetail mission={selectedMission} onBack={() => setSelectedMission(null)} />;
  }

  const handleMissionClick = (mission: Mission, index: number) => {
    if (isMissionUnlocked(index)) {
      setSelectedMission(mission);
    } else {
      setShowLockedMessage(true);
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[hsl(220,25%,8%)] via-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)] relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <MagicalBackground />

      {/* Header */}
      <header className="flex items-center gap-3 px-4 pb-2 relative z-10" style={{ paddingTop: "calc(max(env(safe-area-inset-top, 12px), 16px) + 8px)" }}>
        <motion.button onClick={onBack} className="p-2 rounded-xl glass-card text-primary-foreground/60" whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-primary-foreground">Fábrica de Momentos</h1>
          <p className="text-xs text-primary-foreground/40 font-bold">Missões que conectam</p>
        </div>
        {newCount > 0 && (
          <span className="text-[10px] font-black bg-kid-orange text-primary-foreground px-2.5 py-1 rounded-full animate-pulse">
            {newCount} novos
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 relative z-10">
        {/* Hero */}
        <motion.div
          className="mt-3 rounded-2xl overflow-hidden glass-card p-5 text-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ChameleonMascot size="md" mood="happy" className="mx-auto" />
          <h2 className="text-primary-foreground font-black text-xl mt-3 leading-tight">
            10 minutos que mudam o seu dia com seu filho
          </h2>
          <p className="text-primary-foreground/50 text-sm mt-2 font-bold">
            Missões simples e mágicas para criar memórias inesquecíveis
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-primary-foreground/40 text-xs font-bold">
              <Clock size={12} /> 5–15 min
            </div>
            <div className="flex items-center gap-1 text-primary-foreground/40 text-xs font-bold">
              <Users size={12} /> 3–8 anos
            </div>
            <div className="flex items-center gap-1 text-primary-foreground/40 text-xs font-bold">
              <Heart size={12} /> Conexão
            </div>
          </div>
        </motion.div>

        {/* Monthly update badge */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles size={14} className="text-kid-yellow" />
          <span className="text-xs font-bold text-primary-foreground/50">Novos momentos todo mês</span>
        </motion.div>

        {/* Mission cards */}
        <div className="mt-4 space-y-3">
          {MISSIONS.map((mission, i) => {
            const unlocked = isMissionUnlocked(i);
            return (
              <motion.button
                key={mission.id}
                onClick={() => handleMissionClick(mission, i)}
                className={`w-full text-left rounded-2xl p-4 transition-all relative overflow-hidden ${
                  unlocked ? "active:scale-[0.98]" : ""
                } glass-card`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                whileTap={unlocked ? { scale: 0.97 } : {}}
              >
                {/* Blur overlay for locked missions */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-[hsl(220,20%,12%)]/60 backdrop-blur-[2px] z-10 rounded-2xl flex items-center justify-center">
                    <Lock size={20} className="text-primary-foreground/30" />
                  </div>
                )}

                {mission.isNew && (
                  <span className="absolute top-2 right-2 text-[8px] font-black bg-kid-orange text-primary-foreground px-2 py-0.5 rounded-full z-20">
                    NOVO
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mission.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {mission.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-primary-foreground font-extrabold text-sm leading-tight">
                      {mission.name}
                    </h3>
                    <p className="text-primary-foreground/50 text-xs mt-0.5 font-bold leading-snug">
                      {mission.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-primary-foreground/30 font-bold flex items-center gap-1">
                        <Clock size={10} /> {mission.time}
                      </span>
                      <span className="text-[10px] text-primary-foreground/30 font-bold">
                        {mission.ageRange}
                      </span>
                      <span className="text-[10px] text-primary-foreground/30 font-bold">
                        {mission.level}
                      </span>
                    </div>
                  </div>
                  {unlocked ? (
                    <ChevronRight size={16} className="text-primary-foreground/30 flex-shrink-0 mt-1" />
                  ) : null}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Paywall CTA for free users */}
        {!isPremium && (
          <motion.div
            className="mt-5 glass-card rounded-2xl p-5 text-center border border-kid-purple/20"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Zap size={24} className="text-kid-yellow mx-auto" />
            <p className="text-primary-foreground font-black text-base mt-2">
              Desbloqueie todos os momentos
            </p>
            <p className="text-primary-foreground/40 text-xs mt-1 font-bold">
              Crie conexões reais todos os dias com seu filho
            </p>
            <motion.button
              onClick={() => handleCheckout("premium")}
              className="mt-3 w-full py-3.5 rounded-xl bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground font-extrabold text-sm shadow-lg active:scale-[0.97] transition-transform"
              whileTap={{ scale: 0.95 }}
            >
              🔓 Quero desbloquear
            </motion.button>
          </motion.div>
        )}

        <div className="h-6" />
      </div>

      {/* Locked mission overlay modal */}
      <AnimatePresence>
        {showLockedMessage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLockedMessage(false)}
          >
            <div className="fixed inset-0 bg-black/60" />
            <motion.div
              className="relative glass-card rounded-2xl p-6 max-w-sm w-full text-center border border-kid-purple/20"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Lock size={28} className="text-kid-yellow mx-auto" />
              <h3 className="text-primary-foreground font-black text-lg mt-3 leading-tight">
                Desbloqueie todos os momentos e crie conexões reais todos os dias
              </h3>
              <p className="text-primary-foreground/40 text-xs mt-2 font-bold">
                + novas missões todo mês para criar memórias inesquecíveis
              </p>
              <motion.button
                onClick={() => {
                  setShowLockedMessage(false);
                  handleCheckout("premium");
                }}
                className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground font-extrabold text-sm shadow-lg"
                whileTap={{ scale: 0.95 }}
              >
                ✨ Quero desbloquear
              </motion.button>
              <button
                onClick={() => setShowLockedMessage(false)}
                className="mt-2 text-primary-foreground/30 text-xs font-bold"
              >
                Agora não
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MomentsFactory;
