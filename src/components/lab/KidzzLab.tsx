import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Sparkles, Palette, Smile, Shirt, Zap, Check, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import aneImg from "@/assets/ane-chameleon.png";
import pixelImg from "@/assets/pixel-chameleon.png";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { toast } from "sonner";

// --- Types ---
export type MascotId = "ane" | "pixel";
export type LabExpression = "happy" | "curious" | "excited" | "thinking" | "loving" | "challenging";
export type LabEnergy = "calm" | "curious" | "animated" | "powerful";

export interface MascotConfig {
  mascot: MascotId;
  colorId: string;
  expression: LabExpression;
  outfitId: string;
  energy: LabEnergy;
}

// --- Data ---
const COLORS = [
  { id: "rosa-encantado", label: "Rosa Encantado", hueRotate: 0, desc: "Cor padrão da Ane" },
  { id: "dourado-magico", label: "Dourado Mágico", hueRotate: -30, desc: "Brilho de ouro" },
  { id: "verde-floresta", label: "Verde Floresta", hueRotate: 90, desc: "Tons da natureza" },
  { id: "azul-oceano", label: "Azul Oceano", hueRotate: 180, desc: "Profundo e calmo" },
  { id: "lilas-estrelado", label: "Lilás Estrelado", hueRotate: 240, desc: "Mistério cósmico" },
  { id: "laranja-aventura", label: "Laranja Aventura", hueRotate: -60, desc: "Energia pura", locked: true, unlockText: "Alcance o nível Explorador" },
];

const EXPRESSIONS: { id: LabExpression; emoji: string; label: string; desc: string; locked?: boolean; unlockText?: string }[] = [
  { id: "happy", emoji: "😄", label: "Feliz", desc: "Sempre sorrindo" },
  { id: "curious", emoji: "🤔", label: "Curiosa", desc: "Hmm..." },
  { id: "excited", emoji: "🤩", label: "Animada", desc: "UAU!" },
  { id: "thinking", emoji: "💭", label: "Pensativa", desc: "Refletindo..." },
  { id: "loving", emoji: "😍", label: "Amorosa", desc: "Coração nos olhos", locked: true, unlockText: "Complete 5 missões em família" },
  { id: "challenging", emoji: "😏", label: "Desafiadora", desc: "Aposto que não sabe!", locked: true, unlockText: "Responda 20 perguntas" },
];

const OUTFITS = [
  { id: "scientist", label: "Cientista", icon: "🥼", desc: "Jaleco de cientista" },
  { id: "superhero", label: "Super-herói", icon: "🦸", desc: "Capa e máscara" },
  { id: "explorer", label: "Explorador", icon: "🎩", desc: "Chapéu de aventura" },
  { id: "astronaut", label: "Astronauta", icon: "🚀", desc: "Fantasia espacial", locked: true, unlockText: "10 dias de streak 🔥" },
  { id: "chef", label: "Chef", icon: "👨‍🍳", desc: "Avental gourmet", locked: true, unlockText: "Alcance o nível Curioso" },
];

const ENERGY_MODES: { id: LabEnergy; label: string; icon: string; speed: number }[] = [
  { id: "calm", label: "Calma", icon: "🧘", speed: 4 },
  { id: "curious", label: "Curiosa", icon: "🔍", speed: 2.5 },
  { id: "animated", label: "Animada", icon: "🔥", speed: 1.5 },
  { id: "powerful", label: "Poderosa", icon: "💥", speed: 0.8 },
];

type TabId = "color" | "expression" | "outfit" | "energy";

const TABS: { id: TabId; icon: typeof Palette; label: string }[] = [
  { id: "color", icon: Palette, label: "Cor" },
  { id: "expression", icon: Smile, label: "Expressão" },
  { id: "outfit", icon: Shirt, label: "Traje" },
  { id: "energy", icon: Zap, label: "Energia" },
];

const MASCOT_CONFIG_KEY = "mascotConfig";

export function loadMascotConfig(): MascotConfig {
  try {
    const stored = localStorage.getItem(MASCOT_CONFIG_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { mascot: "ane", colorId: "rosa-encantado", expression: "happy", outfitId: "scientist", energy: "calm" };
}

const FEEDBACK_MESSAGES = [
  "Olha como ficou! 💛",
  "Que lindo! ✨",
  "Adorei essa combinação! 🎨",
  "Ficou incrível! 🌟",
  "Uau, que estilo! 💫",
];

interface Props {
  onBack: () => void;
  evolution?: any;
}

const KidzzLab = ({ onBack, evolution }: Props) => {
  const { profile } = useAuth();
  const isPremium = profile?.is_premium;
  const childName = profile?.child_name || "amigo";

  const [config, setConfig] = useState<MascotConfig>(loadMascotConfig);
  const [activeTab, setActiveTab] = useState<TabId>("color");
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);
  const [saved, setSaved] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [sharing, setSharing] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const mascotSrc = config.mascot === "ane" ? aneImg : pixelImg;
  const selectedColor = COLORS.find(c => c.id === config.colorId) || COLORS[0];
  const selectedEnergy = ENERGY_MODES.find(e => e.id === config.energy) || ENERGY_MODES[0];

  const isLocked = (item: { locked?: boolean }) => !isPremium && item.locked;

  const handleLockedItem = () => {
    if (!isPremium) setShowPremiumCTA(true);
  };

  const update = (partial: Partial<MascotConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
    // Show feedback
    const msg = FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)];
    setFeedbackMsg(msg);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1800);
  };

  const handleSave = () => {
    localStorage.setItem(MASCOT_CONFIG_KEY, JSON.stringify(config));
    if (evolution?.customize) {
      const colorMap: Record<string, { from: string; to: string }> = {
        "rosa-encantado": { from: "#EC4899", to: "#DB2777" },
        "dourado-magico": { from: "#F59E0B", to: "#D97706" },
        "verde-floresta": { from: "#10B981", to: "#059669" },
        "azul-oceano": { from: "#3B82F6", to: "#1D4ED8" },
        "lilas-estrelado": { from: "#A855F7", to: "#7C3AED" },
        "laranja-aventura": { from: "#F97316", to: "#EA580C" },
      };
      const colors = colorMap[config.colorId] || colorMap["rosa-encantado"];
      evolution.customize({ color_from: colors.from, color_to: colors.to, expression: config.expression, outfit: config.outfitId, energy_mode: config.energy });
    }
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 }, colors: ["#10B981", "#FFD700", "#EC4899", "#fff"] });
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 2000);
  };

  const handleShare = useCallback(async () => {
    if (!heroRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(heroRef.current, {
        backgroundColor: "#0d0618",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
      if (!blob) throw new Error("blob_failed");
      const file = new File([blob], `kidzz-${config.mascot}.png`, { type: "image/png" });
      const shareText = `Olha a ${config.mascot === "ane" ? "minha Ane" : "meu Pixel"} no Kidzz! ✨`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Meu Kidzz", text: shareText });
        toast.success("Compartilhado! 💛");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kidzz-${config.mascot}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem baixada! 📸");
      }
    } catch (e) {
      toast.error("Não foi possível compartilhar agora");
    } finally {
      setSharing(false);
    }
  }, [config.mascot]);

  // Expression-based animation for mascot preview
  const expressionAnimations: Record<LabExpression, object> = {
    happy: { y: [0, -8, 0], rotate: [0, -3, 3, 0], scale: [1, 1.05, 1] },
    curious: { y: [0, -4, 0], rotate: [0, -8, 0] },
    excited: { y: [0, -14, 0], rotate: [0, -6, 6, -3, 0], scale: [1, 1.08, 1] },
    thinking: { y: [0, -3, 0], rotate: [0, 3, 0] },
    loving: { y: [0, -6, 0], scale: [1, 1.06, 1] },
    challenging: { y: [0, -5, 0], rotate: [0, 5, -5, 0] },
  };

  const COLOR_GLOW_MAP: Record<string, string> = {
    "rosa-encantado": "rgba(236,72,153,0.4)",
    "dourado-magico": "rgba(245,158,11,0.4)",
    "verde-floresta": "rgba(16,185,129,0.4)",
    "azul-oceano": "rgba(59,130,246,0.4)",
    "lilas-estrelado": "rgba(168,85,247,0.4)",
    "laranja-aventura": "rgba(249,115,22,0.4)",
  };

  const glowColor = COLOR_GLOW_MAP[config.colorId] || "rgba(16,185,129,0.4)";
  const mascotLabel = config.mascot === "ane" ? "Ane" : "Pixel";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0d0618 0%, #121830 40%, #0a1628 70%, #0d0d1a 100%)" }} />

      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-32 opacity-10" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0,80 Q50,20 100,60 T200,40 T300,70 T400,30 L400,0 L0,0 Z" fill="url(#leafGrad)" />
          <defs><linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
        </svg>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`gp-${i}`}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3) * 1.5, height: 2 + (i % 3) * 1.5,
              background: i % 2 === 0 ? "#FFD700" : "#10B981",
              left: `${5 + i * 8}%`, top: `${10 + (i % 5) * 18}%`,
              filter: "blur(0.5px)",
            }}
            animate={{ y: [0, -(20 + i * 5), 0], opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{ width: 1.5, height: 1.5, left: `${10 + i * 12}%`, top: `${5 + (i % 4) * 8}%` }}
            animate={{ opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-1" style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}>
        <motion.button onClick={onBack} className="p-2 rounded-xl bg-white/5 border border-white/10" whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={20} className="text-white/70" />
        </motion.button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white/90 flex items-center gap-1.5">
            Personalize sua {mascotLabel} ✨
          </h1>
          <p className="text-[10px] text-emerald-300/50">Deixe {childName} criar o companheiro perfeito</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Mascot toggle */}
      <div className="relative z-10 flex justify-center gap-3 px-4 mt-1 mb-1">
        {(["ane", "pixel"] as MascotId[]).map((id) => (
          <motion.button
            key={id}
            onClick={() => update({ mascot: id })}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              config.mascot === id
                ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40"
                : "bg-white/5 text-white/35 border border-transparent"
            }`}
            whileTap={{ scale: 0.93 }}
          >
            {id === "ane" ? "🌸 Ane" : "🔬 Pixel"}
          </motion.button>
        ))}
      </div>

      {/* Label above chameleon */}
      <motion.p
        className="relative z-10 text-center text-[11px] font-bold text-white/40 mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A sua criação ganha vida agora ✨
      </motion.p>

      {/* CHARACTER HERO — LARGE & CENTERED */}
      <div className="relative z-10 flex-shrink-0 flex flex-col items-center justify-center" style={{ minHeight: 240 }}>
        <motion.div className="relative">
          {/* Dynamic color glow behind */}
          <motion.div
            className="absolute -inset-16 rounded-full pointer-events-none"
            animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: selectedEnergy.speed * 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
          />

          {/* Mascot image with hue-rotate — SMOOTH TRANSITIONS */}
          <motion.img
            src={mascotSrc}
            alt={mascotLabel}
            className="w-48 h-48 object-contain relative z-10"
            style={{
              filter: `hue-rotate(${selectedColor.hueRotate}deg) drop-shadow(0 0 24px ${glowColor})`,
              transition: "filter 400ms ease",
            }}
            animate={expressionAnimations[config.expression] as any}
            transition={{ duration: selectedEnergy.speed, repeat: Infinity, ease: "easeInOut" }}
            key={config.mascot}
          />

          {/* Expression overlays */}
          {config.expression === "loving" && (
            <motion.span className="absolute top-2 right-2 text-xl z-20" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>❤️</motion.span>
          )}
          {config.expression === "thinking" && (
            <div className="absolute -top-2 right-0 flex gap-1 z-20">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/70" animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          )}
          {config.expression === "excited" && (
            <>
              <motion.span className="absolute -top-1 -left-2 text-sm z-20" animate={{ scale: [0, 1.5, 0], rotate: [0, 20, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>✨</motion.span>
              <motion.span className="absolute top-0 -right-2 text-sm z-20" animate={{ scale: [0, 1.5, 0], rotate: [0, -20, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}>⭐</motion.span>
            </>
          )}

          {/* Status label */}
          <motion.div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 z-20"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            key={`${config.expression}-${config.colorId}`}
          >
            {EXPRESSIONS.find(e => e.id === config.expression)?.label} • {selectedColor.label}
          </motion.div>
        </motion.div>

        {/* Feedback message after change */}
        <AnimatePresence>
          {showFeedback && (
            <motion.p
              className="absolute bottom-0 text-xs font-bold text-amber-300/80 z-20"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {feedbackMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Tab selector */}
      <div className="relative z-10 flex gap-1 px-4 mb-2 mt-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 shadow-lg shadow-emerald-500/10"
                  : "bg-white/5 text-white/35 border border-transparent"
              }`}
              whileTap={{ scale: 0.93 }}
            >
              <Icon size={16} />{tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Customization panel */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "color" && (
            <TabPanel key="color" title="Escolha a cor">
              <div className="grid grid-cols-2 gap-3">
                {COLORS.map((c) => {
                  const locked = isLocked(c);
                  const selected = config.colorId === c.id;
                  return (
                    <motion.button
                      key={c.id}
                      onClick={() => { if (locked) return handleLockedItem(); update({ colorId: c.id }); }}
                      className={`relative rounded-2xl p-3 flex flex-col items-center gap-1 border transition-all duration-300 ${
                        locked ? "opacity-40" : ""
                      }`}
                      style={{
                        borderColor: selected ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.08)",
                        background: selected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                        transform: selected ? "scale(1.05)" : "scale(1)",
                        boxShadow: selected ? `0 0 20px ${COLOR_GLOW_MAP[c.id] || "rgba(16,185,129,0.3)"}` : "none",
                        opacity: locked ? 0.4 : selected ? 1 : 0.6,
                      }}
                      whileTap={locked ? undefined : { scale: 0.93 }}
                      animate={selected ? { scale: [1.05, 1.08, 1.05] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <img
                        src={mascotSrc}
                        alt={c.label}
                        className="w-12 h-12 object-contain transition-all duration-300"
                        style={{ filter: `hue-rotate(${c.hueRotate}deg)${locked ? " blur(3px)" : ""}` }}
                      />
                      <span className={`text-[11px] font-semibold transition-colors duration-300 ${selected ? "text-emerald-200" : "text-white/50"}`}>{c.label}</span>
                      <span className="text-[9px] text-white/30">{c.desc}</span>
                      {locked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <Lock size={16} className="text-white/50" />
                          <span className="text-[8px] text-white/40 mt-1 px-2 text-center">{c.unlockText}</span>
                        </div>
                      )}
                      {selected && <Check size={14} className="absolute top-2 right-2 text-emerald-400" />}
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
                  const locked = isLocked(e);
                  const selected = config.expression === e.id;
                  return (
                    <motion.button
                      key={e.id}
                      onClick={() => { if (locked) return handleLockedItem(); update({ expression: e.id }); }}
                      className={`relative rounded-2xl p-3 flex flex-col items-center gap-1.5 border transition-all duration-300 ${locked ? "opacity-40" : ""}`}
                      style={{
                        borderColor: selected ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.08)",
                        background: selected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                        boxShadow: selected ? "0 0 16px rgba(16,185,129,0.25)" : "none",
                        opacity: locked ? 0.4 : selected ? 1 : 0.55,
                      }}
                      whileTap={locked ? undefined : { scale: 0.93 }}
                    >
                      <motion.span className="text-2xl" style={{ filter: locked ? "blur(3px)" : "none" }} animate={selected ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>{e.emoji}</motion.span>
                      <span className={`text-xs font-semibold ${selected ? "text-emerald-200" : "text-white/50"}`}>{e.label}</span>
                      <span className="text-[9px] text-white/30">{e.desc}</span>
                      {locked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <Lock size={14} className="text-white/50" />
                          <span className="text-[8px] text-white/40 mt-1 px-2 text-center">🔒 {e.unlockText}</span>
                        </div>
                      )}
                      {selected && <Check size={14} className="absolute top-2 right-2 text-emerald-400" />}
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
                  const locked = isLocked(o);
                  const selected = config.outfitId === o.id;
                  return (
                    <motion.button
                      key={o.id}
                      onClick={() => { if (locked) return handleLockedItem(); update({ outfitId: o.id }); }}
                      className={`relative rounded-2xl p-3 flex flex-col items-center gap-1.5 border transition-all duration-300 ${locked ? "opacity-40" : ""}`}
                      style={{
                        borderColor: selected ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.08)",
                        background: selected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                        boxShadow: selected ? "0 0 16px rgba(16,185,129,0.25)" : "none",
                        opacity: locked ? 0.4 : selected ? 1 : 0.55,
                      }}
                      whileTap={locked ? undefined : { scale: 0.93 }}
                    >
                      <motion.span className="text-2xl" style={{ filter: locked ? "blur(3px)" : "none" }} animate={selected ? { y: [0, -4, 0] } : {}} transition={{ duration: 1, repeat: Infinity }}>{o.icon}</motion.span>
                      <span className={`text-xs font-semibold ${selected ? "text-emerald-200" : "text-white/50"}`}>{o.label}</span>
                      <span className="text-[9px] text-white/30">{o.desc}</span>
                      {locked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <Lock size={14} className="text-white/50" />
                          <span className="text-[8px] text-white/40 mt-1 px-2 text-center">🔒 {o.unlockText}</span>
                        </div>
                      )}
                      {selected && <Check size={14} className="absolute top-2 right-2 text-emerald-400" />}
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
                  const selected = config.energy === e.id;
                  return (
                    <motion.button
                      key={e.id}
                      onClick={() => update({ energy: e.id })}
                      className="border transition-all duration-300"
                      style={{
                        borderRadius: 16, padding: 16,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        borderColor: selected ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.08)",
                        background: selected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                        boxShadow: selected ? "0 0 16px rgba(16,185,129,0.25)" : "none",
                        opacity: selected ? 1 : 0.55,
                      }}
                      whileTap={{ scale: 0.93 }}
                    >
                      <motion.span className="text-2xl" animate={selected ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>{e.icon}</motion.span>
                      <span className={`text-xs font-semibold ${selected ? "text-emerald-200" : "text-white/50"}`}>{e.label}</span>
                      {selected && <Check size={14} className="text-emerald-400" />}
                    </motion.button>
                  );
                })}
              </div>
            </TabPanel>
          )}
        </AnimatePresence>
      </div>

      {/* Save button */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-3" style={{ background: "linear-gradient(to top, #0d0d1a 60%, transparent)" }}>
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="saved"
              className="w-full py-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-center"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            >
              <p className="text-emerald-200 font-bold text-sm">
                {childName} criou {config.mascot === "ane" ? "a Ane" : "o Pixel"} perfeita! 🎉
              </p>
            </motion.div>
          ) : (
            <motion.button
              key="save-btn"
              onClick={handleSave}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-sm shadow-2xl flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles size={18} />
              ✨ Salvar minha {mascotLabel}!
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Premium CTA */}
      <AnimatePresence>
        {showPremiumCTA && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPremiumCTA(false)}
          >
            <motion.div className="mx-6 p-6 rounded-3xl border border-emerald-400/30 text-center"
              style={{ background: "linear-gradient(160deg, #0d1a0a, #0a1628)" }}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div className="text-5xl mb-3" animate={{ rotate: [0, -10, 10, 0], y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.div>
              <h3 className="text-lg font-bold text-white mb-2">Desbloqueie a criação completa</h3>
              <p className="text-sm text-emerald-200/60 mb-4">Use o app para desbloquear itens ou desbloqueie tudo com o Premium!</p>
              <motion.button className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)" }} whileTap={{ scale: 0.95 }} onClick={() => setShowPremiumCTA(false)}
              >
                <Sparkles size={16} className="inline mr-1.5 -mt-0.5" />Desbloquear tudo ✨
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
