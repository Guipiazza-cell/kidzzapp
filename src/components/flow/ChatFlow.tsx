// AnimatePresence removido propositalmente: causava flash branco entre home → generating → answer.
import HomeScreen from "@/components/flow/HomeScreen";
import GeneratingScreen from "@/components/flow/GeneratingScreen";
import CelebrationScreen from "@/components/flow/CelebrationScreen";
import AnswerScreen from "@/components/flow/AnswerScreen";
import Paywall from "@/components/Paywall";

interface ChatFlowProps {
  step: "home" | "age" | "generating" | "answer" | "celebrating" | "paywall";
  question: string;
  answer: string;
  childName: string;
  profile: any;
  evolution: any;
  activeTab: string;
  onSubmit: (q: string) => void;
  onAnswerReady: (text: string) => void;
  onCelebrationDone: () => void;
  onNewQuestion: () => void;
  onSaveMemory: () => void;
  onTabChange: (tab: string) => void;
  onSwitchTab: (tab: string) => void;
  onOpenLab: () => void;
  onOpenTravel: () => void;
  onOpenChallenge: () => void;
  onOpenReferral: () => void;
  onOpenPaywall: (context: string, meta?: any) => void;
  onLogin: () => void;
  onBackFromPaywall: () => void;
  onGeneratingError: () => void;
}

const ChatFlow = ({
  step,
  question,
  answer,
  childName,
  profile,
  evolution,
  activeTab,
  onSubmit,
  onAnswerReady,
  onCelebrationDone,
  onNewQuestion,
  onSaveMemory,
  onTabChange,
  onSwitchTab,
  onOpenLab,
  onOpenTravel,
  onOpenChallenge,
  onOpenReferral,
  onOpenPaywall,
  onLogin,
  onBackFromPaywall,
  onGeneratingError,
}: ChatFlowProps) => (
  <>
    {step === "home" && (
      <HomeScreen
        key="home"
        onSubmit={onSubmit}
        onOpenStoryFactory={() => onSwitchTab("explore")}
        onOpenMoments={() => onSwitchTab("moments")}
        onOpenAchievements={() => onSwitchTab("achievements")}
        onOpenLab={onOpenLab}
        onOpenPlay={() => onSwitchTab("play")}
        onOpenTravel={onOpenTravel}
        onOpenChallenge={onOpenChallenge}
        onOpenReferral={onOpenReferral}
        activeTab={activeTab}
        onTabChange={onTabChange}
        hideBottomNav
        characterEvolution={evolution as any}
      />
    )}
    {step === "generating" && (
      <GeneratingScreen
        key="generating"
        question={question}
        ageRange={profile.age_range || "3-7"}
        childName={childName}
        onComplete={onAnswerReady}
        onError={onGeneratingError}
        onLimitReached={() => onOpenPaywall("question_limit", { count: profile.questions_used ?? 0 })}
      />
    )}
    {step === "celebrating" && (
      <CelebrationScreen
        key="celebrating"
        childName={childName}
        pointsEarned={1}
        streakDays={profile.streak_days ?? 0}
        interests={(profile as any)?.child_interests as string[] | undefined}
        onContinue={onCelebrationDone}
        onSave={onSaveMemory}
        type="answer"
      />
    )}
    {step === "answer" && (
      <AnswerScreen
        key="answer"
        question={question}
        answer={answer}
        onNewQuestion={onNewQuestion}
        onOpenStoryFactory={() => onSwitchTab("explore")}
      />
    )}
    {step === "paywall" && <Paywall key="paywall" onLogin={onLogin} onBack={onBackFromPaywall} />}
  </>
);

export default ChatFlow;
