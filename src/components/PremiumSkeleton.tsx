/**
 * PremiumSkeleton — elegant shimmering placeholder for loading states.
 * Pure CSS, GPU-friendly, matches the app's glass aesthetic.
 *
 * Usage:
 *   <PremiumSkeleton className="w-full h-32 rounded-2xl" />
 */
interface Props {
  className?: string;
  variant?: "card" | "line" | "circle";
}

const PremiumSkeleton = ({ className = "", variant = "card" }: Props) => {
  const base =
    variant === "circle"
      ? "rounded-full"
      : variant === "line"
      ? "rounded-md h-3"
      : "rounded-2xl";

  return (
    <div
      className={`relative overflow-hidden ${base} ${className}`}
      style={{
        background:
          "linear-gradient(110deg, hsl(0 0% 100% / 0.45) 25%, hsl(0 0% 100% / 0.7) 50%, hsl(0 0% 100% / 0.45) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.6s ease-in-out infinite",
        backdropFilter: "blur(8px)",
      }}
      aria-hidden
    >
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default PremiumSkeleton;
