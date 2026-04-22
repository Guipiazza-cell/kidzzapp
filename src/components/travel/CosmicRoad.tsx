import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Estrada cósmica infantil — fundo vivo com:
 * - gradiente espacial (índigo → roxo → magenta)
 * - estrelas passando (parallax 3 camadas)
 * - linhas de "estrada" cósmica fugindo no horizonte
 * - planetas e luas decorativas flutuando
 * Performance: tudo CSS/SVG + framer-motion (sem canvas).
 */
const CosmicRoad = ({ children }: { children?: React.ReactNode }) => {
  const farStars = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 4,
    })),
    []
  );

  const midStars = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 3,
      size: Math.random() * 2 + 1.5,
    })),
    []
  );

  const closeStars = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 1.4 + Math.random() * 0.8,
      delay: Math.random() * 1.5,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradiente cósmico de base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, hsl(280 70% 25%) 0%, hsl(250 60% 15%) 35%, hsl(230 65% 8%) 70%, hsl(220 70% 4%) 100%)",
        }}
      />

      {/* Aurora suave no topo */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, hsl(290 80% 50% / 0.25), transparent 60%), radial-gradient(ellipse at 80% 10%, hsl(200 90% 55% / 0.18), transparent 55%)",
        }}
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Estrelas distantes — pulsam */}
      {farStars.map((s) => (
        <motion.div
          key={`f${s.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            boxShadow: "0 0 4px hsl(0 0% 100% / 0.6)",
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: s.delay }}
        />
      ))}

      {/* Estrelas médias — caem (parallax meio) */}
      {midStars.map((s) => (
        <motion.div
          key={`m${s.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            boxShadow: "0 0 6px hsl(50 100% 80% / 0.8)",
          }}
          initial={{ top: "-5%", opacity: 0 }}
          animate={{ top: "110%", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Estrelas próximas — riscam rápido (parallax frente) */}
      {closeStars.map((s) => (
        <motion.div
          key={`c${s.id}`}
          className="absolute"
          style={{
            left: `${s.left}%`,
            width: 2,
            height: 14,
            background:
              "linear-gradient(180deg, transparent, hsl(50 100% 85% / 0.95), transparent)",
            borderRadius: 4,
          }}
          initial={{ top: "-10%", opacity: 0 }}
          animate={{ top: "115%", opacity: [0, 1, 0] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Estrada cósmica — linhas fugindo no horizonte */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        width="120%"
        height="60%"
        viewBox="0 0 800 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="roadGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(290 90% 70%)" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(290 90% 70%)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="roadGlow2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(200 90% 65%)" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(200 90% 65%)" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Linhas laterais da "estrada" */}
        <path d="M 380 200 L 100 600 Z" stroke="url(#roadGlow)" strokeWidth="3" fill="none" />
        <path d="M 420 200 L 700 600 Z" stroke="url(#roadGlow)" strokeWidth="3" fill="none" />

        {/* Linhas centrais animadas */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.rect
            key={i}
            x="395"
            width="10"
            height="20"
            rx="2"
            fill="url(#roadGlow2)"
            initial={{ y: 220 + i * 60, opacity: 0 }}
            animate={{ y: 600, opacity: [0, 1, 0] }}
            transition={{
              duration: 1.6,
              delay: i * 0.32,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>

      {/* Planetas decorativos */}
      <motion.div
        className="absolute top-[15%] right-[8%] w-12 h-12 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, hsl(30 90% 70%), hsl(15 80% 45%) 60%, hsl(10 70% 30%) 100%)",
          boxShadow: "0 0 24px hsl(30 90% 60% / 0.4), inset -6px -6px 0 hsl(15 80% 30% / 0.5)",
        }}
        animate={{ y: [0, -8, 0], rotate: 360 }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
        }}
      />

      <motion.div
        className="absolute top-[28%] left-[10%] w-7 h-7 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, hsl(220 60% 85%), hsl(220 30% 60%) 70%, hsl(220 30% 40%) 100%)",
          boxShadow: "0 0 14px hsl(220 60% 75% / 0.5)",
        }}
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />

      {/* Anel de planeta */}
      <motion.div
        className="absolute top-[45%] right-[14%] pointer-events-none"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-9 h-9 rounded-full relative"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, hsl(280 70% 75%), hsl(280 60% 45%) 70%)",
            boxShadow: "0 0 18px hsl(280 70% 60% / 0.5)",
          }}
        >
          <div
            className="absolute -inset-x-3 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(280 60% 70% / 0.7), transparent)",
              transform: "translateY(-50%) rotate(-18deg)",
            }}
          />
        </div>
      </motion.div>

      {children}
    </div>
  );
};

export default CosmicRoad;
