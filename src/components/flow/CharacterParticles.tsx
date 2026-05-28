import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  distance: number;
}

const COLORS = ["#FFD700", "#FFA500", "#FF69B4", "#87CEEB", "#98FB98", "#DDA0DD"];

let particleId = 0;

export const useCharacterParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const burst = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const newParticles: Particle[] = Array.from({ length: 12 }, () => {
      particleId++;
      return {
        id: particleId,
        x: cx,
        y: cy,
        size: 4 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        angle: Math.random() * 360,
        distance: 30 + Math.random() * 50,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 800);
  }, []);

  return { particles, burst };
};

interface Props {
  particles: Particle[];
}

const CharacterParticles = ({ particles }: Props) => (
  <div className="fixed inset-0 pointer-events-none z-[65]">
    <AnimatePresence>
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 0], x: tx, y: ty, opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        );
      })}
    </AnimatePresence>
  </div>
);

export default CharacterParticles;
