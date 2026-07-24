/**
 * KALM v2 — root. Home diurna + 6 pilares + SOS.
 * Nada de conteúdo noturno aqui (isso vive em Sonhos).
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import KalmHome, { type Pillar } from "./KalmHome";
import { SosEmocional } from "./SubScreens";
import {
  PilarSentir, PilarAgradecer, PilarMover, PilarNutrir, PilarConectar, PilarCuidar,
} from "./Pillars";
import GuidedPlayer from "./GuidedPlayer";
import { findActivity, type Activity } from "./data";

type View = "home" | "sos" | Pillar;

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

  const openActivity = useCallback((a: Activity) => setActivity(a), []);
  const backHome = useCallback(() => setView("home"), []);

  return (
    <div
      className="h-full min-h-0 flex flex-col relative overflow-y-auto overflow-x-hidden"
      style={{
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
        touchAction: "pan-y",
        /* garante que o fim do conteúdo não fique atrás do dock */
        paddingBottom: 0,
      }}
    >
      {view === "home" && (
        <KalmHome
          onBack={onBack}
          onGoPillar={(p) => setView(p)}
          onGoSos={() => setView("sos")}
          onGoDreams={onGoDreams}
          onOpenActivity={openActivity}
        />
      )}
      {view === "sentir"    && <PilarSentir    onBack={backHome} onOpen={openActivity} isPremium={isPremium} />}
      {view === "agradecer" && <PilarAgradecer onBack={backHome} onOpen={openActivity} isPremium={isPremium} />}
      {view === "mover"     && <PilarMover     onBack={backHome} onOpen={openActivity} isPremium={isPremium} />}
      {view === "nutrir"    && <PilarNutrir    onBack={backHome} onOpen={openActivity} isPremium={isPremium} />}
      {view === "conectar"  && <PilarConectar  onBack={backHome} onOpen={openActivity} isPremium={isPremium} />}
      {view === "cuidar"    && <PilarCuidar    onBack={backHome} onOpen={openActivity} isPremium={isPremium} />}
      {view === "sos" && (
        <SosEmocional onBack={backHome} onOpen={openActivity} onOpenParents={onOpenParents} />
      )}
      <GuidedPlayer
        activity={activity}
        onClose={() => setActivity(null)}
        onSaveMoment={() => { /* já rastreado em GuidedPlayer via badges/streak */ }}
      />
    </div>
  );
};

export default KalmV2;
