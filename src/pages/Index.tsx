import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacterEvolution } from "@/hooks/useCharacterEvolution";
import { useMemories } from "@/hooks/useMemories";
import NameOnboarding from "@/components/NameOnboarding";
import AgeSelection from "@/components/AgeSelection";
import InterestsOnboarding from "@/components/InterestsOnboarding";
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
import Paywall from "@/components/Paywall";
import ParentalGate from "@/components/ParentalGate";
import ParentalSettings from "@/components/ParentalSettings";
import ChameleonMascot from "@/components/ChameleonMascot";
import MagicalBackground from "@/components/MagicalBackground";
import BottomNav from "@/components/flow/BottomNav";

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
  const [selectedAgeRange, setSelectedAgeRange] = useState<string | null>(getCachedAgeRange());
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [showParentalGateForSettings, setShowParentalGateForSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!profile?.age_range || typeof window === "undefined") return;
    setSelectedAgeRange(profile.age_range);
    window.localStorage.setItem(AGE_STORAGE_KEY, profile.age_range);
  }, [profile?.age_range]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
        <div className="text-center space-y-3">
          <ChameleonMascot size="md" mood="thinking" interactive={false} />
          <motion.p className="text-primary-foreground/40 font-bold text-sm" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
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

  const childName = profile.child_name;

  const handleQuestionSubmit = (q: string) => {
    if (!canAskQuestion()) { setStep("paywall"); return; }
    setQuestion(q);
    setStep("generating");
  };

  const handleAnswerReady = (text: string) => {
    setAnswer(text);
    setStep("celebrating");
    evolution.evolve("question");
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
  };

  const handleNewQuestion = () => {
    setQuestion(""); setAnswer(""); setStep("home"); setActiveTab("chat");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "chat") setStep("home");
  };

  const renderContent = () => {
    if (activeTab === "explore") {
      return <StoryFactory key="stories" onBack={() => { setActiveTab("chat"); setStep("home"); evolution.evolve("story"); }} />;
    }
    if (activeTab === "memories") {
      return <MemoriesAlbum key="memories" onBack={() => { setActiveTab("chat"); setStep("home"); }} />;
    }
    if (activeTab === "moments") {
      return <MomentsFactory key="moments" onBack={() => { setActiveTab("chat"); setStep("home"); evolution.evolve("moment"); }} />;
    }
    if (activeTab === "achievements") {
      return <AchievementsScreen key="achievements" onBack={() => { setActiveTab("chat"); setStep("home"); }} />;
    }
    if (activeTab === "dreams") {
      return <DreamWorld key="dreams" onBack={() => { setActiveTab("chat"); setStep("home"); evolution.evolve("story"); }} />;
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
              if (!profile?.is_premium) { setStep("paywall"); return; }
              setShowTravel(true);
            }}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            hideBottomNav
            characterEvolution={evolution as any}
          />
        )}
        {step === "generating" && <GeneratingScreen key="generating" question={question} ageRange={profile.age_range || "3-7"} onComplete={handleAnswerReady} onError={() => setStep("home")} onLimitReached={() => setStep("paywall")} />}
        {step === "celebrating" && (
          <CelebrationScreen
            key="celebrating"
            childName={childName}
            pointsEarned={1}
            streakDays={profile.streak_days ?? 0}
            interests={(profile as any)?.child_interests as string[] | undefined}
            onContinue={handleCelebrationDone}
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
    </div>
  );
};

export default Index;
