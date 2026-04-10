import forestBg from "@/assets/forest-bg.jpg";

const FIREFLIES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${5 + ((i * 17 + 7) % 90)}%`,
  top: `${10 + ((i * 23 + 11) % 75)}%`,
  size: 2 + (i % 3),
  delay: `${(i * 0.6).toFixed(1)}s`,
  duration: `${3 + (i % 4)}s`,
  drift: i % 2 === 0 ? "firefly-float-a" : "firefly-float-b",
}));

const LEAVES = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${10 + ((i * 19) % 80)}%`,
  size: 6 + (i % 4) * 2,
  delay: `${(i * 4).toFixed(1)}s`,
  duration: `${18 + (i % 5) * 4}s`,
  drift: i % 2 === 0 ? "leaf-drift-1" : "leaf-drift-2",
}));

const MagicalBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {/* Forest image layer */}
    <img
      src={forestBg}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover"
      style={{ filter: "brightness(0.75) saturate(0.9)" }}
      width={768}
      height={1344}
    />

    {/* Dark overlay for content legibility */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

    {/* Subtle light sweep */}
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(90deg, transparent, hsl(45 90% 70% / 0.06), transparent)",
        animation: "light-sweep 12s ease-in-out infinite",
        willChange: "transform",
      }}
    />

    {/* CSS-only fireflies */}
    {FIREFLIES.map((f) => (
      <span
        key={f.id}
        className="absolute rounded-full"
        style={{
          left: f.left,
          top: f.top,
          width: f.size,
          height: f.size,
          background: `radial-gradient(circle, hsl(45 95% 70% / 0.9), hsl(45 95% 55% / 0))`,
          boxShadow: `0 0 ${f.size * 2}px ${f.size}px hsl(45 95% 55% / 0.3)`,
          animation: `${f.drift} ${f.duration} ease-in-out infinite`,
          animationDelay: f.delay,
          willChange: "transform, opacity",
        }}
      />
    ))}

    {/* Floating leaves — very subtle */}
    {LEAVES.map((l) => (
      <span
        key={`leaf-${l.id}`}
        className="absolute"
        style={{
          left: l.left,
          top: "-20px",
          width: l.size,
          height: l.size * 0.6,
          borderRadius: "0 80% 0 80%",
          background: `hsl(${120 + l.id * 15} 40% 35% / 0.2)`,
          animation: `${l.drift} ${l.duration} linear infinite`,
          animationDelay: l.delay,
          willChange: "transform, opacity",
        }}
      />
    ))}

    {/* Soft ambient glow orbs */}
    <div
      className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl"
      style={{
        background: "radial-gradient(circle, hsl(45 90% 65% / 0.12), transparent 70%)",
        animation: "glow-pulse 6s ease-in-out infinite",
      }}
    />
    <div
      className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl"
      style={{
        background: "radial-gradient(circle, hsl(145 60% 45% / 0.08), transparent 70%)",
        animation: "glow-pulse 8s ease-in-out infinite 2s",
      }}
    />
    <div
      className="absolute bottom-1/4 right-0 w-40 h-40 rounded-full blur-3xl"
      style={{
        background: "radial-gradient(circle, hsl(270 55% 58% / 0.06), transparent 70%)",
        animation: "glow-pulse 7s ease-in-out infinite 4s",
      }}
    />
  </div>
);

export default MagicalBackground;
