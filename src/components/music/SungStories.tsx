import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Play, Pause, BookOpen } from "lucide-react";
import { MusicEngine } from "./MusicEngine";
import { SUNG_BOOKS, type SungBook } from "./sungBooks";
import { addMusicXp, bumpCounter, type MusicAchievement } from "@/lib/musicXp";
import { useMemories } from "@/hooks/useMemories";

interface Props {
  onBack: () => void;
  childName: string;
  onAchievement?: (a: MusicAchievement) => void;
}

const SungStories = ({ onBack, childName, onAchievement }: Props) => {
  const [book, setBook] = useState<SungBook | null>(null);
  const [chapter, setChapter] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const engineRef = useRef<MusicEngine | null>(null);
  const { addMemory } = useMemories();

  useEffect(() => {
    engineRef.current = new MusicEngine();
    return () => engineRef.current?.dispose();
  }, []);

  const playChapterMusic = async () => {
    if (!book || !engineRef.current) return;
    if (playing) {
      engineRef.current.stopSong();
      setPlaying(false);
      return;
    }
    const ok = await engineRef.current.unlock();
    if (!ok) {
      console.warn("Áudio bloqueado pelo navegador");
      return;
    }
    setPlaying(true);
    engineRef.current.playSong(
      book.chapters[chapter].music,
      undefined,
      () => setPlaying(false)
    );
  };

  const next = () => {
    engineRef.current?.stopSong();
    setPlaying(false);
    if (!book) return;
    if (chapter + 1 < book.chapters.length) {
      setChapter(chapter + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    if (!book || completed) return;
    setCompleted(true);
    addMusicXp("story");
    const ach = bumpCounter("story");
    if (ach) onAchievement?.(ach);
    addMemory({
      type: "achievement",
      title: `Ouviu: ${book.title}`,
      content: `${childName} escutou todos os capítulos cantados ${book.emoji}`,
      is_special: false,
      image_url: null,
      metadata: { kind: "sung_story", book_id: book.id },
    });
  };

  const closeBook = () => {
    engineRef.current?.stopSong();
    setBook(null);
    setChapter(0);
    setPlaying(false);
    setCompleted(false);
  };

  // ── Library view ──
  if (!book) {
    return (
      <motion.div
        className="fixed inset-0 z-40 flex flex-col overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ background: "radial-gradient(ellipse at 50% 25%, hsl(260 55% 30%), hsl(240 50% 12%) 75%)" }}
      >
        <div className="flex items-center gap-3 px-4 pb-3 border-b border-white/10"
          style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
          <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center" aria-label="Voltar">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg font-extrabold leading-tight">Histórias Cantadas 📖</h1>
            <p className="text-white/60 text-xs font-semibold">Escolha um livro, {childName}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 grid grid-cols-2 gap-3">
          {SUNG_BOOKS.map((b, i) => (
            <motion.button
              key={b.id}
              onClick={() => setBook(b)}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl p-4 text-left border border-white/15 relative overflow-hidden aspect-[3/4] flex flex-col justify-between"
              style={{ background: b.cover, boxShadow: "0 8px 24px hsl(220 50% 5% / 0.4)" }}
            >
              <div className="text-5xl drop-shadow-lg">{b.emoji}</div>
              <div>
                <p className="text-white text-sm font-extrabold leading-tight drop-shadow">{b.title}</p>
                <p className="text-white/70 text-[10px] font-bold mt-1 flex items-center gap-1">
                  <BookOpen size={10} /> {b.chapters.length} capítulos
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // ── Reading view ──
  const ch = book.chapters[chapter];
  const isLast = chapter === book.chapters.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: book.cover }}
    >
      {/* Floating notes when playing */}
      <AnimatePresence>
        {playing && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl text-white/80"
                style={{ left: `${10 + i * 11}%`, bottom: 0 }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -window.innerHeight, opacity: [0, 1, 1, 0], x: [0, 20, -10, 5] }}
                transition={{ duration: 4, delay: i * 0.3, repeat: Infinity }}
              >{["♪", "♫", "♩"][i % 3]}</motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center gap-3 px-4 pb-3 border-b border-white/15"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
        <button onClick={closeBook} className="w-11 h-11 rounded-full bg-white/15 backdrop-blur flex items-center justify-center" aria-label="Voltar">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-base font-extrabold leading-tight drop-shadow">{book.title}</h1>
          <p className="text-white/70 text-[11px] font-bold">Capítulo {chapter + 1} de {book.chapters.length}</p>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`page-${chapter}`}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformPerspective: 1200 }}
            className="w-full max-w-md rounded-3xl p-6 backdrop-blur-md border border-white/25"
          >
            <div style={{ background: "hsl(40 30% 96% / 0.95)", borderRadius: 20, padding: 24 }}>
              <p className="text-amber-700 text-[10px] font-extrabold uppercase tracking-wider">Capítulo {chapter + 1}</p>
              <h2 className="text-gray-800 text-2xl font-extrabold mt-1 mb-4">{ch.title}</h2>
              <p className="text-gray-700 text-base font-medium leading-relaxed">{ch.text}</p>

              <button
                onClick={playChapterMusic}
                className="mt-5 w-full rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-white font-extrabold transition-transform active:scale-95"
                style={{ background: book.cover }}
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
                {playing ? "Pausar trecho" : "🎵 Tocar trecho musical"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 px-5 pb-5"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 16px), 16px)" }}>
        <motion.button
          onClick={next}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-full py-4 px-6 flex items-center justify-center gap-2 text-white text-base font-extrabold border border-white/30 bg-white/15 backdrop-blur-md"
        >
          {isLast ? completed ? "Voltar à biblioteca" : "Concluir história ✨" : "Próximo capítulo"}
          {!completed && <ChevronRight size={20} />}
        </motion.button>
        {completed && isLast && (
          <p className="text-white text-center text-sm font-extrabold mt-3">+15 sabedoria musical 🎉</p>
        )}
      </div>
    </motion.div>
  );
};

export default SungStories;
