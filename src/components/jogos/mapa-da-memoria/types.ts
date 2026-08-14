export type ScenarioId =
  | 'praia'
  | 'quintal'
  | 'cozinha'
  | 'parque'
  | 'quarto'
  | 'viagem_carro'
  | 'aniversario'
  | 'chuva'
  | 'escola'
  | 'noite_filme'
  | 'casa_avos'
  | 'bicho_estimacao'
  | 'dia_coragem'
  | 'piscina'
  | 'viagem_frio'
  | 'natal_fim_ano'
  | 'dia_esporte'
  | 'acampamento'
  | 'feira_mercado'
  | 'hora_banho'
  | 'coringa_alegre'
  | 'coringa_aventura'
  | 'coringa_carinho'
  | 'coringa_engracado';

export type SentimentTone = 'ALEGRE' | 'AVENTURA' | 'CARINHO' | 'ENGRAÇADO';

export interface MapPoint {
  id: string;
  name: string;
  subtitle: string;
  iconName: string;
  phrase: string;
  xPercent: number;
  yPercent: number;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  tagline: string;
  keywords: string[];
  themeColor: string;
  accentGlow: string;
  bgGradient: string;
  bgImage?: string;
  ambientDescription: string;
  points: MapPoint[];
  sentimentTone?: SentimentTone;
}

export interface PhysicalAction {
  id: string;
  title: string;
  description: string;
  tip?: string;
  icon: string;
}

export type MascotPose = 'heart' | 'listening' | 'pointing' | 'hug';

export type GameStage = 'prompt' | 'map' | 'action';
