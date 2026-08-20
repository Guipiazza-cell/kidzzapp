import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, HeartHandshake, ArrowRight } from 'lucide-react';
import heroWide from '../assets/hero_mapa_wide.jpg.asset.json';
import { playChime, playHeartbeatPulse } from '../utils/soundEffects';

interface PromptScreenProps { onSubmit: (text: string) => void; }

const INSPIRATION_SUGGESTIONS = [
  { emoji: '🐶', label: 'Bichinhos', text: 'A vez que o cachorro roubou o bolo de aniversário...' },
  { emoji: '🌊', label: 'Praia', text: 'Quando caímos na areia da praia tentando fugir da onda...' },
  { emoji: '🥞', label: 'Cozinha', text: 'O dia que fizemos receita e voou farinha na cara...' },
  { emoji: '🚗', label: 'Viagem', text: 'Aquela cantoria engraçada dentro do carro na estrada...' },
];

export const PromptScreen: React.FC<PromptScreenProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const maxLength = 200;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    playChime(659.25);
    onSubmit(text.trim());
  };

  const handleSuggestionClick = (suggestionText: string) => { setText(suggestionText); playHeartbeatPulse(); };

  const isValid = text.trim().length > 0;

  return (
    <div className="relative z-20 flex flex-col items-center justify-between w-full h-full overflow-y-auto overscroll-contain">
      {/* HERO full-bleed no topo (padrão do Segredo do Kidzz) */}
      <div className="relative w-full shrink-0">
        <img
          src={heroWide.url}
          alt="Camaleão Kidzz com o mapa da memória na floresta"
          className="w-full h-[58vw] max-h-[360px] min-h-[220px] object-cover object-center select-none"
          loading="eager"
          decoding="async"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(6,78,59,0.35) 0%, rgba(9,23,16,0) 32%, rgba(9,23,16,0.45) 58%, rgba(9,23,16,0.9) 84%, #0d2a1f 100%)',
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_35%,rgba(255,234,167,0.14),transparent_70%)]" />
        <div className="absolute bottom-3 left-0 right-0 z-10 px-5">
          <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#ffeaa7] block mb-0.5 drop-shadow">Mapa da Memória</span>
          <h2 className="text-xl sm:text-2xl font-serif italic text-white leading-tight tracking-tight drop-shadow-lg">
            Qual momento feliz vamos reviver?
          </h2>
        </div>
      </div>

      <div className="flex flex-col items-center text-center w-full max-w-sm px-5 pt-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="w-full grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-black/20 border border-white/15 mb-2 text-center">
          <div className="flex flex-col items-center"><span className="w-5 h-5 rounded-full bg-amber-400/30 text-amber-300 text-[10px] font-bold flex items-center justify-center mb-0.5">1</span><span className="text-[10px] text-white/90 font-medium leading-tight">Escreva ou escolha</span></div>
          <div className="flex flex-col items-center"><span className="w-5 h-5 rounded-full bg-emerald-400/30 text-emerald-300 text-[10px] font-bold flex items-center justify-center mb-0.5">2</span><span className="text-[10px] text-white/90 font-medium leading-tight">Abra os segredos</span></div>
          <div className="flex flex-col items-center"><span className="w-5 h-5 rounded-full bg-yellow-400/30 text-yellow-300 text-[10px] font-bold flex items-center justify-center mb-0.5">3</span><span className="text-[10px] text-white/90 font-medium leading-tight">Faça a missão real</span></div>
        </motion.div>
      </div>

      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="w-full max-w-sm px-5 flex flex-col gap-2.5">
        <div className="relative rounded-[24px] frosted-glass-card p-3.5 focus-within:border-white/70 transition-all shadow-2xl overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, maxLength))} placeholder="Digite aqui uma lembrança boa (ex: o dia que fomos tomar sorvete e pingou na roupa...)" rows={2} className="w-full bg-transparent text-sm text-white placeholder-white/45 resize-none outline-none leading-relaxed font-mulish" autoFocus />
          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs text-white/60">
            <span className="flex items-center gap-1 text-[11px] text-[#ffeaa7] font-medium"><HeartHandshake className="w-3.5 h-3.5" />Lembrança da família</span>
            <span className={`text-[11px] font-mono ${text.length > maxLength * 0.9 ? 'text-amber-300 font-bold' : 'text-white/50'}`}>{text.length}/{maxLength}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#ffeaa7] font-semibold opacity-90 px-1">Ou toque para usar uma ideia pronta:</span>
          <div className="grid grid-cols-2 gap-1.5">
            {INSPIRATION_SUGGESTIONS.map((item, idx) => (
              <button key={idx} type="button" onClick={() => handleSuggestionClick(item.text)} className="text-left text-xs p-2 rounded-xl frosted-glass-pill text-white/90 hover:text-white hover:bg-white/25 hover:border-white/60 transition-all cursor-pointer shadow-sm flex items-start gap-1.5"><span className="text-sm">{item.emoji}</span><span className="text-[11px] leading-tight line-clamp-2">{item.text}</span></button>
            ))}
          </div>
        </div>
      </motion.form>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="w-full max-w-sm px-5 pt-3 pb-3">
        <button type="button" onClick={() => handleSubmit()} disabled={!isValid} className={`relative w-full py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 font-bold uppercase tracking-widest text-[12px] transition-all shadow-2xl cursor-pointer ${isValid ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-[#064e3b] border-2 border-white/80 shadow-[0_10px_30px_rgba(255,234,167,0.4)] hover:scale-[1.02] active:scale-[0.98]' : 'bg-white/10 text-white/40 border border-white/20 cursor-not-allowed'}`}>
          <Compass className={`w-4 h-4 ${isValid ? 'text-[#064e3b] animate-bounce' : 'text-white/30'}`} />
          <span>Começar o Mapa da Memória</span>
          {isValid ? <ArrowRight className="w-4 h-4 text-[#064e3b]" /> : <Sparkles className="w-3.5 h-3.5 text-white/30" />}
        </button>
      </motion.div>
    </div>
  );
};
