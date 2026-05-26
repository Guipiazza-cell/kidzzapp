/**
 * Cinema Background v2.0 — 3 camadas fixed em z-[-10..-3]
 *  1) Base: gradient creme/branco (135deg)
 *  2) Atmosfera: blur + respiração (8s)
 *  3) Glow: radial verde sutil (8% opacity)
 *
 * Montado uma vez em MainApp. Respeita prefers-reduced-motion (cap global no index.css).
 */
const CinemaBackground = () => {
  return (
    <>
      {/* Camada base */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-[10]"
        style={{
          background:
            "linear-gradient(135deg, hsl(48 21% 96%) 0%, hsl(48 36% 98%) 50%, hsl(80 12% 93%) 100%)",
        }}
      />

      {/* Camada atmosférica — respiração */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-[8] animate-cinema-breath"
        style={{
          background:
            "radial-gradient(ellipse at 70% 20%, hsl(48 36% 98% / 0.6), transparent 60%)",
        }}
      />

      {/* Camada de glow verde sutil */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-[6]"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, hsl(105 33% 62% / 0.08) 0%, transparent 50%)",
        }}
      />
    </>
  );
};

export default CinemaBackground;
