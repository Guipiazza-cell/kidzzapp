import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Heart, Music2, Sun, Rocket, Moon, Briefcase,
  Mic, Sparkles, BookOpen, Sliders, Play, Lock, Star, X, Volume2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LivingForest from "./LivingForest";
import MorningKaraoke from "./MorningKaraoke";
import DanceWithAne from "./DanceWithAne";
import SungStories from "./SungStories";
import CreateMusic from "./CreateMusic";
import { getMusicXp, getMusicStreak, type MusicAchievement } from "@/lib/musicXp";
import { completeMissionStep, addXp, bumpSessionActions } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";
import GuidedActivityPlayer, { type GuidedActivity } from "./GuidedActivityPlayer";

interface Props {
  onBack: () => void;
  onNavigateToDreams: () => void;
  onXpEarned?: () => void;
  onOpenParental?: () => void;
  onOpenTravel?: () => void;
}

type Pillar = "morning" | "dance" | "stories" | "create";
type CategoryId = "featured" | "emotion" | "adventure" | "calm" | "travel";

interface Category {
  id: CategoryId;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string; // css linear-gradient
  tint: string; // hero tint hsl
  slotName: string; // imgCat_*
  tags: string[]; // maps activities
}

const CATEGORIES: Category[] = [
  {
    id: "featured",
    label: "Em destaque",
    subtitle: "As preferidas da família",
    icon: <Sun size={26} />,
    gradient: "linear-gradient(135deg, hsl(38 95% 62%) 0%, hsl(28 92% 55%) 100%)",
    tint: "38 95% 62%",
    slotName: "imgCat_featured",
    tags: ["featured"],
  },
  {
    id: "emotion",
    label: "Para emocionar",
    subtitle: "Músicas que tocam o coração",
    icon: <Heart size={26} />,
    gradient: "linear-gradient(135deg, hsl(150 55% 55%) 0%, hsl(160 50% 40%) 100%)",
    tint: "150 55% 50%",
    slotName: "imgCat_emotion",
    tags: ["emotion", "bond"],
  },
  {
    id: "adventure",
    label: "Aventura e Imaginação",
    subtitle: "Para sonhar e explorar",
    icon: <Rocket size={26} />,
    gradient: "linear-gradient(135deg, hsl(275 65% 62%) 0%, hsl(290 55% 48%) 100%)",
    tint: "275 65% 55%",
    slotName: "imgCat_adventure",
    tags: ["adventure", "movement"],
  },
  {
    id: "calm",
    label: "Para acalmar",
    subtitle: "Músicas para relaxar juntos",
    icon: <Moon size={26} />,
    gradient: "linear-gradient(135deg, hsl(220 60% 62%) 0%, hsl(255 55% 55%) 100%)",
    tint: "220 60% 58%",
    slotName: "imgCat_calm",
    tags: ["calm", "sleep"],
  },
  {
    id: "travel",
    label: "Modo Viagem",
    subtitle: "Trilhas sonoras pra qualquer lugar",
    icon: <Briefcase size={26} />,
    gradient: "linear-gradient(135deg, hsl(190 65% 55%) 0%, hsl(200 60% 42%) 100%)",
    tint: "190 65% 50%",
    slotName: "imgCat_travel",
    tags: ["travel"],
  },
];

// Atividades ativas (movimento/GoNoodle inspired) — nomes reais, SLOTS de imagem/áudio vazios
const ACTIVITIES: GuidedActivity[] = [
  {
    id: "cancoes-animais",
    title: "Canções dos Animais",
    subtitle: "Aprenda e cante com os bichinhos!",
    minutes: 8,
    ageRange: "2–6 anos",
    tags: ["featured", "adventure"],
    kind: "sing",
    instruction: "Imita a voz de cada bichinho quando ele aparecer!",
    slotImg: "imgAtiv_cancoes_animais",
    slotAudio: "exec_cancoes_animais",
    accent: "38 95% 62%",
  },
  {
    id: "palmas-ritmos",
    title: "Palmas e Ritmos",
    subtitle: "Siga o ritmo e divirta-se batendo palmas!",
    minutes: 6,
    ageRange: "3–6 anos",
    tags: ["featured", "movement"],
    kind: "clap",
    instruction: "Bata palma junto no tempo da música. Prontos?",
    slotImg: "imgAtiv_palmas",
    slotAudio: "exec_palmas",
    accent: "275 65% 62%",
  },
  {
    id: "instrumentos-mundo",
    title: "Instrumentos do Mundo",
    subtitle: "Descubra sons incríveis de vários lugares!",
    minutes: 10,
    ageRange: "4–8 anos",
    tags: ["adventure"],
    kind: "listen",
    instruction: "Feche os olhos e adivinha que instrumento é este!",
    slotImg: "imgAtiv_instrumentos",
    slotAudio: "exec_instrumentos",
    accent: "190 65% 55%",
  },
  {
    id: "cancoes-ninar",
    title: "Canções de Ninar",
    subtitle: "Melodias para acalmar e embalar o sono.",
    minutes: 12,
    ageRange: "0–4 anos",
    tags: ["calm", "sleep"],
    kind: "listen",
    instruction: "Diminua as luzes, respire fundo, e deixe a música embalar.",
    slotImg: "imgAtiv_ninar",
    slotAudio: "exec_ninar",
    accent: "220 60% 62%",
    parentMark: true,
  },
  {
    id: "danca-congela",
    title: "Dança Congela",
    subtitle: "Dance e pare quando a música congelar!",
    minutes: 5,
    ageRange: "3–8 anos",
    tags: ["featured", "movement", "adventure"],
    kind: "dance",
    instruction: "Dance! Quando a música PARAR — congela como estátua!",
    slotImg: "imgAtiv_congela",
    slotAudio: "exec_congela",
    accent: "38 95% 62%",
  },
  {
    id: "orquestra-cozinha",
    title: "Orquestra da Cozinha",
    subtitle: "Fazer banda com panela e colher!",
    minutes: 7,
    ageRange: "3–7 anos",
    tags: ["adventure", "movement"],
    kind: "play",
    instruction: "Pegue uma panela e uma colher. Vamos formar uma banda!",
    slotImg: "imgAtiv_cozinha",
    slotAudio: "exec_cozinha",
    accent: "275 65% 62%",
  },
  {
    id: "batuque-corpo",
    title: "Batuque do Corpo",
    subtitle: "Peito, perna, palma — o corpo vira instrumento!",
    minutes: 5,
    ageRange: "4–8 anos",
    tags: ["movement", "featured"],
    kind: "clap",
    instruction: "Peito, perna, palma. Vai seguindo o padrão comigo!",
    slotImg: "imgAtiv_batuque",
    slotAudio: "exec_batuque",
    accent: "150 55% 55%",
  },
  {
    id: "musica-nome",
    title: "A Música do Seu Nome",
    subtitle: "Invente uma cançãozinha com o nome de quem você ama.",
    minutes: 6,
    ageRange: "3–8 anos",
    tags: ["emotion", "bond"],
    kind: "sing",
    instruction: "Diga um nome. A gente inventa uma canção com ele!",
    slotImg: "imgAtiv_nome",
    slotAudio: "exec_nome",
    accent: "150 55% 55%",
  },
  {
    id: "danca-bichos",
    title: "Dança dos Bichos",
    subtitle: "Mexa como cada animal — pula, rasteja, voa!",
    minutes: 6,
    ageRange: "2–6 anos",
    tags: ["movement", "adventure"],
    kind: "dance",
    instruction: "Salta como sapo, voa como pássaro, rasteja como cobrinha!",
    slotImg: "imgAtiv_bichos",
    slotAudio: "exec_bichos",
    accent: "275 65% 62%",
  },
];

// Sons passivos (secundário)
const AMBIENT_SOUNDS = [
  { id: "floresta", title: "Floresta calma", slot: "som_floresta", premium: false },
  { id: "chuva", title: "Chuva no telhado", slot: "som_chuva", premium: false },
  { id: "ondas", title: "Ondas do mar", slot: "som_ondas", premium: true },
  { id: "piano", title: "Piano do soninho", slot: "som_piano", premium: true },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia, família! 💚";
  if (h < 18) return "Boa tarde, família! 💚";
  return "Boa noite, família! 💚";
};

const MusicForest = ({ onBack, onNavigateToDreams, onXpEarned, onOpenParental, onOpenTravel }: Props) => {
  const { profile, tier } = useAuth();
  const childName = profile?.child_name || "amigo";
  const isPremium = tier === "premium";

  const [activePillar, setActivePillar] = useState<Pillar | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [activeActivity, setActiveActivity] = useState<GuidedActivity | null>(null);
  const [xp, setXp] = useState(getMusicXp());
  const [streak, setStreak] = useState(getMusicStreak());
  const [achievementToast, setAchievementToast] = useState<MusicAchievement | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("kidzz_music_favs") || "[]"); } catch { return []; }
  });

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("kidzz_music_favs", JSON.stringify(next));
      return next;
    });
  };

  const openPaywall = (context: string) => {
    window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context } }));
  };

  const tryOpenPillar = (p: Pillar, premium: boolean) => {
    if (premium && !isPremium) { openPaywall(`music_${p}`); return; }
    setActivePillar(p);
  };

  const tryOpenActivity = (a: GuidedActivity) => {
    // atividades ativas grátis; sons/execução premium longa poderia ser pago — deixamos livre por navegação
    setActiveActivity(a);
  };

  const openCategory = (id: CategoryId) => {
    if (id === "travel") {
      if (!isPremium) { openPaywall("travel"); return; }
      onOpenTravel?.();
      return;
    }
    if (id === "calm") {
      setActiveCategory("calm");
      return;
    }
    setActiveCategory(id);
  };

  useEffect(() => {
    if (activePillar === null && activeActivity === null) {
      setXp(getMusicXp());
      setStreak(getMusicStreak());
    } else if (activePillar || activeActivity) {
      const { newlyMarked } = completeMissionStep("music");
      if (newlyMarked) {
        const { gained } = addXp("music");
        showXpGained(gained, "música");
        bumpSessionActions();
      }
    }
  }, [activePillar, activeActivity]);

  const handleAchievement = (a: MusicAchievement) => {
    setAchievementToast(a);
    setTimeout(() => setAchievementToast(null), 4000);
  };

  // Pillar screens
  if (activePillar === "morning") return <MorningKaraoke onBack={() => { setActivePillar(null); onXpEarned?.(); }} childName={childName} onAchievement={handleAchievement} />;
  if (activePillar === "dance") return <DanceWithAne onBack={() => { setActivePillar(null); onXpEarned?.(); }} childName={childName} onAchievement={handleAchievement} />;
  if (activePillar === "stories") return <SungStories onBack={() => { setActivePillar(null); onXpEarned?.(); }} childName={childName} onAchievement={handleAchievement} />;
  if (activePillar === "create") return <CreateMusic onBack={() => { setActivePillar(null); onXpEarned?.(); }} childName={childName} onAchievement={handleAchievement} />;

  // Guided activity fullscreen
  if (activeActivity) {
    return (
      <GuidedActivityPlayer
        activity={activeActivity}
        childName={childName}
        onClose={() => { setActiveActivity(null); onXpEarned?.(); }}
      />
    );
  }

  // Category sub-screen
  if (activeCategory) {
    const cat = CATEGORIES.find((c) => c.id === activeCategory)!;
    const list = ACTIVITIES.filter((a) => cat.tags.some((t) => a.tags.includes(t)));
    return (
      <CategoryScreen
        category={cat}
        activities={list}
        onBack={() => setActiveCategory(null)}
        onOpen={tryOpenActivity}
        favorites={favorites}
        onToggleFav={toggleFav}
        onOpenDreams={onNavigateToDreams}
      />
    );
  }

  return (
    <MusicShell
      onBack={onBack}
      onOpenParental={onOpenParental}
      xp={xp}
      streak={streak}
    >
      {/* HERO */}
      <div className="pt-2">
        <p className="text-[13px] font-semibold text-[#5a4a2f] mb-2">{greeting()}</p>
        <h1 className="font-display text-[30px] leading-[1.05] font-semibold text-[#2A2520] tracking-tight">
          Música que <span className="text-amber-600">conecta</span>, momentos que ficam.
        </h1>
        <p className="text-[#2A2520]/70 text-[14px] font-medium mt-2 mb-4">
          Atividades com música para soltar a voz, dançar e criar memórias inesquecíveis juntos.
        </p>

        {/* Slot herói vazio elegante: imgChamMusica */}
        <SlotHero name="imgChamMusica" />
      </div>

      {/* 5 CATEGORIAS EM DEGRADÊ */}
      <div className="mt-5 space-y-3">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            locked={cat.id === "travel" && !isPremium}
            onClick={() => openCategory(cat.id)}
          />
        ))}
      </div>

      {/* MAIS MANEIRAS DE BRINCAR COM MÚSICA */}
      <SectionTitle title="Mais maneiras de brincar com música" />
      <div className="space-y-3">
        <WideCard
          icon={<Mic size={26} />}
          title="Karaokê do Dia"
          subtitle="Cante com o Kidzz — letra na tela"
          badge="NOVO"
          gradient="linear-gradient(135deg, hsl(38 95% 62%), hsl(28 92% 50%))"
          onClick={() => tryOpenPillar("morning", false)}
        />
        <WideCard
          icon={<Sparkles size={26} />}
          title="Dance com Kidzz"
          subtitle="Mini-game de palmas e movimento"
          badge="Premium"
          gradient="linear-gradient(135deg, hsl(330 75% 62%), hsl(345 70% 50%))"
          onClick={() => tryOpenPillar("dance", true)}
          locked={!isPremium}
        />
        <WideCard
          icon={<BookOpen size={26} />}
          title="Histórias Cantadas"
          subtitle="Livros mágicos narrados em canção"
          badge="Premium"
          gradient="linear-gradient(135deg, hsl(275 65% 62%), hsl(255 60% 50%))"
          onClick={() => tryOpenPillar("stories", true)}
          locked={!isPremium}
        />
        <WideCard
          icon={<Sliders size={26} />}
          title="Crie Sua Música"
          subtitle="Laboratório sonoro — monte a sua"
          badge="Premium"
          gradient="linear-gradient(135deg, hsl(160 55% 50%), hsl(180 60% 42%))"
          onClick={() => tryOpenPillar("create", true)}
          locked={!isPremium}
        />
      </div>

      {/* ATIVIDADES EM DESTAQUE — trilha horizontal */}
      <SectionTitle title="Atividades em destaque" subtitle="Melhor quando você faz junto 💚" />
      <div className="-mx-4 px-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {ACTIVITIES.filter((a) => a.tags.includes("featured") || a.tags.includes("movement")).map((a) => (
          <ActivityCard
            key={a.id}
            activity={a}
            favorite={favorites.includes(a.id)}
            onFav={() => toggleFav(a.id)}
            onOpen={() => tryOpenActivity(a)}
          />
        ))}
      </div>

      {/* SONS PARA OUVIR — secundário */}
      <SectionTitle title="Sons para ouvir" subtitle="Deixa tocando ao fundo enquanto brincam" />
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-white/60 divide-y divide-black/5 overflow-hidden shadow-sm">
        {AMBIENT_SOUNDS.map((s) => (
          <button
            key={s.id}
            className="w-full flex items-center gap-3 p-3.5 text-left active:bg-black/5"
            onClick={() => {
              if (s.premium && !isPremium) { openPaywall("music_sound"); return; }
              // Sons: slot vazio; simular play com toast
              setAchievementToast({ id: "sound", emoji: "🎧", name: s.title, desc: "Tocando ao fundo" } as any);
              setTimeout(() => setAchievementToast(null), 2400);
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
              <Volume2 size={18} className="text-amber-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-gray-800 truncate">{s.title}</p>
            </div>
            {s.premium && !isPremium ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center gap-1">
                <Lock size={10} /> Premium
              </span>
            ) : (
              <Play size={18} className="text-gray-600" />
            )}
          </button>
        ))}
      </div>

      <p className="text-center text-gray-600/80 text-[11px] font-semibold pt-3 pb-4">
        🍃 Mais maravilhas em breve
      </p>
    </MusicShell>
  );
};

/* ============ SUBCOMPONENTES ============ */

const MusicShell = ({
  onBack, onOpenParental, xp, streak, children,
}: { onBack: () => void; onOpenParental?: () => void; xp: number; streak: number; children: React.ReactNode }) => (
  <motion.div
    className="flex-1 flex flex-col overflow-hidden relative min-h-0"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
  >
    <LivingForest variant="light">
      {/* Header — dynamic island */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 pb-2"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
        <button
          onClick={onBack}
          className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="flex-1" />
        <button
          onClick={onOpenParental}
          className="glass-island min-h-[36px] px-3 rounded-full flex items-center gap-1.5 text-[12px] font-extrabold text-gray-700"
          aria-label="Painel dos pais"
        >
          👨‍👩‍👧 Pais
        </button>
        <div className="glass-island min-h-[36px] px-2.5 rounded-full flex items-center gap-1 text-[12px] font-extrabold text-amber-800">
          <Star size={14} className="text-amber-500" />
          {xp}
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
        }}
      >
        {children}
      </div>
    </LivingForest>
  </motion.div>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="pt-6 pb-3">
    <h2 className="font-display text-[20px] font-semibold text-[#2A2520] leading-tight">{title}</h2>
    {subtitle && <p className="text-[12px] font-semibold text-[#2A2520]/60 mt-0.5">{subtitle}</p>}
  </div>
);

const SlotHero = ({ name }: { name: string }) => (
  <div
    className="relative w-full aspect-[16/10] rounded-[28px] overflow-hidden border border-white/70 shadow-xl"
    style={{
      background:
        "radial-gradient(circle at 30% 20%, hsl(38 95% 72% / 0.9), transparent 60%), radial-gradient(circle at 70% 80%, hsl(275 60% 70% / 0.8), transparent 60%), linear-gradient(135deg, hsl(38 90% 88%), hsl(150 40% 82%))",
    }}
  >
    {/* Notas decorativas */}
    <div className="absolute inset-0 pointer-events-none">
      {["♪", "♫", "♩", "♬", "♪"].map((n, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl text-white/70 drop-shadow"
          style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 20}%` }}
          animate={{ y: [0, -12, 0], rotate: [0, 8, -6, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.4 }}
        >{n}</motion.div>
      ))}
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-6xl drop-shadow-lg">🎤🦎🎧</div>
      </div>
    </div>
  </div>
);

const CategoryCard = ({
  category, locked, onClick,
}: { category: Category; locked?: boolean; onClick: () => void }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative w-full rounded-[26px] p-4 pr-3 text-left overflow-hidden border border-white/40 shadow-lg"
    style={{ background: category.gradient, boxShadow: `0 10px 30px hsl(${category.tint} / 0.35)` }}
  >
    {/* Overlay glass */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10 pointer-events-none" />
    <div className="relative flex items-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur border border-white/40 flex items-center justify-center text-white shadow-inner">
        {category.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-display text-[19px] font-semibold text-white drop-shadow leading-tight truncate">
            {category.label}
          </p>
          {category.id === "travel" && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white text-amber-700">NOVO</span>
          )}
          {locked && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black/30 text-white flex items-center gap-1">
              <Lock size={9} /> Premium
            </span>
          )}
        </div>
        <p className="text-[12.5px] font-semibold text-white/90 leading-snug mt-0.5">
          {category.subtitle}
        </p>
      </div>
      <ChevronRight size={22} className="text-white/90 shrink-0" />
    </div>
  </motion.button>
);

const WideCard = ({
  icon, title, subtitle, badge, gradient, onClick, locked,
}: {
  icon: React.ReactNode; title: string; subtitle: string; badge?: "NOVO" | "Premium";
  gradient: string; onClick: () => void; locked?: boolean;
}) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative w-full rounded-[24px] p-4 text-left overflow-hidden border border-white/40 shadow-md"
    style={{ background: gradient }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none" />
    <div className="relative flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur border border-white/40 flex items-center justify-center text-white shadow-inner">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[16px] font-black text-white drop-shadow leading-tight truncate">{title}</p>
          {badge === "NOVO" && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white text-amber-700">NOVO</span>
          )}
          {badge === "Premium" && locked && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black/30 text-white flex items-center gap-1">
              <Lock size={9} /> Premium
            </span>
          )}
        </div>
        <p className="text-[12.5px] font-semibold text-white/90 leading-snug mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight size={22} className="text-white/90 shrink-0" />
    </div>
  </motion.button>
);

const ActivityCard = ({
  activity, favorite, onFav, onOpen, full = false,
}: { activity: GuidedActivity; favorite: boolean; onFav: () => void; onOpen: () => void; full?: boolean }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className={`snap-start rounded-[22px] overflow-hidden bg-white/85 backdrop-blur border border-white/60 shadow-lg ${full ? "w-full" : "shrink-0 w-[220px]"}`}
  >
    <button onClick={onOpen} className="block w-full text-left">
      <div
        className="w-full aspect-[4/3] relative flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, hsl(${activity.accent} / 0.85), hsl(${activity.accent} / 0.55))`,
        }}
      >
        <div className="text-5xl drop-shadow-lg">
          {activity.kind === "dance" ? "💃" : activity.kind === "clap" ? "👏" : activity.kind === "sing" ? "🎤" : activity.kind === "play" ? "🥁" : "🎧"}
        </div>
        <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/85 text-gray-800">
          {activity.minutes} min
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onFav(); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/85 flex items-center justify-center"
          aria-label="Favoritar"
        >
          <Heart size={16} className={favorite ? "fill-rose-500 text-rose-500" : "text-gray-500"} />
        </button>
        {activity.parentMark && (
          <span className="absolute bottom-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black/50 text-white">
            👨‍👩 Pais
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[14px] font-black text-gray-800 leading-tight truncate">{activity.title}</p>
        <p className="text-[11.5px] font-semibold text-gray-600 leading-snug mt-0.5 line-clamp-2">{activity.subtitle}</p>
        <p className="text-[10.5px] font-bold text-gray-500 mt-1">{activity.ageRange}</p>
      </div>
    </button>
  </motion.div>
);

/* ============ SUB-ABA POR CATEGORIA ============ */

const CategoryScreen = ({
  category, activities, onBack, onOpen, favorites, onToggleFav, onOpenDreams,
}: {
  category: Category; activities: GuidedActivity[]; onBack: () => void;
  onOpen: (a: GuidedActivity) => void; favorites: string[]; onToggleFav: (id: string) => void;
  onOpenDreams: () => void;
}) => (
  <motion.div
    className="flex-1 flex flex-col overflow-hidden relative min-h-0"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
  >
    <LivingForest variant="light">
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 pb-2"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
        <button
          onClick={onBack}
          className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="glass-island flex-1 min-w-0 flex items-center gap-2 px-3.5 py-2 rounded-full">
          <div style={{ background: category.gradient }} className="w-6 h-6 rounded-lg" />
          <p className="font-display text-[15px] font-semibold text-gray-800 truncate">{category.label}</p>
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 space-y-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
        }}
      >
        {/* Hero da sub-aba: MESMO degradê */}
        <div
          className="relative w-full aspect-[16/9] rounded-[26px] overflow-hidden border border-white/50 shadow-xl"
          style={{ background: category.gradient }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/15 pointer-events-none" />
          <div className="relative h-full flex flex-col justify-end p-5">
            <p className="text-[11px] font-black uppercase tracking-widest text-white/85">{category.subtitle}</p>
            <h1 className="font-display text-[26px] font-semibold text-white leading-tight drop-shadow">
              {category.label}
            </h1>
          </div>
          <div className="absolute top-3 right-3 text-4xl drop-shadow-lg">🦎🎵</div>
        </div>

        {category.id === "calm" && (
          <button
            onClick={onOpenDreams}
            className="w-full rounded-2xl p-4 bg-white/80 backdrop-blur border border-white/60 shadow flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: category.gradient }}>
              <Moon size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-black text-gray-800">Ir para Sonhos</p>
              <p className="text-[11.5px] font-semibold text-gray-600">Ninar, respirar no ritmo, dormir gostoso</p>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          {activities.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              full
              favorite={favorites.includes(a.id)}
              onFav={() => onToggleFav(a.id)}
              onOpen={() => onOpen(a)}
            />
          ))}
        </div>

        {activities.length === 0 && (
          <div className="rounded-3xl bg-white/70 backdrop-blur border border-white/60 p-6 text-center">
            <p className="text-[14px] font-bold text-gray-700">Novas atividades chegando por aqui em breve. 🎶</p>
          </div>
        )}
      </div>
    </LivingForest>
  </motion.div>
);

export default MusicForest;
