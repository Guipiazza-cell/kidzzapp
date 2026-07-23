/**
 * Ícone 3D com fallback em cascata (se o asset novo falhar, usa pack da aba).
 */
import { useState, type CSSProperties } from "react";

type Props = {
  src: string;
  fallback?: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  radius?: number;
};

const Icon3D = ({ src, fallback, alt = "", size = 40, className, style, radius = 14 }: Props) => {
  const [i, setI] = useState(0);
  const candidates = [src, fallback].filter(Boolean) as string[];
  const current = candidates[Math.min(i, candidates.length - 1)];

  if (!current) return null;

  return (
    <img
      src={current}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={className}
      onError={() => {
        if (i < candidates.length - 1) setI((n) => n + 1);
      }}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: radius,
        flex: "none",
        display: "block",
        ...style,
      }}
    />
  );
};

export default Icon3D;
