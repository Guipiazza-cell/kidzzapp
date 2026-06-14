export type PaywallContext =
  | "question_limit"
  | "story_limit"
  | "story_continuation"
  | "sleep_story"
  | "sleep_sound"
  | "achievement"
  | "lab_outfit"
  | "memories_old"
  | "travel"
  | "moments"
  | "sos_journey"
  | "wellness_journey"
  | "premium_feature";

export interface PaywallCopy {
  emoji: string;
  headline: string;
  subheadline: string;
  cta: string;
  highlight: string;
}

export function getPaywallCopy(
  context: PaywallContext,
  childName: string,
  meta?: Record<string, string | number>
): PaywallCopy {
  const name = childName || "seu filho";
  switch (context) {
    case "question_limit":
      return {
        emoji: "🔥",
        headline: `O Kidzz ficou um pouco sonolento por aqui 😴`,
        subheadline: `Vamos descansar e voltar amanhã? Ou desbloqueie e siga a aventura com ${name} à vontade.`,
        cta: "✨ Continuar a aventura",
        highlight: "Perguntas à vontade",
      };
    case "story_limit":
      return {
        emoji: "📖",
        headline: `${name} quer mais uma história! 📖`,
        subheadline: "Histórias ilimitadas e personalizadas esperam vocês.",
        cta: "📚 Liberar histórias",
        highlight: "Histórias ilimitadas",
      };
    case "sleep_story":
      return {
        emoji: "🌙",
        headline: `Esta história foi criada para crianças como ${name} 🌙`,
        subheadline: "Sonhos guiados, narração suave e sono profundo todas as noites.",
        cta: "🌙 Desbloquear sonhos",
        highlight: "Mundo dos Sonhos completo",
      };
    case "sleep_sound":
      return {
        emoji: "🎵",
        headline: `${name} merece dormir embalado por sons mágicos`,
        subheadline: "Chuva, floresta, fogueira — escolha a trilha perfeita para a noite.",
        cta: "🎧 Ativar sons mágicos",
        highlight: "Áudios premium",
      };
    case "achievement":
      return {
        emoji: "🏆",
        headline: `${name} está conquistando muito! 🏆`,
        subheadline: "Desbloqueie todas as conquistas e badges exclusivas.",
        cta: "🌟 Ver tudo",
        highlight: "Conquistas premium",
      };
    case "lab_outfit":
      return {
        emoji: "🦎",
        headline: `Este traje especial aguarda ${name}! 🦎✨`,
        subheadline: "Pixel ganha novas cores, roupas e expressões com Premium.",
        cta: "🎨 Personalizar Pixel",
        highlight: "Câmara de Criação completa",
      };
    case "memories_old":
      return {
        emoji: "💛",
        headline: `Esta memória de ${name} está esperando por você 💛`,
        subheadline: "Acesse o álbum completo e nunca perca um momento.",
        cta: "💛 Reabrir lembranças",
        highlight: "Álbum ilimitado",
      };
    case "travel":
      return {
        emoji: "✈️",
        headline: `${name} pronto para viajar? ✈️`,
        subheadline: "Modo Viagem: histórias offline e áudios para qualquer lugar.",
        cta: "🌍 Ativar Modo Viagem",
        highlight: "Conteúdo offline",
      };
    case "moments":
      return {
        emoji: "🎯",
        headline: `Mais momentos inesquecíveis para ${name}`,
        subheadline: "Missões novas todo mês para criar conexão real em família.",
        cta: "✨ Liberar missões",
        highlight: "Fábrica de Momentos completa",
      };
    case "premium_feature":
      return {
        emoji: "👑",
        headline: `Desbloqueie tudo para ${name}`,
        subheadline: "Plano premium com rotina completa, conteúdos bloqueados, histórias, sonhos e relatório dos pais.",
        cta: "👑 Ver assinatura",
        highlight: "Kidzz Premium completo",
      };
    case "story_continuation":
      return {
        emoji: "🌙",
        headline: `Amanhã a aventura de ${name} continua… ✨`,
        subheadline: "Capítulos contínuos, universo persistente e narração avançada esperam vocês.",
        cta: "📖 Continuar essa história",
        highlight: "Histórias com capítulos",
      };
    case "sos_journey":
      return {
        emoji: "🌿",
        headline: `Vocês estão criando algo lindo 💚`,
        subheadline: "Continue a jornada calmante com técnicas guiadas, playlists contextuais e acompanhamento leve.",
        cta: "🌙 Continuar a jornada",
        highlight: "SOS completo",
      };
    case "wellness_journey":
      return {
        emoji: "🌳",
        headline: `Transforme isso em ritual para ${name} ✨`,
        subheadline: "Sleep Ritual completo, soundscapes e jornadas emocionais cinematográficas.",
        cta: "✨ Ativar ritual completo",
        highlight: "Wellness Premium",
      };
  }
}

