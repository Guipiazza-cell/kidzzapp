import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Sparkles, Palette, Smile, Shirt, Check, Share2, Download, MessageCircle, Camera, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import KidzzAvatar, {
  AvatarBase,
  AvatarExpression,
  AvatarOutfit,
  COLOR_LIBRARY,
  EXPRESSION_LIBRARY,
  KidzzAvatarConfig,
  OUTFIT_LIBRARY,
  loadAvatar,
  saveAvatar,
} from "@/components/kidzz/KidzzAvatar";

// Legacy mascot config kept for evolution.customize + downstream consumer compatibility
const MASCOT_CONFIG_KEY = "mascotConfig";
export type LabExpression = "happy" | "curious" | "excited" | "thinking" | "loving" | "challenging";
export type LabEnergy = "calm" | "curious" | "animated" | "powerful";
export interface MascotConfig {
  mascot: AvatarBase;
  colorId: string;
  expression: string;
  outfitId: string;
  energy: string;
}
export function loadMascotConfig(): MascotConfig {
  try {
    const stored = localStorage.getItem(MASCOT_CONFIG_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { mascot: "ane", colorId: "rosa-encantado", expression: "happy", outfitId: "scientist", energy: "calm" };
}

// Premium-locked items
const LOCKED_OUTFITS: AvatarOutfit[] = ["super-heroi", "festa"];
const LOCKED_COLORS: string[] = ["laranja"];
const LOCKED_EXPRESSIONS: AvatarExpression[] = ["bravo"];

type TabId = "color" | "expression" | "outfit";

const TABS: { id: TabId; icon: typeof Palette; label: string }[] = [
  { id: "color", icon: Palette, label: "Cor" },
  { id: "expression", icon: Smile, label: "Rosto" },
  { id: "outfit", icon: Shirt, label: "Traje" },
];

const FEEDBACK_MESSAGES = [
  "Ficou lindo!",
  "Adorei!",
  "Combinou demais!",
  "Que estilo!",
  "Perfeito!",
];

interface Props {
  onBack: () => void;
  evolution?: any;
}

const KidzzLab = ({ onBack, evolution }: Props) => {
  const { profile } = useAuth();
  const isPremium = profile?.is_premium;
  const childName = profile?.child_name || "amigo";

  const [config, setConfig] = useState<KidzzAvatarConfig>(loadAvatar);
  const [activeTab, setActiveTab] = useState<TabId>("color");
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);
  const [saved, setSaved] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [sharing, setSharing] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const update = (partial: Partial<KidzzAvatarConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveAvatar(next);
      return next;
    });
    const msg = FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)];
    setFeedbackMsg(msg);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1600);
  };

  const isLocked = (kind: "color" | "expression" | "outfit", id: string) => {
    if (isPremium) return false;
    if (kind === "color") return LOCKED_COLORS.includes(id);
    if (kind === "expression") return LOCKED_EXPRESSIONS.includes(id as AvatarExpression);
    if (kind === "outfit") return LOCKED_OUTFITS.includes(id as AvatarOutfit);
    return false;
  };

  const handleLocked = () => setShowPremiumCTA(true);

  const handleSave = () => {
    saveAvatar(config);
    // Mirror to legacy mascotConfig for compatibility
    const legacy: MascotConfig = {
      mascot: config.base,
      colorId: COLOR_LIBRARY.find((c) => c.hueRotate === config.hueRotate)?.id || "rosa",
      expression: config.expression,
      outfitId: config.outfit,
      energy: "calm",
    };
    localStorage.setItem(MASCOT_CONFIG_KEY, JSON.stringify(legacy));
    if (evolution?.customize) {
      evolution.customize({
        outfit: config.outfit,
        expression: config.expression as any,
      });
    }
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 }, colors: ["#10B981", "#FFD700", "#EC4899", "#fff"] });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onBack();
    }, 1800);
  };

  const handleShare = useCallback(async () => {
    const target = shareCardRef.current || heroRef.current;
    if (!target) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(target, {
        backgroundColor: "#0d0618",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
      if (!blob) throw new Error("blob_failed");
      const file = new File([blob], `meu-kidzz.png`, { type: "image/png" });
      const shareText = "Esse é meu KIDZZ!";
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Meu KIDZZ", text: shareText });
        toast.success("Compartilhado!");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "meu-kidzz.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem baixada!");
      }
    } catch {
      toast.error("Não foi possível compartilhar agora");
    } finally {
      setSharing(false);
    }
  }, []);

  const baseLabel = config.base === "ane" ? "Ane" : "Pixel";

  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 -z-0"
        style={{ background: "linear-gradient(160deg, #0d0618 0%, #121830 40%, #0a1628 70%, #0d0d1a 100%)" }}
      />

      {/* Header */}
      <div
        className="relative z-10 flex items-center justify-between px-4 pt-3 pb-1"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <motion.button
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/5 border border-white/10"
          whileTap={{ scale: 0.9 }}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-white/70" />
        </motion.button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white/90">Personalize seu KIDZZ</h1>
          <p className="text-[10px] text-emerald-300/50">{childName} cria o companheiro perfeito</p>
        </div>
        <motion.button
          onClick={handleShare}
          disabled={sharing}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/30 disabled:opacity-50"
          whileTap={{ scale: 0.9 }}
          aria-label="Compartilhar"
        >
          <Share2 size={18} className="text-emerald-300" />
        </motion.button>
      </div>

      {/* Base toggle */}
      <div className="relative z-10 flex justify-center gap-3 px-4 mt-1 mb-1">
        {(["ane", "pixel"] as AvatarBase[]).map((id) => (
          <motion.button
            key={id}
            onClick={() => update({ base: id })}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              config.base === id
                ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40"
                : "bg-white/5 text-white/35 border border-transparent"
            }`}
            whileTap={{ scale: 0.93 }}
          >
            {id === "ane" ? "Ane" : "Pixel"}
          </motion.button>
        ))}
      </div>

      {/* HERO AVATAR */}
      <div
        ref={heroRef}
        className="relative z-10 flex-shrink-0 flex flex-col items-center justify-center"
        style={{ minHeight: 240 }}
      >
        <KidzzAvatar config={config} size="xl" />

        <motion.div
          className="mt-2 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
          key={`${config.expression}-${config.outfit}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {EXPRESSION_LIBRARY.find((e) => e.id === config.expression)?.label} ·{" "}
          {OUTFIT_LIBRARY.find((o) => o.id === config.outfit)?.label}
        </motion.div>

        <AnimatePresence>
          {showFeedback && (
            <motion.p
              className="absolute bottom-0 text-xs font-bold text-amber-300/80"
              initial={{ opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {feedbackMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Off-screen share card (premium framing) */}
      <div className="fixed -left-[9999px] top-0">
        <div
          ref={shareCardRef}
          style={{
            width: 540,
            height: 540,
            background: "linear-gradient(160deg, #0d0618 0%, #1a1838 50%, #0a1628 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, opacity: 0.85 }}>
            Esse é meu KIDZZ!
          </p>
          <KidzzAvatar config={config} size="hero" interactive={false} />
          <p style={{ fontSize: 14, fontWeight: 600, marginTop: 18, color: "#10B981" }}>
            kidzz · companheiro digital
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 flex gap-1 px-4 mb-2 mt-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 shadow-lg shadow-emerald-500/10"
                  : "bg-white/5 text-white/35 border border-transparent"
              }`}
              whileTap={{ scale: 0.93 }}
            >
              <Icon size={16} />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Customization panel */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "color" && (
            <TabPanel key="color" title="Escolha a cor">
              <div className="grid grid-cols-3 gap-3">
                {COLOR_LIBRARY.map((c) => {
                  const locked = isLocked("color", c.id);
                  const selected = config.hueRotate === c.hueRotate;
                  return (
                    <PreviewButton
                      key={c.id}
                      selected={selected}
                      locked={locked}
                      label={c.label}
                      onClick={() => (locked ? handleLocked() : update({ hueRotate: c.hueRotate }))}
                    >
                      <KidzzAvatar
                        config={{ ...config, hueRotate: c.hueRotate }}
                        size="sm"
                        interactive={false}
                      />
                    </PreviewButton>
                  );
                })}
              </div>
            </TabPanel>
          )}

          {activeTab === "expression" && (
            <TabPanel key="expression" title="Como está se sentindo?">
              <div className="grid grid-cols-3 gap-3">
                {EXPRESSION_LIBRARY.map((e) => {
                  const locked = isLocked("expression", e.id);
                  const selected = config.expression === e.id;
                  return (
                    <PreviewButton
                      key={e.id}
                      selected={selected}
                      locked={locked}
                      label={e.label}
                      onClick={() => (locked ? handleLocked() : update({ expression: e.id }))}
                    >
                      <KidzzAvatar
                        config={{ ...config, expression: e.id }}
                        size="sm"
                        interactive={false}
                      />
                    </PreviewButton>
                  );
                })}
              </div>
            </TabPanel>
          )}

          {activeTab === "outfit" && (
            <TabPanel key="outfit" title="Escolha o traje">
              <div className="grid grid-cols-3 gap-3">
                {OUTFIT_LIBRARY.map((o) => {
                  const locked = isLocked("outfit", o.id);
                  const selected = config.outfit === o.id;
                  return (
                    <PreviewButton
                      key={o.id}
                      selected={selected}
                      locked={locked}
                      label={o.label}
                      onClick={() => (locked ? handleLocked() : update({ outfit: o.id }))}
                    >
                      <KidzzAvatar
                        config={{ ...config, outfit: o.id }}
                        size="sm"
                        interactive={false}
                      />
                    </PreviewButton>
                  );
                })}
              </div>
            </TabPanel>
          )}
        </AnimatePresence>
      </div>

      {/* Save button */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-3"
        style={{ background: "linear-gradient(to top, #0d0d1a 60%, transparent)" }}
      >
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="saved"
              className="w-full py-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <p className="text-emerald-200 font-bold text-sm">
                {childName} criou seu KIDZZ perfeito!
              </p>
            </motion.div>
          ) : (
            <motion.button
              key="save-btn"
              onClick={handleSave}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-sm shadow-2xl flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles size={18} />
              Salvar meu {baseLabel}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Premium CTA */}
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
              className="mx-6 p-6 rounded-3xl border border-emerald-400/30 text-center"
              style={{ background: "linear-gradient(160deg, #0d1a0a, #0a1628)" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Sparkles size={36} className="text-amber-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Item Premium</h3>
              <p className="text-sm text-emerald-200/60 mb-4">
                Desbloqueie todos os trajes, cores e expressões com o KIDZZ Premium.
              </p>
              <motion.button
                className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPremiumCTA(false)}
              >
                Desbloquear tudo
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

const TabPanel = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    <p className="text-sm font-bold text-white/60 mb-3">{title}</p>
    {children}
  </motion.div>
);

const PreviewButton = ({
  children,
  selected,
  locked,
  label,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  locked: boolean;
  label: string;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    className="relative rounded-2xl p-2 flex flex-col items-center gap-1 border transition-all duration-300"
    style={{
      borderColor: selected ? "rgba(16,185,129,0.55)" : "rgba(255,255,255,0.08)",
      background: selected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
      transform: selected ? "scale(1.04)" : "scale(1)",
      boxShadow: selected ? "0 0 18px rgba(16,185,129,0.3)" : "none",
      opacity: locked ? 0.5 : selected ? 1 : 0.7,
    }}
    whileTap={locked ? undefined : { scale: 0.94 }}
  >
    <div
      className="flex items-center justify-center"
      style={{ filter: locked ? "blur(2.5px)" : "none" }}
    >
      {children}
    </div>
    <span
      className={`text-[10px] font-semibold ${
        selected ? "text-emerald-200" : "text-white/55"
      }`}
    >
      {label}
    </span>
    {locked && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Lock size={16} className="text-white/70" />
      </div>
    )}
    {selected && !locked && (
      <Check size={12} className="absolute top-1.5 right-1.5 text-emerald-400" />
    )}
  </motion.button>
);

export default KidzzLab;
