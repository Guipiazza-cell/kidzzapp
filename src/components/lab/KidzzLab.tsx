import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Sparkles, Palette, Smile, Shirt, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import pixelImg from "@/assets/pixel-chameleon.png";

type Expression = "calm" | "happy" | "curious" | "sleepy";
type EnergyMode = "low" | "medium" | "high" | "ultra";

const COLORS = [
  { id: "emerald", from: "#10B981", to: "#059669", label: "Esmeralda" },
  { id: "sapphire", from: "#3B82F6", to: "#1D4ED8", label: "Safira" },
  { id: "amethyst", from: "#8B5CF6", to: "#6D28D9", label: "Ametista" },
  { id: "ruby", from: "#EF4444", to: "#DC2626", label: "Rubi", locked: true },
  { id: "gold", from: "#F59E0B", to: "#D97706", label: "Ouro", locked: true },
  { id: "cosmic", from: "#EC4899", to: "#8B5CF6", label: "Cósmico", locked: true },
];

const EXPRESSIONS: { id: Expression; emoji: string; label: string }[] = [
  { id: "calm", emoji: "😌", label: "Calmo" },
  { id: "happy", emoji: "😄", label: "Feliz" },
  { id: "curious", emoji: "🤔", label: "Curioso" },
  { id: "sleepy", emoji: "😴", label: "Sonolento" },
];

const OUTFITS = [
  { id: "default", label: "Natural", icon: "🦎" },
  { id: "labcoat", label: "Cientista", icon: "🥼" },
  { id: "crown", label: "Realeza", icon: "👑", locked: true },
  { id: "space", label: "Astronauta", icon: "🚀", locked: true },
];

const ENERGY_MODES: { id: EnergyMode; label: string; icon: string; locked?: boolean }[] = [
  { id: "low", label: "Zen", icon: "🧘" },
  { id: "medium", label: "Normal", icon: "⚡" },
  { id: "high", label: "Energia", icon: "🔥" },
  { id: "ultra", label: "Ultra", icon: "💥", locked: true },
];

type TabId = "color" | "expression" | "outfit" | "energy";

const TABS: { id: TabId; icon: typeof Palette; label: string }[] = [
  { id: "color", icon: Palette, label: "Cor" },
  { id: "expression", icon: Smile, label: "Expressão" },
  { id: "outfit", icon: Shirt, label: "Traje" },
  { id: "energy", icon: Zap, label: "Energia" },
];

interface Props {
  onBack: () => void;
}

const KidzzLab = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const isPremium = profile?.is_premium;

  const [activeTab, setActiveTab] = useState<TabId>("color");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [expression, setExpression] = useState<Expression>("calm");
  const [outfit, setOutfit] = useState("default");
  const [energy, setEnergy] = useState<EnergyMode>("medium");
  const [pulseKey, setPulseKey] = useState(0);
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);

  const triggerPulse = useCallback(() => setPulseKey((k) => k + 1), []);

  const handleLockedItem = () => {
    if (!isPremium) setShowPremiumCTA(true);
  };

  const expressionAnimation = {
    calm: { rotate: [0, 1, -1, 0], y: [0, -2, 0] },
    happy: { rotate: [0, -5, 5, -3, 0], y: [0, -8, 0], scale: [1, 1.05, 1] },
    curious: { rotate: [0, -10, 0], y: [0, -6, 0] },
    sleepy: { rotate: [0, 2, 0], y: [0, -1, 0], scale: [1, 0.98, 1] },
  };

  const expressionTransition = {
    calm: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
    happy: { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const },
    curious: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
    sleepy: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  };

  const energyParticleCount = { low: 3, medium: 6, high: 10, ultra: 16 };
  const energyGlow = {
    low: "0 0 30px rgba(139,92,246,0.15)",
    medium: "0 0 40px rgba(139,92,246,0.3)",
    high: "0 0 60px rgba(139,92,246,0.5)",
    ultra: "0 0 80px rgba(236,72,153,0.6)",
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: "linear-gradient(160deg, #1a0a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)",
      }}
    >
      {/* Floating lab elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glass panels */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`panel-${i}`}
            className="absolute rounded-2xl border border-white/5"
            style={{
              width: 60 + i * 30,
              height: 80 + i * 20,
              top: `${15 + i * 20}%`,
              left: `${5 + i * 22}%`,
              background: `linear-gradient(135deg, rgba(139,92,246,${0.03 + i * 0.02}), rgba(59,130,246,${0.02 + i * 0.01}))`,
              backdropFilter: "blur(4px)",
            }}
            animate={{
              y: [0, -8 - i * 3, 0],
              rotate: [-2 + i, 2 + i, -2 + i],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
          />
        ))}

        {/* Glowing liquid bubbles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full"
            style={{
              width: 4 + Math.random() * 8,
              height: 4 + Math.random() * 8,
              bottom: "5%",
              left: `${10 + i * 10}%`,
              background: ["#8B5CF6", "#3B82F6", "#10B981", "#EC4899"][i % 4],
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -(100 + Math.random() * 200)],
              opacity: [0.8, 0],
              scale: [1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Soft holograms / geometric shapes */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            className="absolute border border-purple-400/10"
            style={{
              width: 40 + i * 20,
              height: 40 + i * 20,
              top: `${20 + i * 25}%`,
              right: `${5 + i * 10}%`,
              borderRadius: i === 1 ? "50%" : i === 2 ? "30%" : "8px",
            }}
            animate={{
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <motion.button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 border border-white/10"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} className="text-white/70" />
        </motion.button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white/90 flex items-center gap-1.5">
            🧪 Kidzz Lab
          </h1>
          <p className="text-[10px] text-purple-300/60">Câmara de Criação</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Character display */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-center py-4">
        <motion.div
          className="relative"
          key={pulseKey}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 0.4 }}
        >
          {/* Reactive glow */}
          <motion.div
            className="absolute inset-0 rounded-full -m-6"
            style={{
              background: `radial-gradient(circle, ${selectedColor.from}33, transparent 70%)`,
              boxShadow: energyGlow[energy],
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Energy particles */}
          {[...Array(energyParticleCount[energy])].map((_, i) => (
            <motion.div
              key={`ep-${i}-${energy}`}
              className="absolute rounded-full"
              style={{
                width: 3 + Math.random() * 4,
                height: 3 + Math.random() * 4,
                background: selectedColor.from,
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 120],
                y: [0, (Math.random() - 0.5) * 120],
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 1.5 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}

          {/* Character with color overlay */}
          <motion.div
            className="relative w-36 h-36"
            animate={expressionAnimation[expression]}
            transition={expressionTransition[expression]}
          >
            <img
              src={pixelImg}
              alt="Personagem"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{
                filter: `drop-shadow(0 0 20px ${selectedColor.from}55)`,
              }}
            />
            {/* Color tint overlay */}
            <div
              className="absolute inset-0 mix-blend-color rounded-full opacity-40"
              style={{
                background: `linear-gradient(135deg, ${selectedColor.from}, ${selectedColor.to})`,
              }}
            />

            {/* Blinking eyes */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [1, 1, 0, 1] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0, 0.95, 0.97, 1],
              }}
            />

            {/* Outfit badge */}
            {outfit !== "default" && (
              <motion.div
                className="absolute -top-1 -right-1 text-xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {OUTFITS.find((o) => o.id === outfit)?.icon}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Tab selector */}
      <div className="relative z-10 flex gap-1 px-4 mb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-bold transition-colors ${
                isActive
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                  : "bg-white/5 text-white/40 border border-transparent"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={16} />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Customization panel */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "color" && (
            <TabPanel key="color" title="Escolha a cor">
              <div className="grid grid-cols-3 gap-3">
                {COLORS.map((c) => {
                  const locked = c.locked && !isPremium;
                  return (
                    <motion.button
                      key={c.id}
                      onClick={() => {
                        if (locked) return handleLockedItem();
                        setSelectedColor(c);
                        triggerPulse();
                      }}
                      className={`relative rounded-2xl p-3 flex flex-col items-center gap-1.5 border transition-all ${
                        selectedColor.id === c.id
                          ? "border-purple-400/60 bg-purple-500/15"
                          : "border-white/10 bg-white/5"
                      } ${locked ? "opacity-60" : ""}`}
                      whileTap={locked ? undefined : { scale: 0.93 }}
                    >
                      <div
                        className="w-10 h-10 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                          filter: locked ? "blur(3px)" : "none",
                        }}
                      />
                      <span className="text-[11px] text-white/70 font-medium">{c.label}</span>
                      {locked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock size={16} className="text-white/50" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </TabPanel>
          )}

          {activeTab === "expression" && (
            <TabPanel key="expression" title="Como está se sentindo?">
              <div className="grid grid-cols-2 gap-3">
                {EXPRESSIONS.map((e) => (
                  <motion.button
                    key={e.id}
                    onClick={() => {
                      setExpression(e.id);
                      triggerPulse();
                    }}
                    className={`rounded-2xl p-4 flex flex-col items-center gap-2 border transition-all ${
                      expression === e.id
                        ? "border-purple-400/60 bg-purple-500/15"
                        : "border-white/10 bg-white/5"
                    }`}
                    whileTap={{ scale: 0.93 }}
                  >
                    <span className="text-3xl">{e.emoji}</span>
                    <span className="text-xs text-white/70 font-medium">{e.label}</span>
                  </motion.button>
                ))}
              </div>
            </TabPanel>
          )}

          {activeTab === "outfit" && (
            <TabPanel key="outfit" title="Escolha o traje">
              <div className="grid grid-cols-2 gap-3">
                {OUTFITS.map((o) => {
                  const locked = o.locked && !isPremium;
                  return (
                    <motion.button
                      key={o.id}
                      onClick={() => {
                        if (locked) return handleLockedItem();
                        setOutfit(o.id);
                        triggerPulse();
                      }}
                      className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 border transition-all ${
                        outfit === o.id
                          ? "border-purple-400/60 bg-purple-500/15"
                          : "border-white/10 bg-white/5"
                      } ${locked ? "opacity-60" : ""}`}
                      whileTap={locked ? undefined : { scale: 0.93 }}
                    >
                      <span className="text-3xl" style={{ filter: locked ? "blur(3px)" : "none" }}>
                        {o.icon}
                      </span>
                      <span className="text-xs text-white/70 font-medium">{o.label}</span>
                      {locked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock size={16} className="text-white/50" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </TabPanel>
          )}

          {activeTab === "energy" && (
            <TabPanel key="energy" title="Nível de energia">
              <div className="grid grid-cols-2 gap-3">
                {ENERGY_MODES.map((e) => {
                  const locked = e.locked && !isPremium;
                  return (
                    <motion.button
                      key={e.id}
                      onClick={() => {
                        if (locked) return handleLockedItem();
                        setEnergy(e.id);
                        triggerPulse();
                      }}
                      className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 border transition-all ${
                        energy === e.id
                          ? "border-purple-400/60 bg-purple-500/15"
                          : "border-white/10 bg-white/5"
                      } ${locked ? "opacity-60" : ""}`}
                      whileTap={locked ? undefined : { scale: 0.93 }}
                    >
                      <span className="text-3xl" style={{ filter: locked ? "blur(3px)" : "none" }}>
                        {e.icon}
                      </span>
                      <span className="text-xs text-white/70 font-medium">{e.label}</span>
                      {locked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock size={16} className="text-white/50" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </TabPanel>
          )}
        </AnimatePresence>
      </div>

      {/* Premium CTA overlay */}
      <AnimatePresence>
        {showPremiumCTA && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPremiumCTA(false)}
          >
            <motion.div
              className="mx-6 p-6 rounded-3xl border border-purple-400/30 text-center"
              style={{
                background: "linear-gradient(160deg, #1a0a2e, #16213e)",
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{ rotate: [0, -10, 10, 0], y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-2">Desbloqueie a criação completa</h3>
              <p className="text-sm text-purple-200/60 mb-4">
                Cores exclusivas, trajes especiais e o modo Ultra Energia esperam por você!
              </p>
              <motion.button
                className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPremiumCTA(false)}
              >
                <Sparkles size={16} className="inline mr-1.5 -mt-0.5" />
                Desbloquear criação completa ✨
              </motion.button>
              <button
                className="mt-3 text-xs text-white/30"
                onClick={() => setShowPremiumCTA(false)}
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

const TabPanel = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
  key: string;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
  >
    <p className="text-xs text-purple-300/50 font-medium mb-3">{title}</p>
    {children}
  </motion.div>
);

export default KidzzLab;
