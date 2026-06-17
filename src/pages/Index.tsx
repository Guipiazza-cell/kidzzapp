import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacterEvolution } from "@/hooks/useCharacterEvolution";
import { useMemories } from "@/hooks/useMemories";
import { usePWAUpdate } from "@/hooks/usePWAUpdate";
import NameOnboarding from "@/components/NameOnboarding";
import AgeSelection from "@/components/AgeSelection";
import InterestsOnboarding from "@/components/InterestsOnboarding";
import AccountSetup from "@/components/onboarding/AccountSetup";

import NotificationTimeOnboarding from "@/components/NotificationTimeOnboarding";
import ContextualPaywallModal from "@/components/ContextualPaywallModal";
import AreaGate from "@/components/paywall/AreaGate";
import type { PaywallContext } from "@/lib/contextualPaywall";
import HomeScreen from "@/components/flow/HomeScreen";

import GeneratingScreen from "@/components/flow/GeneratingScreen";
import AnswerScreen from "@/components/flow/AnswerScreen";
import CelebrationScreen from "@/components/flow/CelebrationScreen";
import WeeklySurpriseBox from "@/components/flow/WeeklySurpriseBox";
import MemoriesAlbum from "@/components/memories/MemoriesAlbum";
import ChatFlow from "@/components/flow/ChatFlow";
// Heavy/secondary screens are lazy-loaded — only the chat home ships in the initial bundle.
const lazyRetry = (importFn: () => Promise<any>) =>
  lazy(() =>
    importFn()
      .then((mod) => {
        try { sessionStorage.removeItem("kidzz_chunk_reload"); } catch {}
        return mod;
      })
      .catch((err) => {
        try {
          if (!sessionStorage.getItem("kidzz_chunk_reload")) {
            sessionStorage.setItem("kidzz_chunk_reload", "1");
            window.location.reload();
            return new Promise(() => {});
          }
        } catch {}
        throw err;
      })
  );
const loadDreamWorld = () => import("@/components/dreams/DreamWorld");
const loadStoryFactory = () => import("@/components/story/StoryFactory");
const loadKidzzPlay = () => import("@/components/play/KidzzPlay");
const loadRoutineScreen = () => import("@/components/routine/RoutineScreen");
const loadMomentsPlaylists = () => import("@/components/moments/MomentsPlaylists");
const loadFamilyCinema = () => import("@/components/cinema/FamilyCinema");
const loadMusicForest = () => import("@/components/music/MusicForest");
const loadWellnessHub = () => import("@/components/wellness/WellnessHub");
const DreamWorld = lazyRetry(loadDreamWorld);
const StoryFactory = lazyRetry(loadStoryFactory);
const JourneyScreen = lazyRetry(() => import("@/components/flow/JourneyScreen"));
const KidzzPlay = lazyRetry(loadKidzzPlay);
const RoutineScreen = lazyRetry(loadRoutineScreen);
const MomentsPlaylists = lazyRetry(loadMomentsPlaylists);
const FamilyCinema = lazyRetry(loadFamilyCinema);
const KidzzLab = lazyRetry(() => import("@/components/lab/KidzzLab"));
const TravelMode = lazyRetry(() => import("@/components/travel/TravelMode"));
const MusicForest = lazyRetry(loadMusicForest);
const WellnessHub = lazyRetry(loadWellnessHub);
import Paywall from "@/components/Paywall";
import ParentalGate from "@/components/ParentalGate";
import ParentalSettings from "@/components/ParentalSettings";
const ParentDashboard = lazyRetry(() => import("@/components/parental/ParentDashboard"));
const SevenDayChallenge = lazyRetry(() => import("@/components/viral/SevenDayChallenge"));
const ReferralProgram = lazyRetry(() => import("@/components/viral/ReferralProgram"));
const MonthlyRetrospective = lazyRetry(() => import("@/components/viral/MonthlyRetrospective"));
import { kidzzMemory } from "@/components/kidzz/kidzzMemory";

import BottomNav from "@/components/flow/BottomNav";
import XpToast from "@/components/flow/XpToast";
import TabErrorBoundary from "@/components/TabErrorBoundary";
import ConversionNudgeCard from "@/components/viral/ConversionNudgeCard";
import { completeMissionStep, addXp, bumpSessionActions, shouldShowConversionCard, markConversionCardShown } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";

type FlowStep = "home" | "age" | "generating" | "answer" | "celebrating" | "paywall";
const KNOWN_TABS = ["chat", "explore", "music", "routine", "wellness", "cinema", "moments", "dreams", "play", "memories", "achievements"];
const AGE_STORAGE_KEY = "kidzz_last_age_range";
const ACTIVE_TAB_STORAGE_KEY = "kidzz_active_tab";
const getCachedAgeRange = () => typeof window !== "undefined" ? window.localStorage.getItem(AGE_STORAGE_KEY) : null;
const getInitialTab = () => {
  if (typeof window === "undefined") return "chat";
  try {
    const saved = window.sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (saved && KNOWN_TABS.includes(saved)) return saved;
  } catch { /* noop */ }
  return "chat";
};
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

const Index = () => {
  // ============================================================
  // REGRA DE OURO DESTE ARQUIVO (não mover!):
  // TODOS os hooks (useState/useEffect/useCallback/useMemo) ficam
  // AQUI EM CIMA, antes de QUALQUER `return` condicional.
  // O React exige a mesma quantidade/ordem de hooks em todo render.
  // Hooks depois de um return condicional = crash na transição de
  // onboarding ("Ops! Algo deu errado"). Esse era o bug raiz.
  // ============================================================
  const navigate = useNavigate();
  const { profile, loading, updateProfile, canAskQuestion, user } = useAuth();
  const evolution = useCharacterEvolution();
  const { addMemory } = useMemories();
  usePWAUpdate();
  const [step, setStep] = useState<FlowStep>("home");
  const [accountStepDone, setAccountStepDone] = useState<boolean>(() =>
    typeof window !== "undefined" && !!window.localStorage.getItem("kidzz_account_step_done")
  );
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [showLab, setShowLab] = useState(false);
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
  const [showJourney, setShowJourney] = useState(false);

  const [kalmInitialExperience, setKalmInitialExperience] = useState<string | null>(null);
  // Tabs are mounted on first visit and kept alive. Compute synchronously
  // during render (no useEffect lag) so the tapped tab paints on the same
  // frame the user changes activeTab — fixes "tab feels frozen on first tap".
  const mountedTabsRef = useRef<Set<string>>(new Set(["chat"]));
  if (!mountedTabsRef.current.has(activeTab)) {
    mountedTabsRef.current.add(activeTab);
  }
  const mountedTabs = mountedTabsRef.current;
  // EmotionalIntro / OnboardingWelcome / KidzzStatesIntro: removidas do fluxo
  useEffect(() => {
    try {
      localStorage.setItem("kidzz_emotional_intro_v1", "1");
      localStorage.setItem("kidzz_onboarding_welcomed", "1");
      localStorage.setItem("kidzz_states_intro_seen", "1");
      localStorage.setItem("kidzz_intro_settled_v2", "1");
      sessionStorage.removeItem("kidzz_just_completed_onboarding");
    } catch {}
  }, []);

  useEffect(() => {
    if (!profile?.age_range || typeof window === "undefined") return;
    setSelectedAgeRange(profile.age_range);
    window.localStorage.setItem(AGE_STORAGE_KEY, profile.age_range);
  }, [profile?.age_range]);

  const switchTab = useCallback((tab: string) => {
    if (!KNOWN_TABS.includes(tab)) return;
    markIntroSettled();
    setActiveTab(tab);
    setShowLab(false);
    setShowTravel(false);
    setShowChallenge(false);
    setShowReferral(false);
    setShowRetrospective(false);
    if (tab === "chat") setStep("home");
  }, []);

  const handleTabChange = switchTab;

  const backToHome = useCallback(() => {
    switchTab("chat");
    setStep("home");
  }, [switchTab]);

  // Pré-carrega TODAS as abas imediatamente, em paralelo, para que o clique
  // no dock troque a tela instantaneamente.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loaders = [loadStoryFactory, loadRoutineScreen, loadMusicForest, loadFamilyCinema, loadMomentsPlaylists, loadDreamWorld, loadKidzzPlay, loadWellnessHub];
    loaders.forEach((l) => { void l().catch(() => undefined); });
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
    const openKalm = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const expId = (detail.experienceId as string) || null;
      setKalmInitialExperience(expId);
      switchTab("wellness");
    };
    window.addEventListener("kidzz:open-kalm", openKalm);
    return () => {
      window.removeEventListener("kidzz:open-plans", openPlans);
      window.removeEventListener("kidzz:open-journey", openJourney);
      window.removeEventListener("kidzz:open-kalm", openKalm);
    };
  }, [switchTab]);

  // Soft reminder: na 2ª pergunta (última grátis), mostra paywall contextual leve
  useEffect(() => {
    if (profile?.is_premium) return;
    const used = profile?.questions_used ?? 0;
    if (used > 0 && used === 2) {
      const key = "kidzz_warned_last_free";
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        setTimeout(() => {
          setContextualPaywall({ open: true, context: "question_limit", meta: { count: used } });
        }, 1500);
      }
    }
  }, [profile?.questions_used, profile?.is_premium]);

  // Derivação segura: funciona mesmo durante o onboarding (profile parcial)
  const childName = profile?.child_name ?? "";

  const handleQuestionSubmit = useCallback((q: string) => {
    if (!canAskQuestion()) {
      setContextualPaywall({ open: true, context: "question_limit", meta: { count: profile?.questions_used ?? 0 } });
      return;
    }
    setQuestion(q);
    setStep("generating");
  }, [canAskQuestion, profile?.questions_used]);

  const handleAnswerReady = useCallback((text: string) => {
    setAnswer(text);
    setStep("celebrating");
    evolution.evolve("question");
    kidzzMemory.recordQuestion(question);
    const { newlyMarked } = completeMissionStep("question");
    if (newlyMarked) {
      const { gained } = addXp("question");
      showXpGained(gained, "pergunta");
    }
    bumpSessionActions();
    addMemory({
      type: "question",
      title: question,
      content: text.slice(0, 500),
      is_special: false,
      image_url: null,
      metadata: {},
    });
  }, [question, evolution, addMemory]);

  const handleCelebrationDone = useCallback(() => {
    setStep("answer");
    if (!notifPromptDismissed) {
      setTimeout(() => setShowNotifPrompt(true), 800);
    }
  }, [notifPromptDismissed]);

  const handleNewQuestion = useCallback(() => {
    setQuestion(""); setAnswer(""); setStep("home"); switchTab("chat");
  }, [switchTab]);

  // Cada aba é renderizada uma vez (lazy, sob demanda) e mantida montada.
  // ESTE useMemo PRECISA ficar antes dos returns condicionais (regra de hooks).
  const TAB_RENDERERS: Record<string, () => JSX.Element> = useMemo(() => ({
    chat: () => (
      <ChatFlow
        step={step} question={question} answer={answer}
        childName={childName} profile={profile} evolution={evolution}
        activeTab={activeTab}
        onSubmit={handleQuestionSubmit}
        onAnswerReady={handleAnswerReady}
        onCelebrationDone={handleCelebrationDone}
        onNewQuestion={handleNewQuestion}
        onSaveMemory={() => addMemory({ type: "question", title: question, content: answer.slice(0, 500), is_special: true, image_url: null, metadata: { saved_from: "celebration" } })}
        onTabChange={handleTabChange}
        onSwitchTab={switchTab}
        onOpenLab={() => setShowLab(true)}
        onOpenTravel={() => { if (!profile?.is_premium) { setContextualPaywall({ open: true, context: "travel" }); return; } setShowTravel(true); }}
        onOpenChallenge={() => setShowChallenge(true)}
        onOpenReferral={() => setShowReferral(true)}
        onOpenPaywall={(context, meta) => setContextualPaywall({ open: true, context: context as any, meta })}
        onLogin={() => navigate("/auth")}
        onBackFromPaywall={() => { setStep("home"); switchTab("chat"); }}
        onGeneratingError={() => setStep("home")}
      />
    ),
    explore: () => <AreaGate area="historias" fullOnSample><StoryFactory onBack={() => { backToHome(); evolution.evolve("story"); }} /></AreaGate>,
    routine: () => <AreaGate area="rotina"><RoutineScreen /></AreaGate>,
    play: () => (
      <AreaGate area="brincar">
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
      </AreaGate>
    ),
    memories: () => <AreaGate area="memorias"><MemoriesAlbum onBack={backToHome} onNavigateToChat={backToHome} onNavigateToStories={() => switchTab("explore")} /></AreaGate>,
    moments: () => <AreaGate area="momentos"><MomentsPlaylists onBack={() => { backToHome(); evolution.evolve("moment"); }} /></AreaGate>,
    cinema: () => <AreaGate area="cinema"><FamilyCinema onBack={backToHome} /></AreaGate>,
    wellness: () => <AreaGate area="kalm"><WellnessHub onBack={backToHome} initialExperienceId={kalmInitialExperience} onConsumedInitial={() => setKalmInitialExperience(null)} /></AreaGate>,
    achievements: () => <Suspense fallback={null}><SevenDayChallenge onClose={backToHome} /></Suspense>,
    dreams: () => <AreaGate area="sonhos"><DreamWorld onBack={() => { backToHome(); evolution.evolve("story"); }} /></AreaGate>,
    music: () => (
      <AreaGate area="musica">
        <MusicForest
          onBack={backToHome}
          onNavigateToDreams={() => switchTab("dreams")}
          onXpEarned={() => evolution.evolve("game")}
        />
      </AreaGate>
    ),
  }), [step, question, answer, childName, profile, evolution, activeTab, handleQuestionSubmit, handleAnswerReady, handleCelebrationDone, handleNewQuestion, handleTabChange, switchTab, backToHome, kalmInitialExperience, addMemory, navigate]);

  // ============================================================
  // A PARTIR DAQUI: returns condicionais (gates de onboarding).
  // Nenhum hook pode ser declarado abaixo desta linha.
  // ============================================================
  if (loading) return null;

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
  const hasSession = !!user;
  if (!hasSession && !accountStepDone) {
    return (
      <AccountSetup
        key="account-unico"
        childName={profile.child_name}
        onDone={() => {
          try { window.localStorage.setItem("kidzz_account_step_done", "1"); } catch {}
          setAccountStepDone(true);
        }}
      />
    );
  }
  // Onboarding completo → entra direto na home, sem telas extras.

  return (
    <div className="min-h-[100dvh] flex flex-col overflow-hidden max-w-[100vw]" style={{ height: "auto", overflowX: "hidden" }}>
      {/* MagicalBackground vive no AppShell — persistente, nunca remontado */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col min-h-0">
            <TabErrorBoundary resetKey={activeTab} label={activeTab} onBack={backToHome}>
              {KNOWN_TABS.map((tab) => {
                const TAB_DATA: Record<string, string> = {
                  chat: "perguntas",
                  wellness: "kalm",
                  dreams: "sonhos",
                  explore: "historias",
                  play: "brincar",
                  routine: "rotina",
                  moments: "momentos",
                  cinema: "cinema",
                  music: "musica",
                  memories: "memorias",
                  achievements: "memorias",
                };
                return (
                  <div
                    key={tab}
                    data-tab={TAB_DATA[tab] ?? "kalm"}
                    style={{
                      display: activeTab === tab ? "flex" : "none",
                      flexDirection: "column",
                      flex: 1,
                      minHeight: 0,
                      position: "absolute",
                      inset: 0,
                    }}
                  >
                    {mountedTabs.has(tab) && (
                      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="w-12 h-12 rounded-2xl animate-pulse" style={{background:"hsl(145 26% 85%)"}} /><div className="h-2 w-24 rounded-full animate-pulse" style={{background:"hsl(145 26% 85%)"}} /><div className="h-2 w-16 rounded-full animate-pulse" style={{background:"hsl(145 26% 90%)"}} /></div></div>}>
                        {TAB_RENDERERS[tab]?.()}
                      </Suspense>
                    )}
                  </div>
                );
              })}
            </TabErrorBoundary>
          </div>
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
