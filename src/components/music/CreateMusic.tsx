import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Play, Pause, Share2, Save } from "lucide-react";
import { MusicEngine, type Song, type SongStep } from "./MusicEngine";
import { addMusicXp, bumpCounter, type MusicAchievement } from "@/lib/musicXp";
import { useMemories } from "@/hooks/useMemories";

interface Props {
  onBack: () => void;
  childName: string;
  onAchievement?: (a: MusicAchievement) => void;
}

type Seed = { id: string; emoji: string; label: string; scale: string[] };
type Mood = { id: string; emoji: string; label: string; bpm: number; modifier: "high" | "mid" | "low" };
type Rhythm = { id: string; emoji: string; label: string; pattern: number[] };

const SEEDS: Seed[] = [
  { id: "sun", emoji: "☀️", label: "Semente do Sol", scale: ["C5", "E5", "G5", "A5", "C5", "G5"] },
  { id: "moon", emoji: "🌙", label: "Semente da Lua", scale: ["A4", "C5", "E5", "G5", "C5", "A4"] },
  { id: "river", emoji: "🌊", label: "Semente do Rio", scale: ["D5", "F5", "A5", "F5", "D5", "G5"] },
  { id: "forest", emoji: "🌿", label: "Semente da Floresta", scale: ["E5", "G5", "B5", "G5", "E5", "C5"] },
];

const MOODS: Mood[] = [
  { id: "happy", emoji: "😄", label: "Feliz", bpm: 130, modifier: "high" },
  { id: "calm", emoji: "😌", label: "Calmo", bpm: 80, modifier: "mid" },
  { id: "playful", emoji: "🤪", label: "Brincalhão", bpm: 140, modifier: "high" },
  { id: "dreamy", emoji: "✨", label: "Sonhador", bpm: 90, modifier: "low" },
];

const RHYTHMS: Rhythm[] = [
  { id: "soft", emoji: "🍃", label: "Suave", pattern: [1, 0, 0, 1, 0, 0] },
  { id: "march", emoji: "🥁", label: "Marcha", pattern: [1, 0, 1, 0, 1, 0] },
  { id: "groove", emoji: "🎶", label: "Balanço", pattern: [1, 1, 0, 1, 0, 1] },
];

function buildSong(seed: Seed, mood: Mood, rhythm: Rhythm, name: string): Song {
  const baseDur = 60 / mood.bpm; // seconds per beat
  // syllabify name into 1-3 syllables
  const syllables = name.match(/.{1,2}/g)?.slice(0, 3) || [name];
  const steps: SongStep[] = [];
  // Intro: name as melody
  syllables.forEach((syl, i) => {
    steps.push({ note: seed.scale[i % seed.scale.length], dur: baseDur * 1.5, syllable: syl });
  });
  // Body: scale ride synced with rhythm pattern
  const filler = ["la", "lá", "tum", "tim", "tan", "lê"];
  seed.scale.forEach((note, i) => {
    if (rhythm.pattern[i % rhythm.pattern.length]) {
      steps.push({ note, dur: baseDur, syllable: filler[i % filler.length] });
    } else {
      steps.push({ note, dur: baseDur * 0.6 });
    }
  });
  // Outro: name again, lifted
  syllables.forEach((syl, i) => {
    const note = seed.scale[(seed.scale.length - 1 - i) % seed.scale.length];
    steps.push({ note, dur: baseDur * 1.2, syllable: syl });
  });
  // final chord
  steps.push({ note: seed.scale[0], dur: baseDur * 2.5, syllable: "✨" });
  return { id: `custom-${Date.now()}`, title: `Música de ${name}`, emoji: seed.emoji, bpm: mood.bpm, steps };
}

const CreateMusic = ({ onBack, childName, onAchievement }: Props) => {
  const [step, setStep] = useState<"seed" | "mood" | "rhythm" | "result">("seed");
  const [seed, setSeed] = useState<Seed | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [rhythm, setRhythm] = useState<Rhythm | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [saved, setSaved] = useState(false);
  const engineRef = useRef<MusicEngine | null>(null);
  const { addMemory } = useMemories();

  useEffect(() => {
    engineRef.current = new MusicEngine();
    return () => engineRef.current?.dispose();
  }, []);

  const generate = (s: Seed, m: Mood, r: Rhythm) => {
    const generated = buildSong(s, m, r, childName);
    setSong(generated);
    setStep("result");
    addMusicXp("create");
    const ach = bumpCounter("create");
    if (ach) onAchievement?.(ach);
  };

  const play = () => {
    if (!song || !engineRef.current) return;
    if (playing) {
      engineRef.current.stopSong();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    setStepIdx(-1);
    engineRef.current.playSong(
      song,
      (i) => setStepIdx(i),
      () => { setPlaying(false); setStepIdx(-1); }
    );
  };

  const save = () => {
    if (!song || saved) return;
    setSaved(true);
    addMemory({
      type: "achievement",
      title: `Compôs: ${song.title}`,
      content: `${childName} criou uma música com ${seed?.label}, ${mood?.label} e ritmo ${rhythm?.label}!`,
      is_special: true,
      image_url: null,
      metadata: { kind: "composition", seed: seed?.id, mood: mood?.id, rhythm: rhythm?.id },
    });
  };

  const share = async () => {
    if (!song) return;
    const text = `🎼 ${childName} compôs "${song.title}" no KIDZZ! ${seed?.emoji}${mood?.emoji}${rhythm?.emoji}`;
    addMusicXp("share");
    if (navigator.share) {
      try { await navigator.share({ title: song.title, text }); } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(text); } catch { /* noop */ }
    }
  };

  const restart = () => {
    engineRef.current?.stopSong();
    setSong(null); setSeed(null); setMood(null); setRhythm(null);
    setStep("seed"); setSaved(false); setPlaying(false); setStepIdx(-1);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: "radial-gradient(ellipse at 50% 25%, hsl(160 60% 28%), hsl(220 50% 10%) 75%)" }}
    >
      {/* Lab particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 67) % 100}%`,
              top: `${(i * 43) % 100}%`,
              width: 4, height: 4,
              background: `hsl(${140 + (i % 4) * 30} 80% 70%)`,
              boxShadow: `0 0 10px hsl(${140 + (i % 4) * 30} 80% 60%)`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center gap-3 px-4 pb-3 border-b border-white/10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center" aria-label="Voltar">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-lg font-extrabold leading-tight">Crie Sua Música 🎼</h1>
          <p className="text-white/60 text-xs font-semibold">
            {step === "seed" && "Escolha uma semente sonora"}
            {step === "mood" && "Qual humor de hoje?"}
            {step === "rhythm" && "E o ritmo?"}
            {step === "result" && `A música de ${childName}!`}
          </p>
        </div>
        {/* Progress dots */}
        {step !== "result" && (
          <div className="flex gap-1.5">
            {["seed", "mood", "rhythm"].map((s) => (
              <div key={s} className={`w-2 h-2 rounded-full ${s === step ? "bg-amber-300" : "bg-white/20"}`} />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {step === "seed" && (
            <motion.div key="seed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {SEEDS.map((s, i) => (
                <motion.button
                  key={s.id}
                  onClick={() => { setSeed(s); setStep("mood"); }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="w-full rounded-3xl p-4 text-left flex items-center gap-4 border border-white/15 backdrop-blur"
                  style={{ background: "linear-gradient(135deg, hsl(160 30% 20% / 0.7), hsl(220 35% 12% / 0.7))" }}
                >
                  <motion.div className="text-5xl" animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}>
                    {s.emoji}
                  </motion.div>
                  <div>
                    <p className="text-white text-base font-extrabold">{s.label}</p>
                    <p className="text-white/60 text-xs font-semibold">Notas únicas</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {step === "mood" && (
            <motion.div key="mood" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3">
              {MOODS.map((m, i) => (
                <motion.button
                  key={m.id}
                  onClick={() => { setMood(m); setStep("rhythm"); }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                  className="aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 border border-white/15 backdrop-blur"
                  style={{ background: "linear-gradient(135deg, hsl(160 30% 20% / 0.7), hsl(220 35% 12% / 0.7))" }}
                >
                  <div className="text-5xl">{m.emoji}</div>
                  <p className="text-white text-sm font-extrabold">{m.label}</p>
                </motion.button>
              ))}
            </motion.div>
          )}

          {step === "rhythm" && (
            <motion.div key="rhythm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {RHYTHMS.map((r, i) => (
                <motion.button
                  key={r.id}
                  onClick={() => { setRhythm(r); generate(seed!, mood!, r); }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="w-full rounded-3xl p-4 text-left flex items-center gap-4 border border-white/15 backdrop-blur"
                  style={{ background: "linear-gradient(135deg, hsl(160 30% 20% / 0.7), hsl(220 35% 12% / 0.7))" }}
                >
                  <div className="text-5xl">{r.emoji}</div>
                  <div className="flex-1">
                    <p className="text-white text-base font-extrabold">{r.label}</p>
                    <div className="flex gap-1 mt-1.5">
                      {r.pattern.map((p, j) => (
                        <div key={j} className="w-3 h-3 rounded" style={{ background: p ? "hsl(50 95% 60%)" : "hsl(0 0% 100% / 0.15)" }} />
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {step === "result" && song && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="text-center">
                <motion.div className="text-7xl mb-2" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  {seed?.emoji}{mood?.emoji}{rhythm?.emoji}
                </motion.div>
                <p className="text-amber-200 text-[10px] font-extrabold uppercase tracking-wider">Sua composição</p>
                <h2 className="text-white text-2xl font-extrabold mt-1">{song.title}</h2>
              </div>

              {/* Lyrics with current syllable highlighted */}
              <div className="rounded-3xl p-5 backdrop-blur-md border border-white/15"
                style={{ background: "linear-gradient(180deg, hsl(220 40% 18% / 0.5), hsl(220 50% 8% / 0.6))" }}>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {song.steps.filter((s) => s.syllable).map((s, i, arr) => {
                    const realIdx = song.steps.findIndex((x, idx) => x.syllable && song.steps.slice(0, idx + 1).filter((y) => y.syllable).length === i + 1);
                    return (
                      <motion.span key={i} className="text-xl font-extrabold"
                        animate={{
                          color: realIdx === stepIdx ? "hsl(50 100% 70%)" : "hsl(0 0% 85%)",
                          scale: realIdx === stepIdx ? 1.25 : 1,
                          textShadow: realIdx === stepIdx ? "0 0 14px hsl(50 100% 60%)" : "none",
                        }}
                        transition={{ duration: 0.15 }}
                      >{s.syllable}</motion.span>
                    );
                  })}
                </div>
              </div>

              {/* Big play */}
              <div className="flex justify-center">
                <motion.button
                  onClick={play}
                  whileTap={{ scale: 0.94 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: playing
                      ? "radial-gradient(circle, hsl(340 80% 60%), hsl(340 70% 40%))"
                      : "radial-gradient(circle, hsl(140 80% 55%), hsl(180 70% 45%))",
                    boxShadow: "0 0 40px hsl(140 80% 50% / 0.5)",
                  }}
                >
                  {playing ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white ml-1" />}
                </motion.button>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={save}
                  whileTap={{ scale: 0.96 }}
                  disabled={saved}
                  className="rounded-2xl py-3 flex items-center justify-center gap-2 text-white font-extrabold border border-white/20 disabled:opacity-60"
                  style={{ background: saved ? "hsl(140 50% 30% / 0.5)" : "linear-gradient(135deg, hsl(140 70% 35%), hsl(180 60% 30%))" }}
                >
                  <Save size={16} /> {saved ? "Salva!" : "Salvar"}
                </motion.button>
                <motion.button
                  onClick={share}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-2xl py-3 flex items-center justify-center gap-2 text-white font-extrabold border border-white/20"
                  style={{ background: "linear-gradient(135deg, hsl(280 70% 45%), hsl(340 65% 45%))" }}
                >
                  <Share2 size={16} /> Compartilhar
                </motion.button>
              </div>

              <motion.button
                onClick={restart}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-2xl py-3 text-white text-sm font-extrabold border border-white/20 bg-white/5"
              >
                <Sparkles size={14} className="inline mr-1" /> Criar outra música
              </motion.button>

              <p className="text-center text-white/50 text-[11px] font-semibold">+25 sabedoria musical 🎉</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CreateMusic;
