export type PaywallContext =
  | "question_limit"
  | "story_limit"
  | "sleep_story"
  | "sleep_sound"
  | "achievement"
  | "lab_outfit"
  | "memories_old"
  | "travel"
  | "moments";

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
        headline: `Você já fez ${meta?.count ?? "várias"} perguntas com ${name} hoje! 🔥`,
        subheadline: "Continue alimentando essa curiosidade — desbloqueie 10 perguntas por dia.",
        cta: "✨ Continuar a aventura",
        highlight: "+10 perguntas/dia",
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
  }
}
