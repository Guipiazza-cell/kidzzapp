import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Heart,
  Eye,
  EyeOff,
  RotateCcw,
  XCircle,
  Home,
  Clock
} from 'lucide-react';
import { Creature, GameSettings } from '../types';
import { ThreeForestScene } from './ThreeForestScene';
import { HeaderTimer } from './HeaderTimer';
import { soundFx } from '../audio/soundEffects';

interface GameScreenProps {
  creature: Creature;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onVictory: () => void;
  onTimeout: () => void;
  onRetryNewCreature: () => void;
  onExitToHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  creature,
  settings,
  onUpdateSettings,
  onVictory,
  onRetryNewCreature,
  onExitToHome
}) => {
  const [clueStep, setClueStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.roundDuration);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHeartPulse, setShowHeartPulse] = useState(false);
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  const [showMissModal, setShowMissModal] = useState(false);
  const lastAdvanceRef = useRef(0);

  const totalClues = creature.clues.length;
  const currentClue = creature.clues[Math.min(clueStep, totalClues - 1)];

  useEffect(() => {
    setTimeLeft(settings.roundDuration);
    setClueStep(0);
    setIsRevealed(false);
    setShowMissModal(false);
    lastAdvanceRef.current = 0;
  }, [creature.id, settings.roundDuration]);

  useEffect(() => {
    if (isRevealed || showMissModal) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          soundFx.playTap();
          setShowMissModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRevealed, showMissModal]);

  const handleNextClue = () => {
    // Guard: evita que um único toque (ghost click / duplo disparo em telas
    // com botões próximos) avance duas dicas de uma vez.
    const now = Date.now();
    if (now - lastAdvanceRef.current < 600) return;
    lastAdvanceRef.current = now;
    if (clueStep < totalClues - 1) {
      const nextStep = clueStep + 1;
      setClueStep(nextStep);
      soundFx.playClueChime(nextStep);
    }
  };


  const handleVictory = () => {
    setIsRevealed(true);
    soundFx.playVictory();
    setTimeout(() => { onVictory(); }, 900);
  };

  const handleOpenMissModal = () => {
    soundFx.playTap();
    setShowMissModal(true);
  };

  const handleAddTimeAndResume = () => {
    soundFx.playTap();
    setTimeLeft(settings.roundDuration);
    setShowMissModal(false);
  };

  const handleHeartPulse = () => {
    setShowHeartPulse(true);
    soundFx.playHeartbeat();
    setTimeout(() => setShowHeartPulse(false), 1200);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0D0B1C] rounded-[32px] shadow-2xl border border-white/20">
      <div className="absolute inset-0 z-0">
        <ThreeForestScene creature={creature} currentClueStep={clueStep} isRevealed={isRevealed} onHeartClick={handleHeartPulse} />
      </div>

      {showHeartPulse && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="animate-ping w-24 h-24 rounded-full bg-[#EC4899]/30 border-2 border-[#F472B6] flex items-center justify-center">
            <Heart className="w-12 h-12 text-[#F472B6] fill-current" />
          </div>
        </div>
      )}

      <div className="relative z-20 p-3 flex flex-col gap-1.5 shrink-0">
        <HeaderTimer
          timeLeft={timeLeft}
          totalTime={settings.roundDuration}
          clueStep={clueStep}
          totalClues={totalClues - 1}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() => {
            const nextVal = !settings.soundEnabled;
            onUpdateSettings({ soundEnabled: nextVal });
            if (!nextVal) soundFx.stopAmbient();
            else soundFx.startAmbient();
          }}
          onExitToHome={onExitToHome}
        />

        <div className="flex items-center justify-between px-3 py-1 rounded-full bg-black/35 backdrop-blur-md text-xs border border-white/15 text-white shadow-sm">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <Eye className="w-3.5 h-3.5 text-[#FED439] shrink-0" />
            <span className="text-white/80 text-[11px]">Bicho na tela:</span>
            <strong className="text-[#FED439] font-serif font-bold text-xs truncate">{creature.name} ({creature.species})</strong>
          </div>
          <button type="button" onClick={() => setIsCardMinimized(!isCardMinimized)} className="p-1 rounded-full bg-white/15 hover:bg-white/25 text-white/90 text-[10px] flex items-center gap-1 shrink-0 ml-1 cursor-pointer transition-colors" title={isCardMinimized ? 'Mostrar Dica' : 'Esconder Dica'}>
            {isCardMinimized ? (<><Eye className="w-3 h-3 text-[#FED439]" /><span className="hidden xs:inline">Dica</span></>) : (<><EyeOff className="w-3 h-3 text-white/70" /><span className="hidden xs:inline">Ver tela toda</span></>)}
          </button>
        </div>
      </div>

      <div className="relative z-20 mt-auto px-3 pb-2 pointer-events-none max-h-[45%] overflow-y-auto no-scrollbar">
        {!isCardMinimized ? (
          <div className="p-3 rounded-[22px] bg-black/35 backdrop-blur-md border border-white/20 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#FED439]">
                <MessageSquare className="w-3.5 h-3.5 text-[#FED439]" />
                <span>{currentClue.title}</span>
              </div>
              <span className="bg-[#FED439] text-[#78350F] font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">Dica {clueStep + 1} de {totalClues}</span>
            </div>
            <p className="text-xs text-white/95 font-medium leading-snug mb-1.5">&ldquo;{currentClue.seerPrompt}&rdquo;</p>
            <div className="p-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#FED439] shrink-0" />
              <p className="text-[11px] text-white/90 italic leading-tight">{currentClue.guidingTip}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center pointer-events-auto">
            <button type="button" onClick={() => setIsCardMinimized(false)} className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform cursor-pointer">
              <Eye className="w-3.5 h-3.5 text-[#FED439]" />
              <span>Abrir Dica {clueStep + 1}: {currentClue.title}</span>
            </button>
          </div>
        )}
      </div>

      <div className="relative z-20 shrink-0 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] bg-gradient-to-t from-[#0D0B1C] via-[#0D0B1C]/85 to-transparent flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" id="btn-next-clue" disabled={clueStep >= totalClues - 1} onClick={handleNextClue} className={`py-3 px-3 rounded-[18px] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${clueStep < totalClues - 1 ? 'liquid-glass-white text-[#1E1B4B] hover:scale-[1.02]' : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'}`}>
            <span>Próxima Dica</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button type="button" id="btn-guessed-right" onClick={handleVictory} className="py-3.5 px-3 min-h-[48px] rounded-[18px] font-serif font-bold text-xs liquid-glass-card-emerald text-white flex items-center justify-center gap-1.5 shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
            <div className="gloss-overlay" />
            <CheckCircle2 className="w-4 h-4 relative z-10" />
            <span className="relative z-10 font-bold">Acertou! Revelar</span>
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 px-1">
          <button type="button" onClick={handleOpenMissModal} className="text-[11px] text-[#FCA5A5] hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer py-2 min-h-[44px]">
            <XCircle className="w-3.5 h-3.5 text-[#F87171]" />
            <span>Errou? Tentar outro bicho</span>
          </button>
          <button type="button" onClick={onExitToHome} className="text-[11px] text-white/60 hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer py-2 min-h-[44px]">
            <Home className="w-3 h-3 text-white/50" />
            <span>Início</span>
          </button>
        </div>
      </div>

      {showMissModal && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[28px] liquid-glass-white p-5 text-center shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mb-3 shadow-inner">
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <h3 className="font-serif font-extrabold text-lg text-[#1E1B4B] mb-1">Tudo bem!</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed mb-4 max-w-xs font-medium">A floresta tem muitos bichinhos misteriosos. O que vocês querem fazer agora?</p>
            <div className="w-full flex flex-col gap-2">
              <button type="button" onClick={() => { soundFx.playTap(); onRetryNewCreature(); }} className="w-full py-3 px-4 rounded-2xl liquid-glass-card-purple text-white font-serif font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <RotateCcw className="w-4 h-4" />
                <span>Sortear outro bicho novo</span>
              </button>
              <button type="button" onClick={() => { soundFx.playTap(); handleVictory(); }} className="w-full py-3 px-4 rounded-2xl bg-white border border-[#DDD6FE] text-[#6D28D9] hover:bg-[#F5F3FB] font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Eye className="w-4 h-4 text-[#7C3AED]" />
                <span>Ver quem era esse bichinho</span>
              </button>
              <button type="button" onClick={handleAddTimeAndResume} className="w-full py-2.5 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#374151] font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Clock className="w-3.5 h-3.5 text-[#4B5563]" />
                <span>Continuar tentando este bicho</span>
              </button>
              <button type="button" onClick={() => { soundFx.playTap(); onExitToHome(); }} className="w-full py-2 text-xs font-semibold text-[#6B7280] hover:text-[#1E1B4B] transition-colors mt-1">Voltar à tela inicial</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
