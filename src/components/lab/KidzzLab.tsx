import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Sparkles, Palette, Smile, Shirt, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DynamicCharacter, { type CharExpression, type CharEnergy } from "./DynamicCharacter";
import type { useCharacterEvolution } from "@/hooks/useCharacterEvolution";

const COLORS = [
  { id: "purple", from: "#A855F7", to: "#7C3AED", label: "Ametista" },
  { id: "emerald", from: "#10B981", to: "#059669", label: "Esmeralda" },
  { id: "sapphire", from: "#3B82F6", to: "#1D4ED8", label: "Safira" },
  { id: "ruby", from: "#EF4444", to: "#DC2626", label: "Rubi" },
  { id: "gold", from: "#F59E0B", to: "#D97706", label: "Ouro" },
  { id: "cosmic", from: "#EC4899", to: "#8B5CF6", label: "Cósmico" },
];

const EXPRESSIONS: { id: CharExpression; emoji: string; label: string }[] = [
  { id: "calm", emoji: "😌", label: "Calmo" },
  { id: "happy", emoji: "😄", label: "Feliz" },
  { id: "curious", emoji: "🤔", label: "Curioso" },
  { id: "sleepy", emoji: "😴", label: "Sonolento" },
];

const OUTFITS = [
  { id: "none", label: "Natural", icon: "🦎" },
  { id: "labcoat", label: "Cientista", icon: "🥼" },
  { id: "crown", label: "Realeza", icon: "👑" },
  { id: "space", label: "Astronauta", icon: "🚀" },
];

const ENERGY_MODES: { id: CharEnergy; label: string; icon: string }[] = [
  { id: "low", label: "Zen", icon: "🧘" },
  { id: "medium", label: "Normal", icon: "⚡" },
  { id: "high", label: "Energia", icon: "🔥" },
  { id: "ultra", label: "Ultra", icon: "💥" },
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
  evolution?: ReturnType<typeof useCharacterEvolution>;
}

const KidzzLab = ({ onBack, evolution }: Props) => {
  const { profile } = useAuth();
  const isPremium = profile?.is_premium;
  const char = evolution?.character;

  const [activeTab, setActiveTab] = useState<TabId>("color");
  const selectedColor = COLORS.find(
    (c) => c.from === (char?.color_from || "#A855F7")
  ) || COLORS[0];
  const expression = (char?.expression || "calm") as CharExpression;
  const outfit = char?.outfit || "none";
  const energy = (char?.energy_mode || "medium") as CharEnergy;

  const [pulseKey, setPulseKey] = useState(0);
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);

  const triggerPulse = useCallback(() => setPulseKey((k) => k + 1), []);

  const isLocked = (type: "outfit" | "color", id: string) => {
    if (isPremium) return false;
    if (type === "outfit") return !(char?.unlocked_outfits || ["none", "labcoat"]).includes(id);
    return !(char?.unlocked_colors || ["purple"]).includes(id);
  };

  const handleLockedItem = () => { if (!isPremium) setShowPremiumCTA(true); };

  const setColor = (c: typeof COLORS[0]) => {
    evolution?.customize({ color_from: c.from, color_to: c.to });
    triggerPulse();
  };
  const setExpression = (e: CharExpression) => {
    evolution?.customize({ expression: e });
    triggerPulse();
  };
  const setOutfit = (o: string) => {
    evolution?.customize({ outfit: o });
    triggerPulse();
  };
  const setEnergy = (e: CharEnergy) => {
    evolution?.customize({ energy_mode: e });
    triggerPulse();
  };

  const energyParticleCount = { low: 3, medium: 6, high: 14, ultra: 24 };
  const energyGlow = { low: 0.12, medium: 0.25, high: 0.5, ultra: 0.8 };
  const energySpeed = { low: 6, medium: 4, high: 2.5, ultra: 1.5 };

  const charLevel = char?.level || 1;
  const charPoints = char?.evolution_points || 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: "linear-gradient(160deg, #0d0618 0%, #121830 40%, #0a1628 70%, #0d0d1a 100%)" }}
    >
      {/* Floating lab panels */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`panel-${i}`}
            className="absolute rounded-2xl border border-white/[0.04]"
            style={{ width: 50 + i * 25, height: 70 + i * 18, top: `${10 + i * 18}%`, left: `${3 + i * 20}%`, background: `linear-gradient(135deg, ${selectedColor.from}08, ${selectedColor.to}04)` }}
            animate={{ y: [0, -6 - i * 2, 0], rotate: [-1 + i * 0.5, 1 + i * 0.5, -1 + i * 0.5], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`bub-${i}`}
            className="absolute rounded-full"
            style={{ width: 3 + i * 1.5, height: 3 + i * 1.5, bottom: 0, left: `${8 + i * 11}%`, background: selectedColor.from, filter: "blur(1px)" }}
            animate={{ y: [0, -(150 + i * 30)], opacity: [0.6, 0], scale: [1, 0.2] }}
            transition={{ duration: 4 + i * 0.4, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-1">
        <motion.button onClick={onBack} className="p-2 rounded-xl bg-white/5 border border-white/10" whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={20} className="text-white/70" />
        </motion.button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white/90 flex items-center gap-1.5">🧪 Kidzz Lab</h1>
          <p className="text-[10px] text-purple-300/50">Nível {charLevel} • {charPoints} pts</p>
        </div>
        <div className="w-9" />
      </div>

      {/* CHARACTER HERO AREA */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-center" style={{ minHeight: 260 }}>
        <motion.div className="relative" key={`pulse-${pulseKey}`} initial={{ scale: 1 }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.3, ease: "easeOut" }}>
          {/* Spotlight */}
          <motion.div
            className="absolute -inset-16 rounded-full pointer-events-none"
            animate={{ scale: [1, 1.12, 1], opacity: [energyGlow[energy] * 0.5, energyGlow[energy], energyGlow[energy] * 0.5] }}
            transition={{ duration: energySpeed[energy], repeat: Infinity, ease: "easeInOut" }}
            style={{ background: `radial-gradient(circle, ${selectedColor.from}55, ${selectedColor.to}22 50%, transparent 75%)` }}
          />

          {/* Energy particles */}
          {[...Array(energyParticleCount[energy])].map((_, i) => {
            const angle = (360 / energyParticleCount[energy]) * i;
            const radius = 90 + (i % 4) * 12;
            return (
              <motion.div
                key={`ep-${energy}-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{ width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2, background: i % 2 === 0 ? selectedColor.from : selectedColor.to, boxShadow: `0 0 6px ${selectedColor.from}`, top: "50%", left: "50%" }}
                animate={{
                  x: [Math.cos((angle * Math.PI) / 180) * radius, Math.cos(((angle + 180) * Math.PI) / 180) * radius, Math.cos((angle * Math.PI) / 180) * radius],
                  y: [Math.sin((angle * Math.PI) / 180) * radius, Math.sin(((angle + 180) * Math.PI) / 180) * radius, Math.sin((angle * Math.PI) / 180) * radius],
                  opacity: [0.2, 0.8, 0.2], scale: [0.6, 1.3, 0.6],
                }}
                transition={{ duration: energySpeed[energy] * 2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
              />
            );
          })}

          <DynamicCharacter state={{ color: selectedColor, expression, outfit, energy }} />

          {/* Feedback bubble */}
          {char?.last_feedback && (
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 whitespace-nowrap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
              transition={{ duration: 4, ease: "easeInOut" }}
            >
              <p className="text-[10px] text-white/80 font-semibold">{char.last_feedback}</p>
            </motion.div>
          )}

          {/* Status label */}
          <motion.div
            key={`${expression}-${selectedColor.id}-${outfit}-${energy}`}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
            style={{ background: `linear-gradient(135deg, ${selectedColor.from}33, ${selectedColor.to}33)`, color: selectedColor.from, border: `1px solid ${selectedColor.from}44` }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          >
            {EXPRESSIONS.find(e => e.id === expression)?.label} • {selectedColor.label} • {ENERGY_MODES.find(e => e.id === energy)?.label}
          </motion.div>
        </motion.div>
      </div>

      {/* Tab selector */}
      <div className="relative z-10 flex gap-1 px-4 mb-2 mt-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-bold transition-all ${isActive ? "bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-lg shadow-purple-500/10" : "bg-white/5 text-white/35 border border-transparent"}`}
              whileTap={{ scale: 0.93 }}
            >
              <Icon size={16} />{tab.label}
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
                  const locked = isLocked("color", c.id);
                  const selected = selectedColor.id === c.id;
                  return (
                    <motion.button key={c.id} onClick={() => { if (locked) return handleLockedItem(); setColor(c); }}
                      className={`relative rounded-2xl p-3 flex flex-col items-center gap-1.5 border transition-all ${selected ? "border-white/40 bg-white/15 scale-105" : "border-white/8 bg-white/5 opacity-60"} ${locked ? "opacity-40" : ""}`}
                      whileTap={locked ? undefined : { scale: 0.9 }}
                      animate={selected ? { boxShadow: `0 0 20px ${c.from}44` } : { boxShadow: "0 0 0px transparent" }}
                    >
                      <motion.div className="w-11 h-11 rounded-full border-2"
                        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})`, borderColor: selected ? "white" : "rgba(255,255,255,0.15)", filter: locked ? "blur(3px)" : "none" }}
                        animate={selected ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className={`text-[11px] font-semibold ${selected ? "text-white" : "text-white/50"}`}>{c.label}</span>
                      {locked && <div className="absolute inset-0 flex items-center justify-center"><Lock size={16} className="text-white/50" /></div>}
                    </motion.button>
                  );
                })}
              </div>
            </TabPanel>
          )}
          {activeTab === "expression" && (
            <TabPanel key="expression" title="Como está se sentindo?">
              <div className="grid grid-cols-2 gap-3">
                {EXPRESSIONS.map((e) => {
                  const selected = expression === e.id;
                  return (
                    <motion.button key={e.id} onClick={() => setExpression(e.id)}
                      className={`rounded-2xl p-4 flex flex-col items-center gap-2 border transition-all ${selected ? "border-white/40 bg-white/15 scale-105" : "border-white/8 bg-white/5 opacity-55"}`}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.span className="text-3xl" animate={selected ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>{e.emoji}</motion.span>
                      <span className={`text-xs font-semibold ${selected ? "text-white" : "text-white/50"}`}>{e.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </TabPanel>
          )}
          {activeTab === "outfit" && (
            <TabPanel key="outfit" title="Escolha o traje">
              <div className="grid grid-cols-2 gap-3">
                {OUTFITS.map((o) => {
                  const locked = isLocked("outfit", o.id);
                  const selected = outfit === o.id;
                  return (
                    <motion.button key={o.id} onClick={() => { if (locked) return handleLockedItem(); setOutfit(o.id); }}
                      className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 border transition-all ${selected ? "border-white/40 bg-white/15 scale-105" : "border-white/8 bg-white/5 opacity-55"} ${locked ? "opacity-40" : ""}`}
                      whileTap={locked ? undefined : { scale: 0.9 }}
                    >
                      <motion.span className="text-3xl" style={{ filter: locked ? "blur(3px)" : "none" }} animate={selected ? { y: [0, -4, 0] } : {}} transition={{ duration: 1, repeat: Infinity }}>{o.icon}</motion.span>
                      <span className={`text-xs font-semibold ${selected ? "text-white" : "text-white/50"}`}>{o.label}</span>
                      {locked && <div className="absolute inset-0 flex items-center justify-center"><Lock size={16} className="text-white/50" /></div>}
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
                  const locked = isLocked("outfit", "ultra_check") && e.id === "ultra";
                  const selected = energy === e.id;
                  return (
                    <motion.button key={e.id} onClick={() => { if (locked) return handleLockedItem(); setEnergy(e.id); }}
                      className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 border transition-all ${selected ? "border-white/40 bg-white/15 scale-105" : "border-white/8 bg-white/5 opacity-55"} ${locked ? "opacity-40" : ""}`}
                      whileTap={locked ? undefined : { scale: 0.9 }}
                    >
                      <motion.span className="text-3xl" style={{ filter: locked ? "blur(3px)" : "none" }} animate={selected ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>{e.icon}</motion.span>
                      <span className={`text-xs font-semibold ${selected ? "text-white" : "text-white/50"}`}>{e.label}</span>
                      {locked && <div className="absolute inset-0 flex items-center justify-center"><Lock size={16} className="text-white/50" /></div>}
                    </motion.button>
                  );
                })}
              </div>
            </TabPanel>
          )}
        </AnimatePresence>
      </div>

      {/* Premium CTA */}
      <AnimatePresence>
        {showPremiumCTA && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPremiumCTA(false)}
          >
            <motion.div className="mx-6 p-6 rounded-3xl border border-purple-400/30 text-center"
              style={{ background: "linear-gradient(160deg, #1a0a2e, #16213e)" }}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div className="text-5xl mb-3" animate={{ rotate: [0, -10, 10, 0], y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.div>
              <h3 className="text-lg font-bold text-white mb-2">Desbloqueie a criação completa</h3>
              <p className="text-sm text-purple-200/60 mb-4">Use o app para desbloquear itens ou desbloqueie tudo com o Premium!</p>
              <p className="text-xs text-purple-300/40 mb-3">🎯 Nível {charLevel} — {charPoints} pontos de evolução</p>
              <motion.button className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }} whileTap={{ scale: 0.95 }} onClick={() => setShowPremiumCTA(false)}
              >
                <Sparkles size={16} className="inline mr-1.5 -mt-0.5" />Desbloquear criação completa ✨
              </motion.button>
              <button className="mt-3 text-xs text-white/30" onClick={() => setShowPremiumCTA(false)}>Agora não</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TabPanel = ({ children, title }: { children: React.ReactNode; title: string; key: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
    <p className="text-sm font-bold text-white/60 mb-3">{title}</p>
    {children}
  </motion.div>
);

export default KidzzLab;
