import React, { useRef, useState, useEffect } from 'react';
import { Palette, Sparkles, Heart, Check, RefreshCw, Undo, Download } from 'lucide-react';
import { Creature } from '../types';
import { soundFx } from '../audio/soundEffects';

interface DrawingOutroScreenProps {
  creature: Creature;
  onRestartWhenReady: () => void;
}

export const DrawingOutroScreen: React.FC<DrawingOutroScreenProps> = ({ creature, onRestartWhenReady }) => {
  const [hasDrawnOnPaper, setHasDrawnOnPaper] = useState(false);
  const [showDigitalCanvas, setShowDigitalCanvas] = useState(true);
  const [selectedColor, setSelectedColor] = useState(creature.drawingGuide.colors[0] || '#7C3AED');
  const [brushSize] = useState(6);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!showDigitalCanvas || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [showDigitalCanvas]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    lastPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    soundFx.playSketch();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current || !lastPosRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPosRef.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
    soundFx.playTap();
  };

  const savePracticeDrawing = () => {
    if (!canvasRef.current) return;
    soundFx.playVictory();
    const link = document.createElement('a');
    link.download = `desenho-${creature.id}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="relative w-full h-full flex flex-col gap-2 p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] text-[#1E1B4B] bg-gradient-to-b from-[#F5F3FB] via-[#EFEBF8] to-[#E9E4F5] overflow-y-auto overscroll-contain no-scrollbar rounded-[32px] shadow-2xl animate-in fade-in duration-300">
      <div className="relative z-10 flex flex-col items-center text-center mt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-white text-xs font-extrabold text-[#7C3AED] shadow-sm mb-1.5">
          <Palette className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Hora da Arte</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1E1B4B] leading-tight">Desenhem o bicho <span className="text-[#7C3AED]">no papel!</span></h1>
        <p className="text-xs text-[#6B7280] mt-0.5 font-medium max-w-xs">Peguem uma folha e lápis de cor para desenharem juntos.</p>
      </div>

      <div className="relative z-10 my-2 p-3 liquid-glass-white rounded-[22px] shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <img src={creature.imageSrc} alt={creature.name} className="w-14 h-18 object-cover rounded-[16px] shadow-md border-2 border-white shrink-0" referrerPolicy="no-referrer" />
          <div>
            <span className="text-[9px] font-black uppercase text-[#7C3AED] tracking-wider px-2 py-0.5 rounded-full bg-[#7C3AED]/10 inline-block mb-0.5">Inspiração</span>
            <h2 className="text-sm font-serif font-bold text-[#1E1B4B]">{creature.name} ({creature.species})</h2>
            <p className="text-[11px] text-[#6B7280] italic">&ldquo;{creature.drawingGuide.specialTip}&rdquo;</p>
          </div>
        </div>
        <div className="pt-1.5 border-t border-gray-200/60 flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-[#4C1D95]">Cores sugeridas:</span>
          <div className="flex items-center gap-1.5">
            {creature.drawingGuide.colors.map((color, idx) => (
              <div key={idx} className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-transform hover:scale-110" style={{ backgroundColor: color }} title={color} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-2 my-1">
        <div className="p-2.5 rounded-[18px] bg-[#F5F3FB] border border-[#DDD6FE] flex items-start gap-2 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white shrink-0 font-serif font-bold text-xs flex items-center justify-center shadow-sm">1</div>
          <div>
            <p className="text-xs font-bold text-[#6D28D9]">Jogador 1:</p>
            <p className="text-[11px] text-[#4B5563] leading-tight mt-0.5 font-medium">{creature.drawingGuide.player1Role}</p>
          </div>
        </div>
        <div className="p-2.5 rounded-[18px] bg-[#FEF9EE] border border-[#FDE68A] flex items-start gap-2 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-[#D97706] text-white shrink-0 font-serif font-bold text-xs flex items-center justify-center shadow-sm">2</div>
          <div>
            <p className="text-xs font-bold text-[#B45309]">Jogador 2:</p>
            <p className="text-[11px] text-[#4B5563] leading-tight mt-0.5 font-medium">{creature.drawingGuide.player2Role}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 my-1">
        <button type="button" onClick={() => { soundFx.playTap(); setShowDigitalCanvas(!showDigitalCanvas); }} className="text-[11px] text-[#7C3AED] font-bold flex items-center gap-1 mx-auto hover:text-[#5B21B6] transition-colors cursor-pointer">
          <Sparkles className="w-3 h-3 text-[#EAB308]" />
          <span>{showDigitalCanvas ? 'Fechar Prancheta Digital' : 'Abrir Prancheta Digital'}</span>
        </button>
        {showDigitalCanvas && (
          <div className="mt-1.5 p-2.5 liquid-glass-white rounded-[20px] shadow-md animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex gap-1.5">
                {creature.drawingGuide.colors.map((c) => (
                  <button key={c} type="button" onClick={() => { setSelectedColor(c); soundFx.playTap(); }} className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${selectedColor === c ? 'scale-125 border-[#1E1B4B] shadow-sm' : 'border-white'}`} style={{ backgroundColor: c }} />
                ))}
                <button type="button" onClick={() => { setSelectedColor('#1E1B4B'); soundFx.playTap(); }} className={`w-5 h-5 rounded-full bg-[#1E1B4B] border-2 transition-all cursor-pointer ${selectedColor === '#1E1B4B' ? 'scale-125 border-[#7C3AED] shadow-sm' : 'border-white'}`} />
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={clearCanvas} className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs flex items-center gap-1 cursor-pointer" title="Limpar">
                  <Undo className="w-3 h-3" />
                </button>
                <button type="button" onClick={savePracticeDrawing} className="p-1 rounded-lg bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] text-xs flex items-center gap-1 cursor-pointer" title="Salvar Desenho">
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
            <canvas ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} className="w-full h-36 bg-white rounded-xl border border-gray-200 shadow-inner touch-none cursor-crosshair" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col gap-1.5 mt-2">
        {!hasDrawnOnPaper ? (
          <button type="button" onClick={() => { setHasDrawnOnPaper(true); soundFx.playVictory(); }} className="w-full py-3 px-4 rounded-[18px] liquid-glass-card-amber text-white font-serif font-bold text-xs shadow-md hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
            <div className="gloss-overlay" />
            <Check className="w-4 h-4 relative z-10" />
            <span className="relative z-10 font-extrabold text-white">Já terminamos nosso desenho!</span>
          </button>
        ) : (
          <div className="p-2.5 rounded-[18px] liquid-glass-card-emerald text-white text-center shadow-md animate-in zoom-in-95 duration-300">
            <div className="gloss-overlay" />
            <div className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-white mb-0.5 relative z-10">
              <Heart className="w-3.5 h-3.5 text-[#FED439] fill-current" />
              <span>Parabéns, Artistas da Floresta!</span>
            </div>
            <p className="text-[10px] text-white/90 relative z-10 font-medium">O desenho de vocês ficou incrível.</p>
          </div>
        )}
        <button type="button" onClick={() => { soundFx.playTap(); onRestartWhenReady(); }} className="text-xs text-[#7C3AED] hover:text-[#5B21B6] font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer py-1">
          <RefreshCw className="w-3 h-3" />
          <span>Jogar novamente com outro bicho</span>
        </button>
      </div>
    </div>
  );
};
