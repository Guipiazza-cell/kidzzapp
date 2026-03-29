import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AgeSelection from "@/components/AgeSelection";
import ChatScreen from "@/components/ChatScreen";
import StoryFactory from "@/components/story/StoryFactory";
import LandingScreen from "@/components/LandingScreen";
import jungleBg from "@/assets/jungle-bg.jpg";
import { motion } from "framer-motion";

const Index = () => {
  const { profile, loading } = useAuth();
  const [showStoryFactory, setShowStoryFactory] = useState(false);
  const [enteredApp, setEnteredApp] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-bounce">🦎</div>
          <p className="text-muted-foreground font-bold animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  // Story Factory (Super Premium)
  if (showStoryFactory) {
    return <StoryFactory onBack={() => setShowStoryFactory(false)} />;
  }

  // If user hasn't entered app yet and has no profile data, show landing
  const hasCompletedOnboarding = profile?.child_name && profile?.age_range;
  const shouldShowLanding = !enteredApp && !hasCompletedOnboarding;

  if (shouldShowLanding) {
    return (
      <div className="min-h-screen flex flex-col overflow-hidden relative">
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
        <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="fixed rounded-full bg-kid-yellow/50"
            style={{ width: 4, height: 4, left: `${10 + i * 14}%`, top: `${15 + (i % 3) * 22}%` }}
            animate={{ y: [0, -25, 10, 0], opacity: [0.2, 0.7, 0.3, 0.2] }}
            transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
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

  // Age selection (if not set yet, ask after entering)
  if (!profile?.age_range) {
    return <AgeSelection />;
  }

  // Chat
  return (
    <ChatScreen
      onOpenStoryFactory={() => setShowStoryFactory(true)}
      initialQuestion={initialQuestion}
      onInitialQuestionConsumed={() => setInitialQuestion(null)}
    />
  );
};

export default Index;
