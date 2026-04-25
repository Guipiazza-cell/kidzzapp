/**
 * MEU KIDZZ — Personalização real e funcional do camaleão único.
 *
 * - Aplica hue-rotate, expressão, traje e energia ao KidzzChameleon (personagem único do app)
 * - Persiste em localStorage (`mascotConfig`) — mesma chave do KidzzLab (compatível)
 * - Botão SALVAR + COMPARTILHAR (gera card com html2canvas → web share / download)
 * - Cada clique muda visual IMEDIATAMENTE + micro feedback do camaleão
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Smile, Shirt, Zap, Check, Share2, Save, Sparkles, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import KidzzChameleon, { type KidzzMood } from "@/components/kidzz/KidzzChameleon";
import { loadMascotConfig, type MascotConfig, type LabExpression, type LabEnergy } from "@/components/lab/KidzzLab";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";
import { toast } from "sonner";

// Hue values must match KidzzLab + HomeScreen for consistency across the app
const COLORS = [
  { id: "rosa-encantado", label: "Rosa", hue: 0, dot: "hsl(330 80% 65%)" },
  { id: "dourado-magico", label: "Dourado", hue: -30, dot: "hsl(45 90% 60%)" },
  { id: "verde-floresta", label: "Verde", hue: 90, dot: "hsl(140 70% 50%)" },
  { id: "azul-oceano", label: "Azul", hue: 180, dot: "hsl(210 80% 55%)" },
  { id: "lilas-estrelado", label: "Lilás", hue: 240, dot: "hsl(280 70% 65%)" },
  { id: "laranja-aventura", label: "Laranja", hue: -60, dot: "hsl(20 90% 55%)" },
];

const EXPRESSIONS: { id: LabExpression; emoji: string; label: string; mood: KidzzMood }[] = [
  { id: "happy", emoji: "😄", label: "Feliz", mood: "happy" },
  { id: "curious", emoji: "🤔", label: "Curioso", mood: "curious" },
  { id: "excited", emoji: "🤩", label: "Animado", mood: "happy" },
  { id: "thinking", emoji: "💭", label: "Pensativo", mood: "thinking" },
  { id: "loving", emoji: "🥰", label: "Amoroso", mood: "calm" },
  { id: "challenging", emoji: "😏", label: "Confiante", mood: "guide" },
];

const OUTFITS = [
  { id: "scientist", icon: "🥼", label: "Cientista" },
  { id: "superhero", icon: "🦸", label: "Herói" },
  { id: "explorer", icon: "🎩", label: "Explorador" },
  { id: "astronaut", icon: "🚀", label: "Astronauta" },
  { id: "chef", icon: "👨‍🍳", label: "Chef" },
  { id: "wizard", icon: "🧙", label: "Mago" },
];

const ENERGY: { id: LabEnergy; icon: string; label: string }[] = [
  { id: "calm", icon: "🧘", label: "Calmo" },
  { id: "curious", icon: "🔍", label: "Curioso" },
  { id: "animated", icon: "🔥", label: "Animado" },
  { id: "powerful", icon: "💥", label: "Poderoso" },
];

type TabId = "color" | "expression" | "outfit" | "energy";
const TABS: { id: TabId; icon: typeof Palette; label: string }[] = [
  { id: "color", icon: Palette, label: "Cor" },
  { id: "expression", icon: Smile, label: "Expressão" },
  { id: "outfit", icon: Shirt, label: "Traje" },
  { id: "energy", icon: Zap, label: "Energia" },
];

const MASCOT_CONFIG_KEY = "mascotConfig";

interface Props {
  onBack: () => void;
}

const MyKidzz = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const isPremium = profile?.is_premium ?? false;
  const childName = profile?.child_name || "amigo";

  const [config, setConfig] = useState<MascotConfig>(loadMascotConfig);
  const [activeTab, setActiveTab] = useState<TabId>("color");
  const [bouncing, setBouncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const colorObj = COLORS.find((c) => c.id === config.colorId) || COLORS[0];
  const exprObj = EXPRESSIONS.find((e) => e.id === config.expression) || EXPRESSIONS[0];
  const outfitObj = OUTFITS.find((o) => o.id === config.outfitId) || OUTFITS[0];

  const update = useCallback((partial: Partial<MascotConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setBouncing(true);
    setTimeout(() => setBouncing(false), 400);

    const messages = ["Que estilo! ✨", "Adorei! 💚", "Ficou lindo!", "Legal! 🌟", "Uau!"];
    setFeedback(messages[Math.floor(Math.random() * messages.length)]);
    setTimeout(() => setFeedback(null), 1500);
  }, []);

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(MASCOT_CONFIG_KEY, JSON.stringify(config));
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10B981", "#FFD700", "#fff"],
      });
      toast.success(`KIDZZ de ${childName} salvo! 💚`);
    } catch {
      toast.error("Não foi possível salvar agora");
    }
  }, [config, childName]);

  const handleShare = useCallback(async () => {
    if (!heroRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(heroRef.current, {
        backgroundColor: "#ecf5ee",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const blob: Blob | null = await new Promise((res) =>
        canvas.toBlob((b) => res(b), "image/png")
      );
      if (!blob) throw new Error("blob");
      const file = new File([blob], `kidzz-${childName}.png`, { type: "image/png" });
      const text = `Olha o KIDZZ d${childName.endsWith("a") ? "a" : "o"} ${childName}! ✨ Crie o seu em kidzzapp.lovable.app`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Meu KIDZZ", text });
        toast.success("Compartilhado! 💚");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meu-kidzz.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem baixada! 📸");
      }
    } catch {
      toast.error("Não foi possível compartilhar agora");
    } finally {
      setSharing(false);
    }
  }, [childName]);

  // Estado visual do KidzzChameleon: usa "play" (verde base) + hue-rotate adicional via wrapper
  const kidzzMood: KidzzMood = exprObj.mood;

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      {/* HERO PREVIEW — sempre visível, muda em tempo real */}
      <div
        ref={heroRef}
        className="relative flex-shrink-0 flex flex-col items-center justify-center pt-2 pb-3 px-4"
      >
        <motion.div
          className="relative"
          animate={bouncing ? { scale: [1, 0.92, 1.08, 1], rotate: [0, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{
            // Aplica hue-rotate no camaleão inteiro
            filter: `hue-rotate(${colorObj.hue}deg)`,
            transition: "filter 350ms ease",
          }}
        >
          <KidzzChameleon
            state="play"
            mood={kidzzMood}
            size="xl"
            interactive
            showParticles
          />
        </motion.div>

        {/* Outfit emoji overlay — flutua ao lado */}
        <motion.span
          key={outfitObj.id}
          className="absolute top-4 right-1/3 text-3xl pointer-events-none"
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {outfitObj.icon}
        </motion.span>

        {/* Expression overlay */}
        <motion.span
          key={exprObj.id}
          className="absolute top-4 left-1/3 text-2xl pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {exprObj.emoji}
        </motion.span>

        {/* Status chip */}
        <motion.div
          className="mt-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-white/60 flex items-center gap-1.5"
          key={`${config.colorId}-${config.expression}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: colorObj.dot }} />
          <span className="text-[11px] font-extrabold text-gray-700">
            {colorObj.label} • {exprObj.label}
          </span>
        </motion.div>

        {/* Floating feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.p
              className="absolute -top-1 left-1/2 -translate-x-1/2 text-sm font-extrabold text-emerald-600 bg-white/90 px-3 py-1 rounded-full shadow"
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {feedback}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* TABS */}
      <div className="flex gap-1 px-4 mb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-extrabold transition-all ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-white/60 text-gray-500 border border-white/50"
              }`}
              whileTap={{ scale: 0.93 }}
            >
              <Icon size={16} />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* PANEL */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "color" && (
            <motion.div
              key="color"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-3 gap-2.5"
            >
              {COLORS.map((c) => {
                const selected = config.colorId === c.id;
                return (
                  <motion.button
                    key={c.id}
                    onClick={() => update({ colorId: c.id })}
                    className={`rounded-2xl p-3 flex flex-col items-center gap-1.5 border-2 transition-all min-h-[88px] ${
                      selected
                        ? "border-emerald-500 bg-white shadow-lg scale-[1.03]"
                        : "border-white/50 bg-white/60"
                    }`}
                    whileTap={{ scale: 0.93 }}
                  >
                    <div
                      className="w-9 h-9 rounded-full border-2 border-white shadow-inner"
                      style={{ background: c.dot }}
                    />
                    <span className={`text-[10px] font-extrabold ${selected ? "text-emerald-700" : "text-gray-600"}`}>
                      {c.label}
                    </span>
                    {selected && <Check size={12} className="text-emerald-500 absolute top-1 right-1" />}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {activeTab === "expression" && (
            <motion.div
              key="expression"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-3 gap-2.5"
            >
              {EXPRESSIONS.map((e) => {
                const selected = config.expression === e.id;
                const locked = !isPremium && (e.id === "loving" || e.id === "challenging");
                return (
                  <motion.button
                    key={e.id}
                    onClick={() => {
                      if (locked) {
                        toast.info("Disponível no Premium ✨");
                        return;
                      }
                      update({ expression: e.id });
                    }}
                    className={`relative rounded-2xl p-3 flex flex-col items-center gap-1 border-2 transition-all min-h-[88px] ${
                      selected
                        ? "border-emerald-500 bg-white shadow-lg scale-[1.03]"
                        : "border-white/50 bg-white/60"
                    } ${locked ? "opacity-60" : ""}`}
                    whileTap={locked ? undefined : { scale: 0.93 }}
                  >
                    <span className="text-2xl">{e.emoji}</span>
                    <span className={`text-[10px] font-extrabold ${selected ? "text-emerald-700" : "text-gray-600"}`}>
                      {e.label}
                    </span>
                    {locked && <Lock size={10} className="absolute top-1.5 right-1.5 text-gray-400" />}
                    {selected && <Check size={12} className="text-emerald-500 absolute top-1 right-1" />}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {activeTab === "outfit" && (
            <motion.div
              key="outfit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-3 gap-2.5"
            >
              {OUTFITS.map((o, i) => {
                const selected = config.outfitId === o.id;
                const locked = !isPremium && i >= 3;
                return (
                  <motion.button
                    key={o.id}
                    onClick={() => {
                      if (locked) {
                        toast.info("Disponível no Premium ✨");
                        return;
                      }
                      update({ outfitId: o.id });
                    }}
                    className={`relative rounded-2xl p-3 flex flex-col items-center gap-1 border-2 transition-all min-h-[88px] ${
                      selected
                        ? "border-emerald-500 bg-white shadow-lg scale-[1.03]"
                        : "border-white/50 bg-white/60"
                    } ${locked ? "opacity-60" : ""}`}
                    whileTap={locked ? undefined : { scale: 0.93 }}
                  >
                    <span className="text-2xl">{o.icon}</span>
                    <span className={`text-[10px] font-extrabold ${selected ? "text-emerald-700" : "text-gray-600"}`}>
                      {o.label}
                    </span>
                    {locked && <Lock size={10} className="absolute top-1.5 right-1.5 text-gray-400" />}
                    {selected && <Check size={12} className="text-emerald-500 absolute top-1 right-1" />}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {activeTab === "energy" && (
            <motion.div
              key="energy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-2 gap-2.5"
            >
              {ENERGY.map((e) => {
                const selected = config.energy === e.id;
                return (
                  <motion.button
                    key={e.id}
                    onClick={() => update({ energy: e.id })}
                    className={`rounded-2xl p-3 flex flex-col items-center gap-1.5 border-2 transition-all min-h-[88px] ${
                      selected
                        ? "border-emerald-500 bg-white shadow-lg scale-[1.03]"
                        : "border-white/50 bg-white/60"
                    }`}
                    whileTap={{ scale: 0.93 }}
                  >
                    <span className="text-3xl">{e.icon}</span>
                    <span className={`text-[10px] font-extrabold ${selected ? "text-emerald-700" : "text-gray-600"}`}>
                      {e.label}
                    </span>
                    {selected && <Check size={12} className="text-emerald-500 absolute top-1 right-1" />}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action bar fixa */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-3 flex gap-2"
        style={{ background: "linear-gradient(to top, hsl(140 35% 90%) 70%, transparent)" }}
      >
        <motion.button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 py-3.5 rounded-2xl bg-white border-2 border-emerald-500/30 text-emerald-700 font-extrabold text-sm shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
        >
          <Share2 size={16} />
          Compartilhar
        </motion.button>
        <motion.button
          onClick={handleSave}
          className="flex-1 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(135deg, hsl(140 70% 45%), hsl(155 65% 38%))" }}
          whileTap={{ scale: 0.95 }}
        >
          <Save size={16} />
          Salvar
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MyKidzz;
