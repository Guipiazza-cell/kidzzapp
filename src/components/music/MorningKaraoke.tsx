import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, Pause, Sparkles } from "lucide-react";
import { MusicEngine, getTodaysSong, type Song } from "./MusicEngine";
import { addMusicXp, bumpCounter, type MusicAchievement } from "@/lib/musicXp";
import { useMemories } from "@/hooks/useMemories";
import { CAMALEAO } from "@/lib/camaleaoOficial";
import { FONT, SERIF, R, PAD } from "@/lib/premiumUi";

interface Props {
  onBack: () => void;
  childName: string;
  onAchievement?: (a: MusicAchievement) => void;
}

const DOCK_PAD = "calc(env(safe-area-inset-bottom, 0px) + 108px)";

const MorningKaraoke = ({ onBack, childName, onAchievement }: Props) => {
  const [song] = useState<Song>(() => getTodaysSong());
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const engineRef = useRef<MusicEngine | null>(null);
  const { addMemory } = useMemories();

  useEffect(() => {
    engineRef.current = new MusicEngine();
    return () => engineRef.current?.dispose();
  }, []);

  const handlePlay = async () => {
    if (!engineRef.current) return;
    if (playing) {
      engineRef.current.stopSong();
      setPlaying(false);
      setStepIndex(-1);
      return;
    }
    const ok = await engineRef.current.unlock();
    if (!ok) {
      console.warn("Áudio bloqueado pelo navegador");
      return;
    }
    setPlaying(true);
    setStepIndex(-1);
    engineRef.current.playSong(
      song,
      (i) => setStepIndex(i),
      () => handleComplete(),
    );
  };

  const handleComplete = () => {
    setPlaying(false);
    setCompleted(true);
    setShowCelebration(true);
    addMusicXp("karaoke");
    const ach = bumpCounter("karaoke");
    if (ach) onAchievement?.(ach);
    addMemory({
      type: "achievement",
      title: `Cantou: ${song.title}`,
      content: `${childName} concluiu o karaokê Bom Dia com Pixel`,
      is_special: false,
      image_url: null,
      metadata: { kind: "karaoke", song_id: song.id, song_title: song.title },
    });
    setTimeout(() => setShowCelebration(false), 3500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        fontFamily: FONT,
        background:
          "radial-gradient(ellipse at 50% 18%, hsl(210 55% 32%) 0%, hsl(220 48% 12%) 58%, hsl(222 50% 8%) 100%)",
        paddingBottom: DOCK_PAD,
      }}
    >
      {/* Header alinhado ao sistema */}
      <div
        className="relative z-10 flex items-center gap-3"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 12px), 12px)",
          paddingLeft: PAD,
          paddingRight: PAD,
          paddingBottom: 12,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="active:scale-90"
          aria-label="Voltar"
          style={{
            width: 44,
            height: 44,
            borderRadius: R.btn,
            flex: "none",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(160deg, rgba(255,255,255,.18), rgba(255,255,255,.08))",
            border: "0.5px solid rgba(255,255,255,.28)",
            boxShadow: "0 8px 20px rgba(0,0,0,.2), 0 1px 0 rgba(255,255,255,.2) inset",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
          }}
        >
          <ArrowLeft size={20} color="#fff" />
        </button>
        <div className="flex-1 min-w-0">
          <h1
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 18,
              color: "#FFFDF6",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Bom Dia com Pixel
          </h1>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,248,230,.65)",
            }}
          >
            A música de hoje, {childName}!
          </p>
        </div>
      </div>

      <div
        className="relative z-10 flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden"
        style={{
          padding: `8px ${PAD}px 16px`,
          minHeight: 0,
        }}
      >
        {/* Gui oficial com fones (premium) */}
        <button
          type="button"
          onClick={handlePlay}
          className="active:scale-[0.98]"
          style={{
            position: "relative",
            width: 200,
            height: 200,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            marginTop: 8,
          }}
          aria-label={playing ? "Pausar" : "Cantar"}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "8%",
              borderRadius: "50%",
              background: playing
                ? "radial-gradient(circle, rgba(255,200,100,.45), transparent 68%)"
                : "radial-gradient(circle, rgba(120,180,255,.35), transparent 68%)",
              filter: "blur(10px)",
              animation: "mk-glow 2.4s ease-in-out infinite",
            }}
          />
          <img
            src={CAMALEAO.headphonesSoft}
            alt="Pixel com fones de ouvido"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
              filter: "drop-shadow(0 16px 28px rgba(0,0,0,.35))",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = CAMALEAO.headphones;
            }}
          />
        </button>

        <div className="text-center" style={{ marginTop: 10 }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "rgba(255,210,140,.9)",
            }}
          >
            Música de hoje
          </p>
          <h2
            style={{
              margin: "6px 0 0",
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 26,
              color: "#FFFDF6",
              letterSpacing: "-0.02em",
            }}
          >
            {song.title}
          </h2>
        </div>

        {/* Letras */}
        <div className="w-full max-w-md" style={{ marginTop: 22 }}>
          <div
            style={{
              borderRadius: R.card,
              padding: "22px 18px",
              minHeight: 132,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(165deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.05) 100%)",
              border: "0.5px solid rgba(255,255,255,.2)",
              boxShadow: "0 12px 32px rgba(0,0,0,.28), 0 1px 0 rgba(255,255,255,.15) inset",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
            }}
          >
            <div className="flex flex-wrap justify-center gap-2">
              {song.steps.map((s, i) => (
                <motion.span
                  key={i}
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: FONT,
                  }}
                  animate={{
                    color:
                      i === stepIndex
                        ? "hsl(50 100% 72%)"
                        : i < stepIndex
                          ? "hsl(0 0% 92%)"
                          : "hsl(0 0% 55%)",
                    scale: i === stepIndex ? 1.22 : 1,
                    textShadow: i === stepIndex ? "0 0 18px hsl(50 100% 60%)" : "none",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {s.syllable}
                </motion.span>
              ))}
            </div>
          </div>
          <p
            style={{
              margin: "12px 0 0",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,248,230,.55)",
            }}
          >
            Cante junto seguindo as palavras douradas
          </p>
        </div>

        {/* CTA play */}
        <div className="flex flex-col items-center" style={{ marginTop: "auto", paddingTop: 20 }}>
          <motion.button
            type="button"
            onClick={handlePlay}
            whileTap={{ scale: 0.94 }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              border: "0.5px solid rgba(255,255,255,.45)",
              background: playing
                ? "radial-gradient(circle at 30% 25%, #FF8AA8, #D4456A 55%, #A82848)"
                : "radial-gradient(circle at 30% 25%, #FFE9A8, #F2C55C 55%, #C98F1E)",
              boxShadow: playing
                ? "0 12px 32px rgba(200,50,80,.45), 0 1px 0 rgba(255,255,255,.35) inset"
                : "0 12px 32px rgba(200,140,30,.45), 0 1px 0 rgba(255,255,255,.45) inset",
              cursor: "pointer",
            }}
            aria-label={playing ? "Pausar" : "Cantar"}
          >
            {playing ? <Pause size={34} color="#fff" /> : <Mic size={34} color="#3A2E14" />}
          </motion.button>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 14,
              fontWeight: 800,
              color: "#FFF8E8",
            }}
          >
            {playing ? "Cantando…" : completed ? "Tocar novamente" : "Cantar junto"}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes mk-glow{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
      `}</style>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-[70] pointer-events-none flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ paddingBottom: DOCK_PAD }}
          >
            <motion.div
              className="rounded-3xl px-6 py-5"
              style={{
                background: "linear-gradient(145deg, rgba(255,220,120,.95), rgba(232,160,40,.92))",
                border: "0.5px solid rgba(255,255,255,.55)",
                boxShadow: "0 20px 48px rgba(0,0,0,.35)",
              }}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              <Sparkles className="mx-auto mb-2 text-white" size={32} />
              <p className="text-white text-xl font-extrabold text-center">Você cantou!</p>
              <p className="text-amber-100 text-sm font-bold text-center mt-1">+12 sabedoria musical</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MorningKaraoke;
