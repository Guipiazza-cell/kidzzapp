import { Lock, ChevronRight } from "lucide-react";
import { memo } from "react";
import type { KalmExperience } from "./experiences";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

interface Props {
  exp: KalmExperience;
  isPremium: boolean;
  tone: "light" | "adult" | "family";
  onOpen: (exp: KalmExperience) => void;
}

const ExperienceCard = ({ exp, isPremium, tone, onOpen }: Props) => {
  const locked = !isPremium && exp.tier === "premium" && exp.kind === "journey";
  // Cores por tom
  const isAdult = tone === "adult";
  const bg = isAdult
    ? "linear-gradient(160deg, hsl(150 12% 18% / 0.92), hsl(150 10% 10% / 0.92))"
    : "hsl(0 0% 100% / 0.78)";
  const stroke = isAdult ? "hsl(150 15% 35% / 0.4)" : "hsl(0 0% 100% / 0.7)";
  const titleColor = isAdult ? "hsl(48 30% 96%)" : "hsl(150 35% 18%)";
  const subColor   = isAdult ? "hsl(48 20% 78%)" : "hsl(150 12% 38%)";

  return (
    <button
      type="button"
      onClick={() => { haptic("light"); sfx("click"); onOpen(exp); }}
      className="snap-start shrink-0 w-[230px] text-left p-4 rounded-3xl relative overflow-hidden active:scale-[0.98] transition-transform touch-manipulation"
      style={{
        background: bg,
        border: `1px solid ${stroke}`,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: isAdult
          ? "0 14px 36px -16px hsl(150 30% 10% / 0.55)"
          : "0 10px 28px -18px hsl(150 30% 25% / 0.25)",
        minHeight: 144,
        touchAction: "manipulation",
      }}
      aria-label={exp.title}
    >
      {/* glow tinted */}
      <span
        aria-hidden
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${exp.tint.replace(")", " / 0.35)")}, transparent 70%)`, filter: "blur(14px)" }}
      />
      <div className="relative flex items-start justify-between mb-2">
        <span className="text-[24px]" aria-hidden>{exp.emoji}</span>
        {locked ? (
          <span
            className="flex items-center gap-1 px-2 h-6 rounded-full text-[10px] font-black"
            style={{ background: "hsl(38 60% 52% / 0.18)", color: "hsl(38 60% 45%)" }}
          >
            <Lock size={10} /> Premium
          </span>
        ) : (
          <span
            className="text-[10px] font-black px-2 h-6 rounded-full inline-flex items-center"
            style={{ background: exp.tint.replace(")", " / 0.16)"), color: isAdult ? "hsl(48 30% 92%)" : exp.tint }}
          >
            {exp.duration}
          </span>
        )}
      </div>
      <p className="relative text-[14px] font-black leading-tight" style={{ color: titleColor, letterSpacing: "-0.01em" }}>
        {exp.title}
      </p>
      <p className="relative text-[12px] mt-1 leading-snug" style={{ color: subColor }}>
        {exp.desc}
      </p>
      <span
        className="relative inline-flex items-center gap-0.5 mt-2 text-[11px] font-black"
        style={{ color: isAdult ? "hsl(150 35% 75%)" : exp.tint }}
      >
        {locked ? "Desbloquear" : "Começar"} <ChevronRight size={11} />
      </span>
    </button>
  );
};

export default memo(ExperienceCard);
