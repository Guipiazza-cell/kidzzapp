import type { KalmSection, KalmExperience } from "./experiences";
import ExperienceCard from "./ExperienceCard";

interface Props {
  section: KalmSection;
  isPremium: boolean;
  onOpen: (exp: KalmExperience) => void;
}

const SectionRow = ({ section, isPremium, onOpen }: Props) => {
  const isAdult = section.tone === "adult";
  return (
    <section className="pt-5">
      <header className="px-5 mb-2.5">
        <p
          className="text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ color: isAdult ? "hsl(150 20% 38%)" : "hsl(150 35% 36%)" }}
        >
          {section.kicker}
        </p>
        <h3
          className="mt-0.5 text-[20px] font-semibold leading-tight"
          style={{ color: "hsl(150 35% 18%)", letterSpacing: "-0.01em" }}
        >
          {section.title}
        </h3>
        <p className="mt-0.5 text-[12.5px] font-medium" style={{ color: "hsl(150 12% 40%)" }}>
          {section.subtitle}
        </p>
      </header>
      <div
        className="pl-5 pr-3 flex gap-3 overflow-x-auto pb-4 snap-x scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x", scrollPaddingLeft: 20 }}
      >
        {section.items.map((exp) => (
          <ExperienceCard
            key={exp.id}
            exp={exp}
            isPremium={isPremium}
            tone={section.tone}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
};

export default SectionRow;
