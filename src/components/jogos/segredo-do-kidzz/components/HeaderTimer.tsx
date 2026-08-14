import React from 'react';
import { Volume2, VolumeX, Sparkles, Clock, Home } from 'lucide-react';
import { soundFx } from '../audio/soundEffects';

interface HeaderTimerProps { timeLeft: number; totalTime: number; clueStep: number; totalClues: number; soundEnabled: boolean; onToggleSound: () => void; onExitToHome?: () => void; }

export const HeaderTimer: React.FC<HeaderTimerProps> = ({ timeLeft, clueStep, totalClues, soundEnabled, onToggleSound, onExitToHome }) => {
  const isUrgent = timeLeft <= 15;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="w-full flex items-center justify-between px-3 py-2 bg-black/40 backdrop-blur-md rounded-[20px] z-20 text-white shadow-lg border border-white/20">
      <div className="flex items-center gap-2">
        {onExitToHome && (
          <button type="button" onClick={() => { soundFx.playTap(); onExitToHome(); }} className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95 border border-white/20 cursor-pointer" title="Voltar ao início" aria-label="Voltar ao início">
            <Home className="w-3.5 h-3.5 text-white/90" />
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-serif font-bold text-[#FED439] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FED439] animate-pulse" />
            Dica {Math.min(clueStep + 1, totalClues)}/{totalClues}
          </span>
          <div className="flex gap-1 items-center">
            {Array.from({ length: totalClues }).map((_, idx) => {
              const isActive = idx <= clueStep;
              return <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${isActive ? 'w-3.5 bg-gradient-to-r from-[#FED439] to-[#F59E0B] shadow-[0_0_6px_#FED439]' : 'w-1.5 bg-white/20'}`} />;
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider transition-all ${isUrgent ? 'bg-[#EF4444] text-white shadow-[0_0_10px_#EF4444] animate-pulse' : 'bg-white/15 text-white border border-white/20'}`}>
          <Clock className={`w-3 h-3 ${isUrgent ? 'text-white' : 'text-[#FED439]'}`} />
          <span>{formattedTime}</span>
        </div>
        <button type="button" onClick={() => { soundFx.playTap(); onToggleSound(); }} className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[#FED439] transition-all active:scale-95 border border-white/20 cursor-pointer" title={soundEnabled ? 'Silenciar Sons' : 'Ativar Sons'} aria-label={soundEnabled ? 'Silenciar Sons' : 'Ativar Sons'}>
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-60" />}
        </button>
      </div>
    </div>
  );
};
