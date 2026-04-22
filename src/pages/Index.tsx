import { useState, useEffect, useCallback } from "react";
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
import AchievementsScreen from "@/components/flow/AchievementsScreen";
import MemoriesAlbum from "@/components/memories/MemoriesAlbum";
import DreamWorld from "@/components/dreams/DreamWorld";
import StoryFactory from "@/components/story/StoryFactory";
import KidzzLab from "@/components/lab/KidzzLab";
import KidzzPlay from "@/components/play/KidzzPlay";
import MomentsFactory from "@/components/moments/MomentsFactory";
import TravelMode from "@/components/travel/TravelMode";
import MusicForest from "@/components/music/MusicForest";
import Paywall from "@/components/Paywall";
import ParentalGate from "@/components/ParentalGate";
import ParentalSettings from "@/components/ParentalSettings";
import SevenDayChallenge from "@/components/viral/SevenDayChallenge";
import ReferralProgram from "@/components/viral/ReferralProgram";
import MonthlyRetrospective from "@/components/viral/MonthlyRetrospective";
import ChameleonMascot from "@/components/ChameleonMascot";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import { kidzzMemory } from "@/components/kidzz/kidzzMemory";
import MagicalBackground from "@/components/MagicalBackground";
import BottomNav from "@/components/flow/BottomNav";
import XpToast from "@/components/flow/XpToast";
import ConversionNudgeCard from "@/components/viral/ConversionNudgeCard";
import { completeMissionStep, addXp, bumpSessionActions, shouldShowConversionCard, markConversionCardShown } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";

type FlowStep = "home" | "age" | "generating" | "answer" | "celebrating" | "paywall";
const AGE_STORAGE_KEY = "kidzz_last_age_range";
const getCachedAgeRange = () => typeof window !== "undefined" ? window.localStorage.getItem(AGE_STORAGE_KEY) : null;

const Index = () => {
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
  const [showSettings, setShowSettings] = useState(false);
  const [notifPromptDismissed, setNotifPromptDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return !!window.localStorage.getItem("kidzz_notification_set");
  });
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const [contextualPaywall, setContextualPaywall] = useState<{ open: boolean; context: PaywallContext; meta?: Record<string, string | number> }>({ open: false, context: "question_limit" });
  const [showConversionNudge, setShowConversionNudge] = useState(false);

  useEffect(() => {
    if (!profile?.age_range || typeof window === "undefined") return;
    setSelectedAgeRange(profile.age_range);
    window.localStorage.setItem(AGE_STORAGE_KEY, profile.age_range);
  }, [profile?.age_range]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
        <div className="text-center space-y-3 flex flex-col items-center">
          <KidzzChameleon size="md" mood="thinking" state="cosmic" interactive={false} />
          <motion.p className="text-gray-700 font-bold text-sm" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
            Carregando...
          </motion.p>
        </div>
      </div>
    );
  }

  // Onboarding gates: name → age → interests
  if (!profile?.child_name) {
    return <NameOnboarding />;
  }
  if (!profile?.age_range) {
    return <AgeSelection />;
  }
  const interests = (profile as any)?.child_interests as string[] | undefined;
  if (!interests || interests.length === 0) {
    return <InterestsOnboarding />;
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
    setQuestion(""); setAnswer(""); setStep("home"); setActiveTab("chat");
  };

  const handleTabChange = (tab: string) => {
    // Close all overlays when switching tabs
    setShowLab(false);
    setShowPlay(false);
    setShowTravel(false);
    setShowChallenge(false);
    setShowReferral(false);
    setShowRetrospective(false);
    setActiveTab(tab);
    if (tab === "chat") setStep("home");
  };

  const renderContent = () => {
    if (activeTab === "explore") {
      return <StoryFactory key="stories" onBack={() => { setActiveTab("chat"); setStep("home"); evolution.evolve("story"); }} />;
    }
    if (activeTab === "memories") {
      return <MemoriesAlbum key="memories" onBack={() => { setActiveTab("chat"); setStep("home"); }} onNavigateToChat={() => { setActiveTab("chat"); setStep("home"); }} onNavigateToStories={() => setActiveTab("explore")} />;
    }
    if (activeTab === "moments") {
      return <MomentsFactory key="moments" onBack={() => { setActiveTab("chat"); setStep("home"); evolution.evolve("moment"); }} />;
    }
    if (activeTab === "achievements") {
      // Redireciona para Memórias > Conquistas (subaba)
      setActiveTab("memories");
      return null;
    }
    if (activeTab === "dreams") {
      return <DreamWorld key="dreams" onBack={() => { setActiveTab("chat"); setStep("home"); evolution.evolve("story"); }} />;
    }
    if (activeTab === "music") {
      return (
        <MusicForest
          key="music"
          onBack={() => { setActiveTab("chat"); setStep("home"); }}
          onNavigateToDreams={() => setActiveTab("dreams")}
          onXpEarned={() => evolution.evolve("game")}
        />
      );
    }

    return (
      <AnimatePresence mode="wait">
        {step === "home" && (
          <HomeScreen
            key="home"
            onSubmit={handleQuestionSubmit}
            onOpenStoryFactory={() => setActiveTab("explore")}
            onOpenMoments={() => setActiveTab("moments")}
            onOpenAchievements={() => setActiveTab("achievements")}
            onOpenLab={() => setShowLab(true)}
            onOpenPlay={() => setShowPlay(true)}
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
        {step === "answer" && <AnswerScreen key="answer" question={question} answer={answer} onNewQuestion={handleNewQuestion} onOpenStoryFactory={() => setActiveTab("explore")} />}
        {step === "paywall" && <Paywall key="paywall" onLogin={() => setShowLoginGate(true)} />}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />
      <div className="flex-1 flex flex-col pb-[72px]">{renderContent()}</div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <AnimatePresence>
        {showTravel && <TravelMode onBack={() => setShowTravel(false)} />}
        {showLab && <KidzzLab onBack={() => setShowLab(false)} evolution={evolution} />}
        {showPlay && <KidzzPlay onBack={() => setShowPlay(false)} onGameComplete={() => evolution.evolve("game")} />}
        {showChallenge && <SevenDayChallenge onClose={() => setShowChallenge(false)} />}
        {showReferral && <ReferralProgram onBack={() => setShowReferral(false)} />}
        {showRetrospective && <MonthlyRetrospective onClose={() => setShowRetrospective(false)} />}
        {showLoginGate && <ParentalGate onSuccess={() => setShowLoginGate(false)} onCancel={() => setShowLoginGate(false)} />}
        {showParentalGateForSettings && (
          <ParentalGate onSuccess={() => { setShowParentalGateForSettings(false); setShowSettings(true); }} onCancel={() => setShowParentalGateForSettings(false)} />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
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
        onLogin={() => { setContextualPaywall((p) => ({ ...p, open: false })); setShowLoginGate(true); }}
      />
    </div>
  );
};

export default Index;
