import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  Clock,
  Crown,
  Menu,
  Sparkles,
  Tent,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { useEntitlement } from "@/hooks/useEntitlement";
import { useCriancas } from "@/hooks/useCriancas";
import { useSurpresaIA } from "@/hooks/useSurpresaIA";
import { useBoraStats } from "@/hooks/useBoraStats";
import { useDesafioSemana } from "@/hooks/useDesafioSemana";
import { usePaywall } from "@/components/paywall/PaywallProvider";
import { useMemories } from "@/hooks/useMemories";
import { CriancaOnboarding } from "./CriancaOnboarding";
import { SurpresaModal } from "./SurpresaModal";
import { ComoFoiModal } from "./ComoFoiModal";
import { DiarioSemTela } from "./DiarioSemTela";
import { GuardaCelularScreen } from "./GuardaCelularScreen";
import { scheduleDailyReminder } from "@/lib/dailyReminder";
import { analytics } from "@/lib/analytics";
import {
  FONT,
  SERIF,
  R,
  PAD,
  glassDark as glass,
  glassDarkSoft as glassSoft,
  pillGlassDark as pillGlass,
  goldBtn,
  outlineGoldBtn,
  sectionWrap,
} from "@/lib/premiumUi";

interface Props {
  onBack?: () => void;
}

type Energy = "agitada" | "cansada" | "curiosa" | "feliz";

/** Assets Hermes/Codex full-frame (não recortes). Cache-bust ?v2 */
const BV = "v4";
const b = (name: string) => `/exemplos/assets/bora-v2/${name}?${BV}`;
const ASSETS = {
  heroBg: b("hero-bg.png"),
  heroArt: b("hero-art.png"),
  actArt: b("act-art.png"),
  surpriseArt: b("surprise-art.png"),
  premiumArt: b("premium-art.png"),
  challengeArt: b("challenge-art.png"),
  cats: {
    ciencia: b("cat-ciencia.png"),
    sensorial: b("cat-sensorial.png"),
    natureza: b("cat-natureza.png"),
    arte: b("cat-arte.png"),
    movimento: b("cat-movimento.png"),
    musica: b("cat-musica.png"),
    cozinha: b("cat-cozinha.png"),
    conversa: b("cat-conversa.png"),
  },
} as const;

type Cat = {
  key: keyof typeof ASSETS.cats;
  label: string;
  grad: string;
  glow: string;
  energies: Energy[];
  premium?: boolean;
};

const CATS: Cat[] = [
  { key: "ciencia", label: "Ciência", grad: "linear-gradient(145deg,#1a3a6e 0%,#0d2448 100%)", glow: "rgba(90,160,255,.35)", energies: ["curiosa", "feliz"], premium: true },
  { key: "sensorial", label: "Sensorial", grad: "linear-gradient(145deg,#6a2a6e 0%,#3a1848 100%)", glow: "rgba(220,120,255,.35)", energies: ["agitada", "cansada", "feliz"] },
  { key: "natureza", label: "Natureza", grad: "linear-gradient(145deg,#2a5a28 0%,#143818 100%)", glow: "rgba(120,220,100,.3)", energies: ["curiosa", "agitada", "feliz"] },
  { key: "arte", label: "Arte", grad: "linear-gradient(145deg,#8a4a18 0%,#4a2808 100%)", glow: "rgba(255,180,80,.35)", energies: ["cansada", "curiosa", "feliz"] },
  { key: "movimento", label: "Movimento", grad: "linear-gradient(145deg,#8a3a18 0%,#4a1c08 100%)", glow: "rgba(255,140,70,.35)", energies: ["agitada", "feliz"] },
  { key: "musica", label: "Música", grad: "linear-gradient(145deg,#4a2a7e 0%,#281048 100%)", glow: "rgba(180,120,255,.35)", energies: ["cansada", "feliz", "curiosa"] },
  { key: "cozinha", label: "Cozinha", grad: "linear-gradient(145deg,#8a4a20 0%,#4a280c 100%)", glow: "rgba(255,170,90,.35)", energies: ["curiosa", "feliz"], premium: true },
  { key: "conversa", label: "Conversa", grad: "linear-gradient(145deg,#4a2a6e 0%,#281040 100%)", glow: "rgba(190,140,255,.3)", energies: ["cansada", "curiosa", "feliz"] },
];

const MOOD_PILLS: { key: Energy; label: string; icon: string }[] = [
  { key: "agitada", label: "Agitada", icon: "/exemplos/assets/bora-v2/moods/mood-agitada.png" },
  { key: "cansada", label: "Cansada", icon: "/exemplos/assets/bora-v2/moods/mood-cansada.png" },
  { key: "curiosa", label: "Curiosa", icon: "/exemplos/assets/bora-v2/moods/mood-curiosa.png" },
  { key: "feliz", label: "Feliz", icon: "/exemplos/assets/bora-v2/moods/mood-feliz.png" },
];

const DIARY_KEY = "bora_diary_v1";
type Diary = { minutes: number; completions: number; streak: number; lastDate: string };

const readDiary = (): Diary => {
  if (typeof window === "undefined") return { minutes: 0, completions: 0, streak: 0, lastDate: "" };
  try {
    const raw = window.localStorage.getItem(DIARY_KEY);
    if (raw) return JSON.parse(raw) as Diary;
  } catch {}
  return { minutes: 0, completions: 0, streak: 0, lastDate: "" };
};

const SURPRISE_DATE_KEY = "bora_surprise_date";
const MILESTONE_KEY = "bora_streak_milestone_shown";

const SectionLabel = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12,
      padding: "0 2px",
    }}
  >
    <h2
      style={{
        margin: 0,
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: 18,
        color: "#FFF4E8",
        letterSpacing: "-0.3px",
      }}
    >
      {children}
    </h2>
    {right}
  </div>
);

const BoraScreen = ({ onBack }: Props) => {
  const { profile, user } = useAuth();
  const { isPremium } = useEntitlement();
  const { criancas, loading: loadingCriancas } = useCriancas();
  const { open: openPaywall } = usePaywall();
  const { desafio } = useDesafioSemana();
  const { addMemory } = useMemories();

  const [showOnboarding, setShowOnboarding] = useState(false);
  /** Se o pai fechou o modal sem cadastrar, não reabre na mesma visita à aba. */
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  useEffect(() => {
    if (!user) return;
    if (loadingCriancas) return;
    if (criancas.length === 0 && !onboardingDismissed) setShowOnboarding(true);
    if (criancas.length > 0) {
      setShowOnboarding(false);
      setOnboardingDismissed(false);
    }
  }, [user, loadingCriancas, criancas.length, onboardingDismissed]);

  const firstCrianca = criancas[0];
  const childName = (firstCrianca?.nome || profile?.child_name || "").trim();
  const firstName = childName ? childName.split(" ")[0] : "";
  const greetName = firstName || "família";

  const [diary, setDiary] = useState<Diary>(() => readDiary());
  useEffect(() => {
    const onStorage = () => setDiary(readDiary());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const { stats: boraStats, refresh: refreshStats } = useBoraStats();
  const heroStreak = Math.max(boraStats.streak, diary.streak);

  useEffect(() => {
    if (!user) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("ref");
      const fromSession = sessionStorage.getItem("kidzz_ref");
      const code = (fromUrl || fromSession || "").trim();
      const appliedKey = `bora_indicacao_aplicada_${user.id}`;
      if (!code || localStorage.getItem(appliedKey) === "1") return;
      import("@/hooks/useIndicacao").then(({ aplicarIndicacao }) => {
        aplicarIndicacao(code)
          .then((res) => {
            if (res?.ok) localStorage.setItem(appliedKey, "1");
          })
          .catch(() => {});
      });
    } catch {}
  }, [user]);

  useEffect(() => {
    scheduleDailyReminder((criancas[0]?.nome || "").split(" ")[0]);
  }, [criancas]);

  const [diaryOpen, setDiaryOpen] = useState(false);
  const [comoFoiOpen, setComoFoiOpen] = useState(false);

  useEffect(() => {
    if (isPremium) return;
    if (diary.streak < 3) return;
    try {
      const shown = window.localStorage.getItem(MILESTONE_KEY);
      if (shown === String(diary.streak)) return;
      const t = setTimeout(() => {
        openPaywall("streak_milestone");
        try {
          window.localStorage.setItem(MILESTONE_KEY, String(diary.streak));
        } catch {}
      }, 700);
      return () => clearTimeout(t);
    } catch {}
  }, [diary.streak, isPremium, openPaywall]);

  const [mood, setMood] = useState<Energy | null>(null);

  const todayISO = () => new Date().toISOString().slice(0, 10);
  const surpriseUsedToday = () => {
    try {
      return window.localStorage.getItem(SURPRISE_DATE_KEY) === todayISO();
    } catch {
      return false;
    }
  };

  const {
    surprise,
    loading: surprising,
    error: surpriseError,
    activity: surpriseActivity,
    reset: resetSurprise,
  } = useSurpresaIA();
  const [surpriseOpen, setSurpriseOpen] = useState(false);

  const handleSurprise = async () => {
    if (!isPremium && surpriseUsedToday()) {
      openPaywall("surprise_limit");
      return;
    }
    setSurpriseOpen(true);
    try {
      await surprise(mood ? { energia: mood === "feliz" ? "curiosa" : mood } : undefined);
      if (!isPremium) {
        try {
          window.localStorage.setItem(SURPRISE_DATE_KEY, todayISO());
        } catch {}
      }
    } catch (_) {}
  };

  const closeSurprise = () => {
    setSurpriseOpen(false);
    resetSurprise();
    if (!isPremium && diary.completions >= 1 && diary.completions <= 2) {
      setTimeout(() => openPaywall("after_completion"), 400);
    }
  };

  const handleCategoryTap = (c: Cat) => {
    if (c.premium && !isPremium) {
      openPaywall("premium_locked");
      return;
    }
    if (!isPremium && surpriseUsedToday()) {
      openPaywall("surprise_limit");
      return;
    }
    setSurpriseOpen(true);
    const energia = mood && mood !== "feliz" ? mood : undefined;
    surprise({ categoria: c.key, ...(energia ? { energia } : {}) })
      .then(() => {
        if (!isPremium) {
          try {
            window.localStorage.setItem(SURPRISE_DATE_KEY, todayISO());
          } catch {}
        }
      })
      .catch(() => {});
  };

  const TODAY_ACTIVITY = {
    titulo: "Caça ao tesouro das cores",
    emoji: "🎨",
    tela_min: 15,
  };

  const [surpriseSalva, setSurpriseSalva] = useState(false);
  const registrarConclusaoIA = async (act: { id?: string; titulo: string; tela_min?: number }) => {
    if (!user || surpriseSalva) return;
    setSurpriseSalva(true);
    const { error } = await supabase.from("conclusoes").insert({
      user_id: user.id,
      crianca_id: firstCrianca?.id || null,
      activity_id: act.id || null,
      titulo_snapshot: act.titulo,
      tela_min: act.tela_min ?? 0,
    });
    if (error) {
      console.warn("[Bora] conclusao insert failed", error);
      setSurpriseSalva(false);
      return;
    }
    analytics.activityCompleted({
      tab: "bora",
      activity_id: act.id || act.titulo,
      duration_seconds: (act.tela_min ?? 0) * 60,
      title: act.titulo,
      persist: false,
    });
    refreshStats();
  };

  const [guardaOpen, setGuardaOpen] = useState(false);

  const handleBoraFazer = () => setGuardaOpen(true);
  const handleGuardaDone = () => {
    setGuardaOpen(false);
    setTimeout(() => setComoFoiOpen(true), 200);
  };

  const handleConclusaoSalva = () => {
    refreshStats();
    setDiary((d) => {
      const today = todayISO();
      const nextStreak = d.lastDate === today ? d.streak : d.streak + 1;
      const next: Diary = {
        minutes: d.minutes + TODAY_ACTIVITY.tela_min,
        completions: d.completions + 1,
        streak: nextStreak,
        lastDate: today,
      };
      try {
        window.localStorage.setItem(DIARY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    const nome = profile?.child_name || "A família";
    void addMemory({
      type: "bora",
      title: `Bora: ${TODAY_ACTIVITY.titulo}`,
      content: `${nome} concluiu "${TODAY_ACTIVITY.titulo}" (${TODAY_ACTIVITY.tela_min} min sem tela)`,
      is_special: false,
      image_url: null,
      metadata: {
        area: "bora",
        activity: TODAY_ACTIVITY.titulo,
        minutes: TODAY_ACTIVITY.tela_min,
      },
    });
  };

  const shareDesafio = async () => {
    if (!desafio) return;
    const text = `Essa semana a família tá no desafio Kidzz: ${desafio.titulo}. ${desafio.descricao} ${desafio.hashtag}`;
    if (typeof navigator !== "undefined" && (navigator as unknown as { share?: unknown }).share) {
      try {
        await (navigator as unknown as { share: (d: unknown) => Promise<void> }).share({
          title: desafio.titulo,
          text,
          url: "https://kidzz.app",
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard?.writeText(text);
    } catch {}
  };

  // Parallax sutil no hero
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const onScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const sc = scrollRef.current;
      const hero = heroArtRef.current;
      if (!sc || !hero) return;
      const y = sc.scrollTop;
      hero.style.transform = `translateY(${y * 0.22}px) scale(${1 + y * 0.00025})`;
      hero.style.opacity = String(Math.max(0.35, 1 - y / 320));
    });
  };
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  // Tilt 3D nos cards
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    let tiltEl: HTMLElement | null = null;
    const reset = () => {
      if (!tiltEl) return;
      tiltEl.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
      tiltEl.style.transform = "";
      tiltEl = null;
    };
    const onMove = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const el = t && t.closest ? (t.closest("[data-tilt]") as HTMLElement | null) : null;
      if (tiltEl && tiltEl !== el) reset();
      if (!el) return;
      tiltEl = el;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = "transform .09s ease-out";
      el.style.transform = `perspective(720px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) scale(1.015)`;
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", reset);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", reset);
    };
  }, []);

  const desafioTitulo = desafio?.titulo || "Cabaninha de lençol";
  const desafioDesc =
    desafio?.descricao ||
    "Transformem a sala em um acampamento e contem histórias que ficam no coração.";

  return (
    <div
      data-tab="bora"
      style={{
        height: "100%",
        position: "relative",
        fontFamily: FONT,
        background: "#120E0A",
        color: "#F8E8D0",
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @keyframes bora2-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bora2-cascade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bora2-heroIn{from{opacity:0;transform:translateY(-8px) scale(1.03)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes bora2-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes bora2-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(24px,14px) scale(1.1)}}
        @keyframes bora2-shine{0%{transform:translateX(-130%) skewX(-16deg)}60%,100%{transform:translateX(240%) skewX(-16deg)}}
        @keyframes bora2-twinkle{0%,100%{opacity:.18;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
        @keyframes bora2-pulse{0%,100%{opacity:1}50%{opacity:.55}}
        @keyframes bora2-glow{0%,100%{box-shadow:0 0 16px rgba(255,180,80,.12)}50%{box-shadow:0 0 26px rgba(255,180,80,.28)}}
        .bora2-screen::-webkit-scrollbar,.bora2-hscroll::-webkit-scrollbar{display:none}
        [data-tab="bora"] button{ -webkit-tap-highlight-color:transparent; touch-action:manipulation; }
        @media (prefers-reduced-motion: reduce){
          [data-tab="bora"] *,[data-tab="bora"] *::before,[data-tab="bora"] *::after{animation:none!important;transition-duration:.01ms!important}
        }
      `}</style>

      <CriancaOnboarding
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onDismiss={() => {
          setShowOnboarding(false);
          setOnboardingDismissed(true);
          onBack();
        }}
      />
      <DiarioSemTela open={diaryOpen} onClose={() => setDiaryOpen(false)} childName={firstName} />
      <GuardaCelularScreen
        open={guardaOpen}
        minutes={TODAY_ACTIVITY.tela_min}
        childName={firstName}
        onDone={handleGuardaDone}
        onCancel={() => setGuardaOpen(false)}
      />
      <ComoFoiModal
        open={comoFoiOpen}
        onClose={() => setComoFoiOpen(false)}
        onSaved={handleConclusaoSalva}
        activity={TODAY_ACTIVITY}
        criancaId={firstCrianca?.id || null}
        childName={firstName}
      />
      <SurpresaModal
        open={surpriseOpen}
        loading={surprising}
        activity={surpriseActivity}
        error={surpriseError}
        childName={firstName}
        onClose={closeSurprise}
        concluido={surpriseSalva}
        onConcluir={registrarConclusaoIA}
        onRetry={() => {
          setSurpriseSalva(false);
          surprise(mood && mood !== "feliz" ? { energia: mood } : undefined).catch(() => {});
        }}
      />


      {/* Fundo florestal escuro + orbes dourados */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${ASSETS.heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "50% 18%",
          filter: "brightness(.42) saturate(1.15) blur(1px)",
          transform: "scale(1.08)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(18,12,8,.55) 0%, rgba(22,14,10,.72) 28%, rgba(18,12,8,.88) 58%, #140E0A 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(50% 32% at 78% 12%, rgba(255,180,90,.22), transparent 70%), radial-gradient(40% 28% at 12% 40%, rgba(255,140,70,.1), transparent 70%), radial-gradient(48% 30% at 50% 95%, rgba(180,100,40,.12), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,190,100,.28), transparent 65%)",
          filter: "blur(30px)",
          animation: "bora2-drift 14s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "48%",
          left: -100,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,80,.16), transparent 65%)",
          filter: "blur(28px)",
          animation: "bora2-drift 18s ease-in-out 2s infinite reverse",
          pointerEvents: "none",
        }}
      />
      {/* Partículas douradas */}
      {[
        { t: 90, l: "18%", d: "0s" },
        { t: 160, l: "72%", d: "1.2s" },
        { t: 240, l: "42%", d: "2.1s" },
        { t: 320, l: "85%", d: ".6s" },
        { t: 400, l: "12%", d: "1.8s" },
      ].map((p, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            top: p.t,
            left: p.l,
            width: 4,
            height: 4,
            borderRadius: 99,
            background: "#FFE0A8",
            boxShadow: "0 0 10px 3px rgba(255,190,110,.75)",
            animation: `bora2-twinkle ${3 + i * 0.4}s ease-in-out ${p.d} infinite`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="bora2-screen"
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          overscrollBehavior: "contain",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
          scrollbarWidth: "none",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ── HEADER iOS liquid glass ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
            paddingLeft: PAD,
            paddingRight: PAD,
            paddingBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "linear-gradient(180deg, rgba(18,12,8,.78) 0%, rgba(18,12,8,.4) 65%, transparent 100%)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          }}
        >
          <button
            type="button"
            onClick={() => onBack?.()}
            aria-label="Menu"
            className="active:scale-90"
            style={{
              width: 44,
              height: 44,
              flex: "none",
              borderRadius: R.btn,
              ...pillGlass,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Menu size={19} color="#FFE8C0" strokeWidth={2.1} />
          </button>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              height: 44,
              padding: "0 14px",
              borderRadius: R.btn,
              ...pillGlass,
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: "#FFF6E8",
                letterSpacing: "-0.2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Oi, {greetName}!
            </span>
            <Sparkles size={14} color="#F0C060" strokeWidth={2.2} style={{ flexShrink: 0 }} />
          </div>

          <button
            type="button"
            onClick={() => setDiaryOpen(true)}
            aria-label="Lembretes e diário"
            className="active:scale-90"
            style={{
              width: 44,
              height: 44,
              flex: "none",
              borderRadius: R.btn,
              ...pillGlass,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Bell size={17} color="#FFE8C0" strokeWidth={2.1} />
            {heroStreak > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 9,
                  right: 10,
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: "#F0A030",
                  boxShadow: "0 0 8px rgba(240,160,48,.9)",
                  border: "1.5px solid rgba(20,14,10,.6)",
                }}
              />
            )}
          </button>
        </div>

        {/* ── HERO ── */}
        <div style={{ position: "relative", padding: `4px ${PAD}px 14px`, minHeight: 248 }}>
          <div
            ref={heroArtRef}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: "66%",
              height: 220,
              willChange: "transform",
              animation: "bora2-heroIn .75s cubic-bezier(.22,1,.36,1) both",
              pointerEvents: "none",
              borderRadius: `0 ${R.card}px ${R.card}px 0`,
              overflow: "hidden",
            }}
          >
            <img
              src={ASSETS.heroArt}
              alt="Família em aventura na floresta com o camaleão Gui"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "62% 42%",
                maskImage:
                  "linear-gradient(100deg, transparent 0%, #000 18%, #000 88%, transparent 100%), linear-gradient(180deg, #000 62%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(100deg, transparent 0%, #000 18%, #000 88%, transparent 100%), linear-gradient(180deg, #000 62%, transparent 100%)",
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
                filter: "saturate(1.1) contrast(1.03)",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: "16%",
                bottom: 32,
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,200,120,.32), transparent 70%)",
                filter: "blur(8px)",
                animation: "bora2-floaty 6s ease-in-out infinite",
              }}
            />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 3,
              maxWidth: "56%",
              paddingTop: 16,
              animation: "bora2-cascade .6s cubic-bezier(.22,1,.36,1) .05s both",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 28,
                lineHeight: 1.12,
                color: "#FFF8EE",
                letterSpacing: "-0.4px",
                textShadow: "0 2px 16px rgba(0,0,0,.4)",
              }}
            >
              Bora viver
              <br />
              <span style={{ color: "#F0B050" }}>mais</span>
              <br />
              <span style={{ color: "#F0B050" }}>aventuras</span>
              <br />
              de <span style={{ color: "#F0B050" }}>verdade</span>!
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.45,
                color: "rgba(255,232,205,.78)",
                maxWidth: 200,
                textShadow: "0 1px 8px rgba(0,0,0,.35)",
              }}
            >
              Atividades em família
              <br />
              que criam memórias
              <br />
              para a vida
            </p>
            <button
              type="button"
              onClick={handleBoraFazer}
              className="active:scale-[0.97]"
              style={{ ...outlineGoldBtn, marginTop: 16, minHeight: 44 }}
            >
              Ver missão de hoje
              <ArrowRight size={15} strokeWidth={2.3} />
            </button>
          </div>
        </div>

        {/* ── SURPRESA DA IA (card principal da aba) ── */}
        <div style={sectionWrap}>
          <button
            type="button"
            onClick={handleSurprise}
            disabled={surprising}
            data-tilt="1"
            className="active:scale-[0.985]"
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              textAlign: "left",
              cursor: surprising ? "wait" : "pointer",
              borderRadius: R.card,
              padding: 0,
              ...glass,
              minHeight: 188,
              animation:
                "bora2-cascade .55s cubic-bezier(.22,1,.36,1) both, bora2-glow 3.5s ease-in-out infinite",
              transition: "transform .28s cubic-bezier(.34,1.4,.64,1)",
              boxShadow:
                "0 16px 48px rgba(0,0,0,.42), 0 0 0 0.5px rgba(240,192,96,.28), 0 1px 0 rgba(255,245,220,.3) inset, 0 0 32px rgba(240,160,60,.18)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(95% 110% at 88% 40%, rgba(255,190,90,.22), transparent 55%), radial-gradient(60% 80% at 12% 90%, rgba(240,160,60,.12), transparent 50%)",
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "55%",
                height: "100%",
                background:
                  "linear-gradient(100deg, transparent 0%, rgba(255,230,160,.14) 48%, transparent 100%)",
                animation: "bora2-shine 6s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />

            <div style={{ display: "flex", minHeight: 188, position: "relative", zIndex: 2 }}>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "16px 10px 14px 16px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "1.1px",
                      color: "#F0C060",
                    }}
                  >
                    <Sparkles size={12} color="#F0C060" />
                    SURPRESA DA IA
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: R.btn,
                      ...glassSoft,
                      fontSize: 11,
                      fontWeight: 800,
                      color: "rgba(255,232,205,.9)",
                    }}
                  >
                    só pra vocês
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 21,
                    color: "#FFF6E8",
                    lineHeight: 1.15,
                    marginTop: 8,
                    letterSpacing: "-0.3px",
                  }}
                >
                  Surpresa da IA
                  {firstName ? (
                    <>
                      <br />
                      <span style={{ color: "#F0C060" }}>pra {firstName}</span>
                    </>
                  ) : null}
                </div>
                <p
                  style={{
                    margin: "7px 0 0",
                    fontSize: 12.5,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: "rgba(255,230,200,.72)",
                    maxWidth: 200,
                  }}
                >
                  Uma aventura única, gerada agora pro humor e a idade de vocês.
                </p>

                <div style={{ marginTop: "auto", paddingTop: 12 }}>
                  <span
                    style={{
                      ...goldBtn,
                      minHeight: 42,
                      padding: "11px 18px",
                      opacity: surprising ? 0.75 : 1,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(120% 130% at 20% 10%, rgba(255,255,255,.32), transparent 55%)",
                        pointerEvents: "none",
                      }}
                    />
                    <span
                      style={{
                        position: "relative",
                        zIndex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Sparkles size={14} strokeWidth={2.3} />
                      {surprising ? "Gerando..." : "Receber surpresa"}
                      {!surprising && <ArrowRight size={14} strokeWidth={2.5} />}
                    </span>
                  </span>
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  width: "42%",
                  flex: "none",
                  minHeight: 188,
                  borderRadius: `0 ${R.card - 2}px ${R.card - 2}px 0`,
                  overflow: "hidden",
                  margin: 5,
                  marginLeft: 0,
                }}
              >
                <img
                  src={ASSETS.surpriseArt}
                  alt="Gui com a surpresa da IA"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 35%",
                    borderRadius: R.panel,
                    filter: "saturate(1.08) contrast(1.03)",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, rgba(28,18,10,.5) 0%, transparent 32%), radial-gradient(80% 70% at 70% 40%, rgba(255,180,80,.18), transparent 60%)",
                    borderRadius: R.panel,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 38,
                    height: 38,
                    borderRadius: R.btn,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...pillGlass,
                  }}
                >
                  <Sparkles size={16} color="#F0C060" strokeWidth={2.2} />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* ── ATIVIDADE DE HOJE ── */}
        <div style={sectionWrap}>
          <button
            type="button"
            onClick={handleBoraFazer}
            data-tilt="1"
            className="active:scale-[0.985]"
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: R.card,
              padding: 0,
              ...glass,
              animation: "bora2-cascade .55s cubic-bezier(.22,1,.36,1) .08s both",
              transition: "transform .28s cubic-bezier(.34,1.4,.64,1)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(90% 100% at 88% 45%, rgba(255,180,80,.16), transparent 55%)",
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "100%",
                background: "linear-gradient(100deg, transparent 0%, rgba(255,235,190,.1) 50%, transparent 100%)",
                animation: "bora2-shine 7s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />

            <div style={{ display: "flex", minHeight: 172, position: "relative", zIndex: 2 }}>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "16px 10px 14px 16px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "1.1px",
                      color: "#F5D090",
                    }}
                  >
                    <Sparkles size={11} color="#F0C060" />
                    ATIVIDADE DE HOJE
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: R.btn,
                      ...glassSoft,
                      fontSize: 11,
                      fontWeight: 800,
                      color: "rgba(255,232,205,.9)",
                    }}
                  >
                    <Clock size={11} />
                    {TODAY_ACTIVITY.tela_min} min
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 19,
                    color: "#FFF6E8",
                    lineHeight: 1.18,
                    marginTop: 8,
                    letterSpacing: "-0.2px",
                  }}
                >
                  {TODAY_ACTIVITY.titulo}
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: "rgba(255,230,200,.7)",
                    maxWidth: 188,
                  }}
                >
                  {firstName ? `${firstName} escolhe` : "Escolham"} uma cor e sai pela casa caçando 5 objetos
                  dessa cor. Quem achar primeiro conta uma história sobre o item.
                </p>

                <div style={{ marginTop: "auto", paddingTop: 12 }}>
                  <span style={{ ...goldBtn, minHeight: 40, padding: "10px 16px" }}>
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "radial-gradient(120% 130% at 20% 10%, rgba(255,255,255,.32), transparent 55%)",
                        pointerEvents: "none",
                      }}
                    />
                    <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      Bora fazer!
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </span>
                  </span>
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  width: "44%",
                  flex: "none",
                  minHeight: 172,
                  borderRadius: `0 ${R.card - 2}px ${R.card - 2}px 0`,
                  overflow: "hidden",
                  margin: 4,
                  marginLeft: 0,
                }}
              >
                <img
                  src={ASSETS.actArt}
                  alt="Gui explorador na caça ao tesouro das cores"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "72% 45%",
                    borderRadius: R.panel,
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, rgba(28,18,10,.55) 0%, transparent 30%)",
                    borderRadius: R.panel,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 36,
                    height: 36,
                    borderRadius: R.btn,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...pillGlass,
                  }}
                >
                  <ArrowRight size={15} color="#FFE8C0" strokeWidth={2.3} />
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                padding: "0 0 12px",
                position: "relative",
                zIndex: 2,
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  style={{
                    width: i === 0 ? 16 : 6,
                    height: 6,
                    borderRadius: 99,
                    background: i === 0 ? "#F0C060" : "rgba(255,220,170,.28)",
                    boxShadow: i === 0 ? "0 0 8px rgba(240,192,96,.55)" : "none",
                    transition: "width .2s",
                  }}
                />
              ))}
            </div>
          </button>
        </div>

        {/* ── HUMOR ── */}
        <div style={sectionWrap}>
          <div
            style={{
              ...glass,
              borderRadius: R.card,
              padding: "16px 14px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 17,
                  color: "#FFF4E8",
                  letterSpacing: "-0.2px",
                  lineHeight: 1.2,
                }}
              >
                Como {firstName || "ela"} tá agora?
              </h2>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "rgba(255,220,180,.5)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Toque para filtrar
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {MOOD_PILLS.map((mo) => {
                const on = mood === mo.key;
                return (
                  <button
                    key={mo.key}
                    type="button"
                    onClick={() => setMood(on ? null : mo.key)}
                    aria-pressed={on}
                    className="active:scale-95"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 6px 11px",
                      borderRadius: R.chip,
                      cursor: "pointer",
                      border: on
                        ? "0.5px solid rgba(255,210,140,.6)"
                        : "0.5px solid rgba(255,220,180,.18)",
                      background: on
                        ? "linear-gradient(165deg, rgba(255,200,100,.28), rgba(80,50,20,.4))"
                        : "linear-gradient(165deg, rgba(255,240,220,.12), rgba(30,22,14,.28))",
                      boxShadow: on
                        ? "0 6px 18px rgba(180,100,20,.28), 0 1px 0 rgba(255,235,190,.28) inset"
                        : "0 2px 8px rgba(0,0,0,.12), 0 1px 0 rgba(255,235,190,.12) inset",
                      backdropFilter: "blur(32px) saturate(180%)",
                      WebkitBackdropFilter: "blur(32px) saturate(180%)",
                      transition: "transform .18s, border-color .2s, background .2s",
                      minHeight: 88,
                    }}
                  >
                    <span
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        boxShadow: on
                          ? "0 6px 16px rgba(180,100,20,.35), 0 1px 0 rgba(255,255,255,.35) inset"
                          : "0 4px 12px rgba(0,0,0,.22), 0 1px 0 rgba(255,255,255,.2) inset",
                        background: "rgba(255,248,235,.08)",
                      }}
                    >
                      <img
                        src={mo.icon}
                        alt=""
                        width={44}
                        height={44}
                        draggable={false}
                        style={{
                          width: 44,
                          height: 44,
                          objectFit: "cover",
                          display: "block",
                          borderRadius: 14,
                        }}
                      />
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: on ? "#FFE8C0" : "rgba(255,230,200,.78)",
                        letterSpacing: "-0.1px",
                      }}
                    >
                      {mo.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── EXPLORAR POR TIPO ── */}
        {/* ── PREMIUM COZINHA ── */}
        <div style={sectionWrap}>
          <button
            type="button"
            onClick={() =>
              isPremium
                ? handleCategoryTap(CATS.find((c) => c.key === "cozinha")!)
                : openPaywall("premium_locked")
            }
            data-tilt="1"
            className="active:scale-[0.985]"
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 0,
              padding: 0,
              borderRadius: R.card,
              cursor: "pointer",
              ...glass,
              textAlign: "left",
              minHeight: 100,
              transition: "transform .28s",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "36%",
                flex: "none",
                alignSelf: "stretch",
                minHeight: 100,
                margin: 5,
                marginRight: 0,
                borderRadius: R.panel,
                overflow: "hidden",
              }}
            >
              <img
                src={ASSETS.premiumArt}
                alt="Cozinha em família"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "50% 55%",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0, padding: "14px 12px 14px 12px", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <Crown size={12} color="#F0C060" />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.1px", color: "#F0C060" }}>PREMIUM</span>
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#FFF4E8",
                  lineHeight: 1.18,
                  letterSpacing: "-0.2px",
                }}
              >
                Cozinha em família
              </div>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "rgba(255,230,200,.65)",
                  lineHeight: 1.35,
                }}
              >
                Sabores, aromas e momentos que viram memória.
              </p>
            </div>
            <div style={{ paddingRight: 12, flex: "none" }}>
              <span style={{ ...outlineGoldBtn, padding: "10px 14px", fontSize: 12.5, minHeight: 40 }}>
                Conhecer
                <ArrowRight size={13} />
              </span>
            </div>
          </button>
        </div>

        {/* ── DESAFIO DA SEMANA ── */}
        <div style={sectionWrap}>
          <button
            type="button"
            onClick={shareDesafio}
            data-tilt="1"
            className="active:scale-[0.985]"
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              display: "block",
              padding: 0,
              borderRadius: R.card,
              cursor: "pointer",
              ...glass,
              textAlign: "left",
              minHeight: 152,
              transition: "transform .28s",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 5,
                top: 5,
                bottom: 5,
                width: "48%",
                borderRadius: R.panel,
                overflow: "hidden",
              }}
            >
              <img
                src={ASSETS.challengeArt}
                alt="Família e Gui na cabaninha de lençol"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "55% 40%",
                }}
              />
            </div>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(100deg, rgba(22,14,8,.88) 0%, rgba(22,14,8,.72) 42%, rgba(22,14,8,.15) 72%, transparent 100%)",
                borderRadius: R.card,
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "48%",
                height: "100%",
                background:
                  "linear-gradient(100deg, transparent 0%, rgba(255,220,150,.08) 50%, transparent 100%)",
                animation: "bora2-shine 8s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 2, padding: "16px", maxWidth: "54%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Tent size={13} color="#F0C060" />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.1px", color: "#F0C060" }}>
                  DESAFIO DA SEMANA
                </span>
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 18,
                  color: "#FFF4E8",
                  lineHeight: 1.15,
                  marginTop: 6,
                  letterSpacing: "-0.2px",
                }}
              >
                {desafioTitulo}
              </div>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: "rgba(255,230,200,.7)",
                }}
              >
                {desafioDesc}
              </p>
              <span style={{ ...goldBtn, marginTop: 12, padding: "10px 15px", fontSize: 12.5, minHeight: 40 }}>
                Aceitar desafio
                <ArrowRight size={13} strokeWidth={2.4} />
              </span>
            </div>

            <div
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: R.btn,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...pillGlass,
                zIndex: 3,
              }}
            >
              <ArrowRight size={15} color="#FFE8C0" strokeWidth={2.3} />
            </div>
          </button>
        </div>

        <div style={{ paddingBottom: 24 }} />
      </div>
    </div>
  );
};

export default memo(BoraScreen);
