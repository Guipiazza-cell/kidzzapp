import { ScenarioDefinition } from '../types';

import bgPraia from '../assets/images/bg_praia.jpg';
import bgQuintal from '../assets/images/bg_quintal.jpg';
import bgCozinha from '../assets/images/bg_cozinha.jpg';
import bgParque from '../assets/images/bg_parque.jpg';
import bgQuarto from '../assets/images/bg_quarto.jpg';
import bgAniversario from '../assets/images/bg_aniversario.jpg';
import bgViagemCarro from '../assets/images/bg_viagem_carro.jpg';
import bgChuva from '../assets/images/bg_chuva.jpg';
import bgEscola from '../assets/images/bg_escola.jpg';
import bgNoiteFilme from '../assets/images/bg_noite_filme.jpg';
import bgCasaAvos from '../assets/images/bg_casa_avos.jpg';
import bgBichoEstimacao from '../assets/images/bg_bicho_estimacao.jpg';
import bgDiaCoragem from '../assets/images/bg_dia_coragem.jpg';
import bgPiscina from '../assets/images/bg_piscina.jpg';
import bgViagemFrio from '../assets/images/bg_viagem_frio.jpg';
import bgNatalFimAno from '../assets/images/bg_natal_fim_ano.jpg';
import bgDiaEsporte from '../assets/images/bg_dia_esporte.jpg';
import bgAcampamento from '../assets/images/bg_acampamento.jpg';
import bgFeiraMercado from '../assets/images/bg_feira_mercado.jpg';
import bgHoraBanho from '../assets/images/bg_hora_banho.jpg';
import bgCoringaAlegre from '../assets/images/bg_coringa_alegre.jpg';
import bgCoringaAventura from '../assets/images/bg_coringa_aventura.jpg';
import bgCoringaCarinho from '../assets/images/bg_coringa_carinho.jpg';
import bgCoringaEngracado from '../assets/images/bg_coringa_engracado.jpg';

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  praia: { id: 'praia', name: 'A Praia Encantada', tagline: 'Onde o mar guarda segredos e risadas', keywords: ['mar', 'praia', 'areia', 'onda', 'concha', 'verão', 'sol'], themeColor: '#e0a352', accentGlow: 'rgba(235, 175, 85, 0.45)', bgGradient: 'from-[#0b2434] via-[#12394c] to-[#3a2818]', bgImage: bgPraia, ambientDescription: 'Brisa morna, cheiro de sal e pegadas na areia úmida.', points: [
    { id: 'p1', name: 'A Concha Secreta', subtitle: 'Sussurros do fundo do mar', iconName: 'Shell', phrase: 'Toda conchinha na areia guarda o eco de quem riu alto perto das ondas.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'O Guarda-Sol Amarelo', subtitle: 'Sombra e água fresca', iconName: 'Umbrella', phrase: 'Debaixo da mesma sombra, qualquer história boba vira a melhor piada do dia.', xPercent: 72, yPercent: 44 },
    { id: 'p3', name: 'O Castelo de Areia', subtitle: 'Muralhas de imaginação', iconName: 'Castle', phrase: 'Não importa se a onda levou: o castelo mais bonito é o que a gente fez junto.', xPercent: 32, yPercent: 68 },
    { id: 'p4', name: 'O Encontro das Ondas', subtitle: 'Água que molha os pés', iconName: 'Waves', phrase: 'A água do mar lava qualquer pressa e deixa só a vontade de pular mais uma vez.', xPercent: 76, yPercent: 84 },
  ]},
  quintal: { id: 'quintal', name: 'O Quintal Mágico', tagline: 'Onde bichos e plantas contam causos', keywords: ['cachorro', 'gato', 'quintal', 'jardim', 'brincar lá fora', 'grama'], themeColor: '#78b159', accentGlow: 'rgba(120, 177, 89, 0.45)', bgGradient: 'from-[#0e2718] via-[#1a3821] to-[#382a17]', bgImage: bgQuintal, ambientDescription: 'Grama fofinha, cheiro de terra molhada e folhas dançando no ar.', points: [
    { id: 'p1', name: 'A Árvore Antiga', subtitle: 'Sombra dos passarinhos', iconName: 'Trees', phrase: 'As folhas balançam no vento como se estivessem aplaudindo as trapalhadas do quintal.', xPercent: 75, yPercent: 24 },
    { id: 'p2', name: 'O Cantinho das Flores', subtitle: 'Cores que brotam da terra', iconName: 'Flower2', phrase: 'Até as flores parecem rir quando alguém tropeça na mangueira sem querer.', xPercent: 26, yPercent: 46 },
    { id: 'p3', name: 'A Cerca de Madeira', subtitle: 'Onde o sol se deita', iconName: 'Fence', phrase: 'O quintal é o maior reino do mundo quando tem quatro patas correndo atrás de uma bola.', xPercent: 68, yPercent: 72 },
  ]},
  cozinha: { id: 'cozinha', name: 'A Cozinha Aconchegante', tagline: 'Onde as melhores receitas têm risadas no recheio', keywords: ['cozinha', 'comida', 'receita', 'bolo', 'farinha', 'panela'], themeColor: '#e59546', accentGlow: 'rgba(229, 149, 70, 0.45)', bgGradient: 'from-[#2b160b] via-[#3a2012] to-[#1c120c]', bgImage: bgCozinha, ambientDescription: 'Fumaça quentinha, aroma de bolo assando e colher de pau batendo.', points: [
    { id: 'p1', name: 'A Mesa de Madeira', subtitle: 'Ponto de encontro', iconName: 'UtensilsCrossed', phrase: 'A melhor parte de cozinhar juntos é raspar a tigela antes de lavar a louça.', xPercent: 30, yPercent: 28 },
    { id: 'p2', name: 'O Pote de Farinha', subtitle: 'Pó mágico da bagunça', iconName: 'Sparkles', phrase: 'Um nariz com farinha branca é o sinal oficial de que a diversão começou.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'A Janela Ensolarada', subtitle: 'Luz da manhã', iconName: 'SunMedium', phrase: 'O cheiro do que é feito com carinho perfuma a casa inteira por dias.', xPercent: 32, yPercent: 76 },
  ]},
  parque: { id: 'parque', name: 'O Parque da Aventura', tagline: 'Onde o céu é o limite do balanço', keywords: ['parque', 'playground', 'balanço', 'escorregador', 'pipa'], themeColor: '#58a77a', accentGlow: 'rgba(88, 167, 122, 0.45)', bgGradient: 'from-[#0b261a] via-[#163827] to-[#2e2612]', bgImage: bgParque, ambientDescription: 'Vozes alegres ao longe, folhas sussurrando e o chão de terra batida.', points: [
    { id: 'p1', name: 'O Balanço nas Alturas', subtitle: 'Pés apontando pro céu', iconName: 'Wind', phrase: 'No ponto mais alto do balanço, dá aquele friozinho bom na barriga e um riso solto.', xPercent: 26, yPercent: 25 },
    { id: 'p2', name: 'A Pipa no Vento', subtitle: 'Dança entre as nuvens', iconName: 'Compass', phrase: 'Correr olhando para o céu faz os pés esquecerem que a gravidade existe.', xPercent: 76, yPercent: 45 },
    { id: 'p3', name: 'A Trilha dos Passos Rápidos', subtitle: 'Caminho de pegadas', iconName: 'Footprints', phrase: 'Quem corre rindo nunca cansa de verdade: o coração fica levinho.', xPercent: 34, yPercent: 70 },
    { id: 'p4', name: 'O Banco Amigo', subtitle: 'Onde a conversa descansa', iconName: 'Smile', phrase: 'Sentar lado a lado olhando as árvores acalma tudo ao redor.', xPercent: 70, yPercent: 86 },
  ]},
  quarto: { id: 'quarto', name: 'O Quarto das Histórias', tagline: 'Onde o edredom vira castelo e fortaleza', keywords: ['cama', 'quarto', 'dormir', 'travesseiro', 'história antes de dormir'], themeColor: '#d4af37', accentGlow: 'rgba(212, 175, 55, 0.45)', bgGradient: 'from-[#0b261b] via-[#133827] to-[#2e2612]', bgImage: bgQuarto, ambientDescription: 'Luz amarelada do abajur, travesseiro macio e risinhos sussurrados.', points: [
    { id: 'p1', name: 'A Cabana de Lençóis', subtitle: 'Refúgio secreto', iconName: 'Tent', phrase: 'Debaixo de dois lençóis e quatro almofadas cabe o universo inteiro.', xPercent: 30, yPercent: 28 },
    { id: 'p2', name: 'A Lâmpada de Estrelas', subtitle: 'Luz suave na parede', iconName: 'MoonStar', phrase: 'Uma história contada baixinho tem o poder de fazer qualquer medo evaporar.', xPercent: 74, yPercent: 50 },
    { id: 'p3', name: 'A Nuvem de Travesseiros', subtitle: 'Onde o sono chega manso', iconName: 'CloudMoon', phrase: 'O abraço de boa noite é a ponte mais quentinha para os melhores sonhos.', xPercent: 32, yPercent: 78 },
  ]},
  viagem_carro: { id: 'viagem_carro', name: 'A Viagem de Carro', tagline: 'Onde o caminho é mais divertido que o destino', keywords: ['carro', 'estrada', 'viagem', 'dirigindo', 'música no carro'], themeColor: '#d67c52', accentGlow: 'rgba(214, 124, 82, 0.45)', bgGradient: 'from-[#221714] via-[#382018] to-[#1a1c29]', bgImage: bgViagemCarro, ambientDescription: 'Janela aberta, vento no rosto e cantoria que ninguém sabe a letra toda.', points: [
    { id: 'p1', name: 'A Janela do Vento', subtitle: 'O mundo passando depressa', iconName: 'Compass', phrase: 'Olhar as nuvens pela janela do carro faz qualquer um ver bichos gigantes no céu.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'O Rádio da Cantoria', subtitle: 'Cantoria sem vergonha', iconName: 'Music', phrase: 'Errar a letra da música juntos e continuar cantando alto é o que faz a viagem inesquecível.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'A Parada do Lanche', subtitle: 'Surpresas pelo caminho', iconName: 'MapPin', phrase: 'Os melhores desvios de rota são aqueles que terminam comendo pão de queijo quentinho.', xPercent: 35, yPercent: 74 },
  ]},
  aniversario: { id: 'aniversario', name: 'A Festa de Aniversário', tagline: 'Onde cada vela acesa guarda um abraço apertado', keywords: ['bolo', 'festa', 'parabéns', 'vela', 'balão', 'presente'], themeColor: '#e0657b', accentGlow: 'rgba(224, 101, 123, 0.45)', bgGradient: 'from-[#2b101d] via-[#3c172a] to-[#211b15]', bgImage: bgAniversario, ambientDescription: 'Palmas sinceras, cheiro de vela apagada e calda de chocolate.', points: [
    { id: 'p1', name: 'A Vela do Pedido', subtitle: 'O sopro encantado', iconName: 'Flame', phrase: 'O sopro na velinha leva pro ar um desejo bom que o coração já sabia.', xPercent: 30, yPercent: 26 },
    { id: 'p2', name: 'A Revoada de Balões', subtitle: 'Cores flutuantes', iconName: 'PartyPopper', phrase: 'Uma bexiga solta no ar faz adultos e crianças pularem com o mesmo entusiasmo.', xPercent: 74, yPercent: 46 },
    { id: 'p3', name: 'O Primeiro Pedaço', subtitle: 'O maior pedaço de carinho', iconName: 'Gift', phrase: 'Entregar o primeiro pedaço de bolo é dizer com doce o quanto alguém é especial na vida.', xPercent: 32, yPercent: 74 },
  ]},
  chuva: { id: 'chuva', name: 'A Tarde de Chuva', tagline: 'Onde as poças viram espelhos d\u2019água', keywords: ['chuva', 'molhado', 'poça', 'guarda-chuva', 'trovão'], themeColor: '#589cdb', accentGlow: 'rgba(88, 156, 219, 0.45)', bgGradient: 'from-[#0e1f2f] via-[#162e45] to-[#1f2824]', bgImage: bgChuva, ambientDescription: 'Barulhinho ritmado no telhado, chocolate quente e pés descalços.', points: [
    { id: 'p1', name: 'A Maior Poça d\u2019Água', subtitle: 'O convite pro pulo', iconName: 'Droplets', phrase: 'Pular com os dois pés na poça d\u2019água é um direito sagrado de quem sabe rir.', xPercent: 28, yPercent: 28 },
    { id: 'p2', name: 'O Guarda-Chuva Colorido', subtitle: 'Teto portátil de carinho', iconName: 'Umbrella', phrase: 'Andar juntinho debaixo do mesmo guarda-chuva faz a tempestade virar aconchego.', xPercent: 75, yPercent: 50 },
    { id: 'p3', name: 'O Cheiro de Terra Molhada', subtitle: 'Quando a chuva acalma', iconName: 'Sun', phrase: 'Toda chuva passa e deixa o ar com aquele frescor inesquecível de mundo renovado.', xPercent: 34, yPercent: 78 },
  ]},
  escola: { id: 'escola', name: 'O Dia na Escola', tagline: 'Onde cada recreio é uma nova história', keywords: ['escola', 'professora', 'amigos da escola', 'mochila', 'primeiro dia'], themeColor: '#4f8fe8', accentGlow: 'rgba(79, 143, 232, 0.45)', bgGradient: 'from-[#101e38] via-[#182d52] to-[#252014]', bgImage: bgEscola, ambientDescription: 'Sinal do recreio tocando, lápis de cor apontados e abraço no portão.', points: [
    { id: 'p1', name: 'A Mochila Cheia de Cores', subtitle: 'Tudo pronto pro dia', iconName: 'Sparkles', phrase: 'Dentro da mochila cabem cadernos, estojos e uma vontade enorme de contar novidades.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'O Pátio do Recreio', subtitle: 'Risadas e correria', iconName: 'Footprints', phrase: 'Dividir o lanche e inventar brincadeiras novas é o verdadeiro segredo dos amigos.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'O Abraço na Saída', subtitle: 'O melhor reencontro', iconName: 'Heart', phrase: 'Aquele abraço apertado no portão faz o dia inteiro valer a pena.', xPercent: 34, yPercent: 76 },
  ]},
  noite_filme: { id: 'noite_filme', name: 'A Noite de Filme e Pipoca', tagline: 'Onde o sofá vira cinema particular', keywords: ['pipoca', 'filme', 'sofá', 'cobertor', 'sala', 'pijama'], themeColor: '#d69e4f', accentGlow: 'rgba(214, 158, 79, 0.45)', bgGradient: 'from-[#192b1d] via-[#243d2b] to-[#292212]', bgImage: bgNoiteFilme, ambientDescription: 'Cheirinho de pipoca estourando na panela, luz apagada e ninho de almofadas.', points: [
    { id: 'p1', name: 'A Tigela de Pipoca', subtitle: 'Quentinha e crocante', iconName: 'Sparkles', phrase: 'A pipoca fica duas vezes mais gostosa quando todo mundo enfia a mão na mesma tigela.', xPercent: 30, yPercent: 26 },
    { id: 'p2', name: 'O Ninho de Cobertores', subtitle: 'Aconchego total no sofá', iconName: 'CloudMoon', phrase: 'Ficar emboladinho debaixo do cobertor faz qualquer cena parecer mais emocionante.', xPercent: 75, yPercent: 48 },
    { id: 'p3', name: 'O Riso na Cena Engraçada', subtitle: 'Gargalhada sincronizada', iconName: 'Smile', phrase: 'Quando todo mundo cai na risada junto na sala, o filme nem precisa terminar pra ser ótimo.', xPercent: 32, yPercent: 76 },
  ]},
  casa_avos: { id: 'casa_avos', name: 'A Casa dos Avós', tagline: 'Onde o carinho tem cheiro de bolo quentinho e história antiga', keywords: ['vovó', 'vovô', 'avós', 'casa da vovó', 'cheiro de comida diferente'], themeColor: '#d69e4f', accentGlow: 'rgba(214, 158, 79, 0.45)', bgGradient: 'from-[#2e1d0f] via-[#422c16] to-[#1c1208]', bgImage: bgCasaAvos, ambientDescription: 'Relógio antigo batendo na parede, cheiro de alecrim e afeto sem pressa.', points: [
    { id: 'p1', name: 'A Poltrona das Histórias', subtitle: 'Memórias de outros tempos', iconName: 'Trees', phrase: 'Ouvir causos antigos no colo dos avós é como viajar no tempo sem sair do lugar.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'O Armário das Gostosuras', subtitle: 'Segredos doces', iconName: 'UtensilsCrossed', phrase: 'Na casa dos avós sempre tem um docinho guardado especialmente pra fazer festa.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'O Abraço que Acalma Tudo', subtitle: 'Afeto de gerações', iconName: 'Heart', phrase: 'A bênção e o carinho dos avós são como um escudo de amor que a gente leva pra sempre.', xPercent: 32, yPercent: 76 },
  ]},
  bicho_estimacao: { id: 'bicho_estimacao', name: 'O Amigo Bicho de Estimação', tagline: 'Onde o amor não precisa de palavras pra ser sentido', keywords: ['cachorro', 'gato', 'passarinho', 'peixinho', 'adotar', 'filhote'], themeColor: '#4ea87f', accentGlow: 'rgba(78, 168, 127, 0.45)', bgGradient: 'from-[#0e271a] via-[#1a3d2a] to-[#2e2612]', bgImage: bgBichoEstimacao, ambientDescription: 'Focinho gelado encostando na mão, rabinho abanando e passos fofos pelo chão.', points: [
    { id: 'p1', name: 'O Primeiro Olhar', subtitle: 'Amizade à primeira vista', iconName: 'Heart', phrase: 'O dia em que o bichinho chegou em casa mudou o som e o ritmo de todo o lar.', xPercent: 30, yPercent: 26 },
    { id: 'p2', name: 'A Correria das Patinhas', subtitle: 'Trapalhadas e brincadeiras', iconName: 'Footprints', phrase: 'Correr atrás de uma bolinha ou de um novelo de lã faz qualquer tarde virar comédia.', xPercent: 75, yPercent: 48 },
    { id: 'p3', name: 'A Soneca Juntinho', subtitle: 'Respiração tranquila', iconName: 'Smile', phrase: 'Ter um bicho deitado aos pés no final da tarde enche a casa de uma paz sem tamanho.', xPercent: 34, yPercent: 76 },
  ]},
  dia_coragem: { id: 'dia_coragem', name: 'O Grande Dia de Coragem', tagline: 'Onde um coração valente ganha adesivo de campeão', keywords: ['médico', 'dentista', 'hospital', 'vacina', 'corajoso', 'adesivo'], themeColor: '#e07d58', accentGlow: 'rgba(224, 125, 88, 0.45)', bgGradient: 'from-[#2b1712] via-[#3d241c] to-[#1c222e]', bgImage: bgDiaCoragem, ambientDescription: 'Consultório fofinho e colorido, mão dada bem apertada e adesivo de medalha brilhante.', points: [
    { id: 'p1', name: 'A Mão Segura e Firme', subtitle: 'Juntos em qualquer lugar', iconName: 'Heart', phrase: 'Segurar bem forte na mão de quem a gente ama faz qualquer receio diminuir de tamanho.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'O Batalhão de Coragem', subtitle: 'Um suspiro fundo', iconName: 'Sparkles', phrase: 'Ser corajoso não é não ter medo: é respirar fundo e saber que tudo vai ficar bem rapidinho.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'O Adesivo Dourado de Campeão', subtitle: 'Medalha do coração', iconName: 'PartyPopper', phrase: 'Colocar o adesivo colorido na camiseta comemora a força linda que você tem por dentro.', xPercent: 32, yPercent: 76 },
  ]},
  piscina: { id: 'piscina', name: 'A Tarde na Piscina', tagline: 'Onde o mergulho espalha gotas de sol e alegria', keywords: ['piscina', 'nadar', 'boia', 'verão', 'molhado', 'água'], themeColor: '#3bbcd9', accentGlow: 'rgba(59, 188, 217, 0.45)', bgGradient: 'from-[#0b2938] via-[#10425c] to-[#1d352b]', bgImage: bgPiscina, ambientDescription: 'Cheirinho de protetor solar, boias de bichinho e água azul brilhando ao sol.', points: [
    { id: 'p1', name: 'A Boia de Flamingo', subtitle: 'Flutuando sobre a água', iconName: 'Waves', phrase: 'Balançar na boia colorida olhando as nuvens é como deitar numa cama que dança.', xPercent: 30, yPercent: 26 },
    { id: 'p2', name: 'O Grande Tchibum!', subtitle: 'Gotas pro alto', iconName: 'Droplets', phrase: 'O salto mais engraçado é aquele que molha todo mundo que estava sentado na borda.', xPercent: 75, yPercent: 48 },
    { id: 'p3', name: 'A Toalha Quentinha de Sol', subtitle: 'Abraço depois da água', iconName: 'Sun', phrase: 'Se enrolar na toalha fofa depois de cansar de nadar traz uma sensação boa de dever cumprido.', xPercent: 34, yPercent: 76 },
  ]},
  viagem_frio: { id: 'viagem_frio', name: 'A Viagem pro Frio', tagline: 'Onde a fumaça sai da boca e o coração fica aquecido', keywords: ['neve', 'frio', 'cobertor', 'chocolate quente', 'casaco'], themeColor: '#7ba9e0', accentGlow: 'rgba(123, 169, 224, 0.45)', bgGradient: 'from-[#122238] via-[#1b3452] to-[#251f33]', bgImage: bgViagemFrio, ambientDescription: 'Ar geladinho no nariz, casacos fofos e canecas fumegantes de chocolate.', points: [
    { id: 'p1', name: 'A Roupa de Boneco de Neve', subtitle: 'Tantas camadas fofas', iconName: 'Sparkles', phrase: 'Com três casacos e duas meias, a gente anda engraçado como um pinguim na sala.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'A Caneca de Chocolate Quente', subtitle: 'Vapor doce no ar', iconName: 'UtensilsCrossed', phrase: 'Assoprar o chocolate quente segurando a caneca com as duas mãos esquenta até os pensamentos.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'O Abraço que Derrete o Gelo', subtitle: 'Calor de quem se ama', iconName: 'Heart', phrase: 'Não existe vento gelado no mundo que consiga esfriar uma família que caminha junta.', xPercent: 32, yPercent: 76 },
  ]},
  natal_fim_ano: { id: 'natal_fim_ano', name: 'O Natal e Fim de Ano', tagline: 'Onde as luzinhas piscam no ritmo da gratidão', keywords: ['natal', 'árvore', 'luzes', 'presente', 'ceia', 'ano novo'], themeColor: '#d65353', accentGlow: 'rgba(214, 83, 83, 0.45)', bgGradient: 'from-[#2b0f14] via-[#40181f] to-[#1b2b1b]', bgImage: bgNatalFimAno, ambientDescription: 'Pisca-pisca na árvore, aroma de canela e abraços de boas festas.', points: [
    { id: 'p1', name: 'A Estrela do Topo da Árvore', subtitle: 'Brilho que guia a noite', iconName: 'MoonStar', phrase: 'Colocar o enfeite mais alto na ponta dos pés é a tradição mais doce da casa.', xPercent: 30, yPercent: 26 },
    { id: 'p2', name: 'A Mesa Iluminada da Ceia', subtitle: 'Partilha e sorrisos', iconName: 'PartyPopper', phrase: 'O prato principal da noite de Natal é a presença de quem a gente ama ao redor da mesa.', xPercent: 75, yPercent: 48 },
    { id: 'p3', name: 'O Abraço da Meia-Noite', subtitle: 'Desejos de esperança', iconName: 'Gift', phrase: 'O melhor presente que a gente desembrulha todos os anos é saber que temos uns aos outros.', xPercent: 34, yPercent: 76 },
  ]},
  dia_esporte: { id: 'dia_esporte', name: 'O Grande Dia de Esporte', tagline: 'Onde o suor e a corrida viram festa e superação', keywords: ['bola', 'jogo', 'time', 'treino', 'corrida', 'medalha'], themeColor: '#e08f38', accentGlow: 'rgba(224, 143, 56, 0.45)', bgGradient: 'from-[#2b1b0b] via-[#3e2712] to-[#12281b]', bgImage: bgDiaEsporte, ambientDescription: 'Chute na bola, torcida animada na lateral e água geladinha na garrafa.', points: [
    { id: 'p1', name: 'O Apito Inicial', subtitle: 'Coração acelerado de energia', iconName: 'Wind', phrase: 'O friozinho na barriga antes do jogo começar é o sinal de que a energia tá pronta.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'A Jogada em Conjunto', subtitle: 'Passe de craque', iconName: 'Footprints', phrase: 'Passar a bola e comemorar o ponto do amigo ensina que a vitória é mais doce quando é de todos.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'A Medalha de Participação', subtitle: 'Orgulho de ter tentado', iconName: 'PartyPopper', phrase: 'Mais importante do que o placar é ter corrido com toda a vontade e sair sorrindo de campo.', xPercent: 32, yPercent: 76 },
  ]},
  acampamento: { id: 'acampamento', name: 'O Acampamento sob as Estrelas', tagline: 'Onde a fogueira aquece as histórias da noite', keywords: ['barraca', 'fogueira', 'estrelas', 'mata', 'lanterna', 'sacola de dormir'], themeColor: '#e0aa38', accentGlow: 'rgba(224, 170, 56, 0.45)', bgGradient: 'from-[#12192b] via-[#1c293d] to-[#2e2412]', bgImage: bgAcampamento, ambientDescription: 'Crepitar da lenha na fogueira, céu cravejado de constelações e sombras na barraca.', points: [
    { id: 'p1', name: 'A Montagem da Barraca', subtitle: 'Nossa casa no meio do mato', iconName: 'Tent', phrase: 'Montar a barraca juntos é o primeiro grande desafio que vira piada quando sobra uma varenta.', xPercent: 30, yPercent: 26 },
    { id: 'p2', name: 'A Fogueira das Histórias', subtitle: 'Chamas dançantes', iconName: 'Flame', phrase: 'Olhar as fagulhas subindo para o céu faz as histórias parecerem pura magia ancestral.', xPercent: 75, yPercent: 48 },
    { id: 'p3', name: 'O Céu Infinito de Estrelas', subtitle: 'Constelações e estrelas cadentes', iconName: 'MoonStar', phrase: 'Deitar de barriga pra cima na grama escura faz a gente perceber o quanto o mundo é grandioso.', xPercent: 34, yPercent: 76 },
  ]},
  feira_mercado: { id: 'feira_mercado', name: 'A Feira e o Mercado Colorido', tagline: 'Onde as cores, cheiros e sabores fazem a festa', keywords: ['feira', 'mercado', 'fruta', 'compras', 'barraca de comida'], themeColor: '#d67c42', accentGlow: 'rgba(214, 124, 66, 0.45)', bgGradient: 'from-[#2e170e] via-[#422216] to-[#1c2617]', bgImage: bgFeiraMercado, ambientDescription: 'Vozes animadas dos feirantes, cheiro de pastel frito e frutas doces na bancada.', points: [
    { id: 'p1', name: 'A Barraca das Frutas Doces', subtitle: 'Pedaço de melancia pro provador', iconName: 'Apple', phrase: 'Provar a fruta direto da ponta da faca do feirante é a melhor degustação que existe.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'O Pastel de Feira Quentinho', subtitle: 'Crocante com caldo de cana', iconName: 'UtensilsCrossed', phrase: 'Morder o pastel estalando e tomar um gole de suco gelado é o ritual sagrado do domingo.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'A Sacola Cheia de Descobertas', subtitle: 'Cores pra levar pra casa', iconName: 'Sparkles', phrase: 'Carregar a sacolinha de papel cheia de verduras e cheiros faz a gente se sentir um cozinheiro de verdade.', xPercent: 32, yPercent: 76 },
  ]},
  hora_banho: { id: 'hora_banho', name: 'A Hora Divertida do Banho', tagline: 'Onde a espuma vira barba de rei e penteado maluco', keywords: ['banho', 'banheira', 'bolhas', 'patinho', 'shampoo', 'toalha'], themeColor: '#4cbde0', accentGlow: 'rgba(76, 189, 224, 0.45)', bgGradient: 'from-[#0b2838] via-[#103d52] to-[#1a2b36]', bgImage: bgHoraBanho, ambientDescription: 'Espuma macia subindo, patinho de borracha boiando e água quentinha no chuveiro.', points: [
    { id: 'p1', name: 'A Montanha de Espuma', subtitle: 'Penteados malucos no espelho', iconName: 'Droplets', phrase: 'Fazer chifrinho de unicórnio ou barba de Noel com espuma é obrigação em todo bom banho.', xPercent: 30, yPercent: 26 },
    { id: 'p2', name: 'O Show do Patinho Amarelo', subtitle: 'Navegação de banheira', iconName: 'Waves', phrase: 'O patinho amarelo enfrentou as maiores ondas de espuma sem nunca perder a pose.', xPercent: 75, yPercent: 48 },
    { id: 'p3', name: 'O Pacotinho de Toalha', subtitle: 'Cheirinho de banho tomado', iconName: 'Heart', phrase: 'Sair do banho enroladinho na toalha como um rolinho de carinho dá aquela vontade boa de deitar.', xPercent: 34, yPercent: 76 },
  ]},
  coringa_alegre: { id: 'coringa_alegre', name: 'A Clareira da Alegria', tagline: 'Onde a luz do sol dança entre as folhas comemorando a vida', keywords: ['feliz', 'sorriso', 'festa', 'animado', 'alegria', 'luz', 'contente'], sentimentTone: 'ALEGRE', themeColor: '#e0b343', accentGlow: 'rgba(224, 179, 67, 0.45)', bgGradient: 'from-[#2b200b] via-[#3d2e12] to-[#172618]', bgImage: bgCoringaAlegre, ambientDescription: 'Raios dourados atravessando a copa das árvores e risos leves no vento.', points: [
    { id: 'p1', name: 'O Raio Dourado', subtitle: 'Luz que ilumina o caminho', iconName: 'SunMedium', phrase: 'Os dias felizes brilham na lembrança como o sol da manhã batendo na janela.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'O Voo dos Vagalumes', subtitle: 'Pequenas luzes de afeto', iconName: 'Sparkles', phrase: 'Cada risada solta acende uma luzinha secreta que nunca mais se apaga no coração.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'O Grande Carvalho Protetor', subtitle: 'Raízes de companheirismo', iconName: 'Trees', phrase: 'Alegria compartilhada em família cresce forte e espalha sombra boa pra sempre.', xPercent: 32, yPercent: 76 },
  ]},
  coringa_aventura: { id: 'coringa_aventura', name: 'O Bosque dos Exploradores', tagline: 'Onde cada curva da trilha guarda uma nova descoberta', keywords: ['corri', 'pulei', 'aventura', 'subir', 'explorar', 'mistério', 'esconder'], sentimentTone: 'AVENTURA', themeColor: '#52b77c', accentGlow: 'rgba(82, 183, 124, 0.45)', bgGradient: 'from-[#0b261b] via-[#143829] to-[#262412]', bgImage: bgCoringaAventura, ambientDescription: 'Musgo aveludado, pegadas misteriosas no chão e vento nas alturas.', points: [
    { id: 'p1', name: 'A Trilha dos Passos Corajosos', subtitle: 'Pegadas de explorador', iconName: 'Compass', phrase: 'Quem tem coragem de explorar o mundo ao lado de quem ama nunca se perde no caminho.', xPercent: 30, yPercent: 26 },
    { id: 'p2', name: 'A Ponte de Corda da Coragem', subtitle: 'Balanço seguro', iconName: 'Wind', phrase: 'Atravessar desafios juntos faz a gente descobrir que somos muito mais fortes do que imaginávamos.', xPercent: 75, yPercent: 48 },
    { id: 'p3', name: 'O Mirante Secreto da Floresta', subtitle: 'Visão do horizonte', iconName: 'Trees', phrase: 'Do alto da colina, todo caminho percorrido parece um lindo desenho de amor e coragem.', xPercent: 34, yPercent: 76 },
  ]},
  coringa_carinho: { id: 'coringa_carinho', name: 'O Recanto do Abraço Quentinho', tagline: 'Onde o mundo desacelera e o aconchego cuida de tudo', keywords: ['abraço', 'colo', 'carinho', 'aconchego', 'beijo', 'quentinho', 'amor', 'ninar'], sentimentTone: 'CARINHO', themeColor: '#d4af37', accentGlow: 'rgba(212, 175, 55, 0.45)', bgGradient: 'from-[#14291f] via-[#1f3d2e] to-[#2b2513]', bgImage: bgCoringaCarinho, ambientDescription: 'Folhas macias como edredom, lanternas suaves e um abraço protetor.', points: [
    { id: 'p1', name: 'O Ninho das Almofadas de Musgo', subtitle: 'Pouso suave', iconName: 'CloudMoon', phrase: 'Um abraço apertado tem o poder de consertar qualquer dia que parecia difícil.', xPercent: 28, yPercent: 26 },
    { id: 'p2', name: 'A Lanterna da Calmaria', subtitle: 'Luz que acalma o peito', iconName: 'MoonStar', phrase: 'Estar junto em silêncio confortável é uma das formas mais bonitas de dizer que se ama.', xPercent: 74, yPercent: 48 },
    { id: 'p3', name: 'O Abraço que Guarda a Memória', subtitle: 'Afeto eterno', iconName: 'Heart', phrase: 'O calor do carinho recebido na infância vira um refúgio seguro dentro de nós pra vida inteira.', xPercent: 32, yPercent: 76 },
  ]},
  coringa_engracado: { id: 'coringa_engracado', name: 'A Clareira das Risadas e Cócegas', tagline: 'Onde as trapalhadas viram as histórias mais queridas', keywords: ['riu', 'rindo', 'risada', 'engraçado', 'hilário', 'gargalhada', 'piada', 'cócegas', 'trapalhada'], sentimentTone: 'ENGRAÇADO', themeColor: '#3ec9a7', accentGlow: 'rgba(62, 201, 167, 0.45)', bgGradient: 'from-[#0b2b24] via-[#123e35] to-[#302c12]', bgImage: bgCoringaEngracado, ambientDescription: 'Flores que balançam como quem ri, cócegas no ar e gargalhadas sem fim.', points: [
    { id: 'p1', name: 'O Ponto das Cócegas Incontroláveis', subtitle: 'Rir até a barriga doer', iconName: 'Smile', phrase: 'A melhor risada do mundo é aquela que faz a gente perder a voz e chorar de alegria.', xPercent: 30, yPercent: 26 },
    { id: 'p2', name: 'O Tropeço que Virou Dança', subtitle: 'Trapalhada genial', iconName: 'PartyPopper', phrase: 'Errar o passo e cair na gargalhada transforma qualquer tombo na melhor cena da história.', xPercent: 75, yPercent: 48 },
    { id: 'p3', name: 'O Eco da Gargalhada Mágica', subtitle: 'Alegria que contagia', iconName: 'Sparkles', phrase: 'Quem ri junto constrói pontes invisíveis de cumplicidade que duram para sempre.', xPercent: 34, yPercent: 76 },
  ]},
};
