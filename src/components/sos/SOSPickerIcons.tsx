/** Ícones premium animados do seletor SOS — estilo 3D glossy (sem emoji). */

import type { ReactElement, ReactNode } from "react";

type IconProps = { className?: string };

const bounce = {
  animation: "sosIconFloat 2.8s ease-in-out infinite",
} as const;

const sparkle = {
  animation: "sosIconSparkle 2.2s ease-in-out infinite",
} as const;

/** Keyframes injetados uma vez (id estável) */
function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById("sos-icon-keyframes")) return;
  const style = document.createElement("style");
  style.id = "sos-icon-keyframes";
  style.textContent = `
    @keyframes sosIconFloat {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-3px) scale(1.04); }
    }
    @keyframes sosIconSparkle {
      0%, 100% { opacity: 0.35; transform: scale(0.75) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.15) rotate(12deg); }
    }
    @keyframes sosIconPulse {
      0%, 100% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.06); filter: brightness(1.08); }
    }
    @keyframes sosIconWiggle {
      0%, 100% { transform: rotate(-4deg); }
      50% { transform: rotate(5deg); }
    }
  `;
  document.head.appendChild(style);
}

function Shell({
  children,
  from,
  mid,
  to,
  className = "",
}: {
  children: ReactNode;
  from: string;
  mid: string;
  to: string;
  className?: string;
}) {
  ensureKeyframes();
  return (
    <div
      className={`relative flex h-[58px] w-[58px] items-center justify-center ${className}`}
      style={{
        borderRadius: 18,
        background: `radial-gradient(130% 130% at 28% 18%, #FFFFFF 0%, ${from} 22%, ${mid} 58%, ${to} 100%)`,
        boxShadow:
          "0 10px 20px rgba(0,0,0,0.14), inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -6px 12px rgba(0,0,0,0.12)",
        ...bounce,
      }}
      aria-hidden
    >
      {/* gloss */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.55) 0%, transparent 42%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function Star({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <span
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 6,
        height: 6,
        ...sparkle,
        animationDelay: `${delay}s`,
      }}
    >
      <svg viewBox="0 0 12 12" width="6" height="6">
        <path
          d="M6 0l1.2 4.2L12 6l-4.8 1.8L6 12l-1.2-4.2L0 6l4.8-1.8L6 0Z"
          fill="#fff"
          opacity="0.95"
        />
      </svg>
    </span>
  );
}

export function IconCrying({ className }: IconProps) {
  return (
    <Shell from="#FFD0D6" mid="#FF6B7C" to="#D93A55" className={className}>
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="heartBreak" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#FFE4E8" />
            </linearGradient>
          </defs>
          <path
            d="M15 20c0-4 3-7 7-5.5C24 12 28 14 28 20c0 7-8 13-10 14.5C16 33 15 27 15 20Z"
            fill="url(#heartBreak)"
            style={{ animation: "sosIconPulse 2.4s ease-in-out infinite" }}
          />
          <path
            d="M33 20c0-4-3-7-7-5.5C24 12 20 14 20 20c0 7 8 13 10 14.5C32 33 33 27 33 20Z"
            fill="url(#heartBreak)"
            style={{ animation: "sosIconPulse 2.4s ease-in-out infinite 0.12s" }}
          />
          <path d="M24 18v16" stroke="#E23B4E" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        </svg>
        <Star x={2} y={2} delay={0} />
        <Star x={28} y={4} delay={0.4} />
        <Star x={26} y={26} delay={0.8} />
      </div>
    </Shell>
  );
}

export function IconTantrum({ className }: IconProps) {
  return (
    <Shell from="#FFE9B0" mid="#F5B03A" to="#D88810" className={className}>
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <ellipse cx="24" cy="28" rx="12" ry="8" fill="#5B6578" />
          <path d="M14 26c2-8 6-12 10-12s8 4 10 12" fill="#6B758A" />
          <path
            d="M24 14c1 4 4 7 8 8-3 1-5 4-6 8-1-4-4-7-8-8 3-1 5-4 6-8Z"
            fill="#FFD66B"
            style={{ animation: "sosIconWiggle 1.8s ease-in-out infinite" }}
          />
          <path d="M22 30h4" stroke="#FFD66B" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <Star x={4} y={6} delay={0.2} />
        <Star x={28} y={8} delay={0.7} />
      </div>
    </Shell>
  );
}

export function IconSleep({ className }: IconProps) {
  return (
    <Shell from="#E8D4FF" mid="#B388FF" to="#7B4FC4" className={className}>
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <path
            d="M32 14c-1.2 5.5-5.5 9.5-11 10 3 4.5 8.5 6 14 3.5S44 18 40 12c-2 2-5 2.5-8 2Z"
            fill="#FFF6D6"
            style={{ animation: "sosIconPulse 3s ease-in-out infinite" }}
          />
          <circle cx="14" cy="16" r="1.6" fill="#FFF6D6" style={{ ...sparkle, animationDelay: "0.2s" } as any} />
          <circle cx="18" cy="12" r="1.1" fill="#FFF6D6" style={{ ...sparkle, animationDelay: "0.6s" } as any} />
          <circle cx="12" cy="22" r="1" fill="#FFF6D6" style={{ ...sparkle, animationDelay: "1s" } as any} />
        </svg>
      </div>
    </Shell>
  );
}

export function IconFear({ className }: IconProps) {
  return (
    <Shell from="#B8DCFF" mid="#5BA3F0" to="#2F78D0" className={className}>
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 10c-6.5 0-11 4.5-11 11v5c0 1.8-.8 3-1.8 3.8h25.6c-1-.8-1.8-2-1.8-3.8v-5c0-6.5-4.5-11-11-11Z"
            fill="#fff"
            style={{ animation: "sosIconPulse 2.6s ease-in-out infinite" }}
          />
          <circle cx="24" cy="20" r="3.2" fill="#2F78D0" />
          <path d="M18 34h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M24 28v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </svg>
        <Star x={26} y={4} delay={0.3} />
      </div>
    </Shell>
  );
}

export function IconAnxiety({ className }: IconProps) {
  return (
    <Shell from="#B8F0CC" mid="#4FD08A" to="#2A9A58" className={className}>
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 38s-11-7-11-15.5C13 16 18 12 24 17c6-5 11-1 11 5.5C35 31 24 38 24 38Z"
            fill="#fff"
            style={{ animation: "sosIconPulse 2.5s ease-in-out infinite" }}
          />
          <path d="M24 20c0 4-1.5 7-4 9 3 .5 5.5.5 8 0-2.5-2-4-5-4-9Z" fill="#7EE2A8" opacity="0.85" />
        </svg>
        <Star x={6} y={6} delay={0.1} />
        <Star x={28} y={8} delay={0.55} />
      </div>
    </Shell>
  );
}

export function IconExhausted({ className }: IconProps) {
  return (
    <Shell from="#FFE2A8" mid="#F0B04A" to="#C97E18" className={className}>
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <path
            d="M16 30c0-1.5.8-2.5 2-3h14c4 0 7 2.5 7 6s-3 6-7 6H22c-3.5 0-6-2.5-6-5.5V30Z"
            fill="#fff"
          />
          <path
            d="M18 27c1-5 4-8 8-8 1.2 0 2.3.3 3.3.8A6.5 6.5 0 0 1 40 26c0 .7-.1 1.3-.2 2"
            fill="#fff"
            opacity="0.95"
          />
          <path
            d="M28 16c.5-2 2-3.5 4-3.5"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
            style={{ animation: "sosIconWiggle 2.4s ease-in-out infinite" }}
          />
          <ellipse cx="30" cy="22" rx="1.4" ry="1" fill="#F0B04A" opacity="0.35" />
        </svg>
        <Star x={8} y={8} delay={0.35} />
      </div>
    </Shell>
  );
}

export function IconOverwhelm({ className }: IconProps) {
  return (
    <Shell from="#DDE1E8" mid="#9AA3B2" to="#6B7280" className={className}>
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 8c2.5 5 7 9 12 10-4 1.2-7 5-8 10-1.2-5-5-9-10-10 4-1 5.5-5 6-10Z"
            fill="#F3F4F6"
            style={{ animation: "sosIconWiggle 2.2s ease-in-out infinite" }}
          />
          <path
            d="M14 22c1.8 3.5 5 6 8.5 7-2.5 1-4.2 3.5-5 6.5-1.2-3-3.5-5.5-7-6.5 2.2-.8 3-3 3.5-7Z"
            fill="#E5E7EB"
            style={{ animation: "sosIconWiggle 2.2s ease-in-out infinite 0.15s" }}
          />
          <path
            d="M32 24c1.4 2.8 3.8 4.6 6.5 5.4-1.8.7-3.2 2.8-3.8 5.6-.9-2.8-2.8-4.6-5.6-5.4 1.8-.7 2.2-2.8 2.9-5.6Z"
            fill="#F9FAFB"
            opacity="0.9"
          />
        </svg>
        <Star x={4} y={10} delay={0.25} />
        <Star x={28} y={6} delay={0.7} />
      </div>
    </Shell>
  );
}

export function IconLost({ className }: IconProps) {
  return (
    <Shell from="#D4F0A8" mid="#8BC34A" to="#5A9A28" className={className}>
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="13" fill="#fff" />
          <circle cx="24" cy="24" r="10" fill="none" stroke="#8BC34A" strokeWidth="1.5" opacity="0.35" />
          <path
            d="M24 16v9"
            stroke="#5A9A28"
            strokeWidth="2.6"
            strokeLinecap="round"
            style={{ animation: "sosIconPulse 2s ease-in-out infinite", transformOrigin: "24px 25px" }}
          />
          <path d="M24 16l5 3.5M24 16l-5 3.5" stroke="#5A9A28" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="32" r="1.8" fill="#5A9A28" />
        </svg>
        <Star x={6} y={6} delay={0.15} />
        <Star x={28} y={8} delay={0.6} />
      </div>
    </Shell>
  );
}

export const SOS_PICKER_ICONS: Record<string, () => ReactElement> = {
  crying: () => <IconCrying />,
  tantrum: () => <IconTantrum />,
  sleep: () => <IconSleep />,
  fear: () => <IconFear />,
  anxiety: () => <IconAnxiety />,
  exhausted: () => <IconExhausted />,
  overwhelm: () => <IconOverwhelm />,
  lost: () => <IconLost />,
};

export type SosCardVisual = {
  badge: string;
  badgeTone: "pink" | "amber" | "violet" | "blue" | "green" | "orange" | "slate" | "lime";
  subtitle: string;
  cta: string;
  gradient: string;
  titleColor: string;
  subColor: string;
  ctaBg: string;
  ctaColor: string;
};

export const SOS_CARD_VISUAL: Record<string, SosCardVisual> = {
  crying: {
    badge: "Recomendada agora",
    badgeTone: "pink",
    subtitle: "Acolhimento imediato",
    cta: "Quero ajuda",
    gradient: "linear-gradient(155deg, #FF8A9A 0%, #F2556D 55%, #D93A55 100%)",
    titleColor: "#fff",
    subColor: "rgba(255,255,255,0.88)",
    ctaBg: "rgba(255,255,255,0.95)",
    ctaColor: "#C42B45",
  },
  tantrum: {
    badge: "Mais utilizada",
    badgeTone: "amber",
    subtitle: "Estratégias que funcionam",
    cta: "Ver como agir",
    gradient: "linear-gradient(155deg, #FFD07A 0%, #F5A623 55%, #E08A10 100%)",
    titleColor: "#fff",
    subColor: "rgba(255,255,255,0.9)",
    ctaBg: "rgba(255,255,255,0.95)",
    ctaColor: "#A65F00",
  },
  sleep: {
    badge: "Ajuda rápida",
    badgeTone: "violet",
    subtitle: "Noites mais tranquilas",
    cta: "Quero ajuda",
    gradient: "linear-gradient(155deg, #C9A0FF 0%, #9B6BDB 55%, #7A4FC0 100%)",
    titleColor: "#fff",
    subColor: "rgba(255,255,255,0.9)",
    ctaBg: "rgba(255,255,255,0.95)",
    ctaColor: "#6B3FA0",
  },
  fear: {
    badge: "Comece por aqui",
    badgeTone: "blue",
    subtitle: "Segurança e acolhimento",
    cta: "Ver como agir",
    gradient: "linear-gradient(155deg, #8EC5FF 0%, #4A9AEE 55%, #2F78D0 100%)",
    titleColor: "#fff",
    subColor: "rgba(255,255,255,0.9)",
    ctaBg: "rgba(255,255,255,0.95)",
    ctaColor: "#1F5FA8",
  },
  anxiety: {
    badge: "Ajuda rápida",
    badgeTone: "green",
    subtitle: "Equilíbrio emocional",
    cta: "Quero ajuda",
    gradient: "linear-gradient(155deg, #7EE2A8 0%, #3DBF72 55%, #2A9A58 100%)",
    titleColor: "#fff",
    subColor: "rgba(255,255,255,0.9)",
    ctaBg: "rgba(255,255,255,0.95)",
    ctaColor: "#1F7A45",
  },
  exhausted: {
    badge: "Para você, também",
    badgeTone: "orange",
    subtitle: "Cuidado para quem cuida",
    cta: "Quero ajuda",
    gradient: "linear-gradient(155deg, #FFC878 0%, #E9A03A 55%, #C97E18 100%)",
    titleColor: "#fff",
    subColor: "rgba(255,255,255,0.9)",
    ctaBg: "rgba(255,255,255,0.95)",
    ctaColor: "#8A5508",
  },
  overwhelm: {
    badge: "Ajuda rápida",
    badgeTone: "slate",
    subtitle: "Organize e respire",
    cta: "Ver como agir",
    gradient: "linear-gradient(155deg, #C5CAD3 0%, #8B93A0 55%, #6B7280 100%)",
    titleColor: "#fff",
    subColor: "rgba(255,255,255,0.9)",
    ctaBg: "rgba(255,255,255,0.95)",
    ctaColor: "#4B5563",
  },
  lost: {
    badge: "Orientação",
    badgeTone: "lime",
    subtitle: "Orientação personalizada",
    cta: "Quero ajuda",
    gradient: "linear-gradient(155deg, #C6E89A 0%, #8BC34A 55%, #689F38 100%)",
    titleColor: "#fff",
    subColor: "rgba(255,255,255,0.92)",
    ctaBg: "rgba(255,255,255,0.95)",
    ctaColor: "#4A7A1F",
  },
};
