import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import HomeScreen from "@/components/flow/HomeScreen";
import AgePickerScreen from "@/components/flow/AgePickerScreen";
import GeneratingScreen from "@/components/flow/GeneratingScreen";
import AnswerScreen from "@/components/flow/AnswerScreen";
import StoryFactory from "@/components/story/StoryFactory";
import ChameleonMascot from "@/components/ChameleonMascot";
import { motion } from "framer-motion";

type FlowStep = "home" | "age" | "generating" | "answer";

const Index = () => {
  const { profile, loading, updateProfile } = useAuth();
  const [step, setStep] = useState<FlowStep>("home");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showStoryFactory, setShowStoryFactory] = useState(false);

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
    setQuestion(q);
    // If user already has age_range, skip age picker
    if (profile?.age_range) {
      setStep("generating");
    } else {
      setStep("age");
    }
  };

  const handleAgeSelected = async (range: string) => {
    await updateProfile({ age_range: range, child_name: profile?.child_name || "Explorador" });
    setStep("generating");
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
            ageRange={profile?.age_range || "3-7"}
            onComplete={handleAnswerReady}
            onError={() => setStep("home")}
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
      </AnimatePresence>
    </div>
  );
};

export default Index;
