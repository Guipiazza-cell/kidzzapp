import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Compass, ArrowRight, Heart, Shell, Umbrella, Castle, Waves, Trees, Flower2, Fence, UtensilsCrossed, SunMedium, Wind, Apple, Footprints, Smile, Tent, MoonStar, CloudMoon, Music, MapPin, Flame, PartyPopper, Gift, Droplets, Sun, MessageCircle } from 'lucide-react';
import { MapPoint, ScenarioDefinition } from '../types';
import { playPointReveal, playMapComplete } from '../utils/soundEffects';

interface MemoryMapScreenProps { scenario: ScenarioDefinition; userStory: string; onCompleteMap: () => void; }

const ICONS: Record<string, React.ElementType> = { Shell, Umbrella, Castle, Waves, Trees, Flower2, Fence, UtensilsCrossed, Sparkles, SunMedium, Wind, Apple, Footprints, Smile, Tent, MoonStar, CloudMoon, Music, MapPin, Flame, PartyPopper, Gift, Droplets, Sun };

const FAMILY_QUESTIONS = ['Qual foi a parte mais engraçada ou especial desse instante?', 'Se você pudesse congelar esse momento no tempo, o que você guardaria?', 'O que deixou o coração de vocês mais feliz nesse dia?'];

export const MemoryMapScreen: React.FC<MemoryMapScreenProps> = ({ scenario, userStory, onCompleteMap }) => {
  const [exploredPointIds, setExploredPointIds] = useState<string[]>([]);
  const [activePoint, setActivePoint] = useState<MapPoint | null>(null);

  const totalPoints = scenario.points.length;
  const isAllExplored = totalPoints > 0 && exploredPointIds.length === totalPoints;
  const nextTargetIndex = scenario.points.findIndex((p) => !exploredPointIds.includes(p.id));

  const handlePointClick = (point: MapPoint) => {
    setActivePoint(point);
    playPointReveal();
    if (!exploredPointIds.includes(point.id)) {
      const nextExplored = [...exploredPointIds, point.id];
      setExploredPointIds(nextExplored);
      if (nextExplored.length === totalPoints) { setTimeout(() => { playMapComplete(); }, 500); }
    }
  };

  const closePointModal = () => { setActivePoint(null); };

  return (
    <div className="relative z-20 flex flex-col justify-between w-full h-full px-4 py-2.5 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center text-center pt-1 z-30">
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full frosted-glass-pill text-[11px] text-[#ffeaa7] shadow-md mb-1 border border-white/30">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="font-serif italic font-semibold">{scenario.name}</span>
        </div>
        <p className="text-[11px] text-white/80 italic max-w-xs truncate px-2 font-mulish">&ldquo;{userStory}&rdquo;</p>
        <div className="w-full max-w-xs mt-1.5 p-1.5 rounded-xl bg-black/25 border border-white/15 flex items-center justify-between px-3">
          <div className="flex items-center gap-1.5 text-left">
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">{isAllExplored ? 'Missão Cumprida!' : `Segredos: ${exploredPointIds.length} de ${totalPoints}`}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {scenario.points.map((p, idx) => {
              const isDone = exploredPointIds.includes(p.id);
              const isCurrent = idx === nextTargetIndex;
              return <div key={p.id} className={`h-2 rounded-full transition-all duration-500 flex items-center justify-center ${isDone ? 'w-6 bg-gradient-to-r from-amber-300 to-yellow-400 shadow-[0_0_8px_rgba(255,234,167,0.8)]' : isCurrent ? 'w-4 bg-emerald-400 animate-pulse' : 'w-2 bg-white/30'}`} title={`Segredo ${idx + 1}`} />;
            })}
          </div>
        </div>
      </motion.div>

      <div className="relative flex-1 w-full my-2 rounded-[28px] overflow-hidden frosted-glass border border-white/35 shadow-2xl">
        {scenario.bgImage ? (
          <img src={scenario.bgImage} alt={scenario.name} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover object-center opacity-75 transform scale-105 filter brightness-95 saturate-115" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-b ${scenario.bgGradient} opacity-85`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/35 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 40%, ${scenario.accentGlow} 0%, transparent 65%)` }} />
        <div className="absolute top-10 right-5 w-40 h-40 bg-[#ffeaa7] opacity-20 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-5 w-36 h-36 bg-[#48ffbb] opacity-15 blur-[50px] rounded-full pointer-events-none" />

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="frostedPathGlow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {scenario.points.length > 1 && (
            <path d={scenario.points.reduce((acc, point, idx) => {
              const x = `${point.xPercent}%`; const y = `${point.yPercent}%`;
              if (idx === 0) return `M ${x} ${y}`;
              const prev = scenario.points[idx - 1];
              const cx1 = `${(prev.xPercent + point.xPercent) / 2 + (idx % 2 === 0 ? 12 : -12)}%`;
              const cy1 = `${(prev.yPercent + point.yPercent) / 2}%`;
              return `${acc} Q ${cx1} ${cy1} ${x} ${y}`;
            }, '')} fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="8 12" strokeLinecap="round" className="animate-dash-flow opacity-90" filter="url(#frostedPathGlow)" />
          )}
        </svg>

        {scenario.points.map((point, index) => {
          const isExplored = exploredPointIds.includes(point.id);
          const isNext = index === nextTargetIndex;
          const IconComp = ICONS[point.iconName] || Sparkles;
          return (
            <motion.div key={point.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 * index, type: 'spring', stiffness: 260, damping: 20 }} style={{ left: `${point.xPercent}%`, top: `${point.yPercent}%`, transform: 'translate(-50%, -50%)' }} className="absolute z-20 flex flex-col items-center cursor-pointer group" onClick={() => handlePointClick(point)}>
              <div className="relative flex items-center justify-center">
                {isNext && <span className="absolute w-18 h-18 rounded-full bg-yellow-300/30 animate-ping pointer-events-none" />}
                {isExplored && <span className="absolute w-14 h-14 rounded-full bg-amber-400/25 blur-xs pointer-events-none" />}
                <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.92 }} className={`relative flex items-center justify-center rounded-full shadow-2xl transition-all ${isExplored ? 'w-15 h-15 sm:w-16 sm:h-16 frosted-glass-pin-active' : isNext ? 'w-14 h-14 sm:w-15 sm:h-15 border-2 border-yellow-300 shadow-[0_0_20px_rgba(255,234,167,0.7)]' : 'w-13 h-13 sm:w-14 sm:h-14 frosted-glass-pin hover:border-white/80 opacity-90'}`}>
                  <div className={`rounded-full flex items-center justify-center shadow-inner transition-colors ${isExplored ? 'w-10 h-10 bg-white/40 text-[#064e3b]' : 'w-9 h-9 bg-white/20 text-white'}`}>
                    {isExplored ? <IconComp className="w-5 h-5 text-white drop-shadow" /> : <span className="font-bold text-sm text-yellow-300">{index + 1}</span>}
                  </div>
                  {isExplored ? (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-black font-bold shadow-md"><Check className="w-3 h-3 text-[#064e3b] stroke-[3]" /></div>
                  ) : isNext ? (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-black font-bold shadow-md animate-bounce">✨</div>
                  ) : null}
                </motion.div>
              </div>
              <div className="mt-1 flex flex-col items-center">
                {isNext && <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-[#064e3b] font-bold text-[9px] uppercase tracking-wider mb-0.5 shadow-sm animate-pulse">Toque aqui!</span>}
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white drop-shadow-md text-center max-w-[110px] truncate">{point.name}</span>
              </div>
            </motion.div>
          );
        })}

        <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center pointer-events-none px-3">
          <span className="text-[10px] sm:text-[11px] px-3.5 py-1 rounded-full frosted-glass text-white/90 tracking-wide font-mulish shadow-sm border border-white/25">
            {isAllExplored ? '✨ Todos os segredos foram reunidos!' : `Toque nos pontos para revelar os segredos`}
          </span>
        </div>
      </div>

      <div className="w-full flex justify-center pt-1 pb-1 z-30">
        {isAllExplored ? (
          <motion.button initial={{ opacity: 0, scale: 0.92, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onCompleteMap} className="w-full max-w-sm py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-[#064e3b] font-bold uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 border-2 border-white/80 shadow-[0_10px_30px_rgba(255,234,167,0.4)] cursor-pointer animate-pulse">
            <Compass className="w-4 h-4 text-[#064e3b] animate-spin" style={{ animationDuration: '8s' }} />
            <span>Abrir a Pista Final do Coração</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <div className="text-center text-xs text-white/75 font-mulish py-1 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-[#ffeaa7]" /><span>Toque nos números para abrir os segredos</span></div>
        )}
      </div>

      <AnimatePresence>
        {activePoint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md" onClick={closePointModal}>
            <motion.div initial={{ y: 50, scale: 0.92, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, scale: 0.92, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-sm rounded-[28px] p-5 shadow-2xl frosted-glass-card border border-white/40 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="absolute -right-6 -top-12 w-32 h-32 bg-[#48ffbb] opacity-20 blur-[40px] pointer-events-none" />
              <div className="absolute -left-6 -bottom-10 w-28 h-28 bg-[#ffeaa7] opacity-20 blur-[40px] pointer-events-none" />
              <div className="flex items-start gap-3.5 mb-3">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-emerald-500 to-teal-700 rounded-full border-2 border-white/60 shadow-lg" />
                  <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-white rounded-full opacity-40 blur-xs" />
                  <div className="absolute inset-0 flex items-center justify-center text-xl">🦎</div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-[#064e3b] flex items-center justify-center shadow-md"><div className="w-2 h-[2px] bg-red-600 animate-pulse rounded-full" /></div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#ffeaa7] font-semibold opacity-90">{activePoint.subtitle || scenario.name}</span>
                  <h2 className="text-white font-serif italic text-base sm:text-lg leading-tight mt-0.5">{activePoint.name}</h2>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/20"><p className="font-serif italic text-sm sm:text-base text-white leading-relaxed">&ldquo;{activePoint.phrase}&rdquo;</p></div>
              <div className="p-3 rounded-2xl bg-amber-400/15 border border-amber-300/30 mb-4 flex items-start gap-2 text-left">
                <MessageCircle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Pergunta para conversarem:</span>
                  <p className="text-xs text-white/95 font-mulish leading-snug mt-0.5">{FAMILY_QUESTIONS[(scenario.points.findIndex((p) => p.id === activePoint.id) || 0) % FAMILY_QUESTIONS.length]}</p>
                </div>
              </div>
              <button type="button" onClick={closePointModal} className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-[#064e3b] font-bold text-xs uppercase tracking-widest border-2 border-white/80 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer">Guardar segredo e continuar ✨</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
