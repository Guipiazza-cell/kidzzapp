import { useEffect, useMemo, useState } from "react";
import chameleonHappy from "@/assets/chameleon-happy.png";

interface SplashScreenProps {
  onFinish?: () => void;
  /** Total visible duration in ms (excluding fade-out). Default 2500ms */
  duration?: number;
}

const PARTICLE_COLORS = ["#FFD700", "#FF8C00", "#7C3AED", "#4CAF50"];

const SplashScreen = ({ onFinish, duration = 2500 }: SplashScreenProps) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

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
    }, duration + 300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onFinish]);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #FFF9F0 0%, #F5E6CC 55%, #E8D5B7 100%)",
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
            className="absolute inset-0 -z-10 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,140,0,0.55) 0%, rgba(255,215,0,0.25) 45%, transparent 75%)",
              animation: "splash-glow-pulse 2.4s ease-in-out infinite",
            }}
          />
          <div style={{ animation: "splash-float 2s ease-in-out infinite 600ms" }}>
            <img
              src={chameleonHappy}
              alt="KIDZZ"
              className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-[0_10px_24px_rgba(255,140,0,0.45)]"
              decoding="async"
              loading="eager"
            />
          </div>
        </div>

        {/* Logo */}
        <h1
          style={{
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontWeight: 900,
            color: "#FF8C00",
            fontSize: "32px",
            letterSpacing: "2px",
            marginTop: "24px",
            textShadow: "0 2px 8px rgba(255,140,0,0.25)",
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

      {/* Progress bar */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[70%] max-w-xs"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 48px)" }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            height: "16px",
            borderRadius: "8px",
            backgroundColor: "#E5E7EB",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: "8px",
              background:
                "linear-gradient(90deg, #FF8C00 0%, #FFB347 50%, #FFD700 100%)",
              // Sync progress bar exactly with `duration` so it reaches 100% the
              // moment the fade-out begins.
              animation: `splash-progress ${duration}ms ease-out forwards`,
              boxShadow: "0 0 10px rgba(255,180,0,0.55)",
            }}
          />
          {/* Twinkling stars inside the bar */}
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{
                  fontSize: "10px",
                  color: "#FFFFFF",
                  textShadow: "0 0 4px rgba(255,255,255,0.9)",
                  animation: `splash-star-twinkle 1.2s ease-in-out ${i * 0.18}s infinite`,
                }}
              >
                ✨
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
