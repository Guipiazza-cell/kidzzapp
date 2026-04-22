/* Galeria de histórias criadas — busca memórias type=story do usuário */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { BookOpen, X, Calendar } from "lucide-react";
import { useMemories } from "@/hooks/useMemories";

interface StoryGalleryProps {
  onClose: () => void;
}

const StoryGallery = ({ onClose }: StoryGalleryProps) => {
  const { allMemories, loading } = useMemories();
  const [selected, setSelected] = useState<typeof allMemories[number] | null>(null);

  const stories = allMemories.filter((m) => m.type === "story");

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <motion.div
        className="relative mt-auto bg-gradient-to-b from-amber-50 via-orange-50/80 to-pink-50/60 rounded-t-3xl max-h-[85vh] flex flex-col"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-amber-200/50">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-amber-600" />
            <h2 className="text-base font-black text-gray-800">
              Histórias criadas
              <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {stories.length}
              </span>
            </h2>
          </div>
          <motion.button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 text-gray-600"
            whileTap={{ scale: 0.9 }}
            aria-label="Fechar"
          >
            <X size={18} />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">Carregando…</p>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">📖</span>
              <p className="text-gray-600 text-sm font-bold mb-1">Nenhuma história ainda</p>
              <p className="text-gray-400 text-xs">Crie sua primeira aventura!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stories.map((s) => (
                <motion.button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="text-left rounded-2xl bg-white/90 border border-amber-200/60 p-3 shadow-sm active:scale-95 transition-transform"
                  whileTap={{ scale: 0.97 }}
                >
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt=""
                      className="w-full aspect-square object-cover rounded-xl mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-xl mb-2 bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-3xl">
                      📖
                    </div>
                  )}
                  <p className="text-xs font-extrabold text-gray-800 line-clamp-2 leading-snug">
                    {s.title}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(s.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Story detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-gradient-to-b from-amber-50 to-orange-50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <div
              className="flex items-center gap-3 px-5 pb-3 border-b border-amber-200/50"
              style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
            >
              <motion.button
                onClick={() => setSelected(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 text-gray-600"
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
              <h3 className="text-base font-black text-gray-800 line-clamp-1 flex-1">
                {selected.title}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {selected.image_url && (
                <img
                  src={selected.image_url}
                  alt=""
                  className="w-full rounded-2xl shadow-md"
                />
              )}
              {selected.content && (
                <div className="prose prose-sm max-w-none">
                  {selected.content.split("\n").filter(p => p.trim()).map((p, i) => (
                    <p key={i} className="text-gray-700 text-sm leading-relaxed mb-3">
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryGallery;
