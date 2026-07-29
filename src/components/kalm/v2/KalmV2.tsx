/**
 * KALM v2 — root. Home diurna + 6 pilares + SOS.
 * Nada de conteúdo noturno aqui (isso vive em Sonhos).
 *
 * Scroll: container próprio com fundo opaco (bloqueia MagicalBackground claro).
 * touch-action nos cards: pan-y (senão botões travam o scroll no iOS).
 */
import { useCallback, useEffect, useRef, useState } from "react";
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

/** Fundo opaco — nunca deixar o MagicalBackground (claro) vazar. */
const KALM_BG = "#0B1310";

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
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Ao trocar de tela (home ↔ pilar ↔ SOS), sempre começa no topo
  useEffect(() => {
    const jumpTop = () => {
      const el = scrollerRef.current;
      if (el) el.scrollTop = 0;
      try {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch { /* ignore */ }
    };
    jumpTop();
    const id = requestAnimationFrame(jumpTop);
    return () => cancelAnimationFrame(id);
  }, [view]);

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
  const goPillar = useCallback((p: Pillar) => setView(p), []);
  const goSos = useCallback(() => setView("sos"), []);
  const backHome = useCallback(() => setView("home"), []);

  return (
    <div
      className="flex-1 h-full min-h-0 flex flex-col relative overflow-hidden w-full"
      style={{ background: KALM_BG }}
    >
      {/* Único scroller da aba — fundo opaco em toda a altura rolável */}
      <div
        ref={scrollerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
        style={{
          background: KALM_BG,
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
        }}
      >
        {view === "home" && (
          <KalmHome
            onBack={onBack}
            onGoPillar={goPillar}
            onGoSos={goSos}
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
      </div>

      <GuidedPlayer
        activity={activity}
        onClose={() => setActivity(null)}
        onSaveMoment={() => { /* já rastreado em GuidedPlayer via badges/streak */ }}
      />
    </div>
  );
};

export default KalmV2;
