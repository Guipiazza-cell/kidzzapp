/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStage, ScenarioDefinition, PhysicalAction } from './types';
import { SCENARIOS } from './data/scenarios';
import { PHYSICAL_ACTIONS } from './data/actions';
import { matchScenarioFromText } from './utils/scenarioMatcher';
import { HeaderBar } from './components/HeaderBar';
import { PromptScreen } from './components/PromptScreen';
import { MemoryMapScreen } from './components/MemoryMapScreen';
import { PhysicalActionScreen } from './components/PhysicalActionScreen';
import { FirefliesCanvas } from './components/FirefliesCanvas';

export default function MapaDaMemoriaApp() {
  const [stage, setStage] = useState<GameStage>('prompt');
  const [userStory, setUserStory] = useState<string>('');
  const [scenario, setScenario] = useState<ScenarioDefinition>(SCENARIOS.praia);
  const [currentActionIndex, setCurrentActionIndex] = useState<number>(0);

  const currentAction: PhysicalAction = useMemo(() => {
    return PHYSICAL_ACTIONS[currentActionIndex % PHYSICAL_ACTIONS.length];
  }, [currentActionIndex]);

  const handleStorySubmit = (text: string) => {
    setUserStory(text);
    const match = matchScenarioFromText(text);
    setScenario(match.scenario);
    const randomIdx = Math.floor(Math.random() * PHYSICAL_ACTIONS.length);
    setCurrentActionIndex(randomIdx);
    setStage('map');
  };

  const handleCompleteMap = () => { setStage('action'); };

  const handleReset = () => { setStage('prompt'); setUserStory(''); };

  return (
    <main
      className="min-h-screen w-full bg-[#091710] text-white flex items-center justify-center p-0 sm:p-4 overflow-hidden relative selection:bg-amber-300/30 selection:text-white font-mulish"
      style={{ background: 'radial-gradient(circle at top right, #1a4231 0%, #091710 100%)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 opacity-70"
        style={{ background: `radial-gradient(circle at 50% 25%, ${scenario.accentGlow} 0%, rgba(9, 23, 16, 0.9) 75%)` }}
      />
      <div className="relative w-full h-[100dvh] sm:h-[768px] sm:max-w-[432px] sm:rounded-[48px] overflow-hidden flex flex-col justify-between shadow-2xl border-0 sm:border-x-[12px] sm:border-y-[8px] sm:border-black bg-[#0d2a1f] z-10">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, #f59e0b 0%, #10b981 40%, #064e3b 80%, #022c22 100%)' }}
        >
          <div className="absolute bottom-0 w-full h-1/2 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(2, 44, 34, 0.9), transparent)' }} />
          <div className="absolute top-[15%] left-[10%] w-[150%] h-[50%] bg-[#ffeaa7] opacity-25 blur-[80px] rounded-full transform -rotate-12 pointer-events-none" />
          <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-white rounded-full opacity-40 blur-sm pointer-events-none" />
          <div className="absolute top-[15%] right-[25%] w-2 h-2 bg-white rounded-full opacity-60 pointer-events-none" />
          <div className="absolute top-[45%] left-[40%] w-4 h-4 bg-yellow-200 rounded-full opacity-35 blur-sm pointer-events-none" />
        </div>
        <FirefliesCanvas count={18} />
        <HeaderBar stage={stage} onReset={handleReset} scenarioName={stage !== 'prompt' ? scenario.name : undefined} />
        <div className="relative z-10 flex-1 w-full h-full overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {stage === 'prompt' && (
              <motion.div key="prompt-stage" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }} className="w-full h-full">
                <PromptScreen onSubmit={handleStorySubmit} />
              </motion.div>
            )}
            {stage === 'map' && (
              <motion.div key={`map-stage-${scenario.id}`} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }} className="w-full h-full">
                <MemoryMapScreen scenario={scenario} userStory={userStory} onCompleteMap={handleCompleteMap} />
              </motion.div>
            )}
            {stage === 'action' && (
              <motion.div key="action-stage" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }} className="w-full h-full">
                <PhysicalActionScreen action={currentAction} scenario={scenario} userStory={userStory} onRestart={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
