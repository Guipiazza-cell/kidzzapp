/**
 * Biblioteca curada de histórias (estáticas) para as Coleções especiais.
 * São mescladas às memórias do usuário em StoriesHome. Cada história tem
 * metadata.interests com a tag da coleção (aventura | amizade | natureza | familia).
 */
import type { Memory } from "@/hooks/useMemories";

type LibStory = {
  id: string;
  title: string;
  tag: "aventura" | "amizade" | "natureza" | "familia";
  content: string;
};

const RAW: LibStory[] = [
  // ── AVENTURAS ──────────────────────────────────────────────
  {
    id: "lib-av-1",
    title: "O Mapa da Ilha Perdida",
    tag: "aventura",
    content: `Tomás encontrou um mapa velho dentro de um livro empoeirado do sótão.
No papel, um X vermelho marcava uma ilha cercada de ondas azuis.
"É um tesouro!", pensou ele, com o coração batendo forte.

Construiu um barquinho de papelão na sala e navegou pela imaginação.
Passou por tempestades de travesseiro e por polvos feitos de meias.
Cada obstáculo era resolvido com uma ideia nova e muita coragem.

Quando chegou ao X, cavou a areia do tapete com uma colher.
Lá estava o tesouro: uma caixa cheia de desenhos que ele mesmo tinha feito.
Tomás sorriu. O maior tesouro era a aventura de imaginar.`,
  },
  {
    id: "lib-av-2",
    title: "A Nave do Menino Curioso",
    tag: "aventura",
    content: `Nico sempre olhava as estrelas e se perguntava o que havia lá em cima.
Numa noite, sua cama virou uma nave prateada e subiu pelo céu.
"Vamos explorar!", disse ele, apertando os botões brilhantes.

Voou por planetas de gelatina e luas que piscavam como vaga-lumes.
Num deles, conheceu um alienígena tímido que não sabia fazer amigos.
Nico ensinou o joguinho preferido dele e os dois riram muito.

Quando o sono chegou, a nave voltou para o quarto devagarinho.
Nico prometeu voltar em outra noite para brincar de novo.
E dormiu sonhando com todas as aventuras que ainda faltavam.`,
  },
  {
    id: "lib-av-3",
    title: "O Dragão que Tinha Medo do Escuro",
    tag: "aventura",
    content: `No alto da montanha morava Fumaça, um dragão grandão e valente.
Ele soltava fogo, voava alto e enfrentava tempestades sem tremer.
Mas tinha um segredo: morria de medo do escuro.

Uma menina corajosa chamada Bia subiu a montanha para conhecê-lo.
Em vez de rir, ela pegou na garra dele e mostrou as estrelas.
"O escuro é só o céu descansando", disse Bia com carinho.

Fumaça respirou fundo e, pela primeira vez, não teve medo.
Juntos, voaram pela noite iluminando o caminho com labaredas.
Descobriram que a coragem fica mais forte quando é dividida.`,
  },
  {
    id: "lib-av-4",
    title: "A Grande Corrida das Bicicletas",
    tag: "aventura",
    content: `No sábado de sol, a vila inteira se juntou para a corrida de bicicletas.
Léo estava nervoso: sua bicicleta era velha e as rodas rangiam.
Mesmo assim, ele colocou o capacete e foi para a linha de largada.

Na descida, um garotinho caiu e ficou chorando no chão.
Léo estava quase ganhando, mas parou na hora para ajudar.
Levantou o pequeno, limpou o joelho e voltaram juntos pedalando.

Léo não ganhou o troféu, mas ganhou os aplausos de todos.
"Você é o mais rápido do coração!", disse sua mãe, orgulhosa.
E Léo entendeu que vencer é escolher fazer o bem.`,
  },

  // ── AMIZADE ────────────────────────────────────────────────
  {
    id: "lib-am-1",
    title: "O Ursinho e a Coelhinha",
    tag: "amizade",
    content: `Bento, o ursinho, adorava mel, e Lila, a coelhinha, adorava cenoura.
Eles moravam perto, mas nunca tinham brincado juntos de verdade.
Um dia choveu tanto que os dois se abrigaram na mesma árvore.

Para passar o tempo, dividiram um pote de mel e um punhado de cenoura.
Descobriram que gostavam das mesmas brincadeiras e das mesmas piadas.
A chuva passou, mas a amizade dos dois ficou para sempre.

Desde então, todo fim de tarde eles se encontram na árvore.
Riem, contam histórias e cuidam um do outro com carinho.
Porque amigo de verdade a gente escolhe com o coração.`,
  },
  {
    id: "lib-am-2",
    title: "A Nova Aluna",
    tag: "amizade",
    content: `Maya chegou na escola nova sem conhecer ninguém.
Ficou sozinha no cantinho do pátio, com os olhos meio tristes.
As outras crianças brincavam e ela não sabia como chegar perto.

Foi quando Duda percebeu e caminhou até ela com um sorriso.
"Quer brincar com a gente? Estamos precisando de mais uma!"
O rosto de Maya se iluminou como o sol depois da chuva.

No fim do dia, Maya já tinha um monte de amigos novos.
Aprendeu que um simples convite pode mudar o dia de alguém.
E prometeu sempre acolher quem estivesse sozinho.`,
  },
  {
    id: "lib-am-3",
    title: "O Segredo Compartilhado",
    tag: "amizade",
    content: `Téo tinha um segredo que pesava como uma mochila cheia de pedras.
Ele havia quebrado o vaso favorito da avó sem querer.
Não conseguia dormir de tanto pensar no que fazer.

Seu melhor amigo, Rafa, percebeu que algo estava errado.
"Pode me contar. Amigo serve pra dividir também as coisas difíceis."
Téo contou tudo, e a mochila de pedras ficou mais leve.

Juntos, eles pensaram num jeito de consertar e contar para a avó.
A avó abraçou os dois e disse que a honestidade vale mais que o vaso.
Téo aprendeu que amigo bom ajuda até nas horas difíceis.`,
  },
  {
    id: "lib-am-4",
    title: "As Duas Estrelas",
    tag: "amizade",
    content: `No céu, duas estrelinhas brilhavam bem pertinho uma da outra.
Uma se chamava Pipa e a outra, Estela, e eram melhores amigas.
Toda noite, elas piscavam juntas para as crianças da Terra.

Um dia, um vento espacial afastou Pipa para bem longe.
Estela ficou triste, achando que nunca mais a veria.
Mas continuou brilhando forte, para Pipa achar o caminho de volta.

Guiada pela luz da amiga, Pipa venceu o vento e voltou.
As duas se abraçaram com raios dourados e brilharam mais que nunca.
Amizade verdadeira sempre encontra o caminho de volta.`,
  },

  // ── NATUREZA ───────────────────────────────────────────────
  {
    id: "lib-nat-1",
    title: "A Sementinha Corajosa",
    tag: "natureza",
    content: `Era uma vez uma sementinha bem pequena embaixo da terra escura.
Estava com medo de crescer, pois lá fora tudo parecia grande demais.
Mas sentia, lá dentro, uma vontade enorme de ver o sol.

Com muita coragem, ela empurrou a terra devagarinho, dia após dia.
A chuva a ajudou com um banho fresquinho, e o sol, com calor gostoso.
Aos poucos, um broto verdinho apareceu na superfície.

O broto virou caule, o caule virou flor, colorida e cheirosa.
As abelhas vinham visitá-la e os passarinhos cantavam por perto.
A sementinha entendeu que crescer vale toda a coragem do mundo.`,
  },
  {
    id: "lib-nat-2",
    title: "O Rio que Cantava",
    tag: "natureza",
    content: `Descendo a montanha, corria um rio de águas claras e felizes.
Ele fazia glu-glu nas pedras e parecia cantar uma música.
Os animais da floresta vinham beber e ouvir sua melodia.

Um dia, uma folha seca entupiu um cantinho do rio.
A água ficou parada e a canção do rio foi ficando fraquinha.
A tartaruga, o esquilo e o passarinho decidiram ajudar.

Cada um tirou um pedacinho de sujeira, com muito cuidado.
Logo a água voltou a correr e o rio voltou a cantar.
Todos comemoraram: cuidar da natureza deixa o mundo mais bonito.`,
  },
  {
    id: "lib-nat-3",
    title: "A Árvore das Quatro Estações",
    tag: "natureza",
    content: `No meio do campo vivia uma árvore muito, muito antiga.
Ela adorava mudar de roupa a cada estação do ano.
Na primavera, se enchia de flores rosadas e perfumadas.

No verão, suas folhas verdes faziam sombra fresquinha para todos.
No outono, se vestia de dourado e soltava folhas dançantes no vento.
No inverno, descansava nua, guardando forças para recomeçar.

As crianças da vila brincavam embaixo dela o ano inteiro.
Aprenderam que tudo na natureza tem seu tempo de mudar.
E que cada estação traz uma beleza diferente para curtir.`,
  },
  {
    id: "lib-nat-4",
    title: "O Passarinho e a Primeira Chuva",
    tag: "natureza",
    content: `Pipo era um passarinho recém-saído do ovo, com penas macias.
Nunca tinha visto a chuva e ficou assustado com o barulho.
Escondeu-se no ninho, tremendo a cada trovão que ouvia.

Sua mãe o abraçou com as asas quentinhas e explicou com carinho:
"A chuva molha a terra, enche os rios e dá água pras plantas."
Pipo espiou lá fora e viu as gotas brilhando como cristais.

Quando a chuva passou, um arco-íris enorme apareceu no céu.
Pipo bateu as asinhas de alegria e voou pela primeira vez.
Descobriu que a natureza tem surpresas lindas depois da tempestade.`,
  },

  // ── FAMÍLIA ────────────────────────────────────────────────
  {
    id: "lib-fam-1",
    title: "O Bolo da Vovó",
    tag: "familia",
    content: `Todo domingo, a casa da vovó ficava com cheirinho de bolo quentinho.
Manu adorava subir no banquinho para ajudar a misturar a massa.
A vovó contava histórias antigas enquanto batiam os ovos.

Um dia, faltou açúcar bem na hora de fazer o bolo.
Em vez de desistir, usaram mel e banana bem madura.
O bolo saiu diferente, mas ficou o mais gostoso de todos.

Toda a família se sentou junta para saborear a novidade.
Manu entendeu que estar perto de quem ama já é a melhor receita.
E que domingo em família é o melhor dia da semana.`,
  },
  {
    id: "lib-fam-2",
    title: "A Cabana dos Irmãos",
    tag: "familia",
    content: `Sofia e Gael eram irmãos que às vezes brigavam por bobagem.
Numa tarde de chuva, ficaram entediados dentro de casa.
A mãe sugeriu: "Que tal construírem uma cabana juntos?"

Puxaram lençóis, empilharam almofadas e usaram cadeiras como pilares.
Precisaram combinar tudo, dividir tarefas e ceder um pouquinho.
No fim, a cabana ficou enorme, com direito a lanterninha lá dentro.

Deitados lado a lado, contaram histórias até o sono chegar.
Perceberam que juntos conseguiam fazer coisas muito melhores.
E que irmão, mesmo brigando, é o melhor parceiro de aventuras.`,
  },
  {
    id: "lib-fam-3",
    title: "O Abraço que Cura",
    tag: "familia",
    content: `Davi teve um dia difícil: caiu no parque e perdeu o brinquedo favorito.
Chegou em casa com o coração apertado e os olhos cheios de lágrimas.
Não queria falar com ninguém, só ficar quietinho no canto.

Seu pai sentou perto, sem pressa, e abriu os braços em silêncio.
Davi correu para o abraço e ficou ali, sentindo o calor gostoso.
Aos poucos, a tristeza foi ficando pequenininha.

"Amanhã a gente procura o brinquedo, e tudo vai ficar bem", disse o pai.
Davi respirou aliviado e até sorriu de leve.
Aprendeu que o abraço da família cura quase tudo.`,
  },
  {
    id: "lib-fam-4",
    title: "A Noite das Estrelas em Família",
    tag: "familia",
    content: `Numa noite sem nuvens, a família toda subiu no telhado com cobertores.
Levaram pipoca, chocolate quente e muita vontade de olhar o céu.
Papai apontava as constelações e mamãe contava lendas antigas.

A irmãzinha menor achou uma estrela cadente e fez um pedido.
Todos fecharam os olhos e pediram juntos coisas bonitas.
O céu brilhava, mas o brilho maior estava ali, entre eles.

Quando o frio chegou, voltaram abraçados para dentro de casa.
Aquela noite virou uma lembrança guardada no coração de cada um.
Porque os melhores momentos são os que vivemos em família.`,
  },
];

// Data base fixa (evita variação; não usamos Date.now para não quebrar cache/SSR).
const BASE_DATE = "2024-01-01T00:00:00.000Z";

export const LIBRARY_STORIES: Memory[] = RAW.map((s, i) => ({
  id: s.id,
  user_id: "library",
  type: "story",
  title: s.title,
  content: s.content,
  is_special: false,
  image_url: null,
  metadata: { interests: s.tag, source: "library" },
  created_at: BASE_DATE,
}));
