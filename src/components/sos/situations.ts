/**
 * Catálogo de situações do SOS Kidzz.
 * Estrutura emocional, NÃO médica. Não é central de emergência.
 *
 * Todas as situações têm fluxo completo: acolhimento → respiração → prático → apoio.
 * Cada uma usa um padrão de respiração + copy + tips + playlist próprios.
 */
export type BreathPattern = {
  in: number;   // segundos
  hold: number;
  out: number;
  cycles: number;
  intro: string; // narração ElevenLabs no início da respiração
};

export type PracticalTip = {
  iconKey: "hand" | "wind" | "heart" | "moon" | "shield" | "leaf" | "sun" | "compass";
  title: string;
  desc: string;
};

export type SosPlaylist = {
  label: string;
  tracks: number;
  desc: string;
  // gradiente do card de playlist (hsl)
  from: string;
  to: string;
  accent: string;
};

export type SosSituation = {
  id: string;
  emoji: string;
  label: string;
  tint: string;        // hsl color usado em halos/bordas
  status: "implemented";
  acolhimento: {
    title: string;        // título grande
    subtitle: string;     // 1-2 linhas
    voice: string;        // narração ElevenLabs
    cta: string;
  };
  breath: BreathPattern;
  practical: {
    eyebrow: string;
    title: string;
    tips: PracticalTip[];
  };
  support: {
    eyebrow: string;
    title: string;
    intro: string;
    playlist: SosPlaylist;
    parentNote: string;  // mini bilhete pros pais no final
    closeCta: string;
  };
  /** Etapa "Continuidade" — mini experiências embutidas */
  continuity?: {
    eyebrow: string;
    title: string;     // ex: "Vamos passar por isso juntos"
    subtitle: string;
    options: Array<{
      iconKey: "music" | "book" | "hug" | "moon";
      title: string;
      desc: string;
    }>;
  };
  /** Etapa "Fechamento emocional" — desaceleração + memória */
  closing?: {
    eyebrow: string;     // ex: "Momentos difíceis passam"
    title: string;       // frase principal (1 linha emocional)
    subtitle: string;    // 2ª frase (pausa de 1.2s no UI)
    shareable: string;   // frase compartilhável
    recap: string[];     // "Hoje vocês:" bullets curtos (3 itens)
    saveCta: string;     // ex: "Salvar esse momento"
  };
};

export const SOS_SITUATIONS: SosSituation[] = [
  {
    id: "crying",
    emoji: "🔴",
    label: "Crise de choro",
    tint: "hsl(0 75% 62%)",
    status: "implemented",
    acolhimento: {
      title: "Respira.",
      subtitle: "Seu filho não precisa de perfeição.\nPrecisa sentir segurança.",
      voice: "Respira. Seu filho não precisa de perfeição. Precisa sentir segurança. Você está fazendo o suficiente.",
      cta: "Respirar juntos",
    },
    breath: {
      in: 4, hold: 2, out: 6, cycles: 5,
      intro: "Vamos respirar juntos. Inspira pelo nariz, segura, e solta devagar pela boca.",
    },
    practical: {
      eyebrow: "Agora, com calma",
      title: "Três coisas que ajudam",
      tips: [
        { iconKey: "hand",  title: "Abraço silencioso", desc: "Sem palavras. Só presença. O corpo regula antes da mente." },
        { iconKey: "wind",  title: "Mude de ambiente",  desc: "Levar pro colo até uma janela ou outro cômodo quebra o ciclo." },
        { iconKey: "heart", title: "Valide o sentimento", desc: "“Tá difícil, né? Tô aqui com você.” Sem corrigir, sem ensinar agora." },
      ],
    },
    support: {
      eyebrow: "Apoio contínuo",
      title: "Sons que acalmam",
      intro: "Playlist curada para o que veio agora — e o que vem depois.",
      playlist: {
        label: "Acalmar crise", tracks: 6,
        desc: "chuva suave · canto de pássaros · piano lento",
        from: "140 35% 94%", to: "150 30% 88%", accent: "150 45% 55%",
      },
      parentNote: "Você acabou de regular um corpo pequeno que ainda não sabe se regular sozinho. Isso é amor em ação. Você está fazendo bem.",
      closeCta: "Estou melhor agora",
    },
  },
  {
    id: "tantrum",
    emoji: "😤",
    label: "Birras intensas",
    tint: "hsl(18 80% 60%)",
    status: "implemented",
    acolhimento: {
      title: "Você é o adulto seguro.",
      subtitle: "A birra não é desobediência.\nÉ um cérebro pequeno em tempestade.",
      voice: "A birra não é desafio. É um cérebro pequeno em tempestade. Sua calma é a âncora que ele procura.",
      cta: "Ancorar juntos",
    },
    breath: {
      in: 4, hold: 4, out: 6, cycles: 5,
      intro: "Inspira firme. Segura um instante. Solta longo. Sua calma vira a dele.",
    },
    practical: {
      eyebrow: "Enquanto passa",
      title: "Três âncoras que funcionam",
      tips: [
        { iconKey: "shield", title: "Fique perto, em silêncio", desc: "Não tente ensinar agora. O cérebro racional dele está offline." },
        { iconKey: "hand",   title: "Mãos abertas, voz grave", desc: "Postura aberta + voz baixa sinalizam: 'aqui é seguro'." },
        { iconKey: "heart",  title: "Nomeie o sentimento",    desc: "“Você tá com muita raiva. Eu vejo.” Nomear acalma." },
      ],
    },
    support: {
      eyebrow: "Depois da tempestade",
      title: "Reconectar com leveza",
      intro: "Quando o corpo dele baixar, reconecte com algo simples.",
      playlist: {
        label: "Pós-birra · reconexão", tracks: 5,
        desc: "música suave · histórias curtas · respiros lentos",
        from: "22 45% 94%", to: "18 40% 88%", accent: "18 75% 55%",
      },
      parentNote: "Você não falhou. Birras fazem parte do cérebro em construção. Você manteve a presença — isso é o que ensina regulação.",
      closeCta: "Estamos bem agora",
    },
  },
  {
    id: "sleep",
    emoji: "😴",
    label: "Sono difícil",
    tint: "hsl(245 50% 65%)",
    status: "implemented",
    acolhimento: {
      title: "A noite pode ser gentil.",
      subtitle: "O corpo dele está cansado.\nPrecisa só de ritmo e segurança.",
      voice: "A noite pode ser gentil. O corpo dele está cansado. Precisa só de ritmo, escuro e a sua presença.",
      cta: "Desacelerar juntos",
    },
    breath: {
      in: 4, hold: 7, out: 8, cycles: 4,
      intro: "Respiração 4-7-8, a mais usada pra dormir. Inspira em quatro, segura em sete, solta em oito.",
    },
    practical: {
      eyebrow: "Ritmo de descida",
      title: "Três passos pro sono",
      tips: [
        { iconKey: "moon", title: "Luz baixa, voz baixa",   desc: "Diminua luz e som juntos. O cérebro lê isso como 'hora de dormir'." },
        { iconKey: "leaf", title: "Toque previsível",       desc: "Mão nas costas em ritmo constante. Previsibilidade gera sono." },
        { iconKey: "wind", title: "Uma frase só, repetida", desc: "“Tá tudo bem, eu tô aqui.” A repetição é mais poderosa que a palavra." },
      ],
    },
    support: {
      eyebrow: "Trilha do sono",
      title: "Sons para a noite",
      intro: "Áudios pensados pra deixar o quarto pronto pro descanso.",
      playlist: {
        label: "Pré-sono · noite gentil", tracks: 7,
        desc: "ruído branco · chuva fina · ninar instrumental",
        from: "245 35% 94%", to: "260 30% 88%", accent: "245 50% 60%",
      },
      parentNote: "Adormecer é uma habilidade que se aprende, não um interruptor. Você está ensinando, noite após noite. Isso é cuidado.",
      closeCta: "Boa noite",
    },
  },
  {
    id: "fear",
    emoji: "😰",
    label: "Medos",
    tint: "hsl(265 45% 65%)",
    status: "implemented",
    acolhimento: {
      title: "O medo é real pra ele.",
      subtitle: "Você não precisa explicar agora.\nSó ficar.",
      voice: "O medo dele é real, mesmo que o motivo pareça pequeno. Você não precisa explicar agora. Só ficar perto já cura.",
      cta: "Ficar perto",
    },
    breath: {
      in: 4, hold: 2, out: 6, cycles: 5,
      intro: "Vamos respirar baixinho juntos. Inspira leve, solta longo. O corpo dele vai sentir o seu ritmo.",
    },
    practical: {
      eyebrow: "Dissolvendo o medo",
      title: "Três gestos seguros",
      tips: [
        { iconKey: "shield", title: "Acenda uma luz pequena", desc: "Uma luz baixa muda a química do medo sem expor demais." },
        { iconKey: "heart",  title: "Valide antes de explicar", desc: "“Eu sei, parece assustador.” Validar abre caminho pra raciocinar depois." },
        { iconKey: "hand",   title: "Objeto âncora",            desc: "Bicho de pelúcia, paninho, mãozinha sua. Um objeto = continuidade da segurança." },
      ],
    },
    support: {
      eyebrow: "Apoio pra noite",
      title: "Histórias que abraçam",
      intro: "Histórias curtas pra transformar o medo em coragem.",
      playlist: {
        label: "Corajosos juntos", tracks: 5,
        desc: "narrações suaves · finais felizes · vozes gentis",
        from: "265 35% 94%", to: "280 30% 88%", accent: "265 55% 60%",
      },
      parentNote: "Você é o pra-raios emocional dele. Quando ele tem medo, você é o lugar seguro. Isso constrói coragem pra vida.",
      closeCta: "Já passou",
    },
  },
  {
    id: "anxiety",
    emoji: "😟",
    label: "Ansiedade",
    tint: "hsl(200 55% 60%)",
    status: "implemented",
    acolhimento: {
      title: "O agora basta.",
      subtitle: "Ele não precisa entender o futuro.\nSó sentir o presente seguro.",
      voice: "A ansiedade dele não é manha. É um sistema nervoso pequeno tentando processar muito. Volte com ele pro agora.",
      cta: "Voltar ao agora",
    },
    breath: {
      in: 4, hold: 4, out: 4, cycles: 6,
      intro: "Respiração quadrada. Inspira em quatro, segura em quatro, solta em quatro, segura em quatro. Ancora o sistema nervoso.",
    },
    practical: {
      eyebrow: "Sensoriais 5-4-3-2-1",
      title: "Três âncoras do corpo",
      tips: [
        { iconKey: "leaf",    title: "Cinco coisas que vê",   desc: "Peça pra ele apontar 5 coisas no quarto. Tira do loop mental." },
        { iconKey: "wind",    title: "Quatro que toca",        desc: "Texturas diferentes: parede, pelúcia, sua mão, sua roupa." },
        { iconKey: "compass", title: "Três que ouve",          desc: "Silêncio, sua voz, um som de fora. Volta pro presente." },
      ],
    },
    support: {
      eyebrow: "Retomar o solo",
      title: "Sons do mundo real",
      intro: "Áudios que ancoram no presente sensorial.",
      playlist: {
        label: "Aterrar · presente", tracks: 6,
        desc: "ondas · floresta · respiração guiada",
        from: "200 35% 94%", to: "210 30% 88%", accent: "200 60% 55%",
      },
      parentNote: "Ansiedade infantil cresce quando o adulto também entra nela. Você acabou de ser o adulto calmo. Isso é regulação compartilhada.",
      closeCta: "Estamos no agora",
    },
  },
  {
    id: "exhausted",
    emoji: "😫",
    label: "Exaustão dos pais",
    tint: "hsl(30 60% 58%)",
    status: "implemented",
    acolhimento: {
      title: "Você também merece colo.",
      subtitle: "Cansaço não é fraqueza.\nÉ o preço de cuidar com presença.",
      voice: "Você também merece colo. Cansaço não é fraqueza. É o preço de cuidar com presença. Respira. Esse minuto é seu.",
      cta: "Esse minuto é meu",
    },
    breath: {
      in: 4, hold: 4, out: 6, cycles: 6,
      intro: "Esse ciclo é pra você. Inspira pra você. Segura pra você. Solta o peso que não é seu.",
    },
    practical: {
      eyebrow: "Antes de tudo, você",
      title: "Três permissões agora",
      tips: [
        { iconKey: "sun",   title: "Cinco minutos pra nada", desc: "Senta. Fecha os olhos. Nada pra resolver agora. Permissão pra pausar." },
        { iconKey: "leaf",  title: "Água, luz, ar",          desc: "Bebe água. Abre uma janela. Sente a luz. Reset físico em 60 segundos." },
        { iconKey: "heart", title: "Solta a culpa",          desc: "Você não precisa ser tudo, sempre. Suficiente é amor de verdade." },
      ],
    },
    support: {
      eyebrow: "Wellness do adulto",
      title: "Faixas pra você",
      intro: "Sons pensados pro descanso do adulto, não da criança.",
      playlist: {
        label: "Pausa de adulto", tracks: 8,
        desc: "ambient suave · piano íntimo · silêncio guiado",
        from: "30 40% 94%", to: "25 35% 88%", accent: "30 65% 55%",
      },
      parentNote: "Cuidar de quem cuida não é luxo, é manutenção. Você acaba de fazer manutenção. Isso é responsabilidade adulta no melhor sentido.",
      closeCta: "Voltei mais inteiro(a)",
    },
  },
  {
    id: "overwhelm",
    emoji: "🌪️",
    label: "Sobrecarga",
    tint: "hsl(280 40% 62%)",
    status: "implemented",
    acolhimento: {
      title: "Uma coisa de cada vez.",
      subtitle: "Sobrecarga é o cérebro pedindo prioridade.\nVamos escolher uma só.",
      voice: "Sobrecarga é o cérebro pedindo prioridade, não esforço. Vamos diminuir o mundo agora pra uma coisa só.",
      cta: "Reduzir o mundo",
    },
    breath: {
      in: 5, hold: 2, out: 7, cycles: 5,
      intro: "Respiração de descompressão. Inspira em cinco, solta em sete. Cada ciclo tira uma camada de peso.",
    },
    practical: {
      eyebrow: "Diminuindo o ruído",
      title: "Três cortes inteligentes",
      tips: [
        { iconKey: "shield",  title: "Tela longe por 10 min", desc: "Notificação é gasolina na sobrecarga. Modo silencioso, mesmo." },
        { iconKey: "compass", title: "Uma tarefa visível",     desc: "Escolha UMA coisa pequena. Faça só ela. O resto pode esperar." },
        { iconKey: "wind",    title: "Movimento curto",        desc: "Caminhe da sala à cozinha. Movimento descarrega cortisol." },
      ],
    },
    support: {
      eyebrow: "Voltando ao foco",
      title: "Sons que organizam",
      intro: "Trilhas pensadas pra reduzir estímulo e devolver clareza.",
      playlist: {
        label: "Foco gentil", tracks: 6,
        desc: "lo-fi calmo · binaural leve · ambient orgânico",
        from: "280 30% 94%", to: "270 28% 88%", accent: "280 45% 58%",
      },
      parentNote: "Sentir sobrecarga não é sinal de fraqueza, é sinal de que você está carregando demais. Reconhecer é o primeiro alívio.",
      closeCta: "Já consigo seguir",
    },
  },
  {
    id: "lost",
    emoji: "❓",
    label: "Não sei o que fazer",
    tint: "hsl(150 35% 50%)",
    status: "implemented",
    acolhimento: {
      title: "Não saber é honesto.",
      subtitle: "Você não precisa de resposta agora.\nSó de um próximo passo pequeno.",
      voice: "Não saber é honesto. Você não precisa de resposta agora. Só de um próximo passo pequeno. Vamos juntos.",
      cta: "Um passo pequeno",
    },
    breath: {
      in: 4, hold: 2, out: 6, cycles: 4,
      intro: "Respira pra abrir espaço. Inspira possibilidade. Solta o que não cabe agora.",
    },
    practical: {
      eyebrow: "Próximo passo possível",
      title: "Três perguntas que clareiam",
      tips: [
        { iconKey: "compass", title: "O que ele precisa AGORA?", desc: "Não nas próximas semanas. Agora. Comida, colo, sono, brincar?" },
        { iconKey: "heart",   title: "O que VOCÊ precisa?",       desc: "Você é metade da equação. Sua necessidade também vale." },
        { iconKey: "leaf",    title: "Qual a menor ação útil?",   desc: "Não a perfeita. A menor. Um copo de água, um abraço, uma pausa." },
      ],
    },
    support: {
      eyebrow: "Caminho gentil",
      title: "Inspirações curtas",
      intro: "Histórias e reflexões breves de outros pais e mães.",
      playlist: {
        label: "Não estou só", tracks: 5,
        desc: "vozes reais · pausas longas · finais abertos",
        from: "150 30% 94%", to: "140 28% 88%", accent: "150 40% 50%",
      },
      parentNote: "Pais perfeitos não existem. Pais presentes, sim. Você acaba de escolher presença em vez de pânico. Isso é tudo.",
      closeCta: "Tenho o próximo passo",
    },
  },
];
