/**
 * Família oficial de ícones 3D Kidzz.
 * Preferência: assets em /exemplos/assets/icons-3d e packs por aba.
 * Nunca usar emoji como ícone de UI.
 */

export const ICONS3D = "/exemplos/assets/icons-3d";

/** Paths canônicos — fallback em cascata nos packs já existentes */
export const KIDZZ_ICON = {
  rain: `${ICONS3D}/rain.png`,
  forest: `${ICONS3D}/forest.png`,
  ocean: `${ICONS3D}/ocean.png`,
  moon: `${ICONS3D}/moon.png`,
  sun: `${ICONS3D}/sun.png`,
  heart: `${ICONS3D}/heart.png`,
  star: `${ICONS3D}/star.png`,
  shield: `${ICONS3D}/shield.png`,
  sparkle: `${ICONS3D}/sparkle.png`,
  book: `${ICONS3D}/book.png`,
  family: `${ICONS3D}/family.png`,
  imagination: `${ICONS3D}/imagination.png`,
  values: `${ICONS3D}/values.png`,
  memories: `${ICONS3D}/memories.png`,
  music: `${ICONS3D}/music.png`,
  sleep: `${ICONS3D}/sleep.png`,
  play: `${ICONS3D}/play.png`,
  // Fallbacks de packs premium já no app
  fbHeart: "/exemplos/assets/sonhos-v2/feat-heart.png",
  fbMoon: "/exemplos/assets/sonhos-v2/feat-moon.png",
  fbStar: "/exemplos/assets/sonhos-v2/feat-star.png",
  fbPhoto: "/exemplos/assets/sonhos-v2/feat-photo.png",
  fbPlMoon: "/exemplos/assets/sonhos-v2/pl-moon.png",
  fbPlTeddy: "/exemplos/assets/sonhos-v2/pl-teddy.png",
  fbPlPiano: "/exemplos/assets/sonhos-v2/pl-piano.png",
  fbPlBabies: "/exemplos/assets/sonhos-v2/pl-babies.png",
  fbStoryImag: "/exemplos/assets/historias-v2/tile-ilustracoes.png",
  fbStoryLink: "/exemplos/assets/historias-v2/tile-personagens.png",
  fbStoryVal: "/exemplos/assets/historias-v2/tile-temas.png",
  fbStoryMem: "/exemplos/assets/historias-v2/tile-narradores.png",
  fbMusicNote: "/exemplos/assets/musica-v2/modo-mic.png",
  fbCalm: "/exemplos/assets/musica-v2/cat-moon.png",
  fbNature: "/exemplos/assets/musica-v2/cat-sun.png",
} as const;

export type KidzzIconKey = keyof typeof KIDZZ_ICON;

/** Resolve ícone com fallback seguro se o arquivo 3D novo ainda não existir */
export function iconSrc(primary: string, fallback: string): string {
  return primary || fallback;
}

export const STORY_BENEFIT_ICONS = [
  { title: "Imaginação", sub: "Estimula criatividade", src: KIDZZ_ICON.imagination, fb: KIDZZ_ICON.fbStoryImag },
  { title: "Vínculos", sub: "Fortalece conexão", src: KIDZZ_ICON.heart, fb: KIDZZ_ICON.fbStoryLink },
  { title: "Valores", sub: "Histórias que inspiram", src: KIDZZ_ICON.values, fb: KIDZZ_ICON.fbStoryVal },
  { title: "Memórias", sub: "Para toda a vida", src: KIDZZ_ICON.memories, fb: KIDZZ_ICON.fbStoryMem },
] as const;
