import type { Song } from "./MusicEngine";

export interface SungChapter {
  title: string;
  text: string;
  /** Trecho musical sintetizado (~8s no total das durs) */
  music: Song;
}

export interface SungBook {
  id: string;
  title: string;
  emoji: string;
  cover: string; // gradient
  chapters: SungChapter[];
}

const m = (id: string, steps: { note: string; dur: number }[]): Song => ({
  id, title: "", emoji: "🎵", bpm: 100, steps,
});

export const SUNG_BOOKS: SungBook[] = [
  {
    id: "floresta-magica",
    title: "A Floresta Mágica de Ane",
    emoji: "🌿",
    cover: "linear-gradient(135deg, hsl(140 60% 35%), hsl(180 50% 25%))",
    chapters: [
      {
        title: "O Despertar",
        text: "Ane abriu os olhos rosados na manhã morna. Cada folha brilhava como se tivesse uma estrela escondida dentro. Era hora de cantar com a floresta inteira.",
        music: m("fm-1", [
          { note: "C5", dur: 0.6 }, { note: "E5", dur: 0.6 }, { note: "G5", dur: 0.8 },
          { note: "E5", dur: 0.6 }, { note: "C5", dur: 0.6 }, { note: "D5", dur: 0.6 },
          { note: "E5", dur: 0.6 }, { note: "C5", dur: 1.0 },
        ]),
      },
      {
        title: "O Encontro com o Vento",
        text: "O vento veio dançando entre as árvores. 'Cante comigo!' pediu. E juntos eles fizeram uma melodia que fez até as flores rirem.",
        music: m("fm-2", [
          { note: "G4", dur: 0.5 }, { note: "B4", dur: 0.5 }, { note: "D5", dur: 0.6 },
          { note: "G5", dur: 0.7 }, { note: "D5", dur: 0.5 }, { note: "B4", dur: 0.5 },
          { note: "G4", dur: 0.6 }, { note: "A4", dur: 0.5 }, { note: "B4", dur: 0.7 },
          { note: "C5", dur: 0.9 },
        ]),
      },
      {
        title: "A Canção Secreta",
        text: "No meio do caminho, Ane encontrou uma flor que sussurrava. Era uma canção tão antiga que só os bichinhos sabiam ouvir.",
        music: m("fm-3", [
          { note: "F4", dur: 0.7 }, { note: "A4", dur: 0.7 }, { note: "C5", dur: 0.8 },
          { note: "A4", dur: 0.6 }, { note: "F4", dur: 0.6 }, { note: "G4", dur: 0.6 },
          { note: "A4", dur: 0.6 }, { note: "F4", dur: 1.2 },
        ]),
      },
      {
        title: "O Final Brilhante",
        text: "Quando a noite chegou, todos os sons da floresta viraram uma orquestra. E Ane soube que a magia mora no coração de quem canta.",
        music: m("fm-4", [
          { note: "C5", dur: 0.6 }, { note: "D5", dur: 0.5 }, { note: "E5", dur: 0.5 },
          { note: "F5", dur: 0.6 }, { note: "G5", dur: 0.7 }, { note: "E5", dur: 0.6 },
          { note: "C5", dur: 0.6 }, { note: "G5", dur: 0.5 }, { note: "C5", dur: 1.2 },
        ]),
      },
    ],
  },
  {
    id: "pixel-estrelas",
    title: "Pixel e a Canção das Estrelas",
    emoji: "⭐",
    cover: "linear-gradient(135deg, hsl(220 70% 30%), hsl(260 60% 25%))",
    chapters: [
      {
        title: "O Pedido das Estrelas",
        text: "As estrelas estavam tristes. Faltava música no céu. Pixel olhou pra cima e prometeu cantar a noite inteira.",
        music: m("pe-1", [
          { note: "E5", dur: 0.5 }, { note: "G5", dur: 0.5 }, { note: "B5", dur: 0.6 },
          { note: "G5", dur: 0.5 }, { note: "E5", dur: 0.6 }, { note: "C5", dur: 0.7 },
          { note: "E5", dur: 0.6 }, { note: "G5", dur: 1.0 },
        ]),
      },
      {
        title: "A Subida",
        text: "Ele subiu na árvore mais alta. Cada passo soava como uma nota nova. Tum, tum, tum — o coração batia junto.",
        music: m("pe-2", [
          { note: "C5", dur: 0.4 }, { note: "D5", dur: 0.4 }, { note: "E5", dur: 0.5 },
          { note: "F5", dur: 0.5 }, { note: "G5", dur: 0.6 }, { note: "A5", dur: 0.6 },
          { note: "B5", dur: 0.7 }, { note: "C5", dur: 0.4 }, { note: "G5", dur: 1.0 },
        ]),
      },
      {
        title: "O Coro do Céu",
        text: "Quando Pixel cantou, as estrelas responderam. Cada uma com uma voz diferente. Era um coro brilhante.",
        music: m("pe-3", [
          { note: "G4", dur: 0.6 }, { note: "C5", dur: 0.6 }, { note: "E5", dur: 0.5 },
          { note: "G5", dur: 0.7 }, { note: "C5", dur: 0.5 }, { note: "E5", dur: 0.5 },
          { note: "G5", dur: 0.5 }, { note: "B5", dur: 1.1 },
        ]),
      },
      {
        title: "A Manhã Feliz",
        text: "Quando o sol nasceu, as estrelas dormiram sorrindo. E Pixel sabia: música também é amizade.",
        music: m("pe-4", [
          { note: "C5", dur: 0.5 }, { note: "G5", dur: 0.5 }, { note: "E5", dur: 0.5 },
          { note: "C5", dur: 0.6 }, { note: "D5", dur: 0.5 }, { note: "E5", dur: 0.6 },
          { note: "G5", dur: 0.7 }, { note: "C5", dur: 1.2 },
        ]),
      },
    ],
  },
  {
    id: "rio-cantava",
    title: "O Rio que Cantava",
    emoji: "🌊",
    cover: "linear-gradient(135deg, hsl(200 70% 40%), hsl(180 60% 30%))",
    chapters: [
      {
        title: "Um Som Estranho",
        text: "No fundo do vale corria um rio diferente. Ele não fazia barulho de água. Ele cantava melodias.",
        music: m("rc-1", [
          { note: "A4", dur: 0.6 }, { note: "C5", dur: 0.6 }, { note: "E5", dur: 0.5 },
          { note: "C5", dur: 0.5 }, { note: "A4", dur: 0.6 }, { note: "G4", dur: 0.7 },
          { note: "A4", dur: 1.0 },
        ]),
      },
      {
        title: "Os Peixinhos Coristas",
        text: "Os peixinhos pulavam fora d'água como notas dançantes. Cada salto era um 'plim' diferente.",
        music: m("rc-2", [
          { note: "D5", dur: 0.4 }, { note: "F5", dur: 0.4 }, { note: "A5", dur: 0.5 },
          { note: "F5", dur: 0.4 }, { note: "D5", dur: 0.4 }, { note: "C5", dur: 0.5 },
          { note: "D5", dur: 0.4 }, { note: "F5", dur: 0.4 }, { note: "A5", dur: 0.9 },
        ]),
      },
      {
        title: "A Curva Mágica",
        text: "O rio fez uma curva e revelou uma cachoeira. Lá, a música ficava ainda mais alta. Era um show da natureza.",
        music: m("rc-3", [
          { note: "E5", dur: 0.5 }, { note: "G5", dur: 0.5 }, { note: "B5", dur: 0.6 },
          { note: "G5", dur: 0.5 }, { note: "E5", dur: 0.5 }, { note: "D5", dur: 0.5 },
          { note: "C5", dur: 0.6 }, { note: "G5", dur: 1.0 },
        ]),
      },
      {
        title: "A Volta pra Casa",
        text: "Ane voltou pra casa cantarolando o som do rio. Toda noite ela lembrava: dentro de cada coisa mora uma música.",
        music: m("rc-4", [
          { note: "C5", dur: 0.5 }, { note: "D5", dur: 0.5 }, { note: "E5", dur: 0.6 },
          { note: "F5", dur: 0.6 }, { note: "E5", dur: 0.5 }, { note: "D5", dur: 0.5 },
          { note: "C5", dur: 1.2 },
        ]),
      },
    ],
  },
  {
    id: "ilha-sons",
    title: "A Ilha dos Sons",
    emoji: "🏝️",
    cover: "linear-gradient(135deg, hsl(180 70% 35%), hsl(50 80% 50%))",
    chapters: [
      {
        title: "O Mapa Antigo",
        text: "Pixel encontrou um mapa enrolado. Mostrava uma ilha onde cada planta era um instrumento.",
        music: m("is-1", [
          { note: "F4", dur: 0.5 }, { note: "A4", dur: 0.5 }, { note: "C5", dur: 0.6 },
          { note: "F5", dur: 0.7 }, { note: "C5", dur: 0.5 }, { note: "A4", dur: 0.5 },
          { note: "F4", dur: 1.0 },
        ]),
      },
      {
        title: "A Travessia",
        text: "Eles construíram um barquinho de folhas e remaram cantando. Cada onda era uma batida.",
        music: m("is-2", [
          { note: "C5", dur: 0.4 }, { note: "C5", dur: 0.4 }, { note: "G4", dur: 0.4 },
          { note: "G4", dur: 0.4 }, { note: "A4", dur: 0.4 }, { note: "A4", dur: 0.4 },
          { note: "G4", dur: 0.7 }, { note: "F4", dur: 0.4 }, { note: "F4", dur: 0.4 },
          { note: "E4", dur: 0.7 },
        ]),
      },
      {
        title: "A Floresta de Tambores",
        text: "Na ilha, as palmeiras faziam 'plim plim'. As pedras faziam 'tum tum'. Tudo soava ao mesmo tempo.",
        music: m("is-3", [
          { note: "D4", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "G4", dur: 0.5 },
          { note: "G4", dur: 0.5 }, { note: "B4", dur: 0.5 }, { note: "B4", dur: 0.5 },
          { note: "D5", dur: 0.6 }, { note: "G5", dur: 0.9 },
        ]),
      },
      {
        title: "A Festa Final",
        text: "Eles dançaram até o sol pôr. E levaram um pedacinho da ilha no coração — pra cantar quando quisessem voltar.",
        music: m("is-4", [
          { note: "G4", dur: 0.5 }, { note: "B4", dur: 0.5 }, { note: "D5", dur: 0.5 },
          { note: "G5", dur: 0.6 }, { note: "D5", dur: 0.5 }, { note: "B4", dur: 0.5 },
          { note: "G4", dur: 0.6 }, { note: "C5", dur: 0.5 }, { note: "G4", dur: 1.2 },
        ]),
      },
    ],
  },
];
