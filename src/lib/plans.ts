/**
 * KIDZZ — Configuração central de planos e permissões.
 * Esta é a ÚNICA fonte de regras de acesso e limites do app.
 * Nenhuma tela deve decidir acesso por conta própria — consultar useEntitlement().
 */

export type Plan = "free" | "kidzz" | "premium";

export type Area =
  | "perguntas"
  | "historias"
  | "musica"
  | "sonhos"
  | "rotina"
  | "kalm"
  | "brincar"
  | "cinema"
  | "momentos"
  | "memorias"
  | "sos";

export type AccessLevel = "full" | "sample" | "locked";

/** Mapa de acesso por plano e por área. */
export const PLAN_ACCESS: Record<Plan, Record<Area, AccessLevel>> = {
  free: {
    perguntas: "full",      // limite invisível (2/dia) controlado por usage
    historias: "full",      // limite invisível (1/dia)
    musica:    "sample",
    sonhos:    "sample",
    rotina:    "sample",
    kalm:      "sample",
    brincar:   "sample",
    cinema:    "sample",
    momentos:  "sample",
    memorias:  "sample",
    sos:       "sample",
  },
  kidzz: {
    perguntas: "full",
    historias: "full",
    musica:    "full",
    brincar:   "full",
    memorias:  "full",
    // Áreas exclusivas do Premium: assinante Kidzz vê a MESMA amostra que o usuário Free
    // (nunca menos), com convite elegante para upgrade dentro da própria tela.
    sonhos:    "sample",
    rotina:    "sample",
    momentos:  "sample",
    kalm:      "sample",
    sos:       "sample",
    cinema:    "sample",
  },
  premium: {
    perguntas: "full",
    historias: "full",
    musica:    "full",
    brincar:   "full",
    memorias:  "full",
    sonhos:    "full",
    rotina:    "full",
    momentos:  "full",
    kalm:      "full",
    sos:       "full",
    cinema:    "full",
  },
};

/**
 * Limites diários. NUNCA exibir números dos planos pagos na UI.
 * Os números são tetos invisíveis que sinalizam "Kidzz sonolento".
 */
export const DAILY_LIMITS: Record<Plan, { perguntas: number; historias: number }> = {
  free:    { perguntas: 2,  historias: 1 },
  kidzz:   { perguntas: 10, historias: 5 },
  premium: { perguntas: 10, historias: 5 },
};

/** Plano mínimo necessário para acessar uma área completamente. */
export function minPlanFor(area: Area): Plan {
  if (PLAN_ACCESS.kidzz[area] === "full") return "kidzz";
  if (PLAN_ACCESS.premium[area] === "full") return "premium";
  return "premium";
}

export function planLabel(plan: Plan): string {
  if (plan === "kidzz") return "Kidzz";
  if (plan === "premium") return "Premium";
  return "Grátis";
}

/** Texto convidativo do cadeado por área. */
export function gateMessage(area: Area, childName: string): { title: string; body: string } {
  const min = minPlanFor(area);
  const planName = planLabel(min);
  const nome = childName?.trim() || "seu pequeno";
  return {
    title: `Essa parte é do plano ${planName}`,
    body: `Que tal dar ao ${nome} a experiência completa? ✨`,
  };
}

/** Áreas que envolvem geração de IA com limite diário. */
export type QuotaTipo = "perguntas" | "historias";
