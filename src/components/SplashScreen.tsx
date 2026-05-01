import { useEffect, useMemo, useState } from "react";
import splashMascot from "@/assets/splash-mascot.png";

interface SplashScreenProps {
  onFinish?: () => void;
  /** Total visible duration in ms (excluding fade-out). Default 1400ms */
  duration?: number;
}

const PARTICLE_COLORS = ["#FFD700", "#FF8C00", "#7C3AED", "#4CAF50"];
const LOADING_LABELS = ["Acordando o Kidzz…", "Pintando a floresta…", "Pronto pra brincar! ✨"];

const SplashScreen = ({ onFinish, duration = 1400 }: SplashScreenProps) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [labelIdx, setLabelIdx] = useState(0);

  // Generate stable randomized particles once.
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        size: 4 + Math.random() * 8,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 4,
      })),
    []
  );

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), duration);
    const doneTimer = setTimeout(() => {
      setHidden(true);
      onFinish?.();
    }, duration + 250);
    // Rotate the loading label in sync with the progress bar phases.
    const stepMs = Math.max(220, Math.floor(duration / LOADING_LABELS.length));
    const labelTimer = setInterval(() => {
      setLabelIdx((i) => Math.min(LOADING_LABELS.length - 1, i + 1));
    }, stepMs);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      clearInterval(labelTimer);
    };
  }, [duration, onFinish]);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #FBF5EB 0%, #F5E6C8 100%)",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 300ms ease-out",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Inline keyframes (kept self-contained so splash works before app CSS hydrates) */}
      <style>{`
        @keyframes splash-mascot-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splash-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes splash-fade-up {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-particle {
          0% { transform: translate(0,0) scale(0.8); opacity: 0; }
          25% { opacity: 0.9; }
          50% { transform: translate(6px,-14px) scale(1.1); opacity: 0.6; }
          75% { opacity: 0.8; }
          100% { transform: translate(-6px,-28px) scale(0.9); opacity: 0; }
        }
        @keyframes splash-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes splash-star-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes splash-glow-pulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes splash-shimmer {
          0% { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        @keyframes splash-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes splash-label-in {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 1.6}px ${p.color}`,
              opacity: 0,
              animation: `splash-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Mascot + glow */}
      <div className="relative flex flex-col items-center">
        <div
          className="relative"
          style={{
            animation:
              "splash-mascot-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
        >
          <div
            className="absolute inset-0 -z-10 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,120,0.45) 0%, rgba(232,130,26,0.18) 50%, transparent 78%)",
              animation: "splash-glow-pulse 2.4s ease-in-out infinite",
            }}
          />
          <div style={{ animation: "splash-float 2s ease-in-out infinite 600ms" }}>
            {imgFailed ? (
              // Graceful fallback: a stylized mascot circle that keeps the splash
              // visually intact even if the asset fails to load.
              <div
                role="img"
                aria-label="KIDZZ"
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center drop-shadow-[0_10px_24px_rgba(255,140,0,0.45)]"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #FFE08A 0%, #FF8C00 60%, #C2410C 100%)",
                  boxShadow: "inset 0 -8px 18px rgba(0,0,0,0.15), 0 8px 24px rgba(255,140,0,0.35)",
                }}
              >
                <span style={{ fontSize: "72px", lineHeight: 1 }}>🦎</span>
              </div>
            ) : (
              <img
                src={splashMascot}
                alt="KIDZZ"
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
                style={{
                  background: "transparent",
                  filter: "drop-shadow(0 18px 28px rgba(232,130,26,0.25)) drop-shadow(0 6px 12px rgba(0,0,0,0.08))",
                }}
                decoding="async"
                loading="eager"
                onError={() => setImgFailed(true)}
              />
            )}
          </div>
        </div>

        {/* Logo */}
        <h1
          style={{
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontWeight: 900,
            color: "#E8821A",
            fontSize: "34px",
            letterSpacing: "2px",
            marginTop: "24px",
            textShadow: "0 2px 8px rgba(232,130,26,0.18)",
            opacity: 0,
            animation: "splash-fade-up 500ms ease-out 400ms forwards",
          }}
        >
          KIDZZAPP
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontWeight: 600,
            color: "#6B7280",
            fontSize: "14px",
            marginTop: "8px",
            opacity: 0,
            animation: "splash-fade-up 500ms ease-out 700ms forwards",
          }}
        >
          Aprender nunca foi tão divertido ✨
        </p>
      </div>

      {/* Progress bar + microinterações */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[72%] max-w-xs flex flex-col items-center gap-3"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 44px)" }}
      >
        {/* Track */}
        <div
          className="relative overflow-hidden w-full"
          style={{
            height: "10px",
            borderRadius: "999px",
            backgroundColor: "rgba(232, 130, 26, 0.12)",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "999px",
              background:
                "linear-gradient(90deg, #E8821A 0%, #FFB347 55%, #FFD66B 100%)",
              animation: `splash-progress ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              boxShadow: "0 0 12px rgba(232,130,26,0.45)",
              transformOrigin: "left center",
            }}
          />
          {/* Shimmer overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "40%",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)",
              animation: "splash-shimmer 1.1s ease-in-out infinite",
              pointerEvents: "none",
              mixBlendMode: "overlay",
            }}
          />
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "999px",
                backgroundColor: "#E8821A",
                display: "inline-block",
                animation: `splash-dot-bounce 0.9s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Dynamic loading label */}
        <p
          key={labelIdx}
          style={{
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            color: "#8A6A3D",
            letterSpacing: "0.2px",
            margin: 0,
            animation: "splash-label-in 320ms ease-out both",
          }}
        >
          {LOADING_LABELS[labelIdx]}
        </p>
      </div>
      </div>
    </div>
  );
};

export default SplashScreen;
