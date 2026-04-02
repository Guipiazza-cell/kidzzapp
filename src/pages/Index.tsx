import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AgeSelection from "@/components/AgeSelection";
import ChatScreen from "@/components/ChatScreen";
import StoryFactory from "@/components/story/StoryFactory";
import LandingScreen from "@/components/LandingScreen";
import ChameleonMascot from "@/components/ChameleonMascot";
import { motion } from "framer-motion";

const Index = () => {
  const { profile, loading } = useAuth();
  const [showStoryFactory, setShowStoryFactory] = useState(false);
  const [enteredApp, setEnteredApp] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState<string | null>(null);

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

  const hasCompletedOnboarding = profile?.child_name && profile?.age_range;
  const shouldShowLanding = !enteredApp && !hasCompletedOnboarding;

  if (shouldShowLanding) {
    return (
      <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[hsl(220,25%,8%)] via-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)]">
        <div className="relative z-10 flex-1 flex flex-col">
          <LandingScreen
            onStart={() => setEnteredApp(true)}
            onQuestionClick={(q) => {
              setInitialQuestion(q);
              setEnteredApp(true);
            }}
          />
        </div>
      </div>
    );
  }

  if (!profile?.age_range) {
    return <AgeSelection />;
  }

  return (
    <ChatScreen
      onOpenStoryFactory={() => setShowStoryFactory(true)}
      initialQuestion={initialQuestion}
      onInitialQuestionConsumed={() => setInitialQuestion(null)}
    />
  );
};

export default Index;
