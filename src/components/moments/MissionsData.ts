export interface Mission {
  id: string;
  name: string;
  description: string;
  time: string;
  ageRange: string;
  level: string;
  materials: string[];
  steps: string[];
  phrases: string[];
  develops: string[];
  wowMoment: string;
  closingPhrase: string;
  emoji: string;
  color: string;
  isNew?: boolean;
}

export const MISSIONS: Mission[] = [
  {
    id: "caca-emocoes",
    name: "Caça às Emoções",
    description: "Descubra juntos os sentimentos escondidos no dia a dia.",
    time: "10 min",
    ageRange: "3–8 anos",
    level: "Fácil",
    materials: ["Papel", "Lápis de cor", "Espelho"],
    steps: [
      "Fiquem na frente do espelho juntos",
      "Façam caretas de alegria, tristeza, surpresa e raiva",
      "Desenhem cada emoção em um papel",
      "Conversem sobre quando sentem cada uma"
    ],
    phrases: [
      "Qual emoção você está sentindo agora?",
      "Sabia que todas as emoções são normais?",
      "Eu também sinto isso às vezes!"
    ],
    develops: ["Inteligência emocional", "Vocabulário afetivo", "Empatia"],
    wowMoment: "Quando a criança identifica uma emoção no pai/mãe e diz o nome dela!",
    closingPhrase: "Sentir é superpoder. E agora vocês dois sabem nomear cada um deles. 💛",
    emoji: "🎭",
    color: "from-kid-pink to-kid-purple",
    isNew: true,
  },
  {
    id: "construtor-de-mundos",
    name: "Construtor de Mundos",
    description: "Criem juntos um planeta imaginário em 10 minutos.",
    time: "10 min",
    ageRange: "4–8 anos",
    level: "Fácil",
    materials: ["Folha grande", "Giz de cera", "Imaginação"],
    steps: [
      "Desenhem um planeta no centro da folha",
      "A criança escolhe: que tipo de seres vivem lá?",
      "O pai desenha o que a criança descreve",
      "Deem um nome ao planeta juntos"
    ],
    phrases: [
      "Que cor é o céu no seu planeta?",
      "Os seres de lá são amigos?",
      "Eu adoraria morar nesse mundo!"
    ],
    develops: ["Criatividade", "Linguagem descritiva", "Trabalho em equipe"],
    wowMoment: "Quando a criança diz algo surpreendente sobre as regras do planeta!",
    closingPhrase: "Vocês acabaram de criar algo que não existia antes. Juntos. ✨",
    emoji: "🌍",
    color: "from-kid-blue to-kid-green",
    isNew: true,
  },
  {
    id: "chef-maluco",
    name: "Chef Maluco",
    description: "Uma receita inventada que vai virar tradição da família.",
    time: "15 min",
    ageRange: "3–7 anos",
    level: "Fácil",
    materials: ["Frutas ou biscoitos", "Prato", "Criatividade"],
    steps: [
      "Escolham 3 ingredientes simples da cozinha",
      "A criança monta o prato como quiser (rosto, paisagem...)",
      "Inventem um nome engraçado para a 'receita'",
      "Comam juntos celebrando a criação"
    ],
    phrases: [
      "Você é o chef hoje! O que vamos criar?",
      "Isso ficou lindo! Como chamamos essa obra?",
      "Melhor receita que já comi!"
    ],
    develops: ["Autonomia", "Coordenação motora", "Autoestima"],
    wowMoment: "Quando a criança serve o prato com orgulho e diz: 'Eu que fiz!'",
    closingPhrase: "Cozinhar junto é criar memórias que alimentam a alma. 🍳💕",
    emoji: "👨‍🍳",
    color: "from-kid-orange to-kid-yellow",
  },
  {
    id: "detetive-de-sons",
    name: "Detetive de Sons",
    description: "Fechem os olhos e descubram o mundo só ouvindo.",
    time: "8 min",
    ageRange: "3–6 anos",
    level: "Fácil",
    materials: ["Nenhum material"],
    steps: [
      "Sentem-se em silêncio por 1 minuto",
      "Cada um diz 3 sons que ouviu",
      "Tentem imitar os sons um para o outro",
      "Inventem uma história com os sons ouvidos"
    ],
    phrases: [
      "Shh... o que seu ouvido está captando?",
      "Uau, você ouviu isso? Eu não tinha percebido!",
      "Seus ouvidos são super poderosos!"
    ],
    develops: ["Atenção plena", "Escuta ativa", "Percepção sensorial"],
    wowMoment: "Quando a criança ouve algo que o adulto não percebeu!",
    closingPhrase: "O mundo fala com a gente o tempo todo. Hoje vocês ouviram juntos. 🎵",
    emoji: "🔍",
    color: "from-kid-green to-kid-blue",
  },
  {
    id: "maquina-do-tempo",
    name: "Máquina do Tempo",
    description: "Viagem no tempo: conte algo de quando você era criança.",
    time: "10 min",
    ageRange: "4–8 anos",
    level: "Fácil",
    materials: ["Fotos antigas (opcional)", "Imaginação"],
    steps: [
      "Conte uma história real da sua infância",
      "A criança faz perguntas sobre como era",
      "Comparem: o que mudou e o que é igual?",
      "Imaginem juntos como será o futuro"
    ],
    phrases: [
      "Quando eu tinha sua idade, eu...",
      "Sabe o que eu mais gostava de fazer?",
      "Um dia você vai contar isso pro seu filho!"
    ],
    develops: ["Vínculo familiar", "Noção de tempo", "Narrativa pessoal"],
    wowMoment: "Quando a criança descobre algo surpreendente sobre a infância do pai/mãe!",
    closingPhrase: "Histórias de família são tesouros que ninguém pode tirar de vocês. 💎",
    emoji: "⏰",
    color: "from-kid-purple to-kid-pink",
  },
  {
    id: "super-heroi-secreto",
    name: "Super-Herói Secreto",
    description: "Crie um super-herói baseado nas qualidades do seu filho.",
    time: "12 min",
    ageRange: "4–8 anos",
    level: "Médio",
    materials: ["Papel", "Lápis", "Capa improvisada (toalha)"],
    steps: [
      "Pergunte: qual é o seu superpoder?",
      "Desenhem o herói juntos com capa e tudo",
      "Inventem o nome e o grito de guerra",
      "Encenem uma missão rápida pela casa"
    ],
    phrases: [
      "Todo herói tem uma qualidade especial. Qual é a sua?",
      "Esse herói é incrível! Parece com alguém que eu conheço...",
      "Missão cumprida, super-herói!"
    ],
    develops: ["Autoconhecimento", "Imaginação", "Confiança"],
    wowMoment: "Quando a criança percebe que o herói tem as mesmas qualidades que ela!",
    closingPhrase: "O maior herói da casa é quem faz os outros se sentirem amados. 🦸",
    emoji: "🦸",
    color: "from-kid-yellow to-kid-orange",
    isNew: true,
  },
];
