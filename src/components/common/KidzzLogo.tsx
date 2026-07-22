/**
 * Logo oficial KIDZZ (wordmark glass) — usar em todo o site.
 * Asset: /exemplos/assets/brand/kidzz-wordmark-alpha.png
 */
import type { CSSProperties } from "react";

export const KIDZZ_LOGO_SRC = "/exemplos/assets/brand/kidzz-wordmark-alpha.png";
export const KIDZZ_GUI_SRC = "/exemplos/assets/brand/gui-cutout-alpha.png";

type Props = {
  /** Altura em px (largura escala automático). Default 34. */
  height?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  /** Se true, sem sombra extra (telas claras). */
  light?: boolean;
};

const KidzzLogo = ({ height = 34, className, style, alt = "KIDZZ", light }: Props) => (
  <img
    src={KIDZZ_LOGO_SRC}
    alt={alt}
    draggable={false}
    className={className}
    style={{
      height,
      width: "auto",
      maxWidth: "100%",
      objectFit: "contain",
      display: "block",
      userSelect: "none",
      filter: light
        ? "drop-shadow(0 1px 2px rgba(40,70,30,.18))"
        : "drop-shadow(0 2px 10px rgba(0,0,0,.35)) drop-shadow(0 1px 0 rgba(255,255,255,.15))",
      ...style,
    }}
  />
);

export default KidzzLogo;
