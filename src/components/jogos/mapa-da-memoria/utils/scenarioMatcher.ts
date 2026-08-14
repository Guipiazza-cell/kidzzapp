/**
 * @file scenarioMatcher.ts
 * @description Função pura e isolada para classificação e casamento de memórias
 * com um dos 20 cenários temáticos do Kidzz, ou fallback inteligente por SENTIMENTO
 * (ALEGRE, AVENTURA, CARINHO, ENGRAÇADO) em 4 cenários-coringa temáticos.
 */

import { SCENARIOS } from '../data/scenarios';
import { ScenarioDefinition, ScenarioId, SentimentTone } from '../types';

export interface MatchResult {
  scenario: ScenarioDefinition;
  matchedKeywords: string[];
  score: number;
  isFallback: boolean;
  detectedTone?: SentimentTone;
}

export function normalizePortugueseText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SCENARIO_KEYWORD_RULES: Record<
  Exclude<ScenarioId, 'coringa_alegre' | 'coringa_aventura' | 'coringa_carinho' | 'coringa_engracado'>,
  { exact: string[]; stems: string[] }
> = {
  praia: { exact: ['mar', 'mares', 'praia', 'praias', 'areia', 'areias', 'onda', 'ondas', 'concha', 'conchas', 'conchinha', 'verao', 'sol', 'calor', 'peixe', 'peixinho', 'biquini', 'maio', 'sunga', 'castelinho', 'castelo de areia', 'farol', 'orla', 'calcadao', 'mergulho', 'mergulhar', 'coco', 'agua de coco', 'prancha', 'surf', 'siri', 'caranguejo', 'costa', 'litoral', 'ilha', 'maresia'], stems: ['praian', 'mergulh', 'marinh', 'ondinh'] },
  quintal: { exact: ['cachorro', 'cao', 'dog', 'gato', 'gatinho', 'cat', 'quintal', 'quintalzao', 'jardim', 'jardinzinho', 'brincar la fora', 'brincar na rua', 'grama', 'gramado', 'planta', 'plantas', 'arvore', 'terra', 'lama', 'barro', 'horta', 'mangueira', 'muro', 'passarinho', 'borboleta', 'portao', 'regador', 'folha', 'minhoca', 'flores', 'flor', 'florzinha'], stems: ['latind', 'miand', 'jardineir', 'gramad'] },
  cozinha: { exact: ['cozinha', 'comida', 'comidinha', 'receita', 'receitinha', 'bolo', 'bolinho', 'farinha', 'panela', 'panelinha', 'fogao', 'mesa', 'lanche', 'jantar', 'almoco', 'colher', 'colher de pau', 'cafe', 'suco', 'chocolate', 'brigadeiro', 'massa', 'macarrao', 'biscoito', 'bolacha', 'forno', 'assar', 'cozinhar', 'prato', 'garfo', 'xicara', 'caneca', 'leite', 'acucar', 'panqueca', 'pao', 'queijo', 'melado', 'tigela', 'batedeira'], stems: ['cozinh', 'assad', 'mistur', 'frit'] },
  parque: { exact: ['parque', 'parquinho', 'playground', 'balanco', 'balancar', 'escorregador', 'escorregar', 'pipa', 'pipas', 'empinar pipa', 'gangorra', 'pique', 'esconde', 'bicicleta', 'patinete', 'quadra', 'piquenique', 'pracinha', 'patins', 'carrossel', 'roda gigante'], stems: ['balanc', 'escorreg', 'pedaland'] },
  quarto: { exact: ['cama', 'caminha', 'quarto', 'quartinho', 'dormir', 'dormindo', 'travesseiro', 'historia antes de dormir', 'contar historia', 'abajur', 'edredom', 'lencol', 'pijama', 'sono', 'soninho', 'guarda roupa', 'beliche', 'cabana de lencol', 'cocegas', 'sonho', 'sonhos', 'pesadelo', 'urso de pelucia', 'noite'], stems: ['dorm', 'sonh', 'cobert'] },
  viagem_carro: { exact: ['carro', 'carrinho', 'estrada', 'viagem', 'viajar', 'viajando', 'dirigindo', 'musica no carro', 'cantar no carro', 'janela do carro', 'porta malas', 'gasolina', 'posto de gasolina', 'pedagio', 'rota', 'curva', 'montanha', 'farol'], stems: ['viaj', 'dirig', 'rodovi'] },
  aniversario: { exact: ['festa', 'festinha', 'parabens', 'vela', 'velas', 'velinha', 'balao', 'baloes', 'bexiga', 'bexigas', 'presente', 'presentes', 'cantar parabens', 'soprar vela', 'docinho', 'docinhos', 'aniversario', 'chapeuzinho de festa', 'salgadinho', 'coxinha'], stems: ['paraben', 'assopr', 'comemor'] },
  chuva: { exact: ['chuva', 'chuvinha', 'chuvarada', 'chovendo', 'choveu', 'molhado', 'molhar', 'poca', 'pocas', 'poca d agua', 'guarda chuva', 'sombrinha', 'trovao', 'trovoada', 'temporal', 'tempestade', 'lama', 'galocha', 'galochas', 'pingos', 'barulho de chuva', 'banho de chuva', 'arco iris'], stems: ['chov', 'molh', 'trovej', 'resping'] },
  escola: { exact: ['escola', 'escolinha', 'colegio', 'professora', 'professor', 'tia da escola', 'amigos da escola', 'amiguinhos da escola', 'mochila', 'estojo', 'lapis de cor', 'primeiro dia', 'primeiro dia de aula', 'recreio', 'patio da escola', 'caderno', 'merenda', 'lancheira', 'sala de aula'], stems: ['escolar', 'estud', 'ensin'] },
  noite_filme: { exact: ['pipoca', 'pipocas', 'filme', 'filminho', 'cinema', 'sofa', 'cobertor', 'edredom na sala', 'sala', 'sala de tv', 'pijama', 'noite de filme', 'sessao de cinema', 'televisao', 'desenho animado', 'almofadas'], stems: ['cinem', 'pipoc'] },
  casa_avos: { exact: ['vovo', 'vovozinha', 'vovozeira', 'vovozinho', 'vovo do coracao', 'avos', 'casa da vovo', 'casa do vovo', 'casa dos avos', 'cheiro de comida diferente', 'comida de vo', 'bencao', 'poltrona', 'causo', 'historias antigas', 'dengo'], stems: ['vov'] },
  bicho_estimacao: { exact: ['passarinho', 'passaro', 'peixinho', 'peixe', 'adotar', 'adocao', 'filhote', 'filhotinho', 'bicho de estimacao', 'hamster', 'coelhinho', 'coelho', 'tartaruga', 'gatinho novo', 'cachorrinho novo', 'coleira', 'racao'], stems: ['adot', 'filhot', 'bichinh'] },
  dia_coragem: { exact: ['medico', 'medica', 'dentista', 'consultorio', 'hospital', 'posto de saude', 'vacina', 'injecao', 'curativo', 'band aid', 'corajoso', 'corajosa', 'coragem', 'adesivo', 'adesivo de medalha', 'recompensa', 'exame'], stems: ['coraj', 'vacin', 'medic', 'dentist'] },
  piscina: { exact: ['piscina', 'piscininha', 'nadar', 'nadando', 'natacao', 'boia', 'boia de braco', 'tchibum', 'mergulho na piscina', 'borda da piscina', 'agua azul', 'protetor', 'touca de natacao', 'oculos de natacao'], stems: ['piscin', 'natac'] },
  viagem_frio: { exact: ['neve', 'frio', 'friaca', 'gelo', 'chocolate quente', 'casaco', 'touca de la', 'luva', 'cachecol', 'boneco de neve', 'serra', 'geada', 'fumaca na boca', 'lareira', 'gramado congelado'], stems: ['congel', 'nevad', 'frioz'] },
  natal_fim_ano: { exact: ['natal', 'papai noel', 'arvore de natal', 'luzes de natal', 'pisca pisca', 'ceia', 'ceia de natal', 'ano novo', 'reveillon', 'fogos', 'guirlanda', 'panetone', 'noite feliz', 'enfeite de natal'], stems: ['natalin', 'reveill'] },
  dia_esporte: { exact: ['bola', 'jogo', 'time', 'treino', 'corrida', 'medalha', 'futebol', 'gol', 'chute', 'campeonato', 'torcida', 'uniforme', 'chuteira', 'quadra de esporte', 'basquete', 'volei', 'campeao', 'campea'], stems: ['esport', 'trein', 'jogad'] },
  acampamento: { exact: ['barraca', 'barraca de acampar', 'acampamento', 'acampar', 'fogueira', 'estrelas', 'ceu estrelado', 'mata', 'floresta a noite', 'lanterna', 'sacola de dormir', 'saco de dormir', 'marshmallow', 'trilha a noite'], stems: ['acamp', 'fogueir'] },
  feira_mercado: { exact: ['feira', 'feirinha', 'feira de domingo', 'mercado', 'supermercado', 'fruta', 'frutas', 'compras', 'barraca de feira', 'barraca de comida', 'pastel de feira', 'caldo de cana', 'sacola de compras', 'carrinho de compras', 'legumes'], stems: ['feirant', 'compr'] },
  hora_banho: { exact: ['banho', 'banhinho', 'banheira', 'bolhas', 'bolhas de sabao', 'espuma', 'patinho', 'patinho de borracha', 'shampoo', 'sabonete', 'toalha', 'chuveiro', 'agua quentinha do banho', 'brinquedo de banho'], stems: ['banhad', 'espum', 'sabo'] },
};

const SENTIMENT_WORDS: Record<SentimentTone, string[]> = {
  ENGRAÇADO: ['riu', 'rindo', 'risada', 'risadas', 'engracado', 'engracada', 'hilario', 'hilaria', 'gargalhada', 'gargalhadas', 'piada', 'piadas', 'cocegas', 'coceguinha', 'trapalhada', 'tropeco', 'besteira', 'mico', 'zoeira', 'tombo', 'careta', 'palhaco'],
  CARINHO: ['abraco', 'abracou', 'colo', 'colinho', 'carinho', 'beijo', 'beijinho', 'quentinho', 'amor', 'amorzinho', 'ninar', 'chamego', 'aconchego', 'dengo', 'carinhoso', 'saudade', 'afeto', 'ternura', 'cuidar', 'cuidado', 'conforto'],
  AVENTURA: ['corri', 'correu', 'pulei', 'pulou', 'aventura', 'subir', 'subiu', 'explorar', 'explorou', 'misterio', 'esconder', 'escondeu', 'escalar', 'escalou', 'desafio', 'forte', 'rapido', 'voar', 'alcancar', 'mapa', 'tesouro', 'expedicao'],
  ALEGRE: ['feliz', 'felicidade', 'sorriso', 'sorriu', 'festa', 'animado', 'animada', 'alegria', 'luz', 'contente', 'brilho', 'especial', 'inesquecivel', 'gostoso', 'maravilha', 'magico', 'magica', 'radiante', 'dia bom', 'momento bom'],
};

export function detectSentimentTone(normalizedText: string): SentimentTone {
  const words = normalizedText.split(' ');
  const scores: Record<SentimentTone, number> = { ENGRAÇADO: 0, CARINHO: 0, AVENTURA: 0, ALEGRE: 0 };
  for (const tone of ['ENGRAÇADO', 'CARINHO', 'AVENTURA', 'ALEGRE'] as SentimentTone[]) {
    for (const kw of SENTIMENT_WORDS[tone]) {
      const normKw = normalizePortugueseText(kw);
      if (normKw.includes(' ')) {
        if (normalizedText.includes(normKw)) { scores[tone] += 4; }
      } else {
        for (const w of words) {
          if (w === normKw || (w.length > 4 && normKw.length > 4 && w.startsWith(normKw))) { scores[tone] += 2; }
        }
      }
    }
  }
  let maxScore = 0;
  let dominantTone: SentimentTone = 'ALEGRE';
  for (const tone of ['ENGRAÇADO', 'CARINHO', 'AVENTURA', 'ALEGRE'] as SentimentTone[]) {
    if (scores[tone] > maxScore) { maxScore = scores[tone]; dominantTone = tone; }
  }
  return dominantTone;
}

function getWildcardScenarioByTone(tone: SentimentTone): ScenarioDefinition {
  switch (tone) {
    case 'ENGRAÇADO': return SCENARIOS.coringa_engracado;
    case 'CARINHO': return SCENARIOS.coringa_carinho;
    case 'AVENTURA': return SCENARIOS.coringa_aventura;
    case 'ALEGRE':
    default: return SCENARIOS.coringa_alegre;
  }
}

export function matchScenarioFromText(userInput: string): MatchResult {
  const normalized = normalizePortugueseText(userInput);
  if (!normalized) {
    const tone: SentimentTone = 'ALEGRE';
    return { scenario: getWildcardScenarioByTone(tone), matchedKeywords: [], score: 0, isFallback: true, detectedTone: tone };
  }
  const scenarioKeys: (keyof typeof SCENARIO_KEYWORD_RULES)[] = ['praia', 'quintal', 'cozinha', 'parque', 'quarto', 'viagem_carro', 'aniversario', 'chuva', 'escola', 'noite_filme', 'casa_avos', 'bicho_estimacao', 'dia_coragem', 'piscina', 'viagem_frio', 'natal_fim_ano', 'dia_esporte', 'acampamento', 'feira_mercado', 'hora_banho'];
  let bestScenarioId: ScenarioId | null = null;
  let highestScore = 0;
  let bestMatches: string[] = [];
  const words = normalized.split(' ');
  for (const scenarioId of scenarioKeys) {
    const rules = SCENARIO_KEYWORD_RULES[scenarioId];
    if (!rules) continue;
    let scenarioScore = 0;
    const currentMatches: string[] = [];
    for (const keyword of rules.exact) {
      const normKeyword = normalizePortugueseText(keyword);
      if (normKeyword.includes(' ')) {
        if (normalized.includes(normKeyword)) { scenarioScore += 6; currentMatches.push(keyword); }
      } else {
        for (const w of words) {
          if (w === normKeyword) { scenarioScore += 3; currentMatches.push(w); }
          else if (w.length >= 4 && normKeyword.length >= 4 && (w.startsWith(normKeyword) || normKeyword.startsWith(w))) { scenarioScore += 2; currentMatches.push(w); }
        }
      }
    }
    for (const stem of rules.stems) {
      for (const w of words) {
        if (w.startsWith(stem) && !currentMatches.includes(w)) { scenarioScore += 2; currentMatches.push(w); }
      }
    }
    if (scenarioScore > highestScore) { highestScore = scenarioScore; bestScenarioId = scenarioId; bestMatches = Array.from(new Set(currentMatches)); }
  }
  if (highestScore === 0 || !bestScenarioId) {
    const detectedTone = detectSentimentTone(normalized);
    const wildcardScenario = getWildcardScenarioByTone(detectedTone);
    return { scenario: wildcardScenario, matchedKeywords: [], score: 0, isFallback: true, detectedTone };
  }
  return { scenario: SCENARIOS[bestScenarioId] || SCENARIOS.coringa_alegre, matchedKeywords: bestMatches, score: highestScore, isFallback: false };
}
