// Wrapper legado — toda lógica/visual vive em PaywallScreen.
// Mantido por compatibilidade com pontos de entrada antigos.
import PaywallScreen from "@/components/paywall/PaywallScreen";
import { useAuth } from "@/contexts/AuthContext";

interface PaywallProps {
  onLogin?: () => void;
  onBack?: () => void;
}

const Paywall = ({ onBack }: PaywallProps) => {
  const { profile } = useAuth();
  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden">
      <PaywallScreen childName={profile?.child_name || undefined} onClose={onBack} />
    </div>
  );
};

export default Paywall;
