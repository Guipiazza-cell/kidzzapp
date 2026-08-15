import React from 'react';
import { Sparkles, Eye, Ear, Play, Shuffle, HelpCircle, Trophy } from 'lucide-react';
import { Creature, GameSettings } from '../types';
import { getRandomCreature } from '../data/creatures';
import { soundFx } from '../audio/soundEffects';

interface InstructionsScreenProps {
  selectedCreature: Creature;
  onSelectCreature: (creature: Creature) => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onStartGame: () => void;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ selectedCreature, onSelectCreature, settings, onUpdateSettings, onStartGame }) => {
  const handleShuffle = () => {
    soundFx.playTap();
    const next = getRandomCreature(selectedCreature.id);
    onSelectCreature(next);
  };

  const handleStart = () => {
    soundFx.playTap();
    onStartGame();
  };

  return (
    <div className="relative w-full h-full flex flex-col gap-2 p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] bg-gradient-to-b from-[#F5F3FB] via-[#EFEBF8] to-[#E9E4F5] text-[#1E1B4B] overflow-y-auto overscroll-contain no-scrollbar">
      <div className="absolute top-[-40px] left-[-40px] w-64 h-64 bg-[radial-gradient(circle,rgba(196,181,253,0.3),transparent_70%)] pointer-events-none rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-[-40px] w-64 h-64 bg-[radial-gradient(circle,rgba(110,231,183,0.25),transparent_70%)] pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-[-30px] left-1/4 w-72 h-72 bg-[radial-gradient(circle,rgba(252,211,77,0.2),transparent_70%)] pointer-events-none rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-white text-xs font-bold text-[#4338CA]">
          <Sparkles className="w-3.5 h-3.5 text-[#EAB308] fill-current" />
          <span>Kidzz • Jogo em Dupla</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full liquid-glass-white text-xs font-bold text-[#4338CA]">
          <Trophy className="w-3.5 h-3.5 text-[#EAB308] fill-current" />
          <span>20 Bichos</span>
        </div>
      </div>

      <div className="relative z-10 mt-2 mb-1 text-left">
        <span className="text-[11px] font-black tracking-widest uppercase text-[#7C3AED] block mb-0.5">BRINCAR EM DUPLA</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1E1B4B] leading-tight tracking-tight">
          Adivinhe o bicho <br /><span className="text-[#6D28D9]">da floresta!</span>
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 font-medium leading-normal">Um amigo olha a tela e dá as dicas. O outro amigo fica de costas e tenta acertar!</p>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2.5 my-1.5">
        <div className="liquid-glass-card-purple rounded-[22px] p-3 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="gloss-overlay" />
          <div className="flex justify-between items-start mb-1.5 relative z-10">
            <div className="app-icon-squircle w-10 h-10 flex items-center justify-center text-[#7C3AED] shadow-sm">
              <Eye className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="font-serif font-bold text-sm text-white drop-shadow-sm leading-tight">Quem Olha</h3>
            <p className="text-[11px] text-white/90 font-medium leading-tight mt-0.5">Vê a tela e dá as dicas</p>
          </div>
        </div>

        <div className="liquid-glass-card-emerald rounded-[22px] p-3 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="gloss-overlay" />
          <div className="flex justify-between items-start mb-1.5 relative z-10">
            <div className="app-icon-squircle w-10 h-10 flex items-center justify-center text-[#059669] shadow-sm">
              <Ear className="w-5 h-5 animate-pulse" />
            </div>
            <span className="bg-[#FED439] text-[#78350F] font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">DUPLA</span>
          </div>
          <div className="relative z-10">
            <h3 className="font-serif font-bold text-sm text-white drop-shadow-sm leading-tight">Quem Ouve</h3>
            <p className="text-[11px] text-white/90 font-medium leading-tight mt-0.5">De costas para adivinhar</p>
          </div>
        </div>

        <div className="liquid-glass-card-amber rounded-[22px] p-3 text-white flex flex-col justify-between relative overflow-hidden group col-span-2">
          <div className="gloss-overlay" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="app-icon-squircle w-10 h-10 flex items-center justify-center text-[#D97706] shrink-0">
                <HelpCircle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="bg-white/25 backdrop-blur-sm text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">Bicho Secreto</span>
                <h3 className="font-serif font-bold text-sm text-white drop-shadow-sm leading-tight">Sorteado na Floresta</h3>
                <p className="text-[10px] text-white/90 font-medium">20 bichinhos diferentes</p>
              </div>
            </div>
            <button type="button" onClick={handleShuffle} className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#92400E] font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0">
              <Shuffle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Trocar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 my-1 p-3 rounded-[22px] liquid-glass-white">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-extrabold text-[#5B21B6] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" /> Como vão brincar:
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button type="button" onClick={() => { soundFx.playTap(); onUpdateSettings({ playMode: 'classic' }); }} className={`p-2 rounded-xl text-left transition-all relative overflow-hidden cursor-pointer ${settings.playMode === 'classic' ? 'liquid-glass-card-purple text-white shadow-sm' : 'bg-white/60 hover:bg-white/90 text-[#4B5563] border border-white/70'}`}>
            <p className="text-[11px] font-bold">1. Falado</p>
            <p className={`text-[9px] leading-tight ${settings.playMode === 'classic' ? 'text-white/90' : 'text-[#6B7280]'}`}>Dicas com a voz</p>
          </button>
          <button type="button" onClick={() => { soundFx.playTap(); onUpdateSettings({ playMode: 'mimic' }); }} className={`p-2 rounded-xl text-left transition-all relative overflow-hidden cursor-pointer ${settings.playMode === 'mimic' ? 'liquid-glass-card-emerald text-white shadow-sm' : 'bg-white/60 hover:bg-white/90 text-[#4B5563] border border-white/70'}`}>
            <p className="text-[11px] font-bold">2. Mímica</p>
            <p className={`text-[9px] leading-tight ${settings.playMode === 'mimic' ? 'text-white/90' : 'text-[#6B7280]'}`}>Gestos e sons</p>
          </button>
          <button type="button" onClick={() => { soundFx.playTap(); onUpdateSettings({ playMode: 'questions' }); }} className={`p-2 rounded-xl text-left transition-all relative overflow-hidden cursor-pointer ${settings.playMode === 'questions' ? 'liquid-glass-card-rose text-white shadow-sm' : 'bg-white/60 hover:bg-white/90 text-[#4B5563] border border-white/70'}`}>
            <p className="text-[11px] font-bold">3. Perguntas</p>
            <p className={`text-[9px] leading-tight ${settings.playMode === 'questions' ? 'text-white/90' : 'text-[#6B7280]'}`}>Sim ou Não</p>
          </button>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-2 py-1 text-xs text-[#6B7280]">
        <span className="font-semibold text-[#4C1D95]">Tempo:</span>
        <div className="flex gap-2">
          {[60, 75, 90].map((sec) => (
            <button key={sec} type="button" onClick={() => { soundFx.playTap(); onUpdateSettings({ roundDuration: sec }); }} className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${settings.roundDuration === sec ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 scale-105' : 'bg-white/70 text-[#6B7280] hover:bg-white border border-white/80'}`}>{sec}s</button>
          ))}
        </div>
      </div>

      <button type="button" id="btn-start-game" onClick={handleStart} className="relative z-10 w-full mt-1.5 py-3.5 px-5 rounded-[20px] liquid-glass-card-emerald text-white font-serif font-bold text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
        <div className="gloss-overlay" />
        <Play className="w-5 h-5 fill-current relative z-10" />
        <span className="relative z-10 text-white font-extrabold tracking-wide drop-shadow-sm">Começar a Brincadeira</span>
      </button>
    </div>
  );
};
