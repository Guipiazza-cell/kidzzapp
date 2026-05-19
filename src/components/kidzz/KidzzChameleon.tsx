/* ── KIDZZ Chameleon — Personagem único, 4 estados, morph vivo ──
   Cosmic (Perguntas) | Moon (Sonhos) | Explorer (Histórias/Viagem) | Music (futuro)
   - Crossfade morph 600ms entre estados
   - Micro animações: idle breathing, blink, tail curl, particles, heart pulse
   - Touch reactive: olho segue toque, tap = bounce + ripple
*/

import { forwardRef, memo, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import cosmicImg from "@/assets/kidzz/cosmic.webp";
import moonImg from "@/assets/kidzz/moon.webp";
import explorerImg from "@/assets/kidzz/explorer.webp";
import musicImg from "@/assets/kidzz/music.webp";

export type KidzzState = "cosmic" | "moon" | "explorer" | "music" | "play";
export type KidzzMood = "idle" | "curious" | "calm" | "guide" | "happy" | "talking" | "thinking";

interface KidzzChameleonProps {
  state?: KidzzState;
  mood?: KidzzMood;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  interactive?: boolean;
  showParticles?: boolean;
  onTap?: () => void;
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-28 h-28",
  lg: "w-40 h-40",
  xl: "w-56 h-56",
  hero: "w-72 h-72",
};

const glowMap = {
  sm: "w-24 h-24",
  md: "w-40 h-40",
  lg: "w-56 h-56",
  xl: "w-72 h-72",
  hero: "w-96 h-96",
};

const stateAssets: Record<KidzzState, string> = {
  cosmic: cosmicImg,
  moon: moonImg,
  explorer: explorerImg,
  music: musicImg,
  // "play" usa o mesmo asset aventureiro do explorer (já é verde/laranja vibrante)
  play: explorerImg,
};

const stateImageFilter: Partial<Record<KidzzState, string>> = {};

const stateGlow: Record<KidzzState, string> = {
  cosmic: "radial-gradient(circle, hsl(220 80% 65% / 0.45), transparent 70%)",
  moon: "radial-gradient(circle, hsl(265 70% 70% / 0.4), transparent 70%)",
  explorer: "radial-gradient(circle, hsl(45 90% 60% / 0.45), transparent 70%)",
  music: "radial-gradient(circle, hsl(35 90% 60% / 0.5), transparent 70%)",
  play: "radial-gradient(circle, hsl(140 75% 55% / 0.5), transparent 70%)",
};

const stateParticleColors: Record<KidzzState, string[]> = {
  cosmic: ["#7BB6FF", "#FFE48A", "#C5A8FF", "#FFFFFF"],
  moon: ["#C5A8FF", "#E0CCFF", "#FFE48A", "#FFFFFF"],
  explorer: ["#FFD86E", "#FF9A6E", "#9EE493", "#FFFFFF"],
  music: ["#FFD86E", "#FF9ECF", "#7BC5FF", "#FFFFFF"],
  play: ["#7CE495", "#FFE48A", "#9EE493", "#FFFFFF"],
};

const KidzzChameleon = forwardRef<HTMLDivElement, KidzzChameleonProps>(
  (
    {
      state = "cosmic",
      mood = "idle",
      size = "lg",
      className = "",
      interactive = true,
      showParticles = true,
      onTap,
    },
    ref
  ) => {
    const [bouncing, setBouncing] = useState(false);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Eye-follow touch/cursor
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const eyeX = useSpring(useTransform(mx, [-1, 1], [-3, 3]), { stiffness: 120, damping: 18 });
    const eyeY = useSpring(useTransform(my, [-1, 1], [-2, 2]), { stiffness: 120, damping: 18 });

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!interactive || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        mx.set(Math.max(-1, Math.min(1, dx)));
        my.set(Math.max(-1, Math.min(1, dy)));
      },
      [interactive, mx, my]
    );

    const handleTap = useCallback(
      (e: React.PointerEvent) => {
        if (!interactive) return;
        setBouncing(true);
        setTimeout(() => setBouncing(false), 500);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const id = Date.now();
          setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
          setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 800);
        }
        onTap?.();
      },
      [interactive, onTap]
    );

    // Idle breathing
    const breathe =
      mood === "calm"
        ? { scale: [1, 1.04, 1], y: [0, -3, 0] }
        : mood === "happy"
        ? { scale: [1, 1.06, 1], y: [0, -10, 0], rotate: [0, -3, 3, 0] }
        : mood === "talking"
        ? { y: [0, -8, 0], rotate: [0, -2, 2, 0] }
        : mood === "thinking"
        ? { y: [0, -3, 0], rotate: [0, 2, 0] }
        : { scale: [1, 1.02, 1], y: [0, -5, 0] };

    const breatheT =
      mood === "calm"
        ? { duration: 5, repeat: Infinity, ease: "easeInOut" as const }
        : mood === "happy"
        ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const }
        : mood === "talking"
        ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" as const }
        : { duration: 3.4, repeat: Infinity, ease: "easeInOut" as const };

    const particleColors = stateParticleColors[state];

    return (
      <motion.div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node as HTMLDivElement);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={`relative ${sizeMap[size]} ${className} select-none`}
        animate={bouncing ? { scale: [1, 0.92, 1.08, 1] } : breathe}
        transition={bouncing ? { duration: 0.5, ease: "easeOut" } : breatheT}
        onPointerMove={handlePointerMove}
        onPointerDown={handleTap}
        style={{ touchAction: "manipulation" }}
      >
        {/* Ambient glow — single layer, gentle pulse */}
        <motion.div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${glowMap[size]} rounded-full pointer-events-none -z-10`}
          style={{ background: stateGlow[state] }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Character image — sem fade-in de mount (evita flicker ao trocar de aba).
            A imagem é pré-decodificada em preloadAssets, então aparece estável já no 1º frame. */}
        <motion.div
          className="absolute inset-0"
          style={{ x: eyeX, y: eyeY }}
        >
          <img
            src={stateAssets[state]}
            alt={`KIDZZ - ${state}`}
            className="w-full h-full object-contain drop-shadow-2xl pointer-events-none"
            draggable={false}
            decoding="async"
            loading="eager"
            style={stateImageFilter[state] ? { filter: stateImageFilter[state] } : undefined}
          />
        </motion.div>


        {/* Heart pulse (always visible since heart is on chest in all states) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[10%] w-1/4 h-1/4 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(45 100% 70% / 0.6), transparent 65%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating particles — reduced count + memoized for mobile perf */}
        {showParticles && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`p-${state}-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 4 + (i % 2) * 2,
                  height: 4 + (i % 2) * 2,
                  background: particleColors[i % particleColors.length],
                  boxShadow: `0 0 6px ${particleColors[i % particleColors.length]}`,
                  top: `${20 + (i * 25) % 70}%`,
                  left: `${10 + (i * 30) % 80}%`,
                  willChange: "transform, opacity",
                }}
                animate={{
                  y: [0, -14, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3.2 + i * 0.6,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}

        {/* Tap ripples */}
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: r.x - 12,
              top: r.y - 12,
              width: 24,
              height: 24,
              background: "radial-gradient(circle, hsl(45 100% 70% / 0.7), transparent 70%)",
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}

        {/* Thinking dots */}
        {mood === "thinking" && (
          <div className="absolute -top-2 right-1 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white shadow-md"
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  }
);

KidzzChameleon.displayName = "KidzzChameleon";

export default KidzzChameleon;
