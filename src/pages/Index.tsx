import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import HomeScreen from "@/components/flow/HomeScreen";
import AgePickerScreen from "@/components/flow/AgePickerScreen";
import GeneratingScreen from "@/components/flow/GeneratingScreen";
import AnswerScreen from "@/components/flow/AnswerScreen";
import AchievementsScreen from "@/components/flow/AchievementsScreen";
import DreamWorld from "@/components/dreams/DreamWorld";
import StoryFactory from "@/components/story/StoryFactory";
import KidzzLab from "@/components/lab/KidzzLab";
import MomentsFactory from "@/components/moments/MomentsFactory";
import Paywall from "@/components/Paywall";
import ParentalGate from "@/components/ParentalGate";
import ParentalSettings from "@/components/ParentalSettings";
import ChameleonMascot from "@/components/ChameleonMascot";
import MagicalBackground from "@/components/MagicalBackground";
import BottomNav from "@/components/flow/BottomNav";

type FlowStep = "home" | "age" | "generating" | "answer" | "paywall";

const AGE_STORAGE_KEY = "kidzz_last_age_range";

const getCachedAgeRange = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AGE_STORAGE_KEY);
};

const Index = () => {
  const { profile, loading, updateProfile, canAskQuestion } = useAuth();
  const [step, setStep] = useState<FlowStep>("home");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [showLab, setShowLab] = useState(false);
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
          <motion.p
            className="text-primary-foreground/40 font-bold text-sm"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Carregando...
          </motion.p>
        </div>
      </div>
    );
  }

  const handleQuestionSubmit = (q: string) => {
    if (!canAskQuestion()) {
      setStep("paywall");
      return;
    }

    const resolvedAgeRange = profile?.age_range || selectedAgeRange || getCachedAgeRange();
    setQuestion(q);

    if (resolvedAgeRange) {
      setSelectedAgeRange(resolvedAgeRange);
      if (!profile?.age_range) {
        void updateProfile({
          age_range: resolvedAgeRange,
          child_name: profile?.child_name || "Explorador",
        });
      }
      setStep("generating");
      return;
    }

    setStep("age");
  };

  const handleAgeSelected = (range: string) => {
    setSelectedAgeRange(range);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AGE_STORAGE_KEY, range);
    }
    setStep("generating");
    void updateProfile({
      age_range: range,
      child_name: profile?.child_name || "Explorador",
    });
  };

  const handleAnswerReady = (text: string) => {
    setAnswer(text);
    setStep("answer");
  };

  const handleNewQuestion = () => {
    setQuestion("");
    setAnswer("");
    setStep("home");
    setActiveTab("chat");
  };

  const handleLoginFromPaywall = () => {
    setShowLoginGate(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "chat") {
      setStep("home");
    }
  };

  const renderContent = () => {
    if (activeTab === "explore") {
      return <StoryFactory key="stories" onBack={() => { setActiveTab("chat"); setStep("home"); }} />;
    }
    if (activeTab === "moments") {
      return <MomentsFactory key="moments" onBack={() => { setActiveTab("chat"); setStep("home"); }} />;
    }
    if (activeTab === "achievements") {
      return <AchievementsScreen key="achievements" onBack={() => { setActiveTab("chat"); setStep("home"); }} />;
    }
    if (activeTab === "dreams") {
      return <DreamWorld key="dreams" onBack={() => { setActiveTab("chat"); setStep("home"); }} />;
    }

    // Main chat flow
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
            activeTab={activeTab}
            onTabChange={handleTabChange}
            hideBottomNav
          />
        )}
        {step === "age" && (
          <AgePickerScreen
            key="age"
            question={question}
            onSelect={handleAgeSelected}
            onBack={() => setStep("home")}
          />
        )}
        {step === "generating" && (
          <GeneratingScreen
            key="generating"
            question={question}
            ageRange={selectedAgeRange || profile?.age_range || "3-7"}
            onComplete={handleAnswerReady}
            onError={() => setStep("home")}
            onLimitReached={() => setStep("paywall")}
          />
        )}
        {step === "answer" && (
          <AnswerScreen
            key="answer"
            question={question}
            answer={answer}
            onNewQuestion={handleNewQuestion}
            onOpenStoryFactory={() => setActiveTab("explore")}
          />
        )}
        {step === "paywall" && (
          <Paywall key="paywall" onLogin={handleLoginFromPaywall} />
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />
      
      <div className="flex-1 flex flex-col pb-[72px]">
        {renderContent()}
      </div>

      {/* Persistent bottom nav across ALL tabs */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <AnimatePresence>
        {showLab && <KidzzLab onBack={() => setShowLab(false)} />}
        {showLoginGate && (
          <ParentalGate
            onSuccess={() => setShowLoginGate(false)}
            onCancel={() => setShowLoginGate(false)}
          />
        )}
        {showParentalGateForSettings && (
          <ParentalGate
            onSuccess={() => {
              setShowParentalGateForSettings(false);
              setShowSettings(true);
            }}
            onCancel={() => setShowParentalGateForSettings(false)}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
