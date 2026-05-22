import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Sparkles } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Texto principal (frase, conquista, momento) */
  text: string;
  /** Atribuição (ex: "criança · 5 anos", "Família Silva", "hoje") */
  attribution?: string;
  /** Emoji decorativo */
  emoji?: string;
  /** Variante visual */
  variant?: "morning" | "evening" | "night" | "joy";
}

const VARIANTS = {
  morning: { bg: ["#FFF3E0", "#FFE0B2", "#FFCC80"], ink: "#3D2817", accent: "#E67E22" },
  evening: { bg: ["#F8BBD0", "#E1BEE7", "#C5CAE9"], ink: "#3D1B4D", accent: "#9C27B0" },
  night:   { bg: ["#1A237E", "#283593", "#3949AB"], ink: "#FFFFFF", accent: "#FFD54F" },
  joy:     { bg: ["#FFFDE7", "#F0F4C3", "#DCEDC8"], ink: "#1B5E20", accent: "#7CB342" },
} as const;

/**
 * Modal viral — transforma um momento em card compartilhável (canvas → PNG).
 * Premium, com gradiente, branding sutil "kidzz.app".
 */
const ShareMomentCard = ({ open, onClose, text, attribution, emoji = "🤍", variant = "morning" }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const palette = VARIANTS[variant];

  // Render canvas whenever opens or text changes
  useEffect(() => {
    if (!open) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const W = 1080, H = 1350;
    c.width = W; c.height = H;

    // Gradient bg
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, palette.bg[0]);
    grad.addColorStop(0.5, palette.bg[1]);
    grad.addColorStop(1, palette.bg[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Soft radial highlight
    const radial = ctx.createRadialGradient(W / 2, H * 0.3, 50, W / 2, H * 0.3, W * 0.7);
    radial.addColorStop(0, "rgba(255,255,255,0.45)");
    radial.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, W, H);

    // Emoji
    ctx.font = "180px Apple Color Emoji, Segoe UI Emoji, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, W / 2, H * 0.28);

    // Quote text — wrap manually
    ctx.fillStyle = palette.ink;
    ctx.font = "bold 72px Nunito, system-ui, sans-serif";
    const maxWidth = W - 200;
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);

    const lineHeight = 88;
    const startY = H * 0.5 - (lines.length * lineHeight) / 2;
    lines.forEach((ln, i) => ctx.fillText(`"${i === 0 ? ln : ln}"`.replace(/^""|""$/g, '"'), W / 2, startY + i * lineHeight));
    // simpler: redraw lines without manipulating quotes inside each line
    ctx.clearRect(0, H * 0.4, W, H * 0.4);
    lines.forEach((ln, i) => {
      const display = i === 0 ? `"${ln}` : ln;
      const final = i === lines.length - 1 ? `${display}"` : display;
      ctx.fillText(final, W / 2, startY + i * lineHeight);
    });

    // Attribution
    if (attribution) {
      ctx.font = "500 36px Nunito, system-ui";
      ctx.fillStyle = palette.ink + "B0";
      ctx.fillText(`— ${attribution}`, W / 2, startY + lines.length * lineHeight + 60);
    }

    // Branding footer
    ctx.font = "bold 28px Nunito, system-ui";
    ctx.fillStyle = palette.accent;
    ctx.fillText("✨ kidzz.app", W / 2, H - 90);
    ctx.font = "500 22px Nunito, system-ui";
    ctx.fillStyle = palette.ink + "80";
    ctx.fillText("o app emocional da família", W / 2, H - 50);
  }, [open, text, attribution, emoji, palette]);

  const dataUrl = () => canvasRef.current?.toDataURL("image/png");

  const handleDownload = () => {
    const url = dataUrl();
    if (!url) return;
    haptic("medium"); sfx("click");
    const a = document.createElement("a");
    a.href = url;
    a.download = `kidzz-momento-${Date.now()}.png`;
    a.click();
  };

  const handleShare = async () => {
    const c = canvasRef.current;
    if (!c) return;
    setBusy(true);
    try {
      const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/png", 0.95));
      if (!blob) throw new Error("no blob");
      const file = new File([blob], "kidzz-momento.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        haptic("medium");
        await navigator.share({ files: [file], title: "Um momento Kidzz" });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="share-backdrop"
        className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-2xl"
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-[13px] font-bold text-neutral-800">Compartilhar momento</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5" aria-label="Fechar">
              <X size={16} />
            </button>
          </div>

          {/* Preview */}
          <div className="p-4 bg-neutral-50 flex justify-center">
            <canvas
              ref={canvasRef}
              className="w-full max-w-[260px] aspect-[4/5] rounded-2xl shadow-md"
              style={{ background: palette.bg[0] }}
            />
          </div>

          {/* Actions */}
          <div className="p-4 flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 h-12 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-1.5 bg-neutral-100 text-neutral-800 active:scale-[0.97] transition-transform"
            >
              <Download size={14} /> Baixar
            </button>
            <button
              onClick={handleShare}
              disabled={busy}
              className="flex-[1.4] h-12 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-1.5 text-white active:scale-[0.97] transition-transform"
              style={{
                background: `linear-gradient(135deg, ${palette.accent}, ${palette.ink})`,
                boxShadow: `0 10px 24px -10px ${palette.accent}`,
              }}
            >
              <Share2 size={14} /> {busy ? "Preparando..." : "Compartilhar"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareMomentCard;
