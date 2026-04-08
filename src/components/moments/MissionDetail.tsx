import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Star, Heart, Lightbulb, Sparkles } from "lucide-react";
import type { Mission } from "./MissionsData";

interface Props {
  mission: Mission;
  onBack: () => void;
}

const MissionDetail = ({ mission, onBack }: Props) => {
  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[hsl(220,25%,8%)] via-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)]"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <motion.button onClick={onBack} className="p-2 rounded-xl glass-card text-primary-foreground/60" whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-primary-foreground">{mission.name}</h1>
          <p className="text-xs text-primary-foreground/40 font-bold">{mission.description}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Hero card */}
        <motion.div
          className={`mt-3 rounded-2xl p-6 bg-gradient-to-br ${mission.color} text-center`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-5xl">{mission.emoji}</span>
          <h2 className="text-primary-foreground font-black text-2xl mt-3">{mission.name}</h2>
          <p className="text-primary-foreground/80 text-sm font-bold mt-1">{mission.description}</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-xs text-primary-foreground/70 font-bold flex items-center gap-1">
              <Clock size={12} /> {mission.time}
            </span>
            <span className="text-xs text-primary-foreground/70 font-bold flex items-center gap-1">
              <Users size={12} /> {mission.ageRange}
            </span>
            <span className="text-xs text-primary-foreground/70 font-bold">
              {mission.level}
            </span>
          </div>
        </motion.div>

        {/* Materials */}
        <motion.div
          className="mt-4 glass-card rounded-2xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-primary-foreground font-extrabold text-sm flex items-center gap-2">
            <Star size={14} className="text-kid-yellow" /> Materiais
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {mission.materials.map(m => (
              <span key={m} className="text-xs text-primary-foreground/70 font-bold glass-card px-3 py-1.5 rounded-full">
                {m}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="mt-3 glass-card rounded-2xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-primary-foreground font-extrabold text-sm flex items-center gap-2">
            <Sparkles size={14} className="text-kid-orange" /> Passo a passo
          </h3>
          <ol className="mt-3 space-y-3">
            {mission.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${mission.color} flex items-center justify-center text-primary-foreground text-xs font-black flex-shrink-0`}>
                  {i + 1}
                </span>
                <span className="text-sm text-primary-foreground/80 font-bold pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Phrases */}
        <motion.div
          className="mt-3 glass-card rounded-2xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-primary-foreground font-extrabold text-sm flex items-center gap-2">
            <Lightbulb size={14} className="text-kid-green" /> Frases para usar
          </h3>
          <div className="mt-2 space-y-2">
            {mission.phrases.map(p => (
              <div key={p} className="text-sm text-primary-foreground/70 font-bold italic glass-card px-3 py-2.5 rounded-xl">
                "{p}"
              </div>
            ))}
          </div>
        </motion.div>

        {/* What it develops */}
        <motion.div
          className="mt-3 glass-card rounded-2xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-primary-foreground font-extrabold text-sm flex items-center gap-2">
            <Heart size={14} className="text-kid-pink" /> O que desenvolve
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {mission.develops.map(d => (
              <span key={d} className="text-xs text-primary-foreground/70 font-bold bg-kid-purple/20 px-3 py-1.5 rounded-full border border-kid-purple/20">
                {d}
              </span>
            ))}
          </div>
        </motion.div>

        {/* WOW moment */}
        <motion.div
          className={`mt-3 rounded-2xl p-4 bg-gradient-to-r ${mission.color} border-2 border-primary-foreground/10`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-primary-foreground font-extrabold text-sm">✨ Momento UAU</h3>
          <p className="text-primary-foreground/90 text-sm font-bold mt-1">{mission.wowMoment}</p>
        </motion.div>

        {/* Closing phrase */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-primary-foreground/60 text-sm font-bold italic leading-relaxed">
            {mission.closingPhrase}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MissionDetail;
