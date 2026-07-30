/**
 * Guias práticos (Como fazer + Exemplo) no padrão de Missões do dia.
 */
import type { BrincarExperience } from "@/data/brincarExperiences";

export type PlayGuide = { steps: string[]; example: string };

/** Featured cards da home "Para brincar agora" */
export function getFeaturedGuide(
  id: string,
  titulo: string,
  childName: string,
): PlayGuide {
  const guides: Record<string, PlayGuide> = {
    cabana: {
      steps: [
        "Junte 2 cadeiras ou almofadas e um lençol grande.",
        "Cubra as cadeiras com o lençol e coloque travesseiros dentro.",
        "Entrem juntos e inventem uma história na cabana secreta.",
      ],
      example: `Monte a cabana na sala. ${childName} escolhe o nome do esconderijo e conta uma história de 2 minutos lá dentro.`,
    },
    caca: {
      steps: [
        "Escolham 5 objetos escondidos pela casa (sem o outro ver).",
        "Dêem dicas simples: quente/frio ou cor do cômodo.",
        "Quem achar todos ganha um abraço de campeão.",
      ],
      example: `Esconda 5 brinquedos. ${childName} caça com dicas: "está perto da porta" ou "está frio".`,
    },
    arte: {
      steps: [
        "Separe papel, canetinhas ou lápis de cor.",
        "Escolham um tema (família, animal, super-herói).",
        "Desenhem juntos e mostrem um pro outro no final.",
      ],
      example: `${childName} desenha o herói da casa e o adulto desenha o cenário. Depois contam a história do desenho.`,
    },
    aviao: {
      steps: [
        "Dobrem um avião de papel (pode ser bem simples).",
        "Façam 3 voos e marquem o mais longe.",
        "Inventem um nome pro avião campeão.",
      ],
      example: `Cada um faz um avião. ${childName} conta "1, 2, 3" e soltam juntos do sofá.`,
    },
  };
  return (
    guides[id] ?? {
      steps: [
        "Leiam a ideia em voz alta.",
        "Separem 5 a 10 minutos sem celular.",
        "Façam juntos e contem o que mais gostaram.",
      ],
      example: `Façam "${titulo}" com ${childName} agora, sem pressa e com muita diversão.`,
    }
  );
}

/** Experiências de Criar & Imaginar */
export function getExperienceGuide(
  exp: BrincarExperience,
  childName: string,
): PlayGuide {
  const byId: Record<string, PlayGuide> = {
    "criar-caixa": {
      steps: [
        "Pegue uma caixa de papelão (sapato, entrega, o que tiver).",
        "Decidam juntos: vira casa, nave, robô ou animal?",
        "Decorem com caneta, fita ou desenhos e brinquem 10 minutos.",
      ],
      example: `${childName} transforma a caixa em foguete. Colem "janelinhas" e façam decolagem da sala até a cozinha.`,
    },
    "criar-personagem": {
      steps: [
        "Inventem nome, cor e um superpoder bem engraçado.",
        "Desenhem ou imitem o personagem.",
        "Contem uma mini história de 1 minuto com ele.",
      ],
      example: `O personagem de ${childName} se chama "Bolha" e transforma tudo em gelatina. Atuem a cena!`,
    },
    "criar-planeta": {
      steps: [
        "Escolham o nome e a cor do planeta.",
        "Quem mora lá? Que comida existe?",
        "Contem o primeiro dia de ${childName} nesse planeta.",
      ],
      example: `Planeta "Pipoca". ${childName} é o explorador e o adulto é o guia das estrelas.`,
    },
    "criar-animal": {
      steps: [
        "Escolham 3 animais diferentes.",
        "Misturem: corpo de um, orelhas de outro, voz do terceiro.",
        "Desenhem ou imitem o animal impossível.",
      ],
      example: `Girafa + peixe + gato = "Gipegato". ${childName} inventa o som e a dança dele.`,
    },
    "criar-filme": {
      steps: [
        "Escolham o cenário (sala, cozinha, varanda).",
        "Cada um tem um papel na cena de 1 minuto.",
        "Gravem no celular ou só atuem e aplaudam no final.",
      ],
      example: `Filme "O Lanche Misterioso". ${childName} é o detetive e o adulto esconde o "tesouro" (fruta).`,
    },
  };

  if (byId[exp.id]) return byId[exp.id];

  // Fallback por tipo/categoria
  if (exp.tipo === "criatividade" || exp.categoria === "Criatividade") {
    return {
      steps: [
        "Junte materiais simples que tiverem em casa.",
        "Expliquem a ideia em 1 frase e comecem sem se preocupar com perfeição.",
        "Mostrem o resultado pra família e contem como criaram.",
      ],
      example: `Façam "${exp.titulo}" com ${childName}: usem o que tiverem e divirtam-se inventando.`,
    };
  }
  if (exp.tipo === "familia" || exp.categoria === "Família") {
    return {
      steps: [
        "Chame alguém da família e explique a ideia.",
        "Façam juntos, sem pressa.",
        "No fim, digam uma coisa que cada um curtiu.",
      ],
      example: `Sente com ${childName} e façam "${exp.titulo}" por 5 minutos, olhando um pro outro.`,
    };
  }
  return {
    steps: [
      "Leiam a ideia juntos.",
      "Separem o tempo sugerido.",
      "Façam e comemorem no final.",
    ],
    example: `${childName} e a família fazem "${exp.titulo}" agora: ${exp.descricao}`,
  };
}
