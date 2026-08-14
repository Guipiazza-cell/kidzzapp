import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, RotateCcw, CheckCircle2, PartyPopper } from 'lucide-react';
import { PhysicalAction, ScenarioDefinition } from '../types';
import { MascotAvatar } from './MascotAvatar';
import { playChime } from '../utils/soundEffects';
import { analytics } from '@/lib/analytics';

interface PhysicalActionScreenProps { action: PhysicalAction; scenario: ScenarioDefinition; userStory: string; onRestart: () => void; }

export const PhysicalActionScreen: React.FC<PhysicalActionScreenProps> = ({ action, userStory, onRestart }) => {
  const [completed, setCompleted] = useState(false);

  const handleCompleteMission = () => {
    setCompleted(true);
    playChime(784);
    analytics.activityCompleted({ tab: "brincar", activity_id: "mapa-da-memoria" });
  };

  return (
    <div className="relative z-20 flex flex-col items-center justify-between w-full h-full px-5 py-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center text-center pt-1">
        <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full frosted-glass-pill text-xs text-[#ffeaa7] shadow-sm mb-2 border border-white/30"><Heart className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300/40" /><span className="font-serif italic font-semibold">Missão Final do Coração</span></div>
        <p className="text-xs text-white/80 font-mulish italic max-w-xs px-2 line-clamp-2">&ldquo;{userStory}&rdquo;</p>
      </motion.div>
      <div className="flex flex-col items-center text-center my-auto w-full max-w-sm py-2">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-3"><MascotAvatar pose="hug" size="hero" showHeartBadge={true} /></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="w-full rounded-[28px] frosted-glass-card p-5 border border-white/40 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#ffeaa7] opacity-20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#48ffbb] opacity-20 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#ffeaa7] font-semibold tracking-[0.15em] uppercase mb-2"><Sparkles className="w-3.5 h-3.5 text-yellow-300" /><span>Agora juntos no mundo real</span></div>
          <h2 className="font-serif italic text-lg sm:text-xl font-bold text-white leading-snug tracking-tight mb-2.5 drop-shadow-sm">{action.description}</h2>
          {action.tip && <p className="text-xs text-white/90 font-mulish leading-relaxed bg-white/10 backdrop-blur-md rounded-2xl py-2 px-3 border border-white/20 shadow-inner mb-4">💡 {action.tip}</p>}
          <button type="button" onClick={handleCompleteMission} className={`w-full py-3 px-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${completed ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] border-2 border-white' : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-[#064e3b] border-2 border-white/80 shadow-md hover:scale-[1.02] active:scale-[0.98]'}`}>
            {completed ? (<><CheckCircle2 className="w-4 h-4 text-white" /><span>Missão Cumprida em Família! 🎉</span></>) : (<><PartyPopper className="w-4 h-4 text-[#064e3b]" /><span>Fizemos juntos! Marcar como feita</span></>)}
          </button>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="w-full max-w-sm flex flex-col items-center pt-2 pb-1">
        <button type="button" onClick={onRestart} className="px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-white/90 border border-white/30 bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:border-white/50"><RotateCcw className="w-3.5 h-3.5 text-[#ffeaa7]" /><span>Jogar com outra lembrança</span></button>
      </motion.div>
    </div>
  );
};
