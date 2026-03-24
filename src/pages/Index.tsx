import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NameOnboarding from "@/components/NameOnboarding";
import AgeSelection from "@/components/AgeSelection";
import ChatScreen from "@/components/ChatScreen";
import StoryFactory from "@/components/story/StoryFactory";

const Index = () => {
  const { profile, loading } = useAuth();
  const [showStoryFactory, setShowStoryFactory] = useState(false);

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

  // Step 1: Child's name
  if (!profile?.child_name) {
    return <NameOnboarding />;
  }

  // Step 2: Age selection
  if (!profile?.age_range) {
    return <AgeSelection />;
  }

  // Story Factory (Super Premium)
  if (showStoryFactory) {
    return <StoryFactory onBack={() => setShowStoryFactory(false)} />;
  }

  // Step 3: Chat
  return <ChatScreen onOpenStoryFactory={() => setShowStoryFactory(true)} />;
};

export default Index;
