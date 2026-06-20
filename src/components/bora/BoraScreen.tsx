import { memo, useEffect, useMemo, useState } from "react";
import {
  FlaskConical, Sparkles, TreePine, Palette, Dumbbell,
  MessageCircle, CookingPot, Wand2, Leaf, ChevronRight,
  Flame, Clock, Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { useCriancas } from "@/hooks/useCriancas";
import { useSurpresaIA } from "@/hooks/useSurpresaIA";
import { useBoraStats } from "@/hooks/useBoraStats";
import { usePaywall } from "@/components/paywall/PaywallProvider";
import { CriancaOnboarding } from "./CriancaOnboarding";
import { SurpresaModal } from "./SurpresaModal";
import { ComoFoiModal } from "./ComoFoiModal";
import { DiarioSemTela } from "./DiarioSemTela";
import { DesafioCard } from "./DesafioCard";
import { IndicacaoCard } from "./IndicacaoCard";
import { scheduleDailyReminder } from "@/lib/dailyReminder";

interface Props {
  onBack?: () => void;
}

type Energy = "agitada" | "cansada" | "curiosa";

type Cat = {
  key: string;
  icon: typeof FlaskConical;
  label: string;
  from: string;
  to: string;
  ring: string;
  ink: string;
  energies: Energy[];
  premium?: boolean;
};

const CATS: Cat[] = [
  { key: "ciencia",   icon: FlaskConical, label: "Ciência",   from: "#DCEEFB", to: "#7FB9EC", ring: "#4F94D4", ink: "#1E4972", energies: ["curiosa"], premium: true },
  { key: "sensorial", icon: Sparkles,     label: "Sensorial", from: "#FDE7F0", to: "#F49CC2", ring: "#D86AA0", ink: "#7A2A4F", energies: ["agitada","cansada"] },
  { key: "natureza",  icon: TreePine,     label: "Natureza",  from: "#E4F3D6", to: "#9FD37A", ring: "#6FB04A", ink: "#2F5E1F", energies: ["curiosa","agitada"] },
  { key: "arte",      icon: Palette,      label: "Arte",      from: "#FFF1D6", to: "#FFC472", ring: "#E8A044", ink: "#7A4A12", energies: ["cansada","curiosa"] },
  { key: "movimento", icon: Dumbbell,     label: "Movimento", from: "#FFE0D2", to: "#FF9A78", ring: "#E87456", ink: "#7A2F1C", energies: ["agitada"] },
  { key: "conversa",  icon: MessageCircle,label: "Conversa",  from: "#EFE6FB", to: "#B89BF0", ring: "#8E6FD8", ink: "#3F2A78", energies: ["cansada","curiosa"] },
  { key: "cozinha",   icon: CookingPot,   label: "Cozinha",   from: "#FCEBE0", to: "#F0A878", ring: "#D88052", ink: "#6E3A18", energies: ["curiosa"], premium: true },
];

const MOOD_PILLS: { key: Energy; label: string; emoji: string; tint: string }[] = [
  { key: "agitada", label: "Agitada", emoji: "🌪️", tint: "#E87456" },
  { key: "cansada", label: "Cansada", emoji: "😴", tint: "#8E6FD8" },
  { key: "curiosa", label: "Curiosa", emoji: "🤔", tint: "#4F94D4" },
];

const METAL_BG =
  "linear-gradient(165deg, #ffffff 0%, #e5e7eb 22%, #c4c8d0 42%, #9ca3af 54%, #c4c8d0 68%, #e5e7eb 86%, #ffffff 100%)";

/** 3D Glass orb — thin metallic bezel + glass face + embossed icon. */
const GlassOrb = ({
  Icon,
  size = 52,
  colorFrom,
  colorTo,
  iconSize = 22,
}: {
  Icon: typeof FlaskConical;
  size?: number;
  colorFrom: string;
  colorTo: string;
  iconSize?: number;
}) => {
  const pad = Math.max(2, Math.round(size * 0.065));
  const inner = size - pad * 2;
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        padding: pad,
        background: METAL_BG,
        boxShadow:
          "0 14px 34px -8px rgba(0,0,0,.28), 0 4px 10px rgba(0,0,0,.14), inset 0 1px 1px rgba(255,255,255,.95), inset 0 -1px 2px rgba(0,0,0,.08)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: inner,
          height: inner,
          borderRadius: Math.round(inner * 0.24),
          background: `linear-gradient(160deg, ${colorFrom} 0%, ${colorTo} 55%, ${colorFrom} 100%)`,
          boxShadow:
            "inset 0 1.5px 2px rgba(255,255,255,.6), inset 0 -5px 10px rgba(0,0,0,.22), 0 1px 0 rgba(255,255,255,.35)",
          overflow: "hidden",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.50) 0%, rgba(255,255,255,.10) 55%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "32%",
            background:
              "linear-gradient(0deg, rgba(0,0,0,.16) 0%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <Icon
          size={iconSize}
          strokeWidth={2.4}
          style={{
            position: "relative",
            zIndex: 1,
            color: "#ffffff",
            filter:
              "drop-shadow(0 1px 1px rgba(0,0,0,.35)) drop-shadow(0 -1px 0 rgba(255,255,255,.25))",
          }}
        />
      </span>
    </span>
  );
};

/** Premium badge — discreet, calm palette. */
const PremiumBadge = () => (
  <span
    className="font-bora-body"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#7A5A12",
      background: "linear-gradient(135deg, #FFF6DC 0%, #FFE8A8 100%)",
      border: "1px solid rgba(214,169,60,.35)",
      borderRadius: 999,
      padding: "3px 8px",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.7), 0 1px 2px rgba(120,80,10,.10)",
    }}
  >
    ✨ Premium
  </span>
);

/** 3D Glass category card. */
const GlassCard = ({ c, locked, onClick }: { c: Cat; locked: boolean; onClick?: () => void }) => {
  const Icon = c.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full active:scale-[0.98] transition-transform"
      style={{
        position: "relative",
        borderRadius: 24,
        padding: 2,
        background: METAL_BG,
        boxShadow:
          "0 18px 42px -10px rgba(0,0,0,.26), 0 6px 14px rgba(0,0,0,.14), inset 0 1px 1px rgba(255,255,255,.95)",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 21,
          overflow: "hidden",
          background: `linear-gradient(160deg, ${c.from} 0%, ${c.to} 55%, ${c.from} 100%)`,
          padding: "18px 16px 16px",
          boxShadow:
            "inset 0 1.5px 2px rgba(255,255,255,.55), inset 0 -6px 14px rgba(0,0,0,.16), 0 1px 0 rgba(255,255,255,.35)",
          minHeight: 124,
          filter: locked ? "saturate(0.85)" : "none",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, height: "48%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.52) 0%, rgba(255,255,255,.10) 55%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0, height: "28%",
            background:
              "linear-gradient(0deg, rgba(0,0,0,.14) 0%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Top row: orb + premium/lock */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <GlassOrb Icon={Icon} size={48} iconSize={20} colorFrom={c.ring} colorTo={c.ink} />
          {c.premium && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {locked && (
                <span
                  aria-label="Bloqueado"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22, height: 22,
                    borderRadius: 999,
                    background: "rgba(255,255,255,.55)",
                    border: "1px solid rgba(0,0,0,.06)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)",
                  }}
                >
                  <Lock size={11} strokeWidth={2.4} style={{ color: c.ink, opacity: .75 }} />
                </span>
              )}
              <PremiumBadge />
            </div>
          )}
        </div>

        <div
          className="font-bora-display"
          style={{ fontSize: 16, color: c.ink, marginTop: 14, letterSpacing: "-0.01em", position: "relative", zIndex: 1 }}
        >
          {c.label}
        </div>
      </div>
    </button>
  );
};

/** Bezel premium wrapper. */
const Bezel = ({ children, tint = "#E8821A" }: { children: React.ReactNode; tint?: string }) => (
  <div
    style={{
      borderRadius: 28,
      padding: 2,
      background: METAL_BG,
      boxShadow:
        "0 18px 42px -10px rgba(60,40,15,.32), 0 6px 14px rgba(60,40,15,.16), inset 0 1px 1px rgba(255,255,255,.95)",
    }}
  >
    <div
      style={{
        position: "relative",
        borderRadius: 25,
        overflow: "hidden",
        background:
          "linear-gradient(150deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.82) 48%, rgba(255,255,255,.92) 100%)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        boxShadow:
          "inset 0 1.5px 1px rgba(255,255,255,.95), inset 0 -10px 22px rgba(255,255,255,.20), inset 0 0 0 1px rgba(255,255,255,.6)",
        padding: 20,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "42%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.15) 60%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: 14,
          background: `linear-gradient(0deg, ${tint}26 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  </div>
);

/** Mood pill — selectable energy filter. */
const MoodPill = ({
  emoji, label, tint, active, onClick,
}: {
  emoji: string; label: string; tint: string; active: boolean; onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="active:scale-[0.97] transition-transform"
    style={{
      flex: 1,
      borderRadius: 999,
      padding: 1.5,
      background: active
        ? `linear-gradient(160deg, #ffffff 0%, ${tint} 60%, ${tint} 100%)`
        : METAL_BG,
      boxShadow: active
        ? `0 10px 22px -8px ${tint}80, inset 0 1px 1px rgba(255,255,255,.9)`
        : "0 8px 18px -8px rgba(0,0,0,.20), inset 0 1px 1px rgba(255,255,255,.95)",
    }}
  >
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 999,
        padding: "9px 10px",
        background: active
          ? `linear-gradient(155deg, ${tint} 0%, ${tint}dd 100%)`
          : "linear-gradient(155deg, #ffffff 0%, #f3f4f6 100%)",
        color: active ? "#fff" : "var(--bora-ink-soft, #3a3a3a)",
        fontFamily: "'Fredoka','Nunito',sans-serif",
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: "-0.005em",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{emoji}</span>
      {label}
    </span>
  </button>
);

/** Tree that grows leaves with completions. */
const Tree = ({ leaves }: { leaves: number }) => {
  const dots = Math.min(leaves, 7);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 28, lineHeight: 1, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.18))" }}>🌳</span>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Leaf
            key={i}
            size={10}
            strokeWidth={2.4}
            style={{
              color: i < dots ? "#4F8B66" : "rgba(79,139,102,.20)",
              filter: i < dots ? "drop-shadow(0 1px 0 rgba(255,255,255,.5))" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// localStorage diary key
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

const BoraScreen = ({ onBack }: Props) => {
  const { profile, user } = useAuth();
  const { isPremium } = useEntitlement();
  const { criancas, loading: loadingCriancas } = useCriancas();
  const { open: openPaywall } = usePaywall();

  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (!user) return;
    if (loadingCriancas) return;
    if (criancas.length === 0) setShowOnboarding(true);
  }, [user, loadingCriancas, criancas.length]);

  const firstCrianca = criancas[0];
  const childName = (firstCrianca?.nome || profile?.child_name || "").trim();
  const childAge = firstCrianca?.idade ?? null;
  const ageRange = childAge != null ? `${childAge} anos` : (profile?.age_range || "").trim();
  const firstName = childName ? childName.split(" ")[0] : "";
  const personalTag = firstName
    ? ageRange
      ? `Pra ${firstName}, ${ageRange}`
      : `Pra ${firstName}`
    : "Pra família toda";

  const [diary, setDiary] = useState<Diary>(() => readDiary());
  useEffect(() => {
    const onStorage = () => setDiary(readDiary());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Real stats do banco (Fase 7). Sobrepoe o `diary` local pra exibição.
  const { stats: boraStats, refresh: refreshStats } = useBoraStats();
  const heroMinutes = Math.max(boraStats.total_minutos, diary.minutes);
  const heroStreak = Math.max(boraStats.streak, diary.streak);
  const heroLeaves = Math.max(boraStats.total_conclusoes, diary.completions);

  // Agenda lembrete diário no mount (com nome da criança, se houver)
  useEffect(() => {
    scheduleDailyReminder((criancas[0]?.nome || "").split(" ")[0]);
  }, [criancas]);

  // Diário e fluxo "Como foi?"
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [comoFoiOpen, setComoFoiOpen] = useState(false);

  // Streak milestone trigger — once per (streak value) for free users.
  useEffect(() => {
    if (isPremium) return;
    if (diary.streak < 3) return;
    try {
      const shown = window.localStorage.getItem(MILESTONE_KEY);
      if (shown === String(diary.streak)) return;
      const t = setTimeout(() => {
        openPaywall("streak_milestone");
        try { window.localStorage.setItem(MILESTONE_KEY, String(diary.streak)); } catch {}
      }, 700);
      return () => clearTimeout(t);
    } catch {}
  }, [diary.streak, isPremium, openPaywall]);

  const [mood, setMood] = useState<Energy | null>(null);
  const filteredCats = useMemo(
    () => (mood ? CATS.filter((c) => c.energies.includes(mood)) : CATS),
    [mood],
  );

  const todayISO = () => new Date().toISOString().slice(0, 10);
  const surpriseUsedToday = () => {
    try { return window.localStorage.getItem(SURPRISE_DATE_KEY) === todayISO(); } catch { return false; }
  };

  const { surprise, loading: surprising, error: surpriseError, activity: surpriseActivity, reset: resetSurprise } = useSurpresaIA();
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const handleSurprise = async () => {
    // Free quota: 1 surpresa/dia. Premium: ilimitado.
    if (!isPremium && surpriseUsedToday()) {
      openPaywall("surprise_limit");
      return;
    }
    setSurpriseOpen(true);
    try {
      await surprise(mood ? { energia: mood } : undefined);
      if (!isPremium) {
        try { window.localStorage.setItem(SURPRISE_DATE_KEY, todayISO()); } catch {}
      }
    } catch (_) {}
  };
  const closeSurprise = () => {
    setSurpriseOpen(false);
    resetSurprise();
    // After 1-2 completions, nudge upgrade on close (free only, no streak milestone)
    if (!isPremium && diary.completions >= 1 && diary.completions <= 2) {
      setTimeout(() => openPaywall("after_completion"), 400);
    }
  };

  const handleCategoryTap = (c: Cat) => {
    if (c.premium && !isPremium) {
      openPaywall("premium_locked");
      return;
    }
    // Future: navigate to category list. No-op for now.
  };

  const handleBoraFazer = () => {
    // Counts as the daily "atividade de hoje". Sempre permitido (1 por dia já é o card fixo).
    // Não abre paywall aqui — a conclusão real (em outra tela) é que vai contabilizar.
  };



  return (
    <div
      data-tab="bora"
      className="bora-screen flex-1 overflow-y-auto"
      style={{ paddingBottom: 180 }}
    >
      <CriancaOnboarding open={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <SurpresaModal
        open={surpriseOpen}
        loading={surprising}
        activity={surpriseActivity}
        error={surpriseError}
        childName={firstName}
        onClose={closeSurprise}
        onRetry={() => surprise(mood ? { energia: mood } : undefined).catch(() => {})}
      />
      {/* Hero */}
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <GlassOrb Icon={Leaf} size={30} iconSize={13} colorFrom="#6FB04A" colorTo="#2F5E1F" />
          <span className="bora-screenfree-badge">Sem tela</span>
        </div>
        <h1
          className="font-bora-display mt-3"
          style={{
            fontSize: 46,
            lineHeight: 1.02,
            color: "var(--bora-green-deep)",
            letterSpacing: "-0.02em",
          }}
        >
          Bora{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p
          className="font-bora-body mt-2"
          style={{ fontSize: 15.5, color: "var(--bora-ink-soft)", lineHeight: 1.45 }}
        >
          Aqui dentro só tem ideia. A brincadeira de verdade acontece longe da tela.
        </p>
        <button
          type="button"
          onClick={handleSurprise}
          className="mt-5 w-full rounded-full py-3.5 font-bold text-white text-base flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(180deg, #FF9A4D 0%, #E8772A 100%)",
            border: "1.5px solid rgba(255,255,255,0.6)",
            boxShadow: "0 14px 32px -10px rgba(232,119,42,0.65), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <Sparkles size={18} />
          Surpresa da IA{firstName ? ` pra ${firstName}` : ""}
        </button>
      </header>

      {/* Diário Sem Tela — hero metric */}
      <section className="px-5">
        <Bezel tint="#4F8B66">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GlassOrb Icon={TreePine} size={28} iconSize={13} colorFrom="#6FB04A" colorTo="#2F5E1F" />
              <span
                className="font-bora-body"
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#2F5E45",
                }}
              >
                Diário Sem Tela
              </span>
            </div>
            <span
              className="font-bora-body"
              style={{ fontSize: 11, color: "var(--bora-ink-soft)", fontWeight: 600 }}
            >
              {personalTag}
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <div
                className="font-bora-display"
                style={{ fontSize: 34, color: "var(--bora-green-deep)", letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                {diary.minutes}
                <span style={{ fontSize: 16, marginLeft: 4, color: "var(--bora-ink-soft)" }}>min</span>
              </div>
              <div
                className="font-bora-body mt-1"
                style={{ fontSize: 12.5, color: "var(--bora-ink-soft)", display: "flex", alignItems: "center", gap: 4 }}
              >
                <Clock size={12} strokeWidth={2.4} />
                tempo sem tela criado
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                className="font-bora-display"
                style={{ fontSize: 22, color: "#B85F0E", letterSpacing: "-0.02em", lineHeight: 1, display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <Flame size={18} strokeWidth={2.4} style={{ color: "#E8821A" }} />
                {diary.streak}
              </div>
              <div
                className="font-bora-body mt-1"
                style={{ fontSize: 12, color: "var(--bora-ink-soft)" }}
              >
                {diary.streak === 1 ? "dia seguido" : "dias seguidos"}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px dashed rgba(47,94,69,.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Tree leaves={diary.completions} />
            <span
              className="font-bora-body"
              style={{ fontSize: 12, color: "var(--bora-ink-soft)" }}
            >
              {diary.completions === 0
                ? "A arvorezinha tá esperando a primeira folha 🌱"
                : `${diary.completions} ${diary.completions === 1 ? "folha" : "folhas"} conquistadas`}
            </span>
          </div>
        </Bezel>
      </section>

      {/* Surpresa da IA — card premium com bezel */}
      <section className="px-5 mt-5">
        <Bezel tint="#E8821A">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GlassOrb Icon={Wand2} size={28} iconSize={13} colorFrom="#F4A659" colorTo="#E8821A" />
              <span
                className="font-bora-body"
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--bora-orange)",
                }}
              >
                Atividade de hoje
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <GlassOrb Icon={Leaf} size={24} iconSize={11} colorFrom="#6FB04A" colorTo="#2F5E1F" />
              <span className="bora-screenfree-badge">15 min</span>
            </div>
          </div>

          <div
            className="font-bora-body mt-2"
            style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--bora-ink-soft)" }}
          >
            {personalTag}
          </div>

          <h2
            className="font-bora-display mt-1"
            style={{ fontSize: 24, color: "var(--bora-green-deep)", letterSpacing: "-0.01em" }}
          >
            Caça ao tesouro das cores
          </h2>
          <p
            className="font-bora-body mt-2"
            style={{ fontSize: 14.5, color: "var(--bora-ink-soft)", lineHeight: 1.5 }}
          >
            {firstName
              ? `${firstName} escolhe uma cor e sai pela casa caçando 5 objetos dessa cor. Quem achar primeiro conta uma história sobre o item.`
              : "Escolham uma cor e saiam pela casa caçando 5 objetos dessa cor. Quem achar primeiro conta uma história sobre o item."}
          </p>

          {/* CTA premium 3D */}
          <div
            style={{
              marginTop: 18,
              borderRadius: 999,
              padding: 1.5,
              background:
                "linear-gradient(160deg, #ffffff 0%, #F4A659 30%, #E8821A 60%, #B85F0E 100%)",
              boxShadow:
                "0 16px 32px -10px rgba(232,130,26,.55), 0 4px 10px rgba(60,40,15,.18)",
            }}
          >
            <button
              type="button"
              className="w-full active:scale-[0.98]"
              style={{
                position: "relative",
                borderRadius: 999,
                padding: "14px 22px",
                background:
                  "linear-gradient(155deg, #FFB877 0%, #F4A659 35%, #E8821A 70%, #C56C12 100%)",
                color: "#fff",
                fontFamily: "'Fredoka', 'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: "0.01em",
                overflow: "hidden",
                boxShadow:
                  "inset 0 1.5px 1px rgba(255,255,255,.7), inset 0 -6px 12px rgba(120,50,0,.25)",
                transition: "transform 180ms cubic-bezier(.22,1,.36,1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, height: "55%",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.05) 100%)",
                  borderTopLeftRadius: 999,
                  borderTopRightRadius: 999,
                  pointerEvents: "none",
                }}
              />
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <GlassOrb Icon={Leaf} size={22} iconSize={11} colorFrom="#6FB04A" colorTo="#2F5E1F" />
                Bora fazer!
                <ChevronRight size={18} strokeWidth={2.5} style={{ opacity: 0.9 }} />
              </span>
            </button>
          </div>
        </Bezel>
      </section>

      {/* Como a criança tá agora? — energy filter */}
      <section className="px-5 mt-7">
        <h3
          className="font-bora-display mb-2"
          style={{ fontSize: 17, color: "var(--bora-green-deep)", letterSpacing: "-0.01em" }}
        >
          Como {firstName || "a criança"} tá agora?
        </h3>
        <p
          className="font-bora-body mb-3"
          style={{ fontSize: 12.5, color: "var(--bora-ink-soft)" }}
        >
          Toque pra filtrar por energia. Toque de novo pra ver tudo.
        </p>
        <div className="flex gap-2">
          {MOOD_PILLS.map((p) => (
            <MoodPill
              key={p.key}
              emoji={p.emoji}
              label={p.label}
              tint={p.tint}
              active={mood === p.key}
              onClick={() => setMood(mood === p.key ? null : p.key)}
            />
          ))}
        </div>
      </section>

      {/* Explorar por tipo */}
      <section className="px-5 mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <h3
            className="font-bora-display"
            style={{ fontSize: 19, color: "var(--bora-green-deep)", letterSpacing: "-0.01em" }}
          >
            Explorar por tipo
          </h3>
          {mood && (
            <button
              type="button"
              onClick={() => setMood(null)}
              className="font-bora-body active:opacity-70"
              style={{ fontSize: 12.5, color: "var(--bora-ink-soft)", textDecoration: "underline" }}
            >
              limpar filtro
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredCats.map((c) => (
            <GlassCard key={c.key} c={c} locked={!!c.premium && !isPremium} onClick={() => handleCategoryTap(c)} />
          ))}
        </div>

        {filteredCats.length === 0 && (
          <p
            className="font-bora-body text-center mt-4"
            style={{ fontSize: 13.5, color: "var(--bora-ink-soft)" }}
          >
            Nenhum tipo pra essa energia agora. Toque em outro humor.
          </p>
        )}
      </section>

      {/* Closing */}
      <section className="px-5 mt-8">
        <Bezel tint="#4F8B66">
          <div className="text-center">
            <GlassOrb Icon={Leaf} size={64} iconSize={30} colorFrom="#6FB04A" colorTo="#2F5E1F" />
            <p
              className="font-bora-display mt-3"
              style={{ fontSize: 17, color: "var(--bora-green-deep)" }}
            >
              Menos tela. Mais memória.
            </p>
            <p
              className="font-bora-body mt-1"
              style={{ fontSize: 13.5, color: "var(--bora-ink-soft)" }}
            >
              O Kidzz dá a ideia. {firstName ? `${firstName} e vocês` : "Vocês"} fazem o resto.
            </p>
          </div>
        </Bezel>
      </section>
    </div>
  );
};

export default memo(BoraScreen);
