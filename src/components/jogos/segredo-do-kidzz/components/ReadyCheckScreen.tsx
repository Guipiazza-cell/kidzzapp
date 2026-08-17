import React from 'react';
import { Eye, Ear, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import ChameleonMascot from '@/components/ChameleonMascot';
import { GameSettings } from '../types';
import { soundFx } from '../audio/soundEffects';

interface ReadyCheckScreenProps { settings: GameSettings; onConfirmReady: () => void; onBack: () => void; }

export const ReadyCheckScreen: React.FC<ReadyCheckScreenProps> = ({ settings, onConfirmReady, onBack }) => {
  const handleConfirm = () => { soundFx.playTap(); soundFx.playClueChime(1); onConfirmReady(); };
  const getModeLabel = () => { if (settings.playMode === 'mimic') return 'Modo Mímica'; if (settings.playMode === 'questions') return 'Modo Perguntas'; return 'Modo Falado'; };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom)+168px)] bg-gradient-to-b from-[#0D0B1C] via-[#121026] to-[#0D0B1C] text-white overflow-y-auto no-scrollbar">
      <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-[radial-gradient(circle,rgba(124,58,237,0.18),transparent_70%)] pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-[-30px] left-[-30px] w-64 h-64 bg-[radial-gradient(circle,rgba(196,181,253,0.16),transparent_70%)] pointer-events-none rounded-full blur-3xl" />
      <div className="relative z-10 flex items-center justify-between pt-1">
        <button type="button" onClick={() => { soundFx.playTap(); onBack(); }} className="w-10 h-10 rounded-full liquid-glass-white flex items-center justify-center text-[#4338CA] hover:scale-105 active:scale-95 transition-all cursor-pointer" aria-label="Voltar">
          <ArrowLeft className="w-5 h-5 text-[#4338CA]" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-white text-xs font-bold text-[#7C3AED]">
          <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
          <span>Hora do Segredo</span>
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center mt-1">
        <div className="relative">
          <ChameleonMascot mood="curious" size="md" interactive={false} className="relative z-10" />
          <div className="absolute -inset-2 bg-[#7C3AED]/15 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>
      <div className="relative z-10 mt-2 text-left">
        <span className="text-[11px] font-black tracking-widest uppercase text-[#C4B5FD] block mb-0.5">PREPARAÇÃO</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white leading-tight tracking-tight">Atenção <span className="text-[#FED439]">Dupla!</span></h1>
        <p className="text-xs text-white/70 mt-0.5 font-medium">{getModeLabel()} • {settings.roundDuration} segundos</p>
      </div>
      <div className="relative z-10 my-2 liquid-glass-card-purple rounded-[26px] p-4 text-white flex flex-col items-center text-center shadow-lg">
        <div className="gloss-overlay" />
        <div className="app-icon-squircle w-14 h-14 flex items-center justify-center text-[#7C3AED] mb-2.5 relative z-10 shadow-md">
          <Eye className="w-7 h-7 animate-pulse" />
        </div>
        <h2 className="text-base sm:text-lg font-serif font-bold text-white mb-1.5 relative z-10 drop-shadow-sm">Posição dos Jogadores</h2>
        <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium relative z-10 max-w-xs">
          Quem vai <strong className="text-[#FED439] underline decoration-2 underline-offset-2">OLHAR</strong> fica de frente para a tela. O outro amigo vira de costas ou fecha os olhos!
        </p>
        <div className="grid grid-cols-2 gap-2 w-full mt-3.5 relative z-10">
          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex flex-col items-center text-center">
            <Eye className="w-4 h-4 text-[#FED439] mb-1" />
            <span className="text-xs font-bold text-white">Quem Olha</span>
            <span className="text-[10px] text-white/90 mt-0.5 leading-tight">Vê o bicho e dá dicas</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex flex-col items-center text-center">
            <Ear className="w-4 h-4 text-white mb-1" />
            <span className="text-xs font-bold text-white">Quem Ouve</span>
            <span className="text-[10px] text-white/90 mt-0.5 leading-tight">De costas para adivinhar</span>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex flex-col gap-1.5">
        <button type="button" id="btn-ready-confirm" onClick={handleConfirm} className="w-full py-3.5 px-5 rounded-[20px] liquid-glass-card-emerald text-white font-serif font-bold text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
          <div className="gloss-overlay" />
          <span className="relative z-10 text-white font-extrabold tracking-wide drop-shadow-sm">Pronto, só eu tô vendo!</span>
          <ArrowRight className="w-4 h-4 relative z-10" />
        </button>
        <button type="button" onClick={() => { soundFx.playTap(); onBack(); }} className="w-full py-1 text-xs font-semibold text-white/70 hover:text-white transition-colors text-center">Voltar às configurações</button>
      </div>
    </div>
  );
};
