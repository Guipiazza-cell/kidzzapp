import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, RefreshCw, Check } from "lucide-react";
import GameResultScreen from "./GameResultScreen";
import { neon, glow, gameGradient } from "@/lib/gameTheme";

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
  onOpenAchievements?: () => void;
  onHome?: () => void;
}

const HEROES = ["um dragão tímido", "uma raposa curiosa", "um polvo astronauta", "uma menina inventora", "um robô de bolso", "um leão músico"];
const PLACES = ["numa floresta de cristal", "no fundo do mar", "numa cidade nas nuvens", "no quintal de casa", "num planeta de gelatina", "dentro de um livro"];
const TWISTS = ["encontra um portal mágico", "perde a cor e precisa achar de volta", "descobre um amigo invisível", "faz uma festa surpresa", "salva alguém com gentileza", "aprende a voar pela primeira vez"];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const CreateGame = ({ onScore, onReaction, onOpenAchievements, onHome }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";

  const [hero, setHero] = useState(() => pick(HEROES));
  const [place, setPlace] = useState(() => pick(PLACES));
  const [twist, setTwist] = useState(() => pick(TWISTS));
  const [title, setTitle] = useState("");
  const [done, setDone] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const idea = useMemo(
    () => `${hero.charAt(0).toUpperCase() + hero.slice(1)} ${place} e ${twist}.`,
    [hero, place, twist]
  );

  const reroll = () => {
    setHero(pick(HEROES));
    setPlace(pick(PLACES));
    setTwist(pick(TWISTS));
    onReaction("encourage");
  };

  const finish = () => {
    setConfirmed(true);
    onReaction("happy");
    onScore(20);
    // tiny delay for animation
    setTimeout(() => setDone(true), 600);
  };

  if (done) {
    return (
      <GameResultScreen
        correct={1}
        total={0}
        xp={20 + (title.trim() ? 10 : 0)}
        childName={childName}
        activityLabel="Eu Crio"
        subtype="create"
        starsOverride={3}
        subtitle={title.trim() ? `“${title.trim()}”` : "Sua ideia foi salva!"}
        onReplay={() => {
          reroll();
          setTitle("");
          setDone(false);
          setConfirmed(false);
        }}
        onOpenAchievements={() => onOpenAchievements?.()}
        onHome={() => onHome?.()}
      />
    );
  }

  return (
    <div className="px-2 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 mb-4 border border-white/50 shadow-xl"
        style={{
          background: gameGradient.primary,
          boxShadow: glow.primary,
        }}
      >
        <div className="flex items-center gap-2 mb-2 text-white/85">
          <Sparkles size={16} />
          <span className="text-[11px] font-extrabold uppercase tracking-wide">
            Sua ideia
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={idea}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-lg font-extrabold text-white leading-snug"
          >
            {idea}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <div className="space-y-2 mb-4">
        <Slot label="Quem?" value={hero} onChange={() => setHero(pick(HEROES))} color={neon.violet} />
        <Slot label="Onde?" value={place} onChange={() => setPlace(pick(PLACES))} color={neon.cyan} />
        <Slot label="O que acontece?" value={twist} onChange={() => setTwist(pick(TWISTS))} color={neon.lime} />
      </div>

      <motion.button
        onClick={reroll}
        className="w-full rounded-2xl py-3 mb-3 font-extrabold text-sm text-gray-700 bg-white/70 border border-white/50 flex items-center justify-center gap-2 min-h-[44px]"
        whileTap={{ scale: 0.97 }}
      >
        <RefreshCw size={16} /> Sortear tudo de novo
      </motion.button>

      <div className="rounded-2xl p-3 mb-3 bg-white/75 border border-white/50">
        <label className="text-[11px] font-extrabold uppercase tracking-wide text-gray-500">
          Dê um nome (opcional)
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 40))}
          placeholder="Ex.: A grande aventura"
          className="w-full bg-transparent outline-none text-base font-extrabold text-gray-800 placeholder:text-gray-400 mt-1"
        />
      </div>

      <motion.button
        onClick={finish}
        disabled={confirmed}
        className="w-full rounded-2xl py-4 font-black text-white text-base shadow-xl border border-white/40 flex items-center justify-center gap-2 min-h-[52px]"
        style={{
          background: gameGradient.success,
          boxShadow: glow.success,
        }}
        whileTap={{ scale: 0.97 }}
        animate={confirmed ? { scale: [1, 1.05, 1] } : {}}
      >
        <Check size={18} /> {confirmed ? "Salvo!" : "Salvar minha ideia"}
      </motion.button>
    </div>
  );
};

const Slot = ({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: string;
  onChange: () => void;
  color: string;
}) => (
  <motion.button
    onClick={onChange}
    className="w-full rounded-2xl p-3 flex items-center justify-between gap-3 border border-white/50 bg-white/75 min-h-[56px]"
    whileTap={{ scale: 0.97 }}
  >
    <div className="text-left flex-1 min-w-0">
      <div
        className="text-[10px] font-extrabold uppercase tracking-wide"
        style={{ color }}
      >
        {label}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm font-extrabold text-gray-800 truncate"
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
    <RefreshCw size={16} className="text-gray-500 flex-shrink-0" />
  </motion.button>
);

export default CreateGame;
