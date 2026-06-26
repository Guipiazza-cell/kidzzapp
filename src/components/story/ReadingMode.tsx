/**
 * Modo Leitura imersivo — fullscreen com swipe entre páginas (cenas),
 * tipografia grande, narração integrada (play/pause), barra de progresso,
 * exportar PDF e fechar.
 *
 * Cada "página" = 1 cena. Swipe horizontal (drag) para virar.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Download,
  Loader2,
} from "lucide-react";
import { useTTS } from "@/hooks/useTTS";
import { exportStoryPDF } from "@/lib/exportStoryPDF";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";

interface Props {
  title: string;
  childName: string;
  story: string;
  images?: string[];
  onClose: () => void;
}

const ReadingMode = ({ title, childName, story, images = [], onClose }: Props) => {
  const scenes = useMemo(
    () => story.split(/\[CENA \d+\]/).map((s) => s.trim()).filter(Boolean),
    [story]
  );
  const total = scenes.length;
  const [page, setPage] = useState(0); // 0..total-1
  const [direction, setDirection] = useState<1 | -1>(1);
  const [exporting, setExporting] = useState(false);
  const [playing, setPlaying] = useState(false);

  const { speak, stop } = useTTS();

  // Stop TTS when changing page or unmounting
  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    stop();
    setPlaying(false);
  }, [page, stop]);

  const goTo = (next: number) => {
    if (next < 0 || next > total - 1 || next === page) return;
    haptic("light");
    setDirection(next > page ? 1 : -1);
    setPage(next);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x < -threshold) goTo(page + 1);
    else if (info.offset.x > threshold) goTo(page - 1);
  };

  const handlePlayPause = async () => {
    if (playing) {
      stop();
      setPlaying(false);
      haptic("light");
      return;
    }
    setPlaying(true);
    haptic("medium");
    try {
      await speak(scenes[page]);
    } finally {
      setPlaying(false);
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    haptic("medium");
    try {
      await exportStoryPDF({ title, childName, scenes, images });
      toast.success("PDF gerado! 📚");
      haptic("success");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o PDF");
    } finally {
      setExporting(false);
    }
  };

  const progress = total > 0 ? ((page + 1) / total) * 100 : 0;
  const sceneText = scenes[page] || "";
  const sceneImage = images[page];

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col bg-[#FFFCF5]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top bar */}
      <div
        className="relative px-4 pb-2 flex items-center gap-2 border-b border-amber-100"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 14px)" }}
      >
        <motion.button
          onClick={() => { haptic("light"); onClose(); }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-700"
          whileTap={{ scale: 0.9 }}
          aria-label="Fechar leitura"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">
            Cena {page + 1} de {total}
          </p>
          <p className="text-sm font-extrabold text-gray-800 truncate">{title}</p>
        </div>
        <motion.button
          onClick={handleExport}
          disabled={exporting}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-700 disabled:opacity-50"
          whileTap={{ scale: 0.9 }}
          aria-label="Exportar PDF"
          title="Exportar como PDF"
        >
          {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        </motion.button>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-amber-100 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-amber-500"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
      </div>

      {/* Page (swipeable) */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, rotateY: direction * 8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: direction * -60, rotateY: direction * -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden px-6 pt-4 pb-28"
            style={{ touchAction: "pan-y" }}
          >
            {sceneImage && (
              <img
                src={sceneImage}
                alt={`Cena ${page + 1}`}
                className="w-full max-h-[42vh] object-cover rounded-2xl shadow-md mb-5"
                draggable={false}
              />
            )}
            <div
              className="text-gray-800"
              style={{
                fontFamily: "'Nunito', system-ui, sans-serif",
                fontSize: "20px",
                lineHeight: 1.8,
              }}
            >
              {sceneText
                .split("\n")
                .map((p) => p.trim())
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i} className="mb-5">
                    {p}
                  </p>
                ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div
        className="absolute bottom-0 inset-x-0 px-4 pb-4 pt-3 bg-gradient-to-t from-[#FFFCF5] via-[#FFFCF5]/95 to-transparent"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 12px), 16px)" }}
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <motion.button
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-amber-200 text-amber-700 shadow-sm disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft size={22} />
          </motion.button>

          <motion.button
            onClick={handlePlayPause}
            whileTap={{ scale: 0.95 }}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl font-extrabold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF8C00, #F59E0B)" }}
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
            {playing ? "Pausar" : "Ouvir cena"}
          </motion.button>

          <motion.button
            onClick={() => goTo(page + 1)}
            disabled={page >= total - 1}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-amber-200 text-amber-700 shadow-sm disabled:opacity-40"
            aria-label="Próxima página"
          >
            <ChevronRight size={22} />
          </motion.button>
        </div>
        <p className="text-center text-[10px] text-amber-600/70 mt-2 font-semibold">
          ← Deslize para virar a página →
        </p>
      </div>
    </motion.div>
  );
};

export default ReadingMode;
