import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GamePhase, Creature, GameSettings } from './types';
import { getRandomCreature } from './data/creatures';
import { InstructionsScreen } from './components/InstructionsScreen';
import { ReadyCheckScreen } from './components/ReadyCheckScreen';
import { GameScreen } from './components/GameScreen';
import { CelebrationScreen } from './components/CelebrationScreen';
import { DrawingOutroScreen } from './components/DrawingOutroScreen';
import { soundFx } from './audio/soundEffects';
import { analytics } from '@/lib/analytics';

export default function SegredoDoKidzzApp() {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const startedAtRef = React.useRef<number>(Date.now());

  const trackCompletion = () => {
    const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    analytics.activityCompleted({
      tab: 'brincar',
      activity_id: 'segredo-do-kidzz',
      duration_seconds: duration,
      title: 'O Segredo do Kidzz',
    });
  };
  const [selectedCreature, setSelectedCreature] = useState<Creature>(() => getRandomCreature());
  const [settings, setSettings] = useState<GameSettings>({ roundDuration: 75, soundEnabled: true, ambientSound: true, playMode: 'classic' });

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => { setSettings((prev) => ({ ...prev, ...newSettings })); };
  const handleProceedToReadyCheck = () => { setPhase('ready_check'); };
  const handleConfirmReady = () => { startedAtRef.current = Date.now(); setPhase('playing'); };
  const handleVictory = () => { trackCompletion(); setPhase('celebration'); };
  const handleTimeout = () => { soundFx.playClueChime(4); trackCompletion(); setPhase('celebration'); };
  const handleProceedToDrawing = () => { setPhase('drawing_outro'); };
  const handleRetryNewCreature = () => { const nextCreature = getRandomCreature(selectedCreature.id); setSelectedCreature(nextCreature); setPhase('playing'); };
  const handleBackToIntro = () => { setPhase('intro'); };
  const handleRestart = () => { const nextCreature = getRandomCreature(selectedCreature.id); setSelectedCreature(nextCreature); setPhase('intro'); };

  return (
    <main className="min-h-screen w-full bg-[#E8E4F3] flex items-center justify-center p-0 sm:p-4 md:p-6 select-none overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-60">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#c4b5fd]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#6ee7b7]/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-[#fcd34d]/20 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-[420px] h-[100dvh] sm:h-[840px] sm:max-h-[92vh] sm:rounded-[38px] overflow-hidden bg-[#F5F3FB] shadow-[0_25px_70px_rgba(76,29,149,0.18)] border-0 sm:border-[5px] sm:border-white flex flex-col">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent z-40" />
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="w-full h-full">
              <InstructionsScreen selectedCreature={selectedCreature} onSelectCreature={setSelectedCreature} settings={settings} onUpdateSettings={handleUpdateSettings} onStartGame={handleProceedToReadyCheck} />
            </motion.div>
          )}
          {phase === 'ready_check' && (
            <motion.div key="ready_check" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="w-full h-full">
              <ReadyCheckScreen settings={settings} onConfirmReady={handleConfirmReady} onBack={() => setPhase('intro')} />
            </motion.div>
          )}
          {phase === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="w-full h-full">
              <GameScreen creature={selectedCreature} settings={settings} onUpdateSettings={handleUpdateSettings} onVictory={handleVictory} onTimeout={handleTimeout} onRetryNewCreature={handleRetryNewCreature} onExitToHome={handleBackToIntro} />
            </motion.div>
          )}
          {phase === 'celebration' && (
            <motion.div key="celebration" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="w-full h-full">
              <CelebrationScreen creature={selectedCreature} onProceedToDrawing={handleProceedToDrawing} />
            </motion.div>
          )}
          {phase === 'drawing_outro' && (
            <motion.div key="drawing_outro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="w-full h-full">
              <DrawingOutroScreen creature={selectedCreature} onRestartWhenReady={handleRestart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
