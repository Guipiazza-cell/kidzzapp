// Wrapper legado - toda lógica/visual vive em PaywallScreen.
import PaywallScreen from "@/components/paywall/PaywallScreen";

interface ConversionScreenProps {
  childName: string;
  onSubscribe?: (plan: any) => void;
  loading?: boolean;
}

const ConversionScreen = ({ childName }: ConversionScreenProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden">
      <PaywallScreen childName={childName} />
    </div>
  );
};

export default ConversionScreen;
