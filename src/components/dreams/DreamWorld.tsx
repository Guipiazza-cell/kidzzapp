import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Play, Pause, Lock, Crown, Timer, BookOpen, Music, ChevronRight, Volume2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTTS } from "@/hooks/useTTS";
import { Slider } from "@/components/ui/slider";

/* ── Sleep stories ── */
const SLEEP_STORIES = [
  {
    id: "estrelas",
    title: "A Viagem das Estrelas",
    emoji: "⭐",
    free: true,
    text: "Era uma vez uma estrelinha que morava no céu mais alto. Toda noite, ela descia devagar pelo céu escuro, deixando um rastro de luz dourada. Ela passava por nuvens fofas como travesseiros, e cada nuvem sussurrava: durma bem. A estrelinha pousava no topo da montanha mais macia do mundo, fechava seus olhinhos brilhantes, e o céu inteiro ficava em silêncio. Tudo estava calmo. Tudo estava em paz.",
  },
  {
    id: "floresta-encantada",
    title: "A Floresta que Dormia",
    emoji: "🌲",
    free: false,
    text: "No fundo de uma floresta verde e silenciosa, os animais se preparavam para dormir. O coelho cobria suas orelhas com folhas macias. A coruja fechava os olhos devagar. O rio parava de correr tão rápido e virava um sussurro. As árvores balançavam de leve, como se estivessem cantando uma canção de ninar sem palavras. E você, deitado na grama macia, sentia o vento suave no rosto. Tudo ficava quieto. Tudo ficava bom.",
  },
  {
    id: "nuvem-magica",
    title: "A Nuvem Mágica",
    emoji: "☁️",
    free: false,
    text: "Uma nuvem grande e fofa desceu do céu só para você. Ela era macia como algodão e quentinha como um cobertor. Você subiu nela devagar, e ela começou a flutuar pelo céu da noite. Passaram pela lua, que sorriu. Passaram por estrelas que piscavam como olhinhos. A nuvem balançava de leve, para lá e para cá. E você foi fechando os olhos, sentindo que estava no lugar mais seguro do mundo.",
  },
  {
    id: "oceano-calmo",
    title: "O Oceano Calmo",
    emoji: "🌊",
    free: false,
    text: "O mar estava calmo. As ondas iam e vinham, devagar, como uma respiração. Um barquinho pequeno balançava suavemente na água azul. Dentro dele, havia uma caminha macia com cobertores e estrelas bordadas. O som das ondas era como uma música. O céu estava cheio de estrelas. E o barquinho seguia flutuando, sem pressa, levando você para o sono mais gostoso do mundo.",
  },
];

/* ── Ambient sounds (Web Audio API generated) ── */
const SOUND_PRESETS = [
  { id: "rain", label: "Chuva", emoji: "🌧️", free: true },
  { id: "forest", label: "Floresta", emoji: "🌲", free: false },
  { id: "ocean", label: "Oceano", emoji: "🌊", free: false },
  { id: "wind", label: "Vento", emoji: "💨", free: false },
  { id: "white", label: "Ruído Branco", emoji: "📻", free: false },
  { id: "brown", label: "Ruído Marrom", emoji: "🟤", free: false },
];

const TIMER_OPTIONS = [
  { minutes: 10, label: "10 min" },
  { minutes: 20, label: "20 min" },
  { minutes: 30, label: "30 min" },
];

/* ── Noise generator using Web Audio API ── */
class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private nodes: Map<string, { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode }> = new Map();
  private masterGain: GainNode | null = null;

  private getCtx() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private createNoise(type: "white" | "brown"): AudioBufferSourceNode {
    const ctx = this.getCtx();
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else {
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  private createFilteredNoise(lowFreq: number, highFreq: number, type: "white" | "brown" = "white"): AudioBufferSourceNode {
    return this.createNoise(type);
  }

  start(soundId: string, volume: number = 0.5) {
    if (this.nodes.has(soundId)) return;
    const ctx = this.getCtx();
    const gain = ctx.createGain();
    gain.gain.value = volume * 0.3;
    gain.connect(this.masterGain!);

    let source: AudioBufferSourceNode;

    switch (soundId) {
      case "rain":
        source = this.createNoise("white");
        // Add a filter for rain-like effect
        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = "bandpass";
        rainFilter.frequency.value = 3000;
        rainFilter.Q.value = 0.5;
        source.connect(rainFilter);
        rainFilter.connect(gain);
        break;
      case "ocean":
        source = this.createNoise("brown");
        const oceanFilter = ctx.createBiquadFilter();
        oceanFilter.type = "lowpass";
        oceanFilter.frequency.value = 500;
        source.connect(oceanFilter);
        oceanFilter.connect(gain);
        break;
      case "forest":
        source = this.createNoise("white");
        const forestFilter = ctx.createBiquadFilter();
        forestFilter.type = "bandpass";
        forestFilter.frequency.value = 1500;
        forestFilter.Q.value = 2;
        source.connect(forestFilter);
        forestFilter.connect(gain);
        gain.gain.value = volume * 0.15;
        break;
      case "wind":
        source = this.createNoise("brown");
        const windFilter = ctx.createBiquadFilter();
        windFilter.type = "lowpass";
        windFilter.frequency.value = 300;
        source.connect(windFilter);
        windFilter.connect(gain);
        break;
      case "white":
        source = this.createNoise("white");
        source.connect(gain);
        gain.gain.value = volume * 0.15;
        break;
      case "brown":
        source = this.createNoise("brown");
        source.connect(gain);
        gain.gain.value = volume * 0.2;
        break;
      default:
        source = this.createNoise("white");
        source.connect(gain);
    }

    source.start();
    this.nodes.set(soundId, { source, gain });
  }

  stop(soundId: string) {
    const node = this.nodes.get(soundId);
    if (node) {
      node.source.stop();
      node.gain.disconnect();
      this.nodes.delete(soundId);
    }
  }

  setVolume(soundId: string, volume: number) {
    const node = this.nodes.get(soundId);
    if (node) {
      node.gain.gain.value = volume * 0.3;
    }
  }

  fadeOut(durationMs: number = 5000) {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
  }

  stopAll() {
    this.nodes.forEach((node) => {
      node.source.stop();
      node.gain.disconnect();
    });
    this.nodes.clear();
    if (this.masterGain) {
      this.masterGain.gain.value = 1;
    }
  }

  isPlaying(soundId: string) {
    return this.nodes.has(soundId);
  }
}

/* ── Floating stars background ── */
const DreamStars = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white/60"
        style={{
          width: Math.random() * 3 + 1,
          height: Math.random() * 3 + 1,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
      />
    ))}
  </div>
);

/* ── Main component ── */
interface Props {
  onBack: () => void;
}

type DreamView = "main" | "playing";

const DreamWorld = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const { speak, stop: stopTTS } = useTTS();
  const isPremium = profile?.is_premium === true;

  const engineRef = useRef<AmbientSoundEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [view, setView] = useState<DreamView>("main");
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [activeSounds, setActiveSounds] = useState<Record<string, number>>({});
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPremiumBlock, setShowPremiumBlock] = useState(false);

  useEffect(() => {
    engineRef.current = new AmbientSoundEngine();
    return () => {
      engineRef.current?.stopAll();
      stopTTS();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const canAccess = useCallback((free: boolean) => free || isPremium, [isPremium]);

  const toggleSound = useCallback((id: string, free: boolean) => {
    if (!canAccess(free)) { setShowPremiumBlock(true); return; }
    const engine = engineRef.current!;
    setActiveSounds((prev) => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        engine.stop(id);
        delete next[id];
      } else {
        if (!isPremium && Object.keys(next).length >= 1) {
          setShowPremiumBlock(true);
          return prev;
        }
        engine.start(id, 0.5);
        next[id] = 0.5;
      }
      return next;
    });
  }, [canAccess, isPremium]);

  const setVolume = useCallback((id: string, vol: number) => {
    engineRef.current?.setVolume(id, vol);
    setActiveSounds((prev) => ({ ...prev, [id]: vol }));
  }, []);

  const handleStart = useCallback(() => {
    setView("playing");
    setIsPlaying(true);
    setTimeLeft(timerMinutes * 60);

    // Start reading story if selected
    const story = SLEEP_STORIES.find((s) => s.id === selectedStory);
    if (story) {
      // Use slower speech for sleep stories
      const utt = new SpeechSynthesisUtterance(story.text);
      utt.lang = "pt-BR";
      utt.rate = 0.82;
      utt.pitch = 0.95;
      window.speechSynthesis.speak(utt);
    }

    // Timer countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Fade out and stop
          engineRef.current?.fadeOut(8000);
          setTimeout(() => {
            engineRef.current?.stopAll();
            setActiveSounds({});
            setIsPlaying(false);
            setView("main");
          }, 9000);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        // Start fade at 30 seconds remaining
        if (prev === 31) engineRef.current?.fadeOut(30000);
        return prev - 1;
      });
    }, 1000);
  }, [timerMinutes, selectedStory]);

  const handleStop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    engineRef.current?.stopAll();
    window.speechSynthesis.cancel();
    setActiveSounds({});
    setIsPlaying(false);
    setView("main");
    setTimeLeft(0);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  /* ── Playing view (immersive dark) ── */
  if (view === "playing") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg, #0a0e27 0%, #1a1040 50%, #0d1b2a 100%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <DreamStars />
        <div className="relative z-10 text-center space-y-8">
          <motion.div
            className="text-6xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🌙
          </motion.div>

          <p className="text-white/60 text-sm font-medium tracking-wide">Noite tranquila</p>

          <div className="text-white text-4xl font-bold tabular-nums">
            {formatTime(timeLeft)}
          </div>

          {Object.keys(activeSounds).length > 0 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {Object.keys(activeSounds).map((id) => {
                const s = SOUND_PRESETS.find((p) => p.id === id);
                return s ? (
                  <span key={id} className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full">
                    {s.emoji} {s.label}
                  </span>
                ) : null;
              })}
            </div>
          )}

          <motion.button
            onClick={handleStop}
            className="mt-8 px-8 py-3 rounded-full bg-white/10 text-white/80 text-sm font-semibold backdrop-blur-sm border border-white/10"
            whileTap={{ scale: 0.95 }}
          >
            Parar
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /* ── Main dream screen ── */
  return (
    <motion.div
      className="flex-1 overflow-y-auto pb-4"
      style={{ background: "linear-gradient(180deg, #0f1535 0%, #1e1145 50%, #0d1b2a 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DreamStars />

      <div className="relative z-10 px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            className="text-5xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🌙
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Mundo dos Sonhos</h1>
          <p className="text-white/50 text-sm">
            Transforme a hora de dormir no melhor momento do dia
          </p>
        </div>

        {/* CTA principal */}
        <motion.button
          onClick={() => {
            if (Object.keys(activeSounds).length === 0 && !selectedStory) return;
            handleStart();
          }}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #6c3ce0 0%, #3b82f6 100%)",
            opacity: Object.keys(activeSounds).length === 0 && !selectedStory ? 0.4 : 1,
          }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="flex items-center justify-center gap-2">
            <Moon size={20} />
            Iniciar noite tranquila
          </span>
        </motion.button>

        {/* Timer */}
        <div className="space-y-2">
          <h2 className="text-white/70 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Timer size={14} /> Timer
          </h2>
          <div className="flex gap-2">
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                onClick={() => setTimerMinutes(opt.minutes)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  timerMinutes === opt.minutes
                    ? "bg-indigo-500/30 text-white border border-indigo-400/40"
                    : "bg-white/5 text-white/50 border border-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Histórias */}
        <div className="space-y-3">
          <h2 className="text-white/70 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} /> Histórias para dormir
          </h2>
          <div className="space-y-2">
            {SLEEP_STORIES.map((story) => {
              const locked = !canAccess(story.free);
              const isSelected = selectedStory === story.id;
              return (
                <motion.button
                  key={story.id}
                  onClick={() => {
                    if (locked) { setShowPremiumBlock(true); return; }
                    setSelectedStory(isSelected ? null : story.id);
                  }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-indigo-500/20 border border-indigo-400/30"
                      : "bg-white/5 border border-white/5"
                  } ${locked ? "opacity-50" : ""}`}
                  whileTap={locked ? {} : { scale: 0.98 }}
                >
                  <span className="text-2xl">{story.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{story.title}</p>
                    <p className="text-white/40 text-xs truncate">{story.text.substring(0, 50)}...</p>
                  </div>
                  {locked ? (
                    <Lock size={16} className="text-white/30 shrink-0" />
                  ) : isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                      <Play size={10} className="text-white ml-0.5" />
                    </div>
                  ) : (
                    <ChevronRight size={16} className="text-white/20 shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sons */}
        <div className="space-y-3">
          <h2 className="text-white/70 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Music size={14} /> Sons relaxantes
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {SOUND_PRESETS.map((sound) => {
              const locked = !canAccess(sound.free);
              const isActive = activeSounds[sound.id] !== undefined;
              return (
                <motion.button
                  key={sound.id}
                  onClick={() => toggleSound(sound.id, sound.free)}
                  className={`relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-indigo-500/25 border border-indigo-400/40"
                      : "bg-white/5 border border-white/5"
                  } ${locked ? "opacity-40" : ""}`}
                  whileTap={locked ? {} : { scale: 0.93 }}
                >
                  {locked && <Lock size={10} className="absolute top-1.5 right-1.5 text-white/40" />}
                  <span className="text-2xl">{sound.emoji}</span>
                  <span className="text-white/70 text-[10px] font-bold">{sound.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-400"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Volume sliders for active sounds */}
          <AnimatePresence>
            {Object.keys(activeSounds).length > 0 && (
              <motion.div
                className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 size={12} /> Mix de sons
                  {!isPremium && <Lock size={10} className="ml-1 text-white/30" />}
                </p>
                {Object.entries(activeSounds).map(([id, vol]) => {
                  const s = SOUND_PRESETS.find((p) => p.id === id);
                  return s ? (
                    <div key={id} className="flex items-center gap-3">
                      <span className="text-sm w-6 text-center">{s.emoji}</span>
                      <Slider
                        value={[vol * 100]}
                        onValueChange={([v]) => setVolume(id, v / 100)}
                        max={100}
                        step={1}
                        className="flex-1 [&_[data-radix-slider-track]]:bg-white/10 [&_[data-radix-slider-range]]:bg-indigo-400/60 [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:border-indigo-400 [&_[data-radix-slider-thumb]]:w-4 [&_[data-radix-slider-thumb]]:h-4"
                      />
                      <span className="text-white/40 text-xs w-8 text-right">{Math.round(vol * 100)}%</span>
                    </div>
                  ) : null;
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Premium upsell */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-4 border border-indigo-400/10 text-center space-y-2">
            <Crown size={24} className="text-indigo-400 mx-auto" />
            <p className="text-white text-sm font-bold">Desbloqueie o Mundo dos Sonhos completo</p>
            <p className="text-white/40 text-xs">
              Seu filho dorme melhor. Você descansa melhor.
            </p>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Premium block modal */}
      <AnimatePresence>
        {showPremiumBlock && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPremiumBlock(false)}
          >
            <motion.div
              className="bg-[#1a1040] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 border border-indigo-400/20"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Crown size={32} className="text-indigo-400 mx-auto" />
              <h3 className="text-white text-lg font-bold">Conteúdo Premium</h3>
              <p className="text-white/50 text-sm">
                Desbloqueie todas as histórias, sons e o mix completo com o plano KIDZZ Premium.
              </p>
              <p className="text-indigo-300/70 text-xs italic">
                "Transforme a hora de dormir no melhor momento do dia"
              </p>
              <button
                onClick={() => setShowPremiumBlock(false)}
                className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm"
              >
                Entendi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DreamWorld;
