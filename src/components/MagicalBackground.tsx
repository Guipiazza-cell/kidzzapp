import forestBg from "@/assets/forest-bg-light.jpg";

const FIREFLIES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${5 + ((i * 17 + 7) % 90)}%`,
  top: `${10 + ((i * 23 + 11) % 75)}%`,
  size: 2 + (i % 3),
  delay: `${(i * 0.7).toFixed(1)}s`,
  duration: `${3 + (i % 4)}s`,
  drift: i % 2 === 0 ? "firefly-float-a" : "firefly-float-b",
}));

const LEAVES = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  left: `${10 + ((i * 19) % 80)}%`,
  size: 6 + (i % 4) * 2,
  delay: `${(i * 5).toFixed(1)}s`,
  duration: `${20 + (i % 5) * 4}s`,
  drift: i % 2 === 0 ? "leaf-drift-1" : "leaf-drift-2",
}));

const DRAGONFLIES = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  delay: `${(i * 3.5).toFixed(1)}s`,
  duration: `${12 + (i % 3) * 4}s`,
  path: i % 2 === 0 ? "dragonfly-path-1" : "dragonfly-path-2",
  size: 14 + (i % 3) * 4,
  startY: `${15 + ((i * 22) % 55)}%`,
}));

const MagicalBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {/* Forest image layer — lighter */}
    <img
      src={forestBg}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover"
      style={{ filter: "brightness(0.95) saturate(0.95)" }}
      width={768}
      height={1344}
    />

    {/* Soft gradient overlay for legibility */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

    {/* Subtle light sweep */}
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(90deg, transparent, hsl(45 90% 70% / 0.08), transparent)",
        animation: "light-sweep 14s ease-in-out infinite",
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
          background: `radial-gradient(circle, hsl(45 95% 75% / 0.85), hsl(45 95% 55% / 0))`,
          boxShadow: `0 0 ${f.size * 2}px ${f.size}px hsl(45 95% 60% / 0.25)`,
          animation: `${f.drift} ${f.duration} ease-in-out infinite`,
          animationDelay: f.delay,
          willChange: "transform, opacity",
        }}
      />
    ))}

    {/* Floating leaves */}
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
          background: `hsl(${120 + l.id * 15} 45% 40% / 0.18)`,
          animation: `${l.drift} ${l.duration} linear infinite`,
          animationDelay: l.delay,
          willChange: "transform, opacity",
        }}
      />
    ))}

    {/* Dragonflies */}
    {DRAGONFLIES.map((d) => (
      <div
        key={`dragonfly-${d.id}`}
        className="absolute"
        style={{
          top: d.startY,
          left: "-30px",
          animation: `${d.path} ${d.duration} ease-in-out infinite`,
          animationDelay: d.delay,
          willChange: "transform, opacity",
        }}
      >
        {/* Dragonfly body */}
        <svg
          width={d.size}
          height={d.size}
          viewBox="0 0 32 32"
          fill="none"
          style={{ filter: "drop-shadow(0 0 3px hsl(45 80% 70% / 0.4))" }}
        >
          {/* Body */}
          <ellipse cx="16" cy="18" rx="1.8" ry="6" fill="hsl(45 60% 65% / 0.7)" />
          {/* Head */}
          <circle cx="16" cy="11" r="2" fill="hsl(45 60% 70% / 0.8)" />
          {/* Left wings */}
          <ellipse
            cx="10" cy="14" rx="6" ry="2.5"
            fill="hsl(200 60% 80% / 0.35)"
            stroke="hsl(200 50% 75% / 0.25)"
            strokeWidth="0.3"
            style={{ animation: "dragonfly-wing 0.15s ease-in-out infinite alternate" }}
          />
          <ellipse
            cx="11" cy="18" rx="5" ry="2"
            fill="hsl(200 55% 82% / 0.28)"
            stroke="hsl(200 50% 75% / 0.2)"
            strokeWidth="0.3"
            style={{ animation: "dragonfly-wing 0.12s ease-in-out infinite alternate-reverse" }}
          />
          {/* Right wings */}
          <ellipse
            cx="22" cy="14" rx="6" ry="2.5"
            fill="hsl(200 60% 80% / 0.35)"
            stroke="hsl(200 50% 75% / 0.25)"
            strokeWidth="0.3"
            style={{ animation: "dragonfly-wing 0.15s ease-in-out infinite alternate" }}
          />
          <ellipse
            cx="21" cy="18" rx="5" ry="2"
            fill="hsl(200 55% 82% / 0.28)"
            stroke="hsl(200 50% 75% / 0.2)"
            strokeWidth="0.3"
            style={{ animation: "dragonfly-wing 0.12s ease-in-out infinite alternate-reverse" }}
          />
        </svg>
      </div>
    ))}

    {/* Soft ambient glow orbs */}
    <div
      className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl"
      style={{
        background: "radial-gradient(circle, hsl(45 90% 70% / 0.1), transparent 70%)",
        animation: "glow-pulse 6s ease-in-out infinite",
      }}
    />
    <div
      className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl"
      style={{
        background: "radial-gradient(circle, hsl(145 60% 50% / 0.06), transparent 70%)",
        animation: "glow-pulse 8s ease-in-out infinite 2s",
      }}
    />
  </div>
);

export default MagicalBackground;
