import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Download, Share2, Loader2, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import KidzzShareCard, { AchievementCategory } from "./KidzzShareCard";
import { captureAndShare, getChildName } from "@/lib/viralShare";
import html2canvas from "html2canvas";

interface Props {
  title: string;
  subtitle?: string;
  emoji: string;
  category: AchievementCategory;
  streakDays?: number;
  /** Suffix for tracking link, e.g. "achievement-streak-7" */
  shareSlug?: string;
  onClose: () => void;
}

const APP_URL = "https://kidzz.app";

const KidzzShareModal = ({
  title,
  subtitle,
  emoji,
  category,
  streakDays,
  shareSlug,
  onClose,
}: Props) => {
  const childName = getChildName();
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<null | "save" | "share" | "wpp">(null);

  const shareUrl = `${APP_URL}/lp?ref=${encodeURIComponent(shareSlug || "share")}`;
  const filename = `kidzz-${shareSlug || "conquista"}-${Date.now()}.png`;
  const text = `${childName} ${subtitle || `acabou de conquistar "${title}" no Kidzz! ${emoji}`} — vem aprender com a gente 💛`;

  const renderBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    return new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png", 0.95)
    );
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading("save");
    try {
      const blob = await renderBlob();
      if (!blob) throw new Error();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Imagem salva! 📥");
    } catch {
      toast.error("Não foi possível salvar agora");
    } finally {
      setLoading(null);
    }
  };

  const handleShare = async () => {
    if (loading || !cardRef.current) return;
    setLoading("share");
    try {
      const ok = await captureAndShare(cardRef.current, { title, text, filename });
      if (ok) toast.success("Compartilhado! ✨");
    } catch {
      toast.error("Não foi possível compartilhar");
    } finally {
      setLoading(null);
    }
  };

  const handleWhatsApp = async () => {
    if (loading) return;
    setLoading("wpp");
    try {
      // Try native share with file (works on mobile WhatsApp)
      if (cardRef.current) {
        const blob = await renderBlob();
        if (blob && navigator.canShare) {
          const file = new File([blob], filename, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title,
                text: `${text}\n\n${shareUrl}`,
                files: [file],
              });
              setLoading(null);
              return;
            } catch (e: any) {
              if (e?.name === "AbortError") {
                setLoading(null);
                return;
              }
            }
          }
        }
      }
      // Fallback: WhatsApp link with text only
      const wppUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`;
      window.open(wppUrl, "_blank");
    } finally {
      setLoading(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
      toast.success("Link copiado! 📋");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-sm font-black text-gray-800">
            Compartilhar conquista 🎉
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            aria-label="Fechar"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Preview (scaled card) */}
        <div className="px-5 pb-3 flex items-center justify-center bg-gray-50">
          <div
            className="my-3 rounded-2xl overflow-hidden shadow-lg"
            style={{ width: 200, height: 356 }}
          >
            <div style={{ transform: "scale(0.37)", transformOrigin: "top left" }}>
              <KidzzShareCard
                childName={childName}
                title={title}
                subtitle={subtitle}
                emoji={emoji}
                category={category}
                streakDays={streakDays}
                shareUrl={shareUrl}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleWhatsApp}
            disabled={loading !== null}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#25D366] text-white font-extrabold text-xs shadow-md disabled:opacity-60"
          >
            {loading === "wpp" ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
            WhatsApp
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleShare}
            disabled={loading !== null}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md disabled:opacity-60"
          >
            {loading === "share" ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
            Stories
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={loading !== null}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gray-900 text-white font-extrabold text-xs shadow-md disabled:opacity-60"
          >
            {loading === "save" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Salvar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleCopy}
            disabled={loading !== null}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gray-100 text-gray-700 font-extrabold text-xs"
          >
            <Link2 size={14} /> Copiar link
          </motion.button>
        </div>
      </motion.div>

      {/* Off-screen capture target — full size 540x960 */}
      <div
        style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}
        aria-hidden
      >
        <KidzzShareCard
          ref={cardRef}
          childName={childName}
          title={title}
          subtitle={subtitle}
          emoji={emoji}
          category={category}
          streakDays={streakDays}
          shareUrl={shareUrl}
        />
      </div>
    </motion.div>
  );
};

export default KidzzShareModal;
