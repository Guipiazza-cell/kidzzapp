import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, Square, Play, Save } from "lucide-react";
import { ForestAudioEngine } from "./ForestAudioEngine";
import AneMelodia from "./AneMelodia";
import { useMemories } from "@/hooks/useMemories";
import { bumpCounter } from "./forestCollectibles";

interface Props {
  onBack: () => void;
  childName: string;
  onCollectibleUnlocked?: (id: string) => void;
}

type Turn = "intro" | "parent" | "parent_done" | "child" | "child_done" | "review";

const SingTogether = ({ onBack, childName, onCollectibleUnlocked }: Props) => {
  const engineRef = useRef<ForestAudioEngine | null>(null);
  const [turn, setTurn] = useState<Turn>("intro");
  const [parentBlob, setParentBlob] = useState<Blob | null>(null);
  const [childBlob, setChildBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [waveLevel, setWaveLevel] = useState(0);
  const { addMemory } = useMemories();
  const [saved, setSaved] = useState(false);
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    engineRef.current = new ForestAudioEngine();
    return () => {
      engineRef.current?.dispose();
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  // Animated waveform tick
  useEffect(() => {
    if (!recording) {
      setWaveLevel(0);
      return;
    }
    const tick = () => {
      setWaveLevel(0.4 + Math.random() * 0.6);
      animFrame.current = requestAnimationFrame(tick);
    };
    animFrame.current = requestAnimationFrame(tick);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, [recording]);

  const startRec = async () => {
    const ok = await engineRef.current?.startRecording();
    if (ok) setRecording(true);
    else alert("Não conseguimos acessar o microfone. Verifique as permissões.");
  };

  const stopRec = async () => {
    const blob = await engineRef.current?.stopRecording();
    setRecording(false);
    if (!blob) return;
    if (turn === "parent") {
      setParentBlob(blob);
      setTurn("parent_done");
    } else if (turn === "child") {
      setChildBlob(blob);
      setTurn("child_done");
    }
  };

  const playBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };

  const saveDuet = async () => {
    if (!parentBlob || !childBlob) return;
    // Convert to data URLs for local persistence (small recordings)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      await addMemory({
        type: "achievement",
        title: `🎶 Dueto com ${childName}`,
        content: "Cantamos juntos na Floresta dos Sons",
        is_special: true,
        image_url: null,
        metadata: { kind: "duet", audio: dataUrl, length: childBlob.size },
      });
      const result = bumpCounter("duets");
      if (result.unlocked && onCollectibleUnlocked) onCollectibleUnlocked(result.unlocked);
      setSaved(true);
      setTurn("review");
    };
    reader.readAsDataURL(childBlob);
  };

  const Wave = ({ color, active }: { color: string; active: boolean }) => (
    <div className="flex items-end gap-1 h-16">
      {Array.from({ length: 18 }).map((_, i) => {
        const seed = (Math.sin(i * 1.7) + 1) / 2;
        const h = active ? 8 + waveLevel * 50 * (0.4 + seed * 0.6) : 6 + seed * 8;
        return (
          <motion.div
            key={i}
            className="w-1.5 rounded-full"
            style={{ background: color, height: h }}
            animate={{ height: h }}
            transition={{ duration: 0.08 }}
          />
        );
      })}
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 z-[58] flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: "linear-gradient(180deg, hsl(220 35% 12%), hsl(280 30% 14%) 60%, hsl(340 35% 18%))" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pb-3 border-b border-white/10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}
      >
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-lg font-extrabold">Cantar Juntos</h1>
          <p className="text-white/60 text-xs">Pai canta. {childName} responde. 💛</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
        {/* Split screen */}
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-[360px]">
          {/* Parent side */}
          <motion.div
            className={`relative rounded-3xl p-4 flex flex-col items-center justify-between border ${
              turn === "parent" || turn === "parent_done" ? "border-blue-300/50 shadow-[0_0_30px_rgba(59,130,246,0.4)]" : "border-white/10"
            }`}
            style={{ background: "linear-gradient(180deg, hsl(220 60% 25% / 0.6), hsl(220 50% 18% / 0.6))" }}
            animate={{ scale: turn === "parent" || turn === "parent_done" ? 1 : 0.97, opacity: turn === "child" || turn === "child_done" ? 0.5 : 1 }}
          >
            <div className="text-center">
              <div className="text-3xl mb-1">👨</div>
              <p className="text-white text-sm font-bold">Pai/Mãe</p>
            </div>
            <Wave color="hsl(210 90% 70%)" active={recording && turn === "parent"} />
            <p className="text-white/60 text-[10px] text-center font-semibold">
              {turn === "parent" && (recording ? "Cantando..." : "Toque o microfone")}
              {turn === "parent_done" && "✓ Gravado"}
              {parentBlob && (
                <button onClick={() => playBlob(parentBlob)} className="mt-1 text-blue-300 underline">▶ Ouvir</button>
              )}
            </p>
          </motion.div>

          {/* Child side */}
          <motion.div
            className={`relative rounded-3xl p-4 flex flex-col items-center justify-between border ${
              turn === "child" || turn === "child_done" ? "border-pink-300/50 shadow-[0_0_30px_rgba(236,72,153,0.4)]" : "border-white/10"
            }`}
            style={{ background: "linear-gradient(180deg, hsl(340 60% 25% / 0.6), hsl(340 50% 18% / 0.6))" }}
            animate={{ scale: turn === "child" || turn === "child_done" ? 1 : 0.97, opacity: turn === "parent" || turn === "parent_done" || turn === "intro" ? 0.5 : 1 }}
          >
            <div className="text-center">
              <AneMelodia mood={recording && turn === "child" ? "sing" : "idle"} size="sm" />
              <p className="text-white text-sm font-bold mt-1">{childName}</p>
            </div>
            <Wave color="hsl(340 90% 75%)" active={recording && turn === "child"} />
            <p className="text-white/60 text-[10px] text-center font-semibold">
              {turn === "child" && (recording ? "Cantando..." : "Toque o microfone")}
              {turn === "child_done" && "✓ Gravado"}
              {childBlob && (
                <button onClick={() => playBlob(childBlob)} className="mt-1 text-pink-300 underline">▶ Ouvir</button>
              )}
            </p>
          </motion.div>
        </div>

        {/* Action footer */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <AnimatePresence mode="wait">
            {turn === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <p className="text-white/80 text-sm font-semibold mb-3 max-w-xs">
                  Pai canta um pedacinho. {childName} responde com a sua melodia. 🎶
                </p>
                <button onClick={() => setTurn("parent")} className="px-7 py-3 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 text-white font-extrabold shadow-xl">
                  Começar dueto
                </button>
              </motion.div>
            )}
            {(turn === "parent" || turn === "child") && (
              <motion.button
                key="rec"
                onClick={recording ? stopRec : startRec}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  background: recording
                    ? "linear-gradient(135deg, hsl(0 80% 60%), hsl(340 80% 55%))"
                    : turn === "parent"
                    ? "linear-gradient(135deg, hsl(210 90% 60%), hsl(220 80% 55%))"
                    : "linear-gradient(135deg, hsl(340 90% 65%), hsl(320 80% 60%))",
                }}
                animate={recording ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
                whileTap={{ scale: 0.92 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                {recording ? <Square size={28} className="text-white" fill="white" /> : <Mic size={32} className="text-white" />}
              </motion.button>
            )}
            {turn === "parent_done" && (
              <motion.button key="next-child" onClick={() => setTurn("child")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 text-white font-extrabold shadow-xl">
                Vez de {childName} 💛
              </motion.button>
            )}
            {turn === "child_done" && (
              <motion.button key="save" onClick={saveDuet} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold shadow-xl flex items-center gap-2">
                <Save size={18} /> Salvar dueto
              </motion.button>
            )}
            {turn === "review" && saved && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="text-4xl mb-2">💛</div>
                <p className="text-white text-base font-extrabold">Dueto salvo no Álbum de Memórias</p>
                <button onClick={onBack} className="mt-3 px-5 py-2 rounded-full bg-white/10 text-white text-sm font-bold">Voltar à floresta</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SingTogether;
