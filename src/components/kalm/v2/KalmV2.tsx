/**
 * KALM v2 — root. Faz roteamento interno entre Home e sub-telas
 * e mantém o GuidedPlayer global da aba.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import KalmHome from "./KalmHome";
import { RelaxarAgora, RitualRapido, SosEmocional, VinculoFamilia } from "./SubScreens";
import GuidedPlayer from "./GuidedPlayer";
import { findActivity, type Activity } from "./data";

type View = "home" | "relaxar" | "ritual" | "sos" | "vinculo";

interface Props {
  onBack: () => void;
  onGoDreams: () => void;
  onOpenParents: () => void;
  initialExperienceId?: string | null;
  onConsumedInitial?: () => void;
}

const KalmV2 = ({ onBack, onGoDreams, onOpenParents, initialExperienceId, onConsumedInitial }: Props) => {
  const { profile } = useAuth();
  const { canUse } = useEntitlement();
  const isPremium = !!profile?.is_premium || canUse("kalm");

  const [view, setView] = useState<View>("home");
  const [activity, setActivity] = useState<Activity | null>(null);

  // SOS → KALM open
  useEffect(() => {
    if (!initialExperienceId) return;
    const a = findActivity(initialExperienceId);
    if (a) setActivity(a);
    else setView("sos");
    onConsumedInitial?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExperienceId]);

  const goPath = useCallback((p: "relaxar" | "ritual" | "sos" | "dormir" | "vinculo") => {
    if (p === "dormir") { onGoDreams(); return; }
    setView(p);
  }, [onGoDreams]);

  const openActivity = useCallback((a: Activity) => {
    setActivity(a);
  }, []);

  return (
    <>
      {view === "home" && (
        <KalmHome onBack={onBack} onGoPath={goPath} onOpenActivity={openActivity} />
      )}
      {view === "relaxar" && (
        <RelaxarAgora onBack={() => setView("home")} onOpen={openActivity} isPremium={isPremium} />
      )}
      {view === "ritual" && (
        <RitualRapido onBack={() => setView("home")} onOpen={openActivity} />
      )}
      {view === "sos" && (
        <SosEmocional onBack={() => setView("home")} onOpen={openActivity} onOpenParents={onOpenParents} />
      )}
      {view === "vinculo" && (
        <VinculoFamilia onBack={() => setView("home")} onOpen={openActivity} isPremium={isPremium} />
      )}
      <GuidedPlayer
        activity={activity}
        onClose={() => setActivity(null)}
        onSaveMoment={() => { /* já é registrado por badges/streak no player */ }}
      />
    </>
  );
};

export default KalmV2;
