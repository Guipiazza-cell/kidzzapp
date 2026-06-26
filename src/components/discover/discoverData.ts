// Dados da aba Descobrir, fácil de editar/expandir
// {nome} é substituído pelo nome da criança em runtime.

export type Activity = {
  id: string;
  title: string;
  ageRange: string;
  duration: string;
  material: string;
  safetyNote?: string;
  discovery: string;       // ✨ A descoberta
  steps: string[];         // 🤲 Mãos à obra (numerados)
  parentMoment: string;    // 💜 Momento com o pai/mãe
  badge: string;           // ✦ Selo (use {nome} dinâmico)
};

export type Theme = {
  id: "animais" | "espaco" | "natureza" | "coisas";
  title: string;
  emoji: string;
  description: string;
  // Mundo de cor (referência)
  bg: string;        // gradiente do card
  veil: string;      // veil sobre a imagem para legibilidade do título
  ink: string;       // cor do título
  body: string;      // cor do corpo
  cta: string;       // cor do botão circular
  ctaInk: string;    // cor do ícone do botão
  image: string;     // slot fácil de trocar
  activities: Activity[];
};

// Slots de imagem nomeados: troque os caminhos quando subir as artes finais.
export const DISCOVER_IMAGES = {
  hero: "/discover/hero-pai-filho.jpg",
  imgAnimais: "/discover/animais-leao.jpg",
  imgEspaco: "/discover/espaco-astronauta.jpg",
  imgNatureza: "/discover/natureza-muda.jpg",
  imgCoisas: "/discover/coisas-carrinho.jpg",
};

export const DISCOVER_THEMES: Theme[] = [
  {
    id: "animais",
    title: "Animais",
    emoji: "🐾",
    description: "Conheçam de perto os animais e seus habitats incríveis.",
    bg: "linear-gradient(180deg, #EFEAD9 0%, #E6E0CB 100%)",
    veil: "linear-gradient(90deg, rgba(239,234,217,0.96) 0%, rgba(239,234,217,0.78) 35%, rgba(239,234,217,0) 65%)",
    ink: "#46703A",
    body: "#3a3a30",
    cta: "#46703A",
    ctaInk: "#FFFCF8",
    image: DISCOVER_IMAGES.imgAnimais,
    activities: [
      {
        id: "beija-flor",
        title: "O coração do beija-flor bate 1.200 vezes por minuto",
        ageRange: "4 a 8 anos",
        duration: "10 min",
        material: "Só o corpo",
        discovery:
          "O beija-flor vive no acelerado: o coração da gente bate cerca de 80 vezes por minuto, o dele bate 1.200. Por isso ele consegue ficar parado no ar, batendo as asinhas tão rápido que viram um borrão.",
        steps: [
          "Coloquem a mão no peito sentadinhos e sintam o coração calmo.",
          "Corram no lugar por 20 segundos, bem forte.",
          "Voltem a sentir o coração: agora ele dispara, está mais perto do beija-flor.",
          "Batam palma 10 segundos imitando a velocidade das asinhas dele.",
        ],
        parentMoment: "Qual bicho você acha que tem o coração mais calminho do mundo?",
        badge: "Hoje o {nome} correu rápido igual beija-flor! 🐦",
      },
      {
        id: "gato-pe",
        title: "Por que o gato cai sempre de pé?",
        ageRange: "4 a 10 anos",
        duration: "15 min",
        material: "Pelúcia + almofada",
        safetyNote: "Nunca, nunca testem com um gato de verdade. Só pelúcia, ok?",
        discovery:
          "O gato tem um 'GPS' dentro do ouvido que avisa onde é o chão. Em pleno ar, ele se vira rapidinho e pousa de patas. A gente não consegue porque o nosso GPS é mais devagar.",
        steps: [
          "Soltem a pelúcia girando bem por cima da almofada e vejam como ela cai.",
          "Agora a criança gira de olhos fechados e tenta parar reta.",
          "Comparem: a pelúcia caiu como? E a criança parou alinhada?",
          "Conversem sobre como o gato faz isso em milissegundos.",
        ],
        parentMoment: "Você já viu algum bicho fazer uma coisa que parecia impossível?",
        badge: "O {nome} virou cientista do equilíbrio! 🐱",
      },
      {
        id: "elefantes-pe",
        title: "Os elefantes conversam com os pés",
        ageRange: "5 a 10 anos",
        duration: "15 min",
        material: "O chão de casa",
        discovery:
          "Elefantes mandam recado uns pros outros fazendo o chão tremer de leve com as patas. Outro elefante a quilômetros de distância sente a vibração com os pés e entende a mensagem.",
        steps: [
          "Uma pessoa pisa forte numa ponta da sala.",
          "Outra deita a mão no chão na outra ponta e tenta sentir.",
          "Criem um código: 1 pisada = 'oi', 2 pisadas = 'vem cá', 3 = 'corre!'.",
          "Brinquem de conversar só pelos pés.",
        ],
        parentMoment: "Que recado secreto você quer me mandar agora pelo chão?",
        badge: "Família {nome} inventou o telefone-elefante! 🐘",
      },
    ],
  },
  {
    id: "espaco",
    title: "Espaço",
    emoji: "🪐",
    description: "Uma viagem pelo universo, planetas, estrelas e muito mais.",
    bg: "linear-gradient(180deg, #14213D 0%, #0E1830 100%)",
    veil: "linear-gradient(90deg, rgba(20,33,61,0.96) 0%, rgba(20,33,61,0.75) 35%, rgba(20,33,61,0) 65%)",
    ink: "#FFFCF8",
    body: "#D8DCEA",
    cta: "#FFFCF8",
    ctaInk: "#14213D",
    image: DISCOVER_IMAGES.imgEspaco,
    activities: [
      {
        id: "peso-lua",
        title: "Quanto você pesaria na Lua?",
        ageRange: "5 a 10 anos",
        duration: "15 min",
        material: "Fita métrica + chão",
        discovery:
          "Na Lua a gente pesa 6 vezes menos. Um pulinho normal vira um salto de gigante. Astronautas andam quase flutuando lá!",
        steps: [
          "Peguem o peso da criança e dividam por 6. Esse é o peso lunar dela.",
          "Marquem no chão até onde ela pula normalmente.",
          "Marquem 6 vezes essa distância: seria o pulo dela na Lua.",
          "Brinquem de pular em câmera lenta, como astronauta.",
        ],
        parentMoment: "O que seria divertido demais de fazer pulando assim na Lua?",
        badge: "Na Lua o {nome} pesa pouquinho e pula igual gigante! 🌙",
      },
      {
        id: "sol-grande",
        title: "O Sol é tão grande que cabem 1 milhão de Terras dentro",
        ageRange: "4 a 10 anos",
        duration: "10 min",
        material: "Bola + ervilha (ou grão)",
        discovery:
          "Se o Sol fosse uma bola de basquete, a Terra seria do tamanho de um grão de areia do lado. E ainda existem estrelas muito maiores que o Sol lá longe!",
        steps: [
          "Peguem a bola maior que tiverem.",
          "Peguem uma ervilha ou grão pequenininho.",
          "Coloquem lado a lado e olhem em silêncio por 10 segundos.",
          "Imaginem que cada estrelinha no céu é um sol, alguns ainda maiores.",
        ],
        parentMoment: "O que será que tem nas outras estrelas?",
        badge: "O {nome} descobriu o tamanho do Sol! ☀️",
      },
      {
        id: "constelacao",
        title: "Construam uma constelação no teto",
        ageRange: "5 a 10 anos",
        duration: "20 min",
        material: "Lanterna + papelão",
        discovery:
          "As estrelas formam desenhos no céu. Os antigos viam leões, ursos, caçadores. São as constelações. Vocês podem criar a sua agora.",
        steps: [
          "Desenhem juntos um símbolo da família no papelão.",
          "Furem os pontos do desenho com algo pontudo (adulto faz).",
          "Apaguem a luz e projetem a lanterna por trás do papelão no teto.",
          "Deem um nome para a constelação da família.",
        ],
        parentMoment: "Se a gente virasse constelação, qual seria o nome?",
        badge: "Criamos a constelação da família {nome}! ✨",
      },
    ],
  },
  {
    id: "natureza",
    title: "Natureza",
    emoji: "🌿",
    description: "Descubram as plantas, os ecossistemas e os ciclos da vida.",
    bg: "linear-gradient(180deg, #E6EFDC 0%, #D8E6CB 100%)",
    veil: "linear-gradient(90deg, rgba(230,239,220,0.96) 0%, rgba(230,239,220,0.78) 35%, rgba(230,239,220,0) 65%)",
    ink: "#2E5524",
    body: "#33402c",
    cta: "#46703A",
    ctaInk: "#FFFCF8",
    image: DISCOVER_IMAGES.imgNatureza,
    activities: [
      {
        id: "feijao",
        title: "Plantem um feijão e vejam a vida acontecer",
        ageRange: "4 a 10 anos",
        duration: "10 min + alguns dias",
        material: "Feijão + algodão + copo",
        discovery:
          "Dentro daquele feijão duro já existe uma plantinha esperando. Com água e luz, ela acorda e começa a crescer.",
        steps: [
          "Coloquem algodão molhado dentro do copo.",
          "Encostem o feijão na parede do copo (pra dar pra ver).",
          "Deixem perto da janela e molhem todo dia um pouquinho.",
          "Façam um 'diário da plantinha' desenhado a cada 2 dias.",
        ],
        parentMoment: "Do que a plantinha precisa pra crescer feliz? E você, do que precisa?",
        badge: "O {nome} plantou a primeira sementinha! 🌱",
      },
      {
        id: "cacada-cores",
        title: "Caçada de cores na natureza",
        ageRange: "4 a 8 anos",
        duration: "20 min",
        material: "Caixa de ovo",
        discovery:
          "A natureza tem mais cores do que qualquer caixa de lápis. Vamos provar.",
        steps: [
          "Pintem cada buraquinho da caixa de ovo com uma cor diferente.",
          "Saiam (quintal, praça, varanda) procurando algo daquela cor.",
          "Coloquem o pedacinho encontrado no buraquinho correspondente.",
          "No final, vocês têm um arco-íris natural na mão.",
        ],
        parentMoment: "Qual cor foi a mais difícil de encontrar lá fora?",
        badge: "O {nome} caçou um arco-íris na natureza! 🌈",
      },
      {
        id: "chuva-copo",
        title: "Por que a chuva cai? Façam chover num copo",
        ageRange: "5 a 10 anos",
        duration: "15 min",
        material: "Copo + água morna + pratinho + gelo",
        safetyNote: "Adulto cuida da água morna.",
        discovery:
          "A água quentinha sobe virando vapor, encontra o frio lá em cima e volta como chuva. É exatamente isso que acontece nas nuvens.",
        steps: [
          "Coloquem um pouco de água morna no copo.",
          "Apoiem o pratinho com gelo em cima do copo.",
          "Esperem 2 minutos olhando.",
          "Vejam as gotinhas se formando no pratinho e 'chovendo' de volta.",
        ],
        parentMoment: "Pra onde será que vai toda a água da chuva depois?",
        badge: "O {nome} fez chover dentro de um copo! 🌧️",
      },
    ],
  },
  {
    id: "coisas",
    title: "Como as coisas são feitas",
    emoji: "⚙️",
    description: "Entendam o passo a passo por trás das coisas do nosso dia a dia.",
    bg: "linear-gradient(180deg, #F4ECD6 0%, #ECDFBE 100%)",
    veil: "linear-gradient(90deg, rgba(244,236,214,0.96) 0%, rgba(244,236,214,0.78) 35%, rgba(244,236,214,0) 65%)",
    ink: "#7A5A18",
    body: "#3f3424",
    cta: "#C9A227",
    ctaInk: "#FFFCF8",
    image: DISCOVER_IMAGES.imgCoisas,
    activities: [
      {
        id: "pao",
        title: "De onde vem o pão? Façam um juntos",
        ageRange: "4 a 10 anos",
        duration: "30 min",
        material: "Farinha + água + fermento + sal",
        safetyNote: "Adulto cuida do forno.",
        discovery:
          "Uma poeirinha branca (farinha), água e um pozinho mágico (fermento) viram massa, crescem sozinhos e, no forno, viram pão quentinho.",
        steps: [
          "Misturem farinha, água morna, sal e fermento.",
          "Amassem com as mãos por uns 5 minutos. Vale rir muito.",
          "Cubram e deixem crescer 1 hora. Olhem de vez em quando.",
          "Adulto leva pro forno. Depois, comam juntos a obra de vocês.",
        ],
        parentMoment: "O que mais começa de um jeito e vira uma coisa totalmente diferente?",
        badge: "O {nome} fez o próprio pão do zero! 🍞",
      },
      {
        id: "ponte",
        title: "Como funciona uma ponte? Construam uma",
        ageRange: "5 a 10 anos",
        duration: "20 min",
        material: "Papel + 2 livros + moedas",
        discovery:
          "Papel liso não segura nada. Mas se você dobra ele em sanfona, ele vira forte. Esse é o segredo escondido em quase toda ponte de verdade.",
        steps: [
          "Apoiem o papel liso entre dois livros e ponham uma moeda em cima. Ele afunda.",
          "Tirem o papel e dobrem em sanfona (zig-zag).",
          "Coloquem de novo entre os livros.",
          "Vejam quantas moedas ele aguenta agora.",
        ],
        parentMoment: "Por que a sanfona ficou mais forte? Onde mais a gente vê esse formato?",
        badge: "O {nome} virou engenheiro de pontes! 🌉",
      },
      {
        id: "sombra",
        title: "De onde vem a sombra? Brinquem com a luz",
        ageRange: "4 a 8 anos",
        duration: "15 min",
        material: "Lanterna + parede",
        discovery:
          "Sombra é o que sobra quando alguém bloqueia a luz. Quanto mais perto da luz, maior a sombra fica.",
        steps: [
          "Apaguem a luz do quarto e liguem só a lanterna.",
          "Façam bichos com as mãos na parede.",
          "Aproximem e afastem a mão da lanterna e vejam a sombra mudar de tamanho.",
          "Inventem juntos uma pequena história de sombras.",
        ],
        parentMoment: "Quando a nossa sombra fica mais comprida lá fora?",
        badge: "O {nome} fez um teatro de sombras! 🌑",
      },
    ],
  },
];
