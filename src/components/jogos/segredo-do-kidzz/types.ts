export type GamePhase = 'intro' | 'ready_check' | 'playing' | 'celebration' | 'drawing_outro';

export interface ClueStage {
  step: number;
  title: string;
  seerPrompt: string;
  guidingTip: string;
  spotlightCenter: [number, number];
  spotlightRadius: number;
  zoom: number;
  blurAmount: number;
  shimmerIntensity: number;
}

export interface Creature {
  id: string;
  name: string;
  species: string;
  hidingPlace: string;
  appearance: string;
  behavior: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  heartPosition: [number, number];
  lore: string;
  secretTraits: string[];
  clues: ClueStage[];
  drawingGuide: {
    player1Role: string;
    player2Role: string;
    specialTip: string;
    colors: string[];
  };
}

export interface GameSettings {
  roundDuration: number;
  soundEnabled: boolean;
  ambientSound: boolean;
  playMode: 'classic' | 'mimic' | 'questions';
}
