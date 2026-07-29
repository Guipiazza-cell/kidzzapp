/** Padrão visual full-bleed das telas de onboarding com arte de fundo.
 *  Mesmo alinhamento de altura em Name / Age / Interests.
 */
export const ONBOARDING_HERO_FRAME = {
  objectFit: "cover" as const,
  objectPosition: "50% 4%",
  transform: "scale(1.12) translateY(-18%)",
  transformOrigin: "center top",
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
