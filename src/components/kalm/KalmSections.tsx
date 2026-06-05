import { useCallback, useEffect, useState } from "react";
import SectionRow from "./SectionRow";
import ExperiencePlayer from "./ExperiencePlayer";
import { KALM_SECTIONS, findExperience, type KalmExperience } from "./experiences";
import { checkKalmAccess, recordKalmUsage } from "./access";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { KALM_BRAND } from "./kalmBrand";
import { Leaf } from "lucide-react";

interface Props {
  initialExperienceId?: string | null;
  onConsumedInitial?: () => void;
}

const KalmSections = ({ initialExperienceId, onConsumedInitial }: Props) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const isPremium = profile?.is_premium ?? false;
  const [active, setActive] = useState<KalmExperience | null>(null);

  const openExperience = useCallback((exp: KalmExperience) => {
    const access = checkKalmAccess(exp, isPremium);
    if (access.allowed === false) {
      if (access.reason === "premium") {
        window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "kalm_journey" } }));
      } else {
        toast({
          title: "Limite diário do KALM",
          description: "Você já usou sua experiência de hoje. Premium libera tudo.",
        });
        window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "kalm_daily" } }));
      }
      return;
    }
    recordKalmUsage(exp, isPremium);
    setActive(exp);
  }, [isPremium, toast]);

  // Abertura contextual a partir do SOS
  useEffect(() => {
    if (!initialExperienceId) return;
    const exp = findExperience(initialExperienceId);
    if (exp) {
      // ignora freemium aqui — usuário veio de uma crise, oferecemos a transição.
      setActive(exp);
    }
    onConsumedInitial?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExperienceId]);

  return (
    <>
      {/* Header de marca KALM */}
      <div className="px-5 pt-6 pb-2">
        <div
          className="rounded-[26px] p-4 flex items-center gap-3"
          style={{
            background: KALM_BRAND.gradientSoft,
            border: "1px solid hsl(0 0% 100% / 0.7)",
            boxShadow: KALM_BRAND.ringShadow,
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: KALM_BRAND.gradient, boxShadow: "inset 0 2px 8px hsl(0 0% 100% / 0.4)" }}
          >
            <Leaf size={22} color="#fff" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: KALM_BRAND.emerald }}>
              {KALM_BRAND.name} <span style={{ opacity: 0.7 }}>{KALM_BRAND.tagline}</span>
            </p>
            <p className="mt-0.5 text-[14px] font-semibold leading-snug" style={{ color: KALM_BRAND.deep }}>
              {KALM_BRAND.subtitle}
            </p>
          </div>
        </div>
      </div>

      {KALM_SECTIONS.map((section) => (
        <SectionRow
          key={section.id}
          section={section}
          isPremium={isPremium}
          onOpen={openExperience}
        />
      ))}

      <div aria-hidden style={{ height: "calc(40px + env(safe-area-inset-bottom, 0px))" }} />

      <ExperiencePlayer exp={active} onClose={() => setActive(null)} />
    </>
  );
};

export default KalmSections;
