/* ── Sleep stories, bible stories, sounds & playlists config ── */

export interface SleepStory {
  id: string;
  title: string;
  emoji: string;
  category: "calma" | "aventura" | "valores" | "biblia" | "gratidao";
  free: boolean;
  duration: string;
  ageRange?: string;
  verse?: string;
  text: string;
}

export const SLEEP_STORIES: SleepStory[] = [
  {
    id: "estrelas",
    title: "A Viagem das Estrelas",
    emoji: "⭐",
    category: "calma",
    free: true,
    duration: "3 min",
    ageRange: "3-7",
    text: `Era uma vez uma estrelinha pequenina que morava no céu mais alto do mundo.
Toda noite, quando o sol se despedia, ela acordava devagar.
Espreguiçava seus raios dourados e olhava para baixo, para a Terra adormecida.

Naquela noite, a estrelinha decidiu fazer uma viagem especial.
Desceu flutuando pelo céu escuro, bem devagar, como uma pena caindo.
Atrás dela, ficava um rastro de luz dourada que brilhava suavemente.

No caminho, passou por nuvens fofas como travesseiros gigantes.
Cada nuvem sussurrava baixinho: "Durma bem… durma bem…"
A estrelinha sorriu e continuou descendo, cada vez mais devagar.

A estrelinha pousou no topo da montanha mais macia do universo.
Fechou seus olhinhos brilhantes, se enrolou na escuridão quentinha.
E o céu inteiro ficou em silêncio.
Tudo calmo. Tudo em paz. Tudo dormindo.`,
  },
  {
    id: "floresta-encantada",
    title: "A Floresta que Dormia",
    emoji: "🌲",
    category: "calma",
    free: false,
    duration: "4 min",
    ageRange: "3-7",
    text: `No fundo de uma floresta verde e silenciosa, a noite chegava mansinha.
As folhas das árvores paravam de dançar. O céu ficava cor de lavanda.
Era hora de todos os animais se prepararem para dormir.

O coelhinho branco cobriu suas orelhas longas com folhas macias e quentinhas.
A coruja fechou os olhos grandes bem devagar, um de cada vez.
O cervo deitou na grama macia e suspirou: um suspiro longo e tranquilo.

O rio, que corria o dia inteiro, começou a ficar mais lento.
O som da água virou um sussurro. Depois, quase um segredo.
As pedrinhas no fundo do rio brilhavam como pequenas luas.

E você, deitado na grama mais macia do mundo, sentiu o vento suave.
Ele passava pelo seu rosto como um carinho.
Tudo ficava quieto. Tudo ficava bom. Tudo ficava leve.`,
  },
  {
    id: "nuvem-magica",
    title: "A Nuvem Mágica",
    emoji: "☁️",
    category: "aventura",
    free: false,
    duration: "3 min",
    ageRange: "3-7",
    text: `Uma nuvem grande e fofa desceu do céu só para você.
Era branca como algodão e quentinha como um cobertor de inverno.
Ela flutuava bem baixinho, esperando.

Você subiu nela devagar, com cuidado.
A nuvem era tão macia que seus pés afundaram como em espuma.
Você deitou e sentiu o corpo ficar leve, muito leve.

A nuvem começou a subir pelo céu da noite.
Passou pela lua, que sorriu com seus olhos prateados.
Passou por estrelas que piscavam como olhinhos curiosos.

Você se enrolou na nuvem como num abraço.
Sentiu que estava no lugar mais seguro do mundo.
E ali, flutuando no céu silencioso, seus olhos foram fechando.
Devagar. Tranquilo. Protegido.`,
  },
  {
    id: "oceano-calmo",
    title: "O Oceano Calmo",
    emoji: "🌊",
    category: "calma",
    free: false,
    duration: "4 min",
    ageRange: "5-10",
    text: `O mar estava calmo naquela noite. Tão calmo que parecia respirar.
As ondas iam e vinham, devagar. Como uma inspiração e uma expiração.
O som era suave, repetido, como uma canção que nunca acaba.

Um barquinho pequeno e azul flutuava na água morna.
Dentro dele havia uma caminha feita de cobertores macios.
Cobertores com estrelas bordadas que brilhavam no escuro.

Você deitou no barquinho e sentiu ele balançar.
Para lá e para cá. Para lá e para cá.
O movimento era gostoso, como um abraço que embala.

E o barquinho continuava flutuando, levando você
para o sono mais gostoso e mais profundo do mundo.`,
  },
  {
    id: "gratidao-do-dia",
    title: "Três Gratidões",
    emoji: "💛",
    category: "gratidao",
    free: true,
    duration: "2 min",
    ageRange: "3-10",
    text: `Antes de dormir, vamos lembrar de três coisas boas de hoje.

A primeira: alguém que te fez sorrir.
Pode ser o papai, a mamãe, um irmão, um amigo, ou até um cachorrinho.
Pense nesse rosto. Sinta o calor que ele traz.

A segunda: algo que você aprendeu.
Pode ser pequeno, pode ser grande. Mas hoje você cresceu um pouquinho.
Toda noite, a gente vira uma pessoa um pouquinho mais sábia.

A terceira: o seu próprio corpo, que te levou pelo dia inteiro.
Suas mãos, seus pés, seus olhos, seu coração que bate sem parar.
Diga obrigado para ele, baixinho. Ele merece descansar.

Agora respire fundo. E durma sabendo que hoje foi um bom dia.`,
  },
  // BÍBLIA INFANTIL
  {
    id: "biblia-davi",
    title: "Davi e Golias",
    emoji: "🦁",
    category: "biblia",
    free: false,
    duration: "5 min",
    ageRange: "5-10",
    verse: "“Não temas, porque eu sou contigo.” — Isaías 41:10",
    text: `Há muito tempo, vivia um menino chamado Davi.
Ele era pequeno, mas tinha um coração enorme e cheio de coragem.

Naquela época, um gigante chamado Golias assustava o povo.
Todos os soldados tinham medo. Mas Davi não.
Davi sabia que não estava sozinho. Deus estava com ele.

Com cinco pedrinhas e uma funda, o menino enfrentou o gigante.
Não foi a força que venceu. Foi a coragem do coração tranquilo.

Hoje, quando algo parecer grande demais, lembre:
você também tem uma força quietinha por dentro.
E essa força sempre te acompanha, mesmo no escuro da noite.`,
  },
  {
    id: "biblia-noe",
    title: "A Arca de Noé",
    emoji: "🌈",
    category: "biblia",
    free: false,
    duration: "5 min",
    ageRange: "3-7",
    verse: "“Porei o meu arco nas nuvens.” — Gênesis 9:13",
    text: `Noé construiu um barco enorme, chamado arca.
Para dentro entraram bichinhos de toda parte do mundo.
Leões, coelhos, girafas, formiguinhas. Todos juntos, dois a dois.

Choveu por muitos dias. Mas dentro da arca, todos estavam seguros.
Noé cuidava dos animais. Os animais se acalmavam ouvindo a chuva.

Quando a chuva parou, o sol apareceu.
E no céu surgiu um arco-íris enorme, cheio de cores.
Era uma promessa: tudo vai ficar bem.

Hoje, mesmo quando chove forte lá fora,
seu quarto é a sua arca. Aqui, você está seguro.`,
  },
  {
    id: "biblia-jesus-criancas",
    title: "Jesus e as Crianças",
    emoji: "🤍",
    category: "biblia",
    free: false,
    duration: "4 min",
    ageRange: "3-10",
    verse: "“Deixai vir a mim as criancinhas.” — Mateus 19:14",
    text: `Um dia, muitas crianças correram para ver Jesus.
Os adultos quiseram afastar. "Ele está cansado", disseram.

Mas Jesus sorriu e abriu os braços.
"Deixem que venham", falou com voz mansa.
"Os pequeninos têm o coração mais leve."

Ele abraçou cada criança, uma por uma.
Ouviu suas histórias, riu com elas, abençoou cada testinha.

Você é especial. Você é amado. Sempre foi.
E enquanto dorme, esse amor continua te cuidando.`,
  },
  {
    id: "biblia-criacao",
    title: "A Criação do Mundo",
    emoji: "🌍",
    category: "biblia",
    free: false,
    duration: "4 min",
    ageRange: "3-7",
    verse: "“E viu Deus que era bom.” — Gênesis 1:31",
    text: `No começo de tudo, só havia silêncio e escuridão.
Então Deus disse: "Haja luz." E o sol nasceu pela primeira vez.

Depois vieram o céu azul e as nuvens fofas.
Os mares cheios de peixinhos. As florestas cheias de árvores.
E os passarinhos enchendo o ar de canções.

No final, Deus criou as pessoas. Você também.
E olhou para tudo com carinho e disse:
"É bom. É muito bom."

Hoje, seu corpinho descansa. Mas a criação continua viva,
respirando junto com você, embalando seu sono.`,
  },
];

export type SleepCategory = SleepStory["category"];

export const STORY_CATEGORIES: { id: SleepCategory; label: string; emoji: string }[] = [
  { id: "calma", label: "Calmas", emoji: "🌙" },
  { id: "aventura", label: "Aventuras leves", emoji: "🪁" },
  { id: "gratidao", label: "Gratidão", emoji: "💛" },
  { id: "valores", label: "Valores", emoji: "🌱" },
  { id: "biblia", label: "Bíblia infantil", emoji: "📖" },
];

export interface SoundPreset {
  id: string;
  label: string;
  emoji: string;
  free: boolean;
  url?: string;
  category: "natureza" | "agua" | "ambiente" | "bebe" | "instrumento";
}

/* Apenas sons com URL real são reproduzíveis. Outros aparecem com badge "Em breve". */
export const SOUND_PRESETS: SoundPreset[] = [
  { id: "rain", label: "Chuva", emoji: "🌧️", free: true, url: "/audio/rain-soft.mp3", category: "agua" },
  { id: "forest", label: "Floresta", emoji: "🌲", free: false, url: "/audio/forest-calm.mp3", category: "natureza" },
  { id: "ocean", label: "Oceano", emoji: "🌊", free: false, url: "/audio/ocean-waves.mp3", category: "agua" },
  { id: "white", label: "Ruído branco", emoji: "📻", free: false, url: "/audio/white-noise.mp3", category: "ambiente" },
  { id: "rain-window", label: "Chuva na janela", emoji: "🪟", free: false, category: "agua" },
  { id: "waterfall", label: "Cachoeira", emoji: "💦", free: false, category: "agua" },
  { id: "wind", label: "Vento leve", emoji: "🍃", free: false, category: "natureza" },
  { id: "fire", label: "Fogueira", emoji: "🔥", free: false, category: "ambiente" },
  { id: "piano", label: "Piano suave", emoji: "🎹", free: false, category: "instrumento" },
  { id: "pink", label: "Ruído rosa", emoji: "🎚️", free: false, category: "ambiente" },
  { id: "heart", label: "Batimentos", emoji: "💗", free: false, category: "bebe" },
  { id: "womb", label: "Som do útero", emoji: "🫧", free: false, category: "bebe" },
  { id: "fan", label: "Ventilador", emoji: "🌀", free: false, category: "ambiente" },
  { id: "train", label: "Trem noturno", emoji: "🚂", free: false, category: "ambiente" },
  { id: "cafe", label: "Cafeteria", emoji: "☕", free: false, category: "ambiente" },
  { id: "lake", label: "Lago", emoji: "🏞️", free: false, category: "agua" },
  { id: "birds", label: "Pássaros", emoji: "🐦", free: false, category: "natureza" },
];

export const TIMER_OPTIONS = [
  { minutes: 5, label: "5 min" },
  { minutes: 10, label: "10 min" },
  { minutes: 20, label: "20 min" },
  { minutes: 30, label: "30 min" },
  { minutes: 0, label: "até dormir" },
];

/* ── Spotify Playlists Calmaria ── */
export interface SleepPlaylist {
  id: string;
  title: string;
  emoji: string;
  ageRange: string;
  spotifyId: string;
  glow: string;
  gradient: string;
  /** Capa gerada via Hermes/Codex (gpt-image) — padrão premium da ABA SONHOS */
  cover: string;
}

const PL = "/exemplos/assets/sonhos-v2";

export const SLEEP_PLAYLISTS: SleepPlaylist[] = [
  {
    id: "babies",
    title: "Soninho dos bebês",
    emoji: "🍼",
    ageRange: "0-2 anos",
    spotifyId: "37i9dQZF1DWZd79rJ6a7lp",
    glow: "#E8C5FF",
    gradient: "from-[#2a1340] via-[#5b2a86] to-[#8b5cf6]",
    cover: `${PL}/pl-babies.png`,
  },
  {
    id: "small",
    title: "Pequeninos calmos",
    emoji: "🧸",
    ageRange: "2-4 anos",
    spotifyId: "37i9dQZF1DX0UrRvztWcAU",
    glow: "#FFD66B",
    gradient: "from-[#3a2a1a] via-[#7a5a2a] to-[#c98a3a]",
    cover: `${PL}/pl-teddy.png`,
  },
  {
    id: "kids",
    title: "Sonhos de criança",
    emoji: "🌙",
    ageRange: "5-7 anos",
    spotifyId: "37i9dQZF1DWZqd5JICZI0u",
    glow: "#9BE7B5",
    gradient: "from-[#0e2a22] via-[#1f4a3a] to-[#3f8b6c]",
    cover: `${PL}/pl-moon.png`,
  },
  {
    id: "deep",
    title: "Sono profundo",
    emoji: "✨",
    ageRange: "Família",
    spotifyId: "37i9dQZF1DWVV27DiNWxkR",
    glow: "#7BB6FF",
    gradient: "from-[#0e2a44] via-[#1f4e7a] to-[#3a8dde]",
    cover: `${PL}/pl-family.png`,
  },
  {
    id: "piano",
    title: "Piano para dormir",
    emoji: "🎹",
    ageRange: "Família",
    spotifyId: "37i9dQZF1DWTvNyxOwkztu",
    glow: "#E8B8FF",
    gradient: "from-[#1a1530] via-[#3a2a55] to-[#7a5a9a]",
    cover: `${PL}/pl-piano.png`,
  },
  {
    id: "instrumental",
    title: "Instrumental calmaria",
    emoji: "🎼",
    ageRange: "Família",
    spotifyId: "37i9dQZF1DWWMOmoXKqHTD",
    glow: "#C58AFF",
    gradient: "from-[#0f1535] via-[#1e1f55] to-[#0d1b2a]",
    cover: `${PL}/pl-piano.png`,
  },
];

/* ── Momentos em família — perguntas noturnas ── */
export const FAMILY_MOMENTS: { id: string; emoji: string; title: string; prompt: string }[] = [
  { id: "best", emoji: "🌟", title: "O melhor de hoje", prompt: "Qual foi o melhor momento do seu dia?" },
  { id: "brave", emoji: "🦁", title: "Coragem", prompt: "Hoje você foi corajoso quando…?" },
  { id: "grateful", emoji: "💛", title: "Gratidão", prompt: "Conte 3 coisas pelas quais somos gratos hoje." },
  { id: "kind", emoji: "🤝", title: "Gentileza", prompt: "Você fez alguém sorrir hoje? Como?" },
  { id: "learn", emoji: "🌱", title: "Aprendizado", prompt: "O que você descobriu hoje?" },
  { id: "love", emoji: "💜", title: "Amor", prompt: "Para quem você quer mandar um abraço agora?" },
];
