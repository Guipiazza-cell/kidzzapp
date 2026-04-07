import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import HomeScreen from "@/components/flow/HomeScreen";
import AgePickerScreen from "@/components/flow/AgePickerScreen";
import GeneratingScreen from "@/components/flow/GeneratingScreen";
import AnswerScreen from "@/components/flow/AnswerScreen";
import StoryFactory from "@/components/story/StoryFactory";
import Paywall from "@/components/Paywall";
import ParentalGate from "@/components/ParentalGate";
import ParentalSettings from "@/components/ParentalSettings";
import ChameleonMascot from "@/components/ChameleonMascot";

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
  const [showStoryFactory, setShowStoryFactory] = useState(false);
  const [selectedAgeRange, setSelectedAgeRange] = useState<string | null>(getCachedAgeRange());
  const [showLoginGate, setShowLoginGate] = useState(false);

  useEffect(() => {
    if (!profile?.age_range || typeof window === "undefined") return;
    setSelectedAgeRange(profile.age_range);
    window.localStorage.setItem(AGE_STORAGE_KEY, profile.age_range);
  }, [profile?.age_range]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(220,25%,8%)] via-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)]">
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

  if (showStoryFactory) {
    return <StoryFactory onBack={() => setShowStoryFactory(false)} />;
  }

  const handleQuestionSubmit = (q: string) => {
    // Check limit BEFORE proceeding
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
  };

  const handleLoginFromPaywall = () => {
    setShowLoginGate(true);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[hsl(220,25%,8%)] via-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)]">
      <AnimatePresence mode="wait">
        {step === "home" && (
          <HomeScreen
            key="home"
            onSubmit={handleQuestionSubmit}
            onOpenStoryFactory={() => setShowStoryFactory(true)}
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
            onOpenStoryFactory={() => setShowStoryFactory(true)}
          />
        )}
        {step === "paywall" && (
          <Paywall key="paywall" onLogin={handleLoginFromPaywall} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginGate && (
          <ParentalGate
            onSuccess={() => {
              setShowLoginGate(false);
              // After login, show settings for account creation
            }}
            onCancel={() => setShowLoginGate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
