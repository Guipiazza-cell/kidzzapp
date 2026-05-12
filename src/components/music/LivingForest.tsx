import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Floresta Viva Pseudo-3D ──
   3 camadas com parallax baseado no mouse + eventos aleatórios (folha, pássaro, vagalume).
*/

interface AmbientEvent {
  id: number;
  type: "leaf" | "bird" | "firefly_burst";
  x: number;
}

const LivingForest = ({ children, variant = "light" }: { children?: React.ReactNode; variant?: "light" | "dark" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [events, setEvents] = useState<AmbientEvent[]>([]);

  useEffect(() => {
    const handle = (e: MouseEvent | TouchEvent) => {
      const touch = "touches" in e ? e.touches[0] : (e as MouseEvent);
      if (!touch) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      setMouse({ x: ((touch.clientX / w) - 0.5) * 2, y: ((touch.clientY / h) - 0.5) * 2 });
    };
    window.addEventListener("mousemove", handle);
    window.addEventListener("touchmove", handle, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handle);
      window.removeEventListener("touchmove", handle);
    };
  }, []);

  // Random ambient events every 8-15s
  useEffect(() => {
    const tick = () => {
      const types: AmbientEvent["type"][] = ["leaf", "bird", "firefly_burst"];
      const type = types[Math.floor(Math.random() * types.length)];
      const id = Date.now();
      const x = Math.random() * 80 + 10;
      setEvents((prev) => [...prev, { id, type, x }]);
      setTimeout(() => setEvents((prev) => prev.filter((e) => e.id !== id)), 7000);
    };
    const schedule = () => {
      const delay = 8000 + Math.random() * 7000;
      return window.setTimeout(() => { tick(); handle = schedule(); }, delay);
    };
    let handle = schedule();
    return () => clearTimeout(handle);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{
      // Light variant: transparent so the global MagicalBackground (forest-bg-light)
      // shows through, keeping background continuity across tabs.
      // Dark variant keeps its own night sky for the night card preview only.
      background: variant === "dark"
        ? "radial-gradient(ellipse at 50% 40%, hsl(150 35% 22%), hsl(220 40% 8%) 75%)"
        : "transparent",
    }}>
      {/* BACK LAYER — distant trees silhouette */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ x: mouse.x * -8, y: mouse.y * -4 }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
        style={{
          background: variant === "dark"
            ? "radial-gradient(ellipse at 20% 80%, hsl(160 40% 12% / 0.7) 0%, transparent 35%)," +
              "radial-gradient(ellipse at 80% 75%, hsl(150 45% 14% / 0.7) 0%, transparent 38%)," +
              "radial-gradient(ellipse at 50% 90%, hsl(155 50% 10% / 0.85) 0%, transparent 50%)"
            : "radial-gradient(ellipse at 20% 80%, hsl(140 50% 35% / 0.45) 0%, transparent 35%)," +
              "radial-gradient(ellipse at 80% 75%, hsl(150 55% 32% / 0.45) 0%, transparent 38%)," +
              "radial-gradient(ellipse at 50% 95%, hsl(140 50% 28% / 0.55) 0%, transparent 50%)",
          filter: "blur(8px)",
        }}
      />

      {/* MID LAYER — fireflies (always present, low density) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ x: mouse.x * -18, y: mouse.y * -10 }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
      >
        {Array.from({ length: 14 }).map((_, i) => {
          const left = (i * 71) % 100;
          const top = (i * 43) % 100;
          const dur = 3 + (i % 4);
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: 6 + (i % 3) * 2,
                height: 6 + (i % 3) * 2,
                background: `radial-gradient(circle, hsl(${45 + (i % 3) * 12} 95% 72% / 0.85), transparent 65%)`,
                filter: "blur(1.5px)",
                boxShadow: `0 0 12px hsl(${45 + (i % 3) * 12} 95% 65% / 0.6)`,
              }}
              animate={{
                opacity: [0.3, 0.95, 0.3],
                scale: [1, 1.4, 1],
                y: [0, -20, 0],
              }}
              transition={{ duration: dur, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
            />
          );
        })}
      </motion.div>

      {/* FRONT LAYER — leaves passing (subtle blur for DoF) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ x: mouse.x * -28, y: mouse.y * -16 }}
        transition={{ type: "spring", stiffness: 80, damping: 16 }}
        style={{ filter: "blur(0.5px)" }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`leaf-bg-${i}`}
            className="absolute text-2xl opacity-40"
            style={{ left: `${(i * 23 + 5) % 95}%`, top: `${(i * 37) % 90}%` }}
            animate={{ rotate: [0, 12, -8, 0], y: [0, 8, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
          >
            🍃
          </motion.div>
        ))}
      </motion.div>

      {/* AMBIENT EVENTS */}
      <AnimatePresence>
        {events.map((ev) => {
          if (ev.type === "leaf") {
            return (
              <motion.div
                key={ev.id}
                className="absolute pointer-events-none text-3xl"
                style={{ left: `${ev.x}%`, top: -40 }}
                initial={{ y: -40, rotate: 0, opacity: 0 }}
                animate={{ y: window.innerHeight + 60, rotate: 540, opacity: [0, 1, 1, 0], x: [0, 30, -20, 10] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 6, ease: "easeIn" }}
              >🍂</motion.div>
            );
          }
          if (ev.type === "bird") {
            return (
              <motion.div
                key={ev.id}
                className="absolute pointer-events-none text-2xl"
                style={{ top: `${20 + (ev.id % 30)}%` }}
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: window.innerWidth + 60, opacity: [0, 1, 1, 0], y: [0, -10, 5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 5, ease: "easeInOut" }}
              >🐦</motion.div>
            );
          }
          // firefly_burst
          return (
            <motion.div
              key={ev.id}
              className="absolute pointer-events-none"
              style={{ left: `${ev.x}%`, top: "60%" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1, 0], opacity: [0, 1, 0.7, 0] }}
              transition={{ duration: 3 }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: "radial-gradient(circle, hsl(50 100% 75%), transparent 65%)",
                    boxShadow: "0 0 14px hsl(50 100% 65%)",
                  }}
                  animate={{
                    x: Math.cos((i / 6) * Math.PI * 2) * 40,
                    y: Math.sin((i / 6) * Math.PI * 2) * 40,
                    opacity: [1, 0],
                  }}
                  transition={{ duration: 2.5 }}
                />
              ))}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* CONTENT */}
      <div className="relative z-10 w-full h-full flex flex-col min-h-0">{children}</div>
    </div>
  );
};

export default LivingForest;
