import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2, Share2, Loader2, BookOpen, Download } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";

import ShareableStoryCard from "../viral/ShareableStoryCard";
import { captureAndShare, getChildName } from "@/lib/viralShare";
import { toast } from "sonner";
import { useTypewriter } from "@/hooks/useTypewriter";
import ReadingMode from "./ReadingMode";
import { exportStoryPDF } from "@/lib/exportStoryPDF";
import { haptic } from "@/lib/haptics";
import { FONT, SERIF, R } from "@/lib/premiumUi";

interface StoryDisplayProps {
  story: string;
  images: string[];
  onReset: () => void;
  onSpeak?: (text: string) => Promise<void>;
  isPremium?: boolean;
}

const BG = "/exemplos/assets/cena-historias.png";

const dockGlass: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,.48) 0%, rgba(255,255,255,.26) 50%, rgba(255,255,255,.18) 100%)",
  border: "0.5px solid rgba(255,255,255,.62)",
  boxShadow:
    "0 14px 40px rgba(20,16,30,.14), 0 2px 8px rgba(20,16,30,.05), inset 0 1px 0 rgba(255,255,255,.78), inset 0 -1px 0 rgba(255,255,255,.1)",
  backdropFilter: "blur(36px) saturate(200%)",
  WebkitBackdropFilter: "blur(36px) saturate(200%)",
};

const dockCard: CSSProperties = {
  ...dockGlass,
  borderRadius: 26,
};

const dockPill: CSSProperties = {
  ...dockGlass,
  borderRadius: R.btn,
};

const StoryDisplay = ({ story, images, onReset, onSpeak, isPremium = false }: StoryDisplayProps) => {
  const scenes = story.split(/\[CENA \d+\]/).filter((s) => s.trim());
  const [playingScene, setPlayingScene] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [reading, setReading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const childName = getChildName();

  const firstScene = scenes[0] || "";
  const { shown: typedFirst, done: typedDone, skip: skipType } = useTypewriter(firstScene, 14);

  const storyTitle = (() => {
    const raw = scenes[0]?.trim() || "";
    const firstSentence = raw.split(/[.!?\n]/)[0]?.trim() || "Aventura mágica";
    return firstSentence.length > 60 ? firstSentence.slice(0, 57) + "..." : firstSentence || "Aventura mágica";
  })();

  const handleShare = async () => {
    if (!shareCardRef.current || sharing) return;
    setSharing(true);
    try {
      const ok = await captureAndShare(shareCardRef.current, {
        title: `Uma história mágica para ${childName}`,
        text: `Acabamos de criar "${storyTitle}" para ${childName} no KIDZZ! Histórias personalizadas que viram memória.`,
        filename: `kidzz-historia-${childName.toLowerCase()}.png`,
        surface: "story_display", contentType: "story",
      });
      if (ok) toast.success("História compartilhada!");
    } catch {
      toast.error("Não foi possível compartilhar agora");
    } finally {
      setSharing(false);
    }
  };

  const handleSpeak = async (scene: string, index: number) => {
    if (!onSpeak || playingScene !== null) return;
    haptic("medium");
    setPlayingScene(index);
    try {
      await onSpeak(scene);
    } finally {
      setPlayingScene(null);
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    haptic("medium");
    try {
      await exportStoryPDF({ title: storyTitle, childName, scenes, images });
      toast.success("PDF baixado!");
      haptic("success");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        fontFamily: FONT,
        position: "relative",
        margin: "0 -16px -8px",
        padding: "0 16px 24px",
      }}
    >
      {/* Fundo cênico */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -90,
          bottom: -60,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <img
          src={BG}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "40% 36%",
            filter: "saturate(1.05) brightness(1.05)",
            transform: "scale(1.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(255,236,180,.4) 0%, transparent 55%)," +
              "linear-gradient(180deg, rgba(255,252,248,.45) 0%, rgba(250,245,232,.7) 42%, rgba(248,244,230,.9) 100%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 14, paddingTop: 4 }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 10.5,
              fontWeight: 900,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "#D97A1E",
            }}
          >
            História pronta
          </p>
          <h2
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 24,
              lineHeight: 1.18,
              color: "#1A2818",
              letterSpacing: "-0.3px",
              textShadow: "0 1px 12px rgba(255,255,255,.5)",
            }}
          >
            Uma aventura mágica
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12.5,
              fontWeight: 700,
              color: "rgba(40,55,35,.55)",
            }}
          >
            Feita para o {childName}
          </p>
        </motion.div>

        {/* Modo leitura */}
        <motion.button
          type="button"
          onClick={() => {
            haptic("medium");
            setReading(true);
          }}
          whileTap={{ scale: 0.97 }}
          className="w-full active:scale-[0.98] flex items-center justify-center gap-2"
          style={{
            minHeight: 50,
            marginBottom: 12,
            borderRadius: R.btn,
            fontWeight: 900,
            fontSize: 14.5,
            color: "#2A1608",
            border: "0.5px solid rgba(255,235,190,.7)",
            background: "linear-gradient(180deg, #FBE09A 0%, #E8A838 48%, #C87818 100%)",
            boxShadow:
              "0 10px 24px rgba(180,100,20,.35), 0 1px 0 rgba(255,250,230,.9) inset, 0 -3px 8px rgba(100,50,0,.15) inset",
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          <BookOpen size={18} />
          Modo leitura imersivo
        </motion.button>

        {/* Cenas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {scenes.map((scene, i) => {
            const isFirst = i === 0;
            const sceneText = isFirst ? typedFirst : scene;
            const paragraphs = sceneText.split("\n").filter((p) => p.trim());
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                onClick={isFirst && !typedDone ? skipType : undefined}
                style={{
                  ...dockCard,
                  padding: 12,
                  cursor: isFirst && !typedDone ? "pointer" : "default",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: images[i] ? 10 : 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "#D97A1E",
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(232,130,26,.12)",
                      border: "0.5px solid rgba(232,130,26,.22)",
                    }}
                  >
                    Cena {i + 1}
                  </span>
                </div>

                {images[i] && (
                  <img
                    src={images[i]}
                    alt={`Cena ${i + 1}`}
                    style={{
                      width: "100%",
                      borderRadius: 18,
                      marginBottom: 12,
                      display: "block",
                      boxShadow: "0 10px 24px rgba(40,30,20,.18)",
                      border: "0.5px solid rgba(255,255,255,.5)",
                    }}
                  />
                )}

                {paragraphs.map((paragraph, pi) => (
                  <p
                    key={pi}
                    style={{
                      margin: pi === 0 ? 0 : "8px 0 0",
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.55,
                      color: "#1A2818",
                    }}
                  >
                    {paragraph}
                    {isFirst &&
                      !typedDone &&
                      pi === paragraphs.length - 1 && (
                        <span
                          style={{
                            display: "inline-block",
                            width: 2,
                            height: "1em",
                            background: "rgba(26,40,24,.55)",
                            marginLeft: 2,
                            verticalAlign: "middle",
                            animation: "pulse 1s ease-in-out infinite",
                          }}
                        />
                      )}
                  </p>
                ))}

                {onSpeak && (
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(scene, i);
                    }}
                    disabled={playingScene !== null}
                    whileTap={{ scale: 0.97 }}
                    className="active:scale-[0.98]"
                    style={{
                      marginTop: 12,
                      width: "100%",
                      minHeight: 46,
                      borderRadius: R.btn,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontWeight: 900,
                      fontSize: 13.5,
                      fontFamily: FONT,
                      cursor: playingScene !== null ? "default" : "pointer",
                      opacity: playingScene !== null && playingScene !== i ? 0.55 : 1,
                      color: playingScene === i ? "#2A3A22" : "#1A2818",
                      ...dockPill,
                      background:
                        playingScene === i
                          ? "linear-gradient(165deg, rgba(255,240,180,.55), rgba(255,220,120,.35))"
                          : dockGlass.background,
                      border:
                        playingScene === i
                          ? "0.5px solid rgba(255,210,100,.55)"
                          : dockGlass.border,
                    }}
                  >
                    <Volume2 size={18} />
                    {playingScene === i ? "Reproduzindo..." : `Ouvir cena ${i + 1}`}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Ações */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          <motion.button
            type="button"
            onClick={() => {
              haptic("light");
              import("@/components/viral/KidzzShareTrigger").then(({ triggerKidzzShare }) =>
                triggerKidzzShare({
                  title: storyTitle,
                  subtitle: `acabou de criar "${storyTitle}" no Kidzz!`,
                  emoji: "📖",
                  category: "story",
                  shareSlug: "story-created",
                }),
              );
            }}
            whileTap={{ scale: 0.97 }}
            className="w-full active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              minHeight: 48,
              ...dockPill,
              fontWeight: 900,
              fontSize: 13.5,
              color: "#1A2818",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <Share2 size={17} />
            Compartilhar esta história
          </motion.button>

          <motion.button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            whileTap={{ scale: 0.97 }}
            className="w-full active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              minHeight: 48,
              ...dockPill,
              fontWeight: 900,
              fontSize: 13.5,
              color: "#1A2818",
              opacity: exporting ? 0.6 : 1,
              cursor: exporting ? "wait" : "pointer",
              fontFamily: FONT,
            }}
          >
            {exporting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Montando livrinho...
              </>
            ) : (
              <>
                <Download size={17} />
                Exportar como PDF
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => {
              haptic("light");
              onReset();
            }}
            whileTap={{ scale: 0.97 }}
            className="w-full active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              minHeight: 48,
              ...dockPill,
              fontWeight: 800,
              fontSize: 13.5,
              color: "rgba(26,40,24,.7)",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <RotateCcw size={16} />
            Nova história
          </motion.button>
        </div>

        {/* Continuidade */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.45 }}
          style={{
            ...dockCard,
            marginTop: 14,
            padding: "16px 16px 14px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 16,
              color: "#1A2818",
              lineHeight: 1.25,
            }}
          >
            {isPremium
              ? `O universo de ${childName} continua amanhã`
              : "Amanhã a aventura continua"}
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12.5,
              fontWeight: 700,
              color: "rgba(40,55,35,.55)",
              lineHeight: 1.4,
            }}
          >
            {isPremium
              ? "Volte para escrever o próximo capítulo dessa história."
              : "Transforme isso em ritual. Capítulos contínuos esperam vocês."}
          </p>
          {!isPremium && (
            <motion.button
              type="button"
              onClick={() => {
                haptic("medium");
                window.dispatchEvent(
                  new CustomEvent("kidzz:open-paywall", {
                    detail: { context: "story_continuation" },
                  }),
                );
              }}
              whileTap={{ scale: 0.96 }}
              className="active:scale-[0.98]"
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                minHeight: 42,
                padding: "0 18px",
                borderRadius: R.btn,
                fontWeight: 900,
                fontSize: 12.5,
                color: "#2A1608",
                border: "0.5px solid rgba(255,235,190,.7)",
                background: "linear-gradient(180deg, #FBE09A 0%, #E8A838 48%, #C87818 100%)",
                boxShadow: "0 8px 18px rgba(180,100,20,.3)",
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              <BookOpen size={14} />
              Continuar essa história
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Off-screen capture */}
      <div
        style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none" }}
        aria-hidden
      >
        <ShareableStoryCard
          ref={shareCardRef}
          childName={childName}
          title={storyTitle}
          emoji="📖"
        />
      </div>

      <AnimatePresence>
        {reading && (
          <ReadingMode
            title={storyTitle}
            childName={childName}
            story={story}
            images={images}
            onClose={() => setReading(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryDisplay;
