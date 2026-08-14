import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { isAudioMuted, toggleAudio } from '../utils/soundEffects';
import { GameStage } from '../types';

interface HeaderBarProps { stage: GameStage; onReset: () => void; scenarioName?: string; }

export const HeaderBar: React.FC<HeaderBarProps> = ({ stage, onReset, scenarioName }) => {
  const [muted, setMuted] = useState(isAudioMuted());

  const handleToggleAudio = () => { const isNowActive = toggleAudio(); setMuted(!isNowActive); };

  return (
    <header className="relative z-30 flex items-center justify-between px-5 pt-5 pb-2 w-full">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#ffeaa7] font-semibold opacity-90">Mapa da Memória</span>
          <span className="text-white/40 text-[10px]">•</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/70 font-semibold">Kidzz</span>
        </div>
        <h1 className="text-lg sm:text-2xl font-serif text-white mt-0.5 italic leading-tight drop-shadow-sm">
          {stage === 'prompt' ? 'A vez da lembrança...' : (scenarioName || 'O nosso mapa...')}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {stage !== 'prompt' && (
          <button type="button" onClick={onReset} className="flex items-center gap-1 px-3 py-1.5 rounded-full frosted-glass text-xs text-white/90 hover:text-[#ffeaa7] hover:border-white/50 transition-all cursor-pointer shadow-sm" title="Começar de novo">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Recomeçar</span>
          </button>
        )}
        <button type="button" onClick={handleToggleAudio} className="flex items-center justify-center w-9 h-9 rounded-full frosted-glass text-white/90 hover:text-[#ffeaa7] hover:border-white/50 transition-all cursor-pointer shadow-md" title={muted ? 'Ativar sons acolhedores' : 'Silenciar sons'}>
          {muted ? <VolumeX className="w-4 h-4 text-white/50" /> : (
            <div className="relative flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-[#ffeaa7]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
