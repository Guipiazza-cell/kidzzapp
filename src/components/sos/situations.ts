/**
 * Catálogo de situações do SOS Kidzz.
 * Estrutura emocional, NÃO médica. Não é central de emergência.
 *
 * "implemented" = tem fluxo completo (acolhimento → respiração → prático → conteúdo).
 * "soon"        = aparece no grid mas mostra estado "em breve, com carinho".
 */
export type SosSituation = {
  id: string;
  emoji: string;
  label: string;
  tint: string;        // hsl color usado em halos/bordas
  status: "implemented" | "soon";
};

export const SOS_SITUATIONS: SosSituation[] = [
  { id: "crying",     emoji: "🔴", label: "Crise de choro",      tint: "hsl(0 75% 62%)",   status: "implemented" },
  { id: "tantrum",    emoji: "😤", label: "Birras intensas",     tint: "hsl(18 80% 60%)",  status: "soon" },
  { id: "sleep",      emoji: "😴", label: "Sono difícil",        tint: "hsl(245 50% 65%)", status: "soon" },
  { id: "fear",       emoji: "😰", label: "Medos",               tint: "hsl(265 45% 65%)", status: "soon" },
  { id: "anxiety",    emoji: "😟", label: "Ansiedade",           tint: "hsl(200 55% 60%)", status: "soon" },
  { id: "exhausted",  emoji: "😫", label: "Exaustão dos pais",   tint: "hsl(30 60% 58%)",  status: "soon" },
  { id: "overwhelm",  emoji: "🌪️", label: "Sobrecarga",          tint: "hsl(280 40% 62%)", status: "soon" },
  { id: "lost",       emoji: "❓", label: "Não sei o que fazer", tint: "hsl(150 35% 50%)", status: "soon" },
];
