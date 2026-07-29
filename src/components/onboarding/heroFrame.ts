/** Padrão visual full-bleed das telas de onboarding com arte de fundo.
 *  Manter IGUAL em Name / Age / Interests / etc.
 */
export const ONBOARDING_HERO_FRAME = {
  objectFit: "cover" as const,
  objectPosition: "50% 28%",
  transform: "scale(1.04) translateY(-3%)",
  transformOrigin: "center center",
};

/** Painel de vidro inferior (form / opções) */
export const ONBOARDING_GLASS_PANEL = {
  background: "rgba(255, 250, 240, 0.28)",
  backdropFilter: "blur(20px) saturate(1.25)",
  WebkitBackdropFilter: "blur(20px) saturate(1.25)",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow:
    "0 14px 36px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.5)",
} as const;
