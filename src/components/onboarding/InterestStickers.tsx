/** Figurinhas SVG premium para interesses do onboarding (sem emoji). */

import type { ReactNode } from "react";

type StickerProps = { className?: string; selected?: boolean };

function StickerShell({
  children,
  selected,
  className = "",
  gradientId,
  from,
  to,
}: {
  children: ReactNode;
  selected?: boolean;
  className?: string;
  gradientId: string;
  from: string;
  to: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width="28"
      height="28"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <filter id={`${gradientId}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.22" />
        </filter>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="22"
        fill={`url(#${gradientId})`}
        filter={`url(#${gradientId}-soft)`}
        opacity={selected ? 1 : 0.95}
      />
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.2"
      />
      {children}
    </svg>
  );
}

export function StickerAnimais({ selected, className }: StickerProps) {
  return (
    <StickerShell selected={selected} className={className} gradientId="g-animais" from="#F7B267" to="#E07A3D">
      <ellipse cx="24" cy="28" rx="11" ry="8" fill="#FFF8F0" />
      <circle cx="18" cy="20" r="4.2" fill="#FFF8F0" />
      <circle cx="30" cy="20" r="4.2" fill="#FFF8F0" />
      <circle cx="18" cy="20" r="1.6" fill="#5C3A1E" />
      <circle cx="30" cy="20" r="1.6" fill="#5C3A1E" />
      <ellipse cx="24" cy="29" rx="3.2" ry="2.2" fill="#E8A87C" />
      <path d="M14 14c1.5-3 4-4 6-3M34 14c-1.5-3-4-4-6-3" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" fill="none" />
    </StickerShell>
  );
}

export function StickerEspaco({ selected, className }: StickerProps) {
  return (
    <StickerShell selected={selected} className={className} gradientId="g-espaco" from="#6C8CFF" to="#3B4FD9">
      <path
        d="M14 30c6-10 14-14 22-16-2 8-6 16-16 22-2-4-4-6-6-6z"
        fill="#F4F7FF"
        opacity="0.95"
      />
      <circle cx="30" cy="16" r="2.2" fill="#FFD56A" />
      <circle cx="18" cy="18" r="1.2" fill="#fff" />
      <circle cx="22" cy="14" r="0.9" fill="#fff" />
      <circle cx="33" cy="24" r="1" fill="#fff" />
    </StickerShell>
  );
}

export function StickerArte({ selected, className }: StickerProps) {
  return (
    <StickerShell selected={selected} className={className} gradientId="g-arte" from="#FF8FAB" to="#C44DFF">
      <path d="M16 32c0-8 5-14 10-16 2 6 4 10 6 16H16z" fill="#FFF5FB" />
      <circle cx="22" cy="20" r="2.2" fill="#FF6B6B" />
      <circle cx="27" cy="18" r="2" fill="#FFD93D" />
      <circle cx="30" cy="23" r="2" fill="#6BCB77" />
      <circle cx="25" cy="25" r="1.8" fill="#4D96FF" />
      <rect x="22" y="30" width="5" height="6" rx="1" fill="#E8D5C4" />
    </StickerShell>
  );
}

export function StickerNatureza({ selected, className }: StickerProps) {
  return (
    <StickerShell selected={selected} className={className} gradientId="g-natureza" from="#7DDE92" to="#2F9E44">
      <path d="M24 34V20" stroke="#E8FFE8" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 22c-6-1-9 3-9 7 5 0 8-2 9-4 1 2 4 4 9 4 0-4-3-8-9-7z" fill="#F1FFF4" />
      <path d="M24 18c-4-5-1-9 0-9s4 4 0 9z" fill="#D8FFE0" />
    </StickerShell>
  );
}

export function StickerAventura({ selected, className }: StickerProps) {
  return (
    <StickerShell selected={selected} className={className} gradientId="g-aventura" from="#FFB347" to="#E85D04">
      <path d="M18 14l3 16h6l3-16-6 3-6-3z" fill="#FFF4E5" />
      <path d="M21 30h6v4c0 1.5-1.2 2.5-3 2.5s-3-1-3-2.5v-4z" fill="#FFE0B5" />
      <circle cx="24" cy="20" r="2" fill="#E85D04" opacity="0.35" />
    </StickerShell>
  );
}

export function StickerMusica({ selected, className }: StickerProps) {
  return (
    <StickerShell selected={selected} className={className} gradientId="g-musica" from="#B388FF" to="#7B2CBF">
      <path d="M28 12v14.5a4.5 4.5 0 1 1-2.5-4V16l8-2v10.5a4.5 4.5 0 1 1-2.5-4V12z" fill="#F8F0FF" />
      <circle cx="21.5" cy="30.5" r="3.2" fill="#EAD9FF" />
      <circle cx="31.5" cy="28.5" r="3.2" fill="#EAD9FF" />
    </StickerShell>
  );
}

export function StickerCiencia({ selected, className }: StickerProps) {
  return (
    <StickerShell selected={selected} className={className} gradientId="g-ciencia" from="#64DFDF" to="#0077B6">
      <ellipse cx="24" cy="24" rx="12" ry="5" fill="none" stroke="#E8FBFF" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="12" ry="5" fill="none" stroke="#E8FBFF" strokeWidth="2" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="24" rx="12" ry="5" fill="none" stroke="#E8FBFF" strokeWidth="2" transform="rotate(120 24 24)" />
      <circle cx="24" cy="24" r="3.2" fill="#FFF7AE" />
    </StickerShell>
  );
}

export function StickerOceano({ selected, className }: StickerProps) {
  return (
    <StickerShell selected={selected} className={className} gradientId="g-oceano" from="#48CAE4" to="#023E8A">
      <path
        d="M12 26c3-3 5-3 8 0s5 3 8 0 5-3 8 0"
        fill="none"
        stroke="#E8FBFF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M12 32c3-3 5-3 8 0s5 3 8 0 5-3 8 0"
        fill="none"
        stroke="#E8FBFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="30" cy="18" r="3" fill="#FFF7AE" opacity="0.9" />
    </StickerShell>
  );
}

export const INTEREST_STICKERS: Record<
  string,
  (p: StickerProps) => ReactNode
> = {
  animais: StickerAnimais,
  espaco: StickerEspaco,
  arte: StickerArte,
  natureza: StickerNatureza,
  aventura: StickerAventura,
  musica: StickerMusica,
  ciencia: StickerCiencia,
  oceano: StickerOceano,
};
