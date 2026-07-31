/** Ícones premium do “Tempo de hoje” (KALM) - sem emoji. */

import type { ReactElement } from "react";

type Props = { active?: boolean; color: string; className?: string };

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById("kalm-weather-kf")) return;
  const s = document.createElement("style");
  s.id = "kalm-weather-kf";
  s.textContent = `
    @keyframes kw-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
    @keyframes kw-spin-slow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    @keyframes kw-rain { 0%{transform:translateY(-2px);opacity:.35} 100%{transform:translateY(6px);opacity:.9} }
    @keyframes kw-pulse { 0%,100%{opacity:.55;transform:scale(.92)} 50%{opacity:1;transform:scale(1.08)} }
  `;
  document.head.appendChild(s);
}

export function WeatherSol({ active, color, className = "" }: Props) {
  ensureKeyframes();
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <radialGradient id="kw-sun" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF6C8" />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor="#D49220" />
        </radialGradient>
      </defs>
      <g style={{ transformOrigin: "24px 24px", animation: active ? "kw-spin-slow 12s linear infinite" : undefined }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <rect
            key={deg}
            x="22.5"
            y="3"
            width="3"
            height="7"
            rx="1.5"
            fill={color}
            opacity="0.85"
            transform={`rotate(${deg} 24 24)`}
          />
        ))}
      </g>
      <circle cx="24" cy="24" r="9" fill="url(#kw-sun)" style={{ animation: "kw-float 2.8s ease-in-out infinite" }} />
      <circle cx="21" cy="21" r="2.2" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}

export function WeatherArcoIris({ active, color, className = "" }: Props) {
  ensureKeyframes();
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 48 48" fill="none" aria-hidden
      style={{ animation: active ? "kw-float 2.6s ease-in-out infinite" : undefined }}
    >
      <path d="M8 32a16 16 0 0 1 32 0" stroke="#F0645A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M11 32a13 13 0 0 1 26 0" stroke="#F4A63A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M14 32a10 10 0 0 1 20 0" stroke="#E8D24A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M17 32a7 7 0 0 1 14 0" stroke="#6BCB77" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M20 32a4 4 0 0 1 8 0" stroke="#5BA3F0" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="34" r="2" fill={color} opacity="0.9" style={{ animation: "kw-pulse 2s ease-in-out infinite" }} />
    </svg>
  );
}

export function WeatherNuvem({ active, color, className = "" }: Props) {
  ensureKeyframes();
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 48 48" fill="none" aria-hidden
      style={{ animation: active ? "kw-float 3s ease-in-out infinite" : undefined }}
    >
      <defs>
        <linearGradient id="kw-cloud" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <path
        d="M16 30h18a7 7 0 0 0 1.2-13.9A9 9 0 0 0 18.2 14 7.5 7.5 0 0 0 16 30Z"
        fill="url(#kw-cloud)"
        opacity="0.95"
      />
      <circle cx="18" cy="18" r="1.4" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}

export function WeatherChuva({ active, color, className = "" }: Props) {
  ensureKeyframes();
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M15 22h18a6.5 6.5 0 0 0 1-13A8.5 8.5 0 0 0 17.5 8 7 7 0 0 0 15 22Z"
        fill="#D7E8F5"
        opacity="0.95"
        style={{ animation: active ? "kw-float 2.8s ease-in-out infinite" : undefined }}
      />
      {[16, 22, 28, 34].map((x, i) => (
        <path
          key={x}
          d={`M${x} 26v8`}
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          style={{
            animation: "kw-rain 0.9s ease-in infinite",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </svg>
  );
}

export function WeatherTempestade({ active, color, className = "" }: Props) {
  ensureKeyframes();
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M14 20h18a6.5 6.5 0 0 0 .8-12.8A8.5 8.5 0 0 0 16.5 6 7 7 0 0 0 14 20Z"
        fill="#C9C2E8"
        opacity="0.95"
        style={{ animation: active ? "kw-float 2.4s ease-in-out infinite" : undefined }}
      />
      <path
        d="M26 22 20 32h5l-2 10 10-14h-5l3-6H26Z"
        fill="#F4D35E"
        style={{
          filter: active ? "drop-shadow(0 0 4px rgba(244,211,94,.7))" : undefined,
          animation: active ? "kw-pulse 1.2s ease-in-out infinite" : undefined,
        }}
      />
      <path d="M18 28v4M30 30v4" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7"
        style={{ animation: "kw-rain 0.85s ease-in infinite" }}
      />
    </svg>
  );
}

export const WEATHER_ICONS: Record<
  string,
  (p: Props) => ReactElement
> = {
  muito_bem: (p) => <WeatherSol {...p} />,
  bem: (p) => <WeatherArcoIris {...p} />,
  medio: (p) => <WeatherNuvem {...p} />,
  mal: (p) => <WeatherChuva {...p} />,
  muito_mal: (p) => <WeatherTempestade {...p} />,
};
