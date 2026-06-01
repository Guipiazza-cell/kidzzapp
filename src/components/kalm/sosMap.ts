/**
 * Mapeamento SOS → KALM.
 * Ao fim do fluxo SOS, abre direto a experiência relacionada (não a home).
 */
export const SOS_TO_KALM: Record<string, string> = {
  crying:    "reconnect-after-conflict", // recuperação emocional
  tantrum:   "too-much",                  // recuperação pós-birra
  sleep:     "journey-7-nights",          // ritual do sono
  fear:      "journey-courage",           // construindo coragem
  exhausted: "parent-pause",              // pausa dos pais
  overwhelm: "wind-down",                 // reduzindo o ruído
  anxiety:   "breathe-wind",
  lost:      "five-min-together",
};

export const kalmTargetFor = (situationId: string): string =>
  SOS_TO_KALM[situationId] ?? "pause-1min";
