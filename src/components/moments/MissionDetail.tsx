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
      className="flex-1 flex flex-col overflow-hidden relative"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pb-2 relative z-10" style={{ paddingTop: "calc(max(env(safe-area-inset-top, 12px), 16px) + 8px)" }}>
        <motion.button onClick={onBack} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-card text-gray-600" whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={22} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-gray-800">{mission.name}</h1>
          <p className="text-xs text-gray-500 font-bold">{mission.description}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8 relative z-10">
        {/* Hero card */}
        <motion.div
          className={`mt-3 rounded-2xl p-6 bg-gradient-to-br ${mission.color} text-center shadow-lg`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-5xl drop-shadow-md">{mission.emoji}</span>
          <h2 className="text-white font-black text-2xl mt-3 drop-shadow-md">{mission.name}</h2>
          <p className="text-white/90 text-sm font-bold mt-1 drop-shadow-sm">{mission.description}</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-xs text-white/80 font-bold flex items-center gap-1 drop-shadow-sm">
              <Clock size={12} /> {mission.time}
            </span>
            <span className="text-xs text-white/80 font-bold flex items-center gap-1 drop-shadow-sm">
              <Users size={12} /> {mission.ageRange}
            </span>
            <span className="text-xs text-white/80 font-bold drop-shadow-sm">
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
          <h3 className="text-gray-800 font-extrabold text-sm flex items-center gap-2">
            <Star size={14} className="text-kid-yellow" /> Materiais
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {mission.materials.map(m => (
              <span key={m} className="text-xs text-gray-600 font-bold bg-white/60 px-3 py-1.5 rounded-full border border-gray-200/60">
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
          <h3 className="text-gray-800 font-extrabold text-sm flex items-center gap-2">
            <Sparkles size={14} className="text-kid-orange" /> Passo a passo
          </h3>
          <ol className="mt-3 space-y-3">
            {mission.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${mission.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm`}>
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 font-bold pt-1 leading-relaxed">{step}</span>
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
          <h3 className="text-gray-800 font-extrabold text-sm flex items-center gap-2">
            <Lightbulb size={14} className="text-kid-green" /> Frases para usar
          </h3>
          <div className="mt-2 space-y-2">
            {mission.phrases.map(p => (
              <div key={p} className="text-sm text-gray-700 font-bold italic bg-white/50 px-3 py-2.5 rounded-xl border border-gray-200/50">
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
          <h3 className="text-gray-800 font-extrabold text-sm flex items-center gap-2">
            <Heart size={14} className="text-kid-pink" /> O que desenvolve
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {mission.develops.map(d => (
              <span key={d} className="text-xs text-gray-700 font-bold bg-kid-purple/10 px-3 py-1.5 rounded-full border border-kid-purple/15">
                {d}
              </span>
            ))}
          </div>
        </motion.div>

        {/* WOW moment */}
        <motion.div
          className={`mt-3 rounded-2xl p-4 bg-gradient-to-r ${mission.color} shadow-lg`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-white font-extrabold text-sm drop-shadow-sm">✨ Momento UAU</h3>
          <p className="text-white/95 text-sm font-bold mt-1 leading-relaxed drop-shadow-sm">{mission.wowMoment}</p>
        </motion.div>

        {/* Closing phrase */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-gray-500 text-sm font-bold italic leading-relaxed">
            {mission.closingPhrase}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MissionDetail;
