import { memo, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { useCriancas } from "@/hooks/useCriancas";
import { useSurpresaIA } from "@/hooks/useSurpresaIA";
import { useBoraStats } from "@/hooks/useBoraStats";
import { useDesafioSemana } from "@/hooks/useDesafioSemana";
import { useIndicacao } from "@/hooks/useIndicacao";
import { usePaywall } from "@/components/paywall/PaywallProvider";
import { CriancaOnboarding } from "./CriancaOnboarding";
import { SurpresaModal } from "./SurpresaModal";
import { ComoFoiModal } from "./ComoFoiModal";
import { DiarioSemTela } from "./DiarioSemTela";
import { GuardaCelularScreen } from "./GuardaCelularScreen";
import { scheduleDailyReminder } from "@/lib/dailyReminder";

interface Props {
  onBack?: () => void;
}

type Energy = "agitada" | "cansada" | "curiosa";

/* ── SVG paths (fiéis ao design Bora.dc.html) ── */
const D = {
  back: "M19 12H5m6-6-6 6 6 6",
  bolt: "M13 2 4.5 13.5H11l-1 8L19.5 10H13l0-8Z",
  shield: "M12 3l7 2.5V11c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5Z",
  sparkle: "M12 3l2 4.5 5 .5-3.7 3.4 1 4.9L12 14l-4.3 2.2 1-4.9L5 7.9l5-.4L12 3Z",
  palette:
    "M12 3a9 9 0 0 0 0 18c1.4 0 2-1 2-2s-.6-1.5-.6-2.4c0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Zm-4.5 9a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm3-4a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm5 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z",
  arrow: "M5 12h13m-6-6 6 6-6 6",
  clock: "M12 8v4.5l3 1.8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  leaf: "M5 19C5 10 12 5 20 5c0 8-5 15-14 15Zm0 0c3-5 7-9 12-11",
  users:
    "M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7-6a3 3 0 0 1 0 6m4 6v-1a4 4 0 0 0-3-3.8",
  share:
    "M18 8a3 3 0 1 0-2.8-4M18 8a3 3 0 0 1-2.8-2M18 8v.5m0 7.5a3 3 0 1 0 2.8 4M18 16a3 3 0 0 1 2.8 2M8.7 10.7l6.6-3.4m-6.6 6l6.6 3.4M9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  copy: "M9 9V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-4M5 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z",
  check: "M5 12l4 4L19 7",
  gift: "M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M2 7h20v5H2V7Zm10 0v14M12 7S9 2 6.5 4 8 7 12 7Zm0 0s3-5 5.5-3S16 7 12 7Z",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z",
  // category glyphs
  ciencia: "M9 3h6M10 3v5.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8.5V3",
  natureza: "M12 3 5 20h14L12 3Zm0 6 3.5 11M12 9 8.5 20",
  movimento:
    "M6.5 6.5 4 9m0 0 2.5 2.5M4 9h5m8.5 8.5L20 15m0 0-2.5-2.5M20 15h-5M6.5 17.5 9 20m6-16 2.5 2.5M9 4 6.5 6.5",
  conversa:
    "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-4 3.5V16H6.5A2.5 2.5 0 0 1 4 13.5Z",
  pot: "M4 10h16M6 10a6 6 0 0 0 12 0M9 6c0-1 .5-1.5.5-2.5M12 6c0-1 .5-1.5.5-2.5M15 6c0-1 .5-1.5.5-2.5M5 20h14",
};

/* ── Helpers de estilo (idênticos ao design) ── */
const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/** Chip de vidro branco com brilho (categorias / mission). */
const glossChip = (size = 46, radius = 14): CSSProperties => ({
  position: "relative",
  flex: "none",
  width: size,
  height: size,
  borderRadius: radius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  background: "linear-gradient(150deg,rgba(255,255,255,.92),rgba(255,255,255,.55))",
  border: "1px solid rgba(255,255,255,.95)",
  boxShadow: "0 6px 14px rgba(0,0,0,.16), inset 0 1px 2px rgba(255,255,255,.9)",
});

/** Botão-seta glossy (círculo com gradiente radial). */
const arrowGloss = (l: string, m: string, d: string, size = 50): CSSProperties => ({
  position: "relative",
  overflow: "hidden",
  flex: "none",
  width: size,
  height: size,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `radial-gradient(130% 130% at 32% 22%, #FFFFFF 0%, ${l} 20%, ${m} 56%, ${d} 100%)`,
  border: "1px solid rgba(255,255,255,.75)",
  boxShadow: `0 7px 16px ${hexA(d, 0.5)}, 0 0 16px ${hexA(m, 0.45)}, inset 0 2px 3px rgba(255,255,255,.7), inset 0 -5px 9px rgba(0,0,0,.2)`,
});

/* ── Ícone SVG genérico ── */
const Icon = ({
  d,
  stroke = "#fff",
  size = 21,
  sw = 1.9,
  fill = "none",
}: {
  d: string;
  stroke?: string;
  size?: number;
  sw?: number;
  fill?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d={d} stroke={fill === "none" ? stroke : "none"} fill={fill === "none" ? "none" : fill} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Categorias reais (dados do app) + estilo visual do design ── */
type Cat = {
  key: string;
  label: string;
  d: string;
  grad: [string, string];
  stroke: string;
  titleColor: string;
  energies: Energy[];
  premium?: boolean;
};

const CATS: Cat[] = [
  { key: "ciencia", label: "Ciência", d: D.ciencia, grad: ["#BCD8F2", "#7FA8D8"], stroke: "#2E5A8A", titleColor: "#2E5A8A", energies: ["curiosa"], premium: true },
  { key: "sensorial", label: "Sensorial", d: D.sparkle, grad: ["#F2C0D8", "#D888B0"], stroke: "#9A3A6A", titleColor: "#9A3A6A", energies: ["agitada", "cansada"] },
  { key: "natureza", label: "Natureza", d: D.natureza, grad: ["#C4E8B8", "#7AB86A"], stroke: "#2E7A3E", titleColor: "#2E7A3E", energies: ["curiosa", "agitada"] },
  { key: "arte", label: "Arte", d: D.palette, grad: ["#F5D9A8", "#E0A85A"], stroke: "#9A6A20", titleColor: "#9A6A20", energies: ["cansada", "curiosa"] },
  { key: "movimento", label: "Movimento", d: D.movimento, grad: ["#F5C0A8", "#DE8A66"], stroke: "#A85434", titleColor: "#A85434", energies: ["agitada"] },
  { key: "conversa", label: "Conversa", d: D.conversa, grad: ["#D8C4F2", "#A888E0"], stroke: "#6A3A9A", titleColor: "#6A3A9A", energies: ["cansada", "curiosa"] },
  { key: "cozinha", label: "Cozinha", d: D.pot, grad: ["#FCD9B8", "#EBA36A"], stroke: "#9A5A20", titleColor: "#9A5A20", energies: ["curiosa"], premium: true },
];

const MOOD_PILLS: { key: Energy; label: string; dot: string }[] = [
  { key: "agitada", label: "Agitada", dot: "#E4722A" },
  { key: "cansada", label: "Cansada", dot: "#6E7FE8" },
  { key: "curiosa", label: "Curiosa", dot: "#2E8A54" },
];

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
  const { desafio } = useDesafioSemana();
  const { link: indicacaoLink, loading: indicacaoLoading } = useIndicacao();

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

  // Auto-aplica código de indicação se houver na URL/sessionStorage (1x por user)
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
        try {
          window.localStorage.setItem(MILESTONE_KEY, String(diary.streak));
        } catch {}
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
    // Free quota: 1 surpresa/dia. Premium: ilimitado.
    if (!isPremium && surpriseUsedToday()) {
      openPaywall("surprise_limit");
      return;
    }
    setSurpriseOpen(true);
    try {
      await surprise(mood ? { energia: mood } : undefined);
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
    // Free categories: dispara Surpresa filtrada pela categoria
    if (!isPremium && surpriseUsedToday()) {
      openPaywall("surprise_limit");
      return;
    }
    setSurpriseOpen(true);
    surprise({ categoria: c.key, ...(mood ? { energia: mood } : {}) })
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

  const [guardaOpen, setGuardaOpen] = useState(false);

  const handleBoraFazer = () => {
    // Etapa 1: tela verde "Guarda o celular"
    setGuardaOpen(true);
  };

  const handleGuardaDone = () => {
    setGuardaOpen(false);
    // Etapa 2: "Como foi?" + foto
    setTimeout(() => setComoFoiOpen(true), 200);
  };

  // Atualização otimista do diário local quando salva uma conclusão
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
  };

  // Indicação (dados reais useIndicacao)
  const [copied, setCopied] = useState(false);
  const copyRef = async () => {
    if (!indicacaoLink) return;
    try {
      await navigator.clipboard.writeText(indicacaoLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  const shareRef = async () => {
    if (!indicacaoLink) return;
    const text =
      "Você precisa conhecer o Kidzz. A gente tá num movimento de menos tela e mais brincadeira. Entra com meu link e ganhamos 1 mês de Premium juntos 🌿";
    if (typeof navigator !== "undefined" && (navigator as unknown as { share?: unknown }).share) {
      try {
        await (navigator as unknown as { share: (d: unknown) => Promise<void> }).share({
          title: "Movimento Menos Tela",
          text,
          url: indicacaoLink,
        });
        return;
      } catch {}
    }
    copyRef();
  };

  // Desafio da semana (dados reais useDesafioSemana)
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

  const INK = "#3A1D0E";
  const INK_SOFT = "#7A5240";
  const ORANGE = "#D9622B";

  return (
    <div
      data-tab="bora"
      style={{
        height: "100%",
        position: "relative",
        fontFamily: "'Nunito',system-ui,sans-serif",
        background: "linear-gradient(180deg,#FFEEE0 0%,#FEDBC6 38%,#FBC3A4 74%,#F4A97F 100%)",
      }}
    >
      {/* keyframes locais (prefixo bora-) */}
      <style>{`
        @keyframes bora-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bora-cascade{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bora-heroIn{from{opacity:0;transform:translateY(-14px) scale(1.04)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes bora-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes bora-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,26px) scale(1.18)}}
        @keyframes bora-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-40px,-22px) scale(1.12)}}
        @keyframes bora-sunspin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes bora-sparklefloat{0%,100%{opacity:.1;transform:translateY(0) scale(.7)}50%{opacity:.95;transform:translateY(-16px) scale(1.15)}}
        @keyframes bora-twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
        @keyframes bora-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
        @keyframes bora-birddrift{0%{transform:translate(0,0) rotate(0);opacity:0}12%{opacity:.55}88%{opacity:.5}100%{transform:translate(-120px,42px) rotate(-8deg);opacity:0}}
      `}</style>

      {/* Modais / fluxos (funcionalidade preservada) */}
      <CriancaOnboarding open={showOnboarding} onClose={() => setShowOnboarding(false)} />
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
        onRetry={() => surprise(mood ? { energia: mood } : undefined).catch(() => {})}
      />

      {/* atmosfera / orbes que flutuam (fixos atrás do scroll) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(46% 30% at 80% 22%,rgba(255,180,120,.24),transparent 70%),radial-gradient(42% 28% at 8% 52%,rgba(255,140,110,.16),transparent 70%),radial-gradient(52% 32% at 55% 92%,rgba(240,120,90,.14),transparent 70%)",
        }}
      />
      <div style={{ position: "absolute", top: -60, left: -80, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,190,130,.34),transparent 65%)", filter: "blur(28px)", animation: "bora-drift1 13s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", left: -90, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,150,120,.26),transparent 65%)", filter: "blur(30px)", animation: "bora-drift2 17s ease-in-out 2s infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 80, right: -100, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,170,110,.24),transparent 65%)", filter: "blur(32px)", animation: "bora-drift1 19s ease-in-out 4s infinite", pointerEvents: "none" }} />

      <div
        className="bora-screen"
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
          scrollbarWidth: "none",
          position: "relative",
        }}
      >
        {/* ── HERO ── */}
        <div style={{ position: "relative", paddingTop: 2 }}>
          {/* blur da cena atrás */}
          <div
            style={{
              position: "absolute", top: -16, left: 0, width: "100%", height: 300,
              backgroundImage: "url('/exemplos/assets/cena-bora.png')",
              backgroundSize: "cover", backgroundPosition: "50% 30%",
              filter: "blur(40px) saturate(1.4)", opacity: 0.42, transform: "scale(1.2)",
              WebkitMaskImage: "linear-gradient(180deg,#000 42%,transparent 94%)",
              maskImage: "linear-gradient(180deg,#000 42%,transparent 94%)", pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative", width: "100%", height: 288,
              WebkitMaskImage: "linear-gradient(180deg,#000 66%,rgba(0,0,0,.5) 84%,transparent 100%)",
              maskImage: "linear-gradient(180deg,#000 66%,rgba(0,0,0,.5) 84%,transparent 100%)",
              animation: "bora-heroIn .7s cubic-bezier(.22,1,.36,1) both",
            }}
          >
            <img
              src="/exemplos/assets/cena-bora.png"
              alt="Gui, o camaleão, correndo com a família ao pôr do sol"
              style={{ position: "absolute", top: 30, left: 0, width: "100%", height: "auto", objectFit: "contain", filter: "saturate(1.1) contrast(1.03)" }}
            />
            <div style={{ position: "absolute", right: "12%", bottom: 14, width: 66, height: 66, borderRadius: "50%", background: "radial-gradient(130% 130% at 32% 26%,rgba(255,255,255,.5),rgba(255,210,170,.25) 55%,rgba(255,160,110,.12))", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.6)", boxShadow: "0 10px 24px rgba(200,100,50,.28),inset 0 2px 4px rgba(255,255,255,.7)", animation: "bora-floaty 7s ease-in-out .5s infinite", pointerEvents: "none" }} />
          </div>

          {/* sol */}
          <div style={{ position: "absolute", top: 30, left: "19%", animation: "bora-floaty 5s ease-in-out infinite", zIndex: 5 }}>
            <svg width="52" height="52" viewBox="0 0 64 64" fill="none" style={{ animation: "bora-sunspin 26s linear infinite", transformOrigin: "32px 32px" }}>
              <circle cx="32" cy="32" r="13" fill="rgba(255,224,150,.85)" stroke="rgba(255,255,255,.85)" strokeWidth="2" />
              <g stroke="#FFC24D" strokeWidth="2.6" strokeLinecap="round">
                <path d="M32 6v7M32 51v7M6 32h7M51 32h7M13 13l5 5M46 46l5 5M51 13l-5 5M18 46l-5 5" />
              </g>
            </svg>
          </div>
          <div style={{ position: "absolute", top: 70, left: "56%", width: 5, height: 5, borderRadius: 99, background: "#FFE0A8", boxShadow: "0 0 10px 3px rgba(255,190,110,.85)", animation: "bora-twinkle 3.2s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 150, left: "68%", width: 4, height: 4, borderRadius: 99, background: "#FFD0B8", boxShadow: "0 0 8px 2px rgba(255,150,120,.8)", animation: "bora-sparklefloat 4.4s ease-in-out 1s infinite" }} />
          <div style={{ position: "absolute", top: 16, left: "14%", pointerEvents: "none", animation: "bora-birddrift 15s linear 1s infinite" }}>
            <svg width="20" height="12" viewBox="0 0 24 14" fill="none"><path d="M2 8c3-5 5-5 8 0m0 0c3-5 5-5 8 0" stroke="#C9744A" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </div>

          {/* voltar → onBack */}
          <button
            onClick={() => onBack?.()}
            className="active:scale-90"
            style={{ position: "absolute", top: 62, left: 16, width: 42, height: 42, borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,.6)", backdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 16px rgba(150,80,40,.2),inset 0 1px 0 rgba(255,255,255,1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s", zIndex: 6 }}
          >
            <Icon d={D.back} stroke="#7A3A1E" size={19} sw={2.2} />
          </button>
          <div style={{ position: "absolute", top: 62, right: 16, display: "flex", gap: 8, zIndex: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999, background: "rgba(255,255,255,.6)", backdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 16px rgba(150,80,40,.2),inset 0 1px 0 rgba(255,255,255,1)", fontWeight: 900, fontSize: 13, color: "#7A3A1E" }}>
              <Icon d={D.bolt} stroke="#E0742B" size={15} sw={1.9} />
              {heroStreak}
            </div>
          </div>

          {/* título */}
          <div style={{ padding: "14px 20px 2px", animation: "bora-cascade .6s cubic-bezier(.22,1,.36,1) .06s both", zIndex: 4, position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Icon d={D.bolt} stroke="#D9622B" size={15} sw={1.9} />
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.8px", color: "#C15A2A" }}>BORA!</span>
            </div>
            <h1 style={{ margin: "0 0 7px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 29, lineHeight: 1.13, color: INK, letterSpacing: "-.3px" }}>
              Bora viver de <span style={{ color: ORANGE }}>verdade</span>
              {firstName ? `, ${firstName}` : " hoje"}?
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, lineHeight: 1.45, color: INK_SOFT, maxWidth: 290 }}>
              Missões pra sair da tela e criar memórias juntos. Complete e mantenha a chama acesa.
            </p>

            {/* Surpresa da IA — feature principal preservada */}
            <button
              onClick={handleSurprise}
              className="active:scale-[0.98]"
              style={{
                position: "relative", overflow: "hidden", marginTop: 14, width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                padding: "13px 18px", borderRadius: 999, cursor: "pointer",
                border: "1px solid rgba(255,255,255,.6)",
                background: "linear-gradient(155deg,#FFB877 0%,#F4A659 35%,#E8821A 70%,#C56C12 100%)",
                color: "#fff", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 15.5,
                boxShadow: "0 16px 32px -10px rgba(232,130,26,.55), inset 0 1.5px 1px rgba(255,255,255,.7), inset 0 -6px 12px rgba(120,50,0,.25)",
                transition: "transform .18s cubic-bezier(.22,1,.36,1)",
              }}
            >
              <span aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(120% 130% at 15% 6%,rgba(255,255,255,.34),transparent 55%)" }} />
              <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "60%", height: "100%", pointerEvents: "none", background: "linear-gradient(100deg,transparent 0%,rgba(255,255,255,.28) 50%,transparent 100%)", animation: "bora-shine 6.5s ease-in-out infinite" }} />
              <span style={{ position: "relative", zIndex: 2, display: "inline-flex", alignItems: "center", gap: 9 }}>
                <Icon d={D.sparkle} stroke="#fff" size={18} sw={2} />
                Surpresa da IA{firstName ? ` pra ${firstName}` : ""}
              </span>
            </button>
          </div>
        </div>

        {/* ── MISSÃO DE HOJE ── */}
        <div style={{ padding: "16px 16px 4px" }}>
          <button
            onClick={handleBoraFazer}
            className="active:scale-[0.98]"
            style={{
              position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer",
              borderRadius: 24, padding: "16px 16px", border: "1px solid rgba(255,255,255,.6)",
              background: "linear-gradient(150deg,#FF9A5A 0%,#F27246 55%,#D9542E 100%)",
              boxShadow: "0 16px 34px rgba(200,90,40,.34), inset 0 1.5px 0 rgba(255,255,255,.5)",
              transition: "transform .3s cubic-bezier(.34,1.4,.64,1)",
              animation: "bora-cascade .55s cubic-bezier(.22,1,.36,1) both",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 120% at 12% 10%,rgba(255,255,255,.28),transparent 55%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: "70%", height: "100%", pointerEvents: "none", background: "linear-gradient(100deg,transparent 0%,rgba(255,255,255,.22) 50%,transparent 100%)", animation: "bora-shine 6.5s ease-in-out infinite" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 2 }}>
              <div style={{ flex: "none", width: 54, height: 54, borderRadius: 17, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(130% 130% at 30% 22%, rgba(255,255,255,.5) 0%, rgba(255,255,255,.18) 55%, rgba(255,255,255,.06) 100%)", border: "1px solid rgba(255,255,255,.55)", boxShadow: "inset 0 1px 2px rgba(255,255,255,.7), 0 4px 10px rgba(0,0,0,.18)" }}>
                <Icon d={D.palette} stroke="#fff" size={30} sw={1.9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1.4px", color: "rgba(255,255,255,.82)" }}>MISSÃO DE HOJE · {personalTag.toUpperCase()}</div>
                <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#fff", lineHeight: 1.14, marginTop: 1 }}>{TODAY_ACTIVITY.titulo}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,.9)", marginTop: 2 }}>
                  {firstName ? `${firstName} escolhe uma cor` : "Escolham uma cor"} e cacem 5 objetos dela · {TODAY_ACTIVITY.tela_min} min
                </div>
              </div>
              <div style={{ flex: "none", width: 44, height: 44, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", boxShadow: "0 6px 14px rgba(0,0,0,.24), inset 0 1px 1px rgba(255,255,255,.9)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#D9622B" /></svg>
              </div>
            </div>
          </button>
        </div>

        {/* ── DIÁRIO SEM TELA (stats reais → abre diário) ── */}
        <div style={{ padding: "10px 16px 4px" }}>
          <button
            onClick={() => setDiaryOpen(true)}
            className="active:scale-[0.99]"
            style={{
              position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer",
              borderRadius: 22, padding: "15px 16px", border: "1.5px solid rgba(255,255,255,.85)",
              background: "linear-gradient(155deg,rgba(255,255,255,.72),rgba(214,236,204,.66))",
              backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)",
              boxShadow: "0 12px 26px rgba(120,160,90,.2), inset 0 2px 0 rgba(255,255,255,.8)",
              fontFamily: "'Nunito',sans-serif",
            }}
          >
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(120% 90% at 18% 6%,rgba(255,255,255,.55),transparent 52%)" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: "62%", height: "100%", pointerEvents: "none", background: "linear-gradient(100deg,transparent 0%,rgba(255,255,255,.18) 50%,transparent 100%)", animation: "bora-shine 7.5s ease-in-out infinite" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 30, lineHeight: 1, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.15))" }}>🌳</span>
                <div>
                  <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 22, color: "#2E7A4E", lineHeight: 1 }}>
                    {heroMinutes}
                    <span style={{ fontSize: 12, fontWeight: 800, marginLeft: 4, color: "#4E6B4A" }}>min sem tela</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#4E6B4A", marginTop: 3 }}>
                    {heroLeaves === 0
                      ? "A arvorezinha tá esperando a 1ª folha 🌱"
                      : `${heroLeaves} ${heroLeaves === 1 ? "folha conquistada" : "folhas conquistadas"}`}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.95)", boxShadow: "0 4px 10px rgba(120,160,90,.18), inset 0 1px 0 rgba(255,255,255,.9)" }}>
                <Icon d={D.bolt} stroke="#E0742B" size={14} sw={1.9} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#B85F0E" }}>{heroStreak}</span>
              </div>
            </div>
          </button>
        </div>

        {/* ── COMO A CRIANÇA TÁ AGORA? (filtro de energia) ── */}
        <div style={{ padding: "20px 20px 6px" }}>
          <h2 style={{ margin: "0 0 3px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 18, color: INK }}>
            Como {firstName || "a criança"} tá agora?
          </h2>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#8A6650", marginBottom: 12 }}>
            Toque pra filtrar por energia. Toque de novo pra ver tudo.
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            {MOOD_PILLS.map((mo) => {
              const on = mood === mo.key;
              return (
                <button
                  key={mo.key}
                  onClick={() => setMood(on ? null : mo.key)}
                  className="active:scale-95"
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "11px 17px", borderRadius: 999, cursor: "pointer",
                    fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 13,
                    color: on ? "#fff" : "#6E4A2E",
                    border: on ? "1px solid rgba(255,255,255,.6)" : "1px solid rgba(255,255,255,.95)",
                    background: on ? "linear-gradient(160deg,#F79A3E,#E4722A)" : "rgba(255,255,255,.72)",
                    backdropFilter: "blur(8px)",
                    boxShadow: on
                      ? "0 8px 18px rgba(210,110,40,.35), inset 0 1px 0 rgba(255,255,255,.4)"
                      : "0 4px 10px rgba(120,70,40,.1), inset 0 1px 0 rgba(255,255,255,.8)",
                    transition: "transform .2s",
                  }}
                >
                  <span style={{ flex: "none", width: 9, height: 9, borderRadius: 999, background: on ? "#fff" : mo.dot, boxShadow: on ? "none" : `0 0 6px ${hexA(mo.dot, 0.6)}` }} />
                  {mo.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EXPLORAR POR TIPO (categorias reais) ── */}
        <div style={{ padding: "16px 20px 4px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 18, color: INK }}>Explorar por tipo</h2>
          {mood && (
            <button onClick={() => setMood(null)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 12, color: "#C15A2A", padding: 0, textDecoration: "underline" }}>
              limpar filtro
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px 6px" }}>
          {filteredCats.map((c) => {
            const locked = !!c.premium && !isPremium;
            return (
              <button
                key={c.key}
                onClick={() => handleCategoryTap(c)}
                className="active:scale-[0.97]"
                style={{
                  position: "relative", overflow: "hidden", textAlign: "left", cursor: "pointer",
                  borderRadius: 22, padding: "14px 15px 15px", minHeight: 108,
                  border: "1.5px solid rgba(255,255,255,.85)",
                  background: `linear-gradient(155deg,${hexA(c.grad[0], 0.82)},${hexA(c.grad[1], 0.72)})`,
                  backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)",
                  boxShadow: `0 12px 26px ${hexA(c.grad[1], 0.3)}, inset 0 2px 0 rgba(255,255,255,.8)`,
                  transition: "transform .3s cubic-bezier(.34,1.4,.64,1)",
                  fontFamily: "'Nunito',sans-serif",
                  animation: "bora-cascade .5s cubic-bezier(.22,1,.36,1) both",
                  filter: locked ? "saturate(.9)" : "none",
                }}
              >
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(120% 90% at 20% 8%,rgba(255,255,255,.5),transparent 52%)" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
                  <div
                    style={{
                      position: "relative",
                      flex: "none",
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      background: "linear-gradient(150deg,rgba(255,255,255,.92),rgba(255,255,255,.55))",
                      border: "1px solid rgba(255,255,255,.95)",
                      boxShadow: `0 6px 14px ${hexA(c.grad[1], 0.35)}, inset 0 1px 2px rgba(255,255,255,.9)`,
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, borderRadius: 13, background: "radial-gradient(120% 120% at 30% 20%,rgba(255,255,255,.8),transparent 60%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: "-40%", left: "-30%", width: "80%", height: "60%", background: "linear-gradient(120deg,transparent,rgba(255,255,255,.55),transparent)", animation: "bora-shine 5.5s ease-in-out infinite", pointerEvents: "none" }} />
                    <span style={{ position: "relative", zIndex: 2 }}><Icon d={c.d} stroke={c.stroke} size={21} sw={1.9} /></span>
                  </div>
                  {locked && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 999, background: "linear-gradient(150deg,#FFE9A8,#F5C24E)", boxShadow: "0 3px 8px rgba(190,140,30,.3),inset 0 1px 0 rgba(255,255,255,.7)" }}>
                      <Icon d={D.lock} stroke="#7A5A10" size={10} sw={2} />
                      <span style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: ".6px", color: "#7A5A10" }}>PREMIUM</span>
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 16, color: c.titleColor, marginTop: 34, position: "relative", zIndex: 2 }}>{c.label}</div>
              </button>
            );
          })}
        </div>
        {filteredCats.length === 0 && (
          <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, fontWeight: 700, color: INK_SOFT, padding: "0 20px" }}>
            Nenhum tipo pra essa energia agora. Toque em outro humor.
          </p>
        )}

        {/* ── DESAFIO DA SEMANA (dados reais useDesafioSemana) ── */}
        {desafio && (
          <div style={{ padding: "16px 16px 4px" }}>
            <div
              style={{
                position: "relative", overflow: "hidden", borderRadius: 24, padding: 16,
                border: "1.5px solid rgba(255,255,255,.85)",
                background: "linear-gradient(155deg,rgba(232,244,214,.92),rgba(200,224,165,.8))",
                backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)",
                boxShadow: "0 14px 30px rgba(60,110,50,.18), inset 0 2px 0 rgba(255,255,255,.85)",
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              <div aria-hidden style={{ position: "absolute", right: -10, bottom: -14, opacity: 0.16, pointerEvents: "none" }}>
                <svg width="150" height="150" viewBox="0 0 24 24" fill="none"><path d="M12 3 3 20h18L12 3Zm0 5 4.5 12M12 8 7.5 20" stroke="#1E6B3E" strokeWidth="1.1" /></svg>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, position: "relative", zIndex: 2 }}>
                <Icon d={D.users} stroke="#2E7A4E" size={15} sw={1.9} />
                <span style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "1.4px", color: "#2E7A4E" }}>DESAFIO DA SEMANA</span>
              </div>
              <h3 style={{ margin: "6px 0 6px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 20, color: "#1E4D30", position: "relative", zIndex: 2 }}>
                {desafio.emoji} {desafio.titulo}
              </h3>
              <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, lineHeight: 1.5, color: "#3F6B4C", maxWidth: 250, position: "relative", zIndex: 2 }}>
                {desafio.descricao}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
                <div style={{ padding: "7px 13px", borderRadius: 999, background: "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.9)", fontSize: 10.5, fontWeight: 900, color: "#2E7A4E", backdropFilter: "blur(6px)" }}>
                  {desafio.hashtag}
                </div>
                <button
                  onClick={shareDesafio}
                  className="active:scale-95"
                  style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, padding: "11px 17px", borderRadius: 999, cursor: "pointer", border: "none", background: "linear-gradient(160deg,#2E8A54,#1E6B3E)", color: "#EAFBF0", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 12.5, boxShadow: "0 8px 18px rgba(30,90,50,.4),inset 0 1px 0 rgba(255,255,255,.3)" }}
                >
                  <Icon d={D.share} stroke="#EAFBF0" size={15} sw={1.9} />
                  Convidar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONVITE PREMIUM (dados reais useIndicacao) ── */}
        <div style={{ padding: "12px 16px 4px" }}>
          <div
            style={{
              position: "relative", overflow: "hidden", borderRadius: 24, padding: 16,
              border: "1.5px solid rgba(255,255,255,.85)",
              background: "linear-gradient(155deg,rgba(255,248,238,.9),rgba(255,232,208,.78))",
              backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)",
              boxShadow: "0 14px 30px rgba(200,120,50,.16), inset 0 2px 0 rgba(255,255,255,.85)",
              fontFamily: "'Nunito',sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
              <div style={{ flex: "none", width: 50, height: 50, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(130% 130% at 30% 22%,#FFD9A8,#F2823E 55%,#D9542E)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 6px 15px rgba(200,90,40,.35),inset 0 1px 2px rgba(255,255,255,.6)" }}>
                <Icon d={D.gift} stroke="#fff" size={24} sw={1.9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1.2px", color: "#D9622B" }}>CONVIDE UM PAI OU MÃE</div>
                <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 17, color: "#1E4D30", lineHeight: 1.15, marginTop: 2 }}>Vocês dois ganham 1 mês Premium</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 13 }}>
              <div style={{ flex: 1, minWidth: 0, padding: "11px 14px", borderRadius: 14, background: "rgba(255,255,255,.55)", border: "1px solid rgba(255,255,255,.85)", fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 700, color: "#6E4A2E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {indicacaoLoading ? "gerando seu link..." : indicacaoLink || "—"}
              </div>
              <button
                onClick={copyRef}
                disabled={!indicacaoLink}
                className="active:scale-95"
                style={{ flex: "none", display: "flex", alignItems: "center", gap: 5, padding: "11px 13px", borderRadius: 14, cursor: "pointer", background: copied ? "#2E7A4E" : "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,1)", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 11.5, color: copied ? "#fff" : "#2E7A4E", boxShadow: "0 3px 8px rgba(120,70,40,.12)" }}
              >
                <Icon d={copied ? D.check : D.copy} stroke={copied ? "#fff" : "#2E7A4E"} size={13} sw={2} />
                {copied ? "copiado" : "copiar"}
              </button>
            </div>
            <button
              onClick={shareRef}
              disabled={!indicacaoLink}
              className="active:scale-[0.98]"
              style={{ width: "100%", marginTop: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 16, cursor: "pointer", border: "none", background: "linear-gradient(160deg,#F79A3E,#E4722A)", color: "#fff", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 14, boxShadow: "0 10px 24px rgba(210,110,40,.4),inset 0 1px 0 rgba(255,255,255,.4)" }}
            >
              <Icon d={D.share} stroke="#fff" size={17} sw={1.9} />
              Convidar agora
            </button>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: "6px 20px 16px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#C88F6E" }}>
          Menos tela, mais memórias · Uma aventura por dia
        </div>
      </div>
    </div>
  );
};

export default memo(BoraScreen);
