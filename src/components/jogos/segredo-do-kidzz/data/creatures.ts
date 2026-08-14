import { Creature } from '../types';

import pingoFrogImg from '../assets/images/crystal_tree_frog_1786731119842.jpg';
import pipocaOwlImg from '../assets/images/golden_owl_forest_1786731105513.jpg';
import avelaSquirrelImg from '../assets/images/avela_squirrel_1786732712524.jpg';
import rubiLadybugImg from '../assets/images/rubi_ladybug_1786732703235.jpg';
import ceuBluebirdImg from '../assets/images/ceu_bluebird_1786732743035.jpg';
import vagarTurtleImg from '../assets/images/vagar_turtle_1786732752399.jpg';
import trevoBunnyImg from '../assets/images/trevo_bunny_1786732761783.jpg';
import ambarButterflyImg from '../assets/images/ambar_butterfly_1786732722136.jpg';
import espinhoHedgehogImg from '../assets/images/espinho_hedgehog_1786732771044.jpg';
import brasaFoxImg from '../assets/images/brasa_fox_1786732731167.jpg';
import zumDragonflyImg from '../assets/images/zum_dragonfly_1786732784402.jpg';
import bolhaSnailImg from '../assets/images/bolha_snail_1786732796300.jpg';
import framboesaRobinImg from '../assets/images/framboesa_robin_1786732825329.jpg';
import sombraKittenImg from '../assets/images/sombra_kitten_1786732815155.jpg';
import malhaFawnImg from '../assets/images/fawn_morning_bloom_1786731133587.jpg';
import faiscaFireflyImg from '../assets/images/faisca_firefly_1786732805272.jpg';
import migalhaMouseImg from '../assets/images/migalha_mouse_1786732834966.jpg';
import neblinaSnowyOwlImg from '../assets/images/neblina_snowy_owl_1786732844662.jpg';
import carvaoRaccoonImg from '../assets/images/carvao_raccoon_1786732853871.jpg';
import orvalholizardImg from '../assets/images/orvalho_lizard_1786732863991.jpg';

interface RawCreatureDef {
  id: string;
  name: string;
  species: string;
  hidingPlace: string;
  appearance: string;
  behavior: string;
  imageSrc: string;
  colors: string[];
}

const RAW_CREATURES: RawCreatureDef[] = [
  { id: 'pingo-sapinho', name: 'Pingo', species: 'Sapinho da Lagoa', hidingPlace: 'escondido na folha molhada perto do riacho', appearance: 'verde-azulado, pele lisa e brilhante', behavior: 'sentado quietinho', imageSrc: pingoFrogImg, colors: ['#2A7B88', '#7FB069', '#A3C4BC', '#FFFCF8'] },
  { id: 'pipoca-corujinha', name: 'Pipoca', species: 'Corujinha das Árvores', hidingPlace: 'no oco de um tronco com musgo', appearance: 'penas castanho-douradas, olhos redondos cor de mel', behavior: 'cochilando', imageSrc: pipocaOwlImg, colors: ['#E8821A', '#E2B64C', '#7FB069', '#3D2817'] },
  { id: 'avela-esquilinho', name: 'Avelã', species: 'Esquilinho Saltitante', hidingPlace: 'num galho alto balançando', appearance: 'pelo laranja-acobreado, cauda fofa enrolada', behavior: 'mordiscando algo', imageSrc: avelaSquirrelImg, colors: ['#E8821A', '#D97706', '#E2B64C', '#F3E8DF'] },
  { id: 'rubi-joaninha', name: 'Rubi', species: 'Joaninha Vermelhinha', hidingPlace: 'numa pétala de flor silvestre', appearance: 'casquinha vermelha com pontinhos pretos, bem pequena', behavior: 'andando devagar', imageSrc: rubiLadybugImg, colors: ['#DC2626', '#1E293B', '#7FB069', '#FEE2E2'] },
  { id: 'ceu-passarinho', name: 'Céu', species: 'Passarinho Azul', hidingPlace: 'num ninho entre folhas altas', appearance: 'penas azul-turquesa, bico pequeno amarelo', behavior: 'cantando baixinho', imageSrc: ceuBluebirdImg, colors: ['#0284C7', '#38BDF8', '#FACC15', '#F0FDFA'] },
  { id: 'vagar-tartaruguinha', name: 'Vagar', species: 'Tartaruguinha da Trilha', hidingPlace: 'sob uma pedra plana', appearance: 'casco verde-musgo com desenhos, patinhas curtas', behavior: 'esticando o pescoço', imageSrc: vagarTurtleImg, colors: ['#4D7C0F', '#65A30D', '#A16207', '#ECFCCB'] },
  { id: 'trevo-coelhinho', name: 'Trevo', species: 'Coelhinho do Campo', hidingPlace: 'numa touceira de grama alta', appearance: 'pelagem cinza-clara, orelhas compridas em pé', behavior: 'com as orelhas atentas', imageSrc: trevoBunnyImg, colors: ['#94A3B8', '#CBD5E1', '#F472B6', '#F8FAFC'] },
  { id: 'ambar-borboleta', name: 'Âmbar', species: 'Borboleta Dourada', hidingPlace: 'pousada numa flor amarela', appearance: 'asas douradas com bordas pretas, antenas finas', behavior: 'abrindo e fechando as asas', imageSrc: ambarButterflyImg, colors: ['#E2B64C', '#E8821A', '#1E293B', '#FEF3C7'] },
  { id: 'espinho-ouricinho', name: 'Espinho', species: 'Ouriçinho Fofo', hidingPlace: 'num monte de folhas secas', appearance: 'corpo arredondado de espinhos macios, focinho rosado', behavior: 'enrolado numa bolinha', imageSrc: espinhoHedgehogImg, colors: ['#78350F', '#B45309', '#F472B6', '#FDF2F8'] },
  { id: 'brasa-raposinha', name: 'Brasa', species: 'Raposinha Laranja', hidingPlace: 'atrás de um arbusto', appearance: 'pelagem laranja-avermelhada, cauda grande e branca na ponta', behavior: 'espiando de longe', imageSrc: brasaFoxImg, colors: ['#EA580C', '#C2410C', '#FFFFFF', '#1C1917'] },
  { id: 'zum-libelulinha', name: 'Zum', species: 'Libelulinha do Riacho', hidingPlace: 'pairando sobre a água', appearance: 'asas transparentes brilhantes, corpo fino azul-metálico', behavior: 'voando parada no ar', imageSrc: zumDragonflyImg, colors: ['#06B6D4', '#3B82F6', '#E0F2FE', '#E2B64C'] },
  { id: 'bolha-caramujinho', name: 'Bolha', species: 'Caramujinho Vagaroso', hidingPlace: 'numa folha larga e verde', appearance: 'concha espiral marrom-clarinha, corninhos pequenos', behavior: 'deslizando devagar', imageSrc: bolhaSnailImg, colors: ['#A16207', '#CA8A04', '#7FB069', '#FEF9C3'] },
  { id: 'framboesa-passarinho', name: 'Framboesa', species: 'Passarinho Peito-Vermelho', hidingPlace: 'num galho baixo perto da trilha', appearance: 'penugem cinza no corpo, peito vermelho-alaranjado', behavior: 'pulando de galho em galho', imageSrc: framboesaRobinImg, colors: ['#EF4444', '#EA580C', '#64748B', '#F1F5F9'] },
  { id: 'sombra-gatinho', name: 'Sombra', species: 'Gatinho do Mato', hidingPlace: 'entre raízes grossas', appearance: 'pelagem cinza-rajada, olhos verde-amarelados', behavior: 'se espreguiçando', imageSrc: sombraKittenImg, colors: ['#475569', '#64748B', '#EAB308', '#84CC16'] },
  { id: 'malha-cervinho', name: 'Malha', species: 'Cervinho Pintadinho', hidingPlace: 'numa clareira com luz do sol', appearance: 'pelagem castanho-clara com pintinhas brancas, pernas finas e compridas', behavior: 'pastando quietinho', imageSrc: malhaFawnImg, colors: ['#B45309', '#D97706', '#FFFFFF', '#7FB069'] },
  { id: 'faisca-vagalume', name: 'Faísca', species: 'Vagalume Brilhante', hidingPlace: 'dentro de uma flor fechada', appearance: 'corpinho pretinho pequeno, luzinha amarela na cauda', behavior: 'brilhando fraquinho', imageSrc: faiscaFireflyImg, colors: ['#FACC15', '#FEF08A', '#0F172A', '#E8821A'] },
  { id: 'migalha-ratinho', name: 'Migalha', species: 'Ratinho do Campo', hidingPlace: 'num buraquinho entre as raízes', appearance: 'pelo cinza-acastanhado, bigodinhos longos', behavior: 'guardando uma semente', imageSrc: migalhaMouseImg, colors: ['#78716C', '#A8A29E', '#E2B64C', '#F5F5F4'] },
  { id: 'neblina-corujinha-neves', name: 'Neblina', species: 'Filhote de Coruja-das-Neves', hidingPlace: 'num galho coberto de líquen', appearance: 'penas branco-acinzentadas bem fofas, olhos grandes e escuros', behavior: 'piscando devagar', imageSrc: neblinaSnowyOwlImg, colors: ['#E2E8F0', '#CBD5E1', '#1E293B', '#E2B64C'] },
  { id: 'carvao-guaxinim', name: 'Carvão', species: 'Filhote de Guaxinim', hidingPlace: 'dentro de um tronco caído', appearance: 'pelagem cinza com máscara preta nos olhos, cauda listrada', behavior: 'brincando com as patinhas', imageSrc: carvaoRaccoonImg, colors: ['#334155', '#64748B', '#0F172A', '#F8FAFC'] },
  { id: 'orvalho-lagartixa', name: 'Orvalho', species: 'Lagartixa Brilhante', hidingPlace: 'numa pedra ao sol', appearance: 'pele verde-esmeralda com brilho metálico, cauda longa fininha', behavior: 'tomando sol paradinha', imageSrc: orvalholizardImg, colors: ['#059669', '#10B981', '#E2B64C', '#ECFDF5'] }
];

export const CREATURES: Creature[] = RAW_CREATURES.map((c) => {
  const player1Role = `Desenha o corpinho e as cores: ${c.appearance.split(',')[0]}.`;
  const player2Role = `Desenha o bicho ${c.behavior} ${c.hidingPlace}.`;
  const specialTip = `Usem as cores favoritas de vocês para colorir a folha!`;

  return {
    id: c.id, name: c.name, species: c.species, hidingPlace: c.hidingPlace, appearance: c.appearance, behavior: c.behavior,
    title: c.name, subtitle: `${c.species} ${c.hidingPlace}`, imageSrc: c.imageSrc, heartPosition: [0.48, 0.5] as [number, number],
    lore: `O ${c.name} é um ${c.species.toLowerCase()} que mora ${c.hidingPlace}. Ele tem ${c.appearance} e adora ficar ${c.behavior}.`,
    secretTraits: [`Cores: ${c.appearance}`, `Lugar: ${c.hidingPlace}`, `O que faz: ${c.behavior}`],
    clues: [
      { step: 0, title: '1ª Dica: As Cores', seerPrompt: 'Conte que cores você vê no cantinho da tela!', guidingTip: `Diga que tem tons de ${c.appearance.split(',')[0]}...`, spotlightCenter: [0.48, 0.5] as [number, number], spotlightRadius: 0.24, zoom: 1.35, blurAmount: 14, shimmerIntensity: 0.6 },
      { step: 1, title: '2ª Dica: Onde Mora', seerPrompt: 'Onde o bichinho está escondido?', guidingTip: `Diga que ele fica ${c.hidingPlace}...`, spotlightCenter: [0.5, 0.45] as [number, number], spotlightRadius: 0.38, zoom: 1.25, blurAmount: 8, shimmerIntensity: 0.85 },
      { step: 2, title: '3ª Dica: O Corpinho', seerPrompt: 'Como é o corpinho e o rostinho dele?', guidingTip: `Diga que ele tem ${c.appearance}...`, spotlightCenter: [0.48, 0.48] as [number, number], spotlightRadius: 0.55, zoom: 1.15, blurAmount: 4, shimmerIntensity: 0.95 },
      { step: 3, title: '4ª Dica: O que Faz', seerPrompt: 'O que o bichinho está fazendo?', guidingTip: `Diga que ele está ${c.behavior}...`, spotlightCenter: [0.5, 0.5] as [number, number], spotlightRadius: 0.75, zoom: 1.05, blurAmount: 2, shimmerIntensity: 1.0 },
      { step: 4, title: 'Bicho Inteiro', seerPrompt: `O ${c.name} apareceu todinho na tela!`, guidingTip: `Agora conte todos os detalhes do ${c.name}!`, spotlightCenter: [0.5, 0.5] as [number, number], spotlightRadius: 1.0, zoom: 1.0, blurAmount: 0, shimmerIntensity: 1.0 }
    ],
    drawingGuide: { player1Role, player2Role, specialTip, colors: c.colors }
  };
});

export function getRandomCreature(currentId?: string): Creature {
  const pool = CREATURES.filter((c) => c.id !== currentId);
  if (pool.length === 0) return CREATURES[0];
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
