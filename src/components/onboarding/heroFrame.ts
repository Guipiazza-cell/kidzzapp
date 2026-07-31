/** Padrão visual full-bleed das telas de onboarding com arte de fundo.
 *  Phone: crop vertical da arte 9:16.
 *  Tablet+: stage no máximo 430px (coluna celular) + enquadramento sem scale agressivo.
 */

/** Classe CSS aplicada na <img> do hero (ver ONBOARDING_HERO_CSS). */
export const ONBOARDING_HERO_CLASS = "kidzz-onb-hero";

/** @deprecated Prefer ONBOARDING_HERO_CLASS + CSS — mantido p/ fallback inline mínimo */
export const ONBOARDING_HERO_FRAME = {
  objectFit: "cover" as const,
  objectPosition: "50% 10%",
  width: "100%",
  height: "100%",
};

/** Painel de vidro inferior (form / opções) */
export const ONBOARDING_GLASS_PANEL = {
  background: "rgba(255, 250, 240, 0.32)",
  backdropFilter: "blur(22px) saturate(1.25)",
  WebkitBackdropFilter: "blur(22px) saturate(1.25)",
  border: "1px solid rgba(255,255,255,0.45)",
  boxShadow:
    "0 14px 36px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.5)",
} as const;

/**
 * CSS do hero de onboarding.
 * - Mobile: leve scale/translate (arte phone ~9:19)
 * - Tablet/iPad: coluna ~celular (430px) centralizada — evita esticar
 *   a arte full-bleed (logo gigante + Gui miúdo no iPad)
 */
export const ONBOARDING_HERO_CSS = `
.kidzz-onb-shell {
  background: #0B1A12;
}
.kidzz-onb-stage {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  overflow: hidden;
  background: #0B1A12;
  isolation: isolate;
}
.kidzz-onb-hero {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 8%;
  transform: scale(1.06) translateY(-8%);
  transform-origin: center top;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}
/* Tablet / iPad / desktop — frame de celular no centro */
@media (min-width: 768px) {
  .kidzz-onb-shell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    box-sizing: border-box;
    background:
      radial-gradient(ellipse 80% 60% at 50% 40%, #0f2a1c 0%, #06140e 70%);
  }
  .kidzz-onb-stage {
    width: min(100%, 430px);
    height: min(100%, 932px);
    max-width: 430px;
    max-height: calc(100dvh - 24px);
    border-radius: 28px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.08),
      0 28px 72px rgba(0,0,0,0.55);
  }
  .kidzz-onb-hero {
    object-position: 50% 12%;
    transform: none;
    transform-origin: center center;
  }
}
/* Landscape tablet / laptop baixo: stage um pouco mais largo */
@media (min-width: 900px) and (max-height: 720px) {
  .kidzz-onb-stage {
    width: min(100%, 480px);
    max-width: 480px;
    height: min(100%, calc(100dvh - 16px));
    max-height: calc(100dvh - 16px);
    border-radius: 20px;
  }
  .kidzz-onb-hero {
    object-position: 50% 22%;
  }
}
`;
