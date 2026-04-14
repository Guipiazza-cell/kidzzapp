/* ── Sleep stories with proper 5-act structure ── */

export interface SleepStory {
  id: string;
  title: string;
  emoji: string;
  free: boolean;
  duration: string;
  text: string;
}

export const SLEEP_STORIES: SleepStory[] = [
  {
    id: "estrelas",
    title: "A Viagem das Estrelas",
    emoji: "⭐",
    free: true,
    duration: "3 min",
    text: `Era uma vez uma estrelinha pequenina que morava no céu mais alto do mundo.
Toda noite, quando o sol se despedia, ela acordava devagar.
Espreguiçava seus raios dourados e olhava para baixo, para a Terra adormecida.

Naquela noite, a estrelinha decidiu fazer uma viagem especial.
Desceu flutuando pelo céu escuro, bem devagar, como uma pena caindo.
Atrás dela, ficava um rastro de luz dourada que brilhava suavemente.

No caminho, passou por nuvens fofas como travesseiros gigantes.
Cada nuvem sussurrava baixinho: "Durma bem… durma bem…"
A estrelinha sorriu e continuou descendo, cada vez mais devagar.

O mundo ficava mais silencioso a cada momento.
Os pássaros já dormiam. As árvores balançavam de leve.
Até o vento respirava mais devagar agora.

A estrelinha pousou no topo da montanha mais macia do universo.
Fechou seus olhinhos brilhantes, se enrolou na escuridão quentinha.
E o céu inteiro ficou em silêncio.
Tudo calmo. Tudo em paz. Tudo dormindo.`,
  },
  {
    id: "floresta-encantada",
    title: "A Floresta que Dormia",
    emoji: "🌲",
    free: false,
    duration: "4 min",
    text: `No fundo de uma floresta verde e silenciosa, a noite chegava mansinha.
As folhas das árvores paravam de dançar. O céu ficava cor de lavanda.
Era hora de todos os animais se prepararem para dormir.

O coelhinho branco cobriu suas orelhas longas com folhas macias e quentinhas.
A coruja fechou os olhos grandes bem devagar, um de cada vez.
O cervo deitou na grama macia e suspirou: um suspiro longo e tranquilo.

O rio, que corria o dia inteiro, começou a ficar mais lento.
O som da água virou um sussurro. Depois, quase um segredo.
As pedrinhas no fundo do rio brilhavam como pequenas luas.

As árvores mais altas balançavam de leve, como se estivessem cantando.
Era uma canção sem palavras. Só um movimento. Só um ritmo.
Para lá e para cá. Para lá e para cá.

E você, deitado na grama mais macia do mundo, sentiu o vento suave.
Ele passava pelo seu rosto como um carinho.
Seus olhos foram fechando devagar.
Tudo ficava quieto. Tudo ficava bom. Tudo ficava leve.`,
  },
  {
    id: "nuvem-magica",
    title: "A Nuvem Mágica",
    emoji: "☁️",
    free: false,
    duration: "3 min",
    text: `Uma nuvem grande e fofa desceu do céu só para você.
Era branca como algodão e quentinha como um cobertor de inverno.
Ela flutuava bem baixinho, esperando.

Você subiu nela devagar, com cuidado.
A nuvem era tão macia que seus pés afundaram como em espuma.
Você deitou e sentiu o corpo ficar leve, muito leve.

A nuvem começou a subir pelo céu da noite.
Passou pela lua, que sorriu com seus olhos prateados.
Passou por estrelas que piscavam como olhinhos curiosos.

O vento soprava suave, embalando a nuvem como um berço.
Para lá e para cá. Para lá e para cá.
O mundo lá embaixo ficava cada vez mais pequenino.

Você se enrolou na nuvem como num abraço.
Sentiu que estava no lugar mais seguro do mundo.
E ali, flutuando no céu silencioso, seus olhos foram fechando.
Devagar. Tranquilo. Protegido.`,
  },
  {
    id: "oceano-calmo",
    title: "O Oceano Calmo",
    emoji: "🌊",
    free: false,
    duration: "4 min",
    text: `O mar estava calmo naquela noite. Tão calmo que parecia respirar.
As ondas iam e vinham, devagar. Como uma inspiração e uma expiração.
O som era suave, repetido, como uma canção que nunca acaba.

Um barquinho pequeno e azul flutuava na água morna.
Dentro dele havia uma caminha feita de cobertores macios.
Cobertores com estrelas bordadas que brilhavam no escuro.

Você deitou no barquinho e sentiu ele balançar.
Para lá e para cá. Para lá e para cá.
O movimento era gostoso, como um abraço que embala.

O céu estava cheio de estrelas. Tantas que não dava para contar.
A lua refletia na água e fazia um caminho de prata.
O barquinho seguia por esse caminho, sem pressa nenhuma.

O som das ondas foi ficando mais baixo. Mais suave. Mais longe.
Seus olhos pesavam como se fossem feitos de veludo.
E o barquinho continuava flutuando, levando você
para o sono mais gostoso e mais profundo do mundo.`,
  },
];

export const SOUND_PRESETS = [
  { id: "rain", label: "Chuva", emoji: "🌧️", free: true },
  { id: "forest", label: "Floresta", emoji: "🌲", free: false },
  { id: "ocean", label: "Oceano", emoji: "🌊", free: false },
  { id: "wind", label: "Vento", emoji: "💨", free: false },
  { id: "white", label: "Ruído Branco", emoji: "📻", free: false },
  { id: "brown", label: "Ruído Marrom", emoji: "🟤", free: false },
];

export const TIMER_OPTIONS = [
  { minutes: 10, label: "10 min" },
  { minutes: 20, label: "20 min" },
  { minutes: 30, label: "30 min" },
];
