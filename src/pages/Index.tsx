import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacterEvolution } from "@/hooks/useCharacterEvolution";
import { useMemories } from "@/hooks/useMemories";
import NameOnboarding from "@/components/NameOnboarding";
import AgeSelection from "@/components/AgeSelection";
import InterestsOnboarding from "@/components/InterestsOnboarding";
import NotificationTimeOnboarding from "@/components/NotificationTimeOnboarding";
import ContextualPaywallModal from "@/components/ContextualPaywallModal";
import type { PaywallContext } from "@/lib/contextualPaywall";
import HomeScreen from "@/components/flow/HomeScreen";
import AgePickerScreen from "@/components/flow/AgePickerScreen";
import GeneratingScreen from "@/components/flow/GeneratingScreen";
import AnswerScreen from "@/components/flow/AnswerScreen";
import CelebrationScreen from "@/components/flow/CelebrationScreen";
import WeeklySurpriseBox from "@/components/flow/WeeklySurpriseBox";
import MemoriesAlbum from "@/components/memories/MemoriesAlbum";
// Heavy/secondary screens are lazy-loaded — only the chat home ships in the initial bundle.
const loadDreamWorld = () => import("@/components/dreams/DreamWorld");
const loadStoryFactory = () => import("@/components/story/StoryFactory");
const loadKidzzPlay = () => import("@/components/play/KidzzPlay");
const loadRoutineScreen = () => import("@/components/routine/RoutineScreen");
const loadMomentsPlaylists = () => import("@/components/moments/MomentsPlaylists");
const loadFamilyCinema = () => import("@/components/cinema/FamilyCinema");
const loadMusicForest = () => import("@/components/music/MusicForest");
const loadWellnessHub = () => import("@/components/wellness/WellnessHub");
const DreamWorld = lazy(loadDreamWorld);
const StoryFactory = lazy(loadStoryFactory);
const JourneyScreen = lazy(() => import("@/components/flow/JourneyScreen"));
const KidzzPlay = lazy(loadKidzzPlay);
const RoutineScreen = lazy(loadRoutineScreen);
const MomentsPlaylists = lazy(loadMomentsPlaylists);
const FamilyCinema = lazy(loadFamilyCinema);
const KidzzLab = lazy(() => import("@/components/lab/KidzzLab"));
const TravelMode = lazy(() => import("@/components/travel/TravelMode"));
const MusicForest = lazy(loadMusicForest);
const WellnessHub = lazy(loadWellnessHub);
import Paywall from "@/components/Paywall";
import ParentalGate from "@/components/ParentalGate";
import ParentalSettings from "@/components/ParentalSettings";
const ParentDashboard = lazy(() => import("@/components/parental/ParentDashboard"));
const SevenDayChallenge = lazy(() => import("@/components/viral/SevenDayChallenge"));
const ReferralProgram = lazy(() => import("@/components/viral/ReferralProgram"));
const MonthlyRetrospective = lazy(() => import("@/components/viral/MonthlyRetrospective"));
import ChameleonMascot from "@/components/ChameleonMascot";
import KidzzStatesIntro, { hasSeenKidzzStatesIntro } from "@/components/kidzz/KidzzStatesIntro";
import OnboardingWelcome from "@/components/onboarding/OnboardingWelcome";
import { kidzzMemory } from "@/components/kidzz/kidzzMemory";
import BottomNav from "@/components/flow/BottomNav";
import XpToast from "@/components/flow/XpToast";
import TabErrorBoundary from "@/components/TabErrorBoundary";
import ConversionNudgeCard from "@/components/viral/ConversionNudgeCard";
import { completeMissionStep, addXp, bumpSessionActions, shouldShowConversionCard, markConversionCardShown } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";

type FlowStep = "home" | "age" | "generating" | "answer" | "celebrating" | "paywall";
const AGE_STORAGE_KEY = "kidzz_last_age_range";
const getCachedAgeRange = () => typeof window !== "undefined" ? window.localStorage.getItem(AGE_STORAGE_KEY) : null;
const INTRO_SETTLE_KEY = "kidzz_intro_settled_v2";
const JUST_COMPLETED_ONBOARDING_KEY = "kidzz_just_completed_onboarding";
const markIntroSettled = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_SETTLE_KEY, "1");
    window.localStorage.setItem("kidzz_onboarding_welcomed", "1");
    window.localStorage.setItem("kidzz_states_intro_seen", "1");
    window.localStorage.setItem("kidzz_emotional_intro_v1", "1");
    window.sessionStorage.removeItem(JUST_COMPLETED_ONBOARDING_KEY);
  } catch {}
};
const hasIntroSettled = () => {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(INTRO_SETTLE_KEY) === "1"; } catch { return false; }
};
const justCompletedOnboarding = () => {
  if (typeof window === "undefined") return false;
  try { return window.sessionStorage.getItem(JUST_COMPLETED_ONBOARDING_KEY) === "1"; } catch { return false; }
};

const Index = () => {
  const navigate = useNavigate();
  const { profile, loading, updateProfile, canAskQuestion } = useAuth();
  const evolution = useCharacterEvolution();
  const { addMemory } = useMemories();
  const [step, setStep] = useState<FlowStep>("home");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [showLab, setShowLab] = useState(false);
  const [showPlay, setShowPlay] = useState(false);
  const [showTravel, setShowTravel] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showRetrospective, setShowRetrospective] = useState(false);
  const [selectedAgeRange, setSelectedAgeRange] = useState<string | null>(getCachedAgeRange());
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [showParentalGateForSettings, setShowParentalGateForSettings] = useState(false);
  const [showParentalGateForDashboard, setShowParentalGateForDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [notifPromptDismissed, setNotifPromptDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return !!window.localStorage.getItem("kidzz_notification_set");
  });
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const [contextualPaywall, setContextualPaywall] = useState<{ open: boolean; context: PaywallContext; meta?: Record<string, string | number> }>({ open: false, context: "question_limit" });
  const [showConversionNudge, setShowConversionNudge] = useState(false);
  const [showStatesIntro, setShowStatesIntro] = useState<boolean>(() => justCompletedOnboarding() && !hasIntroSettled() && !hasSeenKidzzStatesIntro());
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return justCompletedOnboarding() && !hasIntroSettled() && window.localStorage.getItem("kidzz_onboarding_welcomed") !== "1"; } catch { return false; }
  });
  const [showJourney, setShowJourney] = useState(false);
  // EmotionalIntro removida — duplicava a sensação do OnboardingWelcome.
  // Mantemos a flag marcada como vista para não reintroduzir no futuro.
  useEffect(() => {
    try { localStorage.setItem("kidzz_emotional_intro_v1", "1"); } catch {}
  }, []);

  useEffect(() => {
    if (!profile?.age_range || typeof window === "undefined") return;
    setSelectedAgeRange(profile.age_range);
    window.localStorage.setItem(AGE_STORAGE_KEY, profile.age_range);
  }, [profile?.age_range]);

  useEffect(() => {
    const interests = (profile as any)?.child_interests as string[] | undefined;
    if (!profile?.child_name || !profile?.age_range || !interests?.length) return;
    if (justCompletedOnboarding() && !hasIntroSettled()) setShowWelcome(true);
  }, [profile?.child_name, profile?.age_range, (profile as any)?.child_interests]);

  const switchTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    markIntroSettled();
    setActiveTab(tab);
    setShowLab(false);
    setShowPlay(false);
    setShowTravel(false);
    setShowChallenge(false);
    setShowReferral(false);
    setShowRetrospective(false);
    if (tab === "chat") setStep("home");
  }, []);

  const backToHome = useCallback(() => {
    switchTab("chat");
    setStep("home");
  }, [switchTab]);

  // Keep-alive: cada aba já visitada permanece montada (visibility:hidden) — evita pisca.
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(() => new Set(["chat"]));
  useEffect(() => {
    setMountedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  // Pré-carrega as abas gradualmente no idle, sem bloquear a Home no Safari.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loaders = [loadStoryFactory, loadRoutineScreen, loadMusicForest, loadFamilyCinema, loadMomentsPlaylists, loadDreamWorld, loadKidzzPlay, loadWellnessHub];
    let cancelled = false;
    let index = 0;
    const runNext = () => {
      if (cancelled || index >= loaders.length) return;
      void loaders[index++]().catch(() => undefined).finally(() => {
        if (cancelled) return;
        const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: { timeout?: number }) => number);
        if (ric) ric(runNext, { timeout: 2500 });
        else window.setTimeout(runNext, 900);
      });
    };
    const start = window.setTimeout(runNext, 1200);
    return () => { cancelled = true; window.clearTimeout(start); };
  }, []);

  // Auto monthly retrospective: day 1 + activity + not seen this month
  useEffect(() => {
    if (typeof window === "undefined" || !profile?.child_name) return;
    const now = new Date();
    if (now.getDate() !== 1) return;
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const lastRetro = window.localStorage.getItem("kidzz_last_retro");
    if (lastRetro === monthKey) return;
    const totalQuestions =
      parseInt(window.localStorage.getItem("kidzz_total_questions") || "0", 10) ||
      (profile?.questions_used ?? 0);
    if (totalQuestions <= 0) return;
    const t = setTimeout(() => {
      setShowRetrospective(true);
      window.localStorage.setItem("kidzz_last_retro", monthKey);
    }, 1500);
    return () => clearTimeout(t);
  }, [profile?.child_name, profile?.questions_used]);

  // Conversion nudge (parent-facing): poll session actions, surface when threshold met
  useEffect(() => {
    if (profile?.is_premium) return;
    const check = () => {
      if (shouldShowConversionCard(false)) {
        setShowConversionNudge(true);
        markConversionCardShown();
      }
    };
    const iv = setInterval(check, 4000);
    return () => clearInterval(iv);
  }, [profile?.is_premium]);

  // Global paywall opener — any feature can dispatch `kidzz:open-paywall`
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const ctx = (detail.context as PaywallContext) || "question_limit";
      setContextualPaywall({ open: true, context: ctx, meta: detail.meta });
    };
    window.addEventListener("kidzz:open-paywall", handler);
    return () => window.removeEventListener("kidzz:open-paywall", handler);
  }, []);

  // Global plans-screen opener — shows the FULL Paywall screen (plan picker)
  useEffect(() => {
    const openPlans = () => {
      setContextualPaywall((p) => ({ ...p, open: false }));
      setShowLab(false);
      setShowPlay(false);
      setShowTravel(false);
      setShowChallenge(false);
      setShowReferral(false);
      setShowRetrospective(false);
      switchTab("chat");
      setStep("paywall");
    };
    window.addEventListener("kidzz:open-plans", openPlans);
    const openJourney = () => setShowJourney(true);
    window.addEventListener("kidzz:open-journey", openJourney);
    return () => {
      window.removeEventListener("kidzz:open-plans", openPlans);
      window.removeEventListener("kidzz:open-journey", openJourney);
    };
  }, []);

  // Tab <-> URL hash sync. Lets the browser back button + share links work
  // without rewriting the routing layer. Hash format: `#tab=dreams`.
  const KNOWN_TABS = ["chat","explore","routine","play","memories","moments","cinema","wellness","achievements","dreams","music"];
  useEffect(() => {
    if (typeof window === "undefined") return;
    const parseHash = () => {
      const m = window.location.hash.match(/tab=([\w-]+)/);
      return m && KNOWN_TABS.includes(m[1]) ? m[1] : null;
    };
    const initial = parseHash();
    if (initial && initial !== activeTab) switchTab(initial);

    const onPop = () => {
      const t = parseHash() ?? "chat";
      switchTab(t);
      setShowLab(false); setShowPlay(false); setShowTravel(false);
      setShowChallenge(false); setShowReferral(false); setShowRetrospective(false);
      if (t === "chat") setStep("home");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const current = window.location.hash.match(/tab=([\w-]+)/)?.[1];
    if (activeTab === "chat") {
      if (current) window.history.replaceState(null, "", window.location.pathname);
    } else if (current !== activeTab) {
      // pushState so the back button returns to the previous tab.
      window.history.pushState({ tab: activeTab }, "", `#tab=${activeTab}`);
    }
  }, [activeTab]);

  // Soft reminder: depois de cada 5 perguntas (free), mostra paywall contextual leve
  useEffect(() => {
    if (profile?.is_premium) return;
    const used = profile?.questions_used ?? 0;
    if (used > 0 && used === 2) {
      // Última pergunta grátis: aviso suave
      const key = "kidzz_warned_last_free";
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        setTimeout(() => {
          setContextualPaywall({ open: true, context: "question_limit", meta: { count: used } });
        }, 1500);
      }
    }
  }, [profile?.questions_used, profile?.is_premium]);

  if (loading) {
    // Sem fundo/loading screen próprio — o MagicalBackground global e o SplashScreen
    // cobrem a tela. Retornar null evita o flash branco/cinza durante o hidrate.
    return null;
  }

  // EmotionalIntro removida do fluxo — OnboardingWelcome no fim cobre o momento emocional.


  // Onboarding gates: name → age → interests
  if (!profile?.child_name) {
    return <NameOnboarding key="nome-unico" />;
  }
  if (!profile?.age_range) {
    return <AgeSelection key="idade-unica" />;
  }
  const interests = (profile as any)?.child_interests as string[] | undefined;
  if (!interests || interests.length === 0) {
    return <InterestsOnboarding key="interesses-unico" />;
  }
  // Tela final emocional do onboarding (uma vez, após interests)
  if (showWelcome) {
    return (
      <OnboardingWelcome
        childName={profile.child_name}
        onEnter={() => {
          markIntroSettled();
          setShowWelcome(false);
          setShowStatesIntro(false);
        }}
      />
    );
  }
  // Apresentação dos 4 estados do Kidzz (1ª vez, após onboarding completo)
  if (showStatesIntro) {
    return <KidzzStatesIntro onDone={() => { markIntroSettled(); setShowStatesIntro(false); }} />;
  }
  // Notification time prompt is now contextual (after first answer), not blocking onboarding

  const childName = profile.child_name;

  const handleQuestionSubmit = (q: string) => {
    if (!canAskQuestion()) {
      setContextualPaywall({ open: true, context: "question_limit", meta: { count: profile.questions_used ?? 0 } });
      return;
    }
    setQuestion(q);
    setStep("generating");
  };

  const handleAnswerReady = (text: string) => {
    setAnswer(text);
    setStep("celebrating");
    evolution.evolve("question");
    kidzzMemory.recordQuestion(question);
    // Daily mission + XP
    const { newlyMarked } = completeMissionStep("question");
    if (newlyMarked) {
      const { gained } = addXp("question");
      showXpGained(gained, "pergunta");
    }
    bumpSessionActions();
    // Auto-save as memory
    addMemory({
      type: "question",
      title: question,
      content: text.slice(0, 500),
      is_special: false,
      image_url: null,
      metadata: {},
    });
  };

  const handleCelebrationDone = () => {
    setStep("answer");
    // Strategic moment: trigger notification setup AFTER first emotional success
    if (!notifPromptDismissed) {
      setTimeout(() => setShowNotifPrompt(true), 800);
    }
  };

  const handleNewQuestion = () => {
    setQuestion(""); setAnswer(""); setStep("home"); switchTab("chat");
  };




  const renderChatTab = () => (
    <AnimatePresence mode="wait">
      {step === "home" && (
        <HomeScreen
          key="home"
          onSubmit={handleQuestionSubmit}
          onOpenStoryFactory={() => switchTab("explore")}
          onOpenMoments={() => switchTab("moments")}
          onOpenAchievements={() => switchTab("achievements")}
          onOpenLab={() => setShowLab(true)}
          onOpenPlay={() => switchTab("play")}
          onOpenTravel={() => {
            if (!profile?.is_premium) {
              setContextualPaywall({ open: true, context: "travel" });
              return;
            }
            setShowTravel(true);
          }}
          onOpenChallenge={() => setShowChallenge(true)}
          onOpenReferral={() => setShowReferral(true)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hideBottomNav
          characterEvolution={evolution as any}
        />
      )}
      {step === "generating" && <GeneratingScreen key="generating" question={question} ageRange={profile.age_range || "3-7"} onComplete={handleAnswerReady} onError={() => setStep("home")} onLimitReached={() => setContextualPaywall({ open: true, context: "question_limit", meta: { count: profile.questions_used ?? 0 } })} />}
      {step === "celebrating" && (
        <CelebrationScreen
          key="celebrating"
          childName={childName}
          pointsEarned={1}
          streakDays={profile.streak_days ?? 0}
          interests={(profile as any)?.child_interests as string[] | undefined}
          onContinue={handleCelebrationDone}
          onSave={() => {
            addMemory({
              type: "question",
              title: question,
              content: answer.slice(0, 500),
              is_special: true,
              image_url: null,
              metadata: { saved_from: "celebration" },
            });
          }}
          type="answer"
        />
      )}
      {step === "answer" && <AnswerScreen key="answer" question={question} answer={answer} onNewQuestion={handleNewQuestion} onOpenStoryFactory={() => switchTab("explore")} />}
      {step === "paywall" && <Paywall key="paywall" onLogin={() => navigate("/auth")} onBack={() => { setStep("home"); switchTab("chat"); }} />}
    </AnimatePresence>
  );

  // Cada aba é renderizada uma vez (lazy, sob demanda) e mantida montada.
  // O wrapper KeepAlive esconde/exibe sem desmontar — evita remount, refetch e flash branco.
  const TAB_RENDERERS: Record<string, () => JSX.Element> = {
    chat: renderChatTab,
    explore: () => <StoryFactory onBack={() => { backToHome(); evolution.evolve("story"); }} />,
    routine: () => <RoutineScreen />,
    play: () => (
      <KidzzPlay
        onBack={backToHome}
        onGameComplete={() => evolution.evolve("game")}
        onOpenAchievements={() => switchTab("achievements")}
        onOpenLab={() => setShowLab(true)}
        onOpenTravel={() => {
          if (!profile?.is_premium) {
            setContextualPaywall({ open: true, context: "travel" });
            return;
          }
          setShowTravel(true);
        }}
      />
    ),
    memories: () => <MemoriesAlbum onBack={backToHome} onNavigateToChat={backToHome} onNavigateToStories={() => switchTab("explore")} />,
    moments: () => <MomentsPlaylists onBack={() => { backToHome(); evolution.evolve("moment"); }} />,
    cinema: () => <FamilyCinema onBack={backToHome} />,
    wellness: () => <WellnessHub onBack={backToHome} />,
    achievements: () => <MemoriesAlbum onBack={backToHome} onNavigateToChat={backToHome} onNavigateToStories={() => switchTab("explore")} />,
    dreams: () => <DreamWorld onBack={() => { backToHome(); evolution.evolve("story"); }} />,
    music: () => (
      <MusicForest
        onBack={backToHome}
        onNavigateToDreams={() => switchTab("dreams")}
        onXpEarned={() => evolution.evolve("game")}
      />
    ),
  };

  return (
    <div className="min-h-[100dvh] flex flex-col overflow-hidden max-w-[100vw]" style={{ height: "auto", overflowX: "hidden" }}>
      {/* MagicalBackground vive no AppShell — persistente, nunca remontado */}
      <div className="flex-1 flex flex-col min-h-0 pb-[148px] relative overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {Array.from(mountedTabs).map((tab) => {
            const renderer = TAB_RENDERERS[tab];
            if (!renderer) return null;
            const isActive = tab === activeTab;
            return (
              <div
                key={tab}
                className="absolute inset-0 flex flex-col min-h-0"
                style={{
                  visibility: isActive ? "visible" : "hidden",
                  pointerEvents: isActive ? "auto" : "none",
                  zIndex: isActive ? 2 : 1,
                }}
                aria-hidden={!isActive}
              >
                <TabErrorBoundary resetKey={tab} label={tab} onBack={backToHome}>
                  <Suspense fallback={<div className="min-h-[100dvh] w-full" aria-hidden />}>{renderer()}</Suspense>
                </TabErrorBoundary>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isPremium={profile?.is_premium ?? false}
        onOpenParents={() => setShowParentalGateForDashboard(true)}
        onOpenPlans={() => window.dispatchEvent(new CustomEvent("kidzz:open-plans"))}
      />
      <Suspense fallback={null}><AnimatePresence>
        {showTravel && <TravelMode onBack={() => setShowTravel(false)} />}
        {showLab && <KidzzLab onBack={() => setShowLab(false)} evolution={evolution} />}
        {/* showPlay overlay descontinuado: Brincar agora é aba inline */}
        {showChallenge && <SevenDayChallenge onClose={() => setShowChallenge(false)} />}
        {showReferral && <ReferralProgram onBack={() => setShowReferral(false)} />}
        {showRetrospective && <MonthlyRetrospective onClose={() => setShowRetrospective(false)} />}
        {showLoginGate && <ParentalGate onSuccess={() => setShowLoginGate(false)} onCancel={() => setShowLoginGate(false)} />}
        {showParentalGateForSettings && (
          <ParentalGate onSuccess={() => { setShowParentalGateForSettings(false); setShowSettings(true); }} onCancel={() => setShowParentalGateForSettings(false)} />
        )}
        {showParentalGateForDashboard && (
          <ParentalGate onSuccess={() => { setShowParentalGateForDashboard(false); setShowDashboard(true); }} onCancel={() => setShowParentalGateForDashboard(false)} />
        )}
        {showDashboard && (
          <ParentDashboard
            onClose={() => setShowDashboard(false)}
            onOpenSettings={() => { setShowDashboard(false); setShowSettings(true); }}
            onOpenUpgrade={() => {
              setShowDashboard(false);
              window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
            }}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence></Suspense>
      <WeeklySurpriseBox
        childName={childName}
        streakDays={profile.streak_days ?? 0}
      />

      {/* Contextual notification prompt — appears after first answer */}
      <AnimatePresence>
        {showNotifPrompt && (
          <motion.div
            className="fixed inset-0 z-[55] flex items-end justify-center px-4 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => { setShowNotifPrompt(false); setNotifPromptDismissed(true); try { localStorage.setItem("kidzz_notification_set", "1"); } catch { /* noop */ } }} />
            <motion.div
              className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
              initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
            >
              <NotificationTimeOnboarding
                childName={childName}
                onComplete={() => { setShowNotifPrompt(false); setNotifPromptDismissed(true); }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContextualPaywallModal
        open={contextualPaywall.open}
        context={contextualPaywall.context}
        meta={contextualPaywall.meta}
        onClose={() => setContextualPaywall((p) => ({ ...p, open: false }))}
        onLogin={() => { setContextualPaywall((p) => ({ ...p, open: false })); navigate("/auth"); }}
      />

      {/* Sua Jornada — overlay com nível, próxima recompensa e jornada XP */}
      <AnimatePresence>
        {showJourney && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background:
                "linear-gradient(180deg, hsl(45 60% 92%) 0%, hsl(140 35% 85%) 100%)",
            }}
          >
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center text-sm font-bold text-gray-600">
                  Abrindo sua jornada… ✨
                </div>
              }
            >
              <JourneyScreen
                childName={childName}
                onBack={() => setShowJourney(false)}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating XP gain toasts */}
      <XpToast />

      {/* Parent conversion nudge — appears after 2-3 child actions */}
      <ConversionNudgeCard
        open={showConversionNudge && !profile?.is_premium}
        childName={childName}
        onUpgrade={() => {
          setShowConversionNudge(false);
          setContextualPaywall({ open: true, context: "question_limit" });
        }}
        onClose={() => setShowConversionNudge(false)}
      />
    </div>
  );
};

export default Index;
