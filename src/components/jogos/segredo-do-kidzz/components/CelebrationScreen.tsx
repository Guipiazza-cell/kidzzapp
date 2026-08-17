import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Palette, ArrowRight } from 'lucide-react';
import ChameleonMascot from '@/components/ChameleonMascot';
import { Creature } from '../types';
import { soundFx } from '../audio/soundEffects';

interface CelebrationScreenProps { creature: Creature; onProceedToDrawing: () => void; }

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({ creature, onProceedToDrawing }) => {
  useEffect(() => {
    soundFx.playVictory();
    const end = Date.now() + 1400;
    const colors = ['#FED439', '#7C3AED', '#10B981', '#F472B6', '#38BDF8'];
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0.1, y: 0.7 }, colors, ticks: 180, gravity: 0.8, scalar: 0.9, shapes: ['circle'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 0.9, y: 0.7 }, colors, ticks: 180, gravity: 0.8, scalar: 0.9, shapes: ['circle'] });
      if (Date.now() < end) { requestAnimationFrame(frame); }
    };
    frame();
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom)+168px)] text-white bg-gradient-to-b from-[#0D0B1C] via-[#121026] to-[#0D0B1C] overflow-y-auto no-scrollbar rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-400">
      <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-[radial-gradient(circle,rgba(196,181,253,0.18),transparent_70%)] pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-[-30px] left-[-30px] w-64 h-64 bg-[radial-gradient(circle,rgba(110,231,183,0.14),transparent_70%)] pointer-events-none rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col items-center text-center mt-1">
        <div className="relative">
          <ChameleonMascot mood="happy" size="md" interactive={false} className="relative z-10" />
          <div className="absolute -inset-2 bg-[#10B981]/15 rounded-full blur-2xl pointer-events-none" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-white text-xs font-extrabold text-[#7C3AED] shadow-sm mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FED439] fill-current" />
          <span>Muito bem!</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white leading-tight">Vocês acertaram <span className="text-[#FED439]">juntos!</span></h1>
        <p className="text-xs text-white/70 mt-0.5 font-medium">Olha só quem estava escondido na floresta:</p>
      </div>
      <div className="relative z-10 my-2 p-3.5 rounded-[26px] liquid-glass-dark flex flex-col items-center text-center shadow-lg">
        <div className="relative w-32 h-40 rounded-[20px] overflow-hidden shadow-md border-2 border-white mb-2.5">
          <img src={creature.imageSrc} alt={creature.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute bottom-1.5 left-1.5 right-1.5 liquid-glass-dark py-0.5 px-2 rounded-xl text-[11px] font-serif font-bold text-[#FED439] flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-[#EC4899] fill-current animate-pulse" />
            <span>{creature.name}</span>
          </div>
        </div>
        <h2 className="text-base font-serif font-bold text-white">{creature.name} • {creature.species}</h2>
        <p className="text-xs text-white/80 leading-relaxed max-w-xs my-2 font-medium">{creature.lore}</p>
        <div className="w-full p-2.5 rounded-[18px] bg-white/10 border border-white/20 text-left">
          <p className="text-[10px] font-extrabold text-[#FED439] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#EAB308]" /> O que vocês descobriram:
          </p>
          <ul className="text-[11px] text-white/90 space-y-0.5 pl-1 font-medium">
            {creature.secretTraits.slice(0, 3).map((trait, idx) => (
              <li key={idx} className="flex items-start gap-1"><span className="text-[#FED439] font-bold">•</span><span>{trait}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <button type="button" id="btn-proceed-drawing" onClick={() => { soundFx.playTap(); onProceedToDrawing(); }} className="relative z-10 w-full py-3.5 px-5 rounded-[20px] liquid-glass-card-emerald text-white font-serif font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
        <div className="gloss-overlay" />
        <Palette className="w-4 h-4 relative z-10" />
        <span className="relative z-10 text-white font-extrabold drop-shadow-sm">Vamos desenhar no papel!</span>
        <ArrowRight className="w-4 h-4 relative z-10" />
      </button>
    </div>
  );
};
