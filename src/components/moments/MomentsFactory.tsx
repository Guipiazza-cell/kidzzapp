import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Clock, Users, Star, ChevronRight, Heart, Zap, Check } from "lucide-react";
import MagicalBackground from "../MagicalBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { MISSIONS, type Mission } from "./MissionsData";
import MissionDetail from "./MissionDetail";
import ContextualPaywallModal from "../ContextualPaywallModal";
import { MISSION_PACKS, isPackPurchased, openMissionPackCheckout } from "@/lib/missionPacks";
import MomentsAlbum from "./MomentsAlbum";
import aneImg from "@/assets/ane-chameleon.webp";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
}

const FREE_MISSIONS = 1;

const MomentsFactory = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const { canUse } = useEntitlement();
  // Momentos exige Premium.
  const isPremium = canUse("momentos");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [, setPurchasedTick] = useState(0);

  const newCount = MISSIONS.filter(m => m.isNew).length;

  const isMissionUnlocked = (index: number) => isPremium || index < FREE_MISSIONS;

  if (selectedMission) {
    return <MissionDetail mission={selectedMission} onBack={() => setSelectedMission(null)} />;
  }

  const handleMissionClick = (mission: Mission, index: number) => {
    if (isMissionUnlocked(index)) {
      setSelectedMission(mission);
    } else {
      setShowPaywall(true);
    }
  };

  const handlePackPurchase = async (packId: string) => {
    setPurchasing(packId);
    const result = await openMissionPackCheckout(packId);
    setPurchasing(null);
    if (result.success) {
      setPurchasedTick((t) => t + 1);
      toast.success("✅ Pack desbloqueado! Aproveite as missões 💛");
    } else {
      toast.error("Não foi possível concluir a compra. Tente novamente.");
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden relative min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      

      {/* Header */}
      <header className="flex items-center gap-3 px-4 pb-2 relative z-10" style={{ paddingTop: "calc(max(env(safe-area-inset-top, 12px), 16px) + 8px)" }}>
        <motion.button onClick={onBack} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-card text-gray-600" whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={22} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-gray-800">Fábrica de Momentos</h1>
          <p className="text-xs text-gray-500 font-bold">Missões que conectam</p>
        </div>
        {newCount > 0 && (
          <span className="text-[10px] font-black bg-kid-orange text-white px-2.5 py-1 rounded-full animate-pulse">
            {newCount} novos
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 relative z-10">
        {/* Coração emocional — Álbum afetivo da família */}
        <MomentsAlbum />

        {/* Hero */}
        <motion.div
          className="mt-3 rounded-2xl overflow-hidden glass-card p-5 text-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.img
            src={aneImg}
            alt="Ane"
            className="w-20 h-20 object-contain drop-shadow-xl mx-auto"
            animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <h2 className="text-gray-800 font-black text-xl mt-3 leading-tight">
            Missão para {profile?.child_name || "seu filho"} e família 💛
          </h2>
          <p className="text-gray-500 text-sm mt-2 font-bold">
            Missões simples e mágicas para criar memórias inesquecíveis
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
              <Clock size={12} /> 5–15 min
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
              <Users size={12} /> 3–8 anos
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
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
          <Sparkles size={14} className="text-kid-orange" />
          <span className="text-xs font-bold text-gray-500">Novos momentos todo mês</span>
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
                {!unlocked && (
                  <div className="absolute inset-0 z-10 rounded-2xl flex flex-col items-center justify-center px-4 text-center"
                       style={{
                         background: "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(232,236,231,0.78))",
                         backdropFilter: "blur(6px)",
                         WebkitBackdropFilter: "blur(6px)",
                       }}>
                    <p className="text-[12px] font-black text-gray-700 leading-tight">
                      Continue criando memórias 💛
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                      Toque para desbloquear
                    </p>
                  </div>
                )}

                {mission.isNew && (
                  <span className="absolute top-2 right-2 text-[8px] font-black bg-kid-orange text-white px-2 py-0.5 rounded-full z-20">
                    NOVO
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mission.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {mission.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-800 font-extrabold text-sm leading-tight">
                      {mission.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5 font-bold leading-snug">
                      {mission.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Clock size={10} /> {mission.time}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {mission.ageRange}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {mission.level}
                      </span>
                    </div>
                  </div>
                  {unlocked ? (
                    <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                  ) : null}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Mission Packs — transactional one-off purchases */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-gray-800 font-black text-sm">🎁 Packs Especiais</h3>
            <span className="text-[10px] text-gray-400 font-bold">Compra única</span>
          </div>
          <div className="space-y-3">
            {MISSION_PACKS.filter((p) => p.missions.length > 0).map((pack, i) => {
              const purchased = isPackPurchased(pack.id);
              const isLoading = purchasing === pack.id;
              return (
                <motion.div
                  key={pack.id}
                  className="glass-card rounded-2xl p-4 relative overflow-hidden"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pack.color} flex items-center justify-center text-3xl flex-shrink-0 shadow-md`}>
                      {pack.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-800 font-extrabold text-sm leading-tight">{pack.name}</h4>
                      <p className="text-gray-500 text-xs mt-0.5 font-bold leading-snug">{pack.description}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">⏱ {pack.duration}</p>
                    </div>
                  </div>

                  {pack.missions.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {pack.missions.slice(0, 4).map((m) => (
                        <div key={m.name} className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold">
                          <span>{m.emoji}</span>
                          <span className="truncate">{m.name}</span>
                        </div>
                      ))}
                      {pack.missions.length > 4 && (
                        <div className="text-[10px] text-gray-400 font-bold col-span-2">
                          + {pack.missions.length - 4} surpresas
                        </div>
                      )}
                    </div>
                  )}

                  {purchased ? (
                    <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-sm">
                      <Check size={16} /> Pack Desbloqueado
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => handlePackPurchase(pack.id)}
                      disabled={isLoading}
                      whileTap={{ scale: 0.97 }}
                      className={`mt-3 w-full py-3 rounded-xl bg-gradient-to-r ${pack.color} text-white font-extrabold text-sm shadow-md disabled:opacity-60`}
                    >
                      {isLoading ? "Processando..." : `✨ Desbloquear — ${pack.priceLabel}`}
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Subscription CTA for free users */}
        {!isPremium && (
          <motion.button
            onClick={() => setShowPaywall(true)}
            className="mt-5 w-full glass-card rounded-2xl p-5 text-center border border-kid-purple/20 active:scale-[0.98] transition-transform"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileTap={{ scale: 0.97 }}
          >
            <Zap size={24} className="text-kid-purple mx-auto" />
            <p className="text-gray-800 font-black text-base mt-2">
              Ou assine e desbloqueie todos os momentos
            </p>
            <p className="text-gray-500 text-xs mt-1 font-bold">
              Crie conexões reais todos os dias com seu filho
            </p>
            <span className="mt-3 inline-block py-2.5 px-5 rounded-xl bg-gradient-to-r from-kid-purple to-kid-pink text-white font-extrabold text-sm shadow-lg">
              🔓 Ver planos
            </span>
          </motion.button>
        )}

        <div className="h-6" />
      </div>

      <ContextualPaywallModal
        open={showPaywall}
        context="moments"
        onClose={() => setShowPaywall(false)}
      />
    </motion.div>
  );
};

export default MomentsFactory;
